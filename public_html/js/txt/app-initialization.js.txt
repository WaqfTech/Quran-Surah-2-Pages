// js/app-initialization.js

// Define global state variables *before* DOMContentLoaded
window.pageCounter = 1;
window.pages = [];
window.currentSurah = '';
window.audioFileName = '';
window.editingPageIndex = -1; // Still used by inline edit logic? No, can be removed if desired. Let's keep for now in case of future use.
window.reciterName = '';
window.selectedQiraat = '';
window.selectedRawi = '';

// --- Main Initialization Logic ---
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM Loaded. Initializing application...");

    // 1. Load any saved state FIRST
    let dataLoaded = false;
    if (typeof loadFromLocalStorage === 'function') {
        dataLoaded = loadFromLocalStorage();
        if(dataLoaded) { console.log("State successfully loaded from localStorage."); }
        else { console.log("No valid state found in localStorage or loading failed. Using defaults."); }
    } else { console.error("loadFromLocalStorage function not found. State not loaded."); }

    // 2. Setup UI components (dropdowns, input fields, audio display, reset button)
    if (typeof setupSurahDropdown === 'function') setupSurahDropdown(); else console.error("setupSurahDropdown not found.");
    if (typeof addReciterInput === 'function') addReciterInput(); else console.error("addReciterInput not found.");
    if (typeof setupQiraatDropdown === 'function') setupQiraatDropdown(); else console.error("setupQiraatDropdown not found.");
    if (typeof setupAudioTimeDisplay === 'function') setupAudioTimeDisplay(); else console.error("setupAudioTimeDisplay not found."); // Sets up time/duration/seeker AND info display
    if (typeof addResetButton === 'function') addResetButton(); else console.error("addResetButton not found.");

    // 3. Restore UI *values* AFTER dropdowns/inputs are populated/created and globals are loaded
     const surahSelect = document.getElementById('surahSelect');
     if (surahSelect && window.currentSurah) {
         surahSelect.value = window.currentSurah;
         console.log(`Restored Surah dropdown to: ${window.currentSurah}`);
     }
     const reciterInput = document.getElementById('reciterInput');
     if (reciterInput && window.reciterName) {
         reciterInput.value = window.reciterName;
         console.log(`Restored Reciter input to: ${window.reciterName}`);
     }
     const qiraatSelect = document.getElementById('qiraatSelect');
     if (qiraatSelect) {
         const qiraatValueToSet = (window.selectedQiraat && window.selectedRawi)
                                ? `${window.selectedQiraat} - ${window.selectedRawi}`
                                : window.selectedQiraat || '';
         if (qiraatValueToSet) {
             qiraatSelect.value = qiraatValueToSet;
             console.log(`Restored Qiraat dropdown to: ${qiraatValueToSet}`);
         }
     }
     const fileNameDisplay = document.getElementById('fileName');
     if (fileNameDisplay) {
         fileNameDisplay.textContent = window.audioFileName || 'لم يتم تحميل ملف صوتي';
     }
     // Update the info display initially based on loaded data
     if(typeof window.updateAudioInfoDisplay === 'function') window.updateAudioInfoDisplay();


    // 4. Handle Audio File Input Selection by User
    const audioFileInput = document.getElementById('audioFile');
    if (audioFileInput) {
        audioFileInput.addEventListener('change', function(e) {
            if (e.target.files[0]) {
                const file = e.target.files[0];
                window.audioFileName = file.name;
                if (fileNameDisplay) fileNameDisplay.textContent = window.audioFileName;
                console.log(`Audio file selected: ${window.audioFileName}`);

                const audio = document.getElementById('audio');
                if (audio) {
                    try {
                        const fileURL = URL.createObjectURL(file);
                         const previousUrl = audio.getAttribute('src');
                         if (previousUrl && previousUrl.startsWith('blob:')) {
                             URL.revokeObjectURL(previousUrl);
                             console.log("Revoked previous audio blob URL.");
                         }
                         audio.src = fileURL;
                         audio.load(); // Explicitly load the new source
                         console.log("New audio source set and loading.");
                    } catch (error) {
                        console.error("Error creating object URL for audio file:", error);
                        alert("حدث خطأ أثناء محاولة تحميل الملف الصوتي.");
                         if (fileNameDisplay) fileNameDisplay.textContent = 'خطأ في تحميل الملف';
                         window.audioFileName = '';
                         if(typeof window.updateAudioInfoDisplay === 'function') window.updateAudioInfoDisplay(); // Update display on error too
                    }
                } else { console.error("Audio element not found when handling file input."); }

                // Save the state (at least the new filename)
                if (typeof saveToLocalStorage === 'function') saveToLocalStorage();
                 // Update info display after loading new file name
                 if(typeof window.updateAudioInfoDisplay === 'function') window.updateAudioInfoDisplay();

            }
        });
    } else { console.error("Audio file input element (#audioFile) not found."); }

    // 5. Setup Seek Button Listeners
    const seekButtons = [
        { id: 'seekBackward10', seconds: -10 },
        { id: 'seekBackward5', seconds: -5 },
        { id: 'seekForward5', seconds: 5 },
        { id: 'seekForward10', seconds: 10 },
    ];
    seekButtons.forEach(buttonInfo => {
        const button = document.getElementById(buttonInfo.id);
        if (button && typeof window.seekAudio === 'function') {
            button.addEventListener('click', () => window.seekAudio(buttonInfo.seconds));
        } else if (!button) {
            console.warn(`Seek button with ID "${buttonInfo.id}" not found.`);
        } else {
             console.error(`seekAudio function not found.`);
        }
    });


    // 6. Initial Page List Build
    if (typeof rebuildPageList === 'function') {
        console.log("Performing initial page list build.");
        rebuildPageList();
    } else { console.error("rebuildPageList function not found during initialization."); }

    // 7. Trigger Dynamic Button Generation and Initial Timeline Render
    if (surahSelect && window.currentSurah && window.currentSurah !== "") {
         console.log(`Initial load: Triggering 'change' handlers for Surah ${window.currentSurah}.`);
         surahSelect.dispatchEvent(new Event('change'));
    } else {
         console.log("Initial load: No Surah selected, skipping initial 'change' event dispatch.");
         if (typeof rebuildPageList === 'function') rebuildPageList();
    }

    // 8. Initial Timeline Render Attempt
    const audio = document.getElementById('audio');
     if (audio && typeof window.renderTimeline === 'function') {
          const tryRenderTimeline = () => {
               if (audio.readyState >= 1 && !isNaN(audio.duration) && audio.duration > 0 && window.pages && window.pages.length > 0) {
                   console.log("Attempting initial timeline render.");
                   window.renderTimeline(audio, window.pages);
               } else if (audio.src && audio.readyState < 1) {
                    console.log("Audio src set but not ready, adding listener for loadedmetadata to render timeline.");
                    audio.addEventListener('loadedmetadata', () => {
                        if (window.pages && window.pages.length > 0) {
                             console.log("Rendering timeline after loadedmetadata event.");
                            window.renderTimeline(audio, window.pages);
                        }
                    }, { once: true });
                    audio.addEventListener('error', (e) => console.error("Audio error on initial load:", e), { once: true });
               } else {
                   console.log("Initial timeline not rendered: Audio not ready or no pages data.");
                   window.renderTimeline(null, []);
               }
           };
           setTimeout(tryRenderTimeline, 100);
       } else { console.error("renderTimeline function or audio element not found during initialization."); }

       console.log("Application initialization complete.");
});

// Global helper function check
if (typeof formatTimeWithMs !== 'function') {
    console.error("FATAL: formatTimeWithMs function is not defined. Check script loading order.");
}
if (typeof window.updateAudioInfoDisplay !== 'function') {
     console.error("FATAL: updateAudioInfoDisplay function is not defined. Check script loading order.");
}
if (typeof window.seekAudio !== 'function') {
     console.error("FATAL: seekAudio function is not defined. Check script loading order.");
}