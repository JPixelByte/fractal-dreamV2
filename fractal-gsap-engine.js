// Target all navigation items for GSAP hover interactions
const navItems = document.querySelectorAll('.nav-item');
// Select all navigation items from the bottom toolbar layout
// const bottomNavItems = document.querySelectorAll('.nav-item');

navItems.forEach(item => {
    // Smooth magnetic float up on hover
    item.addEventListener('mouseenter', () => {
        gsap.to(item, { y: 0, duration: 0.3, ease: "power2.out" });
         // Trigger the synchronized cosmic explosion from the center of this item
        createCosmicBurst(item);
    });
    
    // Smooth return to rest state when mouse leaves
    item.addEventListener('mouseleave', () => {
        gsap.to(item, { y: 0, duration: 0.3, ease: "power2.out" });
    });
});

// Functional Widget Logic
let isMutedGlobal = false;
let isDimmedGlobal = false;

function toggleMasterMute() {
    isMutedGlobal = !isMutedGlobal;
    const muteIcon = document.querySelector('#nav-mute .nav-icon');
    
    if (masterGain) {
        masterGain.gain.setValueAtTime(isMutedGlobal ? 0 : volumeSlider.value / 100, audioCtx.currentTime);
    }
    
    muteIcon.textContent = isMutedGlobal ? "🔊" : "🔇";
    // GSAP pop animation to give tactile feedback on click
    gsap.fromTo("#nav-mute", { scale: 0.8 }, { scale: 1, duration: 0.2, ease: "back.out(2)" });
}

function toggleScreenDim() {
    isDimmedGlobal = !isDimmedGlobal;
    // Animate the opacity of the main canvas canvas containers down to dim the screen light
    gsap.to("#canvas-container", { opacity: isDimmedGlobal ? 0.25 : 1, duration: 0.5, ease: "power1.inOut" });
    gsap.fromTo("#nav-dim", { scale: 0.8 }, { scale: 1, duration: 0.2, ease: "back.out(2)" });
}
function openWriting() {
    //open the writing.html page in a new tab
    window.open('fractal-writing2.html', '_blank');
}

function resetGalaxyFractal() {
    // Reset our raw number computation tracking loops back to initialization states
    primeCounter = 0;
    currentNumber = 2;
    stars = [];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    statusOverlay.innerText = "--- Math Loop Reset Successfully ---";
    
    // Spin animation for the reset icon
    gsap.fromTo("#nav-reset .nav-icon", { rotate: 0 }, { rotate: 360, duration: 0.6, ease: "power2.inOut" });
}

// 🪐 The Master GSAP Particle Burst Generator
function createCosmicBurst(targetButton) {
    const buttonRect = targetButton.getBoundingClientRect();
    
    // Calculate the exact center point of the button on the screen
    const centerX = buttonRect.left + buttonRect.width / 2;
    const centerY = buttonRect.top + buttonRect.height / 2;
    
    // Fixed UTF-8 clean array of sleep, music, and space emojis
    const particles = ['🌟', '✨', '💫', '🎵', '🎶', 'z', 'Z', '💤'];
    const numParticles = 22; // 22 particles per burst is perfect for high density

    for (let i = 0; i < numParticles; i++) {
        const particle = document.createElement('div');
        particle.textContent = particles[Math.floor(Math.random() * particles.length)];
        
        // Inline styles to spawn them precisely layered at the button center
        particle.style.position = 'fixed';
        particle.style.left = `${centerX}px`;
        particle.style.top = `${centerY}px`;
        particle.style.transform = 'translate(-50%, -50%)';
        particle.style.fontSize = `${0.8 + Math.random() * 1.5}rem`; // Varied star sizes
        particle.style.pointerEvents = 'none';
        particle.style.zIndex = '999'; // Ensure they float above the canvas layout
        particle.style.fontFamily = "'Courier New', Courier, monospace";
        particle.style.fontWeight = 'bold';
        
        // Add a gentle neon glow matching your terminal theme
        particle.style.textShadow = '0 0 8px rgba(0, 255, 102, 0.6)';
        
        document.body.appendChild(particle);

        // 360-Degree Radial Explosion Mathematics
        const angle = Math.random() * Math.PI * 2;
        const distance = 80 + Math.random() * 100; // Burst radius
        const endX = Math.cos(angle) * distance;
        const endY = Math.sin(angle) * distance;

        // GSAP Flight Path Animation
        gsap.to(particle, { 
            x: endX, 
            y: endY, 
            rotation: 360 * (Math.random() > 0.5 ? 1 : -1), // Random clockwise/counter spin
            scale: 0, // Shrink out of existence
            opacity: 0, // Fade away smoothly
            duration: 1.5 + Math.random() * 1, // Varied speeds for organic drifting
            ease: 'power2.out',
            onComplete: () => {
                // Safely garbage-collect the node out of RAM when done
                if (document.body.contains(particle)) {
                    document.body.removeChild(particle);
                }
            } 
        });
    }
}