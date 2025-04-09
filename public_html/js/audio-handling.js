// audio-handling.js

// Setup audio time display with milliseconds
function setupAudioTimeDisplay() {
    const audio = document.getElementById('audio');
    const currentTimeDisplay = document.getElementById('currentTimeDisplay');
    const durationDisplay = document.getElementById('durationDisplay');
    const audioSeeker = document.getElementById('audioSeeker');

    audio.addEventListener('timeupdate', function() {
        currentTimeDisplay.textContent = formatTimeWithMs(audio.currentTime);

        if (!isNaN(audio.duration)) {
            const percent = (audio.currentTime / audio.duration) * 100;
            audioSeeker.value = percent;
        }
    });

    audio.addEventListener('loadedmetadata', function() {
        durationDisplay.textContent = formatTimeWithMs(audio.duration);
        audioSeeker.min = 0;
        audioSeeker.max = 100;
    });

    audioSeeker.addEventListener('input', function() {
        if (!isNaN(audio.duration)) {
            const seekTime = (audioSeeker.value / 100) * audio.duration;
            audio.currentTime = seekTime;
            currentTimeDisplay.textContent = formatTimeWithMs(seekTime);
        }
    });

    setInterval(function() {
        if (!audio.paused) {
            currentTimeDisplay.textContent = formatTimeWithMs(audio.currentTime);
        }
    }, 10);
}

// Format time to MM:SS
function formatTime(timeInSeconds) {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Format time with milliseconds MM:SS.mmm
function formatTimeWithMs(timeInSeconds) {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    const milliseconds = Math.floor((timeInSeconds % 1) * 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
}