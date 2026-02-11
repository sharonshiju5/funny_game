export class Obstacle {
    constructor(x, y, type = 'ground') {
        this.x = x;
        this.y = y;
        this.type = type;
        this.velocityX = -5;
        
        switch(type) {
            case 'ground':
                this.width = 40;
                this.height = 40;
                this.y = 420;
                break;
            case 'spike':
                this.width = 30;
                this.height = 50;
                this.y = 410;
                break;
            case 'floating':
                this.width = 35;
                this.height = 35;
                this.y = y || 300;
                break;
            case 'moving':
                this.width = 40;
                this.height = 40;
                this.baseY = y || 350;
                this.y = this.baseY;
                this.moveRange = 50;
                this.moveSpeed = 2;
                break;
        }
    }

    update(deltaTime, gameSpeed) {
        this.x += this.velocityX * gameSpeed;
        
        if (this.type === 'moving') {
            this.y = this.baseY + Math.sin(Date.now() * 0.003) * this.moveRange;
        }
    }

    render(ctx) {
        ctx.fillStyle = '#8B0000';
        
        if (this.type === 'spike') {
            ctx.beginPath();
            ctx.moveTo(this.x + this.width / 2, this.y);
            ctx.lineTo(this.x + this.width, this.y + this.height);
            ctx.lineTo(this.x, this.y + this.height);
            ctx.closePath();
            ctx.fill();
        } else {
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }

    isOffScreen() {
        return this.x + this.width < 0;
    }
}
