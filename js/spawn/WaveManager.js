import { Enemy } from '../entities/Enemy.js';
import { EnemyTypeRegistry } from '../entities/enemyTypes/EnemyTypeRegistry.js';
import { EventBus } from '../core/EventBus.js';
import { Spawner } from './Spawner.js';

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
    const wave = this.state.wave;
    const cw = this.state.canvasWidth;
    const ch = this.state.canvasHeight;
    const margin = 50;

    // Boss on first spawn of every 5th wave
    let type;
    if (wave % 5 === 0 && this.enemiesSpawned === 0) {
      const bosses = EnemyTypeRegistry.getBossTypes();
      type = bosses.length > 0
        ? bosses[Math.floor(Math.random() * bosses.length)]
        : 'boss';
    } else {
      const pool = EnemyTypeRegistry.getSpawnPool(wave);
      if (pool.length === 0) {
        // Fallback if no types available at this wave
        type = 'basic';
      } else {
        type = pool[Math.floor(Math.random() * pool.length)];
      }
    }

    const config = EnemyTypeRegistry.get(type);
    const groupMin = config ? config.groupMin : 1;
    const groupMax = config ? config.groupMax : 1;

    if (groupMin > 1 || groupMax > 1) {
      const count = groupMin + Math.floor(Math.random() * (groupMax - groupMin + 1));
      for (let k = 0; k < count; k++) {
        const { x, y } = Spawner.getRandomEdgePosition(cw, ch, margin);
        this.state.addEnemy(new Enemy(x + k * 8, y + k * 8, type, wave));
      }
      return;
    }

    const { x, y } = Spawner.getRandomEdgePosition(cw, ch, margin);
    this.state.addEnemy(new Enemy(x, y, type, wave));
  }
}
