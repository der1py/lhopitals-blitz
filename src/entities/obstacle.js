import { Entity } from '../Entity.js';
import { CONFIG } from '../Game.js';

export class Obstacle extends Entity {
    constructor(x, y, width, height, type, color = "red") {
        super(x, y, width, height);
        this.type = type;
        this.vx = CONFIG.scrollSpeed; // horizontal movement speed
        this.active = true; // deactivate when offscreen
        switch (type) {
            case 'block':
                this.color = "black";
                break;
            case 'spike':
                this.color = "red";
                break;
            case 'slime':
                this.color = "green";
                break;
            default:
                this.color = color;
        }
    }

    update(dt) {
        // Move left
        this.x -= this.vx * dt / 1000;

        // Deactivate if offscreen
        if (this.x + this.width < 0) {
            this.active = false;
        }
    }
}