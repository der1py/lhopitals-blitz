// main game file

import { Player } from './entities/Player.js';
import { ObstacleManager } from './ObstacleManager.js';
import { QuizManager } from './QuizManager.js';
import { Renderer } from './Renderer.js';
import { InputHandler } from './InputHandler.js';
import { ParticleManager } from './ParticleManager.js';
import { EASY_STRUCTURES } from './Structures.js'; // for debug; remove later

// states
const GameState = Object.freeze({
  RUNNING: 'RUNNING',
  QUIZ: 'QUIZ',
  GAME_OVER: 'GAME_OVER',
  MENU: 'MENU',
  PAUSED: 'PAUSED',
});

const GameMode = Object.freeze({
  LEVEL: 'LEVEL',
  ENDLESS: 'ENDLESS'
});

// the ones with todo dont actually do anything lol
const BLOCK_SIZE = 30;
export const CONFIG = {
  blockSize: BLOCK_SIZE,
  canvasWidth: 20 * BLOCK_SIZE,
  canvasHeight: 12 * BLOCK_SIZE,
  gravity: 0.6, // todo
  jumpVelocity: -12, // todo
  scrollSpeed: 240, // todo
  questionDuration: 5000, // todo
  obstacleSpacing: 250, // todo
  laneCount: 4 // todo
};

export class Game {
  constructor() {
    this.canvas = document.getElementById("gameCanvas");
    this.ctx = this.canvas.getContext("2d");
    this.canvas.width = CONFIG.canvasWidth;
    this.canvas.height = CONFIG.canvasHeight;

    this.lastTime = 0;

    this.setupUI();

    this.reset();
    this.state = GameState.MENU;

    // Start loop
    requestAnimationFrame(this.loop.bind(this));
  }

  setupUI() {
    // DOM references
    this.pauseOverlay = document.getElementById("pauseOverlay");
    this.resumeButton = document.getElementById("resumeButton");
    this.quitButton = document.getElementById("quitButton");

    // Resume button
    this.resumeButton.addEventListener("click", () => {
      this.unpause();
    });

    // Quit button
    this.quitButton.addEventListener("click", () => {
      this.state = GameState.MENU;   // switch to menu
      this.toggleMenu(true, "main-menu");
      this.toggleGame(false);
      this.pauseOverlay.classList.add("hidden");
    });
  }

  reset() {
    // Player setup
    this.player = new Player(3 * CONFIG.blockSize, 10 * CONFIG.blockSize);

    // Input and renderer
    this.input = new InputHandler();
    this.renderer = new Renderer(this.ctx, this.canvas);
    
    this.obstacleManager = new ObstacleManager();
    this.quizManager = new QuizManager(this.obstacleManager);
    this.particleManager = new ParticleManager();

    // Score & game state
    this.score = 0;
    this.state = GameState.RUNNING;
  }

  loop(timestamp) {
    const deltaTime = timestamp - this.lastTime;
    this.lastTime = timestamp;

    // switch (this.state) {
    //   case GameState.QUIZ:
    //   case GameState.RUNNING:
    //     this.update(deltaTime);
    //     break;
    // }
    this.update(deltaTime);
    this.draw(deltaTime);
    requestAnimationFrame(this.loop.bind(this));
  }

  // update the main gameplaying state
  update(deltaTime) {
    console.log(this.pauseOverlay.classList);
    if (this.state === GameState.PAUSED) return;

    this.updateCSS();

    if (this.input.isKeyPressed("m")) {
      this.state = GameState.MENU;
      // window.location.href = 'test.html'
    }


    switch (this.state) {
      case GameState.MENU:
        this.toggleMenu(true, "main-menu");
        this.toggleGame(false);
        return;
      case GameState.QUIZ:
      case GameState.RUNNING:
        break;
      case GameState.GAME_OVER:
        if (this.particleManager.particles.length == 0) {
          this.reset();
        }
        return;
      default:
        return;
    }

    this.toggleMenu(false);
    this.toggleGame(true);

    // handle input
    if (this.input.isKeyPressed(" ") || this.input.isKeyPressed("ArrowUp") || this.input.isMousePressed()) {
        this.player.jump();
    }

    // TODO debug
    if (this.input.isKeyPressed("3")) {
        console.log(this.obstacleManager.obstacles);
    }
    
    this.moveAndCollide(deltaTime);

    // update based on state
    if (this.state == GameState.RUNNING) {
      // spawn new structures as needed
      if (this.obstacleManager.spawnsSinceLastQuiz >= 3) {
        this.state = GameState.QUIZ;
        this.obstacleManager.spawnsSinceLastQuiz = 0;
        this.quizManager.init();
      } else {
        this.obstacleManager.spawnNewStructure();
      }

    } else if (this.state == GameState.QUIZ) {
      // quiz logic
      this.quizManager.update();
      if (!this.quizManager.active) this.state = GameState.RUNNING;
    }

    // TODO fix scoring
    // Endless runner scoring (could increment over time)
    this.score += 0.01 * deltaTime; // simple score per time
    const distance = CONFIG.scrollSpeed * (deltaTime / 1000); // TODO this bs

  }

  // render everything, only canvas stuff should be here; menus handeled separately
  draw(deltaTime) {
    this.renderer.clear();

    switch (this.state) {
      case GameState.RUNNING:
      case GameState.QUIZ:
        this.renderer.drawPlayer(this.player, deltaTime);
        break;
      case GameState.GAME_OVER:
        // this.ctx.fillStyle = "black";
        // this.ctx.font = "40px Arial";
        // this.ctx.fillText(
        //   "Game Over!", 
        //   CONFIG.canvasWidth / 2 - 100,
        //   CONFIG.canvasHeight / 2
        // );
    }

    this.obstacleManager.obstacles.forEach(obstacle => this.renderer.drawObstacle(obstacle));
    this.renderer.drawScore(Math.floor(this.score));
    this.particleManager.update(deltaTime); // particles are purely visual so update in draw
    this.renderer.drawParticles(this.particleManager.particles);
  }

  gameOver() {
    if (this.state == GameState.GAME_OVER) return;
    this.particleManager.spawnParticles(this.player.x, this.player.y, 80);
    this.state = GameState.GAME_OVER;
  }

  // show/hide menus
  // default is all menu elements, but can specify a class to only toggle one menu
  toggleMenu(show, menu = "all") {
    
    if (menu == "all") {
      document.querySelectorAll(`.menu`).forEach(el => {
        el.classList.toggle("hidden", !show);
      });
    } else if (document.getElementById(menu)) {
      document.getElementById(menu).classList.toggle("hidden", !show);
    } else {
      console.warn(`Menu with id ${menu} not found`);
    }
  }

  toggleGame(show) {
    document.querySelectorAll(`.gameElement`).forEach(el => {
        el.classList.toggle("hidden", !show);
    });
    // show/hide pause overlay
    if (this.state == GameState.PAUSED) {
      this.pauseOverlay.classList.remove("hidden");
    } else {
      this.pauseOverlay.classList.add("hidden");
    }
  }

  pause() {
    if (this.state !== GameState.RUNNING) return;

    this.state = GameState.PAUSED;
    this.score -= 10; // apply penalty immediately
    this.pauseOverlay.classList.remove("hidden");
  }

  unpause() {
    this.state = GameState.RUNNING;
    this.pauseOverlay.classList.add("hidden");
  }

  // make it only call on state change to be slightly more efficient maybe
  updateCSS() {
    switch (this.state) {
      case GameState.MENU:
        document.getElementById("gameStyle").disabled = true;
        document.getElementById("menuStyle").disabled = false;
        break;
      default:
        document.getElementById("gameStyle").disabled = false;
        document.getElementById("menuStyle").disabled = true;
    }
  }


  // handles all movement and collision logic
  moveAndCollide(deltaTime) {
    // axis separation: handle x and y logic separately

    // update x movement
    this.obstacleManager.update(deltaTime);

    // handle x collisions
    this.obstacleManager.obstacles.forEach(obstacle => {
        if (this.player.collidesWith(obstacle)) {
          switch(obstacle.type) {
            case 'text':
              break;
            default:
              this.gameOver();
              break;
          }

        }
    });

    // update y movement
    this.player.update(deltaTime, this.input);

    // handle y collisions
    this.player.groundBlock = null;
    this.obstacleManager.obstacles.forEach(obstacle => {
        if (this.player.collidesWith(obstacle)) {
          switch(obstacle.type) {
            case 'block':
              if (this.player.vy < 0) {
                this.player.y = obstacle.y + obstacle.height;
                this.player.vy *= -0.2;
              } else {
                this.player.vy = 0; // ensure no downward velocity before player is able to jump
                this.player.isOnGround = true;
                this.player.y = obstacle.y - this.player.height;
                this.player.groundBlock = obstacle;
              }
              break;
            case 'spike':
              this.gameOver();
              break;
            case 'slime':
              if (this.player.vy < 0) {
                this.player.y = obstacle.y + obstacle.height;
              } else {
                this.player.isOnGround = true;
                this.player.y = obstacle.y - this.player.height;
                this.player.groundBlock = obstacle;
              }
              this.player.vy *= -0.5; // bouncy
              break;
            default:
          }
        }
    });
  }

}