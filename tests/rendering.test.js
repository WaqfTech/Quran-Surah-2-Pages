/** @jest-environment jsdom */

// Load necessary scripts which will attach functions to window
require('../public_html/js/security-utils.js');
require('../public_html/js/audio-handling.js');
require('../public_html/js/dropdowns.js');

beforeEach(() => {
    // Reset DOM elements needed by the scripts
    document.body.innerHTML = `
        <div id="audioInfoDisplay"></div>
        <select id="surahSelect"></select>
        <div id="pageMarkingContainer"></div>
        <audio id="audio"></audio>
    `;
    // Ensure surahData exists before loading dynamic buttons
    window.surahData = [];
    // Load dynamic buttons AFTER DOM elements and data are present
    jest.isolateModules(() => require('../public_html/js/dynamic-page-buttons.js'));
});

test('updateAudioInfoDisplay does not render HTML from reciterName', () => {
    const audioInfo = document.getElementById('audioInfoDisplay');
    window.reciterName = '<img src=x onerror=alert(1)>evil';
    window.audioFileName = '';

    // Call the function
    if (typeof window.updateAudioInfoDisplay !== 'function') throw new Error('updateAudioInfoDisplay not defined');
    window.updateAudioInfoDisplay();

    // Ensure no HTML tags are present in innerHTML and no angle brackets are present
    expect(audioInfo.innerHTML).not.toMatch(/<script|<img/i);
    expect(audioInfo.textContent).toMatch(/evil/);
    expect(audioInfo.textContent).not.toMatch(/[<>]/);
});

test('dynamic page buttons render safe message for missing or empty surah', () => {
    const surahSelect = document.getElementById('surahSelect');
    const pageMarkingContainer = document.getElementById('pageMarkingContainer');

    // Ensure surahData exists
    window.surahData = [];

    // Trigger DOMContentLoaded listener added by dynamic-page-buttons.js
    document.dispatchEvent(new Event('DOMContentLoaded'));

    // Case 1: empty value
    surahSelect.value = '';
    surahSelect.dispatchEvent(new Event('change'));
    expect(pageMarkingContainer.textContent).toMatch(/الرجاء اختيار السورة/);

    // Case 2: non-existent surah number (simulate user selecting a value)
    const opt = document.createElement('option'); opt.value = '9999'; opt.textContent = 'Surah 9999'; surahSelect.appendChild(opt);
    surahSelect.value = '9999';
    surahSelect.dispatchEvent(new Event('change'));
    expect(pageMarkingContainer.textContent).toMatch(/بيانات السورة رقم 9999 غير موجودة/);
});