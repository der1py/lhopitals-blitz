// main game file

import { Player } from '../src/entities/Player.js';
import { ObstacleManager } from '../src/ObstacleManager.js';
import { Renderer } from '../src/Renderer.js';
import { InputHandler } from '../src/InputHandler.js';
import { ParticleManager } from '../src/ParticleManager.js';
import { TUTORIAL_STRUCTURES } from '../src/Structures.js';

// states
const GameState = Object.freeze({
  RUNNING: 'RUNNING',
  QUIZ: 'QUIZ',
  GAME_OVER: 'GAME_OVER',
  MENU: 'MENU',
  PAUSED: 'PAUSED',
  WIN: 'WIN'
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
  scrollSpeed: 240, // used for obsracle movement and quiz text speed; in pixels per second
  difficulty: 1, // 0 is ez, 1 is normal, 2 is hard
  tutorial: false,
  respawn: true
};

export class Game {
  constructor() {
    this.canvas = document.getElementById("gameCanvas");
    this.ctx = this.canvas.getContext("2d");
    this.canvas.width = CONFIG.canvasWidth;
    this.canvas.height = CONFIG.canvasHeight;

    this.lastTime = 0;

    this.setupUI();

    this.questionSet = [];
    this.prevState = GameState.RUNNING;

    this.reset();
    this.state = GameState.MENU;

    // Start loop
    requestAnimationFrame(this.loop.bind(this));
  }

  setupUI() {
    return;
  }

  reset() {
    // Player setup
    this.player = new Player(3 * CONFIG.blockSize, 10 * CONFIG.blockSize);

    // Input and renderer
    this.input = new InputHandler();
    this.renderer = new Renderer(this.ctx, this.canvas);
    
    this.loadStructures();

    this.firstIteration = true; // wont say ggs on first loop

    this.particleManager = new ParticleManager();
    this.completedQuestions = 0;
    this.totalQuestions = this.questionSet.length;

    // Score & game state
    this.score = 0;
    this.state = GameState.RUNNING;

    this.goalCooldown = 0; // time remaining (ms)
    this.maxGoalCooldown = 2000; // 2 seconds

    // this.obstacleManager.spawnStructure(TUTORIAL_STRUCTURES[1]);
    // this.obstacleManager.spawnStructure(EASY_STRUCTURES[0]);  
  }

  // on death
  softReset() {
    this.player = new Player(3 * CONFIG.blockSize, 10 * CONFIG.blockSize);
    this.obstacleManager.clear();
    this.state = GameState.RUNNING;
  }

  loadStructures() {

    const STRUCTURES = [
        localStorage.getItem("playtestStructure")
        ? JSON.parse(localStorage.getItem("playtestStructure"))
        : TUTORIAL_STRUCTURES[0]
    ];
    this.obstacleManager = new ObstacleManager(STRUCTURES);
    console.log(STRUCTURES)
  }

  loop(timestamp) {
    const deltaTime = timestamp - this.lastTime;
    this.lastTime = timestamp;

    this.update(deltaTime);
    this.draw(deltaTime);
    this.input.update(); // update input state at end of frame so justPressed works properly
    requestAnimationFrame(this.loop.bind(this));
  }

  // update the main gameplaying state
  update(deltaTime) {
    // console.log(this.obstacleManager.structures);

    switch (this.state) {
      case GameState.MENU:
        return;
      case GameState.RUNNING:
        if (this.input.isKeyJustPressed("p")) this.pause();
        break;
      case GameState.GAME_OVER:
        if (this.particleManager.particles.length == 0) {
        //   if (CONFIG.respawn) this.softReset();
        //   else this.reset();
            this.reset();
        }
        return;
      default:
        return;
    }

    // handle input
    if (this.input.isKeyPressed(" ") || this.input.isKeyPressed("ArrowUp") || this.input.isMousePressed()) {
        this.player.jump();
    }

    // TODO debug
    if (this.input.isKeyPressed("3")) {
        console.log(this.obstacleManager.obstacles);
    }
    
    this.moveAndCollide(deltaTime);

    // update goal cooldown
    this.goalCooldown = Math.max(0, this.goalCooldown - deltaTime);

    // update based on state
    if (this.state == GameState.RUNNING) {
        if (this.obstacleManager.obstacles.length == 0 && !this.firstIteration) {
            alert("good job u beat this level :D");
            this.reset();
        }
        this.obstacleManager.spawnNewStructure();
    }

    this.firstIteration = false;
  }

  // render everything, only canvas stuff should be here; menus handeled separately
  draw(deltaTime) {
    this.renderer.clear();

    switch (this.state) {
      case GameState.RUNNING:
      case GameState.PAUSED:
        this.renderer.drawPlayer(this.player, deltaTime);
        this.handleGroundParticles();
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
    // this.renderer.drawQuizProgress(this.completedQuestions, this.totalQuestions);
    this.particleManager.update(deltaTime); // particles are purely visual so update in draw
    this.renderer.drawParticles(this.particleManager.particles);
  }

  handleGroundParticles() {
    if (this.player.isOnGround) {
          this.particleManager.spawnGroundParticles(
            this.player.x, 
            this.player.y + this.player.height / 2, 
            Math.max(1, 10 - this.particleManager.particles.length), 
            {r:0, g:255, b:255},
            -5, -2
          );
    }
  }

  gameOver() {
    if (this.state == GameState.GAME_OVER) return;
    this.particleManager.spawnParticles(this.player.x, this.player.y, 80);
    this.state = GameState.GAME_OVER;
    this.score -= 10; // apply penalty for dying
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

  enterGoal() {
    this.goalCooldown = this.maxGoalCooldown;
    this.score += 15;
    this.particleManager.spawnParticles(
      this.player.x,
      this.player.y,
      99,
      {r: 255, g: 215, b: 0},
      0,
      0
    );

    this.completedQuestions++;
    if (this.completedQuestions >= this.totalQuestions) {
      const maxScore = this.totalQuestions * 15;
      const percent = Math.round((this.score / maxScore) * 100);

      this.performanceText.textContent = `Performance Rating: ${percent}%`;

      this.state = GameState.WIN;
      this.winOverlay.classList.remove("hidden");
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
            case 'goal':
              if (this.goalCooldown <= 0) {
                this.enterGoal();
              }
              break;
            case 'text':
              break;
            default:
              console.log("Collided with " + obstacle.type);
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
            case 'goal':
              break;
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
              for (let i = 0; i < 30; i++) {
                this.particleManager.spawnGroundParticles(
                  this.player.x, 
                  this.player.y + this.player.height / 2, 
                  Math.max(1, 10 - this.particleManager.particles.length), 
                  {r:100, g:255, b:100},
                  -5, -2
                );
              }
              this.player.jump();
              break;
            default:
          }
        }
    });
  }

  setConfig(key, val) {
    CONFIG[key] = val;
  }

}