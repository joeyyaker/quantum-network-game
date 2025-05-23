// Quantum Network State Transfer Game
// Based on Burkhart et al., PRX Quantum 2, 030321 (2021)

// Game state management
let currentLevel = 'theory';
let gameState = {
    scores: {
        theory: 0,
        practical: 0,
        problem: 0,
        total: 0
    },
    progress: {
        theory: false,
        beamsplitter: false,
        errorDetection: false,
        entanglement: false,
        network: false,
        challenge: false
    },
    parameters: {
        detuning: 0,
        conversionRate: 0.56,
        mixingAngle: 90,
        beamsplitterTime: 624,
        fidelity: 1.0,
        entanglementFidelity: 0.95
    }
};

// Initialize the game when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeGame();
    setupEventListeners();
    updateMathJax();
});

function initializeGame() {
    showLevel('theory');
    updateScoreDisplay();
    initializeTheoryLevel();
    initializeBeamsplitterLevel();
    initializeErrorDetectionLevel();
    initializeEntanglementLevel();
    initializeNetworkLevel();
    initializeChallengeLevel();
}

function setupEventListeners() {
    // Level navigation
    document.querySelectorAll('#level-selector button').forEach(button => {
        button.addEventListener('click', (e) => {
            const level = e.target.getAttribute('onclick').match(/'(.+?)'/)[1];
            showLevel(level);
        });
    });
}

// Level management
function showLevel(levelName) {
    // Hide all levels
    document.querySelectorAll('.level').forEach(level => {
        level.classList.remove('active');
    });
    
    // Show selected level
    const targetLevel = document.getElementById(levelName + '-level');
    if (targetLevel) {
        targetLevel.classList.add('active');
    }
    
    // Update navigation
    document.querySelectorAll('#level-selector button').forEach(button => {
        button.classList.remove('active');
    });
    
    const activeButton = document.querySelector(`#level-selector button[onclick*="${levelName}"]`);
    if (activeButton) {
        activeButton.classList.add('active');
    }
    
    currentLevel = levelName;
    updateMathJax();
}

// Theory Level Implementation
function initializeTheoryLevel() {
    const detuningSlider = document.getElementById('detuning-slider');
    const rateSlider = document.getElementById('rate-slider');
    
    if (detuningSlider) {
        detuningSlider.addEventListener('input', updateTheoryParameters);
    }
    if (rateSlider) {
        rateSlider.addEventListener('input', updateTheoryParameters);
    }
    
    updateTheoryParameters();
}

function updateTheoryParameters() {
    const detuning = parseFloat(document.getElementById('detuning-slider')?.value || 0);
    const rate = parseFloat(document.getElementById('rate-slider')?.value || 0.56);
    
    gameState.parameters.detuning = detuning;
    gameState.parameters.conversionRate = rate;
    
    // Calculate beamsplitter time: τ_BS = 2π/√(8g² + Δ²)
    const g = rate * 2 * Math.PI; // Convert to rad/s
    const delta = detuning * g; // Detuning in rad/s
    const beamsplitterTime = (2 * Math.PI) / Math.sqrt(8 * g * g + delta * delta);
    gameState.parameters.beamsplitterTime = beamsplitterTime * 1e9; // Convert to ns
    
    // Calculate mixing angle: θ = π/2(1 - Δτ_BS/2π)
    const mixingAngle = (Math.PI / 2) * (1 - (delta * beamsplitterTime) / (2 * Math.PI));
    gameState.parameters.mixingAngle = mixingAngle * 180 / Math.PI; // Convert to degrees
    
    // Update display
    updateElementText('detuning-value', detuning.toFixed(1));
    updateElementText('rate-value', rate.toFixed(2));
    updateElementText('bs-time', gameState.parameters.beamsplitterTime.toFixed(0));
    updateElementText('mixing-angle', gameState.parameters.mixingAngle.toFixed(1));
    
    // Update bus occupation based on parameters
    const busOccupation = calculateBusOccupation(detuning, rate);
    updateElementText('bus-occupation', busOccupation);
    
    // Award points for exploration
    if (!gameState.progress.theory && detuning > 0 && rate !== 0.56) {
        awardPoints('theory', 25);
        gameState.progress.theory = true;
    }
}

function calculateBusOccupation(detuning, rate) {
    if (detuning === 0) return "Minimal (resonant)";
    else if (detuning < 1) return "Low";
    else if (detuning < 2) return "Moderate";
    else return "High (off-resonant)";
}

// Beamsplitter Level Implementation
function initializeBeamsplitterLevel() {
    const canvas = document.getElementById('beamsplitter-canvas');
    if (canvas) {
        setupBeamsplitterVisualization(canvas);
    }
    
    const angleSlider = document.getElementById('bs-angle-slider');
    if (angleSlider) {
        angleSlider.addEventListener('input', updateBeamsplitterVisualization);
    }
    
    // Set up challenge button
    const challengeButton = document.getElementById('bs-challenge-btn');
    if (challengeButton) {
        challengeButton.addEventListener('click', startBeamsplitterChallenge);
    }
}

function setupBeamsplitterVisualization(canvas) {
    const ctx = canvas.getContext('2d');
    canvas.width = 400;
    canvas.height = 300;
    
    drawBeamsplitterDiagram(ctx);
}

function drawBeamsplitterDiagram(ctx) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    const centerX = ctx.canvas.width / 2;
    const centerY = ctx.canvas.height / 2;
    
    // Draw beamsplitter
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(centerX - 50, centerY - 50);
    ctx.lineTo(centerX + 50, centerY + 50);
    ctx.stroke();
    
    // Draw input modes
    ctx.strokeStyle = '#ff6b6b';
    ctx.lineWidth = 2;
    
    // Input a1
    ctx.beginPath();
    ctx.moveTo(centerX - 100, centerY - 50);
    ctx.lineTo(centerX - 50, centerY - 50);
    ctx.stroke();
    
    // Input a2
    ctx.beginPath();
    ctx.moveTo(centerX - 100, centerY + 50);
    ctx.lineTo(centerX - 50, centerY + 50);
    ctx.stroke();
    
    // Output modes
    ctx.strokeStyle = '#4ecdc4';
    
    // Output 1
    ctx.beginPath();
    ctx.moveTo(centerX + 50, centerY - 50);
    ctx.lineTo(centerX + 100, centerY - 50);
    ctx.stroke();
    
    // Output 2
    ctx.beginPath();
    ctx.moveTo(centerX + 50, centerY + 50);
    ctx.lineTo(centerX + 100, centerY + 50);
    ctx.stroke();
    
    // Labels
    ctx.fillStyle = '#e0e0e0';
    ctx.font = '14px Arial';
    ctx.fillText('a₁', centerX - 120, centerY - 45);
    ctx.fillText('a₂', centerX - 120, centerY + 55);
    ctx.fillText('Output 1', centerX + 110, centerY - 45);
    ctx.fillText('Output 2', centerX + 110, centerY + 55);
    
    // Angle indicator
    const angle = parseFloat(document.getElementById('bs-angle-slider')?.value || 90) * Math.PI / 180;
    ctx.strokeStyle = '#ffd93d';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 30, -Math.PI/4, -Math.PI/4 + angle, false);
    ctx.stroke();
}

function updateBeamsplitterVisualization() {
    const angle = parseFloat(document.getElementById('bs-angle-slider')?.value || 90);
    const canvas = document.getElementById('beamsplitter-canvas');
    
    if (canvas) {
        drawBeamsplitterDiagram(canvas.getContext('2d'));
    }
    
    updateElementText('bs-angle-value', angle);
    
    // Calculate transmission and reflection
    const transmission = Math.cos(angle * Math.PI / 180);
    const reflection = Math.sin(angle * Math.PI / 180);
    
    updateElementText('transmission', (transmission * transmission * 100).toFixed(1));
    updateElementText('reflection', (reflection * reflection * 100).toFixed(1));
    
    // Update state equations
    updateBeamsplitterEquations(angle);
}

function updateBeamsplitterEquations(angle) {
    const cos_theta = Math.cos(angle * Math.PI / 180).toFixed(3);
    const sin_theta = Math.sin(angle * Math.PI / 180).toFixed(3);
    
    const equation1 = `a₁' = ${cos_theta} a₁ + ${sin_theta} a₂`;
    const equation2 = `a₂' = ${cos_theta} a₂ - ${sin_theta} a₁`;
    
    updateElementText('output-equation-1', equation1);
    updateElementText('output-equation-2', equation2);
}

function startBeamsplitterChallenge() {
    const targetAngle = Math.floor(Math.random() * 90) + 1; // Random angle 1-90
    const currentAngle = parseFloat(document.getElementById('bs-angle-slider')?.value || 90);
    
    alert(`Challenge: Set the beamsplitter to ${targetAngle}° for optimal state transfer!`);
    
    // Store challenge target for checking
    gameState.beamsplitterTarget = targetAngle;
    
    // Add check button if not exists
    let checkButton = document.getElementById('bs-check-btn');
    if (!checkButton) {
        checkButton = document.createElement('button');
        checkButton.id = 'bs-check-btn';
        checkButton.textContent = 'Check Answer';
        checkButton.className = 'btn btn-primary';
        checkButton.addEventListener('click', checkBeamsplitterChallenge);
        
        const challengeButton = document.getElementById('bs-challenge-btn');
        challengeButton.parentNode.insertBefore(checkButton, challengeButton.nextSibling);
    }
}

function checkBeamsplitterChallenge() {
    const targetAngle = gameState.beamsplitterTarget;
    const currentAngle = parseFloat(document.getElementById('bs-angle-slider')?.value || 90);
    const tolerance = 2; // 2 degree tolerance
    
    if (Math.abs(currentAngle - targetAngle) <= tolerance) {
        alert('🎉 Correct! You mastered beamsplitter control!');
        awardPoints('practical', 30);
        gameState.progress.beamsplitter = true;
        
        // Remove check button
        const checkButton = document.getElementById('bs-check-btn');
        if (checkButton) checkButton.remove();
    } else {
        alert(`Close, but try again. Target: ${targetAngle}°, Current: ${currentAngle.toFixed(1)}°`);
    }
}

// Error Detection Level Implementation
function initializeErrorDetectionLevel() {
    setupCatStateVisualization();
    setupParityMeasurement();
    
    const challengeButton = document.getElementById('error-challenge-btn');
    if (challengeButton) {
        challengeButton.addEventListener('click', startErrorDetectionChallenge);
    }
}

function setupCatStateVisualization() {
    const canvas = document.getElementById('cat-state-canvas');
    if (canvas) {
        canvas.width = 400;
        canvas.height = 300;
        drawCatState(canvas.getContext('2d'));
    }
}

function drawCatState(ctx) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    const centerX = ctx.canvas.width / 2;
    const centerY = ctx.canvas.height / 2;
    const alpha = 2; // Cat state amplitude
    
    // Draw phase space
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    
    // Axes
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(ctx.canvas.width, centerY);
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, ctx.canvas.height);
    ctx.stroke();
    
    // Draw coherent state components
    const scale = 50;
    
    // |α⟩
    ctx.fillStyle = '#ff6b6b';
    ctx.beginPath();
    ctx.arc(centerX + alpha * scale, centerY, 8, 0, 2 * Math.PI);
    ctx.fill();
    
    // |-α⟩
    ctx.fillStyle = '#4ecdc4';
    ctx.beginPath();
    ctx.arc(centerX - alpha * scale, centerY, 8, 0, 2 * Math.PI);
    ctx.fill();
    
    // |iα⟩
    ctx.fillStyle = '#ffd93d';
    ctx.beginPath();
    ctx.arc(centerX, centerY - alpha * scale, 8, 0, 2 * Math.PI);
    ctx.fill();
    
    // |-iα⟩
    ctx.fillStyle = '#a8e6cf';
    ctx.beginPath();
    ctx.arc(centerX, centerY + alpha * scale, 8, 0, 2 * Math.PI);
    ctx.fill();
    
    // Labels
    ctx.fillStyle = '#e0e0e0';
    ctx.font = '12px Arial';
    ctx.fillText('|α⟩', centerX + alpha * scale + 10, centerY);
    ctx.fillText('|-α⟩', centerX - alpha * scale - 25, centerY);
    ctx.fillText('|iα⟩', centerX + 5, centerY - alpha * scale - 10);
    ctx.fillText('|-iα⟩', centerX + 5, centerY + alpha * scale + 20);
    
    ctx.fillText('Re', ctx.canvas.width - 20, centerY - 10);
    ctx.fillText('Im', centerX + 10, 15);
}

function setupParityMeasurement() {
    const parityButton = document.getElementById('parity-measure-btn');
    if (parityButton) {
        parityButton.addEventListener('click', performParityMeasurement);
    }
}

function performParityMeasurement() {
    // Simulate parity measurement with some noise
    const errorProbability = 0.1; // 10% error rate
    const hasError = Math.random() < errorProbability;
    
    const parity = hasError ? 'odd' : 'even';
    const confidence = 85 + Math.random() * 10; // 85-95% confidence
    
    updateElementText('parity-result', `Parity: ${parity} (${confidence.toFixed(1)}% confidence)`);
    updateElementText('error-status', hasError ? '⚠️ Error detected!' : '✅ No errors detected');
    
    // Update fidelity
    gameState.parameters.fidelity = hasError ? 0.85 : 0.98;
    updateElementText('fidelity-value', (gameState.parameters.fidelity * 100).toFixed(1));
    
    // Award points for performing measurements
    if (!gameState.progress.errorDetection) {
        awardPoints('practical', 25);
        gameState.progress.errorDetection = true;
    }
}

function startErrorDetectionChallenge() {
    alert('Challenge: Perform 5 consecutive parity measurements and identify any errors!');
    
    gameState.errorDetectionCount = 0;
    gameState.errorDetectionTarget = 5;
    
    // Reset results
    updateElementText('parity-result', 'Click "Measure Parity" to start');
    updateElementText('error-status', 'Waiting for measurements...');
    
    // Override parity measurement for challenge
    const parityButton = document.getElementById('parity-measure-btn');
    if (parityButton) {
        parityButton.removeEventListener('click', performParityMeasurement);
        parityButton.addEventListener('click', challengeParityMeasurement);
    }
}

function challengeParityMeasurement() {
    gameState.errorDetectionCount++;
    
    const errorProbability = 0.15; // Higher error rate for challenge
    const hasError = Math.random() < errorProbability;
    
    const parity = hasError ? 'odd' : 'even';
    const confidence = 85 + Math.random() * 10;
    
    updateElementText('parity-result', 
        `Measurement ${gameState.errorDetectionCount}/5: ${parity} (${confidence.toFixed(1)}% confidence)`);
    updateElementText('error-status', hasError ? '⚠️ Error detected!' : '✅ No errors detected');
    
    if (gameState.errorDetectionCount >= gameState.errorDetectionTarget) {
        alert('🎉 Challenge completed! You successfully performed error detection protocol!');
        awardPoints('problem', 40);
        
        // Restore normal measurement
        const parityButton = document.getElementById('parity-measure-btn');
        if (parityButton) {
            parityButton.removeEventListener('click', challengeParityMeasurement);
            parityButton.addEventListener('click', performParityMeasurement);
        }
    }
}

// Entanglement Level Implementation
function initializeEntanglementLevel() {
    setupEntanglementVisualization();
    setupTomographyControls();
    
    const generateButton = document.getElementById('entangle-btn');
    if (generateButton) {
        generateButton.addEventListener('click', generateEntanglement);
    }
}

function setupEntanglementVisualization() {
    const canvas = document.getElementById('entanglement-canvas');
    if (canvas) {
        canvas.width = 400;
        canvas.height = 300;
        drawEntanglementDiagram(canvas.getContext('2d'));
    }
}

function drawEntanglementDiagram(ctx) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    const centerX = ctx.canvas.width / 2;
    const centerY = ctx.canvas.height / 2;
    
    // Draw Hong-Ou-Mandel interferometer
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 3;
    
    // Beamsplitter
    ctx.beginPath();
    ctx.moveTo(centerX - 40, centerY - 40);
    ctx.lineTo(centerX + 40, centerY + 40);
    ctx.stroke();
    
    // Input paths
    ctx.strokeStyle = '#ff6b6b';
    ctx.lineWidth = 2;
    
    // Photon 1
    ctx.beginPath();
    ctx.moveTo(centerX - 100, centerY - 40);
    ctx.lineTo(centerX - 40, centerY - 40);
    ctx.stroke();
    
    // Photon 2
    ctx.beginPath();
    ctx.moveTo(centerX - 100, centerY + 40);
    ctx.lineTo(centerX - 40, centerY + 40);
    ctx.stroke();
    
    // Output paths
    ctx.strokeStyle = '#4ecdc4';
    
    ctx.beginPath();
    ctx.moveTo(centerX + 40, centerY - 40);
    ctx.lineTo(centerX + 100, centerY - 40);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(centerX + 40, centerY + 40);
    ctx.lineTo(centerX + 100, centerY + 40);
    ctx.stroke();
    
    // Photon representations
    ctx.fillStyle = '#ffd93d';
    ctx.beginPath();
    ctx.arc(centerX - 70, centerY - 40, 5, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(centerX - 70, centerY + 40, 5, 0, 2 * Math.PI);
    ctx.fill();
    
    // Labels
    ctx.fillStyle = '#e0e0e0';
    ctx.font = '12px Arial';
    ctx.fillText('Photon 1', centerX - 130, centerY - 35);
    ctx.fillText('Photon 2', centerX - 130, centerY + 45);
    ctx.fillText('Detector 1', centerX + 110, centerY - 35);
    ctx.fillText('Detector 2', centerX + 110, centerY + 45);
}

function generateEntanglement() {
    // Simulate Hong-Ou-Mandel interference
    const visibility = 0.92 + Math.random() * 0.05; // 92-97% visibility
    const coincidenceRate = Math.random() * 0.1; // Low coincidence rate indicates entanglement
    
    gameState.parameters.entanglementFidelity = visibility;
    
    updateElementText('visibility-value', (visibility * 100).toFixed(1));
    updateElementText('coincidence-rate', (coincidenceRate * 100).toFixed(2));
    updateElementText('entanglement-fidelity', (visibility * 100).toFixed(1));
    
    // Determine entanglement quality
    let quality;
    if (visibility > 0.95) quality = 'Excellent';
    else if (visibility > 0.90) quality = 'Good';
    else if (visibility > 0.85) quality = 'Fair';
    else quality = 'Poor';
    
    updateElementText('entanglement-quality', quality);
    
    // Award points based on quality
    if (visibility > 0.90 && !gameState.progress.entanglement) {
        awardPoints('practical', 35);
        gameState.progress.entanglement = true;
    }
    
    // Update visualization
    animateEntanglementGeneration();
}

function animateEntanglementGeneration() {
    const canvas = document.getElementById('entanglement-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let frame = 0;
    const totalFrames = 30;
    
    const animate = () => {
        drawEntanglementDiagram(ctx);
        
        // Add entanglement visualization
        ctx.strokeStyle = `rgba(255, 215, 61, ${Math.sin(frame * 0.2)})`;
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        // Draw entanglement lines
        ctx.beginPath();
        ctx.moveTo(centerX + 40, centerY - 40);
        ctx.lineTo(centerX + 40, centerY + 40);
        ctx.stroke();
        
        ctx.setLineDash([]);
        
        frame++;
        if (frame < totalFrames) {
            requestAnimationFrame(animate);
        }
    };
    
    animate();
}

function setupTomographyControls() {
    const basisSelect = document.getElementById('measurement-basis');
    const measureButton = document.getElementById('tomography-btn');
    
    if (measureButton) {
        measureButton.addEventListener('click', performTomography);
    }
}

function performTomography() {
    const basis = document.getElementById('measurement-basis')?.value || 'computational';
    
    // Simulate quantum state tomography
    let results = {};
    
    switch (basis) {
        case 'computational':
            results = { '00': 0.02, '01': 0.48, '10': 0.48, '11': 0.02 };
            break;
        case 'diagonal':
            results = { '++': 0.50, '+-': 0.02, '-+': 0.02, '--': 0.46 };
            break;
        case 'circular':
            results = { 'LL': 0.51, 'LR': 0.01, 'RL': 0.01, 'RR': 0.47 };
            break;
    }
    
    // Add some noise
    Object.keys(results).forEach(key => {
        results[key] += (Math.random() - 0.5) * 0.04;
        results[key] = Math.max(0, Math.min(1, results[key]));
    });
    
    // Normalize
    const total = Object.values(results).reduce((a, b) => a + b, 0);
    Object.keys(results).forEach(key => {
        results[key] /= total;
    });
    
    displayTomographyResults(results, basis);
}

function displayTomographyResults(results, basis) {
    const resultsDiv = document.getElementById('tomography-results');
    if (!resultsDiv) return;
    
    let html = `<h4>Tomography Results (${basis} basis):</h4>`;
    
    Object.entries(results).forEach(([state, probability]) => {
        html += `<div class="tomography-result">
            |${state}⟩: ${(probability * 100).toFixed(1)}%
            <div class="probability-bar">
                <div class="probability-fill" style="width: ${probability * 100}%"></div>
            </div>
        </div>`;
    });
    
    resultsDiv.innerHTML = html;
}

// Network Level Implementation
function initializeNetworkLevel() {
    setupNetworkDesigner();
    setupNetworkSimulation();
}

function setupNetworkDesigner() {
    const addModuleBtn = document.getElementById('add-module-btn');
    const simulateBtn = document.getElementById('simulate-network-btn');
    
    if (addModuleBtn) {
        addModuleBtn.addEventListener('click', addNetworkModule);
    }
    
    if (simulateBtn) {
        simulateBtn.addEventListener('click', simulateNetwork);
    }
}

function addNetworkModule() {
    const designer = document.getElementById('network-designer');
    if (!designer) return;
    
    const moduleCount = designer.children.length + 1;
    
    const module = document.createElement('div');
    module.className = 'network-module';
    module.innerHTML = `
        <h4>Module ${moduleCount}</h4>
        <div class="module-controls">
            <label>Coupling g (MHz): 
                <input type="range" min="0.1" max="2" step="0.1" value="0.56" 
                       onchange="updateNetworkParameters()">
            </label>
            <label>Detuning Δ/g: 
                <input type="range" min="0" max="3" step="0.1" value="0" 
                       onchange="updateNetworkParameters()">
            </label>
        </div>
    `;
    
    designer.appendChild(module);
    updateNetworkParameters();
}

function updateNetworkParameters() {
    const modules = document.querySelectorAll('.network-module');
    const moduleCount = modules.length;
    
    updateElementText('module-count', moduleCount);
    
    // Calculate network metrics
    const totalCoupling = Array.from(modules).reduce((sum, module) => {
        const couplingSlider = module.querySelector('input[type="range"]');
        return sum + parseFloat(couplingSlider?.value || 0);
    }, 0);
    
    const avgCoupling = totalCoupling / moduleCount;
    const networkBandwidth = avgCoupling * Math.sqrt(moduleCount);
    
    updateElementText('network-bandwidth', networkBandwidth.toFixed(2));
    updateElementText('network-fidelity', (0.95 - moduleCount * 0.02).toFixed(2));
}

function simulateNetwork() {
    const modules = document.querySelectorAll('.network-module');
    const moduleCount = modules.length;
    
    if (moduleCount < 2) {
        alert('Add at least 2 modules to simulate the network!');
        return;
    }
    
    // Simulate state transfer across network
    const transferTime = (moduleCount - 1) * 624; // Base time per hop
    const fidelity = Math.max(0.7, 0.95 - moduleCount * 0.02);
    const success = fidelity > 0.8;
    
    const resultsDiv = document.getElementById('network-results');
    if (resultsDiv) {
        resultsDiv.innerHTML = `
            <h4>Network Simulation Results:</h4>
            <p>Transfer Time: ${transferTime} ns</p>
            <p>End-to-End Fidelity: ${(fidelity * 100).toFixed(1)}%</p>
            <p>Status: ${success ? '✅ Success' : '❌ Failed'}</p>
        `;
    }
    
    if (success && moduleCount >= 3 && !gameState.progress.network) {
        awardPoints('problem', 50);
        gameState.progress.network = true;
        alert('🎉 Excellent! You designed a working quantum network!');
    }
}

function setupNetworkSimulation() {
    // Initialize with 2 modules
    addNetworkModule();
    addNetworkModule();
}

// Challenge Level Implementation
function initializeChallengeLevel() {
    const startButton = document.getElementById('final-challenge-btn');
    if (startButton) {
        startButton.addEventListener('click', startFinalChallenge);
    }
}

function startFinalChallenge() {
    if (!allLevelsCompleted()) {
        alert('Complete all previous levels before attempting the final challenge!');
        return;
    }
    
    // Generate random challenge parameters
    const challenges = [
        {
            type: 'state-transfer',
            description: 'Transfer a quantum state with >90% fidelity',
            target: { fidelity: 0.90 },
            points: 60
        },
        {
            type: 'entanglement-distribution',
            description: 'Distribute entanglement across 4 modules with >85% fidelity',
            target: { modules: 4, fidelity: 0.85 },
            points: 70
        },
        {
            type: 'error-correction',
            description: 'Detect and correct 3 consecutive errors',
            target: { errors: 3 },
            points: 50
        }
    ];
    
    const challenge = challenges[Math.floor(Math.random() * challenges.length)];
    gameState.currentChallenge = challenge;
    
    displayChallenge(challenge);
}

function displayChallenge(challenge) {
    const challengeDiv = document.getElementById('challenge-display');
    if (!challengeDiv) return;
    
    challengeDiv.innerHTML = `
        <h3>🎯 Final Challenge</h3>
        <div class="challenge-box">
            <h4>${challenge.description}</h4>
            <p>Complete this challenge to master quantum network protocols!</p>
            <button onclick="attemptChallenge()" class="btn btn-primary">Attempt Challenge</button>
        </div>
    `;
}

function attemptChallenge() {
    const challenge = gameState.currentChallenge;
    let success = false;
    
    switch (challenge.type) {
        case 'state-transfer':
            success = gameState.parameters.fidelity >= challenge.target.fidelity;
            break;
        case 'entanglement-distribution':
            const moduleCount = document.querySelectorAll('.network-module').length;
            success = moduleCount >= challenge.target.modules && 
                     gameState.parameters.entanglementFidelity >= challenge.target.fidelity;
            break;
        case 'error-correction':
            success = gameState.errorDetectionCount >= challenge.target.errors;
            break;
    }
    
    if (success) {
        alert('🎉 CONGRATULATIONS! You mastered quantum network protocols!');
        awardPoints('problem', challenge.points);
        gameState.progress.challenge = true;
        showCongratulations();
    } else {
        alert('Challenge failed. Review the previous levels and try again!');
    }
}

function allLevelsCompleted() {
    return gameState.progress.theory && 
           gameState.progress.beamsplitter && 
           gameState.progress.errorDetection && 
           gameState.progress.entanglement && 
           gameState.progress.network;
}

function showCongratulations() {
    const app = document.getElementById('app');
    const congratsDiv = document.createElement('div');
    congratsDiv.className = 'congratulations-overlay';
    congratsDiv.innerHTML = `
        <div class="congratulations-content">
            <h1>🎉 QUANTUM MASTER! 🎉</h1>
            <p>You have successfully mastered quantum network protocols!</p>
            <p>Final Score: ${gameState.scores.total}/300</p>
            <button onclick="this.parentElement.parentElement.remove()" class="btn btn-primary">
                Continue Exploring
            </button>
        </div>
    `;
    app.appendChild(congratsDiv);
}

// Utility Functions
function awardPoints(category, points) {
    gameState.scores[category] = Math.min(100, gameState.scores[category] + points);
    gameState.scores.total = gameState.scores.theory + gameState.scores.practical + gameState.scores.problem;
    updateScoreDisplay();
}

function updateScoreDisplay() {
    updateElementText('theory-score', `${gameState.scores.theory}/100`);
    updateElementText('practical-score', `${gameState.scores.practical}/100`);
    updateElementText('problem-score', `${gameState.scores.problem}/100`);
    updateElementText('total-score', `${gameState.scores.total}/300`);
}

function updateElementText(id, text) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = text;
    }
}

function updateMathJax() {
    if (window.MathJax && window.MathJax.typesetPromise) {
        window.MathJax.typesetPromise();
    }
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        gameState,
        updateTheoryParameters,
        calculateBusOccupation,
        awardPoints
    };
}
