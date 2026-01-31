// js/dynamic-page-buttons.js

// Assumes global vars: surahData, pages, formatTimeWithMs, saveToLocalStorage, rebuildPageList, renderTimeline

function initDynamicPageButtons() {
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
        // Clear previous buttons safely
        while (pageMarkingContainer.firstChild) pageMarkingContainer.removeChild(pageMarkingContainer.firstChild);

        if (!selectedSurahValue) {
            const p = document.createElement('p');
            p.textContent = 'الرجاء اختيار السورة لعرض أزرار تحديد الصفحات.';
            pageMarkingContainer.appendChild(p);
            return;
        }

        const selectedSurahNumber = parseInt(selectedSurahValue);
        const surah = surahData.find(s => s.number === selectedSurahNumber);

        if (surah) {
            console.log(`Generating mark buttons for Surah ${selectedSurahNumber} (Pages ${surah.startPage}-${surah.endPage})`);
            for (let pageNum = surah.startPage; pageNum <= surah.endPage; pageNum++) {
                const button = document.createElement('button');
                button.textContent = `  صفحة ${pageNum}`; // More descriptive text
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
             const p = document.createElement('p');
             p.textContent = `بيانات السورة رقم ${selectedSurahNumber} غير موجودة.`;
             pageMarkingContainer.appendChild(p);
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
}

// Initialize immediately if DOM is already ready, otherwise wait for DOMContentLoaded
if (document.readyState !== 'loading') initDynamicPageButtons();
else document.addEventListener('DOMContentLoaded', initDynamicPageButtons);