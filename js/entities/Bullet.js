import { DamageInstance } from '../sys/damage/DamageInstance.js';
import { PHYSICAL } from '../sys/damage/damageTypes.js';

export class Bullet {
  constructor(x, y, angle, speed, damageInstance, weaponId) {
    this.x = x;
    this.y = y;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.damageInstance = damageInstance || new DamageInstance({
      baseValue: 10,
      typeContributions: [{ type: PHYSICAL, proportion: 1.0 }]
    });
    this.radius = 3;
    this.alive = true;
    this.trail = [];
    this.weaponId = weaponId || 'pistol';

    this.pierce = 0;
    this.hitEnemies = new Set();

    this.isExplosive = false;
    this.explodeRadius = 60;

    this.size = this.radius;
  }

  get damage() {
    return this.damageInstance ? this.damageInstance.getTotalRaw() : 10;
  }

  update(dt, canvasW, canvasH, margin) {
    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > 5) this.trail.shift();

    this.x += this.vx * dt;
    this.y += this.vy * dt;

    const m = margin || 100;
    if (this.x < -m || this.x > canvasW + m ||
        this.y < -m || this.y > canvasH + m) {
      this.alive = false;
    }
  }

  draw(ctx) {
    const colorMap = {
      'pistol': '#f1c40f', 'dual': '#f1c40f',
      'shotgun': '#e67e22', 'quad': '#2ecc71',
      'sniper': '#e74c3c', 'spinner': '#9b59b6',
      'bomb': '#e74c3c', 'laser': '#ff4444',
    };
    const color = colorMap[this.weaponId] || '#f1c40f';

    for (let i = 0; i < this.trail.length; i++) {
      const alpha = (i + 1) / this.trail.length * 0.4;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      const s = this.radius * 0.6;
      ctx.fillRect(this.trail[i].x - s / 2, this.trail[i].y - s / 2, s, s);
    }
    ctx.globalAlpha = 1;

    ctx.shadowColor = color;
    ctx.shadowBlur = 8;
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius * 0.6, 0, Math.PI * 2);
    ctx.fill();

    if (this.pierce > 0) {
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius + 2, 0, Math.PI * 2);
      ctx.stroke();
    }

    if (this.isExplosive) {
      ctx.strokeStyle = '#e74c3c';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(this.x - 4, this.y);
      ctx.lineTo(this.x + 4, this.y);
      ctx.moveTo(this.x, this.y - 4);
      ctx.lineTo(this.x, this.y + 4);
      ctx.stroke();
    }
  }
}
