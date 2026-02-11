export class GameLoop {
    constructor() {
        this.lastTime = 0;
        this.deltaTime = 0;
        this.running = false;
        this.updateCallback = null;
        this.renderCallback = null;
    }

    start(updateFn, renderFn) {
        this.updateCallback = updateFn;
        this.renderCallback = renderFn;
        this.running = true;
        this.lastTime = performance.now();
        this.loop(this.lastTime);
    }

    loop(timestamp) {
        if (!this.running) return;

        this.deltaTime = Math.min((timestamp - this.lastTime) / 1000, 0.1);
        this.lastTime = timestamp;

        if (this.updateCallback) this.updateCallback(this.deltaTime);
        if (this.renderCallback) this.renderCallback();

        requestAnimationFrame((t) => this.loop(t));
    }

    stop() {
        this.running = false;
    }
}
