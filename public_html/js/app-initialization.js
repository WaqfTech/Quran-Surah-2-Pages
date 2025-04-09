// app-initialization.js

// Initialize state
let pageCounter = 1;
let pages = [];
let currentSurah = '';
let audioFileName = '';
let editingPageIndex = -1;
let reciterName = '';
let selectedQiraat = '';
let selectedRawi = '';

// Load saved data from localStorage when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadFromLocalStorage();
    setupSurahDropdown();
    addReciterInput();
    setupQiraatDropdown();
    setupAudioTimeDisplay();
    addResetButton();

    document.getElementById('audioFile').addEventListener('change', function(e) {
        if (e.target.files[0]) {
            audioFileName = e.target.files[0].name;
            document.getElementById('fileName').textContent = audioFileName;

            const audio = document.getElementById('audio');
            const fileURL = URL.createObjectURL(e.target.files[0]);
            audio.src = fileURL;

            saveToLocalStorage();
        }
    });

    document.getElementById('markButton').addEventListener('click', function() {

        const audio = document.getElementById('audio');
        if (audio.src) {
            const currentTime = audio.currentTime;
            const timeFormatted = formatTimeWithMs(currentTime);

            pages.push({
                page: pageCounter,
                time: currentTime,
                timeFormatted: timeFormatted
            });

            updatePageList();

            saveToLocalStorage();

            const successMessage = document.getElementById('successMessage');
            successMessage.textContent = 'تم تحديد نهاية الصفحة بنجاح!';
            successMessage.style.display = 'block';
            setTimeout(() => {
                successMessage.style.display = 'none';
            }, 2000);

            pageCounter++;
            window.renderTimeline(document.getElementById('audio'), pages);

        } else {
            alert('الرجاء اختيار ملف صوتي أولاً');
        }
    });
});