// background.js

// Function to handle the API call and response
function shortenUrl(tab, apiKey) {
  const url = tab.url;

  // Provide user feedback that something is happening
  chrome.action.setBadgeText({ text: '...', tabId: tab.id });
  chrome.action.setBadgeBackgroundColor({ color: '#FFA500', tabId: tab.id });

  fetch('https://api.tinyurl.com/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({ url: url })
  })
  .then(response => response.json())
  .then(data => {
    if (data.data && data.data.tiny_url) {
      const shortenedUrl = data.data.tiny_url;

      // Use the scripting API to copy to clipboard
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (textToCopy) => {
          navigator.clipboard.writeText(textToCopy);
        },
        args: [shortenedUrl]
      });

      // Success feedback
      chrome.action.setBadgeText({ text: 'OK', tabId: tab.id });
      chrome.action.setBadgeBackgroundColor({ color: '#4CAF50', tabId: tab.id });
    } else {
      // Handle API errors
      chrome.action.setBadgeText({ text: 'ERR', tabId: tab.id });
      chrome.action.setBadgeBackgroundColor({ color: '#F44336', tabId: tab.id });
      console.error('TinyURL API Error:', data.errors || 'Unknown error');
    }
  })
  .catch(error => {
    // Handle network errors
    chrome.action.setBadgeText({ text: 'ERR', tabId: tab.id });
    chrome.action.setBadgeBackgroundColor({ color: '#F44336', tabId: tab.id });
    console.error('Fetch Error:', error);
  })
  .finally(() => {
    // Clear the badge after a few seconds
    setTimeout(() => {
      chrome.action.setBadgeText({ text: '', tabId: tab.id });
    }, 3000);
  });
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
