// Export settings function
function exportSettings() {
    const data = {
        pageCounter: pageCounter,
        pages: pages,
        currentSurah: document.getElementById('surahSelect').value,
        reciterName: document.getElementById('reciterInput').value,
        selectedQiraat: document.getElementById('qiraatSelect').value,
        audioFileName: audioFileName,
    };

    const json = JSON.stringify(data);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'quran_settings.json'; // Set the download filename
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

document.getElementById('exportButton').addEventListener('click', exportSettings);