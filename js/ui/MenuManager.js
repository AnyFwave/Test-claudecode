import { WeaponRegistry } from '../weapons/WeaponRegistry.js';

export class MenuManager {
  constructor(game) {
    this.game = game;

    this.startScreen = document.getElementById('start-screen');
    this.gameoverScreen = document.getElementById('gameover-screen');
    this.upgradeScreen = document.getElementById('upgrade-screen');
    this.waveAnnounce = document.getElementById('wave-announce');

    this.finalScore = document.getElementById('final-score');
    this.finalWave = document.getElementById('final-wave');
    this.finalStage = document.getElementById('final-stage');
    this.finalLevel = document.getElementById('final-level');

    this.upgradeOptions = document.getElementById('upgrade-options');
    this.upgradeBtns = this.upgradeOptions.querySelectorAll('.upgrade-btn');

    this.waveTimer = 0;
    this.waveShowing = false;

    this._bindEvents();
  }

  _bindEvents() {
    document.getElementById('start-btn').addEventListener('click', () => this.startGame());
    document.getElementById('restart-btn').addEventListener('click', () => this.startGame());

    this.upgradeBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.dataset.index);
        this.game.selectUpgrade(idx);
      });
    });

    document.getElementById('replace-cancel-btn').addEventListener('click', () => this.game.cancelReplace());
    document.getElementById('next-stage-btn').addEventListener('click', () => this.game.nextStage());
  }

  showStart() {
    this.startScreen.classList.remove('hidden');
    this.gameoverScreen.classList.add('hidden');
    this.upgradeScreen.classList.add('hidden');
  }

  showGameOver(score, wave, level, stage) {
    this.gameoverScreen.classList.remove('hidden');
    this.startScreen.classList.add('hidden');
    this.upgradeScreen.classList.add('hidden');
    this.finalScore.textContent = `Score: ${score}`;
    this.finalWave.textContent = `Wave: ${wave}`;
    this.finalStage.textContent = `Stage: ${stage || 1}`;
    this.finalLevel.textContent = `Level: ${level}`;
  }

  showUpgrade(options) {
    this.upgradeScreen.classList.remove('hidden');
    this.upgradeBtns.forEach((btn, i) => {
      if (i < options.length) {
        btn.innerHTML = `<div class="upgrade-name">${options[i].icon} ${options[i].name}</div>
                         <div class="upgrade-desc">${options[i].desc}</div>`;
        btn.style.display = 'block';
        btn.dataset.index = i;
      } else {
        btn.style.display = 'none';
      }
    });
  }

  hideUpgrade() {
    this.upgradeScreen.classList.add('hidden');
  }

  announceWave(wave) {
    this.waveAnnounce.textContent = `WAVE ${wave}`;
    this.waveAnnounce.classList.remove('hidden');
    this.waveAnnounce.classList.add('show');
    this.waveTimer = 2.0;
    this.waveShowing = true;
  }

  update(dt) {
    if (this.waveShowing) {
      this.waveTimer -= dt;
      if (this.waveTimer <= 0) {
        this.waveAnnounce.classList.remove('show');
        this.waveAnnounce.classList.add('hidden');
        this.waveShowing = false;
      }
    }
  }

  showReplace(inventory) {
    const screen = document.getElementById('replace-screen');
    const options = document.getElementById('replace-options');
    screen.classList.remove('hidden');
    options.innerHTML = '';
    inventory.forEach((w, i) => {
      const btn = document.createElement('button');
      btn.className = 'replace-btn';
      const stars = '★'.repeat(w.level) + '☆'.repeat(w.maxLevel - w.level);
      btn.innerHTML = `<div class="replace-icon">${w.icon}</div>
        <div class="replace-name">${w.name}</div>
        <div class="replace-level">${stars}</div>`;
      btn.addEventListener('click', () => this.game.selectReplace(i));
      options.appendChild(btn);
    });
  }

  hideReplace() {
    document.getElementById('replace-screen').classList.add('hidden');
  }

  showStageComplete(stage, wave, score) {
    const screen = document.getElementById('stage-screen');
    const stats = document.getElementById('stage-stats');
    screen.classList.remove('hidden');
    stats.innerHTML = `Stage ${stage} Complete!<br>Wave: ${wave}<br>Score: ${score}`;
  }

  hideStageComplete() {
    document.getElementById('stage-screen').classList.add('hidden');
  }

  startGame() {
    this.startScreen.classList.add('hidden');
    this.gameoverScreen.classList.add('hidden');
    this.upgradeScreen.classList.add('hidden');
    document.getElementById('replace-screen').classList.add('hidden');
    document.getElementById('stage-screen').classList.add('hidden');
    this.game.start();
  }
}
