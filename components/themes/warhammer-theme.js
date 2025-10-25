import { flashlight } from '../flashlight-core.js';

class WarhammerTheme extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.state = {};
        this.isSwiping = false;
        this.startX = 0;
    }

    connectedCallback() {
        this.render();
        this.setupEventListeners();
        this.setupSwipeHandlers();
        flashlight.addEventListener('statechange', (e) => {
            this.update(e.detail);
        });
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                @import "https://maksim-124.github.io/flashlight-pwa/styles/themes/warhammer-theme.css";
            </style>
            
            <div class="light-overlay"></div>
            <div class="corner-bracket bracket-tl"></div>
            <div class="corner-bracket bracket-tr"></div>
            <div class="corner-bracket bracket-bl"></div>
            <div class="corner-bracket bracket-br"></div>
            <div class="swipe-instructions">SWIPE LEFT/RIGHT TO ADJUST BRIGHTNESS</div>
            
            <div class="container">
                <header class="header">
                    <h1 class="app-title">IMPERIUM LUMINA</h1>
                    <p class="app-subtitle">IN TENEBRIS LUX</p>
                </header>

                <main class="main-controls">
                    <button class="power-core">ENGAGE</button>
                    <div class="machine-interface">
                        <div class="interface-label">
                            <span>LUMEN OUTPUT</span>
                            <span class="lumen-value">100%</span>
                        </div>
                        <input type="range" class="lumen-slider" min="10" max="100" value="100">
                    </div>
                </main>

                <footer class="status-panel">
                    <div class="status-indicator">
                        <div class="status-led"></div>
                        <span class="status-text">STANDBY</span>
                    </div>
                </footer>
            </div>
        `;
    }

    setupEventListeners() {
        const button = this.shadowRoot.querySelector('.power-core');
        const slider = this.shadowRoot.querySelector('.lumen-slider');

        button.addEventListener('click', () => flashlight.toggle());
        slider.addEventListener('input', (e) => {
            flashlight.setBrightness(parseInt(e.target.value));
        });
    }

    setupSwipeHandlers() {
        this.shadowRoot.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        this.shadowRoot.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        this.shadowRoot.addEventListener('touchend', () => this.handleTouchEnd());
        
        this.shadowRoot.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.shadowRoot.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.shadowRoot.addEventListener('mouseup', () => this.handleMouseUp());
    }

    handleTouchStart(e) {
        if (!this.state.isActive) return;
        
        this.isSwiping = true;
        this.startX = e.touches[0].clientX;
        this.showSwipeInstructions();
    }

    handleTouchMove(e) {
        if (!this.isSwiping || !this.state.isActive) return;
        
        e.preventDefault();
        const currentX = e.touches[0].clientX;
        this.processSwipe(currentX);
    }

    handleTouchEnd() {
        if (!this.isSwiping) return;
        
        this.isSwiping = false;
        this.hideSwipeInstructions();
    }

    handleMouseDown(e) {
        if (!this.state.isActive) return;
        
        this.isSwiping = true;
        this.startX = e.clientX;
        this.showSwipeInstructions();
    }

    handleMouseMove(e) {
        if (!this.isSwiping || !this.state.isActive) return;
        
        const currentX = e.clientX;
        this.processSwipe(currentX);
    }

    handleMouseUp() {
        if (!this.isSwiping) return;
        
        this.isSwiping = false;
        this.hideSwipeInstructions();
    }

    processSwipe(currentX) {
        const deltaX = currentX - this.startX;
        const sensitivity = 0.8;
        
        if (Math.abs(deltaX) > 5) {
            let change = Math.round(deltaX * sensitivity);
            let newBrightness = this.state.brightness + change;
            newBrightness = Math.max(10, Math.min(100, newBrightness));
            
            flashlight.setBrightness(newBrightness);
            this.startX = currentX;
        }
    }

    showSwipeInstructions() {
        const instructions = this.shadowRoot.querySelector('.swipe-instructions');
        instructions.classList.add('active');
    }

    hideSwipeInstructions() {
        const instructions = this.shadowRoot.querySelector('.swipe-instructions');
        setTimeout(() => {
            instructions.classList.remove('active');
        }, 1000);
    }

    update(state) {
        this.state = state;
        
        const button = this.shadowRoot.querySelector('.power-core');
        const slider = this.shadowRoot.querySelector('.lumen-slider');
        const value = this.shadowRoot.querySelector('.lumen-value');
        const statusLed = this.shadowRoot.querySelector('.status-led');
        const statusText = this.shadowRoot.querySelector('.status-text');
        const lightOverlay = this.shadowRoot.querySelector('.light-overlay');
        const container = this.shadowRoot.querySelector('.container');

        if (!button || !slider || !value || !statusLed || !statusText || !lightOverlay || !container) return;

        // Update button
        button.textContent = state.isActive ? 'DISENGAGE' : 'ENGAGE';
        button.classList.toggle('active', state.isActive);

        // Update slider and value
        slider.value = state.brightness;
        value.textContent = state.brightness + '%';

        // Update status
        statusLed.classList.toggle('active', state.isActive);
        statusText.textContent = state.isActive 
            ? `ACTUS - LUMINA ${state.brightness}%` 
            : 'SILENTIUM';

        // Update light
        lightOverlay.style.opacity = state.isActive ? (state.brightness / 100) : 0;
    }
}

customElements.define('warhammer-theme', WarhammerTheme);

export { WarhammerTheme };