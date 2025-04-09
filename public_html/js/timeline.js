window.renderTimeline = function(audio, pages) {
    const timeline = document.getElementById("timeline");

    if (!timeline || !audio || !audio.duration || pages.length === 0) return;

    timeline.innerHTML = ""; // Clear previous segments
    timeline.style.cursor = 'pointer'; // Add a hover feedback

    const duration = audio.duration;

    pages.forEach((page, index) => {
        const start = index === 0 ? 0 : pages[index - 1].time;
        const end = page.time;

        const segment = document.createElement("div");
        segment.className = "timeline-segment";
        segment.style.position = "absolute"; // Ensure proper positioning
        segment.style.top = "0";  //stick to top
        segment.style.height = "100%"; //take full height

        const startPct = (start / duration) * 100;
        const widthPct = ((end - start) / duration) * 100;

        segment.style.left = `${startPct}%`;
        segment.style.width = `${widthPct}%`;

        // Add click handler to seek to page's time
        segment.addEventListener("click", () => {
            audio.currentTime = end;
            audio.play(); // Optionally play after seeking.  Remove if unwanted
        });

        timeline.appendChild(segment);
    });
};