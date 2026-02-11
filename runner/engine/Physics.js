export class Physics {
    static GRAVITY = 0.8;
    static GROUND_Y = 400;

    static applyGravity(entity, deltaTime) {
        entity.velocityY += this.GRAVITY;
        entity.y += entity.velocityY;

        if (entity.y >= this.GROUND_Y) {
            entity.y = this.GROUND_Y;
            entity.velocityY = 0;
            entity.grounded = true;
        } else {
            entity.grounded = false;
        }
    }

    static applyVelocity(entity, deltaTime) {
        entity.x += entity.velocityX * deltaTime * 60;
    }
}
