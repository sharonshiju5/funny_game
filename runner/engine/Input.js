export class Input {
    constructor() {
        this.keys = {};
        this.touchStart = null;
        this.jumpCallback = null;
        this.slideCallback = null;

        window.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            if (['arrowup', 'arrowdown', ' '].includes(e.key.toLowerCase())) {
                e.preventDefault();
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });

        window.addEventListener('touchstart', (e) => {
            this.touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        });

        window.addEventListener('touchend', (e) => {
            if (!this.touchStart) return;
            const touchEnd = { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
            const dy = this.touchStart.y - touchEnd.y;
            
            if (Math.abs(dy) > 50) {
                if (dy > 0 && this.jumpCallback) this.jumpCallback();
                if (dy < 0 && this.slideCallback) this.slideCallback();
            }
            this.touchStart = null;
        });
    }

    isPressed(key) {
        return this.keys[key] || false;
    }

    onSwipe(jumpFn, slideFn) {
        this.jumpCallback = jumpFn;
        this.slideCallback = slideFn;
    }
}
