// audio-handling.js

// Setup audio time display, duration, seeker, and info display
function setupAudioTimeDisplay() {
    const audio = document.getElementById('audio');
    const currentTimeDisplay = document.getElementById('currentTimeDisplay');
    const durationDisplay = document.getElementById('durationDisplay');
    const audioSeeker = document.getElementById('audioSeeker');
    const audioInfoDisplay = document.getElementById('audioInfoDisplay'); // Added

    if (!audio || !currentTimeDisplay || !durationDisplay || !audioSeeker || !audioInfoDisplay) {
         console.error("Audio display/control elements not found. Cannot set up time/info display.");
         return;
    }

    // Update current time and seeker position
    const updateTime = () => {
        if (!audio.paused && !isNaN(audio.currentTime)) { // Check if currentTime is valid
            currentTimeDisplay.textContent = formatTimeWithMs(audio.currentTime);
            if (!isNaN(audio.duration) && audio.duration > 0) {
                const percent = (audio.currentTime / audio.duration) * 100;
                if (!audioSeeker.matches(':active')) { // Prevent update if user is dragging
                    audioSeeker.value = percent;
                }
            }
        } else if (isNaN(audio.currentTime)) {
             currentTimeDisplay.textContent = '00:00.000';
        }
    };

    // Update duration display when metadata loads
    const updateDuration = () => {
        if (!isNaN(audio.duration) && audio.duration > 0) {
            durationDisplay.textContent = formatTimeWithMs(audio.duration);
            audioSeeker.min = 0;
            audioSeeker.max = 100;
            if (typeof window.renderTimeline === 'function' && typeof window.pages !== 'undefined') {
                window.renderTimeline(audio, window.pages);
            }
        } else {
             durationDisplay.textContent = '00:00.000';
             audioSeeker.value = 0;
             audioSeeker.min = 0;
             audioSeeker.max = 100;
        }
        // Update info display whenever duration changes (as it signals audio state change)
        updateAudioInfoDisplay();
    };

    // Event listeners
    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('durationchange', updateDuration);
    audio.addEventListener('seeked', updateTime);
    audio.addEventListener('emptied', () => {
         currentTimeDisplay.textContent = '00:00.000';
         durationDisplay.textContent = '00:00.000';
         audioSeeker.value = 0;
         updateAudioInfoDisplay(); // Update info display when emptied
         if (typeof window.renderTimeline === 'function') {
            window.renderTimeline(null, []); // Clear timeline
         }
    });
     audio.addEventListener('play', updateAudioInfoDisplay); // Update info on play/pause
     audio.addEventListener('pause', updateAudioInfoDisplay);


    // Handle seeker interaction
    audioSeeker.addEventListener('input', function() {
        if (!isNaN(audio.duration) && audio.duration > 0) {
            const seekTime = (parseFloat(audioSeeker.value) / 100) * audio.duration;
            currentTimeDisplay.textContent = formatTimeWithMs(seekTime);
        }
    });
    audioSeeker.addEventListener('change', function() {
         if (!isNaN(audio.duration) && audio.duration > 0) {
             const seekTime = (parseFloat(audioSeeker.value) / 100) * audio.duration;
             audio.currentTime = seekTime;
         }
     });

     // Initial setup
     updateDuration(); // Set initial duration/seeker state
     updateAudioInfoDisplay(); // Set initial info display
}

// NEW: Function to update the audio info display area
window.updateAudioInfoDisplay = function() {
    const audioInfoDisplay = document.getElementById('audioInfoDisplay');
    if (!audioInfoDisplay) return;

    const audio = document.getElementById('audio');
    // Prepare parts as objects {label, value}
    const parts = [];

    // Filename (use sanitized text)
    if (window.audioFileName) {
        parts.push({ label: 'الملف', value: sanitizeUserText(window.audioFileName) });
    } else if (audio && audio.src) {
        parts.push({ label: 'الملف', value: '(ملف محمل بدون اسم محفوظ)' });
    } else {
        parts.push({ label: 'الملف', value: '(غير محدد)' });
    }

    // Reciter
    if (window.reciterName) {
        parts.push({ label: 'القارئ', value: sanitizeUserText(window.reciterName) });
    }

    // Surah Info
    const selectedSurahNumber = parseInt(window.currentSurah);
    if (!isNaN(selectedSurahNumber) && selectedSurahNumber > 0 && typeof surahData !== 'undefined') {
        const surahInfo = surahData.find(s => s.number === selectedSurahNumber);
        if (surahInfo) {
            parts.push({ label: 'السورة', value: `${surahInfo.number} - ${surahInfo.arabicName}` });
        }
    }

    // Qiraat/Rawi
    if (window.selectedQiraat) {
        let qVal = sanitizeUserText(window.selectedQiraat);
        if (window.selectedRawi) qVal += ` (الراوي: ${sanitizeUserText(window.selectedRawi)})`;
        parts.push({ label: 'القراءة', value: qVal });
    }

    // Decide how to display: if only the filename is present and it's the default '(غير محدد)', show helpful prompt
    const onlyFilenameAndDefault = parts.length === 1 && parts[0].value === '(غير محدد)';

    // Clear previous content safely
    while (audioInfoDisplay.firstChild) audioInfoDisplay.removeChild(audioInfoDisplay.firstChild);

    if (onlyFilenameAndDefault) {
        const span = document.createElement('span');
        span.textContent = 'الرجاء تحميل ملف صوتي واختيار البيانات';
        audioInfoDisplay.appendChild(span);
        return;
    }

    // Build content using DOM nodes to avoid inserting HTML
    const fragment = document.createDocumentFragment();
    parts.forEach((p, idx) => {
        const labelEl = document.createElement('strong');
        labelEl.textContent = `${p.label}: `;
        fragment.appendChild(labelEl);

        const valueEl = document.createElement('span');
        valueEl.textContent = p.value;
        fragment.appendChild(valueEl);

        if (idx !== parts.length - 1) {
            const sep = document.createElement('span');
            sep.className = 'info-separator';
            sep.textContent = ' | ';
            fragment.appendChild(sep);
        }
    });

    audioInfoDisplay.appendChild(fragment);
}

// NEW: Function to seek audio by a relative amount
window.seekAudio = function(seconds) {
    const audio = document.getElementById('audio');
    if (audio && audio.src && !isNaN(audio.duration) && audio.duration > 0) {
        const currentTime = audio.currentTime;
        let newTime = currentTime + seconds;

        // Clamp the new time between 0 and duration
        newTime = Math.max(0, Math.min(newTime, audio.duration));

        console.log(`Seeking audio from ${currentTime.toFixed(3)} by ${seconds}s to ${newTime.toFixed(3)}`);
        audio.currentTime = newTime;

        // Update the display immediately after programmatic seek
        const currentTimeDisplay = document.getElementById('currentTimeDisplay');
        const audioSeeker = document.getElementById('audioSeeker');
        if (currentTimeDisplay) {
             currentTimeDisplay.textContent = formatTimeWithMs(newTime);
        }
        if (audioSeeker) {
             audioSeeker.value = (newTime / audio.duration) * 100;
        }

    } else {
        console.warn("Cannot seek: Audio not ready or invalid duration.");
    }
}

// Format time with milliseconds MM:SS.mmm
function formatTimeWithMs(timeInSeconds) {
    if (isNaN(timeInSeconds) || timeInSeconds < 0) return '00:00.000'; // Handle invalid input gracefully
    const totalSeconds = Math.max(0, timeInSeconds); // Ensure non-negative
    const totalSecondsFloored = Math.floor(totalSeconds);
    const milliseconds = Math.round((totalSeconds - totalSecondsFloored) * 1000);

     // Handle rounding milliseconds up to the next second
     if (milliseconds === 1000) {
         const nextSecondTime = totalSecondsFloored + 1;
         const minutes = Math.floor(nextSecondTime / 60);
         const seconds = nextSecondTime % 60;
         return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.000`;
     } else {
         const minutes = Math.floor(totalSecondsFloored / 60);
         const seconds = totalSecondsFloored % 60;
         return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
     }
}