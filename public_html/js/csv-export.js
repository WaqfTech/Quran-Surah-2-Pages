// csv-export.js

// Export button functionality
document.getElementById('exportButton').addEventListener('click', function() {
    const surahName = document.getElementById('surahSelect').value.trim() || 'سورة';
    const reciterName = document.getElementById('reciterInput').value.trim() || 'القارئ';
    const selectedValue = document.getElementById('qiraatSelect').value.trim() || 'غير محدد';
    let selectedQiraat = '';
    let selectedRawi = '';
    if (selectedValue.includes('-')) {
        [selectedQiraat, selectedRawi] = selectedValue.split(' - ');
    } else {
        selectedQiraat = selectedValue;
        selectedRawi = 'غير محدد';
    }
    
    if (pages.length === 0) {
        alert('لا توجد صفحات لتصديرها');
        return;
    }

    let csvContent = 'Surah,Reciter,Qiraat,Rawi,Page #,Start Time,End Time\n';
    for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const endTime = page.timeFormatted;

        let startTime = "00:00.000";
        if (i > 0) {
            startTime = pages[i - 1].timeFormatted;
        }
        csvContent += `${surahName},${reciterName},${selectedQiraat},${selectedRawi},${page.page},${startTime},${endTime}\n`;
    }

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

// Import button functionality (JSON)
document.getElementById('importButton').addEventListener('click', function() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json'; // Only allow JSON files

    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) {
            return; // No file selected
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                // Restore state from the imported data
                pageCounter = data.pageCounter || 1;
                pages = data.pages || [];
                currentSurah = data.currentSurah || '';
                reciterName = data.reciterName || '';
                selectedQiraat = data.selectedQiraat || '';
                audioFileName = data.audioFileName || '';

                // Update UI elements
                document.getElementById('surahSelect').value = currentSurah;
                document.getElementById('reciterInput').value = reciterName;
                document.getElementById('qiraatSelect').value = selectedQiraat;
                document.getElementById('fileName').textContent = audioFileName;
                document.getElementById('audio').src = audioFileName;

                // Save the reciter name to local storage
                localStorage.setItem('reciterName', reciterName);
                saveToLocalStorage();

                rebuildPageList();
                window.renderTimeline(document.getElementById('audio'), pages);


                // Display success message
                const successMessage = document.getElementById('successMessage');
                successMessage.textContent = 'تم استيراد الإعدادات بنجاح!';
                successMessage.style.display = 'block';
                setTimeout(() => {
                    successMessage.style.display = 'none';
                }, 3000);

            } catch (error) {
                alert('فشل استيراد الإعدادات: ' + error);
            }
        };

        reader.readAsText(file);
    });

    fileInput.click(); // Programmatically trigger the file input
});