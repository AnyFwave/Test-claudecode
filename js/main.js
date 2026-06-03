import './data/registries.js';
import { Game } from './core/Game.js';
import { InputManager } from './input/InputManager.js';

const canvas = document.getElementById('gameCanvas');
const input = new InputManager();
input.init(canvas);

window.Input = input;

const game = new Game(canvas);

let lastTime = performance.now();

function loop(time) {
  let dt = (time - lastTime) / 1000;
  lastTime = time;

  if (dt > 0.05) dt = 0.05;

  game.update(dt);
  game.render();

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
