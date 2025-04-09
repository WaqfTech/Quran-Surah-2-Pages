// page-list-management.js

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

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const pageToDelete = parseInt(this.getAttribute('data-page'));
            deletePage(pageToDelete);
        });
    });

    document.querySelectorAll('.edit-button').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const index = parseInt(this.getAttribute('data-index'));
            showTimeEditor(index);
        });
    });
}

// Delete a page marker
function deletePage(pageNumber) {
    const index = pages.findIndex(page => page.page === pageNumber);
    if (index !== -1) {
        pages.splice(index, 1);
        saveToLocalStorage();
        rebuildPageList();

        const successMessage = document.getElementById('successMessage');
        successMessage.textContent = 'تم حذف الصفحة بنجاح';
        successMessage.style.display = 'block';
        setTimeout(() => {
            successMessage.style.display = 'none';
        }, 2000);
    }
}

// Update page list in UI for newly added page
function updatePageList() {
    const pageList = document.getElementById('pageList');

    if (pageList.querySelector('.empty-state')) {
        pageList.innerHTML = '';
    }

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