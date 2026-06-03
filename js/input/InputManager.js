export class InputManager {
  constructor() {
    this.keys = {};
    this.mouseX = 0;
    this.mouseY = 0;
    this.mouseDown = false;
    this._canvas = null;
    this._boundHandlers = {};
  }

  init(canvas) {
    this._canvas = canvas;

    this._boundHandlers.keydown = (e) => { this.keys[e.key] = true; };
    this._boundHandlers.keyup = (e) => { this.keys[e.key] = false; };
    this._boundHandlers.mousemove = (e) => {
      const rect = canvas.getBoundingClientRect();
      this.mouseX = e.clientX - rect.left;
      this.mouseY = e.clientY - rect.top;
    };
    this._boundHandlers.mousedown = (e) => {
      if (e.button === 0) this.mouseDown = true;
      const rect = canvas.getBoundingClientRect();
      this.mouseX = e.clientX - rect.left;
      this.mouseY = e.clientY - rect.top;
    };
    this._boundHandlers.mouseup = (e) => {
      if (e.button === 0) this.mouseDown = false;
    };
    this._boundHandlers.contextmenu = (e) => e.preventDefault();

    window.addEventListener('keydown', this._boundHandlers.keydown);
    window.addEventListener('keyup', this._boundHandlers.keyup);
    canvas.addEventListener('mousemove', this._boundHandlers.mousemove);
    canvas.addEventListener('mousedown', this._boundHandlers.mousedown);
    window.addEventListener('mouseup', this._boundHandlers.mouseup);
    canvas.addEventListener('contextmenu', this._boundHandlers.contextmenu);
  }

  destroy() {
    window.removeEventListener('keydown', this._boundHandlers.keydown);
    window.removeEventListener('keyup', this._boundHandlers.keyup);
    this._canvas.removeEventListener('mousemove', this._boundHandlers.mousemove);
    this._canvas.removeEventListener('mousedown', this._boundHandlers.mousedown);
    window.removeEventListener('mouseup', this._boundHandlers.mouseup);
    this._canvas.removeEventListener('contextmenu', this._boundHandlers.contextmenu);
  }

  get moveDir() {
    let dx = 0, dy = 0;
    if (this.keys['w'] || this.keys['W'] || this.keys['ArrowUp']) dy = -1;
    if (this.keys['s'] || this.keys['S'] || this.keys['ArrowDown']) dy = 1;
    if (this.keys['a'] || this.keys['A'] || this.keys['ArrowLeft']) dx = -1;
    if (this.keys['d'] || this.keys['D'] || this.keys['ArrowRight']) dx = 1;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len > 0) { dx /= len; dy /= len; }
    return { dx, dy };
  }
}
