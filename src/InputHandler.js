export class InputHandler {
  constructor() {
    this.keys = {};
    this.isMouseDown = false;
    window.addEventListener("keydown", e => this.keys[e.key] = true);
    window.addEventListener("keyup", e => this.keys[e.key] = false);

    window.addEventListener("mousedown", () => {
      this.isMouseDown = true;
    });

    window.addEventListener("mouseup", () => {
      this.isMouseDown = false;
    });
  }

  isKeyPressed(key) {
    return this.keys[key];
  }

  isMousePressed() {
    return this.isMouseDown;
  }
}
