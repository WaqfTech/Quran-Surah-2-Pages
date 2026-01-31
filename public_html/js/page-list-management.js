// js/page-list-management.js

// Rebuild entire page list based on SELECTED SURAH with INLINE EDITING (Improved Layout)
function rebuildPageList() {
    const pageList = document.getElementById('pageList');
    if (!pageList) return;

    // --- State and Data Checks ---
    if (typeof window.pages === 'undefined' || typeof window.currentSurah === 'undefined' || typeof surahData === 'undefined') {
        console.error("rebuildPageList: Global variables (pages, currentSurah, surahData) are not defined.");
        pageList.innerHTML = '<div class="empty-state">خطأ: بيانات التطبيق غير متاحة.</div>';
        return;
    }
    const selectedSurahNumber = parseInt(window.currentSurah);

    // --- Clear List and Handle No Surah Selected ---
    pageList.innerHTML = ''; // Clear previous list first
    if (isNaN(selectedSurahNumber) || selectedSurahNumber <= 0) {
        pageList.innerHTML = '<div class="empty-state">اختر سورة لعرض صفحاتها</div>';
        return;
    }

    // --- Find Surah Info ---
    const currentSurahInfo = surahData.find(s => s.number === selectedSurahNumber);
    if (!currentSurahInfo) {
        console.error(`rebuildPageList: Could not find data for Surah number ${selectedSurahNumber}.`);
        pageList.innerHTML = `<div class="empty-state">خطأ: لم يتم العثور على بيانات السورة ${selectedSurahNumber}.</div>`;
        return;
    }

    // --- Loop Through All Pages of the Selected Surah ---
    for (let pageNum = currentSurahInfo.startPage; pageNum <= currentSurahInfo.endPage; pageNum++) {
        const li = document.createElement('li');
        li.dataset.page = pageNum; // Add page number to li for identification
        li.dataset.surah = selectedSurahNumber; // Add surah number

        const markedPageIndex = window.pages.findIndex(p => p.surahNumber === selectedSurahNumber && p.page === pageNum);
        const markedPageData = markedPageIndex !== -1 ? window.pages[markedPageIndex] : null;

        let timeDisplayHTML;
        let deleteButtonHTML = ''; // Only show delete for marked pages

        // --- Generate HTML for Marked vs. Unmarked Pages ---
        if (markedPageData) {
            // *** MARKED PAGE: Render NEW inline input fields layout ***
            li.classList.add('marked-row');
            li.title = `صفحة ${pageNum} محددة (انقر على الوقت للتعديل)`;

            // Helper to get time components
            const getTimeComponents = (timeInSeconds = 0) => {
                const time = Math.max(0, timeInSeconds);
                 const totalSecondsFloored = Math.floor(time);
                 const milliseconds = Math.round((time - totalSecondsFloored) * 1000);

                 // Handle rounding milliseconds up to the next second
                 if (milliseconds === 1000) {
                     return {
                         minutes: Math.floor((totalSecondsFloored + 1) / 60),
                         seconds: (totalSecondsFloored + 1) % 60,
                         milliseconds: 0
                     };
                 } else {
                     return {
                         minutes: Math.floor(totalSecondsFloored / 60),
                         seconds: totalSecondsFloored % 60,
                         milliseconds: milliseconds
                     };
                 }
            };
            const startComponents = getTimeComponents(markedPageData.startTime);
            const endComponents = getTimeComponents(markedPageData.endTime);

            // Unique IDs for labels/inputs
            const startMinId = `s-min-${selectedSurahNumber}-${pageNum}`;
            const startSecId = `s-sec-${selectedSurahNumber}-${pageNum}`;
            const startMsId = `s-ms-${selectedSurahNumber}-${pageNum}`;
            const endMinId = `e-min-${selectedSurahNumber}-${pageNum}`;
            const endSecId = `e-sec-${selectedSurahNumber}-${pageNum}`;
            const endMsId = `e-ms-${selectedSurahNumber}-${pageNum}`;


            // Create input groups for Start and End times with the new layout
            timeDisplayHTML = `
                <fieldset class="inline-time-fieldset start-time-fieldset" title="وقت البدء">
                    <legend class="inline-fieldset-legend">وقت البدء</legend>
                    <div class="inline-time-edit-group">
                        <div class="time-component-wrapper">
                            <label class="component-label" for="${startMinId}">دقائق</label>
                            <input type="number" class="inline-time-input" id="${startMinId}" min="0" value="${startComponents.minutes}" aria-label="دقائق البدء لصفحة ${pageNum}" data-time-type="start" data-component="minutes">
                        </div>
                         <div class="time-component-wrapper">
                            <label class="component-label" for="${startSecId}">ثواني</label>
                            <input type="number" class="inline-time-input" id="${startSecId}" min="0" max="59" value="${startComponents.seconds}" aria-label="ثواني البدء لصفحة ${pageNum}" data-time-type="start" data-component="seconds">
                        </div>
                        <div class="time-component-wrapper">
                             <label class="component-label" for="${startMsId}">أجزاء</label>
                            <input type="number" class="inline-time-input ms-input" id="${startMsId}" min="0" max="999" value="${startComponents.milliseconds}" aria-label="أجزاء الثانية للبدء لصفحة ${pageNum}" data-time-type="start" data-component="milliseconds">
                        </div>
                    </div>
                 </fieldset>

                <fieldset class="inline-time-fieldset end-time-fieldset" title="وقت الانتهاء">
                     <legend class="inline-fieldset-legend">وقت الانتهاء</legend>
                    <div class="inline-time-edit-group">
                        <div class="time-component-wrapper">
                            <label class="component-label" for="${endMinId}">دقائق</label>
                            <input type="number" class="inline-time-input" id="${endMinId}" min="0" value="${endComponents.minutes}" aria-label="دقائق الانتهاء لصفحة ${pageNum}" data-time-type="end" data-component="minutes">
                        </div>
                        <div class="time-component-wrapper">
                            <label class="component-label" for="${endSecId}">ثواني</label>
                            <input type="number" class="inline-time-input" id="${endSecId}" min="0" max="59" value="${endComponents.seconds}" aria-label="ثواني الانتهاء لصفحة ${pageNum}" data-time-type="end" data-component="seconds">
                        </div>
                        <div class="time-component-wrapper">
                             <label class="component-label" for="${endMsId}">أجزاء</label>
                            <input type="number" class="inline-time-input ms-input" id="${endMsId}" min="0" max="999" value="${endComponents.milliseconds}" aria-label="أجزاء الثانية للانتهاء لصفحة ${pageNum}" data-time-type="end" data-component="milliseconds">
                        </div>
                    </div>
                 </fieldset>
                 <div class="list-item-error-message" data-page="${pageNum}" data-surah="${selectedSurahNumber}"></div> <!-- Placeholder for errors -->
            `;

            // Add delete button
            deleteButtonHTML = `
                <button class="delete-btn" data-page="${pageNum}" data-surah="${selectedSurahNumber}" title="حذف علامة هذه الصفحة">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M3 6h18"></path><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"></path><path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                </button>
            `;

        } else {
            // *** UNMARKED PAGE: Render placeholders ***
            li.classList.add('unmarked-row');
            li.title = `صفحة ${pageNum} غير محددة`;
            timeDisplayHTML = `
                <div class="time-placeholder-group">
                    <span class="placeholder-label">وقت البدء:</span>
                    <span class="time-placeholder start-time">--:--.---</span>
                </div>
                 <div class="time-placeholder-group">
                     <span class="placeholder-label">وقت الانتهاء:</span>
                    <span class="time-placeholder end-time">--:--.---</span>
                 </div>
            `;
            // No action buttons for unmarked pages
        }

        // --- Construct List Item DOM safely ---
        // Page info
        const pageInfoDiv = document.createElement('div');
        pageInfoDiv.className = 'page-info';
        const pageNumberSpan = document.createElement('span');
        pageNumberSpan.className = 'page-number';
        pageNumberSpan.textContent = pageNum;
        pageInfoDiv.appendChild(pageNumberSpan);
        li.appendChild(pageInfoDiv);

        // Time display container
        const timeDisplayContainer = document.createElement('div');
        timeDisplayContainer.className = 'time-display inline-edit-container';

        if (markedPageData) {
            // Start fieldset
            const startFieldset = document.createElement('fieldset');
            startFieldset.className = 'inline-time-fieldset start-time-fieldset';
            startFieldset.title = 'وقت البدء';
            const startLegend = document.createElement('legend');
            startLegend.className = 'inline-fieldset-legend';
            startLegend.textContent = 'وقت البدء';
            startFieldset.appendChild(startLegend);
            const startGroup = document.createElement('div');
            startGroup.className = 'inline-time-edit-group';

            // Helper to create a time component wrapper
            const makeTimeComponent = (labelText, inputId, min, max, value, aria) => {
                const wrapper = document.createElement('div');
                wrapper.className = 'time-component-wrapper';
                const label = document.createElement('label');
                label.className = 'component-label';
                label.setAttribute('for', inputId);
                label.textContent = labelText;
                const input = document.createElement('input');
                input.type = 'number';
                input.className = 'inline-time-input';
                input.id = inputId;
                if (min !== undefined) input.min = min;
                if (max !== undefined) input.max = max;
                input.value = value;
                input.setAttribute('aria-label', aria);
                wrapper.appendChild(label);
                wrapper.appendChild(input);
                return wrapper;
            };

            startGroup.appendChild(makeTimeComponent('دقائق', startMinId, 0, undefined, startComponents.minutes, `دقائق البدء لصفحة ${pageNum}`));
            startGroup.appendChild(makeTimeComponent('ثواني', startSecId, 0, 59, startComponents.seconds, `ثواني البدء لصفحة ${pageNum}`));
            startGroup.appendChild(makeTimeComponent('أجزاء', startMsId, 0, 999, startComponents.milliseconds, `أجزاء الثانية للبدء لصفحة ${pageNum}`));
            startFieldset.appendChild(startGroup);
            timeDisplayContainer.appendChild(startFieldset);

            // End fieldset
            const endFieldset = document.createElement('fieldset');
            endFieldset.className = 'inline-time-fieldset end-time-fieldset';
            endFieldset.title = 'وقت الانتهاء';
            const endLegend = document.createElement('legend');
            endLegend.className = 'inline-fieldset-legend';
            endLegend.textContent = 'وقت الانتهاء';
            endFieldset.appendChild(endLegend);
            const endGroup = document.createElement('div');
            endGroup.className = 'inline-time-edit-group';

            endGroup.appendChild(makeTimeComponent('دقائق', endMinId, 0, undefined, endComponents.minutes, `دقائق الانتهاء لصفحة ${pageNum}`));
            endGroup.appendChild(makeTimeComponent('ثواني', endSecId, 0, 59, endComponents.seconds, `ثواني الانتهاء لصفحة ${pageNum}`));
            endGroup.appendChild(makeTimeComponent('أجزاء', endMsId, 0, 999, endComponents.milliseconds, `أجزاء الثانية للانتهاء لصفحة ${pageNum}`));
            endFieldset.appendChild(endGroup);
            timeDisplayContainer.appendChild(endFieldset);

            // Error placeholder
            const errorDiv = document.createElement('div');
            errorDiv.className = 'list-item-error-message';
            errorDiv.dataset.page = pageNum;
            errorDiv.dataset.surah = selectedSurahNumber;
            timeDisplayContainer.appendChild(errorDiv);

        } else {
            const ph1 = document.createElement('div');
            ph1.className = 'time-placeholder-group';
            const lbl1 = document.createElement('span'); lbl1.className = 'placeholder-label'; lbl1.textContent = 'وقت البدء:';
            const val1 = document.createElement('span'); val1.className = 'time-placeholder start-time'; val1.textContent = '--:--.---';
            ph1.appendChild(lbl1); ph1.appendChild(val1);

            const ph2 = document.createElement('div');
            ph2.className = 'time-placeholder-group';
            const lbl2 = document.createElement('span'); lbl2.className = 'placeholder-label'; lbl2.textContent = 'وقت الانتهاء:';
            const val2 = document.createElement('span'); val2.className = 'time-placeholder end-time'; val2.textContent = '--:--.---';
            ph2.appendChild(lbl2); ph2.appendChild(val2);

            timeDisplayContainer.appendChild(ph1);
            timeDisplayContainer.appendChild(ph2);
        }

        li.appendChild(timeDisplayContainer);

        // Action buttons
        const actionDiv = document.createElement('div');
        actionDiv.className = 'action-buttons';
        if (markedPageData) {
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.dataset.page = pageNum;
            deleteBtn.dataset.surah = selectedSurahNumber;
            deleteBtn.title = 'حذف علامة هذه الصفحة';
            // SVG is static and safe
            deleteBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 6h18"></path><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"></path><path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
            `;
            actionDiv.appendChild(deleteBtn);
        }

        li.appendChild(actionDiv);
        pageList.appendChild(li);
    }

    // --- Attach Event Listeners (Delegated) ---
    attachListButtonListeners(); // Handles delete button
    attachInlineEditListeners(); // Handles input changes

    console.log("Page list rebuilt with improved inline editing layout (where applicable).");
}


// --- Attach Delete Button Listeners ---
function attachListButtonListeners() {
    const pageList = document.getElementById('pageList');
    if (!pageList) return;

    // Use event delegation for delete buttons
    pageList.removeEventListener('click', handleDeleteDelegated); // Remove previous listener if any
    pageList.addEventListener('click', handleDeleteDelegated);
}

function handleDeleteDelegated(event) {
     // Check if the clicked element or its parent is a delete button
     const deleteButton = event.target.closest('.delete-btn');
     if (!deleteButton) return; // Click wasn't on a delete button

     event.stopPropagation();
     const pageToDelete = parseInt(deleteButton.getAttribute('data-page'));
     const surahToDelete = parseInt(deleteButton.getAttribute('data-surah'));

     if (!isNaN(pageToDelete) && !isNaN(surahToDelete)) {
        // Confirmation before deleting
        if (confirm(`هل أنت متأكد من حذف علامة الصفحة ${pageToDelete} للسورة ${surahToDelete}؟ لا يمكن التراجع عن هذا الإجراء.`)) {
            deletePage(pageToDelete, surahToDelete);
        }
     } else {
         console.error("Delete button missing page or surah data attribute.");
     }
}


// --- Attach Inline Edit Input Listeners ---
function attachInlineEditListeners() {
    const pageList = document.getElementById('pageList');
    if (!pageList) return;

    // Use event delegation for input changes ('change' fires when value is committed, e.g., on blur)
    pageList.removeEventListener('change', handleInlineTimeEdit); // Remove previous listener
    pageList.addEventListener('change', handleInlineTimeEdit);

    // Add 'focus' listener to clear errors when user starts editing again
    pageList.removeEventListener('focusin', handleInlineFocus);
    pageList.addEventListener('focusin', handleInlineFocus);
}

// --- Handler for Input Focus ---
function handleInlineFocus(event) {
     const inputElement = event.target;
     if (!inputElement.matches('.inline-time-input')) {
        return;
    }
     const li = inputElement.closest('li');
     if (!li) return;

      // Clear previous validation states for this row on focus
      li.classList.remove('invalid-row', 'warning-row');
      const errorMsgDiv = li.querySelector('.list-item-error-message');
      if (errorMsgDiv) errorMsgDiv.textContent = '';
      // Clear specific input invalid state if needed
      li.querySelectorAll('.inline-time-input.input-invalid').forEach(inp => inp.classList.remove('input-invalid'));
}


// --- Handler for Inline Time Input Changes ---
function handleInlineTimeEdit(event) {
    const inputElement = event.target;

    // Ensure the event target is one of our time inputs
    if (!inputElement.matches('.inline-time-input')) {
        return;
    }

    const li = inputElement.closest('li');
    if (!li) return;

    const pageNum = parseInt(li.dataset.page);
    const surahNum = parseInt(li.dataset.surah);
    const timeType = inputElement.dataset.timeType; // 'start' or 'end'
    const fieldset = inputElement.closest('.inline-time-fieldset'); // Find the parent fieldset

    const errorMsgDiv = li.querySelector('.list-item-error-message');
    if (errorMsgDiv) errorMsgDiv.textContent = ''; // Clear previous errors for this row
    li.classList.remove('invalid-row', 'warning-row'); // Remove invalid/warning state styling
    fieldset?.classList.remove('fieldset-invalid', 'fieldset-warning'); // Clear fieldset states
    inputElement.classList.remove('input-invalid'); // Clear specific input state

    console.log(`Inline edit change detected for: Surah ${surahNum}, Page ${pageNum}, Type: ${timeType}, Component: ${inputElement.dataset.component}, Value: ${inputElement.value}`);

    // --- Find the data object ---
    const pageIndex = window.pages.findIndex(p => p.surahNumber === surahNum && p.page === pageNum);
    if (pageIndex === -1) {
        console.error(`Could not find page data in window.pages for Surah ${surahNum}, Page ${pageNum}`);
        if (errorMsgDiv) errorMsgDiv.textContent = 'خطأ: لم يتم العثور على بيانات الصفحة.';
        li.classList.add('invalid-row');
        return;
    }
    const pageData = window.pages[pageIndex];

    // --- Read all components for the affected time (start or end) ---
    const components = { minutes: 0, seconds: 0, milliseconds: 0 };
    // Read only from the inputs within the same fieldset (start or end)
    const inputsInGroup = fieldset ? fieldset.querySelectorAll(`.inline-time-input[data-time-type="${timeType}"]`) : [];
    let correctedValue = false;

    inputsInGroup.forEach(inp => {
        const component = inp.dataset.component;
        let value = parseInt(inp.value);
        let originalValue = value; // Store original for comparison

        // Basic component validation and correction
        if (isNaN(value) || value < 0) { value = 0; }
        if (component === 'seconds' && value > 59) { value = 59; }
        if (component === 'milliseconds' && value > 999) { value = 999; }

        if (value !== originalValue) {
            inp.value = value; // Correct the input field visually
            correctedValue = true;
            console.warn(`Corrected invalid value for ${component} from ${originalValue} to ${value}.`);
        }
        components[component] = value;
    });

     if (correctedValue && errorMsgDiv) {
        errorMsgDiv.textContent = 'تم تصحيح بعض القيم المدخلة (مثل الثواني > 59). ';
     }


    // --- Calculate time in seconds ---
    const newTimeSeconds = (components.minutes * 60) + components.seconds + (components.milliseconds / 1000);

    // --- Perform Cross-Validation (Start vs End) ---
    let validationPassed = true;
    let validationMessage = errorMsgDiv ? errorMsgDiv.textContent : ''; // Preserve correction message
    let isWarning = false;

    // Get the *other* time value from the page data to compare against
    let startTimeSec = (timeType === 'start') ? newTimeSeconds : pageData.startTime;
    let endTimeSec = (timeType === 'end') ? newTimeSeconds : pageData.endTime;

    // Ensure times are valid numbers before comparison
    if (isNaN(startTimeSec) || isNaN(endTimeSec)) {
         validationMessage += 'خطأ: قيمة وقت غير صالحة. ';
         validationPassed = false;
         fieldset?.classList.add('fieldset-invalid');
    }
    // Prevent negative times (should be handled by input min=0, but double-check)
    else if (startTimeSec < 0 || endTimeSec < 0) {
         validationMessage += 'خطأ: لا يمكن أن تكون الأوقات سالبة. ';
         validationPassed = false;
          fieldset?.classList.add('fieldset-invalid');
          // Mark specific invalid input
           inputsInGroup.forEach(inp => { if (parseInt(inp.value) < 0) inp.classList.add('input-invalid'); });
    }
    // Ensure End Time is not before Start Time
    else if (endTimeSec < startTimeSec) {
        validationMessage += 'خطأ: وقت الانتهاء لا يمكن أن يسبق وقت البدء. ';
        validationPassed = false;
        // Mark both fieldsets as involved in the error
        li.querySelectorAll('.inline-time-fieldset').forEach(fs => fs.classList.add('fieldset-invalid'));
    }

    // Optional: Check against audio duration
    const audio = document.getElementById('audio');
    const audioDuration = (audio && !isNaN(audio.duration)) ? audio.duration : null;
    if (audioDuration !== null && endTimeSec > audioDuration) {
        // Add warning, but don't fail validation for this
        validationMessage += `تحذير: الانتهاء (${formatTimeWithMs(endTimeSec)}) يتجاوز مدة الصوت (${formatTimeWithMs(audioDuration)}). `;
        isWarning = true;
        // Mark the end time fieldset with a warning class
        li.querySelector('.end-time-fieldset')?.classList.add('fieldset-warning');
    } else {
         li.querySelector('.end-time-fieldset')?.classList.remove('fieldset-warning');
    }

    // Update error display and row styling
     if (!validationPassed) {
         li.classList.add('invalid-row');
         if (errorMsgDiv) errorMsgDiv.textContent = validationMessage.trim();
     } else if (isWarning) {
         li.classList.add('warning-row');
         if (errorMsgDiv) errorMsgDiv.textContent = validationMessage.trim();
     } else {
          // Clear all error/warning states if validation passed without warnings
          li.classList.remove('invalid-row', 'warning-row');
          li.querySelectorAll('.inline-time-fieldset').forEach(fs => fs.classList.remove('fieldset-invalid', 'fieldset-warning'));
          if (errorMsgDiv) errorMsgDiv.textContent = ''; // Clear error message completely
     }

    // --- Update Data if Validation Passed ---
    if (validationPassed) {
        console.log(`Validation passed for Surah ${surahNum}, Page ${pageNum}. Updating time.`);

         // Update the actual data if it changed
         let dataChanged = false;
         if (timeType === 'start' && pageData.startTime !== startTimeSec) {
             pageData.startTime = startTimeSec;
             pageData.startTimeFormatted = formatTimeWithMs(startTimeSec);
             dataChanged = true;
         } else if (timeType === 'end' && pageData.endTime !== endTimeSec) {
             pageData.endTime = endTimeSec;
             pageData.endTimeFormatted = formatTimeWithMs(endTimeSec);
             dataChanged = true;
         }

        // Save and update timeline ONLY if data actually changed
        if (dataChanged) {
            // Save to Local Storage
            if (typeof saveToLocalStorage === 'function') {
                saveToLocalStorage();
                console.log(`Autosaved changes for page ${pageNum}.`);
                // Add a temporary 'saved' indicator
                 const indicator = document.createElement('span');
                 indicator.textContent = '✓';
                 indicator.className = 'save-indicator';
                 li.querySelector('.action-buttons').appendChild(indicator);
                 setTimeout(() => indicator.remove(), 1500);

            } else {
                console.error("saveToLocalStorage function not found!");
            }

            // Update Timeline
            if (audio && typeof window.renderTimeline === 'function') {
                window.renderTimeline(audio, window.pages);
            }
        } else {
             console.log(`No actual data change detected for page ${pageNum}, skipping save/timeline update.`);
        }

    } else {
         console.warn(`Validation failed for Surah ${surahNum}, Page ${pageNum}. No update.`);
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
        // This replaces the need to manually update the row's content
        if (typeof rebuildPageList === 'function') {
            rebuildPageList();
            console.log("Rebuilt page list after deletion.");
        } else {
            console.error("Cannot rebuild page list after deletion: rebuildPageList not found.");
        }


        // Re-enable the corresponding dynamic marking button in the top section
        const pageMarkingContainer = document.getElementById('pageMarkingContainer');
        if (pageMarkingContainer) {
            const buttonToEnable = pageMarkingContainer.querySelector(
                `button.page-mark-button[data-page="${pageNumber}"][data-surah="${surahNumber}"]`
            );
            if (buttonToEnable) {
                buttonToEnable.disabled = false;
                buttonToEnable.classList.remove('marked');
                buttonToEnable.title = `تحديد نهاية صفحة ${pageNumber}`; // Reset title
                console.log(`Re-enabled marking button for Surah ${surahNumber}, Page ${pageNumber}`);
            } else {
                 console.warn(`Could not find marking button to re-enable for Surah ${surahNumber}, Page ${pageNumber}`);
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