import { Entity } from '../Entity.js';

export class Particle extends Entity {
    constructor(x, y, color) {
        super(x, y, 0, 0);
        this.vx = (Math.random() - 0.5) * 10 + 3;
        this.vy = (Math.random() - 1) * 10 - 5;
        this.size = Math.random() * 5 + 2;
        this.color = color;
        this.life = 60;
        this.active = true;
    }

    update(dt) {
        dt = 1;
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.vy += 0.3 * dt; // gravity
        this.life -= 1 * dt;
        

        // mark as inactive once lifespan is reached
        if (this.life <= 0) {
            this.active = false;
        }
    }
}