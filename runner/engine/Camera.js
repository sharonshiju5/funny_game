export class Camera {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.shakeIntensity = 0;
        this.shakeDuration = 0;
        this.motionBlur = 0;
    }

    shake(intensity = 10, duration = 0.3) {
        this.shakeIntensity = intensity;
        this.shakeDuration = duration;
    }

    update(deltaTime) {
        if (this.shakeDuration > 0) {
            this.shakeDuration -= deltaTime;
            this.x = (Math.random() - 0.5) * this.shakeIntensity;
            this.y = (Math.random() - 0.5) * this.shakeIntensity;
            
            if (this.shakeDuration <= 0) {
                this.x = 0;
                this.y = 0;
            }
        }
        
        this.motionBlur *= 0.95;
    }

    apply(ctx) {
        ctx.translate(this.x, this.y);
    }

    reset(ctx) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
}
