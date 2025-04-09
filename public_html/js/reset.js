 // reset.js

 // Add a reset button functionality
 function addResetButton() {
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

        resetButton.addEventListener('click', function() {
            if (confirm('هل أنت متأكد من رغبتك في مسح جميع البيانات؟')) {
                localStorage.removeItem('quranPageMarker');
                pageCounter = 1;
                pages = [];
                document.getElementById('surahSelect').value = '';
                document.getElementById('fileName').textContent = '';
                document.getElementById('audio').src = '';
                rebuildPageList();

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