class Particle {
    constructor(x, y, color, vx, vy, size, life) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.vx = vx;
        this.vy = vy;
        this.size = size || 3;
        this.life = life || 30;
        this.maxLife = this.life;
        this.alive = true;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= 0.96;
        this.vy *= 0.96;
        this.life--;
        if (this.life <= 0) this.alive = false;
    }

    draw(ctx) {
        const alpha = this.life / this.maxLife;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        const s = Math.max(1, this.size * alpha);
        ctx.fillRect(this.x - s/2, this.y - s/2, s, s);
        ctx.globalAlpha = 1;
    }
}

class ParticleSystem {
    constructor() {
        this.particles = [];
    }

    emit(x, y, color, count = 8, speed = 3, size = 3, life = 30) {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i + (Math.random() - 0.5) * 0.5;
            const spd = speed * (0.5 + Math.random());
            this.particles.push(new Particle(
                x, y, color,
                Math.cos(angle) * spd,
                Math.sin(angle) * spd,
                size * (0.5 + Math.random()),
                life * (0.5 + Math.random() * 0.5)
            ));
        }
    }

    explosion(x, y, color, big = false) {
        const count = big ? 20 : 10;
        this.emit(x, y, color, count, big ? 5 : 3, big ? 5 : 3, big ? 40 : 25);
        this.emit(x, y, '#fff', count / 2, big ? 3 : 2, 2, big ? 20 : 15);
    }

    spark(x, y) {
        this.emit(x, y, '#f1c40f', 3, 2, 2, 12);
        this.emit(x, y, '#fff', 2, 1.5, 1.5, 8);
    }

    update() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update();
            if (!this.particles[i].alive) {
                this.particles.splice(i, 1);
            }
        }
    }

    draw(ctx) {
        for (const p of this.particles) {
            p.draw(ctx);
        }
    }

    clear() {
        this.particles = [];
    }
}
