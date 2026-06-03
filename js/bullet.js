class Bullet {
    constructor(x, y, angle, speed, damage, weaponId) {
        this.x = x;
        this.y = y;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.damage = damage || 10;
        this.radius = 3;
        this.alive = true;
        this.trail = [];
        this.weaponId = weaponId || 'pistol';

        // Piercing
        this.pierce = 0; // how many enemies it can pierce through
        this.hitEnemies = new Set();

        // Explosive
        this.isExplosive = false;
        this.explodeRadius = 60;

        // Visual
        this.size = this.radius;
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
            'pistol': '#f1c40f',
            'dual': '#f1c40f',
            'shotgun': '#e67e22',
            'quad': '#2ecc71',
            'sniper': '#e74c3c',
            'spinner': '#9b59b6',
            'bomb': '#e74c3c',
        };
        const color = colorMap[this.weaponId] || '#f1c40f';

        // Trail
        for (let i = 0; i < this.trail.length; i++) {
            const alpha = (i + 1) / this.trail.length * 0.4;
            ctx.globalAlpha = alpha;
            ctx.fillStyle = color;
            const s = this.radius * 0.6;
            ctx.fillRect(this.trail[i].x - s/2, this.trail[i].y - s/2, s, s);
        }
        ctx.globalAlpha = 1;

        // Bullet glow
        ctx.shadowColor = color;
        ctx.shadowBlur = 8;
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Core color
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 0.6, 0, Math.PI * 2);
        ctx.fill();

        // Piercing indicator: small ring
        if (this.pierce > 0) {
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius + 2, 0, Math.PI * 2);
            ctx.stroke();
        }

        // Explosive indicator: small cross
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

class Explosion {
    constructor(x, y, radius, damage) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.maxRadius = radius;
        this.damage = damage;
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

    damageEnemies(enemies, particles) {
        for (const enemy of enemies) {
            if (!enemy.alive || this.hitEnemies.has(enemy)) continue;
            const dx = enemy.x - this.x;
            const dy = enemy.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < this.maxRadius) {
                this.hitEnemies.add(enemy);
                const died = enemy.takeDamage(this.damage);
                if (died) {
                    particles.explosion(enemy.x, enemy.y, enemy.color, false);
                }
            }
        }
    }
}
