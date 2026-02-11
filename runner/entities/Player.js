export class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 50;
        this.height = 60;
        this.velocityY = 0;
        this.grounded = true;
        this.state = 'RUN';
        this.jumpForce = -15;
        this.normalHeight = 60;
        this.slideHeight = 30;
        this.slideTimer = 0;
        this.animFrame = 0;
        this.animTimer = 0;
        this.dustTimer = 0;
        this.trail = [];
    }

    jump() {
        if (this.grounded && this.state !== 'SLIDE') {
            this.velocityY = this.jumpForce;
            this.state = 'JUMP';
            return true;
        }
        return false;
    }

    slide() {
        if (this.grounded && this.state !== 'SLIDE') {
            this.state = 'SLIDE';
            this.height = this.slideHeight;
            this.y += (this.normalHeight - this.slideHeight);
            this.slideTimer = 0.5;
            return true;
        }
        return false;
    }

    update(deltaTime, flying, speed = 1) {
        this.animTimer += deltaTime;
        const animSpeed = 0.1 / speed;
        if (this.animTimer > animSpeed) {
            this.animFrame = (this.animFrame + 1) % 4;
            this.animTimer = 0;
        }
        
        this.dustTimer += deltaTime;
        
        this.trail.push({ x: this.x, y: this.y, alpha: 0.3 });
        if (this.trail.length > 5) this.trail.shift();
        this.trail.forEach(t => t.alpha *= 0.9);

        if (this.state === 'SLIDE') {
            this.slideTimer -= deltaTime;
            if (this.slideTimer <= 0) {
                this.height = this.normalHeight;
                this.y -= (this.normalHeight - this.slideHeight);
                this.state = 'RUN';
            }
        }

        if (!flying && this.grounded && this.state !== 'SLIDE') {
            this.state = 'RUN';
        }

        if (flying) {
            this.state = 'FLY';
            this.velocityY = 0;
            this.y = Math.max(50, Math.min(this.y, 400));
        }
    }

    render(ctx, speed = 1) {
        if (speed > 1.3) {
            this.trail.forEach(t => {
                ctx.fillStyle = `rgba(255, 107, 53, ${t.alpha})`;
                ctx.fillRect(t.x, t.y, this.width, this.height);
            });
        }
        
        ctx.fillStyle = this.state === 'DEAD' ? '#666' : '#FF6B35';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        ctx.fillStyle = '#FFF';
        ctx.fillRect(this.x + 10, this.y + 10, 10, 10);
        ctx.fillRect(this.x + 30, this.y + 10, 10, 10);
        
        if (this.state === 'RUN') {
            ctx.fillRect(this.x + 15 + (this.animFrame % 2) * 10, this.y + this.height - 20, 8, 20);
            ctx.fillRect(this.x + 25 + ((this.animFrame + 1) % 2) * 10, this.y + this.height - 20, 8, 20);
        }
    }
    
    shouldEmitDust() {
        if (this.grounded && this.dustTimer > 0.1) {
            this.dustTimer = 0;
            return true;
        }
        return false;
    }
}
