// time-editing.js

// Show time editor interface for a specific page
function showTimeEditor(index) {
    editingPageIndex = index;
    const page = pages[index];

    let editForm = document.getElementById('editTimeForm');
    if (!editForm) {
        editForm = document.createElement('div');
        editForm.id = 'editTimeForm';
        editForm.className = 'edit-time-form';
        document.querySelector('.audio-container').after(editForm);
    }

    const time = page.time;
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    const milliseconds = Math.floor((time % 1) * 1000);

    editForm.innerHTML = `
        <span class="edit-time-label">تعديل زمن الصفحة ${page.page}:</span>
        <div class="time-input-container">
            <input type="number" class="time-input" id="editMinutes" min="0" value="${minutes}" />
            <span class="time-separator">:</span>
            <input type="number" class="time-input" id="editSeconds" min="0" max="59" value="${seconds}" />
            <span class="time-separator">.</span>
            <input type="number" class="time-input time-input-ms" id="editMilliseconds" min="0" max="999" value="${milliseconds}" />
        </div>
        <div class="time-edit-actions">
            <button class="cancel-time-btn" id="cancelTimeEdit">إلغاء</button>
            <button class="save-time-btn" id="saveTimeEdit">حفظ</button>
        </div>
    `;

    editForm.classList.add('active');

    document.getElementById('saveTimeEdit').addEventListener('click', saveTimeEdit);
    document.getElementById('cancelTimeEdit').addEventListener('click', cancelTimeEdit);

    document.getElementById('editMinutes').focus();
}

// Save edited time
function saveTimeEdit() {
    if (editingPageIndex === -1) return;

    const minutes = parseInt(document.getElementById('editMinutes').value) || 0;
    const seconds = parseInt(document.getElementById('editSeconds').value) || 0;
    const milliseconds = parseInt(document.getElementById('editMilliseconds').value) || 0;

    const newTime = minutes * 60 + seconds + (milliseconds / 1000);

    pages[editingPageIndex].time = newTime;
    pages[editingPageIndex].timeFormatted = formatTimeWithMs(newTime);

    saveToLocalStorage();

    rebuildPageList();

    const editForm = document.getElementById('editTimeForm');
    if (editForm) {
        editForm.classList.remove('active');
        setTimeout(() => {
            editForm.remove();
        }, 300);
    }

    editingPageIndex = -1;

    const successMessage = document.getElementById('successMessage');
    successMessage.textContent = 'تم تعديل الوقت بنجاح';
    successMessage.style.display = 'block';
    setTimeout(() => {
        successMessage.style.display = 'none';
    }, 2000);
}

// Cancel time editing
function cancelTimeEdit() {
    const editForm = document.getElementById('editTimeForm');
    if (editForm) {
        editForm.classList.remove('active');
        setTimeout(() => {
            editForm.remove();
        }, 300);
    }
    editingPageIndex = -1;
}