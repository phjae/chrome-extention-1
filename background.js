chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'insertPhrase',
    title: 'Insert Phrase',
    contexts: ['editable']
  }, () => {
    if (chrome.runtime.lastError) {
      console.error('Error creating context menu:', chrome.runtime.lastError);
    } else {
      console.log('Context menu created');
    }
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'insertPhrase') {
    chrome.storage.local.get(['selectedPhrase', 'phrases'], (result) => {
      const selectedPhraseId = result.selectedPhrase;
      const phrases = result.phrases || [];
      if (result.phrases && result.phrases.length > 0) {
        const phraseToInsert = phrases[selectedPhraseId || 0];
        if (tab && tab.id) {
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: insertPhrase,
            args: [phraseToInsert],
          }, (injectionResults) => {
            if (chrome.runtime.lastError) {
              console.error('Error executing script:', chrome.runtime.lastError);
            } else {
              console.log('Script executed successfully:', injectionResults);
            }
          });
        } else {
          console.error('No valid tab id found');
        }
      }
    });
  }
});

function insertPhrase(phrase) {
  const activeElement = document.activeElement;
  if (activeElement) {
    const event = new Event('input', { bubbles: true });
    if (activeElement.isContentEditable) {
      const selection = window.getSelection();
      const range = selection.getRangeAt(0);

      const lines = phrase.split('\n');
      lines.forEach((line, index) => {
        if (index > 0) {
          range.insertNode(document.createElement('br'));
        }
        range.insertNode(document.createTextNode(line));
        range.collapse(false);
      });

      selection.removeAllRanges();
      selection.addRange(range);
    } else if (activeElement.tagName === 'TEXTAREA' || (activeElement.tagName === 'INPUT' && activeElement.type === 'text')) {
      const startPos = activeElement.selectionStart;
      const endPos = activeElement.selectionEnd;
      activeElement.value = activeElement.value.substring(0, startPos) + phrase + activeElement.value.substring(endPos);
      activeElement.selectionStart = startPos + phrase.length;
      activeElement.selectionEnd = startPos + phrase.length;
      activeElement.dispatchEvent(event);
    }
  }
}
