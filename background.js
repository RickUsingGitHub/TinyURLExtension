// background.js

function setBadge(tabId, text, color) {
  chrome.action.setBadgeText({ text, tabId });
  if (color) chrome.action.setBadgeBackgroundColor({ color, tabId });
}

// Shorten the tab's URL with the TinyURL API and copy the result to the clipboard.
// The badge shows "OK" only when the link really was copied.
async function shortenUrl(tab, apiKey) {
  setBadge(tab.id, '...', '#FFA500');
  try {
    const response = await fetch('https://api.tinyurl.com/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({ url: tab.url })
    });
    const data = await response.json().catch(() => ({}));
    const shortenedUrl = data.data && data.data.tiny_url;
    if (!response.ok || !shortenedUrl) {
      throw new Error('TinyURL API error: ' + JSON.stringify(data.errors || response.status));
    }

    // Copy inside the page. This throws on pages extensions can't touch (chrome://,
    // the Web Store), and writeText can be refused; either way we report ERR, not OK.
    const [injection] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: async (textToCopy) => {
        try {
          await navigator.clipboard.writeText(textToCopy);
          return true;
        } catch (e) {
          return false;
        }
      },
      args: [shortenedUrl]
    });
    if (!injection || injection.result !== true) throw new Error('Could not copy to the clipboard');

    setBadge(tab.id, 'OK', '#4CAF50');
  } catch (error) {
    setBadge(tab.id, 'ERR', '#F44336');
    console.error('TinyURL Shortener:', error);
  } finally {
    // Clear the badge after a few seconds
    setTimeout(() => setBadge(tab.id, ''), 3000);
  }
}

// Listen for a click on the extension's action icon
chrome.action.onClicked.addListener((tab) => {
  chrome.storage.local.get(['apiKey'], (result) => {
    const apiKey = result.apiKey;

    if (!apiKey) {
      // If no API key is found, open the options page
      chrome.runtime.openOptionsPage();
    } else {
      // If an API key exists, proceed to shorten the URL
      shortenUrl(tab, apiKey);
    }
  });
});
