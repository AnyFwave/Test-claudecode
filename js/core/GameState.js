export class GameState {
  constructor() {
    this.scene = 'menu';
    this.player = null;
    this.bullets = [];
    this.enemyBullets = [];
    this.enemies = [];
    this.pickups = [];
    this.explosions = [];
    this.particles = null;
    this.camera = null;
    this.wave = 0;
    this.stage = 1;
    this.score = 0;
    this.waveActive = false;
    this.canvasWidth = 0;
    this.canvasHeight = 0;
  }

  addBullet(bullet)     { this.bullets.push(bullet); }
  addEnemyBullet(bullet) { this.enemyBullets.push(bullet); }
  addEnemy(enemy)       { this.enemies.push(enemy); }
  addPickup(pickup)     { this.pickups.push(pickup); }
  addExplosion(explosion) { this.explosions.push(explosion); }

  reset() {
    this.player = null;
    this.bullets = [];
    this.enemyBullets = [];
    this.enemies = [];
    this.pickups = [];
    this.explosions = [];
    this.wave = 0;
    this.stage = 1;
    this.score = 0;
    this.waveActive = false;
  }
}
