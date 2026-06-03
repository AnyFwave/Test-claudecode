export class Explosion {
  constructor(x, y, radius, damageOrInstance) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.maxRadius = radius;
    this.damageInstance = damageOrInstance;
    this.damage = typeof damageOrInstance === 'number'
      ? damageOrInstance
      : (damageOrInstance ? damageOrInstance.getTotalRaw() : 0);
    this.life = 0.3;
    this.maxLife = 0.3;
    this.alive = true;
    this.hitEnemies = new Set();
  }

  update(dt) {
    this.life -= dt;
    this.radius = this.maxRadius * (1 - this.life / this.maxLife * 0.5);
    if (this.life <= 0) this.alive = false;
  }

  draw(ctx) {
    const alpha = this.life / this.maxLife;
    ctx.globalAlpha = alpha * 0.4;
    ctx.fillStyle = '#e74c3c';
    ctx.shadowColor = '#ff4400';
    ctx.shadowBlur = 30;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.globalAlpha = alpha * 0.8;
    ctx.fillStyle = '#ff8800';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius * 0.6, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#ffff00';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius * 0.25, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 1;
  }
}
