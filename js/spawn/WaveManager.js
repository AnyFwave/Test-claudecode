import { Enemy } from '../entities/Enemy.js';
import { EventBus } from '../core/EventBus.js';

export class WaveManager {
  constructor(gameState) {
    this.state = gameState;
    this.enemiesSpawned = 0;
    this.enemiesPerWave = 0;
    this.spawnTimer = 0;
    this.spawnInterval = 1.2;
    this.countdown = 0;
  }

  startGame() {
    this.state.wave = 0;
    this.state.stage = 1;
    this.startNextWave();
  }

  startNextWave() {
    this.state.wave++;
    this.state.stage = Math.ceil(this.state.wave / 5);
    this.state.waveActive = true;
    this.enemiesSpawned = 0;
    this.enemiesPerWave = 3 + this.state.wave * 2;
    this.spawnTimer = 0;
    this.spawnInterval = Math.max(0.3, 1.2 - this.state.wave * 0.03);
    this.countdown = 0;
    EventBus.emit('wave:started', { wave: this.state.wave, stage: this.state.stage });
  }

  update(dt) {
    if (!this.state.waveActive || this.state.scene !== 'playing') {
      if (!this.state.waveActive && this.state.scene === 'playing') {
        this.countdown -= dt;
        if (this.countdown <= 0) this.startNextWave();
      }
      return;
    }

    if (this.enemiesSpawned < this.enemiesPerWave) {
      this.spawnTimer -= dt;
      if (this.spawnTimer <= 0) {
        this.spawnTimer = this.spawnInterval;
        this._spawnEnemy();
        this.enemiesSpawned++;
      }
    }

    if (this.enemiesSpawned >= this.enemiesPerWave && this.state.enemies.length === 0) {
      this.state.waveActive = false;

      if (this.state.wave % 5 === 0) {
        this.state.scene = 'stageComplete';
        EventBus.emit('stage:complete', {
          stage: this.state.stage,
          wave: this.state.wave,
          score: this.state.score
        });
      } else {
        this.countdown = 3.0;
      }
    }
  }

  _spawnEnemy() {
    const types = ['basic', 'basic', 'basic', 'fast', 'tank'];
    const availableTypes = [...types];

    if (this.state.wave >= 3) availableTypes.push('sniper', 'swarm', 'swarm');
    if (this.state.wave >= 5) availableTypes.push('shield', 'splitter');
    if (this.state.wave >= 8) availableTypes.push('sniper', 'shield');

    let type = availableTypes[Math.floor(Math.random() * availableTypes.length)];

    if (this.state.wave % 5 === 0 && this.enemiesSpawned === 0) type = 'boss';

    const cw = this.state.canvasWidth;
    const ch = this.state.canvasHeight;
    const margin = 50;

    if (type === 'swarm') {
      const count = 3 + Math.floor(Math.random() * 3);
      for (let k = 0; k < count; k++) {
        const { x, y } = this._randomEdgePos(cw, ch, margin);
        this.state.addEnemy(new Enemy(x + k * 8, y + k * 8, 'swarm', this.state.wave));
      }
      return;
    }

    const { x, y } = this._randomEdgePos(cw, ch, margin);
    this.state.addEnemy(new Enemy(x, y, type, this.state.wave));
  }

  _randomEdgePos(cw, ch, margin) {
    const side = Math.floor(Math.random() * 4);
    switch (side) {
      case 0: return { x: Math.random() * cw, y: -margin };
      case 1: return { x: cw + margin, y: Math.random() * ch };
      case 2: return { x: Math.random() * cw, y: ch + margin };
      case 3: return { x: -margin, y: Math.random() * ch };
    }
  }
}
