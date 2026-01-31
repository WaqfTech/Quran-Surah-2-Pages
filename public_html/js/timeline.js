// js/timeline.js

window.renderTimeline = function(audio, pagesArray) {
    const timeline = document.getElementById("timeline");
    const localAudio = audio || document.getElementById('audio');

    // Clear timeline content and reset cursor
    if (timeline) {
        while (timeline.firstChild) timeline.removeChild(timeline.firstChild); // Clear previous segments and numbers
        timeline.style.cursor = 'default';
    } else {
        console.error("Timeline element not found.");
        return;
    }

    // Basic checks for valid audio and data
    if (!localAudio || isNaN(localAudio.duration) || localAudio.duration <= 0 || typeof pagesArray === 'undefined') {
        console.log("Timeline render skipped: No audio/duration/pages data.");
        return;
    }

    // Filter pages to only include those with valid numeric times
    const validPages = pagesArray.filter(page =>
        typeof page.startTime === 'number' && !isNaN(page.startTime) &&
        typeof page.endTime === 'number' && !isNaN(page.endTime) &&
        page.endTime >= page.startTime && // Ensure end is not before start
        typeof page.page === 'number' // Ensure page number exists
    );

    // Sort by start time for correct visual order and overlap handling (if any)
    const sortedPages = [...validPages].sort((a, b) => a.startTime - b.startTime);

    if (sortedPages.length === 0) {
        console.log("Timeline render skipped: No valid page segments with time data to render.");
        return; // Nothing to render
    }

    timeline.style.cursor = 'pointer'; // Set cursor only if there's something to click
    const duration = localAudio.duration;

    sortedPages.forEach((page) => {
        const start = page.startTime;
        const end = page.endTime;

        // Clamp end time to duration if it exceeds
        const clampedEnd = Math.min(end, duration);

        // Ensure start time is within duration as well
        if (start >= duration) {
             console.warn(`Skipping segment for page ${page.page} (Surah ${page.surahNumber}): start=${start} is beyond duration=${duration}`);
             return;
        }

        const segment = document.createElement("div");
        segment.className = "timeline-segment";

        const startPct = (start / duration) * 100;
        const widthPct = Math.max(0, ((clampedEnd - start) / duration) * 100);

        // Final check on percentages
        if (isNaN(startPct) || isNaN(widthPct) || startPct > 100 || widthPct <= 0) { // Segment needs some width
            console.warn(`Invalid percentage/width for page ${page.page}: startPct=${startPct}, widthPct=${widthPct}. Skipping segment.`);
            return;
        }

        segment.style.left = `${startPct}%`;
        segment.style.width = `${widthPct}%`;
        segment.title = `صفحة ${page.page} (سورة ${page.surahNumber})\n${page.startTimeFormatted} - ${page.endTimeFormatted}`;

        // --- ADD PAGE NUMBER ---
        const pageNumberSpan = document.createElement("span");
        pageNumberSpan.className = "timeline-page-number";
        pageNumberSpan.textContent = page.page;
        segment.appendChild(pageNumberSpan);
        // --- END ADD PAGE NUMBER ---

        segment.addEventListener("click", () => {
            if (localAudio) {
                 localAudio.currentTime = start; // Seek to the start time of the segment
            }
        });

        timeline.appendChild(segment);
    });
};