import { Particle } from "./entities/Particle.js";
import { CONFIG } from "./Game.js";

export class ParticleManager {
    constructor() {
        this.particles = []
    }

    update(dt) {
        // update all active particles
        this.particles.forEach(p => p.update(dt));

        // remove old particles
        this.particles = this.particles.filter(p => p.active);
    }

    spawnParticles(x, y, n = 30, color = {r:0, g:255, b:255}) {
        for (let i = 0; i < n; i++) {
            this.particles.push(new Particle(
                x + CONFIG.blockSize / 2, 
                y + CONFIG.blockSize / 2, 
                color)
            );
        }
    }
    
}