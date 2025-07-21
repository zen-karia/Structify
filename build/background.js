function notifyPopupTabsChanged() {
    chrome.runtime.sendMessage({ type: 'TABS_UPDATED' });
}

chrome.tabs.onCreated.addListener(notifyPopupTabsChanged);
chrome.tabs.onRemoved.addListener(notifyPopupTabsChanged);
chrome.tabs.onUpdated.addListener(notifyPopupTabsChanged);

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'GET_CATEGORIZED_TABS') {
        const apiKey = message.apiKey;
        chrome.tabs.query({}, async (tabs) => {
            const categories = await categorizeTabsWithOpenAI(tabs, apiKey);
            sendResponse({ categories });
        });
        return true;
    }
});

async function categorizeTabsWithOpenAI(tabs, apiKey) {
    if (!tabs || tabs.length === 0) {
        return {};
    }
    const prompt = buildPrompt(tabs);
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 500,
                temperature: 0.2
            })
        });
        const data = await response.json();
        console.log('OpenAI API response:', data);
        const text = data.choices?.[0]?.message?.content?.trim() || '';
        try {
            let cleaned = text;
            if (cleaned.startsWith('```')) {
                cleaned = cleaned.replace(/^```[a-zA-Z]*\n?/, '');
                cleaned = cleaned.replace(/```$/, '');
            }
            const jsonStart = cleaned.indexOf('{');
            if (jsonStart !== -1) {
                const jsonString = cleaned.slice(jsonStart);
                const categoriesByIndex = JSON.parse(jsonString);
                const categorized = {};
                for (const [cat, indices] of Object.entries(categoriesByIndex)) {
                    categorized[cat] = indices.map(i => tabs[i]).filter(Boolean);
                }
                // If categorization is empty or all categories are empty, fallback
                if (Object.keys(categorized).length === 0 || Object.values(categorized).every(arr => arr.length === 0)) {
                    return { All: tabs };
                }
                return categorized;
            } else {
                // fallback: try line-based categories (not expected, but for robustness)
                const categories = cleaned.split('\n').map(line => line.trim()).filter(Boolean);
                const categorized = {};
                categories.forEach((cat, i) => {
                    if (!categorized[cat]) categorized[cat] = [];
                    categorized[cat].push(tabs[i]);
                });
                if (Object.keys(categorized).length === 0 || Object.values(categorized).every(arr => arr.length === 0)) {
                    return { All: tabs };
                }
                return categorized;
            }
        } catch (e) {
            console.error('OpenAI categorization failed:', e, 'Output was:', text);
            return { All: tabs };
        }
    } catch(e) {
        console.error('OpenAI categorization failed:', e);
        return { All: tabs };
    }
}

function buildPrompt(tabs) {
    const tablist = tabs.map((tab, i) => `${i + 1}. ${tab.title} (${tab.url})`).join('\n');
    return `
    You are a helpful assistant for a Chrome extension that organizes tabs in real time.

    You will receive a list of browser tabs, each with a title and URL. Your job is to return a list of modern, useful categories for the tabs in the input, grouping them by category and indexing them by their position in the list (starting from 0).

    Format of your response:  
    Return a JSON object, where each key is a category and the value is an array of indices representing which tabs fall into that category.

    Examples of valid categories include (but are not limited to):
    - Work  
    - Social Media  
    - Entertainment  
    - Research  
    - Learning  
    - Shopping  
    - News  
    - Coding  
    - AI Tools  
    - Communication  
    - Productivity  
    - Design  
    - Docs  
    - Random / Miscellaneous

    Guidelines:
    - Each line in the input represents one tab.
    - Indexing must start from 0 (i.e., the first tab is index 0).
    - Do NOT return any explanations—only the JSON object.
    - Do NOT wrap your response in triple backticks or any code block.
    - Only return the raw JSON object, nothing else.
    - If a tab has no useful context, categorize it as "Random / Miscellaneous".
    - Use the following mappings for known services:
    - Gmail, Outlook, Messenger, Slack, WhatsApp Web → "Communication"
    - YouTube, Netflix, Spotify, Disney+ → "Entertainment"
    - Google Docs, Notion, Office365 → "Docs" or "Productivity"
    - Amazon, eBay, Flipkart → "Shopping"
    - VS Code Web, Replit, Stack Overflow, GitHub → "Coding"

    Example Input:
    1. Inbox (12) - zenil@uwaterloo.ca - Gmail (https://mail.google.com/mail/u/0/#inbox)  
    2. Twitter / X - Home (https://twitter.com/)  
    3. Stack Overflow - Where Developers Learn & Share (https://stackoverflow.com/questions/xyz)  
    4. Watch Inception | Netflix (https://www.netflix.com/watch/abc123)

    Expected Output:
    {
    "Communication": [0],
    "Social Media": [1],
    "Coding": [2],
    "Entertainment": [3]
    }

    Now categorize these tabs and return a JSON object:
    ${tablist}
    `;
}