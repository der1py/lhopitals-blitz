// main game file

import { Player } from './entities/Player.js';
import { ObstacleManager } from './ObstacleManager.js';
import { QuizManager } from './QuizManager.js';
import { Renderer } from './Renderer.js';
import { InputHandler } from './InputHandler.js';
import { ParticleManager } from './ParticleManager.js';
import { QUESTION_BANK } from './QuestionBank.js';
import { TUTORIAL_STRUCTURES } from './Structures.js';
import { EASY_STRUCTURES } from './Structures.js';
import { HARD_STRUCTURES } from './Structures.js';

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
  tutorial: false
};

export class Game {
  constructor() {
    this.canvas = document.getElementById("gameCanvas");
    this.ctx = this.canvas.getContext("2d");
    this.canvas.width = CONFIG.canvasWidth;
    this.canvas.height = CONFIG.canvasHeight;

    this.lastTime = 0;

    this.setupUI();

    this.questionSet = QUESTION_BANK;
    this.prevState = GameState.RUNNING;

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

    this.winOverlay = document.getElementById("winOverlay");
    this.performanceText = document.getElementById("performanceText");
    this.winMenuButton = document.getElementById("winMenuButton");

    // win menu button
    this.winMenuButton.addEventListener("click", () => {
      this.state = GameState.MENU;   // switch to menu
      this.toggleMenu(true, "main-menu");
      this.toggleGame(false);
      this.winOverlay.classList.add("hidden");
    });

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
    
    this.loadStructures();

    this.quizManager = new QuizManager(this.obstacleManager, this.questionSet);
    this.particleManager = new ParticleManager();
    this.completedQuestions = 0;
    this.totalQuestions = this.questionSet.length;

    // Score & game state
    this.score = 0;
    this.state = GameState.RUNNING;

    this.goalCooldown = 0; // time remaining (ms)
    this.maxGoalCooldown = 2000; // 2 seconds

    this.obstacleManager.spawnStructure(TUTORIAL_STRUCTURES[1]); 
  }

  loadStructures() {

    if (CONFIG.tutorial) {
      this.obstacleManager = new ObstacleManager(TUTORIAL_STRUCTURES);
      return;
    }

    let STRUCTURES = [];

    switch(CONFIG.difficulty) {
      case 0:
        STRUCTURES = [
          ...EASY_STRUCTURES
        ];
        break;
      case 1:
        STRUCTURES = [
          ...EASY_STRUCTURES,
          ...HARD_STRUCTURES  // 1x weight
        ];
        break;
      case 2:
        STRUCTURES = [
          ...HARD_STRUCTURES
        ];
        break;
      default:
        console.warn("invalid difficulty selected");
    }
    console.log(STRUCTURES);

    this.obstacleManager = new ObstacleManager(STRUCTURES);
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
    this.input.update(); // update input state at end of frame so justPressed works properly
    requestAnimationFrame(this.loop.bind(this));
  }

  // update the main gameplaying state
  update(deltaTime) {

    if (this.input.isKeyJustPressed("p")) {
      if (this.state === GameState.PAUSED) {
        this.unpause();
        return;
      }
    }

    if (this.state === GameState.PAUSED) return;
    if (this.state === GameState.WIN) return;

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
        if (this.input.isKeyJustPressed("p")) this.pause();
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

    // update goal cooldown
    this.goalCooldown = Math.max(0, this.goalCooldown - deltaTime);

    // update based on state
    if (this.state == GameState.RUNNING) {
      // spawn new structures as needed
      if (this.obstacleManager.spawnsSinceLastQuiz >= 2) {
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

  }

  // render everything, only canvas stuff should be here; menus handeled separately
  draw(deltaTime) {
    this.renderer.clear();

    switch (this.state) {
      case GameState.RUNNING:
      case GameState.QUIZ:
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
    this.renderer.drawQuizProgress(this.completedQuestions, this.totalQuestions);
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

    // show/hide win overlay
    if (this.state == GameState.WIN) {
      this.winOverlay.classList.remove("hidden");
    } else {
      this.winOverlay.classList.add("hidden");
    }
  }

  pause() {
    if (this.state !== GameState.RUNNING && this.state !== GameState.QUIZ) return;

    this.prevState = this.state;
    this.state = GameState.PAUSED;
    this.score -= 10; // apply penalty immediately
    this.pauseOverlay.classList.remove("hidden");

  }

  unpause() {
    this.state = this.prevState;
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