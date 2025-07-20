function notifyPopupTabsChanged() {
    chrome.runtime.sendMessage({ type: 'TABS_UPDATED' });
}

chrome.tabs.onCreated.addListener(notifyPopupTabsChanged);
chrome.tabs.onRemoved.addListener(notifyPopupTabsChanged);
chrome.tabs.onUpdated.addListener(notifyPopupTabsChanged);

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'GET_CATEGORIZED_TABS') {
        chrome.tabs.query({}, (tabs) => {
            const categories = { All: tabs };
            sendResponse({ categories });
        });
        return true;
    }
});