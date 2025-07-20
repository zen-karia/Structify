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
    const prompt = buildPrompt(tabs);
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4o',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 500,
                temperature: 0.2
            })
        });
        const data = await response.json();
        console.log('OpenAI API response:', data);
        const jsonStart = data.choices[0].message.content.indexOf('{');
        const jsonString = data.choices[0].message.content.slice(jsonStart);
        const categoriesByIndex = JSON.parse(jsonString);
        const categorized = {};
        for (const [cat, indices] of Object.entries(categoriesByIndex)) {
            categorized[cat] = indices.map(i => tabs[i]);
        }
        return categorized;
    } catch(e) {
        console.error('OpenAI categorization failed:', e);
        return { All: tabs };
    }
}

function buildPrompt(tabs) {
    const tablist = tabs.map((tab, i) => `${i + 1}. ${tab.title} (${tab.url})`).join('\n');
    return `
    You are a helpful assistant for a Chrome extension that organizes tabs in real time.

    You will receive a list of browser tabs, each with a title and URL. Your job is to return a list of modern, useful categories for each tab, in the same order.

    Examples of valid categories are BUT NOT LIMITED TO:
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
    - Each line represents one tab.
    - Return exactly one category for each line, in order.
    - Never explain your reasoning.
    - Don’t repeat the input.
    - Only respond with the list of categories, one per line.
    - If a tab has no useful context, label it as "Random / Miscellaneous".
    - Gmail, Outlook, Messenger, Slack, WhatsApp Web → "Communication"
    - YouTube, Netflix, Spotify, Disney+ → "Entertainment"
    - Google Docs, Notion, Office365 → "Docs" or "Productivity"
    - Amazon, eBay, Flipkart → "Shopping"
    - VS Code Web, Replit, Stack Overflow, GitHub → "Coding"

    Example Input:
    1. Inbox (12) - zenil@uwaterloo.ca - Gmail (https://mail.google.com/mail/u/0/#inbox)  
    2. Watch Inception | Netflix (https://www.netflix.com/watch/abc123)  
    3. Stack Overflow - Where Developers Learn & Share (https://stackoverflow.com/questions/xyz)  
    4. New Tab (chrome://newtab)

    Expected Output:
    Communication  
    Entertainment  
    Coding  
    Random / Miscellaneous

    Now categorize these tabs:
    ${tablist}
    `;
}