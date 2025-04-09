// Initialize state
let pageCounter = 1;
let pages = [];
let currentSurah = '';
let audioFileName = '';
let editingPageIndex = -1;

// Load saved data from localStorage when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadFromLocalStorage();
    setupAudioTimeDisplay();
    addResetButton();
});

// Function to save current state to localStorage
function saveToLocalStorage() {
    const surahName = document.getElementById('surahInput').value;
    const data = {
        surahName: surahName,
        pageCounter: pageCounter,
        pages: pages,
        audioFileName: audioFileName
    };
    localStorage.setItem('quranPageMarker', JSON.stringify(data));
}

// Function to load data from localStorage
function loadFromLocalStorage() {
    const storedData = localStorage.getItem('quranPageMarker');
    if (storedData) {
        const data = JSON.parse(storedData);
        
        // Restore state variables
        pageCounter = data.pageCounter || 1;
        pages = data.pages || [];
        currentSurah = data.surahName || '';
        audioFileName = data.audioFileName || '';
        
        // Restore UI
        document.getElementById('surahInput').value = currentSurah;
        document.getElementById('fileName').textContent = audioFileName;
        
        // Rebuild page list
        rebuildPageList();
        
        // Show success message if there's saved data
        if (pages.length > 0) {
            const successMessage = document.getElementById('successMessage');
            successMessage.textContent = 'تم استعادة البيانات المحفوظة';
            successMessage.style.display = 'block';
            setTimeout(() => {
                successMessage.style.display = 'none';
            }, 3000);
        }
    }
    window.renderTimeline(document.getElementById('audio'), pages);

}

// Setup audio time display with milliseconds
function setupAudioTimeDisplay() {
    const audio = document.getElementById('audio');
    const currentTimeDisplay = document.getElementById('currentTimeDisplay');
    const durationDisplay = document.getElementById('durationDisplay');
    const audioSeeker = document.getElementById('audioSeeker');
    
    // Update time displays and seeker position
    audio.addEventListener('timeupdate', function() {
        // Update current time display with milliseconds
        currentTimeDisplay.textContent = formatTimeWithMs(audio.currentTime);
        
        // Update seeker position
        if (!isNaN(audio.duration)) {
            const percent = (audio.currentTime / audio.duration) * 100;
            audioSeeker.value = percent;
        }
    });
    
    // Set max duration when metadata is loaded
    audio.addEventListener('loadedmetadata', function() {
        durationDisplay.textContent = formatTimeWithMs(audio.duration);
        audioSeeker.min = 0;
        audioSeeker.max = 100;
    });
    
    // Seek when the range input changes
    audioSeeker.addEventListener('input', function() {
        if (!isNaN(audio.duration)) {
            const seekTime = (audioSeeker.value / 100) * audio.duration;
            audio.currentTime = seekTime;
            currentTimeDisplay.textContent = formatTimeWithMs(seekTime);
        }
    });
    
    // Regular update for smoother time display
    setInterval(function() {
        if (!audio.paused) {
            currentTimeDisplay.textContent = formatTimeWithMs(audio.currentTime);
        }
    }, 10); // Update every 10ms for smooth millisecond display
}

// Rebuild entire page list from saved data
function rebuildPageList() {
    const pageList = document.getElementById('pageList');
    
    if (pages.length === 0) {
        pageList.innerHTML = '<div class="empty-state">لم يتم تحديد أي صفحات بعد</div>';
        return;
    }
    
    pageList.innerHTML = '';
    pages.forEach((page, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div class="page-info">
                <span class="page-number">${page.page}</span>
            </div>
            <div class="time-display">
                <span>${page.timeFormatted}</span>
                <button class="edit-button" data-index="${index}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                </button>
                <button class="delete-btn" data-page="${page.page}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M3 6h18"></path>
                        <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"></path>
                        <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
                    </svg>
                </button>
            </div>
        `;
        pageList.appendChild(li);
    });
    
    // Add event listeners to delete buttons
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const pageToDelete = parseInt(this.getAttribute('data-page'));
            deletePage(pageToDelete);
        });
    });
    
    // Add event listeners to edit buttons
    document.querySelectorAll('.edit-button').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const index = parseInt(this.getAttribute('data-index'));
            showTimeEditor(index);
        });
    });
}

// Show time editor interface for a specific page
function showTimeEditor(index) {
    editingPageIndex = index;
    const page = pages[index];
    
    // Create or update edit form
    let editForm = document.getElementById('editTimeForm');
    if (!editForm) {
        editForm = document.createElement('div');
        editForm.id = 'editTimeForm';
        editForm.className = 'edit-time-form';
        document.querySelector('.audio-container').after(editForm);
    }
    
    // Parse the time into minutes, seconds, milliseconds
    const time = page.time;
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    const milliseconds = Math.floor((time % 1) * 1000);
    
    // Update form content
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
    
    // Make the edit form visible
    editForm.classList.add('active');
    
    // Add event listeners for the buttons
    document.getElementById('saveTimeEdit').addEventListener('click', saveTimeEdit);
    document.getElementById('cancelTimeEdit').addEventListener('click', cancelTimeEdit);
    
    // Set focus to minutes input
    document.getElementById('editMinutes').focus();
}

// Save edited time
function saveTimeEdit() {
    if (editingPageIndex === -1) return;
    
    const minutes = parseInt(document.getElementById('editMinutes').value) || 0;
    const seconds = parseInt(document.getElementById('editSeconds').value) || 0;
    const milliseconds = parseInt(document.getElementById('editMilliseconds').value) || 0;
    
    // Calculate time in seconds
    const newTime = minutes * 60 + seconds + (milliseconds / 1000);
    
    // Update the page object
    pages[editingPageIndex].time = newTime;
    pages[editingPageIndex].timeFormatted = formatTimeWithMs(newTime);
    
    // Save to localStorage
    saveToLocalStorage();
    
    // Rebuild the page list
    rebuildPageList();
    
    // Remove the edit form
    const editForm = document.getElementById('editTimeForm');
    if (editForm) {
        editForm.classList.remove('active');
        setTimeout(() => {
            editForm.remove();
        }, 300);
    }
    
    // Reset editing state
    editingPageIndex = -1;
    
    // Show success message
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

// Delete a page marker
function deletePage(pageNumber) {
    // Find the index of the page to delete
    const index = pages.findIndex(page => page.page === pageNumber);
    if (index !== -1) {
        // Remove the page from the array
        pages.splice(index, 1);
        // Update localStorage
        saveToLocalStorage();
        // Rebuild the UI
        rebuildPageList();
        
        // Show success message
        const successMessage = document.getElementById('successMessage');
        successMessage.textContent = 'تم حذف الصفحة بنجاح';
        successMessage.style.display = 'block';
        setTimeout(() => {
            successMessage.style.display = 'none';
        }, 2000);
    }
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

// Update page list in UI for newly added page
function updatePageList() {
    const pageList = document.getElementById('pageList');
    
    // Clear empty state if needed
    if (pageList.querySelector('.empty-state')) {
        pageList.innerHTML = '';
    }
    
    // Create new list item
    const li = document.createElement('li');
    const lastPage = pages[pages.length - 1];
    const lastIndex = pages.length - 1;
    
    li.innerHTML = `
        <div class="page-info">
            <span class="page-number">${lastPage.page}</span>
        </div>
        <div class="time-display">
            <span>${lastPage.timeFormatted}</span>
            <button class="edit-button" data-index="${lastIndex}">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
            </button>
            <button class="delete-btn" data-page="${lastPage.page}">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 6h18"></path>
                    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"></path>
                    <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
                </svg>
            </button>
        </div>
    `;
    
    pageList.appendChild(li);
    
    // Add event listeners to the buttons
    li.querySelector('.delete-btn').addEventListener('click', function(e) {
        e.stopPropagation();
        const pageToDelete = parseInt(this.getAttribute('data-page'));
        deletePage(pageToDelete);
    });
    
    li.querySelector('.edit-button').addEventListener('click', function(e) {
        e.stopPropagation();
        const index = parseInt(this.getAttribute('data-index'));
        showTimeEditor(index);
    });
}

// Add a reset button functionality
function addResetButton() {
    // Create reset button if it doesn't exist yet
    if (!document.getElementById('resetButton')) {
        const buttonsContainer = document.querySelector('.buttons-container');
        const resetButton = document.createElement('button');
        resetButton.id = 'resetButton';
        resetButton.style.backgroundColor = '#dc3545';
        resetButton.innerHTML = `
            مسح البيانات
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
        `;
        buttonsContainer.appendChild(resetButton);
        
        // Add event listener to reset button
        resetButton.addEventListener('click', function() {
            if (confirm('هل أنت متأكد من رغبتك في مسح جميع البيانات؟')) {
                localStorage.removeItem('quranPageMarker');
                pageCounter = 1;
                pages = [];
                document.getElementById('surahInput').value = '';
                document.getElementById('fileName').textContent = '';
                document.getElementById('audio').src = '';
                rebuildPageList();
                
                // Show success message
                const successMessage = document.getElementById('successMessage');
                successMessage.textContent = 'تم مسح جميع البيانات بنجاح';
                successMessage.style.display = 'block';
                setTimeout(() => {
                    successMessage.style.display = 'none';
                }, 2000);
            }
        });
    }
}

// Set up event listeners for DOM elements
document.addEventListener('DOMContentLoaded', function() {
    // Display file name when selected and save to localStorage
    document.getElementById('audioFile').addEventListener('change', function(e) {
        if (e.target.files[0]) {
            audioFileName = e.target.files[0].name;
            document.getElementById('fileName').textContent = audioFileName;
            
            // Load the audio file
            const audio = document.getElementById('audio');
            const fileURL = URL.createObjectURL(e.target.files[0]);
            audio.src = fileURL;
            
            // Save state to localStorage
            saveToLocalStorage();
        }
    });
    
    // Save surah name when it changes
    document.getElementById('surahInput').addEventListener('input', function() {
        currentSurah = this.value;
        saveToLocalStorage();
    });
    
    // Mark page button functionality
    document.getElementById('markButton').addEventListener('click', function() {
        
        const audio = document.getElementById('audio');
        if (audio.src) {
            const currentTime = audio.currentTime;
            const timeFormatted = formatTimeWithMs(currentTime);
            
            // Add to pages array
            pages.push({
                page: pageCounter,
                time: currentTime,
                timeFormatted: timeFormatted
            });
            
            // Update UI
            updatePageList();
            
            // Save to localStorage
            saveToLocalStorage();
            
            // Show success message
            const successMessage = document.getElementById('successMessage');
            successMessage.textContent = 'تم تحديد نهاية الصفحة بنجاح!';
            successMessage.style.display = 'block';
            setTimeout(() => {
                successMessage.style.display = 'none';
            }, 2000);
            
            // Increment page counter
            pageCounter++;
            // After incrementing pageCounter
window.renderTimeline(document.getElementById('audio'), pages);

        } else {
            alert('الرجاء اختيار ملف صوتي أولاً');
        }
    });
    
    // Export button functionality
    document.getElementById('exportButton').addEventListener('click', function() {
        const surahName = document.getElementById('surahInput').value.trim() || 'سورة';
        if (pages.length === 0) {
            alert('لا توجد صفحات لتصديرها');
            return;
        }
        
        // Create CSV content
        let csvContent = 'Page,Time,TimeFormatted\n';
        pages.forEach(page => {
            csvContent += `${page.page},${page.time},${page.timeFormatted}\n`;
        });
        
        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `${surahName}_pages.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
});