import { CONFIG } from '../Game.js';
import { Entity } from '../Entity.js';

export class Player extends Entity {
    constructor(x, y) {
        super(x, y, CONFIG.blockSize, CONFIG.blockSize);  // default size for player box

        // Physics
        this.vx = 0;
        this.vy = 0;
        this.gravity = 3000;      // pixels/sec^2
        this.jumpVelocity = -800; // upward jump impulse

        // Ground
        this.groundY = y;         // remember starting Y as "ground"
        this.isOnGround = true;
        this.groundBlock = null;

        // Sprite
        this.spriteRotation = 0;
        this.spriteRotationSpeed = CONFIG.scrollSpeed * (Math.PI / 180) * 3;
        this.color = {r: 0, g: 255, b: 255};
    }

    jump() {
        if (this.isOnGround) {
            this.vy += this.jumpVelocity;
            this.isOnGround = false;
        }
    }

    update(dt) {
        // Apply gravity
        this.vy += this.gravity * dt / 1000;
        let nextY = this.y + this.vy * dt / 1000;

        // Ground collision
        if (nextY >= this.groundY || (this.groundBlock && nextY >= this.groundBlock.y - this.height)) {
            this.y = this.groundBlock ? this.groundBlock.y - this.height : this.groundY;
            this.vy = 0;
            this.isOnGround = true;
        } else {
            this.y = nextY;
            this.isOnGround = false;
        }

    }

    collidesWith(e) {
        return !(
            this.x + this.width <= e.x ||
            this.x >= e.x + e.width ||
            this.y + this.height <= e.y ||
            this.y >= e.y + e.height
        );
    }
}