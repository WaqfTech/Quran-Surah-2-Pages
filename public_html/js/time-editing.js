// js/time-editing.js

// This file is now DEPRECATED as the editing functionality
// has been moved inline into the page list in page-list-management.js

console.warn("DEPRECATED: time-editing.js functionality is now inline within page-list-management.js. This file can be removed.");

// Keeping the parseTimeToSeconds function in case it's needed elsewhere,
// although it's not directly used by the new inline editing which uses number inputs.
/*
function parseTimeToSeconds(timeString) {
    if (timeString === null || typeof timeString === 'undefined') return 0;
    timeString = String(timeString); // Ensure it's a string

    const parts = timeString.split(':');
    let totalSeconds = 0;

    try {
        if (parts.length === 3) { // HH:MM:SS.mmm
            const ssmmm = parts[2].split('.');
            const ms = parseInt(ssmmm[1]?.padEnd(3, '0') || '0', 10);
            totalSeconds = (parseInt(parts[0], 10) * 3600) + (parseInt(parts[1], 10) * 60) + parseInt(ssmmm[0], 10) + (ms / 1000);
        } else if (parts.length === 2) { // MM:SS.mmm
            const ssmmm = parts[1].split('.');
            const ms = parseInt(ssmmm[1]?.padEnd(3, '0') || '0', 10);
            totalSeconds = (parseInt(parts[0], 10) * 60) + parseInt(ssmmm[0], 10) + (ms / 1000);
        } else if (parts.length === 1) { // SS.mmm or SSS
             const ssmmm = parts[0].split('.');
             const ms = parseInt(ssmmm[1]?.padEnd(3, '0') || '0', 10);
             totalSeconds = parseInt(ssmmm[0], 10) + (ms / 1000);
        }
    } catch (e) {
        console.error("Error parsing time string:", timeString, e);
        return 0; // Return 0 on parsing error
    }

    return isNaN(totalSeconds) ? 0 : Math.max(0, totalSeconds); // Return 0 if NaN, ensure non-negative
}
*/

// Functions showStartEndTimeEditor, saveStartEndTimeEdit, cancelStartEndTimeEdit are removed.
// Variable localCurrentEditingIndex is removed.