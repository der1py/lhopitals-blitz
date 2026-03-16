import { CONFIG } from "./Game.js";

export class Renderer {
    constructor(ctx, canvas) {
        this.ctx = ctx;
        this.canvas = canvas;
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = "black";
        this.ctx.fillRect(0, this.canvas.height - CONFIG.blockSize, this.canvas.width, CONFIG.blockSize);
    }

    drawPlayer(player, dt) {
        // hitbox for debug
        // this.ctx.fillStyle = "purple";
        // this.ctx.fillRect(player.x, player.y, player.width, player.height);

        // update sprite rotation
        if (!player.isOnGround) {
            player.spriteRotation += player.spriteRotationSpeed * dt / 1000;
        } else {
            player.spriteRotation = 0;
        }

        this.ctx.save();

        // move origin to center of sprite
        this.ctx.translate(player.x + player.width / 2, player.y + player.height / 2);

        // rotate sprite
        this.ctx.rotate(player.spriteRotation);

        // draw sprite centered
        this.ctx.fillStyle = "cyan";
        // this.ctx.fillRect(player.x, player.y, player.width, player.height);
        this.ctx.fillRect(-player.width / 2, -player.height / 2, player.width, player.height);

        this.ctx.restore();
    }

    drawObstacle(obstacle) {
        if (obstacle.type === 'text') {
            this.ctx.fillStyle = "black";
            this.ctx.font = "20px Arial";
            this.ctx.fillText(obstacle.text, obstacle.x, obstacle.y + 20);
        } else {
            this.ctx.fillStyle = obstacle.color;
            this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        }
    }

    drawQuiz(quiz) {
        // Currently empty - quiz display logic goes here later
    }

    drawScore(score) {
        this.ctx.fillStyle = "black";
        this.ctx.font = "20px Arial";
        this.ctx.fillText("Score: " + score, 10, 30);
    }
}