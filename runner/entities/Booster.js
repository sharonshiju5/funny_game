export class Booster {
    constructor(x, y, type) {
        this.x = x;
        this.y = y || 250;
        this.width = 30;
        this.height = 30;
        this.type = type;
        this.velocityX = -5;
        this.collected = false;
        this.rotation = 0;
    }

    update(deltaTime, gameSpeed) {
        this.x += this.velocityX * gameSpeed;
        this.rotation += deltaTime * 3;
    }

    render(ctx) {
        if (this.collected) return;
        
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(this.rotation);
        
        switch(this.type) {
            case 'speed':
                ctx.fillStyle = '#00FFFF';
                break;
            case 'fly':
                ctx.fillStyle = '#FF69B4';
                break;
            case 'shield':
                ctx.fillStyle = '#00FF00';
                break;
            case 'magnet':
                ctx.fillStyle = '#9370DB';
                break;
        }
        
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 3;
        ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);
        
        ctx.restore();
    }

    isOffScreen() {
        return this.x + this.width < 0;
    }
}
