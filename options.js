document.addEventListener('DOMContentLoaded', () => {
  const apiKeyInput = document.getElementById('api-key');
  const saveApiKeyButton = document.getElementById('save-api-key');
  const statusMessageElement = document.getElementById('status-message');

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
      statusMessageElement.textContent = 'API key saved.';
      // Clear the message after a few seconds
      setTimeout(() => {
        statusMessageElement.textContent = '';
      }, 3000);
    });
  });
});
