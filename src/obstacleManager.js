import { Obstacle } from './entities/Obstacle.js';
import { CONFIG } from './Game.js';
import { EASY_STRUCTURES } from './Structures.js';
import { HARD_STRUCTURES } from './Structures.js';
import { QUIZ_STRUCTURE } from './Structures.js';

export class ObstacleManager {
    constructor() {
        this.obstacles = [];   // currently active obstacle instances
        this.buffer = [];      // world buffer: upcoming columns / structures
        this.spawnCount = 0; // how much shi has been spawned
    }

    // move all obstacles and delete offscreen ones
    update(deltaTime) {
        // 1. Spawn obstacle from buffer
        this._spawnFromBuffer();

        // 2. Update all active obstacles
        this.obstacles.forEach(obstacle => obstacle.update(deltaTime));

        // 3. Cleanup offscreen obstacles
        this.obstacles = this.obstacles.filter(ob => ob.active);
    }

    spawnNewStructure() {
        // spawn new structure if buffer is empty
        if (this.buffer.length < 1 && this.obstacles.length < 1) {
            this._spawnStructure(EASY_STRUCTURES[Math.floor(Math.random() * EASY_STRUCTURES.length)]);
        }
    }

    resetSpawnCount() {
        this.spawnCount = 0;
    }

    _spawnFromBuffer(offset = 0) {
        if (this.buffer.length === 0) {
            return;
        }

        const column = this.buffer.shift();
        for (let i = 0; i < column.length; i++) {
            switch (column[i]) {
                case 1:
                    this.spawnObstacle(i, 'block', offset);
                    break;
                case 2:
                    this.spawnObstacle(i, 'spike', offset);
                    break;
                case 3:
                    this.spawnObstacle(i, 'slime', offset);
                    break;
                default:
            }
        }
        offset++;
        this._spawnFromBuffer(offset);
    }

    // make this actually spawn random, set to spawn one input for now lmao
    _spawnStructure(s) {
        // Placeholder: decide what structure to add to buffer
        // e.g., pick a random small structure or a big one
        // For MVP, just push an empty column
        s.forEach((col) => {
            this.buffer.push(col);
        });

    }

    spawnObstacle(lane, type, offset = 0) {
        this.obstacles.push(new Obstacle(CONFIG.canvasWidth + offset * CONFIG.blockSize, lane * CONFIG.blockSize, CONFIG.blockSize, CONFIG.blockSize, type));
    }
}