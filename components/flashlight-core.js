// Базовый класс для состояния фонарика
class FlashlightCore extends EventTarget {
    constructor() {
        super();
        this.state = {
            isActive: false,
            brightness: 100
        };
        this.isSwiping = false;
        this.startX = 0;
        
        this.setupGlobalHandlers();
    }

    setState(newState) {
        this.state = { ...this.state, ...newState };
        this.dispatchEvent(new CustomEvent('statechange', { 
            detail: this.state 
        }));
    }

    setupGlobalHandlers() {
        // Touch события для свайпов
        document.addEventListener('touchstart', (e) => {
            if (!this.state.isActive) return;
            this.isSwiping = true;
            this.startX = e.touches[0].clientX;
        });

        document.addEventListener('touchmove', (e) => {
            if (!this.isSwiping || !this.state.isActive) return;
            e.preventDefault();
            
            const currentX = e.touches[0].clientX;
            const deltaX = currentX - this.startX;
            const sensitivity = 0.8;
            
            if (Math.abs(deltaX) > 5) {
                let change = Math.round(deltaX * sensitivity);
                let newBrightness = this.state.brightness + change;
                newBrightness = Math.max(10, Math.min(100, newBrightness));
                
                this.setState({ brightness: newBrightness });
                this.startX = currentX;
            }
        });

        document.addEventListener('touchend', () => {
            this.isSwiping = false;
        });

        // Keyboard support
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.toggle();
            }
        });
    }

    toggle() {
        this.setState({ isActive: !this.state.isActive });
    }

    setBrightness(value) {
        this.setState({ brightness: Math.max(10, Math.min(100, value)) });
    }
}

// Экспортируем синглтон
export const flashlight = new FlashlightCore();