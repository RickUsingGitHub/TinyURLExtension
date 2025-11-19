document.addEventListener('DOMContentLoaded', () => {
  const apiKeyInput = document.getElementById('api-key');
  const saveApiKeyButton = document.getElementById('save-api-key');
  const shortenUrlButton = document.getElementById('shorten-url');
  const shortenedUrlElement = document.getElementById('shortened-url');

  // Load the API key from storage
  chrome.storage.local.get(['apiKey'], (result) => {
    if (result.apiKey) {
      apiKeyInput.value = result.apiKey;
    }
  });

  // Save the API key to storage
  saveApiKeyButton.addEventListener('click', () => {
    const apiKey = apiKeyInput.value;
    chrome.storage.local.set({ apiKey }, () => {
      shortenedUrlElement.textContent = 'API key saved.';
    });
  });

  // Shorten the URL
  shortenUrlButton.addEventListener('click', () => {
    chrome.storage.local.get(['apiKey'], (result) => {
      const apiKey = result.apiKey;
      if (!apiKey) {
        shortenedUrlElement.textContent = 'Please save your API key first.';
        return;
      }

      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const url = tabs[0].url;
        fetch('https://api.tinyurl.com/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({ url })
        })
        .then(response => response.json())
        .then(data => {
          if (data.errors && data.errors.length > 0) {
            shortenedUrlElement.textContent = `Error: ${data.errors.join(', ')}`;
          } else if (data.data && data.data.tiny_url) {
            const shortenedUrl = data.data.tiny_url;
            shortenedUrlElement.textContent = shortenedUrl;
            navigator.clipboard.writeText(shortenedUrl);
          } else {
            shortenedUrlElement.textContent = 'Error: An unknown error occurred.';
          }
        })
        .catch(error => {
          shortenedUrlElement.textContent = 'Error: Request failed. Check console.';
          console.error(error);
        });
      });
    });
  });
});
