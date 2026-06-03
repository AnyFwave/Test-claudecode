export class Projectile {
  constructor(x, y, vx, vy, damage = 10, radius = 3) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.damage = damage;
    this.radius = radius;
    this.alive = true;
  }

  update(dt, canvasW, canvasH, margin = 100) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    if (this.x < -margin || this.x > canvasW + margin ||
        this.y < -margin || this.y > canvasH + margin) {
      this.alive = false;
    }
  }

  draw(ctx) {
    ctx.fillStyle = '#ff4444';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}
