import { Obstacle } from './Obstacle.js';

export class ScrollingText extends Obstacle {
    constructor(x, y, width, height, text) {
        super(x, y, width, height, 'text', 'black');
        this.text = text;
        this.width = text.length * 12; // approximate width based on character count
    }

    update(dt) {
        super.update(dt);
    }
}