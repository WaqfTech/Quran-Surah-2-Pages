Okay, I understand. We will implement the first suggestion: displaying all pages for the selected Surah in the "الصفحات المحددة" list, showing placeholders for unmarked pages, and keeping the existing edit dialog.

Here are the complete contents of the modified files. I've focused the changes primarily in `page-list-management.js` and `dropdowns.js`, with minor adjustments elsewhere to ensure things trigger correctly.

--- START OF FILE timeline.js.txt ---
```javascript
// js/timeline.js

window.renderTimeline = function(audio, pagesArray) {
    const timeline = document.getElementById("timeline");
    const localAudio = audio || document.getElementById('audio');

    // Clear timeline content and reset cursor
    if (timeline) {
        timeline.innerHTML = "";
        timeline.style.cursor = 'default';
    } else {
        console.error("Timeline element not found.");
        return;
    }

    // Basic checks for valid audio and data
    if (!localAudio || isNaN(localAudio.duration) || localAudio.duration <= 0 || typeof pagesArray === 'undefined') {
        console.log("Timeline render skipped: No audio/duration/pages data.");
        // Keep the timeline element visible but empty
        return;
    }

    // Filter pages to only include those relevant to the audio (e.g., matching surah? - maybe not needed here if pages array is managed correctly)
    // Create a sorted copy for rendering segments in correct visual order
    const sortedPages = [...pagesArray].sort((a, b) => a.startTime - b.time); // Sort by start time

    // Only render if there are pages with valid times
    const pagesToRender = sortedPages.filter(page => typeof page.startTime === 'number' && typeof page.endTime === 'number');

    if (pagesToRender.length === 0) {
        console.log("Timeline render skipped: No valid page segments to render.");
        return; // Nothing to render
    }

    timeline.style.cursor = 'pointer'; // Set cursor only if there's something to click
    const duration = localAudio.duration;

    pagesToRender.forEach((page) => {
        // Use the explicit start and end times from the page object
        const start = page.startTime; // Assume already validated number
        const end = page.endTime;     // Assume already validated number

        // Validate times before calculating percentages (additional safety)
        if (isNaN(start) || isNaN(end) || start < 0 || end < start || start >= duration) {
             console.warn(`Skipping invalid segment for page ${page.page} (Surah ${page.surahNumber}): start=${start}, end=${end}, duration=${duration}`);
             return;
        }

        // Clamp end time to duration if it exceeds (can happen with edits)
        const clampedEnd = Math.min(end, duration);

        const segment = document.createElement("div");
        segment.className = "timeline-segment"; // Use class from CSS

        const startPct = (start / duration) * 100;
        // Ensure width calculation uses clamped end time and is not negative
        const widthPct = Math.max(0, ((clampedEnd - start) / duration) * 100);

        // Final check on percentages before applying styles
        if (isNaN(startPct) || isNaN(widthPct) || startPct > 100 || widthPct > 100 || widthPct < 0) {
            console.warn(`Invalid percentage for page ${page.page}: startPct=${startPct}, widthPct=${widthPct}. Skipping segment.`);
            return;
        }

        segment.style.left = `${startPct}%`;
        segment.style.width = `${widthPct}%`;

        // Add hover title
        segment.title = `صفحة ${page.page} (سورة ${page.surahNumber})\n${page.startTimeFormatted} - ${page.endTimeFormatted}`;

        // Click handler seeks to the START time of the segment
        segment.addEventListener("click", () => {
            if (localAudio) {
                 localAudio.currentTime = start; // Seek to the start time of the segment
                 // Optional: auto-play
                 // localAudio.play().catch(e => console.error("Audio play failed:", e));
            }
        });

        timeline.appendChild(segment);
    });
};
```
--- END OF FILE timeline.js.txt ---

--- START OF FILE time-editing.js.txt ---
```javascript
// js/time-editing.js

// Global variable to track the index being edited
// Ensure this is declared *globally* (likely in app-initialization.js using window.editingPageIndex)
// Let's use a local variable within this module/file scope for clarity,
// assuming it doesn't NEED to be strictly global for other files.
let localCurrentEditingIndex = -1;

// Function to parse time string (MM:SS.mmm or similar) to seconds - Ensure it handles various inputs gracefully
function parseTimeToSeconds(timeString) {
    if (timeString === null || typeof timeString === 'undefined') return 0;
    timeString = String(timeString); // Ensure it's a string

    const parts = timeString.split(':');
    let totalSeconds = 0;

    try {
        if (parts.length === 3) { // HH:MM:SS.mmm
            const ssmmm = parts[2].split('.');
            const ms = parseInt(ssmmm[1]?.padEnd(3, '0') || '0', 10);
            totalSeconds = (parseInt(parts[0], 10) * 3600) + (parseInt(parts[1], 10) * 60) + parseInt(ssmmm[0], 10) + (ms / 1000);
        } else if (parts.length === 2) { // MM:SS.mmm
            const ssmmm = parts[1].split('.');
            const ms = parseInt(ssmmm[1]?.padEnd(3, '0') || '0', 10);
            totalSeconds = (parseInt(parts[0], 10) * 60) + parseInt(ssmmm[0], 10) + (ms / 1000);
        } else if (parts.length === 1) { // SS.mmm or SSS
             const ssmmm = parts[0].split('.');
             const ms = parseInt(ssmmm[1]?.padEnd(3, '0') || '0', 10);
             totalSeconds = parseInt(ssmmm[0], 10) + (ms / 1000);
        }
    } catch (e) {
        console.error("Error parsing time string:", timeString, e);
        return 0; // Return 0 on parsing error
    }

    return isNaN(totalSeconds) ? 0 : Math.max(0, totalSeconds); // Return 0 if NaN, ensure non-negative
}


// Show the new editor interface for start and end times
function showStartEndTimeEditor(index) {
    console.log(`Attempting to show editor for index: ${index}`); // Log entry

    // Ensure global pages array exists and index is valid
    // The index now refers to the index within the *filtered and sorted* window.pages array
    // Re-finding the actual page object might be safer if the array reference changes, but index should be stable if rebuildList passes it correctly.
    if (typeof window.pages === 'undefined' || index < 0 || index >= window.pages.length) {
        console.error(`Cannot show editor: Invalid index (${index}) or pages array not found/valid.`);
        return;
    }

    // Call cancel first to ensure any previous editor/state is cleaned up
    cancelStartEndTimeEdit();

    localCurrentEditingIndex = index; // Store the index being edited locally
    console.log(`showStartEndTimeEditor: localCurrentEditingIndex SET TO: ${localCurrentEditingIndex}`); // Log setting

    const page = window.pages[index];
    if (!page) {
         console.error(`Cannot show editor: Page data not found at index ${index}.`);
         return;
    }
    const audio = document.getElementById('audio');
    const audioDuration = audio ? audio.duration : Infinity;
    if (isNaN(audioDuration)) {
        console.warn("Audio duration is NaN, validation against duration might be inaccurate.");
    }

    // Create the editor form dynamically
    const editForm = document.createElement('div');
    editForm.id = 'startEndTimeEditForm';
    editForm.className = 'edit-time-form'; // Reuse existing class for basic styling

    // Helper function to get time components
    const getTimeComponents = (timeInSeconds) => {
        const time = Math.max(0, timeInSeconds || 0);
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        const milliseconds = Math.floor((time % 1) * 1000);
        return { minutes, seconds, milliseconds };
    };

    const startComponents = getTimeComponents(page.startTime);
    const endComponents = getTimeComponents(page.endTime);

    // Populate inner HTML
    editForm.innerHTML = `
        <span class="edit-time-label">تعديل أوقات صفحة ${page.page} (سورة ${page.surahNumber})</span>
<div class="time-edit-container">
    <!-- Start Time Fieldset -->
    <fieldset class="time-edit-fieldset">
        <legend class="time-legend">وقت البدء</legend>
        <div class="time-input-group">
            <div class="time-input-wrapper">
                <label for="editStartMinutes" class="time-label">دقائق</label>
                <input
                    type="number"
                    class="time-input"
                    id="editStartMinutes"
                    min="0"
                    value="${startComponents.minutes}"
                    aria-label="دقائق البدء"
                />
            </div>
            <span class="time-separator">:</span>
            <div class="time-input-wrapper">
                <label for="editStartSeconds" class="time-label">ثواني</label>
                <input
                    type="number"
                    class="time-input"
                    id="editStartSeconds"
                    min="0"
                    max="59"
                    value="${startComponents.seconds}"
                    aria-label="ثواني البدء"
                />
            </div>
            <span class="time-separator">.</span>
            <div class="time-input-wrapper">
                <label for="editStartMilliseconds" class="time-label">أجزاء الثانية</label>
                <input
                    type="number"
                    class="time-input time-input-ms"
                    id="editStartMilliseconds"
                    min="0"
                    max="999"
                    value="${startComponents.milliseconds}"
                    aria-label="أجزاء الثانية للبدء"
                />
            </div>
        </div>
    </fieldset>

    <!-- End Time Fieldset -->
    <fieldset class="time-edit-fieldset">
        <legend class="time-legend">وقت الانتهاء</legend>
        <div class="time-input-group">
            <div class="time-input-wrapper">
                <label for="editEndMinutes" class="time-label">دقائق</label>
                <input
                    type="number"
                    class="time-input"
                    id="editEndMinutes"
                    min="0"
                    value="${endComponents.minutes}"
                    aria-label="دقائق الانتهاء"
                />
            </div>
            <span class="time-separator">:</span>
            <div class="time-input-wrapper">
                <label for="editEndSeconds" class="time-label">ثواني</label>
                <input
                    type="number"
                    class="time-input"
                    id="editEndSeconds"
                    min="0"
                    max="59"
                    value="${endComponents.seconds}"
                    aria-label="ثواني الانتهاء"
                />
            </div>
            <span class="time-separator">.</span>
            <div class="time-input-wrapper">
                <label for="editEndMilliseconds" class="time-label">أجزاء الثانية</label>
                <input
                    type="number"
                    class="time-input time-input-ms"
                    id="editEndMilliseconds"
                    min="0"
                    max="999"
                    value="${endComponents.milliseconds}"
                    aria-label="أجزاء الثانية للانتهاء"
                />
            </div>
        </div>
    </fieldset>
</div>
        <div class="time-edit-actions">
            <button type="button" class="cancel-time-btn" id="cancelTimeEditBtn">إلغاء</button>
            <button type="button" class="save-time-btn" id="saveTimeEditBtn">حفظ التعديلات</button>
        </div>
        <div id="editErrorMsg" class="edit-error-message" style="color: red; margin-top: 10px; text-align: center;"></div>
    `;

    // Insert the form into the DOM
    const audioContainer = document.querySelector('.audio-container');
    if (audioContainer && audioContainer.parentNode) {
        audioContainer.parentNode.insertBefore(editForm, audioContainer.nextSibling);
        editForm.classList.add('active'); // Make it visible
        console.log(`Editor form for index ${index} inserted and activated.`);
    } else {
        console.error("Audio container not found, cannot insert edit form.");
        localCurrentEditingIndex = -1; // Reset index if insertion failed
        return;
    }

    // Add listeners to the new buttons inside the dynamically created form
    const saveBtn = document.getElementById('saveTimeEditBtn');
    const cancelBtn = document.getElementById('cancelTimeEditBtn');

    if (saveBtn) {
         saveBtn.addEventListener('click', () => {
             // Log index value right before calling save function
             console.log(`Save button CLICKED. localCurrentEditingIndex is: ${localCurrentEditingIndex}`);
             saveStartEndTimeEdit(audioDuration);
         });
     } else { console.error("Save button not found in dynamic form."); }

    if (cancelBtn) {
         cancelBtn.addEventListener('click', cancelStartEndTimeEdit);
     } else { console.error("Cancel button not found in dynamic form."); }


    // Focus the first input for convenience
    const startMinutesInput = document.getElementById('editStartMinutes');
    if (startMinutesInput) {
        startMinutesInput.focus();
        startMinutesInput.select(); // Select text for easy replacement
    }
}

// Save the edited start and end times
function saveStartEndTimeEdit(audioDuration) {
    // Log entry and current state
    console.log(`saveStartEndTimeEdit ENTERED. localCurrentEditingIndex is: ${localCurrentEditingIndex}, typeof window.pages is: ${typeof window.pages}`);

    // Check the index and pages array again
    if (localCurrentEditingIndex === -1 || typeof window.pages === 'undefined' || localCurrentEditingIndex >= window.pages.length) {
        console.error(`Save Error: Invalid index (${localCurrentEditingIndex}) or pages array missing/invalid.`);
        // Optionally display error to user in the form
        const errorMsgDiv = document.getElementById('editErrorMsg');
         if (errorMsgDiv) errorMsgDiv.textContent = 'خطأ: حدث مشكلة أثناء محاولة حفظ البيانات. الرجاء المحاولة مرة أخرى.';
        return;
    }

     const pageToUpdate = window.pages[localCurrentEditingIndex];
     if (!pageToUpdate) {
         console.error(`Save Error: Page object not found at index ${localCurrentEditingIndex}.`);
         const errorMsgDiv = document.getElementById('editErrorMsg');
          if (errorMsgDiv) errorMsgDiv.textContent = 'خطأ: لم يتم العثور على بيانات الصفحة المراد تعديلها.';
         return;
     }
     const originalPageNum = pageToUpdate.page; // Store page number before potential sorting changes index

    const errorMsgDiv = document.getElementById('editErrorMsg');
    if (errorMsgDiv) errorMsgDiv.textContent = ''; // Clear previous errors

    // --- Read Start Time ---
    const startMinutesInput = document.getElementById('editStartMinutes');
    const startSecondsInput = document.getElementById('editStartSeconds');
    const startMsInput = document.getElementById('editStartMilliseconds');
    if (!startMinutesInput || !startSecondsInput || !startMsInput) {
        console.error("Save Error: Could not find start time input elements.");
        if (errorMsgDiv) errorMsgDiv.textContent = 'خطأ: لم يتم العثور على حقول وقت البدء.';
        return;
    }
    const startMinutes = parseInt(startMinutesInput.value) || 0;
    const startSeconds = parseInt(startSecondsInput.value) || 0;
    const startMilliseconds = parseInt(startMsInput.value) || 0;
    const newStartTime = (startMinutes * 60) + startSeconds + (startMilliseconds / 1000);

    // --- Read End Time ---
    const endMinutesInput = document.getElementById('editEndMinutes');
    const endSecondsInput = document.getElementById('editEndSeconds');
    const endMsInput = document.getElementById('editEndMilliseconds');
     if (!endMinutesInput || !endSecondsInput || !endMsInput) {
        console.error("Save Error: Could not find end time input elements.");
        if (errorMsgDiv) errorMsgDiv.textContent = 'خطأ: لم يتم العثور على حقول وقت الانتهاء.';
        return;
    }
    const endMinutes = parseInt(endMinutesInput.value) || 0;
    const endSeconds = parseInt(endSecondsInput.value) || 0;
    const endMilliseconds = parseInt(endMsInput.value) || 0;
    const newEndTime = (endMinutes * 60) + endSeconds + (endMilliseconds / 1000);

    // --- Validation ---
    if (newStartTime < 0 || newEndTime < 0) {
        if (errorMsgDiv) errorMsgDiv.textContent = 'خطأ: لا يمكن أن تكون الأوقات سالبة.';
        return;
    }
    if (newEndTime < newStartTime) {
        if (errorMsgDiv) errorMsgDiv.textContent = 'خطأ: وقت الانتهاء لا يمكن أن يكون قبل وقت البدء.';
        return;
    }
    // Use the potentially updated audioDuration passed as argument
    const currentAudioDuration = audioDuration || document.getElementById('audio')?.duration || Infinity;
     if (!isNaN(currentAudioDuration) && currentAudioDuration !== Infinity && newEndTime > currentAudioDuration) {
         const warningMsg = `تحذير: وقت الانتهاء (${formatTimeWithMs(newEndTime)}) يتجاوز مدة الملف الصوتي (${formatTimeWithMs(currentAudioDuration)}).`;
         if (errorMsgDiv) errorMsgDiv.textContent = warningMsg;
         console.warn(warningMsg);
         // Allow saving but show warning. Could add a confirmation step here.
     }

    // --- Update the page object IN THE GLOBAL ARRAY ---
    try {
        pageToUpdate.startTime = newStartTime;
        pageToUpdate.endTime = newEndTime;
        pageToUpdate.startTimeFormatted = formatTimeWithMs(newStartTime);
        pageToUpdate.endTimeFormatted = formatTimeWithMs(newEndTime);
        console.log(`Updated page ${pageToUpdate.page} (Surah ${pageToUpdate.surahNumber}): Start=${pageToUpdate.startTimeFormatted}, End=${pageToUpdate.endTimeFormatted}`);
    } catch (e) {
         console.error("Error updating page object in array:", e);
         if (errorMsgDiv) errorMsgDiv.textContent = 'خطأ فادح أثناء تحديث البيانات.';
         return;
    }


    // Re-sort pages array (optional, depends if editing can change order - unlikely here)
     // window.pages.sort((a, b) => {
     //     if (a.surahNumber !== b.surahNumber) return a.surahNumber - b.surahNumber;
     //     if (a.page !== b.page) return a.page - b.page;
     //     return a.startTime - b.startTime;
     // });

    // --- Update UI and Save ---
    if (typeof saveToLocalStorage === 'function') saveToLocalStorage(); else console.error("Save Error: saveToLocalStorage not found");
    if (typeof rebuildPageList === 'function') rebuildPageList(); else console.error("Save Error: rebuildPageList not found");

    const audio = document.getElementById('audio');
    if (audio && typeof window.renderTimeline === 'function') {
        window.renderTimeline(audio, window.pages);
    } else {
         console.error("Save Error: renderTimeline or audio element not found");
    }

    // Close the editor form AFTER successful operations
    cancelStartEndTimeEdit(); // This also resets localCurrentEditingIndex

    // Show success message to user using the original page number
    const successMessage = document.getElementById('successMessage');
    if (successMessage) {
        successMessage.textContent = `تم تعديل أوقات صفحة ${originalPageNum} بنجاح!`;
        successMessage.style.display = 'block';
        setTimeout(() => { successMessage.style.display = 'none'; }, 2500);
    }

}

// Cancel time editing and remove the form
function cancelStartEndTimeEdit() {
    console.log(`Cancel called. Resetting localCurrentEditingIndex from ${localCurrentEditingIndex} to -1.`); // Log cancel
    const editForm = document.getElementById('startEndTimeEditForm');
    if (editForm) {
        editForm.classList.remove('active');
        // Use requestAnimationFrame or setTimeout to ensure removal happens after potential transitions
        setTimeout(() => {
             if (editForm.parentNode) {
                editForm.parentNode.removeChild(editForm);
                console.log("Editor form removed.");
             }
        }, 150); // Shorter delay might suffice if no long transitions
    }
    localCurrentEditingIndex = -1; // Reset editing index reliably
}
```
--- END OF FILE time-editing.js.txt ---

--- START OF FILE surah-data.js.txt ---
```javascript
const surahData = [
  {
    "number": 1,
    "englishName": "Al-Fatiha (The Opener)",
    "arabicName": "الفاتحة",
    "startPage": 1,
    "endPage": 1,
    "totalAyas": 7
  },
  {
    "number": 2,
    "englishName": "Al-Baqarah (The Cow)",
    "arabicName": "البقرة",
    "startPage": 2,
    "endPage": 49,
    "totalAyas": 286
  },
  {
    "number": 3,
    "englishName": "Al-Imran (Family of Imran)",
    "arabicName": "آل عمران",
    "startPage": 50,
    "endPage": 76,
    "totalAyas": 200
  },
  {
    "number": 4,
    "englishName": "An-Nisa (The Women)",
    "arabicName": "النساء",
    "startPage": 77,
    "endPage": 106,
    "totalAyas": 176
  },
  {
    "number": 5,
    "englishName": "Al-Ma'idah (The Table Spread)",
    "arabicName": "المائدة",
    "startPage": 107,  // Corrected from 106 to 107
    "endPage": 127,
    "totalAyas": 120
  },
  {
    "number": 6,
    "englishName": "Al-Anam (The Cattle)",
    "arabicName": "الأنعام",
    "startPage": 128,
    "endPage": 150,
    "totalAyas": 165
  },
  {
    "number": 7,
    "englishName": "Al-A'raf (The Heights)",
    "arabicName": "الأعراف",
    "startPage": 151,
    "endPage": 176,
    "totalAyas": 206
  },
  {
    "number": 8,
    "englishName": "Al-Anfal (The Spoils of War)",
    "arabicName": "الأنفال",
    "startPage": 177,
    "endPage": 186,
    "totalAyas": 75
  },
  {
    "number": 9,
    "englishName": "At-Taubah (The Repentance)",
    "arabicName": "التوبة",
    "startPage": 187,
    "endPage": 207,
    "totalAyas": 129
  },
  {
    "number": 10,
    "englishName": "Yunus (Jonah)",
    "arabicName": "يونس",
    "startPage": 208,
    "endPage": 221,
    "totalAyas": 109
  },
  {
    "number": 11,
    "englishName": "Hud (Hud)",
    "arabicName": "هود",
    "startPage": 221,
    "endPage": 235,
    "totalAyas": 123
  },
  {
    "number": 12,
    "englishName": "Yusuf (Joseph)",
    "arabicName": "يوسف",
    "startPage": 235,
    "endPage": 248,
    "totalAyas": 111
  },
  {
    "number": 13,
    "englishName": "Ar-Ra'd (Thunder)",
    "arabicName": "الرعد",
    "startPage": 249,
    "endPage": 255,
    "totalAyas": 43
  },
  {
    "number": 14,
    "englishName": "Ibrahim (Abraham)",
    "arabicName": "إبراهيم",
    "startPage": 255,
    "endPage": 261,
    "totalAyas": 52
  },
  {
    "number": 15,
    "englishName": "Al-Hijr (The Stoneland)",
    "arabicName": "الحجر",
    "startPage": 262,
    "endPage": 267,
    "totalAyas": 99
  },
  {
    "number": 16,
    "englishName": "An-Nahl (The Bee)",
    "arabicName": "النحل",
    "startPage": 267,
    "endPage": 281,
    "totalAyas": 128
  },
  {
    "number": 17,
    "englishName": "Al-Isra (The Night Journey)",
    "arabicName": "الإسراء",
    "startPage": 282,
    "endPage": 293,
    "totalAyas": 111
  },
  {
    "number": 18,
    "englishName": "Al-Kahf (The Cave)",
    "arabicName": "الكهف",
    "startPage": 293,
    "endPage": 304,
    "totalAyas": 110
  },
  {
    "number": 19,
    "englishName": "Maryam (Mary)",
    "arabicName": "مريم",
    "startPage": 305,
    "endPage": 312,
    "totalAyas": 98
  },
  {
    "number": 20,
    "englishName": "Ta-Ha (Ta-Ha)",
    "arabicName": "طه",
    "startPage": 312,
    "endPage": 321,
    "totalAyas": 135
  },
  {
    "number": 21,
    "englishName": "Al-Anbiya (The Prophets)",
    "arabicName": "الأنبياء",
    "startPage": 322,
    "endPage": 331,
    "totalAyas": 112
  },
  {
    "number": 22,
    "englishName": "Al-Hajj (The Pilgrimage)",
    "arabicName": "الحج",
    "startPage": 332,
    "endPage": 341,
    "totalAyas": 78
  },
  {
    "number": 23,
    "englishName": "Al-Mu'minun (The Believers)",
    "arabicName": "المؤمنون",
    "startPage": 342,
    "endPage": 349,
    "totalAyas": 118
  },
  {
    "number": 24,
    "englishName": "An-Nur (The Light)",
    "arabicName": "النور",
    "startPage": 350,
    "endPage": 359,
    "totalAyas": 64
  },
  {
    "number": 25,
    "englishName": "Al-Furqan (The Criterion)",
    "arabicName": "الفرقان",
    "startPage": 359,
    "endPage": 366,
    "totalAyas": 77
  },
  {
    "number": 26,
    "englishName": "Ash-Shu'ara (The Poets)",
    "arabicName": "الشعراء",
    "startPage": 367,
    "endPage": 376,
    "totalAyas": 227
  },
  {
    "number": 27,
    "englishName": "An-Naml (The Ants)",
    "arabicName": "النمل",
    "startPage": 377,
    "endPage": 385,
    "totalAyas": 93
  },
  {
    "number": 28,
    "englishName": "Al-Qasas (The Story)",
    "arabicName": "القصص",
    "startPage": 385,
    "endPage": 396,
    "totalAyas": 88
  },
  {
    "number": 29,
    "englishName": "Al-Ankabut (The Spider)",
    "arabicName": "العنكبوت",
    "startPage": 396,
    "endPage": 404,
    "totalAyas": 69
  },
  {
    "number": 30,
    "englishName": "Ar-Rum (The Romans)",
    "arabicName": "الروم",
    "startPage": 404,
    "endPage": 410,
    "totalAyas": 60
  },
  {
    "number": 31,
    "englishName": "Luqman (Luqman)",
    "arabicName": "لقمان",
    "startPage": 411,
    "endPage": 414,
    "totalAyas": 34
  },
  {
    "number": 32,
    "englishName": "As-Sajdah (Prostration)",
    "arabicName": "السجدة",
    "startPage": 415,
    "endPage": 417,
    "totalAyas": 30
  },
  {
    "number": 33,
    "englishName": "Al-Ahzab (The Confederates)",
    "arabicName": "الأحزاب",
    "startPage": 418,
    "endPage": 427,
    "totalAyas": 73
  },
  {
    "number": 34,
    "englishName": "Saba (Sheba)",
    "arabicName": "سبأ",
    "startPage": 428,
    "endPage": 434,
    "totalAyas": 54
  },
  {
    "number": 35,
    "englishName": "Fatir (The Originator)",
    "arabicName": "فاطر",
    "startPage": 434,
    "endPage": 440,
    "totalAyas": 45
  },
  {
    "number": 36,
    "englishName": "Ya-Sin (Ya Sin)",
    "arabicName": "يس",
    "startPage": 440,
    "endPage": 445,
    "totalAyas": 83
  },
  {
    "number": 37,
    "englishName": "As-Saffat (Those Who Set the Ranks)",
    "arabicName": "الصافات",
    "startPage": 446,
    "endPage": 452,
    "totalAyas": 182
  },
  {
    "number": 38,
    "englishName": "Sad (The letter Saad)",
    "arabicName": "ص",
    "startPage": 453,
    "endPage": 458,
    "totalAyas": 88
  },
  {
    "number": 39,
    "englishName": "Az-Zumar (The Troops)",
    "arabicName": "الزمر",
    "startPage": 458,
    "endPage": 467,
    "totalAyas": 75
  },
  {
    "number": 40,
    "englishName": "Ghafir (The Forgiver)",
    "arabicName": "غافر",
    "startPage": 467,
    "endPage": 476,
    "totalAyas": 85
  },
  {
    "number": 41,
    "englishName": "Fussilat (Explained in Detail)",
    "arabicName": "فصلت",
    "startPage": 477,
    "endPage": 482,
    "totalAyas": 54
  },
  {
    "number": 42,
    "englishName": "Ash-Shura (The Consultation)",
    "arabicName": "الشورى",
    "startPage": 483,
    "endPage": 489,
    "totalAyas": 53
  },
  {
    "number": 43,
    "englishName": "Az-Zukhruf (The Ornaments of Gold)",
    "arabicName": "الزخرف",
    "startPage": 489,
    "endPage": 495,
    "totalAyas": 89
  },
  {
    "number": 44,
    "englishName": "Ad-Dukhan (The Smoke)",
    "arabicName": "الدخان",
    "startPage": 496,
    "endPage": 498,
    "totalAyas": 59
  },
  {
    "number": 45,
    "englishName": "Al-Jathiyah (The Crouching)",
    "arabicName": "الجاثية",
    "startPage": 499,
    "endPage": 502,
    "totalAyas": 37
  },
  {
    "number": 46,
    "englishName": "Al-Ahqaf (The Wind Curved Sandhill)",
    "arabicName": "الأحقاف",
    "startPage": 502,
    "endPage": 506,
    "totalAyas": 35
  },
  {
    "number": 47,
    "englishName": "Muhammad (Muhammad)",
    "arabicName": "محمد",
    "startPage": 507,
    "endPage": 510,
    "totalAyas": 38
  },
  {
    "number": 48,
    "englishName": "Al-Fath (The Victory)",
    "arabicName": "الفتح",
    "startPage": 511,
    "endPage": 515,
    "totalAyas": 29
  },
  {
    "number": 49,
    "englishName": "Al-Hujurat (The Private Chambers)",
    "arabicName": "الحجرات",
    "startPage": 515,
    "endPage": 517,
    "totalAyas": 18
  },
  {
    "number": 50,
    "englishName": "Qaf (Qaf)",
    "arabicName": "ق",
    "startPage": 518,
    "endPage": 520,
    "totalAyas": 45
  },
  {
    "number": 51,
    "englishName": "Adh-Dhariyat (The Scatterers)",
    "arabicName": "الذاريات",
    "startPage": 520,
    "endPage": 523,
    "totalAyas": 60
  },
  {
    "number": 52,
    "englishName": "At-Tur (The Mountain)",
    "arabicName": "الطور",
    "startPage": 523,
    "endPage": 525,
    "totalAyas": 49
  },
  {
    "number": 53,
    "englishName": "An-Najm (The Star)",
    "arabicName": "النجم",
    "startPage": 526,
    "endPage": 528,
    "totalAyas": 62
  },
  {
    "number": 54,
    "englishName": "Al-Qamar (The Moon)",
    "arabicName": "القمر",
    "startPage": 528,
    "endPage": 531,
    "totalAyas": 55
  },
  {
    "number": 55,
    "englishName": "Ar-Rahman (The Beneficent)",
    "arabicName": "الرحمن",
    "startPage": 531,
    "endPage": 534,
    "totalAyas": 78
  },
  {
    "number": 56,
    "englishName": "Al-Waqi'ah (The Inevitable)",
    "arabicName": "الواقعة",
    "startPage": 534,
    "endPage": 537,
    "totalAyas": 96
  },
  {
    "number": 57,
    "englishName": "Al-Hadid (The Iron)",
    "arabicName": "الحديد",
    "startPage": 537,
    "endPage": 541,
    "totalAyas": 29
  },
  {
    "number": 58,
    "englishName": "Al-Mujadila (The Pleading Women)",
    "arabicName": "المجادلة",
    "startPage": 542,
    "endPage": 545,
    "totalAyas": 22
  },
  {
    "number": 59,
    "englishName": "Al-Hashr (The Exile)",
    "arabicName": "الحشر",
    "startPage": 545,
    "endPage": 548,
    "totalAyas": 24
  },
  {
    "number": 60,
    "englishName": "Al-Mumtahanah (She That is to be Examined)",
    "arabicName": "الممتحنة",
    "startPage": 549,
    "endPage": 551,
    "totalAyas": 13
  },
  {
    "number": 61,
    "englishName": "As-Saff (The Ranks)",
    "arabicName": "الصف",
    "startPage": 551,
    "endPage": 552,
    "totalAyas": 14
  },
  {
    "number": 62,
    "englishName": "Al-Jumu'ah (Congregation Prayer)",
    "arabicName": "الجمعة",
    "startPage": 553,
    "endPage": 554,
    "totalAyas": 11
  },
  {
    "number": 63,
    "englishName": "Al-Munafiqun (The Hypocrites)",
    "arabicName": "المنافقون",
    "startPage": 554,
    "endPage": 555,
    "totalAyas": 11
  },
  {
    "number": 64,
    "englishName": "At-Taghabun (Mutual Disposession)",
    "arabicName": "التغابن",
    "startPage": 556,
    "endPage": 557,
    "totalAyas": 18
  },
  {
    "number": 65,
    "englishName": "At-Talaq (The Divorce)",
    "arabicName": "الطلاق",
    "startPage": 558,
    "endPage": 559,
    "totalAyas": 12
  },
  {
    "number": 66,
    "englishName": "At-Tahrim (The Prohibition)",
    "arabicName": "التحريم",
    "startPage": 560,
    "endPage": 561,
    "totalAyas": 12
  },
  {
    "number": 67,
    "englishName": "Al-Mulk (The Sovereignty)",
    "arabicName": "الملك",
    "startPage": 562,
    "endPage": 564,
    "totalAyas": 30
  },
  {
    "number": 68,
    "englishName": "Al-Qalam (The Pen)",
    "arabicName": "القلم",
    "startPage": 564,
    "endPage": 566,
    "totalAyas": 52
  },
  {
    "number": 69,
    "englishName": "Al-Haqqah (The Reality)",
    "arabicName": "الحاقة",
    "startPage": 566,
    "endPage": 568,
    "totalAyas": 52
  },
  {
    "number": 70,
    "englishName": "Al-Ma'arij (The Ascending Stairways)",
    "arabicName": "المعارج",
    "startPage": 568,
    "endPage": 570,
    "totalAyas": 44
  },
  {
    "number": 71,
    "englishName": "Nuh (Noah)",
    "arabicName": "نوح",
    "startPage": 570,
    "endPage": 571,
    "totalAyas": 28
  },
  {
    "number": 72,
    "englishName": "Al-Jinn (The Jinn)",
    "arabicName": "الجن",
    "startPage": 572,
    "endPage": 573,
    "totalAyas": 28
  },
  {
    "number": 73,
    "englishName": "Al-Muzzammil (The Enshrouded One)",
    "arabicName": "المزمل",
    "startPage": 574,
    "endPage": 575,
    "totalAyas": 20
  },
  {
    "number": 74,
    "englishName": "Al-Muddaththir (The Cloaked One)",
    "arabicName": "المدثر",
    "startPage": 575,
    "endPage": 577,
    "totalAyas": 56
  },
  {
    "number": 75,
    "englishName": "Al-Qiyamah (The Resurrection)",
    "arabicName": "القيامة",
    "startPage": 577,
    "endPage": 578,
    "totalAyas": 40
  },
  {
    "number": 76,
    "englishName": "Al-Insan (The Man)",
    "arabicName": "الإنسان",
    "startPage": 578,
    "endPage": 580,
    "totalAyas": 31
  },
  {
    "number": 77,
    "englishName": "Al-Mursalat (The Emissaries)",
    "arabicName": "المرسلات",
    "startPage": 580,
    "endPage": 581,
    "totalAyas": 50
  },
  {
    "number": 78,
    "englishName": "An-Naba (The Tidings)",
    "arabicName": "النبأ",
    "startPage": 582,
    "endPage": 583,
    "totalAyas": 40
  },
  {
    "number": 79,
    "englishName": "An-Nazi'at (Those who drag forth)",
    "arabicName": "النازعات",
    "startPage": 583,
    "endPage": 584,
    "totalAyas": 46
  },
  {
    "number": 80,
    "englishName": "Abasa (He Frowned)",
    "arabicName": "عبس",
    "startPage": 585,
    "endPage": 585,
    "totalAyas": 42
  },
  {
    "number": 81,
    "englishName": "At-Takwir (The Overthrowing)",
    "arabicName": "التكوير",
    "startPage": 586,
    "endPage": 586,
    "totalAyas": 29
  },
  {
    "number": 82,
    "englishName": "Al-Infitar (The Cleaving)",
    "arabicName": "الإنفطار",
    "startPage": 587,
    "endPage": 587,
    "totalAyas": 19
  },
  {
    "number": 83,
    "englishName": "Al-Mutaffifin (The Defrauding)",
    "arabicName": "المطففين",
    "startPage": 587,
    "endPage": 589,
    "totalAyas": 36
  },
  {
    "number": 84,
    "englishName": "Al-Inshiqaq (The Sundering)",
    "arabicName": "الإنشقاق",
    "startPage": 589,
    "endPage": 589,
    "totalAyas": 25
  },
  {
    "number": 85,
    "englishName": "Al-Buruj (The Mansions of the Stars)",
    "arabicName": "البروج",
    "startPage": 590,
    "endPage": 590,
    "totalAyas": 22
  },
  {
    "number": 86,
    "englishName": "At-Tariq (The Nightcommer)",
    "arabicName": "الطارق",
    "startPage": 591,
    "endPage": 591,
    "totalAyas": 17
  },
  {
    "number": 87,
    "englishName": "Al-Ala (The Most High)",
    "arabicName": "الأعلى",
    "startPage": 591,
    "endPage": 592,
    "totalAyas": 19
  },
  {
    "number": 88,
    "englishName": "Al-Ghashiyah (The Overwhelming)",
    "arabicName": "الغاشية",
    "startPage": 592,
    "endPage": 592,
    "totalAyas": 26
  },
  {
    "number": 89,
    "englishName": "Al-Fajr (The Dawn)",
    "arabicName": "الفجر",
    "startPage": 593,
    "endPage": 594,
    "totalAyas": 30
  },
  {
    "number": 90,
    "englishName": "Al-Balad (The City)",
    "arabicName": "البلد",
    "startPage": 594,
    "endPage": 594,
    "totalAyas": 20
  },
  {
    "number": 91,
    "englishName": "Ash-Shams (The Sun)",
    "arabicName": "الشمس",
    "startPage": 595,
    "endPage": 595,
    "totalAyas": 15
  },
  {
    "number": 92,
    "englishName": "Al-Lail (The Night)",
    "arabicName": "الليل",
    "startPage": 595,
    "endPage": 596,
    "totalAyas": 21
  },
  {
    "number": 93,
    "englishName": "Ad-Duha (The Morning Brightness)",
    "arabicName": "الضحى",
    "startPage": 596,
    "endPage": 596,
    "totalAyas": 11
  },
  {
    "number": 94,
    "englishName": "Ash-Sharh (The Expansion)",
    "arabicName": "الشرح",
    "startPage": 596,
    "endPage": 596,
    "totalAyas": 8
  },
  {
    "number": 95,
    "englishName": "At-Tin (The Fig)",
    "arabicName": "التين",
    "startPage": 597,
    "endPage": 597,
    "totalAyas": 8
  },
  {
    "number": 96,
    "englishName": "Al-Alaq (The Blood Clot)",
    "arabicName": "العلق",
    "startPage": 597,
    "endPage": 597,
    "totalAyas": 19
  },
  {
    "number": 97,
    "englishName": "Al-Qadr (The Power)",
    "arabicName": "القدر",
    "startPage": 598,
    "endPage": 598,
    "totalAyas": 5
  },
  {
    "number": 98,
    "englishName": "Al-Bayyina (The Evidence)",
    "arabicName": "البينة",
    "startPage": 598,
    "endPage": 599,
    "totalAyas": 8
  },
  {
    "number": 99,
    "englishName": "Az-Zalzalah (The Earthquake)",
    "arabicName": "الزلزلة",
    "startPage": 599,
    "endPage": 599,
    "totalAyas": 8
  },
  {
    "number": 100,
    "englishName": "Al-Adiyat (The Courser)",
    "arabicName": "العاديات",
    "startPage": 599,
    "endPage": 600,
    "totalAyas": 11
  },
  {
    "number": 101,
    "englishName": "Al-Qari'ah (The Calamity)",
    "arabicName": "القارعة",
    "startPage": 600,
    "endPage": 600,
    "totalAyas": 11
  },
  {
    "number": 102,
    "englishName": "At-Takathur (Vying for increase)",
    "arabicName": "التكاثر",
    "startPage": 600,
    "endPage": 600,
    "totalAyas": 8
  },
  {
    "number": 103,
    "englishName": "Al-Asr (The Declining Day)",
    "arabicName": "العصر",
    "startPage": 601,
    "endPage": 601,
    "totalAyas": 3
  },
  {
    "number": 104,
    "englishName": "Al-Humazah (The Slanderer)",
    "arabicName": "الهمزة",
    "startPage": 601,
    "endPage": 601,
    "totalAyas": 9
  },
  {
    "number": 105,
    "englishName": "Al-Fil (The Elephant)",
    "arabicName": "الفيل",
    "startPage": 601,
    "endPage": 601,
    "totalAyas": 5
  },
  {
    "number": 106,
    "englishName": "Quraysh (Quraish)",
    "arabicName": "قريش",
    "startPage": 602,
    "endPage": 602,
    "totalAyas": 4
  },
  {
    "number": 107,
    "englishName": "Al-Ma'un (The Small Kindness)",
    "arabicName": "الماعون",
    "startPage": 602,
    "endPage": 602,
    "totalAyas": 7
  },
  {
    "number": 108,
    "englishName": "Al-Kawthar (The Abundance)",
    "arabicName": "الكوثر",
    "startPage": 602,
    "endPage": 602,
    "totalAyas": 3
  },
  {
    "number": 109,
    "englishName": "Al-Kafirun (The Disbelievers)",
    "arabicName": "الكافرون",
    "startPage": 603,
    "endPage": 603,
    "totalAyas": 6
  },
  {
    "number": 110,
    "englishName": "An-Nasr (The Divine Support)",
    "arabicName": "النصر",
    "startPage": 603,
    "endPage": 603,
    "totalAyas": 3
  },
  {
    "number": 111,
    "englishName": "Al-Masad (The Palm Fiber)",
    "arabicName": "المسد",
    "startPage": 603,
    "endPage": 603,
    "totalAyas": 5
  },
  {
    "number": 112,
    "englishName": "Al-Ikhlas (The Sincerity)",
    "arabicName": "الإخلاص",
    "startPage": 604,
    "endPage": 604,
    "totalAyas": 4
  },
  {
    "number": 113,
    "englishName": "Al-Falaq (The Daybreak)",
    "arabicName": "الفلق",
    "startPage": 604,
    "endPage": 604,
    "totalAyas": 5
  },
  {
    "number": 114,
    "englishName": "An-Nas (The Mankind)",
    "arabicName": "الناس",
    "startPage": 604,
    "endPage": 604,
    "totalAyas": 6
  }
];

// Example usage:
// console.log(surahData[1]); // Logs data for Surah Al-Baqarah including pages and ayah count
```
--- END OF FILE surah-data.js.txt ---

--- START OF FILE reset.js.txt ---
```javascript
// reset.js

// Add a reset button functionality
function addResetButton() {
    const buttonsContainer = document.querySelector('.buttons-container');
    // Check if container exists and button doesn't already exist
    if (buttonsContainer && !document.getElementById('resetButton')) {
        const resetButton = document.createElement('button');
        resetButton.id = 'resetButton';
        // resetButton.style.backgroundColor = '#dc3545'; // Use CSS class instead if defined
        resetButton.classList.add('reset-button-style'); // Add a class for styling if needed
        resetButton.innerHTML = `
            مسح البيانات
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="18" height="18">
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
        `;
        // Add specific class for red color in CSS instead of inline style
        resetButton.style.backgroundColor = '#dc3545'; // Keep inline if no class is defined

        buttonsContainer.appendChild(resetButton);

        resetButton.addEventListener('click', function() {
            if (confirm('هل أنت متأكد من رغبتك في مسح جميع البيانات؟ هذا الإجراء لا يمكن التراجع عنه.')) {
                localStorage.removeItem('quranPageMarker'); // Clear storage

                // Reset global state variables
                window.pageCounter = 1; // Reset counter even if not used for marking
                window.pages = [];
                window.currentSurah = ''; // Reset selected Surah
                window.audioFileName = '';
                window.reciterName = '';
                window.selectedQiraat = '';
                window.selectedRawi = '';
                window.editingPageIndex = -1;


                // Reset UI elements
                const surahSelect = document.getElementById('surahSelect');
                if (surahSelect) surahSelect.value = '';

                const reciterInput = document.getElementById('reciterInput');
                 if (reciterInput) reciterInput.value = '';

                 const qiraatSelect = document.getElementById('qiraatSelect');
                 if (qiraatSelect) qiraatSelect.value = '';


                const fileNameDisplay = document.getElementById('fileName');
                if (fileNameDisplay) fileNameDisplay.textContent = '';

                const audio = document.getElementById('audio');
                if (audio) {
                    audio.src = '';
                    audio.load(); // Reset audio element state
                }
                 const currentTimeDisplay = document.getElementById('currentTimeDisplay');
                 if (currentTimeDisplay) currentTimeDisplay.textContent = '00:00.000';
                 const durationDisplay = document.getElementById('durationDisplay');
                 if (durationDisplay) durationDisplay.textContent = '00:00.000';
                 const audioSeeker = document.getElementById('audioSeeker');
                 if (audioSeeker) audioSeeker.value = 0;


                // *** Clear dynamic buttons ***
                const pageMarkingContainer = document.getElementById('pageMarkingContainer');
                if (pageMarkingContainer) {
                    pageMarkingContainer.innerHTML = '<p>الرجاء اختيار السورة لعرض أزرار الصفحات.</p>';
                }

                // Update page list display (will show empty state for the cleared Surah)
                if (typeof rebuildPageList === 'function') {
                     rebuildPageList();
                }

                 // Clear timeline
                 const timeline = document.getElementById('timeline');
                 if (timeline) timeline.innerHTML = '';


                // Show success message
                const successMessage = document.getElementById('successMessage');
                if (successMessage) {
                    successMessage.textContent = 'تم مسح جميع البيانات بنجاح!';
                    successMessage.style.display = 'block';
                    setTimeout(() => {
                        successMessage.style.display = 'none';
                    }, 2500);
                }
            }
        });
    }
}
```
--- END OF FILE reset.js.txt ---

--- START OF FILE qiraat-data.js.txt ---
```javascript
const qiraatData = [
  {
      "name": "نافع المدني",
      "details": "الإمام نافع المدني",
      "rawat": [
          {"name": "قالون", "details": ""},
          {"name": "ورش", "details": ""}
      ]
  },
  {
      "name": "ابن كثير المكي",
      "details": "الإمام ابن كثير المكي",
      "rawat": [
          {"name": "البزي", "details": ""},
          {"name": "قنبل", "details": ""}
      ]
  },
  {
      "name": "أبو عمرو البصري",
      "details": "الإمام أبو عمرو البصري",
      "rawat": [
          {"name": "الدوري", "details": ""},
          {"name": "السوسي", "details": ""}
      ]
  },
  {
      "name": "عبد الله بن عامر الشامي",
      "details": "الإمام عبد الله بن عامر الشامي",
      "rawat": [
          {"name": "هشام", "details": ""},
          {"name": "ابن ذكوان", "details": ""}
      ]
  },
  {
      "name": "عاصم الكوفي",
      "details": "الإمام عاصم الكوفي",
      "rawat": [
          {"name": "شعبة", "details": ""},
          {"name": "حفص", "details": ""}
      ]
  },
  {
      "name": "حمزة بن حبيب الزيات",
      "details": "الإمام حمزة بن حبيب الزيات",
      "rawat": [
          {"name": "خلف", "details": ""},
          {"name": "خلاد", "details": ""}
      ]
  },
  {
      "name": "الكسائي",
      "details": "الإمام الكسائي",
      "rawat": [
          {"name": "أبو الحارث", "details": ""},
          {"name": "الدوري", "details": ""}
      ]
  },
  {
      "name": "أبو جعفر المدني",
      "details": "الإمام أبو جعفر المدني",
      "rawat": [
          {"name": "ابن وردان", "details": ""},
          {"name": "ابن جماز", "details": ""}
      ]
  },
  {
      "name": "يعقوب الحضرمي",
      "details": "الإمام يعقوب الحضرمي",
      "rawat": [
          {"name": "رويس", "details": ""},
          {"name": "روح", "details": ""}
      ]
  },
  {
      "name": "خلف بن هشام",
      "details": "الإمام خلف بن هشام",
      "rawat": [
          {"name": "إسحاق", "details": ""},
          {"name": "إدريس", "details": ""}
      ]
  }
];
```
--- END OF FILE qiraat-data.js.txt ---

--- START OF FILE page-list-management.js.txt ---
```javascript
// js/page-list-management.js

// Rebuild entire page list based on SELECTED SURAH
function rebuildPageList() {
    const pageList = document.getElementById('pageList');
    if (!pageList) return;

    pageList.innerHTML = ''; // Clear previous list

    // Ensure global variables exist
    if (typeof window.pages === 'undefined' || typeof window.currentSurah === 'undefined' || typeof surahData === 'undefined') {
        console.error("rebuildPageList: Global variables (pages, currentSurah, surahData) are not defined.");
        pageList.innerHTML = '<div class="empty-state">خطأ: بيانات التطبيق غير متاحة.</div>';
        return;
    }

    const selectedSurahNumber = parseInt(window.currentSurah);

    // If no Surah is selected, show the initial message
    if (isNaN(selectedSurahNumber) || selectedSurahNumber <= 0) {
        pageList.innerHTML = '<div class="empty-state">اختر سورة لعرض صفحاتها</div>';
        return;
    }

    // Find the data for the selected Surah
    const currentSurahInfo = surahData.find(s => s.number === selectedSurahNumber);

    if (!currentSurahInfo) {
        console.error(`rebuildPageList: Could not find data for Surah number ${selectedSurahNumber}.`);
        pageList.innerHTML = `<div class="empty-state">خطأ: لم يتم العثور على بيانات السورة ${selectedSurahNumber}.</div>`;
        return;
    }

    // Loop through all pages of the selected Surah
    for (let pageNum = currentSurahInfo.startPage; pageNum <= currentSurahInfo.endPage; pageNum++) {
        const li = document.createElement('li');
        li.dataset.page = pageNum; // Add page number to li for potential styling/selection

        // Find if this page has been marked (exists in the global pages array)
        // IMPORTANT: Find the INDEX in the *original* array for the edit button data attribute
        const markedPageIndex = window.pages.findIndex(p => p.surahNumber === selectedSurahNumber && p.page === pageNum);
        const markedPageData = markedPageIndex !== -1 ? window.pages[markedPageIndex] : null;

        let timeDisplayHTML;
        let actionButtonsHTML = ''; // No buttons for unmarked pages

        if (markedPageData) {
            // Page is marked
            li.classList.add('marked-row');
            li.title = `صفحة ${pageNum} محددة`; // Tooltip for marked rows
            timeDisplayHTML = `
                <span class="time-label">البدء:</span>
                <span class="time-value start-time" title="وقت البدء">${markedPageData.startTimeFormatted || 'N/A'}</span>
                <span class="time-separator"> - </span>
                 <span class="time-label">الانتهاء:</span>
                <span class="time-value end-time" title="وقت الانتهاء">${markedPageData.endTimeFormatted || 'N/A'}</span>
            `;
            // Generate buttons ONLY for marked pages, using the correct index from window.pages
            actionButtonsHTML = `
                <button class="edit-button" data-index="${markedPageIndex}" title="تعديل أوقات هذه الصفحة">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                         <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                         <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                </button>
                <button class="delete-btn" data-page="${pageNum}" data-surah="${selectedSurahNumber}" title="حذف علامة هذه الصفحة">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M3 6h18"></path>
                        <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"></path>
                        <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                </button>
            `;
        } else {
            // Page is unmarked
            li.classList.add('unmarked-row');
             li.title = `صفحة ${pageNum} غير محددة`; // Tooltip for unmarked rows
            timeDisplayHTML = `
                <span class="time-placeholder start-time">--:--.---</span>
                <span class="time-separator"> - </span>
                <span class="time-placeholder end-time">--:--.---</span>
            `;
            // No action buttons for unmarked pages
        }

        // Construct the list item's inner HTML
        li.innerHTML = `
            <div class="page-info">
                <span class="page-number">${pageNum}</span>
                <!-- Removed Surah info here as it's contextually known -->
            </div>
            <div class="time-display">
                ${timeDisplayHTML}
            </div>
            <div class="action-buttons">
                 ${actionButtonsHTML}
            </div>
        `;
        pageList.appendChild(li);
    }

    // Add event listeners AFTER creating all elements
    // Listeners will only attach to buttons that exist (i.e., on marked rows)
    attachListButtonListeners();
}

// Function to attach listeners to buttons in the list (Edit/Delete)
function attachListButtonListeners() {
    document.querySelectorAll('#pageList .delete-btn').forEach(btn => {
        // Remove existing listener before adding new one to prevent duplicates
        btn.removeEventListener('click', handleDeleteClick);
        btn.addEventListener('click', handleDeleteClick);
    });

    document.querySelectorAll('#pageList .edit-button').forEach(btn => {
         // Remove existing listener
         btn.removeEventListener('click', handleEditClick);
        btn.addEventListener('click', handleEditClick);
    });
}

// Handler for delete button click
function handleDeleteClick(event) {
    event.stopPropagation();
    const button = event.currentTarget;
    const pageToDelete = parseInt(button.getAttribute('data-page'));
    const surahToDelete = parseInt(button.getAttribute('data-surah'));
    if (!isNaN(pageToDelete) && !isNaN(surahToDelete)) {
        deletePage(pageToDelete, surahToDelete); // Pass Surah number for accurate deletion
    } else {
        console.error("Delete button missing page or surah data attribute.");
    }
}

// Handler for edit button click
function handleEditClick(event) {
    event.stopPropagation();
    const button = event.currentTarget;
    const index = parseInt(button.getAttribute('data-index')); // Get the index from window.pages
    if (!isNaN(index) && typeof showStartEndTimeEditor === 'function') {
        showStartEndTimeEditor(index); // Call the editor function with the correct index
    } else {
         console.error("Edit button missing index or showStartEndTimeEditor function not found.");
    }
}


// --- MODIFIED Delete a page marker ---
function deletePage(pageNumber, surahNumber) {
    // Find the index based on BOTH page and surah number for accuracy
    const indexToDelete = window.pages.findIndex(p => p.page === pageNumber && p.surahNumber === surahNumber);

    if (indexToDelete !== -1) {
        console.log(`Deleting page ${pageNumber} for Surah ${surahNumber} at index ${indexToDelete}`);
        // Remove from array
        window.pages.splice(indexToDelete, 1);

        // Update storage
        if (typeof saveToLocalStorage === 'function') saveToLocalStorage();

        // Rebuild the list to reflect the change (row will become unmarked)
        if (typeof rebuildPageList === 'function') rebuildPageList();

        // Re-enable the corresponding dynamic button in the top section
        const pageMarkingContainer = document.getElementById('pageMarkingContainer');
        if (pageMarkingContainer) {
            const buttonToEnable = pageMarkingContainer.querySelector(
                `button.page-mark-button[data-page="${pageNumber}"][data-surah="${surahNumber}"]`
            );
            if (buttonToEnable) {
                buttonToEnable.disabled = false;
                buttonToEnable.classList.remove('marked');
                buttonToEnable.title = `تحديد نهاية صفحة ${pageNumber}`; // Reset title
                console.log(`Re-enabled button for Surah ${surahNumber}, Page ${pageNumber}`);
            } else {
                 console.warn(`Could not find button to re-enable for Surah ${surahNumber}, Page ${pageNumber}`);
            }
        }

        // Update timeline
        const audio = document.getElementById('audio');
        if (audio && typeof window.renderTimeline === 'function') {
            window.renderTimeline(audio, window.pages);
        }

        // Success message
        const successMessage = document.getElementById('successMessage');
        if (successMessage) {
            successMessage.textContent = `تم حذف علامة صفحة ${pageNumber} (سورة ${surahNumber}) بنجاح`;
            successMessage.style.display = 'block';
            setTimeout(() => { successMessage.style.display = 'none'; }, 2000);
        }
    } else {
         console.warn(`Could not find page ${pageNumber} for Surah ${surahNumber} to delete.`);
    }
}

// updatePageList function is no longer needed as rebuildPageList handles updates.
```
--- END OF FILE page-list-management.js.txt ---

--- START OF FILE local-storage.js.txt ---
```javascript
// js/local-storage.js - Check variable scope and structure handling

// Function to save current state to localStorage
function saveToLocalStorage() {
    // Ensure global variables exist and are being saved
    const data = {
        currentSurah: window.currentSurah || '', // Surah number string
        pageCounter: window.pageCounter || 1, // Still useful? Keep for now.
        pages: window.pages || [], // Saves the array with {startTime, endTime, ...}
        audioFileName: window.audioFileName || '',
        reciterName: window.reciterName || '',
        // Save the combined Qiraat-Rawi string for easier dropdown restoration
        selectedQiraat: (window.selectedQiraat && window.selectedRawi)
                       ? `${window.selectedQiraat} - ${window.selectedRawi}`
                       : window.selectedQiraat || '',
    };
    try {
         localStorage.setItem('quranPageMarker', JSON.stringify(data));
         // console.log("Saved to localStorage:", data);
    } catch (e) {
         console.error("Error saving to localStorage:", e);
         // Handle potential storage quota errors
         alert("حدث خطأ أثناء حفظ البيانات. قد تكون مساحة التخزين ممتلئة.");
    }
}

// Function to load data from localStorage
function loadFromLocalStorage() {
    const storedData = localStorage.getItem('quranPageMarker');
    if (storedData) {
        try {
            const data = JSON.parse(storedData);
            console.log("Loaded from localStorage:", data);

            // Restore global state variables
            window.pageCounter = data.pageCounter || 1;
            // Basic validation/migration for pages structure
            window.pages = (data.pages || []).map(p => ({
                page: parseInt(p.page) || 0,
                surahNumber: parseInt(p.surahNumber) || 0,
                startTime: parseFloat(p.startTime) || 0,
                endTime: parseFloat(p.endTime) || (parseFloat(p.time) || 0), // Fallback for old structure
                startTimeFormatted: p.startTimeFormatted || (typeof formatTimeWithMs === 'function' ? formatTimeWithMs(p.startTime || 0) : '00:00.000'),
                endTimeFormatted: p.endTimeFormatted || (typeof formatTimeWithMs === 'function' ? formatTimeWithMs(p.endTime || (p.time || 0)) : '00:00.000') // Fallback for old structure
            })).filter(p => p.page > 0 && p.surahNumber > 0); // Filter invalid entries

            window.currentSurah = data.currentSurah || ''; // Surah number string
            window.audioFileName = data.audioFileName || '';
            window.reciterName = data.reciterName || ''; // Load directly from main data
            const loadedQiraatRawi = data.selectedQiraat || '';

             // Set global qiraat/rawi variables from combined string
             if (loadedQiraatRawi.includes(' - ')) {
                 [window.selectedQiraat, window.selectedRawi] = loadedQiraatRawi.split(' - ');
             } else {
                 window.selectedQiraat = loadedQiraatRawi;
                 window.selectedRawi = '';
             }

            // --- UI Elements will be updated in app-initialization.js after this runs ---

            console.log("Successfully loaded and parsed data from localStorage.");
            // Return true to indicate data was loaded
            return true;

        } catch (e) {
            console.error("Error parsing data from localStorage:", e);
            localStorage.removeItem('quranPageMarker'); // Clear corrupted data
            // Reset to default state
             window.pages = [];
             window.currentSurah = '';
             window.audioFileName = '';
             window.reciterName = '';
             window.selectedQiraat = '';
             window.selectedRawi = '';
             console.log("Cleared corrupted localStorage data and reset state.");
             return false;
        }
    }
    // Return false if no data was found
    console.log("No data found in localStorage.");
    return false;
}
```
--- END OF FILE local-storage.js.txt ---

--- START OF FILE exportSetting.js.txt ---
```javascript
// Export settings function (Exports JSON representation of state)
function exportSettings() {
    // Use global state variables directly
    const data = {
        pages: window.pages || [],
        currentSurah: window.currentSurah || '',
        reciterName: window.reciterName || '',
        selectedQiraat: (window.selectedQiraat && window.selectedRawi)
                       ? `${window.selectedQiraat} - ${window.selectedRawi}`
                       : window.selectedQiraat || '',
        audioFileName: window.audioFileName || '',
        // pageCounter is likely redundant now, but include if needed elsewhere
        pageCounter: window.pageCounter || 1,
    };

    // Ensure pages data is clean (optional, but good practice)
    data.pages = data.pages.map(p => ({
        page: p.page,
        surahNumber: p.surahNumber,
        startTime: p.startTime,
        endTime: p.endTime,
        startTimeFormatted: p.startTimeFormatted,
        endTimeFormatted: p.endTimeFormatted
    }));


    const json = JSON.stringify(data, null, 2); // Pretty print JSON
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;

    // Construct a more informative filename
     const surahInfo = typeof surahData !== 'undefined' && window.currentSurah
                      ? surahData.find(s => s.number === parseInt(window.currentSurah))
                      : null;
     const filenameSurahPart = surahInfo ? `${surahInfo.number}_${surahInfo.englishName.replace(/[^a-z0-9]/gi, '_')}` : 'Surah_Unknown';
     const filenameReciterPart = (window.reciterName || 'Reciter').replace(/[^a-z0-9]/gi, '_');

    link.download = `QuranMarker_${filenameSurahPart}_${filenameReciterPart}_settings.json`; // Set the download filename
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url); // Clean up blob URL

    // Show success message
     const successMessage = document.getElementById('successMessage');
     if (successMessage) {
         successMessage.textContent = 'تم تصدير ملف الإعدادات (JSON) بنجاح!';
         successMessage.style.display = 'block';
         setTimeout(() => { successMessage.style.display = 'none'; }, 3000);
     }
}

// Attach listener to the correct EXPORT button (assuming it's for JSON settings)
// If #exportButton is for CSV, create a new button for JSON export
// Let's assume there's a JSON export button with id 'exportJsonButton'
const exportJsonBtn = document.getElementById('exportJsonButton'); // Change ID if different
if (exportJsonBtn) {
    exportJsonBtn.addEventListener('click', exportSettings);
} else {
    console.warn("JSON Export button (#exportJsonButton) not found.");
    // If you want the main #exportButton to export JSON instead of CSV, attach here:
    // document.getElementById('exportButton').addEventListener('click', exportSettings);
}

// NOTE: The original exportSetting.js seemed to be duplicating the import/export button functionality
// already present in csv-export.js. This version focuses *only* on exporting the JSON settings.
// The import functionality is handled in csv-export.js (which also handles CSV export).
// Ensure your HTML has the correct button IDs.
```
--- END OF FILE exportSetting.js.txt ---

--- START OF FILE dynamic-page-buttons.js.txt ---
```javascript
// js/dynamic-page-buttons.js

// Assumes global vars: surahData, pages, formatTimeWithMs, saveToLocalStorage, rebuildPageList, renderTimeline

document.addEventListener('DOMContentLoaded', function() {
    const surahSelect = document.getElementById('surahSelect');
    const pageMarkingContainer = document.getElementById('pageMarkingContainer');
    const audio = document.getElementById('audio');

    if (!surahSelect || !pageMarkingContainer || !audio) {
        console.error("Dynamic buttons: Required elements not found.");
        return;
    }
    if (typeof surahData === 'undefined') {
        console.error("Dynamic buttons: surahData not defined.");
        return;
    }
    if (typeof window.pages === 'undefined') {
        // Initialize if somehow missed (should be done in app-initialization)
        console.warn("Dynamic buttons: Global `pages` array not defined, initializing.");
        window.pages = [];
    }

    // Listen for Surah changes to generate the marking buttons
    surahSelect.addEventListener('change', generateButtons);

    // Function to generate the "Mark Page X" buttons
    function generateButtons() {
        const selectedSurahValue = surahSelect.value;
        pageMarkingContainer.innerHTML = ''; // Clear previous buttons

        if (!selectedSurahValue) {
            pageMarkingContainer.innerHTML = '<p>الرجاء اختيار السورة لعرض أزرار تحديد الصفحات.</p>';
            return;
        }

        const selectedSurahNumber = parseInt(selectedSurahValue);
        const surah = surahData.find(s => s.number === selectedSurahNumber);

        if (surah) {
            console.log(`Generating mark buttons for Surah ${selectedSurahNumber} (Pages ${surah.startPage}-${surah.endPage})`);
            for (let pageNum = surah.startPage; pageNum <= surah.endPage; pageNum++) {
                const button = document.createElement('button');
                button.textContent = `تحديد نهاية صفحة ${pageNum}`; // More descriptive text
                button.classList.add('page-mark-button');
                button.dataset.page = pageNum;
                button.dataset.surah = selectedSurahNumber;

                // Check if this page is *already* marked in the global pages array
                const existingMark = window.pages.find(p => p.surahNumber === selectedSurahNumber && p.page === pageNum);
                if (existingMark) {
                   button.disabled = true;
                   // Display start/end time on hover for marked buttons
                   button.title = `مُحددة بالفعل: ${existingMark.startTimeFormatted} - ${existingMark.endTimeFormatted}`;
                   button.classList.add('marked'); // Add 'marked' class for styling
                } else {
                    button.title = `تحديد نهاية صفحة ${pageNum}`; // Default title
                }

                button.addEventListener('click', handlePageMarkClick);
                pageMarkingContainer.appendChild(button);
            }
        } else {
             pageMarkingContainer.innerHTML = `<p>بيانات السورة رقم ${selectedSurahNumber} غير موجودة.</p>`;
             console.error(`Data for Surah ${selectedSurahNumber} not found in surahData.`);
        }
    }


    // Handler when a "Mark Page X" button is clicked
    function handlePageMarkClick(event) {
         const button = event.target;
         const pageNum = parseInt(button.dataset.page);
         const surahNum = parseInt(button.dataset.surah);
         const audio = document.getElementById('audio');

         if (!audio || !audio.src || audio.readyState < 1 /* HAVE_NOTHING or HAVE_METADATA */ ) {
             alert('الرجاء اختيار ملف صوتي صالح وتشغيله أولاً');
             console.warn("Page mark prevented: Audio not ready or no source.");
             return;
         }
          if (isNaN(audio.duration) || audio.duration <= 0) {
             alert('مدة الملف الصوتي غير متاحة أو غير صالحة.');
             console.warn("Page mark prevented: Invalid audio duration.");
             return;
         }

         // Double-check if already marked (should be disabled, but good practice)
         if (window.pages.some(p => p.surahNumber === surahNum && p.page === pageNum)) {
            console.warn(`Page ${pageNum} for Surah ${surahNum} already marked. Ignoring click.`);
            button.disabled = true; // Ensure it's disabled
            button.classList.add('marked');
            return;
         }

         const currentAudioTime = audio.currentTime;
         let calculatedStartTime = 0.0;

         // --- Determine Start Time ---
         // Find the latest end time of a previously marked page *for this Surah*
         // Sort marked pages for THIS surah by page number to reliably find the immediate predecessor
         const pagesForThisSurah = window.pages
             .filter(p => p.surahNumber === surahNum)
             .sort((a, b) => a.page - b.page);

         let previousPage = null;
         for(let i = pagesForThisSurah.length - 1; i >= 0; i--) {
             if (pagesForThisSurah[i].page < pageNum) {
                 previousPage = pagesForThisSurah[i];
                 break; // Found the immediately preceding marked page
             }
         }

         if (previousPage) {
             // Start time is the end time of the previous marked page
             calculatedStartTime = previousPage.endTime || 0; // Use 0 if endTime is somehow undefined
             console.log(`Found previous page ${previousPage.page}, setting start time for page ${pageNum} to its end time: ${calculatedStartTime}`);
         } else {
              // No preceding page found *marked for this surah*, it's the first one marked (or first overall)
              // Set start time to 0.
              calculatedStartTime = 0.0;
              console.log(`No previous page found marked for Surah ${surahNum} before page ${pageNum}. Setting start time to 0.`);
         }
         // --- End Start Time Determination ---


         // Ensure end time is not before start time (can happen with rapid clicks)
         const calculatedEndTime = Math.max(currentAudioTime, calculatedStartTime);
         if (calculatedEndTime < calculatedStartTime) {
             // This case should ideally not happen with Math.max, but log if it does
             console.error(`Logic Error: Calculated End Time (${calculatedEndTime}) is less than Start Time (${calculatedStartTime}) for page ${pageNum}.`);
             // Potentially fallback or alert user
             return; // Prevent adding invalid data
         }
          if (calculatedEndTime !== currentAudioTime) {
             console.warn(`Adjusted calculated end time from ${currentAudioTime} to ${calculatedEndTime} for page ${pageNum} to ensure it's not before start time.`);
         }

         // Ensure times are numbers before formatting
         const finalStartTime = Number(calculatedStartTime.toFixed(3));
         const finalEndTime = Number(calculatedEndTime.toFixed(3));

         if (isNaN(finalStartTime) || isNaN(finalEndTime)) {
             console.error(`Invalid time calculation: Start=${finalStartTime}, End=${finalEndTime}. Aborting mark.`);
             alert("حدث خطأ في حساب الوقت. لم يتم تحديد الصفحة.");
             return;
         }


         const startTimeFormatted = typeof formatTimeWithMs === 'function' ? formatTimeWithMs(finalStartTime) : finalStartTime.toString();
         const endTimeFormatted = typeof formatTimeWithMs === 'function' ? formatTimeWithMs(finalEndTime) : finalEndTime.toString();

         // Add the new page segment object to the global array
         window.pages.push({
             page: pageNum,
             surahNumber: surahNum,
             startTime: finalStartTime,
             endTime: finalEndTime,
             startTimeFormatted: startTimeFormatted,
             endTimeFormatted: endTimeFormatted
         });

         // Sort pages array globally (important for consistency if order matters elsewhere)
         // Sorting by Surah then Page is crucial for finding the previous page correctly
         window.pages.sort((a, b) => {
            if (a.surahNumber !== b.surahNumber) return a.surahNumber - b.surahNumber;
            return a.page - b.page; // Sort by page number within the same Surah
            // return a.startTime - b.startTime; // Fallback sort by time if pages were equal (shouldn't happen for same surah)
         });

         console.log(`Marked Page ${pageNum} (Surah ${surahNum}): ${startTimeFormatted} - ${endTimeFormatted}`);

         // --- Update UI ---
         // 1. Update the list display (rebuildPageList will now show this page as marked)
         if (typeof rebuildPageList === 'function') rebuildPageList(); else console.error("handlePageMarkClick: rebuildPageList not found");
         // 2. Save the updated pages array to localStorage
         if (typeof saveToLocalStorage === 'function') saveToLocalStorage(); else console.error("handlePageMarkClick: saveToLocalStorage not found");
         // 3. Update the timeline visualization
         if (typeof window.renderTimeline === 'function') window.renderTimeline(audio, window.pages); else console.error("handlePageMarkClick: renderTimeline not found");


         // Update the clicked button's state
         button.disabled = true;
         button.title = `مُحددة: ${startTimeFormatted} - ${endTimeFormatted}`;
         button.classList.add('marked');

         // Success message
         const successMessage = document.getElementById('successMessage');
         if (successMessage) {
             successMessage.textContent = `تم تحديد نهاية صفحة ${pageNum} (السورة ${surahNum}) بنجاح!`;
             successMessage.style.display = 'block';
             setTimeout(() => { successMessage.style.display = 'none'; }, 2500);
         }
    }

    // Initial generation of buttons might be triggered by app-initialization.js
    // after loading state and setting the surahSelect value.
    // The 'change' event listener on surahSelect handles subsequent user selections.
});
```
--- END OF FILE dynamic-page-buttons.js.txt ---

--- START OF FILE dropdowns.js.txt ---
```javascript
// dropdowns.js

// Function to populate the Surah dropdown
function setupSurahDropdown() {
    const surahSelect = document.getElementById('surahSelect');
    if (!surahSelect) {
        console.error("Surah select element (#surahSelect) not found.");
        return;
    }
    // Clear existing options first
    surahSelect.innerHTML = '<option value="">اختر سورة</option>';

    // Ensure surahData is available
    if (typeof surahData === 'undefined') {
        console.error("surahData is not defined. Make sure surah-data.js is loaded before dropdowns.js");
        return;
    }

    surahData.forEach(surah => {
        const option = document.createElement('option');
        // Use surah.number as the value for consistency
        option.value = surah.number;
        // Keep the text descriptive
        option.textContent = `${surah.number} - ${surah.englishName} (${surah.arabicName}) [صفحات ${surah.startPage}-${surah.endPage}]`; // Added page range
        surahSelect.appendChild(option);
    });

    // Remove any previous listener to avoid duplication if this function is called multiple times
    surahSelect.removeEventListener('change', handleSurahChange);
    // Add the single listener
    surahSelect.addEventListener('change', handleSurahChange);
}

// Handler function for Surah selection change
function handleSurahChange() {
    // 'this' refers to the select element
    const selectedValue = this.value; // This will now be the Surah number as a string

    // Ensure global currentSurah exists (should be defined in app-initialization.js)
    if (typeof window.currentSurah !== 'undefined') {
        if (window.currentSurah !== selectedValue) {
            console.log(`Surah changed to: ${selectedValue}`);
            window.currentSurah = selectedValue;

            // Trigger saving state
            if (typeof saveToLocalStorage === 'function') {
                saveToLocalStorage();
            } else {
                console.warn("saveToLocalStorage function not found when handling Surah change.");
            }

            // *** CRUCIAL: Rebuild the page list based on the NEWLY selected Surah ***
            if (typeof rebuildPageList === 'function') {
                 rebuildPageList();
            } else {
                 console.error("rebuildPageList function not found when handling Surah change.");
            }

            // Note: The dynamic page *marking* buttons are generated by a separate listener
            // in dynamic-page-buttons.js which also listens for this 'change' event.
        }
    } else {
        console.error("Global 'currentSurah' variable not initialized!");
    }
}


// --- MODIFIED Function to add/manage reciter input field ---
function addReciterInput() {
    let reciterInputElement = document.getElementById('reciterInput'); // Try to find existing element first

    // If the input element doesn't exist in the DOM yet
    if (!reciterInputElement) {
        console.log("Creating reciter input element.");
        const formGroup = document.createElement('div');
        formGroup.className = 'form-group'; // Standard form group class

        const label = document.createElement('label');
        label.setAttribute('for', 'reciterInput');
        label.textContent = 'اسم القارئ'; // Label text

        // Create the input element and assign it to our variable
        reciterInputElement = document.createElement('input');
        reciterInputElement.setAttribute('type', 'text');
        reciterInputElement.setAttribute('id', 'reciterInput');
        reciterInputElement.setAttribute('placeholder', 'أدخل اسم القارئ (اختياري)'); // Placeholder text

        formGroup.appendChild(label);
        formGroup.appendChild(reciterInputElement);

        // Find the Surah select element's group to insert after it
        const surahSelectGroup = document.getElementById('surahSelect')?.closest('.form-group');

        if (surahSelectGroup && surahSelectGroup.parentNode) {
            // Insert the new group after the Surah group
            surahSelectGroup.parentNode.insertBefore(formGroup, surahSelectGroup.nextSibling);
            console.log("Inserted reciter input after Surah select group.");
        } else {
            // Fallback: Append to the main card if the Surah group isn't found structured as expected
             console.warn("Surah select group not found or has no parent, attempting fallback insertion.");
             const mainCard = document.querySelector('.container > .card:first-of-type'); // Target the first card
             if (mainCard) {
                 // Try inserting before the Qiraat select group
                 const qiraatSelectGroup = mainCard.querySelector('#qiraatSelect')?.closest('.form-group');
                 if (qiraatSelectGroup) {
                     mainCard.insertBefore(formGroup, qiraatSelectGroup);
                     console.log("Fallback: Inserted reciter input before Qiraat select group.");
                 } else {
                     // Append as last resort
                     mainCard.appendChild(formGroup);
                     console.log("Fallback: Appended reciter input to main card.");
                 }
             } else {
                  console.error("Cannot find suitable location to insert Reciter input.");
             }
        }
    } else {
         console.log("Reciter input element already exists.");
    }

    // --- Apply value and listener AFTER ensuring the element exists ---
    if (reciterInputElement) {
        // Ensure global reciterName is accessible (should be defined in app-initialization.js)
        if (typeof window.reciterName === 'undefined') {
            console.warn("Global 'reciterName' variable is not initialized! Initializing to empty string.");
             window.reciterName = '';
        }

        // Set value from the global variable (which should be loaded from storage)
        reciterInputElement.value = window.reciterName;

        // Remove any potential existing listener to prevent duplicates
        reciterInputElement.removeEventListener('input', handleReciterInput);
        // Add the event listener using a named function
        reciterInputElement.addEventListener('input', handleReciterInput);

    } else {
        console.error("Failed to find or create the reciter input element (#reciterInput).");
    }
}

// --- Define the event handler function separately for reciter input ---
function handleReciterInput() {
    // 'this' refers to the input element that triggered the event
    // Ensure global reciterName variable exists and update it
    if (typeof window.reciterName !== 'undefined') {
        window.reciterName = this.value;
        // Update localStorage directly AND call saveToLocalStorage for consistency
        // localStorage.setItem('reciterName', window.reciterName); // saveToLocalStorage should handle this
        if (typeof saveToLocalStorage === 'function') {
             saveToLocalStorage(); // Save the entire state including the new reciter name
        }
    } else {
        console.error("Global 'reciterName' not defined during input event.");
    }
}


// Function to populate the Qira'at dropdown with Rawat
function setupQiraatDropdown() {
    const qiraatSelect = document.getElementById('qiraatSelect');
    if (!qiraatSelect) {
         console.error("Qiraat select element (#qiraatSelect) not found.");
         return;
    }
    // Clear existing options
    qiraatSelect.innerHTML = '<option value="">اختر القراءة / الراوي (اختياري)</option>'; // Added optional note

    // Ensure qiraatData is available
    if (typeof qiraatData === 'undefined') {
        console.error("qiraatData is not defined. Make sure qiraat-data.js is loaded before dropdowns.js");
        return;
    }

    qiraatData.forEach(qiraat => {
        // Add the Qira'at itself as an option (treat it as a group header, might make it disabled)
        const qiraatOption = document.createElement('option');
        qiraatOption.value = qiraat.name; // Store only the Qira'at name
        qiraatOption.textContent = `${qiraat.name} (قراءة)`;
        qiraatOption.setAttribute('data-type', 'qiraat');
        // qiraatOption.disabled = true; // Optional: make the Qira'at name unselectable if desired
        qiraatSelect.appendChild(qiraatOption);

        // Add each Rawi as a separate, selectable option under the Qira'at
        qiraat.rawat.forEach(rawi => {
            const rawiOption = document.createElement('option');
            rawiOption.value = `${qiraat.name} - ${rawi.name}`; // Store "Qira'at - Rawi"
            rawiOption.textContent = `  - ${rawi.name} (راوي)`; // Indent Rawi
            rawiOption.setAttribute('data-type', 'rawi');
            qiraatSelect.appendChild(rawiOption);
        });
    });

    // Remove any previous listener
    qiraatSelect.removeEventListener('change', handleQiraatChange);
    // Add the single listener
    qiraatSelect.addEventListener('change', handleQiraatChange);
}

// Handler function for Qira'at/Rawi selection change
function handleQiraatChange() {
     // 'this' refers to the select element
    const selectedValue = this.value.trim();

    // Ensure global variables exist
    if (typeof window.selectedQiraat === 'undefined') window.selectedQiraat = '';
    if (typeof window.selectedRawi === 'undefined') window.selectedRawi = '';

    let qiraatChanged = false;

    // Determine new values and check if they differ from current global state
    let newQiraat = '';
    let newRawi = '';
    if (selectedValue.includes(' - ')) {
        [newQiraat, newRawi] = selectedValue.split(' - ');
    } else if (selectedValue !== '') {
        newQiraat = selectedValue;
        newRawi = '';
    }

    if (window.selectedQiraat !== newQiraat || window.selectedRawi !== newRawi) {
        qiraatChanged = true;
        window.selectedQiraat = newQiraat;
        window.selectedRawi = newRawi;
        console.log(`Qiraat/Rawi changed: Qiraat='${window.selectedQiraat}', Rawi='${window.selectedRawi}'`);
    }

    // Trigger saving state only if something actually changed
    if (qiraatChanged && typeof saveToLocalStorage === 'function') {
        saveToLocalStorage();
    } else if (qiraatChanged) {
        console.warn("saveToLocalStorage function not found when handling Qiraat change.");
    }
}
```
--- END OF FILE dropdowns.js.txt ---

--- START OF FILE csv-export.js.txt ---
```javascript
// js/csv-export.js

// Export button functionality (CSV)
const exportCsvButton = document.getElementById('exportCsvButton'); // Assuming specific button ID for CSV
if (exportCsvButton) {
    exportCsvButton.addEventListener('click', function() {
        // Get metadata from inputs/globals
        const selectedSurahNumber = parseInt(window.currentSurah);
        const reciterNameValue = window.reciterName || 'Reciter';
        const fileQiraat = window.selectedQiraat || 'Not Set';
        const fileRawi = window.selectedRawi || 'Not Set';

        // Ensure global pages array exists and filter for the current Surah
        if (typeof window.pages === 'undefined') {
            alert('لا توجد بيانات صفحات معرفة.');
            return;
        }

        const pagesForCurrentSurah = window.pages.filter(p => p.surahNumber === selectedSurahNumber);

        if (pagesForCurrentSurah.length === 0) {
            alert(`لا توجد صفحات محددة للسورة المختارة (${selectedSurahNumber}) لتصديرها.`);
            return;
        }

        // Find Surah info for metadata row (optional but nice)
        const surahInfo = typeof surahData !== 'undefined' ? surahData.find(s => s.number === selectedSurahNumber) : null;
        const surahName = surahInfo ? surahInfo.englishName : `Surah_${selectedSurahNumber}`;
        const arabicName = surahInfo ? surahInfo.arabicName : '';
        const startPage = surahInfo ? surahInfo.startPage : 'N/A';
        const endPage = surahInfo ? surahInfo.endPage : 'N/A';
        const totalAyas = surahInfo ? surahInfo.totalAyas : 'N/A';


        // Sort pages by Page number for logical CSV output
        const sortedPagesForExport = pagesForCurrentSurah.sort((a, b) => a.page - b.page);

        // CSV Header - More specific
        let csvContent = `"Surah Name (En)","Surah Name (Ar)","Surah No.","Reciter","Qiraat","Rawi","Surah Start Page","Surah End Page","Total Ayas"\n`;
        // Add metadata row
         csvContent += `"${surahName}","${arabicName}","${selectedSurahNumber}","${reciterNameValue}","${fileQiraat}","${fileRawi}","${startPage}","${endPage}","${totalAyas}"\n\n`;
         // Add data header
         csvContent += `"Marked Page #","Start Time (s)","End Time (s)","Start Time (MM:SS.mmm)","End Time (MM:SS.mmm)"\n`;


        // Add data rows
        for (let i = 0; i < sortedPagesForExport.length; i++) {
            const page = sortedPagesForExport[i];

            // Ensure data integrity for the row
            const pageNum = page.page || 'N/A';
            const startTimeSec = page.startTime?.toFixed(3) || 'N/A';
            const endTimeSec = page.endTime?.toFixed(3) || 'N/A';
            const startTimeFormatted = page.startTimeFormatted || 'N/A';
            const endTimeFormatted = page.endTimeFormatted || 'N/A';

            // Escape commas within fields by enclosing in double quotes if necessary (already done for metadata)
            csvContent += `${pageNum},${startTimeSec},${endTimeSec},"${startTimeFormatted}","${endTimeFormatted}"\n`;
        }

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        // Construct filename using loaded info
        const filenameSurahPart = surahName.replace(/[^a-z0-9]/gi, '_');
        const filenameReciterPart = reciterNameValue.replace(/[^a-z0-9]/gi, '_') || 'Reciter';
        const filenameQiraatPart = fileQiraat.replace(/[^a-z0-9]/gi, '_') || 'Qiraat';
        const filenameRawiPart = fileRawi.replace(/[^a-z0-9]/gi, '_') || 'Rawi';

        link.setAttribute('href', url);
        link.setAttribute('download', `QuranMarker_${filenameSurahPart}_${filenameReciterPart}_${filenameQiraatPart}_${filenameRawiPart}_timestamps.csv`);
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url); // Clean up blob URL

         // Show success message
         const successMessage = document.getElementById('successMessage');
         if (successMessage) {
             successMessage.textContent = 'تم تصدير ملف CSV بنجاح!';
             successMessage.style.display = 'block';
             setTimeout(() => { successMessage.style.display = 'none'; }, 3000);
         }
    });

} else {
     console.warn("CSV Export button (#exportCsvButton) not found.");
     // If the main #exportButton is intended for CSV:
     // document.getElementById('exportButton')?.addEventListener('click', function() { /* CSV export logic here */ });
}


// Import button functionality (JSON)
const importJsonButton = document.getElementById('importButton'); // Use the existing import button ID
if (importJsonButton) {
    importJsonButton.addEventListener('click', function() {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.json'; // Only allow JSON files

        fileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return; // No file selected

            const reader = new FileReader();
            reader.onload = function(event) {
                try {
                    const data = JSON.parse(event.target.result);
                    console.log("Attempting to import data:", data);

                    // --- Restore state from the imported data (using new structure) ---
                    // Ensure global variables exist before assigning
                    if (typeof window.pages === 'undefined') window.pages = [];
                    if (typeof window.currentSurah === 'undefined') window.currentSurah = '';
                    if (typeof window.reciterName === 'undefined') window.reciterName = '';
                    if (typeof window.selectedQiraat === 'undefined') window.selectedQiraat = '';
                    if (typeof window.selectedRawi === 'undefined') window.selectedRawi = '';
                    if (typeof window.audioFileName === 'undefined') window.audioFileName = '';

                    // Basic validation of imported structure
                    if (!data || typeof data !== 'object') {
                        throw new Error("Invalid file format: Not a valid JSON object.");
                    }
                     if (!Array.isArray(data.pages)) {
                         console.warn("Imported data missing 'pages' array or it's not an array. Initializing empty.");
                         data.pages = [];
                     }


                    // *** VALIDATE/SANITIZE IMPORTED PAGES DATA (Important!) ***
                    const importedPages = (data.pages || []).map((p, index) => {
                        const pageNum = parseInt(p?.page) || 0;
                        const surahNum = parseInt(p?.surahNumber) || 0;
                        const startTime = parseFloat(p?.startTime) || 0;
                        const endTime = parseFloat(p?.endTime) || 0;

                         if (pageNum <= 0 || surahNum <= 0 || isNaN(startTime) || isNaN(endTime) || endTime < startTime) {
                            console.warn(`Skipping invalid page data during import at index ${index}:`, p);
                            return null; // Mark for removal
                        }

                        return {
                            page: pageNum,
                            surahNumber: surahNum,
                            startTime: startTime,
                            endTime: endTime,
                            // Re-generate formatted times based on imported seconds for consistency
                            startTimeFormatted: typeof formatTimeWithMs === 'function' ? formatTimeWithMs(startTime) : String(startTime),
                            endTimeFormatted: typeof formatTimeWithMs === 'function' ? formatTimeWithMs(endTime) : String(endTime)
                        };
                    }).filter(p => p !== null); // Remove invalid entries

                    // Sort imported pages correctly before assigning
                    importedPages.sort((a, b) => {
                        if (a.surahNumber !== b.surahNumber) return a.surahNumber - b.surahNumber;
                        return a.page - b.page;
                    });

                    window.pages = importedPages;

                    // Restore other state variables
                    window.currentSurah = String(data.currentSurah || ''); // Ensure it's a string
                    window.reciterName = data.reciterName || '';
                    const importedQiraatRawi = data.selectedQiraat || '';
                    window.audioFileName = data.audioFileName || ''; // Restore filename

                    // Set global qiraat/rawi variables from combined string
                     if (importedQiraatRawi.includes(' - ')) {
                         [window.selectedQiraat, window.selectedRawi] = importedQiraatRawi.split(' - ');
                     } else {
                         window.selectedQiraat = importedQiraatRawi;
                         window.selectedRawi = '';
                     }

                    console.log("Successfully processed imported data.");

                    // --- Update UI elements ---
                    const surahSelect = document.getElementById('surahSelect');
                    if (surahSelect) {
                         surahSelect.value = window.currentSurah;
                         // Important: Trigger change handlers AFTER setting value to update dependent UI
                         // Handle Surah Change (will rebuild list and generate dynamic buttons)
                         if (typeof handleSurahChange === 'function') {
                             // Manually call handler logic IF the value actually changed the dropdown
                             // Or safer: just dispatch the event
                             console.log("Dispatching change event on Surah select after import.");
                             surahSelect.dispatchEvent(new Event('change'));
                         } else {
                              console.error("handleSurahChange function not found after import.");
                         }
                    }

                    const reciterInput = document.getElementById('reciterInput');
                    if (reciterInput) reciterInput.value = window.reciterName;

                    const qiraatSelect = document.getElementById('qiraatSelect');
                    if (qiraatSelect) {
                        qiraatSelect.value = importedQiraatRawi;
                        // Trigger change handler for Qiraat? Unlikely needed unless UI depends on it.
                    }

                    const fileNameDisplay = document.getElementById('fileName');
                    if (fileNameDisplay) fileNameDisplay.textContent = window.audioFileName || 'لم يتم تحميل ملف صوتي'; // Show filename or placeholder

                    // Save imported state to localStorage IMMEDIATELY
                    if (typeof saveToLocalStorage === 'function') {
                        saveToLocalStorage();
                        console.log("Saved imported state to localStorage.");
                    } else {
                         console.error("saveToLocalStorage function not found after import.");
                    }

                    // Rebuild page list explicitly (though handleSurahChange should also do it)
                    // if (typeof rebuildPageList === 'function') rebuildPageList();

                    // Render timeline AFTER UI updates and potential audio load
                    const audio = document.getElementById('audio');
                    if (audio && typeof window.renderTimeline === 'function') {
                          const tryRenderTimeline = () => {
                              // Only render if audio has metadata (duration) AND pages exist
                              if (audio.readyState >= 1 && window.pages && window.pages.length > 0) {
                                  console.log("Rendering timeline after import.");
                                  window.renderTimeline(audio, window.pages);
                              } else if (!audio.src || audio.readyState < 1) {
                                   console.log("Timeline not rendered after import: Audio not loaded or no src.");
                              } else {
                                   console.log("Timeline not rendered after import: No pages data.");
                              }
                          };
                          // Give potential audio src load a moment (if filename implies a file should be loaded)
                          // NOTE: Importing JSON doesn't load the audio file itself, user must still select it.
                          // So, render based on current audio state.
                          setTimeout(tryRenderTimeline, 100);
                     }

                    // Display success message
                    const successMessage = document.getElementById('successMessage');
                    if (successMessage) {
                        successMessage.textContent = 'تم استيراد الإعدادات بنجاح!';
                        successMessage.style.display = 'block';
                        setTimeout(() => { successMessage.style.display = 'none'; }, 3000);
                    }

                } catch (error) {
                    alert('فشل استيراد الإعدادات: ' + error.message);
                    console.error("Import Error:", error);
                }
            };

            reader.onerror = (error) => {
                alert('فشل قراءة الملف.');
                console.error("File Reading Error:", error);
            };

            reader.readAsText(file);
        });

        fileInput.click(); // Open the file dialog
    });
} else {
     console.warn("Import JSON button (#importButton) not found.");
}
```
--- END OF FILE csv-export.js.txt ---

--- START OF FILE audio-handling.js.txt ---
```javascript
// audio-handling.js

// Setup audio time display with milliseconds
function setupAudioTimeDisplay() {
    const audio = document.getElementById('audio');
    const currentTimeDisplay = document.getElementById('currentTimeDisplay');
    const durationDisplay = document.getElementById('durationDisplay');
    const audioSeeker = document.getElementById('audioSeeker');

    if (!audio || !currentTimeDisplay || !durationDisplay || !audioSeeker) {
         console.error("Audio display elements not found. Cannot set up time display.");
         return;
    }

    // Update current time and seeker position
    const updateTime = () => {
        if (!audio.paused && !isNaN(audio.currentTime)) { // Check if currentTime is valid
            currentTimeDisplay.textContent = formatTimeWithMs(audio.currentTime);
            if (!isNaN(audio.duration) && audio.duration > 0) {
                 // Only update seeker if duration is valid
                const percent = (audio.currentTime / audio.duration) * 100;
                 // Prevent seeker update if user is currently dragging it
                 if (!audioSeeker.matches(':active')) {
                    audioSeeker.value = percent;
                 }
            }
        } else if (isNaN(audio.currentTime)) {
             // Reset display if currentTime becomes NaN (e.g., after src change before load)
             currentTimeDisplay.textContent = '00:00.000';
        }
    };

    // Update duration display when metadata loads
    const updateDuration = () => {
        if (!isNaN(audio.duration) && audio.duration > 0) {
            durationDisplay.textContent = formatTimeWithMs(audio.duration);
            audioSeeker.min = 0;
            audioSeeker.max = 100;
            // Render timeline whenever duration becomes available/changes
            if (typeof window.renderTimeline === 'function' && typeof window.pages !== 'undefined') {
                window.renderTimeline(audio, window.pages);
            }
        } else {
             // Reset duration if it's invalid
             durationDisplay.textContent = '00:00.000';
             audioSeeker.value = 0;
             audioSeeker.min = 0;
             audioSeeker.max = 100; // Keep max at 100
        }
    };

    // Event listeners
    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('durationchange', updateDuration); // Handle duration changes
    audio.addEventListener('seeked', updateTime); // Update display immediately after seeking
     audio.addEventListener('emptied', () => { // Reset display when audio source is removed
         currentTimeDisplay.textContent = '00:00.000';
         durationDisplay.textContent = '00:00.000';
         audioSeeker.value = 0;
         if (typeof window.renderTimeline === 'function') {
            window.renderTimeline(null, []); // Clear timeline
        }
     });


    // Handle seeker interaction
    audioSeeker.addEventListener('input', function() {
        if (!isNaN(audio.duration) && audio.duration > 0) {
            const seekTime = (parseFloat(audioSeeker.value) / 100) * audio.duration;
             // Update time display immediately while dragging
             currentTimeDisplay.textContent = formatTimeWithMs(seekTime);
            // Only set audio.currentTime when the user releases the slider (or use 'change' event)
            // This prevents choppy playback during seeking.
            // audio.currentTime = seekTime; // Moved to 'change' event listener
        }
    });
     // Update audio position when user finishes seeking
     audioSeeker.addEventListener('change', function() {
         if (!isNaN(audio.duration) && audio.duration > 0) {
             const seekTime = (parseFloat(audioSeeker.value) / 100) * audio.duration;
             audio.currentTime = seekTime;
         }
     });


    // Fallback interval for smoother display during playback (optional)
    // Consider using requestAnimationFrame for better performance if needed
    // setInterval(updateTime, 50); // Update display frequently during playback
}

// Format time to MM:SS (Not currently used, but keep if needed)
function formatTime(timeInSeconds) {
     if (isNaN(timeInSeconds) || timeInSeconds < 0) return '00:00';
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Format time with milliseconds MM:SS.mmm
function formatTimeWithMs(timeInSeconds) {
    if (isNaN(timeInSeconds) || timeInSeconds < 0) return '00:00.000'; // Handle invalid input gracefully
    const totalSeconds = Math.max(0, timeInSeconds); // Ensure non-negative
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    // Use Math.round for milliseconds to avoid floating point issues near .9995 etc.
    const milliseconds = Math.round((totalSeconds % 1) * 1000);
    // Handle potential rounding to 1000ms case
    if (milliseconds === 1000) {
         return formatTimeWithMs(Math.ceil(totalSeconds)); // Recalculate with the next second
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
}
```
--- END OF FILE audio-handling.js.txt ---

--- START OF FILE app.js.txt ---
```javascript
// app.js is DEPRECATED and replaced by app-initialization.js
// This file should NOT be included in the HTML anymore.
// All its functionality is now split into specialized files and
// orchestrated by app-initialization.js.

// If this file contained any unique logic not moved elsewhere,
// it needs to be integrated into the appropriate module (e.g., audio-handling.js,
// local-storage.js, page-list-management.js, etc.) or app-initialization.js.

console.warn("DEPRECATED: app.js should be removed from index.html. Use app-initialization.js instead.");

// ========= Example of moving logic (if any was left) ===========
// // Example: If app.js had a specific button listener
// document.addEventListener('DOMContentLoaded', function() {
//     const myButton = document.getElementById('someUniqueButton');
//     if (myButton) {
//         myButton.addEventListener('click', () => {
//             console.log("Unique button clicked!");
//             // Add relevant logic here or call a function from another module
//         });
//     }
// });
// ==============================================================

```
--- END OF FILE app.js.txt ---

--- START OF FILE app-initialization.js.txt ---
```javascript
// js/app-initialization.js

// Define global state variables *before* DOMContentLoaded
// Use `window.` to ensure they are truly global if accessed across files without modules
window.pageCounter = 1; // May not be used for marking, but keep for compatibility/export
window.pages = []; // Holds the array of {page, surahNumber, startTime, endTime, ...} objects
window.currentSurah = ''; // Stores selected Surah number as string (e.g., "2" for Baqarah)
window.audioFileName = '';
window.editingPageIndex = -1; // Tracks index in window.pages currently being edited via dialog
window.reciterName = '';
window.selectedQiraat = '';
window.selectedRawi = '';

// --- Main Initialization Logic ---
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM Loaded. Initializing application...");

    // 1. Load any saved state FIRST
    let dataLoaded = false;
    if (typeof loadFromLocalStorage === 'function') {
        dataLoaded = loadFromLocalStorage(); // This updates the global variables above
        if(dataLoaded) {
             console.log("State successfully loaded from localStorage.");
        } else {
             console.log("No valid state found in localStorage or loading failed. Using defaults.");
             // Ensure defaults are explicitly set if loading fails (though loadFromLocalStorage should handle this)
             window.pages = []; window.currentSurah = ''; window.reciterName = ''; /* reset others */
        }
    } else {
        console.error("loadFromLocalStorage function not found. State not loaded.");
    }

    // 2. Setup UI components (dropdowns, input fields, etc.)
    // These functions will populate dropdowns and create elements.
    // They also attach their specific event listeners (like handleSurahChange).
    if (typeof setupSurahDropdown === 'function') setupSurahDropdown(); else console.error("setupSurahDropdown not found.");
    if (typeof addReciterInput === 'function') addReciterInput(); else console.error("addReciterInput not found."); // Creates and sets up listener
    if (typeof setupQiraatDropdown === 'function') setupQiraatDropdown(); else console.error("setupQiraatDropdown not found.");
    if (typeof setupAudioTimeDisplay === 'function') setupAudioTimeDisplay(); else console.error("setupAudioTimeDisplay not found.");
    if (typeof addResetButton === 'function') addResetButton(); else console.error("addResetButton not found.");

    // 3. Restore UI *values* AFTER dropdowns/inputs are populated/created and globals are loaded
     const surahSelect = document.getElementById('surahSelect');
     if (surahSelect && window.currentSurah) {
         surahSelect.value = window.currentSurah; // Set dropdown value based on loaded state
         console.log(`Restored Surah dropdown to: ${window.currentSurah}`);
     }

     const reciterInput = document.getElementById('reciterInput'); // Should exist now
     if (reciterInput && window.reciterName) {
         reciterInput.value = window.reciterName; // Set input value based on loaded state
         console.log(`Restored Reciter input to: ${window.reciterName}`);
     }

     const qiraatSelect = document.getElementById('qiraatSelect');
     if (qiraatSelect) {
         const qiraatValueToSet = (window.selectedQiraat && window.selectedRawi)
                                ? `${window.selectedQiraat} - ${window.selectedRawi}`
                                : window.selectedQiraat || '';
         if (qiraatValueToSet) {
             qiraatSelect.value = qiraatValueToSet; // Set Qiraat dropdown value
             console.log(`Restored Qiraat dropdown to: ${qiraatValueToSet}`);
         }
     }

     const fileNameDisplay = document.getElementById('fileName');
     if (fileNameDisplay) {
         fileNameDisplay.textContent = window.audioFileName || 'لم يتم تحميل ملف صوتي'; // Set filename display
     }


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
                         // Revoke previous object URL if exists to prevent memory leaks
                         const previousUrl = audio.getAttribute('src');
                         if (previousUrl && previousUrl.startsWith('blob:')) {
                             URL.revokeObjectURL(previousUrl);
                             console.log("Revoked previous audio blob URL.");
                         }
                         audio.src = fileURL;
                         audio.load(); // Explicitly load the new source
                         console.log("New audio source set and loading.");

                         // Potential workflow decision: Reset page markers when new audio loaded?
                         // if (confirm("هل ترغب في مسح علامات الصفحات الحالية عند تحميل ملف صوتي جديد؟")) {
                         //     window.pages = window.pages.filter(p => p.surahNumber !== parseInt(window.currentSurah)); // Clear only for current surah
                         //     if (typeof rebuildPageList === 'function') rebuildPageList();
                         //     if (typeof window.renderTimeline === 'function') window.renderTimeline(audio, window.pages);
                         //     console.log("Cleared page marks for the current Surah.");
                         // }

                    } catch (error) {
                        console.error("Error creating object URL for audio file:", error);
                        alert("حدث خطأ أثناء محاولة تحميل الملف الصوتي.");
                         if (fileNameDisplay) fileNameDisplay.textContent = 'خطأ في تحميل الملف';
                         window.audioFileName = '';
                    }

                } else {
                    console.error("Audio element not found when handling file input.");
                }

                // Save the state (at least the new filename)
                if (typeof saveToLocalStorage === 'function') saveToLocalStorage();
            }
        });
    } else {
        console.error("Audio file input element (#audioFile) not found.");
    }

    // 5. Initial Page List Build
    // Build the list based on the loaded `currentSurah` and `pages` data.
    if (typeof rebuildPageList === 'function') {
        console.log("Performing initial page list build.");
        rebuildPageList();
    } else {
        console.error("rebuildPageList function not found during initialization.");
    }

    // 6. Trigger Dynamic Button Generation and Initial Timeline Render
    // This needs to happen AFTER dropdowns are populated AND the initial Surah value is set.
    // We dispatch the 'change' event on the Surah select if a Surah was loaded.
    // This ensures both dynamic buttons AND the page list are correctly generated/updated by their respective handlers.
    if (surahSelect && window.currentSurah && window.currentSurah !== "") {
         console.log(`Initial load: Triggering 'change' handlers for Surah ${window.currentSurah}.`);
         // This will call handleSurahChange (rebuilds list) and generateButtons (in dynamic-page-buttons.js)
         surahSelect.dispatchEvent(new Event('change'));
    } else {
         console.log("Initial load: No Surah selected, skipping initial 'change' event dispatch.");
         // Ensure list shows initial empty/prompt state if rebuildPageList was called earlier
         if (typeof rebuildPageList === 'function') rebuildPageList();
    }

    // 7. Initial Timeline Render Attempt
    // Render based on currently loaded pages and audio state (if any)
    const audio = document.getElementById('audio');
     if (audio && typeof window.renderTimeline === 'function') {
          const tryRenderTimeline = () => {
               // Only render if audio has metadata (duration) AND pages exist
               if (audio.readyState >= 1 && !isNaN(audio.duration) && audio.duration > 0 && window.pages && window.pages.length > 0) {
                   console.log("Attempting initial timeline render.");
                   window.renderTimeline(audio, window.pages);
               } else if (audio.src && audio.readyState < 1) {
                    // If src is set but not loaded, wait for metadata
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
                   // Ensure timeline bar is visible but empty if needed by calling with empty data
                   window.renderTimeline(null, []);
               }
           };
           // Use setTimeout to allow DOM updates and event handlers to process first
           setTimeout(tryRenderTimeline, 100);
       } else {
           console.error("renderTimeline function or audio element not found during initialization.");
       }

       console.log("Application initialization complete.");
});

// Global helper function check (ensure it's loaded)
if (typeof formatTimeWithMs !== 'function') {
    console.error("FATAL: formatTimeWithMs function is not defined. Check script loading order.");
}
```
--- END OF FILE app-initialization.js.txt ---

--- START OF FILE index.html ---
```html
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>تحديد صفحات السورة - أداة مساعدة للقرآن الكريم</title>
    <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700&family=Amiri:wght@400;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="css/style.css">
    <!-- Scripts moved to the end of body for better performance -->
</head>
<body>
    <header>
        <h1>أداة تحديد صفحات السورة</h1>
        <div class="subtitle">لتيسير تحديد أوقات بدايات ونهايات الصفحات في تلاوات القرآن الكريم</div>
    </header>
    <div class="container">
        <div class="card">
           <div class="form-group">
                <label for="surahSelect">السورة</label>
                <select id="surahSelect">
                    <option value="">اختر سورة</option>
                    <!-- Options populated by JS -->
                </select>
            </div>

            <!-- Reciter input will be dynamically added here by dropdowns.js -->

            <div class="form-group">
                <label for="qiraatSelect">القراءة / الراوي</label>
                <select id="qiraatSelect">
                    <option value="">اختر القراءة / الراوي (اختياري)</option>
                     <!-- Options populated by JS -->
                </select>
            </div>

            <div class="form-group">
                <label>ملف الصوت</label>
                <div class="file-input-wrapper">
                    <label class="file-input-label" for="audioFile">
                        اختر ملف الصوت الخاص بالسورة
                        <span>امتدادات مدعومة: MP3, WAV, OGG, M4A</span>
                    </label>
                    <input type="file" id="audioFile" accept="audio/*">
                </div>
                <div class="file-name" id="fileName">لم يتم تحميل ملف صوتي</div>
            </div>

            <div class="audio-container">
                <audio id="audio" controls></audio>
                <div class="time-display-container">
                    <div class="current-time" id="currentTimeDisplay">00:00.000</div>
                    <input type="range" id="audioSeeker" min="0" max="100" value="0" step="0.01" class="audio-seeker" aria-label="شريط تمرير الصوت">
                    <div class="duration" id="durationDisplay">00:00.000</div>
                </div>
            </div>

             <!-- Container for dynamically generated page MARKING buttons -->
             <div id="pageMarkingContainer" class="page-buttons-container">
                <p>الرجاء اختيار السورة لعرض أزرار تحديد الصفحات.</p>
            </div>

            <!-- Success message area -->
            <div class="success-message" id="successMessage"></div>

            <!-- Main action buttons -->
            <div class="buttons-container">
                 <!-- Renamed Export button for CSV -->
                <button id="exportCsvButton">
                    تصدير CSV
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="18" height="18">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                </button>
                 <!-- Added Export button for JSON Settings -->
                 <button id="exportJsonButton">
                     تصدير الإعدادات (JSON)
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="18" height="18">
                         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                     </svg>
                 </button>
                <button id="importButton"> <!-- This button now imports JSON settings -->
                    استيراد الإعدادات (JSON)
                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
                         <path fill-rule="evenodd" d="M4.5 2A1.5 1.5 0 003 3.5v13A1.5 1.5 0 004.5 18h11a1.5 1.5 0 001.5-1.5V7.621a1.5 1.5 0 00-.44-1.06l-4.12-4.122A1.5 1.5 0 0011.378 2H4.5zm4.75 8.75a.75.75 0 00-1.5 0v2.546l-.928-.928a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.06 0l2.25-2.25a.75.75 0 10-1.06-1.06l-.928.928V10.75z" clip-rule="evenodd" />
                     </svg>
                </button>
                 <!-- Reset button will be added dynamically by reset.js -->
            </div>
        </div>

        <!-- Section to display the list of pages for the selected Surah -->
        <div class="pages-section card">
            <h3>صفحات السورة المحددة</h3>
            <ul id="pageList">
                <div class="empty-state">اختر سورة لعرض صفحاتها</div>
            </ul>
        </div>

        <!-- Timeline visualization -->
        <div id="timeline" class="timeline-bar" aria-label="الجدول الزمني الصوتي">
             <!-- Segments populated by JS -->
        </div>

    </div>

    <footer>
        <p>
            طور هذا الموقع بـ <span class="heart">❤</span> بواسطة <a href="https://madi.se" target="_blank" rel="noopener noreferrer">Madi.se</a>
        </p>
    </footer>

    <!-- Load Data Files First -->
    <script src="js/surah-data.js"></script>
    <script src="js/qiraat-data.js"></script>

    <!-- Load Helper/Component Scripts -->
    <script src="js/audio-handling.js"></script> <!-- Contains formatTimeWithMs -->
    <script src="js/dropdowns.js"></script>
    <script src="js/local-storage.js"></script>
    <script src="js/page-list-management.js"></script> <!-- Contains rebuildPageList -->
    <script src="js/time-editing.js"></script> <!-- Contains showStartEndTimeEditor -->
    <script src="js/csv-export.js"></script> <!-- Contains CSV export and JSON import -->
    <script src="js/exportSetting.js"></script> <!-- Contains JSON export -->
    <script src="js/reset.js"></script>
    <script src="js/timeline.js"></script> <!-- Contains renderTimeline -->

    <!-- Load the Dynamic Button Logic -->
    <script src="js/dynamic-page-buttons.js"></script> <!-- Generates marking buttons -->

    <!-- Load Main Initialization Script Last -->
    <script src="js/app-initialization.js"></script>

    <!-- REMOVED deprecated app.js -->

</body>
</html>
```
--- END OF FILE index.html ---

--- START OF FILE style.css ---
```css
/* style.css - Updated with list styles */

:root {
    --primary-color: #0d6e6e;
    --primary-hover: #0a5656;
    --secondary-color: #f8f4e9; /* Light beige background */
    --accent-color: #d3a73b; /* Gold accent */
    --accent-hover: #b88e2f; /* Darker gold */
    --text-color: #333;
    --light-gray: #f5f5f5; /* Very light gray for subtle backgrounds */
    --medium-gray: #e0e0e0; /* Borders */
    --dark-gray: #6c757d; /* Secondary text, buttons */
    --border-color: var(--medium-gray);
    --border-radius: 8px;
    --shadow: 0 4px 8px rgba(0, 0, 0, 0.08); /* Slightly softer shadow */
    --success-bg: #e7f3e7;
    --success-text: #2e7d32;
    --error-bg: #fdecea;
    --error-text: #dc3545;
    --disabled-bg: #e9ecef;
    --disabled-text: #adb5bd;
}

* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

body {
    font-family: 'Tajawal', sans-serif;
    background-color: var(--secondary-color);
    color: var(--text-color);
    line-height: 1.7; /* Slightly increased line height */
    padding: 0;
    margin: 0;
    font-size: 16px; /* Base font size */
}

.container {
    max-width: 900px; /* Slightly wider container */
    margin: 0 auto;
    padding: 25px;
}

header {
    background-color: var(--primary-color);
    color: white;
    padding: 25px 0;
    text-align: center;
    margin-bottom: 35px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.15); /* Subtle bottom shadow */
    border-bottom: 3px solid var(--accent-color); /* Accent border */
}

h1 {
    font-family: 'Amiri', serif;
    font-weight: 700;
    font-size: 2.4rem;
    margin: 0;
}

.subtitle {
    font-weight: 300;
    font-size: 1.1rem; /* Slightly larger subtitle */
    opacity: 0.9;
    margin-top: 8px;
}

.card {
    background-color: white;
    border-radius: var(--border-radius);
    padding: 30px; /* Increased padding */
    margin-bottom: 30px;
    box-shadow: var(--shadow);
    border: 1px solid var(--border-color); /* Subtle border */
}

.form-group {
    margin-bottom: 22px; /* Increased spacing */
}

label {
    display: block;
    margin-bottom: 10px; /* More space below label */
    font-weight: 500;
    color: var(--primary-color);
    font-size: 1.05em; /* Slightly larger labels */
}

input[type="text"],
select {
    width: 100%;
    padding: 12px 15px;
    border-radius: var(--border-radius);
    border: 1px solid var(--border-color);
    font-family: 'Tajawal', sans-serif;
    font-size: 1em; /* Use base font size */
    transition: all 0.3s ease;
    background-color: #fff; /* Ensure white background */
    direction: rtl; /* Ensure text is right-aligned */
}
input[type="text"]:focus,
select:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(13, 110, 110, 0.15); /* Softer focus ring */
}

/* File Input Specific Styles */
.file-input-wrapper {
    position: relative;
    overflow: hidden;
    display: block; /* Make it block */
    width: 100%;
}
.file-input-label {
    background-color: var(--light-gray);
    color: var(--text-color);
    padding: 15px; /* More padding */
    border-radius: var(--border-radius);
    display: block;
    text-align: center;
    cursor: pointer;
    border: 2px dashed var(--border-color); /* Dashed border */
    transition: all 0.3s ease;
    font-weight: 500;
}
.file-input-label:hover {
    background-color: #e9e9e9;
    border-color: var(--primary-color);
    color: var(--primary-color);
}
.file-input-label span {
    display: block;
    font-size: 0.9rem;
    margin-top: 8px;
    color: #777;
}
#audioFile { /* Hide the actual file input */
    position: absolute;
    left: -9999px;
}
.file-name {
    margin-top: 12px; /* More space above filename */
    font-size: 0.95rem;
    color: var(--primary-hover);
    font-weight: 500;
    text-align: center;
    min-height: 1.2em; /* Prevent layout shift */
}

/* Audio Player Styles */
.audio-container {
    margin: 30px 0;
    text-align: center;
}
audio {
    width: 100%;
    border-radius: var(--border-radius);
    background-color: var(--light-gray);
    box-shadow: inset 0 2px 4px rgba(0,0,0,0.06); /* Inner shadow */
    margin-bottom: 15px; /* Space below player */
}
/* Customizing controls appearance (browser-dependent) */
audio::-webkit-media-controls-panel {
  background-color: var(--light-gray);
  border-radius: var(--border-radius);
}
.time-display-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 10px;
    gap: 15px; /* Add gap between elements */
}
.audio-seeker {
    flex-grow: 1;
    margin: 0; /* Removed margin, using gap now */
    height: 8px; /* Slightly thicker */
    border-radius: 4px;
    cursor: pointer;
    appearance: none;
    background-color: var(--medium-gray); /* Track color */
    outline: none;
}
/* Seeker thumb styles */
.audio-seeker::-webkit-slider-thumb {
  appearance: none;
  width: 16px;
  height: 16px;
  background: var(--primary-color);
  border-radius: 50%;
  cursor: pointer;
  transition: background-color 0.2s ease;
}
.audio-seeker::-moz-range-thumb {
  width: 16px;
  height: 16px;
  background: var(--primary-color);
  border-radius: 50%;
  cursor: pointer;
  border: none;
   transition: background-color 0.2s ease;
}
.audio-seeker:hover::-webkit-slider-thumb {
  background: var(--primary-hover);
}
.audio-seeker:hover::-moz-range-thumb {
  background: var(--primary-hover);
}
.current-time, .duration {
    font-size: 0.95rem;
    color: var(--primary-hover);
    font-weight: 500;
    font-family: monospace; /* Monospace for consistent width */
    background-color: var(--light-gray);
    padding: 3px 6px;
    border-radius: 4px;
}

/* Buttons Container */
.buttons-container {
    display: flex;
    flex-wrap: wrap; /* Allow buttons to wrap on smaller screens */
    gap: 15px; /* Spacing between buttons */
    margin: 25px 0; /* Space around the container */
    padding-top: 20px; /* Space above buttons */
    border-top: 1px solid var(--border-color); /* Separator line */
}
button {
    flex: 1 1 auto; /* Allow buttons to grow and shrink but have a base size */
    background-color: var(--primary-color);
    color: white;
    padding: 12px 20px;
    border: none;
    border-radius: var(--border-radius);
    cursor: pointer;
    font-family: 'Tajawal', sans-serif;
    font-size: 1em;
    font-weight: 500;
    transition: all 0.2s ease;
    display: inline-flex; /* Use inline-flex for icon alignment */
    align-items: center;
    justify-content: center;
    gap: 8px; /* Space between text and icon */
    min-width: 150px; /* Minimum width for buttons */
}
button:hover {
    background-color: var(--primary-hover);
    transform: translateY(-2px);
    box-shadow: 0 3px 6px rgba(0,0,0,0.1);
}
button:active {
    transform: translateY(0);
    box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);
}
button svg {
    width: 18px;
    height: 18px;
    /* No margin needed due to gap property */
}
/* Specific Button Styles */
#exportCsvButton { background-color: #198754; } /* Green for CSV */
#exportCsvButton:hover { background-color: #157347; }
#exportJsonButton { background-color: #0dcaf0; } /* Cyan for JSON */
#exportJsonButton:hover { background-color: #0b98b8; }
#importButton { background-color: #6f42c1; } /* Purple for Import */
#importButton:hover { background-color: #5c36a0; }
/* Reset button style is inline, but can be targeted if class added */
.reset-button-style { background-color: var(--error-text) !important; }
.reset-button-style:hover { background-color: #b02a37 !important; }

/* Dynamic Page Marking Buttons Container */
.page-buttons-container {
    display: flex;
    flex-wrap: wrap;
    gap: 12px; /* Spacing */
    padding: 20px 0;
    margin-top: 20px;
    border-top: 1px solid var(--border-color);
}
#pageMarkingContainer p { /* Placeholder text */
    color: var(--dark-gray);
    width: 100%;
    text-align: center;
    font-style: italic;
    padding: 10px 0;
}
/* Individual Page Marking Button */
.page-mark-button {
    background-color: white;
    border: 1px solid var(--medium-gray);
    color: var(--primary-color);
    padding: 8px 14px;
    border-radius: var(--border-radius);
    font-family: 'Tajawal', sans-serif;
    font-size: 0.95rem; /* Slightly smaller */
    font-weight: 500;
    cursor: pointer;
    text-align: center;
    transition: all 0.2s ease;
    flex-grow: 0;
    flex-shrink: 0;
}
.page-mark-button:hover:not(:disabled) {
    background-color: var(--light-gray);
    border-color: var(--primary-color);
    color: var(--primary-hover);
    transform: translateY(-1px);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}
.page-mark-button.marked { /* Marked state */
    background-color: var(--accent-color);
    border-color: var(--accent-hover);
    color: white;
    font-weight: bold;
    cursor: default;
    transform: none;
    box-shadow: none;
}
.page-mark-button.marked:hover { /* Prevent hover change on marked */
     background-color: var(--accent-color);
     border-color: var(--accent-hover);
}
.page-mark-button:disabled:not(.marked) { /* Disabled state */
    background-color: var(--disabled-bg);
    border-color: var(--border-color);
    color: var(--disabled-text);
    cursor: not-allowed;
    opacity: 0.7;
    transform: none;
    box-shadow: none;
}
.page-mark-button.marked:disabled { /* Marked and Disabled */
    opacity: 0.8;
    cursor: not-allowed;
 }

/* Pages List Section */
.pages-section {
    margin-top: 35px;
}
h3 {
    font-family: 'Amiri', serif;
    color: var(--primary-color);
    margin-bottom: 20px; /* More space below heading */
    padding-bottom: 12px;
    border-bottom: 2px solid var(--primary-color);
    font-size: 1.6rem; /* Larger heading */
}
#pageList { /* The UL element */
    list-style: none;
    padding: 0;
    max-height: 400px; /* Limit height and add scroll */
    overflow-y: auto; /* Enable vertical scroll */
    border: 1px solid var(--border-color); /* Border around list */
    border-radius: var(--border-radius);
    padding: 10px; /* Padding inside list */
    background-color: #fff; /* White background for list */
}
/* Individual List Item */
#pageList li {
    background-color: white; /* Ensure background for items */
    border-bottom: 1px solid var(--border-color); /* Separator line */
    padding: 12px 15px; /* Item padding */
    margin: 0; /* Remove margin, use padding and border */
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 15px; /* Gap between info, time, actions */
    transition: background-color 0.2s ease;
}
#pageList li:last-child {
    border-bottom: none; /* Remove border from last item */
}
#pageList li:hover {
    background-color: var(--light-gray); /* Hover background */
}
/* Different styles for marked/unmarked rows */
#pageList li.unmarked-row {
    opacity: 0.7; /* Make unmarked rows slightly faded */
}
#pageList li.unmarked-row .time-placeholder {
    color: var(--disabled-text); /* Gray placeholder text */
}
#pageList li.marked-row {
     /* Optional: Add subtle indicator like a left border */
     /* border-left: 3px solid var(--accent-color); */
}

/* Page Info (Number) */
.page-info {
    flex-shrink: 0; /* Prevent shrinking */
}
.page-number {
    background-color: var(--primary-color);
    color: white;
    width: 35px; /* Slightly larger */
    height: 35px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 1.1em;
}

/* Time Display within List Item */
.time-display {
    flex-grow: 1; /* Allow time display to take space */
    display: flex;
    align-items: center;
    justify-content: center; /* Center time display */
    gap: 5px; /* Smaller gap within time display */
    font-family: monospace;
    font-size: 1em;
    text-align: center;
    flex-wrap: wrap; /* Allow wrapping if needed */
}
.time-display .time-label { /* Small labels like 'Start:' */
     font-size: 0.8em;
     color: var(--dark-gray);
     font-weight: normal;
     margin-bottom: 0; /* Override default label margin */
     display: inline; /* Make labels inline */
}
.time-display .time-value,
.time-display .time-placeholder {
    padding: 3px 6px;
    background-color: var(--light-gray);
    border-radius: 4px;
    white-space: nowrap; /* Prevent time wrapping */
}
.time-display .start-time { color: #006400; } /* Dark Green */
.time-display .end-time { color: #8B0000; } /* Dark Red */
.time-display .time-separator {
    margin: 0 3px;
    color: #aaa;
    font-weight: bold;
}

/* Action Buttons within List Item */
.action-buttons {
    display: flex;
    align-items: center;
    gap: 8px; /* Space between edit/delete */
    flex-shrink: 0; /* Prevent shrinking */
}
.edit-button, .delete-btn { /* Edit/Delete buttons in list */
    background: none;
    border: none;
    cursor: pointer;
    padding: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--primary-color); /* Default icon color */
    transition: color 0.2s ease, transform 0.2s ease;
}
.edit-button:hover, .delete-btn:hover {
    transform: scale(1.15); /* Slightly enlarge icon on hover */
}
.edit-button svg, .delete-btn svg {
    width: 18px; /* Icon size */
    height: 18px;
    stroke-width: 2; /* Ensure stroke width is set */
}
.edit-button:hover { color: var(--accent-color); } /* Gold hover for edit */
.delete-btn:hover { color: var(--error-text); } /* Red hover for delete */

/* Empty State for List */
.empty-state {
    text-align: center;
    