import { flashlight } from '../flashlight-core.js';

class GridTheme extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.state = {};
    }

    connectedCallback() {
        this.render();
        this.setupEventListeners();
        flashlight.addEventListener('statechange', (e) => {
            this.update(e.detail);
        });
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                @import "../styles/themes/grid-theme.css";
            </style>
            
            <div class="light-overlay"></div>
            
            <div class="container">
                <header class="header">
                    <h1 class="app-title">Flashlight</h1>
                    <p class="app-subtitle">Grid Dark Theme</p>
                </header>

                <main class="main-controls">
                    <button class="flashlight-btn">ACTIVATE</button>

                    <div class="brightness-controls">
                        <div class="brightness-label">
                            <span>Brightness</span>
                            <span class="brightness-value">100%</span>
                        </div>
                        <input type="range" class="brightness-slider" min="10" max="100" value="100">
                    </div>
                </main>

                <footer class="footer">
                    <div class="status-indicator">
                        <div class="status-dot"></div>
                        <span class="status-text">Ready</span>
                    </div>
                </footer>
            </div>
        `;
    }

    setupEventListeners() {
        const button = this.shadowRoot.querySelector('.flashlight-btn');
        const slider = this.shadowRoot.querySelector('.brightness-slider');

        button.addEventListener('click', () => flashlight.toggle());
        slider.addEventListener('input', (e) => {
            flashlight.setBrightness(parseInt(e.target.value));
        });
    }

    update(state) {
        this.state = state;
        
        const button = this.shadowRoot.querySelector('.flashlight-btn');
        const slider = this.shadowRoot.querySelector('.brightness-slider');
        const value = this.shadowRoot.querySelector('.brightness-value');
        const statusDot = this.shadowRoot.querySelector('.status-dot');
        const statusText = this.shadowRoot.querySelector('.status-text');
        const lightOverlay = this.shadowRoot.querySelector('.light-overlay');

        if (!button || !slider || !value || !statusDot || !statusText || !lightOverlay) return;

        // Update button
        button.textContent = state.isActive ? 'DEACTIVATE' : 'ACTIVATE';
        button.classList.toggle('active', state.isActive);

        // Update slider and value
        slider.value = state.brightness;
        value.textContent = state.brightness + '%';

        // Update status
        statusDot.classList.toggle('off', !state.isActive);
        statusText.textContent = state.isActive 
            ? `Active • ${state.brightness}%` 
            : 'Standby';

        // Update light
        lightOverlay.style.opacity = state.isActive ? (state.brightness / 100) : 0;
    }
}

customElements.define('grid-theme', GridTheme);

export { GridTheme };