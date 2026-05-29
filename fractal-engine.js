if (typeof disableLoopProtection === 'function') { disableLoopProtection(); } 

const canvas = document.getElementById('galaxyCanvas'); 
const ctx = canvas.getContext('2d'); 
const statusOverlay = document.getElementById('status-overlay'); 

// UI Elements
const themeToggle = document.getElementById('themeToggle'); 
const speedSlider = document.getElementById('speedSlider'); 
const noiseSelect = document.getElementById('noiseSelect'); 
const binauralSelect = document.getElementById('binauralSelect'); 
const volumeSlider = document.getElementById('volumeSlider'); 
const audioWave = document.getElementById('audio-wave'); 
const binauralVolSlider = document.getElementById('binauralVol'); 


// Audio System State Tracking Nodes (Persistent Global Instantiation)
let audioCtx = null; 
let ambientNoiseNode = null; 
let masterGain = null; 
let binauralGainNode = null; 

// Track 4 separate oscillator references for full dynamic multi-layering
let binLeftOsc = null; 
let binRightOsc = null; 
let binLeftOscLow = null; 
let binRightOscLow = null; 

// Quick Mute Binaural Button Audio Visualizer Sync

// Global mute states tracking variables
let isMuted = false;
let preMuteMasterVolume = 0.25; 
let preMuteBinauralVolume = 0.50;

function toggleMasterMute() {
    checkAudioInit();
    if (!audioCtx) return;

    const quickMuteBtn = document.getElementById('nav-mute');
    const muteIcon = document.querySelector('#nav-mute .nav-icon');
    const muteLabel = document.querySelector('#nav-mute .nav-label');
    

    isMuted = !isMuted;

    if (isMuted) {
        // 1. Capture current hardware volumes before wiping the node paths
        preMuteMasterVolume = parseFloat(volumeSlider.value) / 100;
        preMuteBinauralVolume = parseFloat(binauralVolSlider.value) / 100;

        // 2. Drop physical nodes directly down to complete silence
        if (masterGain) masterGain.gain.setValueAtTime(0, audioCtx.currentTime);
        if (binauralGainNode) binauralGainNode.gain.setValueAtTime(0, audioCtx.currentTime);

        // 3. Update the Quick Mute text and emoji layout parameters
        if (muteIcon) muteIcon.innerText = "🔊";
        if (muteLabel) muteLabel.innerText = "Unmute App";
    } else {
        // 1. Restore audio tracks back to live user configurations
        if (masterGain) masterGain.gain.setValueAtTime(preMuteMasterVolume, audioCtx.currentTime);
        if (binauralGainNode) binauralGainNode.gain.setValueAtTime(preMuteBinauralVolume * 5.0, audioCtx.currentTime);

        // 2. Restore standard dashboard button layout indicators
        if (muteIcon) muteIcon.innerText = "🔇";
        if (muteLabel) muteLabel.innerText = "Quick Mute";
        
    }

    // 🎯 Rule link: Tell your custom CSS classes to verify the animation loop states
    updateVisualizerDanceState();
}

// 🧱 CSS CLASS ENFORCEMENT ENGINE
function updateVisualizerDanceState() {
    if (!audioWave) return;

    // Check if either ambient noise or binaural selection drops are active
    const isAmbientActive = (noiseSelect && noiseSelect.value !== 'none');
    const isBinauralActive = (binauralSelect && binauralSelect.value !== 'none');

    // 🎯 If audio is playing AND we are unmuted -> inject class to ignite the CSS keyframes!
    if ((isAmbientActive || isBinauralActive) && !isMuted) {
        audioWave.classList.add('playing');
    } else {
        // Pull class out to return bars back to flat rest height instantly
        audioWave.classList.remove('playing');
    }
}

// --- Dynamic Event Listeners Core Integration Loops ---

noiseSelect.addEventListener('change', (e) => { 
    checkAudioInit(); 
    playAmbientNoise(e.target.value); 
    // Synchronize the animation state changes
    updateVisualizerDanceState();
}); 

binauralSelect.addEventListener('change', (e) => { 
    checkAudioInit(); 
    playBinauralBeats(e.target.value); 
    // Synchronize the animation state changes
    updateVisualizerDanceState();
}); 

if (binauralVolSlider) { 
    binauralVolSlider.addEventListener('input', (e) => { 
        checkAudioInit(); 
        if (binauralGainNode) { 
            const nativeBoostedVolume = (e.target.value / 100) * 5.0; 
            binauralGainNode.gain.setValueAtTime(nativeBoostedVolume, audioCtx.currentTime); 
        } 
    }); 
} 

volumeSlider.addEventListener('input', (e) => { 
    if (masterGain) { 
        masterGain.gain.setValueAtTime(e.target.value / 100, audioCtx.currentTime); 
    } 
});


// Setup Canvas Size
function resizeCanvas() { 
    canvas.width = canvas.parentElement.clientWidth; 
    canvas.height = canvas.parentElement.clientHeight; 
} 
resizeCanvas(); 
window.addEventListener('resize', resizeCanvas); 

// Core State Engine variables
let primeCounter = 0; 
let currentNumber = 2; 
let stars = []; 
const maxStars = 350; 
const MAX_ITER = 60; 

// Math Helpers
function isPrime(num) { 
    if (num <= 1) return false; 
    if (num <= 3) return true; 
    if (num % 2 === 0 || num % 3 === 0) return false; 
    for (let i = 5; i * i <= num; i += 6) { 
        if (num % i === 0 || num % (i + 2) === 0) return false; 
    } 
    return true; 
} 

function getMandelbrotValue(cr, ci, maxIter) { 
    let zr = 0.0, zi = 0.0, iter = 0; 
    while (zr * zr + zi * zi <= 4.0 && iter < maxIter) { 
        let temp = zr * zr - zi * zi + cr; 
        zi = 2.0 * zr * zi + ci; 
        zr = temp; 
        iter++; 
    } 
    return iter; 
} 

function calculateNextPrimeStar() { 
    while (!isPrime(currentNumber)) { currentNumber++; } 
    primeCounter++; 
    const prime = currentNumber; 
    currentNumber++; 
    if (primeCounter % 1000 === 0 && statusOverlay) { 
        statusOverlay.innerText = `--- [ Prime Count: ${primeCounter} ] Are You Asleep Yet, or Still Counting Fractal Primes. ---`; 
    } 
    const angle = prime * 0.0005; 
    const scale = (prime % 100) / 100; 
    const cr = (Math.sin(angle) * 1.5) * scale; 
    const ci = (Math.cos(angle) * 1.5) * scale; 
    const iterations = getMandelbrotValue(cr, ci, MAX_ITER); 
    return { 
        x: canvas.width / 2 + (Math.sin(prime) * (canvas.width * 0.35)), 
        y: canvas.height / 2 + (Math.cos(prime) * (canvas.height * 0.35)), 
        size: Math.max(9, (iterations % 18) + 6), 
        alpha: Math.min(0.8, (iterations / MAX_ITER) + 0.1), 
        primeScale: angle, 
        speedFactor: (prime % 5) + 1, 
        seed: prime 
    }; 
} 

// Initialize Audio Context and permanent mixing chains
function checkAudioInit() { 
    if (!audioCtx) { 
        audioCtx = new (window.AudioContext || window.webkitAudioContext)(); 
        
        // Force standard hardware configuration profile
        audioCtx.destination.channelCount = 2; 
        audioCtx.destination.channelCountMode = "explicit"; 
        audioCtx.destination.channelInterpretation = "speakers"; 

        // Master Ceiling Gain Setup
        masterGain = audioCtx.createGain(); 
        masterGain.gain.setValueAtTime(volumeSlider.value / 100, audioCtx.currentTime); 
        masterGain.connect(audioCtx.destination); 
        
        // Rebuilt Binaural Independent Mixing Channel
        binauralGainNode = audioCtx.createGain(); 
        const initialSliderVal = binauralVolSlider ? binauralVolSlider.value : 50; 
        
        // 🔊 EXTRA AUDIO BOOST: Scaled to 5.0x multiplier to blast past the physical crossover restriction
        const highPowerBoost = (initialSliderVal / 100) * 5.0; 
        binauralGainNode.gain.setValueAtTime(highPowerBoost, audioCtx.currentTime); 
        
        binauralGainNode.channelCount = 2; 
        binauralGainNode.channelCountMode = "explicit"; 
        binauralGainNode.channelInterpretation = "speakers"; 
        
        binauralGainNode.connect(masterGain); 
    } 
    if (audioCtx.state === 'suspended') { 
        audioCtx.resume(); 
    } 
} 

function stopAmbientNoise() { 
    if (ambientNoiseNode) { 
        try { ambientNoiseNode.stop(); ambientNoiseNode.disconnect(); } catch(e){} 
        ambientNoiseNode = null; 
    } 
} 

function playAmbientNoise(type) { 
    stopAmbientNoise(); 
    if (type === 'none' || !audioCtx) return; 
    const bufferSize = 4 * audioCtx.sampleRate; 
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate); 
    const data = buffer.getChannelData(0); 
    if (type === 'white') { 
        for (let i = 0; i < bufferSize; i++) { data[i] = Math.random() * 2 - 1; } 
    } else if (type === 'pink') { 
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0; 
        for (let i = 0; i < bufferSize; i++) { 
            let white = Math.random() * 2 - 1; 
            b0 = 0.99886 * b0 + white * 0.0555179; 
            b1 = 0.99332 * b1 + white * 0.0750759; 
            b2 = 0.96900 * b2 + white * 0.1538520; 
            b3 = 0.86650 * b3 + white * 0.3104856; 
            b4 = 0.55000 * b4 + white * 0.5329522; 
            b5 = -0.7616 * b5 - white * 0.0168980; 
            data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362; 
            data[i] *= 0.11; 
            b6 = white * 0.115926; 
        } 
    } 
    ambientNoiseNode = audioCtx.createBufferSource(); 
    ambientNoiseNode.buffer = buffer; 
    ambientNoiseNode.loop = true; 
    ambientNoiseNode.connect(masterGain); 
    ambientNoiseNode.start(); 
} 

function stopBinauralBeats() { 
    if (binLeftOsc) { try { binLeftOsc.stop(); binLeftOsc.disconnect(); } catch(e){} binLeftOsc = null; } 
    if (binRightOsc) { try { binRightOsc.stop(); binRightOsc.disconnect(); } catch(e){} binRightOsc = null; } 
    if (binLeftOscLow) { try { binLeftOscLow.stop(); binLeftOscLow.disconnect(); } catch(e){} binLeftOscLow = null; } 
    if (binRightOscLow) { try { binRightOscLow.stop(); binRightOscLow.disconnect(); } catch(e){} binRightOscLow = null; } 
} 

function playBinauralBeats(mode) { 
    stopBinauralBeats(); 
    if (mode === 'none' || !audioCtx) return; 
    
    // 1. Determine the brainwave rhythm shift speed
    const isDelta = (mode === 'delta_sub' || mode === 'delta_orig');
    const offset = isDelta ? 2 : 6; 
    
    // 2. Open up our clean hardware channel routing merger
    let channelMerger = audioCtx.createChannelMerger(2); 
    
    // 3. Check what type of mode the user selected
    if (mode === 'delta_sub' || mode === 'theta_sub') {
        // 🌟 SUBWOOFER ACTIVE MODE: Stacks the new 250Hz tone and original 100Hz rumble together
        binLeftOsc = audioCtx.createOscillator(); 
        binLeftOsc.type = 'sine'; 
        binLeftOsc.frequency.setValueAtTime(250, audioCtx.currentTime); 
        
        binRightOsc = audioCtx.createOscillator(); 
        binRightOsc.type = 'sine'; 
        binRightOsc.frequency.setValueAtTime(250 + offset, audioCtx.currentTime); 
        
        binLeftOscLow = audioCtx.createOscillator(); 
        binLeftOscLow.type = 'sine'; 
        binLeftOscLow.frequency.setValueAtTime(100, audioCtx.currentTime); 
        
        binRightOscLow = audioCtx.createOscillator(); 
        binRightOscLow.type = 'sine'; 
        binRightOscLow.frequency.setValueAtTime(100 + offset, audioCtx.currentTime); 
        
        // Connect the 4-oscillator grid to the hardware channels
        binLeftOsc.connect(channelMerger, 0, 0); 
        binLeftOscLow.connect(channelMerger, 0, 0); 
        binRightOsc.connect(channelMerger, 0, 1); 
        binRightOscLow.connect(channelMerger, 0, 1); 
        
        binLeftOscLow.start(); 
        binRightOscLow.start();
    } else {
        // 🌟 ORIGINAL SINGLE-TONE MODE: Pure 100Hz base tone for old PC / Monitor speakers
        binLeftOsc = audioCtx.createOscillator(); 
        binLeftOsc.type = 'sine'; 
        binLeftOsc.frequency.setValueAtTime(100, audioCtx.currentTime); 
        
        binRightOsc = audioCtx.createOscillator(); 
        binRightOsc.type = 'sine'; 
        binRightOsc.frequency.setValueAtTime(100 + offset, audioCtx.currentTime); 
        
        // Connect standard 2-oscillator grid to the hardware channels
        binLeftOsc.connect(channelMerger, 0, 0); 
        binRightOsc.connect(channelMerger, 0, 1); 
    }
    
    // Stream everything seamlessly right through your independent mixing slider node
    channelMerger.connect(binauralGainNode); 
    
    // Ignite the active nodes
    binLeftOsc.start(); 
    binRightOsc.start(); 
}


// --- EVENT LISTENERS ---

noiseSelect.addEventListener('change', (e) => { 
    checkAudioInit(); 
    playAmbientNoise(e.target.value); 
    if (e.target.value !== 'none') { 
        audioWave.classList.add('playing'); 
    } else { 
        audioWave.classList.remove('playing'); 
    } 
}); 

binauralSelect.addEventListener('change', (e) => { 
    checkAudioInit(); 
    playBinauralBeats(e.target.value); 
}); 

if (binauralVolSlider) { 
    binauralVolSlider.addEventListener('input', (e) => { 
        checkAudioInit(); 
        if (binauralGainNode) { 
            // 5.0x Gain curve applied to the volume node
            const nativeBoostedVolume = (e.target.value / 100) * 5.0; 
            binauralGainNode.gain.setValueAtTime(nativeBoostedVolume, audioCtx.currentTime); 
        } 
    }); 
} 

volumeSlider.addEventListener('input', (e) => { 
    if (masterGain) { 
        masterGain.gain.setValueAtTime(e.target.value / 100, audioCtx.currentTime); 
    } 
}); 

if (themeToggle) {
    themeToggle.innerText = (document.documentElement.getAttribute('data-theme') === 'light') ? '🌙' : '☀'; 
    themeToggle.addEventListener('click', () => { 
        const currentTheme = document.documentElement.getAttribute('data-theme'); 
        const targetTheme = (currentTheme === 'light') ? 'dark' : 'light'; 
        document.documentElement.setAttribute('data-theme', targetTheme); 
        themeToggle.innerText = (targetTheme === 'light') ? '🌙' : '☀'; 
    }); 
} 

for(let i=0; i < maxStars; i++) { 
    let initialStar = calculateNextPrimeStar(); 
    initialStar.x = Math.random() * canvas.width; 
    initialStar.y = Math.random() * canvas.height; 
    stars.push(initialStar); 
} 

function renderGalaxyLoop() { 
    const globalSpeed = speedSlider ? speedSlider.value * 0.05 : 0.5; 
    const theme = document.documentElement.getAttribute('data-theme') || 'dark'; 
    ctx.fillStyle = (theme === 'light') ? "rgba(244, 237, 210, 0.08)" : "rgba(4, 4, 8, 0.08)"; 
    ctx.fillRect(0, 0, canvas.width, canvas.height); 
    for (let i = 0; i < stars.length; i++) { 
        let star = stars[i]; 
        star.x += Math.sin(star.primeScale) * (globalSpeed * star.speedFactor * 0.3); 
        star.y += (globalSpeed * star.speedFactor * 0.4); 
        if (star.y > canvas.height || star.x < 0 || star.x > canvas.width) { 
            stars[i] = calculateNextPrimeStar(); 
            stars[i].y = 0; 
        } 
        const currentHue = window.globalUserHue || 120; 
        ctx.fillStyle = (theme === 'light') ? `hsla(${currentHue}, 35%, 25%, ${star.alpha})` : `hsla(${currentHue}, 100%, 50%, ${star.alpha})`; 
        ctx.font = `${star.size}px 'Courier New', Courier, monospace`; 
        ctx.fillText("z", star.x, star.y); 
    } 
    requestAnimationFrame(renderGalaxyLoop); 
} 

renderGalaxyLoop();

// ToggleMenuDrawer Funcion with Strict Display State Enforcement for Desktop View
    function toggleMenuDrawer() { 
        let visible = true;
        const controlPanel = document.getElementById('control-panel'); 
        const isVisible = controlPanel.getAttribute('data-visible') === 'true';


        // 🎯 THE FIX: Force it to toggle strictly between 'none' and your exact desktop layout style!
        if (controlPanel.style.display === 'none') { 
            controlPanel.style.display = 'flex'; 
            controlPanel.style.flexDirection = 'row';
            controlPanel.style.flexWrap = 'nowrap'; // Locks your original column layout back in place!
        } else { 
            controlPanel.style.display = 'none'; 
        } 
    }
       

