// dropdowns.js

// Function to populate the Surah dropdown
function setupSurahDropdown() {
    const surahSelect = document.getElementById('surahSelect');
    if (!surahSelect) { console.error("Surah select element (#surahSelect) not found."); return; }
    surahSelect.innerHTML = '<option value="">اختر سورة</option>';
    if (typeof surahData === 'undefined') { console.error("surahData is not defined."); return; }

    surahData.forEach(surah => {
        const option = document.createElement('option');
        option.value = surah.number;
        option.textContent = `${surah.number} - ${surah.englishName} (${surah.arabicName}) [صفحات ${surah.startPage}-${surah.endPage}]`;
        surahSelect.appendChild(option);
    });

    surahSelect.removeEventListener('change', handleSurahChange);
    surahSelect.addEventListener('change', handleSurahChange);
}

// Handler function for Surah selection change
function handleSurahChange() {
    const selectedValue = this.value;
    if (typeof window.currentSurah === 'undefined') { console.error("Global 'currentSurah' variable not initialized!"); return; }

    if (window.currentSurah !== selectedValue) {
        console.log(`Surah changed to: ${selectedValue}`);
        window.currentSurah = selectedValue;

        if (typeof saveToLocalStorage === 'function') saveToLocalStorage(); else console.warn("saveToLocalStorage function not found.");
        if (typeof rebuildPageList === 'function') rebuildPageList(); else console.error("rebuildPageList function not found.");
        if (typeof window.updateAudioInfoDisplay === 'function') window.updateAudioInfoDisplay(); else console.warn("updateAudioInfoDisplay function not found.");

        // Dynamic page MARKING buttons are handled by a separate listener in dynamic-page-buttons.js
    }
}

// Function to add/manage reciter input field
function addReciterInput() {
    let reciterInputElement = document.getElementById('reciterInput');
    if (!reciterInputElement) {
        console.log("Creating reciter input element.");
        const formGroup = document.createElement('div');
        formGroup.className = 'form-group';
        const label = document.createElement('label');
        label.setAttribute('for', 'reciterInput');
        label.textContent = 'اسم القارئ';
        reciterInputElement = document.createElement('input');
        reciterInputElement.setAttribute('type', 'text');
        reciterInputElement.setAttribute('id', 'reciterInput');
        reciterInputElement.setAttribute('placeholder', 'أدخل اسم القارئ (اختياري)');
        formGroup.appendChild(label);
        formGroup.appendChild(reciterInputElement);

        const surahSelectGroup = document.getElementById('surahSelect')?.closest('.form-group');
        if (surahSelectGroup && surahSelectGroup.parentNode) {
            surahSelectGroup.parentNode.insertBefore(formGroup, surahSelectGroup.nextSibling);
            console.log("Inserted reciter input after Surah select group.");
        } else {
             console.warn("Surah select group not found or has no parent, attempting fallback insertion.");
             const mainCard = document.querySelector('.container > .card:first-of-type');
             if (mainCard) {
                 const qiraatSelectGroup = mainCard.querySelector('#qiraatSelect')?.closest('.form-group');
                 if (qiraatSelectGroup) { mainCard.insertBefore(formGroup, qiraatSelectGroup); }
                 else { mainCard.appendChild(formGroup); }
             } else { console.error("Cannot find suitable location to insert Reciter input."); }
        }
    } else { console.log("Reciter input element already exists."); }

    if (reciterInputElement) {
        if (typeof window.reciterName === 'undefined') { window.reciterName = ''; }
        reciterInputElement.value = window.reciterName;
        reciterInputElement.removeEventListener('input', handleReciterInput);
        reciterInputElement.addEventListener('input', handleReciterInput);
    } else { console.error("Failed to find or create the reciter input element (#reciterInput)."); }
}

// Handler for reciter input changes
function handleReciterInput() {
    if (typeof window.reciterName !== 'undefined') {
        window.reciterName = this.value;
        if (typeof saveToLocalStorage === 'function') saveToLocalStorage();
        if (typeof window.updateAudioInfoDisplay === 'function') window.updateAudioInfoDisplay(); // Update info display
    } else { console.error("Global 'reciterName' not defined during input event."); }
}

// Function to populate the Qira'at dropdown with Rawat
function setupQiraatDropdown() {
    const qiraatSelect = document.getElementById('qiraatSelect');
    if (!qiraatSelect) { console.error("Qiraat select element (#qiraatSelect) not found."); return; }
    qiraatSelect.innerHTML = '<option value="">اختر القراءة / الراوي (اختياري)</option>';
    if (typeof qiraatData === 'undefined') { console.error("qiraatData is not defined."); return; }

    qiraatData.forEach(qiraat => {
        const qiraatOption = document.createElement('option');
        qiraatOption.value = qiraat.name;
        qiraatOption.textContent = `${qiraat.name} (قراءة)`;
        qiraatOption.setAttribute('data-type', 'qiraat');
        qiraatSelect.appendChild(qiraatOption);
        qiraat.rawat.forEach(rawi => {
            const rawiOption = document.createElement('option');
            rawiOption.value = `${qiraat.name} - ${rawi.name}`;
            rawiOption.textContent = `  - ${rawi.name} (راوي)`;
            rawiOption.setAttribute('data-type', 'rawi');
            qiraatSelect.appendChild(rawiOption);
        });
    });

    qiraatSelect.removeEventListener('change', handleQiraatChange);
    qiraatSelect.addEventListener('change', handleQiraatChange);
}

// Handler function for Qira'at/Rawi selection change
function handleQiraatChange() {
    const selectedValue = this.value.trim();
    if (typeof window.selectedQiraat === 'undefined') window.selectedQiraat = '';
    if (typeof window.selectedRawi === 'undefined') window.selectedRawi = '';

    let qiraatChanged = false;
    let newQiraat = '';
    let newRawi = '';
    if (selectedValue.includes(' - ')) { [newQiraat, newRawi] = selectedValue.split(' - '); }
    else if (selectedValue !== '') { newQiraat = selectedValue; newRawi = ''; }

    if (window.selectedQiraat !== newQiraat || window.selectedRawi !== newRawi) {
        qiraatChanged = true;
        window.selectedQiraat = newQiraat;
        window.selectedRawi = newRawi;
        console.log(`Qiraat/Rawi changed: Qiraat='${window.selectedQiraat}', Rawi='${window.selectedRawi}'`);
        if (typeof saveToLocalStorage === 'function') saveToLocalStorage(); else console.warn("saveToLocalStorage function not found.");
        if (typeof window.updateAudioInfoDisplay === 'function') window.updateAudioInfoDisplay(); // Update info display
    }
}