import { flashlight } from './flashlight-core.js';

class ThemeManager extends HTMLElement {
    constructor() {
        super();
        this.currentTheme = 'grid-theme';
        this.state = {};
        this.isDropdownOpen = false;
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
        this.setupEventListeners();
        
        flashlight.addEventListener('statechange', (e) => {
            this.state = e.detail;
            this.updateCurrentTheme();
        });
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    height: 100vh;
                    position: relative;
                }
                
                .theme-toggle {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    z-index: 10000;
                    width: 40px;
                    height: 40px;
                    background: rgba(0, 0, 0, 0.7);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 50%;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 18px;
                    transition: all 0.3s ease;
                    backdrop-filter: blur(10px);
                }
                
                .theme-toggle:hover {
                    background: rgba(0, 0, 0, 0.9);
                    transform: scale(1.1);
                }
                
                .theme-toggle.open {
                    background: rgba(0, 212, 255, 0.8);
                    transform: rotate(90deg);
                }
                
                .theme-dropdown {
                    position: fixed;
                    top: 70px;
                    right: 20px;
                    z-index: 10000;
                    background: rgba(0, 0, 0, 0.9);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 15px;
                    padding: 10px;
                    display: none;
                    flex-direction: column;
                    gap: 8px;
                    backdrop-filter: blur(10px);
                    min-width: 120px;
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.5);
                }
                
                .theme-dropdown.open {
                    display: flex;
                    animation: fadeIn 0.3s ease;
                }
                
                .theme-btn {
                    padding: 8px 16px;
                    background: transparent;
                    color: rgba(255, 255, 255, 0.8);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 20px;
                    cursor: pointer;
                    font-size: 12px;
                    font-weight: 500;
                    transition: all 0.3s ease;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                
                .theme-btn:hover {
                    background: rgba(255, 255, 255, 0.1);
                    color: white;
                    border-color: rgba(255, 255, 255, 0.3);
                }
                
                .theme-btn.active {
                    background: #00d4ff;
                    color: black;
                    border-color: #00d4ff;
                }
                
                .theme-container {
                    height: 100vh;
                    position: relative;
                }
                
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            </style>
            
            <div class="theme-toggle">⚙</div>
            
            <div class="theme-dropdown">
                <button class="theme-btn active" data-theme="grid-theme">Grid</button>
                <button class="theme-btn" data-theme="warhammer-theme">Warhammer</button>
            </div>
            
            <div class="theme-container">
                <!-- Themes will be loaded here dynamically -->
            </div>
        `;
    }

    setupEventListeners() {
        const toggle = this.shadowRoot.querySelector('.theme-toggle');
        const dropdown = this.shadowRoot.querySelector('.theme-dropdown');
        const buttons = this.shadowRoot.querySelectorAll('.theme-btn');

        // Toggle dropdown
        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            this.isDropdownOpen = !this.isDropdownOpen;
            dropdown.classList.toggle('open', this.isDropdownOpen);
            toggle.classList.toggle('open', this.isDropdownOpen);
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            this.isDropdownOpen = false;
            dropdown.classList.remove('open');
            toggle.classList.remove('open');
        });

        // Prevent dropdown close when clicking inside
        dropdown.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        buttons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const theme = e.target.dataset.theme;
                this.switchTheme(theme);
                
                // Update buttons
                buttons.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                
                // Close dropdown
                this.isDropdownOpen = false;
                dropdown.classList.remove('open');
                toggle.classList.remove('open');
            });
        });

        // Load initial theme
        this.loadTheme(this.currentTheme);
    }

    async switchTheme(themeName) {
        if (this.currentTheme === themeName) return;
        
        this.currentTheme = themeName;
        await this.loadTheme(themeName);
    }

    async loadTheme(themeName) {
        const container = this.shadowRoot.querySelector('.theme-container');
        container.innerHTML = '';

        let themeElement;
        
        switch(themeName) {
            case 'grid-theme':
                const { GridTheme } = await import('./themes/grid-theme.js');
                themeElement = new GridTheme();
                break;
            case 'warhammer-theme':
                const { WarhammerTheme } = await import('./themes/warhammer-theme.js');
                themeElement = new WarhammerTheme();
                break;
        }

        if (themeElement) {
            container.appendChild(themeElement);
            // Update theme with current state
            if (themeElement.update) {
                themeElement.update(this.state);
            }
        }
    }

    updateCurrentTheme() {
        const container = this.shadowRoot.querySelector('.theme-container');
        const currentTheme = container.firstElementChild;
        if (currentTheme && currentTheme.update) {
            currentTheme.update(this.state);
        }
    }

    closeDropdown() {
        this.isDropdownOpen = false;
        const dropdown = this.shadowRoot.querySelector('.theme-dropdown');
        const toggle = this.shadowRoot.querySelector('.theme-toggle');
        dropdown.classList.remove('open');
        toggle.classList.remove('open');
    }
}

customElements.define('theme-manager', ThemeManager);