// js/csv-export.js

// Export button functionality (CSV)
const exportCsvButton = document.getElementById('exportCsvButton');
if (exportCsvButton) {
    exportCsvButton.addEventListener('click', function() {
        const selectedSurahNumber = parseInt(window.currentSurah);
        const reciterNameValue = window.reciterName || 'Reciter';
        const fileQiraat = window.selectedQiraat || 'Not Set';
        const fileRawi = window.selectedRawi || 'Not Set';

        if (typeof window.pages === 'undefined') { alert('لا توجد بيانات صفحات معرفة.'); return; }
        const pagesForCurrentSurah = window.pages.filter(p => p.surahNumber === selectedSurahNumber);
        if (pagesForCurrentSurah.length === 0) { alert(`لا توجد صفحات محددة للسورة المختارة (${selectedSurahNumber}) لتصديرها.`); return; }

        const surahInfo = typeof surahData !== 'undefined' ? surahData.find(s => s.number === selectedSurahNumber) : null;
        const surahName = surahInfo ? surahInfo.englishName : `Surah_${selectedSurahNumber}`;
        const arabicName = surahInfo ? surahInfo.arabicName : '';
        const startPage = surahInfo ? surahInfo.startPage : 'N/A';
        const endPage = surahInfo ? surahInfo.endPage : 'N/A';
        const totalAyas = surahInfo ? surahInfo.totalAyas : 'N/A';

        const sortedPagesForExport = pagesForCurrentSurah.sort((a, b) => a.page - b.page);

        let csvContent = `"Surah Name (En)","Surah Name (Ar)","Surah No.","Reciter","Qiraat","Rawi","Surah Start Page","Surah End Page","Total Ayas"\n`;
        csvContent += `"${surahName}","${arabicName}","${selectedSurahNumber}","${reciterNameValue}","${fileQiraat}","${fileRawi}","${startPage}","${endPage}","${totalAyas}"\n\n`;
        csvContent += `"Marked Page #","Start Time (s)","End Time (s)","Start Time (MM:SS.mmm)","End Time (MM:SS.mmm)"\n`;

        for (let i = 0; i < sortedPagesForExport.length; i++) {
            const page = sortedPagesForExport[i];
            const pageNum = page.page || 'N/A';
            const startTimeSec = page.startTime?.toFixed(3) || 'N/A';
            const endTimeSec = page.endTime?.toFixed(3) || 'N/A';
            const startTimeFormatted = page.startTimeFormatted || 'N/A';
            const endTimeFormatted = page.endTimeFormatted || 'N/A';
            csvContent += `${pageNum},${startTimeSec},${endTimeSec},"${startTimeFormatted}","${endTimeFormatted}"\n`;
        }

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        const filenameSurahPart = surahName.replace(/[^a-z0-9]/gi, '_');
        const filenameReciterPart = reciterNameValue.replace(/[^a-z0-9]/gi, '_') || 'Reciter';
        const filenameQiraatPart = fileQiraat.replace(/[^a-z0-9]/gi, '_') || 'Qiraat';
        const filenameRawiPart = fileRawi.replace(/[^a-z0-9]/gi, '_') || 'Rawi';

        link.setAttribute('href', url);
        link.setAttribute('download', `QuranMarker_${filenameSurahPart}_${filenameReciterPart}_${filenameQiraatPart}_${filenameRawiPart}_timestamps.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

         const successMessage = document.getElementById('successMessage');
         if (successMessage) {
             successMessage.textContent = 'تم تصدير ملف CSV بنجاح!';
             successMessage.style.display = 'block';
             setTimeout(() => { successMessage.style.display = 'none'; }, 3000);
         }
    });
} else { console.warn("CSV Export button (#exportCsvButton) not found."); }


// Import button functionality (JSON)
const importJsonButton = document.getElementById('importButton');
if (importJsonButton) {
    importJsonButton.addEventListener('click', function() {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.json';

        fileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function(event) {
                try {
                    const data = JSON.parse(event.target.result);
                    console.log("Attempting to import data:", data);

                    if (!data || typeof data !== 'object') { throw new Error("Invalid file format: Not a valid JSON object."); }
                    if (!Array.isArray(data.pages)) { data.pages = []; }

                    const importedPages = (data.pages || []).map((p, index) => {
                        const pageNum = parseInt(p?.page) || 0;
                        const surahNum = parseInt(p?.surahNumber) || 0;
                        const startTime = parseFloat(p?.startTime) || 0;
                        const endTime = parseFloat(p?.endTime) || 0;
                        if (pageNum <= 0 || surahNum <= 0 || isNaN(startTime) || isNaN(endTime) || endTime < startTime) {
                            console.warn(`Skipping invalid page data during import at index ${index}:`, p); return null;
                        }
                        return {
                            page: pageNum, surahNumber: surahNum, startTime: startTime, endTime: endTime,
                            startTimeFormatted: typeof formatTimeWithMs === 'function' ? formatTimeWithMs(startTime) : String(startTime),
                            endTimeFormatted: typeof formatTimeWithMs === 'function' ? formatTimeWithMs(endTime) : String(endTime)
                        };
                    }).filter(p => p !== null);

                    importedPages.sort((a, b) => {
                        if (a.surahNumber !== b.surahNumber) return a.surahNumber - b.surahNumber;
                        return a.page - b.page;
                    });

                    window.pages = importedPages;
                    window.currentSurah = String(data.currentSurah || '');
                    window.reciterName = data.reciterName || '';
                    const importedQiraatRawi = data.selectedQiraat || '';
                    window.audioFileName = data.audioFileName || '';

                     if (importedQiraatRawi.includes(' - ')) { [window.selectedQiraat, window.selectedRawi] = importedQiraatRawi.split(' - '); }
                     else { window.selectedQiraat = importedQiraatRawi; window.selectedRawi = ''; }

                    console.log("Successfully processed imported data.");

                    // Update UI elements
                    const surahSelect = document.getElementById('surahSelect'); if (surahSelect) { surahSelect.value = window.currentSurah; }
                    const reciterInput = document.getElementById('reciterInput'); if (reciterInput) reciterInput.value = window.reciterName;
                    const qiraatSelect = document.getElementById('qiraatSelect'); if (qiraatSelect) { qiraatSelect.value = importedQiraatRawi; }
                    const fileNameDisplay = document.getElementById('fileName'); if (fileNameDisplay) fileNameDisplay.textContent = window.audioFileName || 'لم يتم تحميل ملف صوتي';

                    // Save imported state to localStorage IMMEDIATELY
                    if (typeof saveToLocalStorage === 'function') { saveToLocalStorage(); console.log("Saved imported state to localStorage."); }
                    else { console.error("saveToLocalStorage function not found after import."); }

                     // Update Audio Info Display
                     if (typeof window.updateAudioInfoDisplay === 'function') window.updateAudioInfoDisplay();

                    // Trigger UI updates (list, dynamic buttons) via change event
                    if (surahSelect) {
                         console.log("Dispatching change event on Surah select after import.");
                         surahSelect.dispatchEvent(new Event('change')); // This triggers rebuildPageList and generateButtons
                     } else {
                          // Manually call rebuild if select not found (less ideal)
                          if (typeof rebuildPageList === 'function') rebuildPageList();
                     }


                    // Render timeline AFTER UI updates
                    const audio = document.getElementById('audio');
                    if (audio && typeof window.renderTimeline === 'function') {
                          const tryRenderTimeline = () => {
                              if (audio.readyState >= 1 && window.pages && window.pages.length > 0) {
                                  console.log("Rendering timeline after import.");
                                  window.renderTimeline(audio, window.pages);
                              } else { console.log("Timeline not rendered after import: Audio not ready or no pages data."); }
                          };
                          setTimeout(tryRenderTimeline, 100);
                     }

                    const successMessage = document.getElementById('successMessage');
                    if (successMessage) {
                        successMessage.textContent = 'تم استيراد الإعدادات بنجاح!';
                        successMessage.style.display = 'block';
                        setTimeout(() => { successMessage.style.display = 'none'; }, 3000);
                    }

                } catch (error) {
                    alert('فشل استيراد الإعدادات: ' + error.message);
                    console.error("Import Error:", error);
                }
            };
            reader.onerror = (error) => { alert('فشل قراءة الملف.'); console.error("File Reading Error:", error); };
            reader.readAsText(file);
        });
        fileInput.click();
    });
} else { console.warn("Import JSON button (#importButton) not found."); }