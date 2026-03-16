import { Entity } from '../Entity.js';
import { CONFIG } from '../Game.js';
import { Obstacle } from './Obstacle.js';

export class scrollingText extends Obstacle {
    constructor(x, y, width, height, text) {
        super(x, y, width, height, 'text', 'black');
        this.text = text;
    }

    update(dt) {
        super.update(dt);
    }
}