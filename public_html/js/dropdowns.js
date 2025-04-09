// dropdowns.js

// Function to populate the Surah dropdown
function setupSurahDropdown() {
    const surahSelect = document.getElementById('surahSelect');

    surahData.forEach(surah => {
        const option = document.createElement('option');
        option.value = surah.englishName;
        option.textContent = `${surah.number} - ${surah.englishName} (${surah.arabicName})`;
        surahSelect.appendChild(option);
    });

    surahSelect.addEventListener('change', function() {
        currentSurah = this.value;
        saveToLocalStorage();
    });
}

// Function to add reciter input field
function addReciterInput() {
    if (!document.getElementById('reciterInput')) {
        const formGroup = document.createElement('div');
        formGroup.className = 'form-group';

        const label = document.createElement('label');
        label.setAttribute('for', 'reciterInput');
        label.textContent = 'اسم القارئ';

        const input = document.createElement('input');
        input.setAttribute('type', 'text');
        input.setAttribute('id', 'reciterInput');
        input.setAttribute('placeholder', 'أدخل اسم القارئ');

        formGroup.appendChild(label);
        formGroup.appendChild(input);

        const surahSelect = document.getElementById('surahSelect');
        surahSelect.parentNode.insertBefore(formGroup, surahSelect.nextSibling);

        reciterName = localStorage.getItem('reciterName') || '';
        input.value = reciterName;

        input.addEventListener('input', function() {
            reciterName = this.value;
            localStorage.setItem('reciterName', reciterName);
            saveToLocalStorage();
        });
    }
}

// Function to populate the Qira'at dropdown with Rawat
function setupQiraatDropdown() {
    const qiraatSelect = document.getElementById('qiraatSelect');

    qiraatData.forEach(qiraat => {
        // Add the Qira'at itself as an option
        const qiraatOption = document.createElement('option');
        qiraatOption.value = qiraat.name; // Store only the Qira'at name
        qiraatOption.textContent = `${qiraat.name} (قراءة)`; // Add "(Qira'ah)" to the display text
        qiraatOption.setAttribute('data-type', 'qiraat'); // Add data attribute
        qiraatSelect.appendChild(qiraatOption);

        // Add each Rawi as a separate option under the Qira'at
        qiraat.rawat.forEach(rawi => {
            const rawiOption = document.createElement('option');
            rawiOption.value = `${qiraat.name} - ${rawi.name}`; // Store "Qira'at - Rawi"
            rawiOption.textContent = `  - ${rawi.name} (راوي)`;   // Indent Rawi and add "(Rawi)"
            rawiOption.setAttribute('data-type', 'rawi'); // Add data attribute
            qiraatSelect.appendChild(rawiOption);
        });
    });

    qiraatSelect.addEventListener('change', function() {
        selectedQiraat = this.value;
        saveToLocalStorage();
    });
}