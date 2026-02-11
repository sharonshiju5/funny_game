export class SpriteAnimation {
    constructor(frames, frameTime = 0.1) {
        this.frames = frames;
        this.frameTime = frameTime;
        this.currentFrame = 0;
        this.timer = 0;
    }

    update(deltaTime) {
        this.timer += deltaTime;
        if (this.timer >= this.frameTime) {
            this.currentFrame = (this.currentFrame + 1) % this.frames.length;
            this.timer = 0;
        }
    }

    getCurrentFrame() {
        return this.frames[this.currentFrame];
    }

    reset() {
        this.currentFrame = 0;
        this.timer = 0;
    }
}
