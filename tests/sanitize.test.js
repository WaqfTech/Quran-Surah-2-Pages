/** @jest-environment jsdom */

require('../public_html/js/security-utils.js');

test('sanitizeUserText removes angle brackets and limits length', () => {
    const evil = '<img src=x onerror=alert(1)>\n';
    const cleaned = window.sanitizeUserText(evil, 100);
    expect(cleaned).not.toMatch(/[<>]/);
    expect(cleaned.length).toBeGreaterThan(0);

    const long = 'a'.repeat(500);
    const truncated = window.sanitizeUserText(long, 200);
    expect(truncated.length).toBe(200);
});