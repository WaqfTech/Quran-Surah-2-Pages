// js/security-utils.js
// Small utility functions to sanitize and escape user-supplied text before rendering.

(function() {
    /**
     * Sanitize user-provided text by removing control characters and angle brackets,
     * trimming the string and enforcing a maximum length.
     * Returns a safe plain string (no HTML) that can be used as textContent or input values.
     */
    function sanitizeUserText(str, maxLen = 200) {
        if (str === undefined || str === null) return '';
        let s = String(str);
        // Remove control characters and angle brackets to prevent HTML injection
        s = s.replace(/[\u0000-\u001F\u007F<>]/g, '');
        s = s.trim();
        if (s.length > maxLen) s = s.slice(0, maxLen);
        return s;
    }

    /**
     * Escape characters for use in HTML text contexts. Useful if you ever need
     * to insert the value into innerHTML (which we avoid), but provided for completeness.
     */
    function escapeHtml(str) {
        if (str === undefined || str === null) return '';
        return String(str).replace(/[&<>"']/g, function(m) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[m];
        });
    }

    window.sanitizeUserText = sanitizeUserText;
    window.escapeHtml = escapeHtml;
})();
