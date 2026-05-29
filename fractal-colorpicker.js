
// ====================================================================
// GLOBAL INTERACTIVE COSMIC HUE SUBSYSTEM
// ====================================================================


// ====================================================================
// NATIVE BROWSER COLOR CONVERSION STATE ENGINE
// ====================================================================

// Initialize the global tracking parameter across your workspace scripts
window.globalUserHue = 120; // Default Emerald Green terminal baseline

document.addEventListener("DOMContentLoaded", () => {
    const picker = document.getElementById('native-color-picker');
    
    if (picker) {
        // Listen to the native picker wheel as you select colors
        picker.addEventListener('input', (e) => {
            const hexColor = e.target.value; // Captures clean values like #ff9100
            
            // Translate the Hex string into standard HSL degrees so your canvas matches
            window.globalUserHue = hexToHue(hexColor);
            
            // Dynamically update the neon glow surrounding your square button
            picker.style.boxShadow = `0 0 10px hsl(${window.globalUserHue}, 100%, 50%)`;
        });
    }
});

// Helper function to extract Hue degrees from a raw Hex color string
function hexToHue(hex) {
    hex = hex.replace(/^#/, '');
    let r = parseInt(hex.substring(0, 2), 16) / 255;
    let g = parseInt(hex.substring(2, 4), 16) / 255;
    let b = parseInt(hex.substring(4, 6), 16) / 255;

    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0;

    if (max !== min) {
        let d = max - min;
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return Math.floor(h * 360);
}
