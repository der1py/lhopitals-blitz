import '../menus/MainMenu.js';

import { Game } from './Game.js';

const game = new Game();

document.getElementById("playBtn").addEventListener("click", () => {
    game.reset();
});
