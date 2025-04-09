// local-storage.js

// Function to save current state to localStorage
function saveToLocalStorage() {
    const surahName = document.getElementById('surahSelect').value;
    const data = {
        surahName: surahName,
        pageCounter: pageCounter,
        pages: pages,
        audioFileName: audioFileName,
        reciterName: reciterName,
        selectedQiraat: selectedQiraat,
    };
    localStorage.setItem('quranPageMarker', JSON.stringify(data));
}

// Function to load data from localStorage
function loadFromLocalStorage() {
    const storedData = localStorage.getItem('quranPageMarker');
    if (storedData) {
        const data = JSON.parse(storedData);

        pageCounter = data.pageCounter || 1;
        pages = data.pages || [];
        currentSurah = data.surahName || '';
        audioFileName = data.audioFileName || '';
        reciterName = localStorage.getItem('reciterName') || '';
        selectedQiraat = data.selectedQiraat || '';

        document.getElementById('surahSelect').value = currentSurah;
        document.getElementById('reciterInput').value = reciterName;
        document.getElementById('qiraatSelect').value = selectedQiraat;
        document.getElementById('fileName').textContent = audioFileName;

        rebuildPageList();

        if (pages.length > 0) {
            const successMessage = document.getElementById('successMessage');
            successMessage.textContent = 'تم استعادة البيانات المحفوظة';
            successMessage.style.display = 'block';
            setTimeout(() => {
                successMessage.style.display = 'none';
            }, 3000);
        }
    }
    window.renderTimeline(document.getElementById('audio'), pages);
}