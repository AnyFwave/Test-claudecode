class Particle {
  constructor(x, y, color, vx, vy, size, life) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.vx = vx;
    this.vy = vy;
    this.size = size;
    this.life = life;
    this.maxLife = life;
    this.alive = true;
  }

  update() {
    this.x += this.vx * 0.016;
    this.y += this.vy * 0.016;
    this.vx *= 0.95;
    this.vy *= 0.95;
    this.life -= 0.016;
    if (this.life <= 0) this.alive = false;
  }

  draw(ctx) {
    const alpha = this.life / this.maxLife;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
    ctx.globalAlpha = 1;
  }
}

export class ParticleSystem {
  constructor() {
    this.particles = [];
  }

  emit(x, y, color, count = 5, speed = 100, size = 3, life = 0.5) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = speed * (0.5 + Math.random());
      this.particles.push(new Particle(
        x, y, color,
        Math.cos(angle) * spd,
        Math.sin(angle) * spd,
        size * (0.5 + Math.random()),
        life * (0.5 + Math.random())
      ));
    }
  }

  explosion(x, y, color, big = false) {
    const count = big ? 30 : 12;
    const speed = big ? 200 : 120;
    const size = big ? 5 : 3;
    const life = big ? 0.8 : 0.4;
    this.emit(x, y, color, count, speed, size, life);

    // Secondary particles
    this.emit(x, y, '#ffffff', Math.floor(count / 2), speed * 0.6, size * 0.6, life * 0.5);
  }

  spark(x, y) {
    this.emit(x, y, '#f1c40f', 3, 80, 2, 0.2);
  }

  update() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      this.particles[i].update();
      if (!this.particles[i].alive) this.particles.splice(i, 1);
    }
  }

  draw(ctx) {
    for (const p of this.particles) p.draw(ctx);
  }

  clear() {
    this.particles = [];
  }
}
