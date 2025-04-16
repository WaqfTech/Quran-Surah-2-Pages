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