export class Coin {
    constructor(x, y) {
        this.x = x;
        this.y = y || 200 + Math.random() * 150;
        this.width = 25;
        this.height = 25;
        this.velocityX = -5;
        this.collected = false;
        this.bobOffset = Math.random() * Math.PI * 2;
    }

    update(deltaTime, gameSpeed) {
        this.x += this.velocityX * gameSpeed;
        this.y += Math.sin(Date.now() * 0.005 + this.bobOffset) * 0.5;
    }

    render(ctx) {
        if (this.collected) return;
        
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#FFA500';
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 3, 0, Math.PI * 2);
        ctx.fill();
    }

    isOffScreen() {
        return this.x + this.width < 0;
    }
}
