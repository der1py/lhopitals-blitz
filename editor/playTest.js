import { Game } from './TestGame.js';
const game = new Game();

game.reset();

document.getElementById("openEditorBtn").addEventListener("click", () => {
  window.open("editor.html", "_blank");
});