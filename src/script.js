import '../menus/MainMenu.js';
import '../menus/QuizMenu.js';

import { Game } from './Game.js';

const game = new Game();

document.getElementById("playBtn").addEventListener("click", () => {
    game.setConfig('tutorial', false);
    game.reset();
});

document.getElementById("playBtn").addEventListener("click", () => {
    game.setConfig('tutorial', false);
    game.reset();
});

document.getElementById("menuButton").addEventListener("click", () => {
    game.pause();
});

document.getElementById("quiz-menu-home-btn").addEventListener("click", () => {
    game.state = "MENU";
});

document.getElementById("quizMenuBtn").addEventListener("click", () => {
    game.state = "QUIZ_MENU";
});

// quiz selector shit
let selectedQuiz = null;

const buttons = document.querySelectorAll(".select-btn");

buttons.forEach(btn => {
  btn.addEventListener("click", () => {
    const quizId = btn.dataset.quiz;
    selectedQuiz = quizId;

    console.log("Selected quiz:", selectedQuiz);
    game.setConfig('quiz', parseInt(quizId));

    // reset all
    buttons.forEach(b => {
      b.classList.remove("disabled");
      b.disabled = false; // actually prevents clicking
    });

    // set selected one as disabled
    btn.classList.add("disabled");
    btn.disabled = true;
  });
});