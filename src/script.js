import '../menus/MainMenu.js';

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