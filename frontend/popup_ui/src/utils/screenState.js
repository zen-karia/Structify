export function saveScreenState(state) {
  chrome.storage.local.set({ structifyScreenState: state });
}
export function getScreenState() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['structifyScreenState'], (result) => {
      resolve(result.structifyScreenState || { screen: 'home', apiKey: null });
    });
  });
}