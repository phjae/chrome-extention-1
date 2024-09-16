document.addEventListener('DOMContentLoaded', function () {
  const saveButton = document.getElementById('save-phrase');
  const phraseInput = document.getElementById('phrase-input');
  const phrasesList = document.getElementById('phrases-list');

  const deleteIcon = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fill-rule="evenodd" clip-rule="evenodd" d="M12 13.4139L17.657 19.0709C17.8456 19.2531 18.0982 19.3539 18.3604 19.3516C18.6226 19.3493 18.8734 19.2441 19.0588 19.0587C19.2442 18.8733 19.3494 18.6225 19.3517 18.3603C19.354 18.0981 19.2532 17.8455 19.071 17.6569L13.414 11.9999L19.071 6.34291C19.2532 6.1543 19.354 5.9017 19.3517 5.6395C19.3494 5.37731 19.2442 5.1265 19.0588 4.94109C18.8734 4.75568 18.6226 4.65051 18.3604 4.64823C18.0982 4.64595 17.8456 4.74675 17.657 4.92891L12 10.5859L6.34301 4.92891C6.15356 4.75125 5.90242 4.65427 5.64274 4.65849C5.38305 4.6627 5.1352 4.76779 4.95162 4.9515C4.76803 5.13521 4.66313 5.38314 4.65909 5.64283C4.65506 5.90251 4.75222 6.15358 4.93001 6.34291L10.586 11.9999L4.92901 17.6569C4.8335 17.7492 4.75731 17.8595 4.70491 17.9815C4.6525 18.1035 4.62491 18.2347 4.62376 18.3675C4.6226 18.5003 4.6479 18.632 4.69818 18.7549C4.74847 18.8778 4.82272 18.9894 4.91661 19.0833C5.0105 19.1772 5.12216 19.2514 5.24505 19.3017C5.36795 19.352 5.49963 19.3773 5.63241 19.3762C5.76519 19.375 5.89641 19.3474 6.01841 19.295C6.14041 19.2426 6.25076 19.1664 6.34301 19.0709L12 13.4139Z" />
    </svg>`;

  function renderPhrases() {
    chrome.storage.local.get(['selectedPhrase', 'phrases'], function (result) {
      const selectedPhraseIndex = result.selectedPhrase;
      const phrases = result.phrases || [];

      if (phrases.length > 10) {
        phrases.shift();
        chrome.storage.local.set({ phrases });
      }

      phrasesList.innerHTML = phrases.map((phrase, index) => {
        const isSelected = Number(selectedPhraseIndex) === index ? 'selected' : '';

        return (
          `<div class="phrases-item ${isSelected}" data-index="${index}">
            <span>${phrase}</span>
            <button class="delete-phrase">${deleteIcon}</button>
          </div>`
        );
      }
      ).join('');
    });
  }
  renderPhrases();

  saveButton.addEventListener('click', function () {
    const newPhrase = phraseInput.value.trim();
    if (newPhrase) {
      chrome.storage.local.get(['phrases'], function (result) {
        const phrases = result.phrases || [];
        phrases.push(newPhrase);
        chrome.storage.local.set({ phrases: phrases }, function () {
          renderPhrases();
          phraseInput.value = '';
        });
      });
    }
  });

  phrasesList.addEventListener('click', function (event) {
    const target = event.target;

    const deleteItem = target.closest('.delete-phrase');
    if (deleteItem) {
      event.preventDefault();
      event.stopPropagation();
      const item = target.closest('.phrases-item');
      const index = item.getAttribute('data-index');

      chrome.storage.local.get(['phrases'], function (result) {
        const phrases = result.phrases || [];
        phrases.splice(index, 1);
        chrome.storage.local.set({ phrases: phrases }, function () {
          renderPhrases();
        });
      });
    }

    const phraseItem = target.closest('.phrases-item');
    if (phraseItem) {
      document.querySelectorAll('.phrases-item.selected').forEach(item => {
        item.classList.remove('selected');
      });

      const phraseIndex = phraseItem.getAttribute('data-index');
      phraseItem.classList.add('selected');

      if (phraseIndex) {
        chrome.storage.local.set({ selectedPhrase: phraseIndex });
      }
    }
  });
});
