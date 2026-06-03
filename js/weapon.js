// === Weapon Definitions ===
const WEAPON_DATA = {
    pistol: {
        id: 'pistol',
        name: '手枪',
        icon: '🔫',
        description: '均衡的单发射击',
        levels: [
            { damage: 10, fireRate: 0.3, bulletSpeed: 500, count: 1, spread: 0, special: null },
            { damage: 12, fireRate: 0.28, bulletSpeed: 520, count: 1, spread: 0, special: null },
            { damage: 15, fireRate: 0.22, bulletSpeed: 550, count: 1, spread: 0, special: null },
            { damage: 18, fireRate: 0.20, bulletSpeed: 580, count: 1, spread: 0, special: null },
            { damage: 22, fireRate: 0.16, bulletSpeed: 620, count: 2, spread: 0.1, special: 'parallel' },
        ]
    },
    dual: {
        id: 'dual',
        name: '双枪',
        icon: '🔫🔫',
        description: '两发平行子弹',
        levels: [
            { damage: 8, fireRate: 0.32, bulletSpeed: 480, count: 2, spread: 0.15, special: 'parallel' },
            { damage: 9, fireRate: 0.30, bulletSpeed: 500, count: 2, spread: 0.2, special: 'parallel' },
            { damage: 10, fireRate: 0.28, bulletSpeed: 520, count: 3, spread: 0.18, special: 'parallel' },
            { damage: 11, fireRate: 0.25, bulletSpeed: 550, count: 4, spread: 0.2, special: 'parallel' },
            { damage: 14, fireRate: 0.22, bulletSpeed: 580, count: 4, spread: 0.15, special: 'parallel' },
        ]
    },
    shotgun: {
        id: 'shotgun',
        name: '散弹枪',
        icon: '💥',
        description: '扇形范围射击',
        levels: [
            { damage: 6, fireRate: 0.5, bulletSpeed: 400, count: 5, spread: 0.4, special: 'spread' },
            { damage: 7, fireRate: 0.45, bulletSpeed: 420, count: 5, spread: 0.3, special: 'spread' },
            { damage: 8, fireRate: 0.4, bulletSpeed: 450, count: 7, spread: 0.35, special: 'spread' },
            { damage: 9, fireRate: 0.35, bulletSpeed: 480, count: 9, spread: 0.35, special: 'spread' },
            { damage: 11, fireRate: 0.3, bulletSpeed: 500, count: 11, spread: 0.3, special: 'spread' },
        ]
    },
    quad: {
        id: 'quad',
        name: '四向枪',
        icon: '✚',
        description: '十字四方向射击',
        levels: [
            { damage: 8, fireRate: 0.4, bulletSpeed: 400, count: 4, spread: 0, special: 'quad' },
            { damage: 9, fireRate: 0.35, bulletSpeed: 420, count: 8, spread: 0, special: 'octo' },
            { damage: 10, fireRate: 0.3, bulletSpeed: 450, count: 8, spread: 0, special: 'octo' },
            { damage: 12, fireRate: 0.25, bulletSpeed: 480, count: 12, spread: 0, special: 'octo' },
            { damage: 14, fireRate: 0.2, bulletSpeed: 500, count: 12, spread: 0, special: 'octo' },
        ]
    },
    laser: {
        id: 'laser',
        name: '激光',
        icon: '⚡',
        description: '持续光束穿透敌人',
        levels: [
            { damage: 15, fireRate: 0.15, bulletSpeed: 0, count: 1, spread: 0, special: 'laser', range: 400 },
            { damage: 20, fireRate: 0.13, bulletSpeed: 0, count: 1, spread: 0, special: 'laser', range: 500 },
            { damage: 30, fireRate: 0.1, bulletSpeed: 0, count: 1, spread: 0, special: 'laser', range: 600 },
            { damage: 40, fireRate: 0.08, bulletSpeed: 0, count: 1, spread: 0, special: 'laser', range: 750 },
            { damage: 55, fireRate: 0.06, bulletSpeed: 0, count: 1, spread: 0, special: 'laser', range: 900 },
        ]
    },
    sniper: {
        id: 'sniper',
        name: '狙击枪',
        icon: '🎯',
        description: '高伤害穿透射击',
        levels: [
            { damage: 35, fireRate: 0.8, bulletSpeed: 800, count: 1, spread: 0, special: 'pierce', pierce: 1 },
            { damage: 45, fireRate: 0.75, bulletSpeed: 850, count: 1, spread: 0, special: 'pierce', pierce: 2 },
            { damage: 60, fireRate: 0.7, bulletSpeed: 900, count: 1, spread: 0, special: 'pierce', pierce: 3 },
            { damage: 80, fireRate: 0.6, bulletSpeed: 950, count: 1, spread: 0, special: 'pierce', pierce: 6 },
            { damage: 100, fireRate: 0.5, bulletSpeed: 1100, count: 1, spread: 0, special: 'pierce', pierce: 99 },
        ]
    },
    spinner: {
        id: 'spinner',
        name: '旋转枪',
        icon: '🌀',
        description: '子弹环绕自动攻击',
        levels: [
            { damage: 6, fireRate: 0.2, bulletSpeed: 0, count: 3, spread: 0, special: 'spinner', radius: 80 },
            { damage: 7, fireRate: 0.18, bulletSpeed: 0, count: 3, spread: 0, special: 'spinner', radius: 90 },
            { damage: 8, fireRate: 0.15, bulletSpeed: 0, count: 6, spread: 0, special: 'spinner', radius: 100 },
            { damage: 9, fireRate: 0.13, bulletSpeed: 0, count: 8, spread: 0, special: 'spinner', radius: 115 },
            { damage: 11, fireRate: 0.1, bulletSpeed: 0, count: 10, spread: 0, special: 'spinner', radius: 130 },
        ]
    },
    bomb: {
        id: 'bomb',
        name: '爆破枪',
        icon: '💣',
        description: '子弹命中后范围爆炸',
        levels: [
            { damage: 12, fireRate: 0.45, bulletSpeed: 350, count: 1, spread: 0, special: 'explosive', explodeRadius: 60 },
            { damage: 15, fireRate: 0.4, bulletSpeed: 370, count: 1, spread: 0, special: 'explosive', explodeRadius: 75 },
            { damage: 18, fireRate: 0.35, bulletSpeed: 400, count: 1, spread: 0, special: 'explosive', explodeRadius: 90 },
            { damage: 22, fireRate: 0.3, bulletSpeed: 430, count: 1, spread: 0, special: 'explosive', explodeRadius: 110 },
            { damage: 28, fireRate: 0.25, bulletSpeed: 480, count: 1, spread: 0, special: 'explosive', explodeRadius: 140 },
        ]
    },
};

class Weapon {
    constructor(id) {
        const data = WEAPON_DATA[id];
        if (!data) throw new Error(`Unknown weapon: ${id}`);
        this.id = id;
        this.name = data.name;
        this.icon = data.icon;
        this.description = data.description;
        this.levels = data.levels;
        this.level = 1;
        this.maxLevel = data.levels.length;
        this.angle = 0; // for spinner
        this.laserTimer = 0;
    }

    get stats() {
        return this.levels[this.level - 1];
    }

    get damage() { return this.stats.damage; }
    get fireRate() { return this.stats.fireRate; }
    get bulletSpeed() { return this.stats.bulletSpeed; }
    get special() { return this.stats.special; }

    upgrade() {
        if (this.level < this.maxLevel) {
            this.level++;
            return true;
        }
        return false;
    }

    fire(player, bullets, enemies, mouseAngle, particles) {
        const s = this.stats;
        const gunLen = player.size + 6;
        const bx = player.x + Math.cos(mouseAngle) * gunLen;
        const by = player.y + Math.sin(mouseAngle) * gunLen;

        switch (s.special) {
            case 'parallel':
                this.fireParallel(player, bullets, bx, by, mouseAngle, s, gunLen);
                break;
            case 'spread':
                this.fireSpread(player, bullets, bx, by, mouseAngle, s);
                break;
            case 'quad':
                this.fireQuad(player, bullets, s, false);
                break;
            case 'octo':
                this.fireQuad(player, bullets, s, true);
                break;
            case 'laser':
                return this.fireLaser(player, bullets, enemies, mouseAngle, s, particles);
            case 'pierce':
                this.firePierce(player, bullets, bx, by, mouseAngle, s);
                break;
            case 'spinner':
                // Spinner handled in update()
                break;
            case 'explosive':
                this.fireExplosive(player, bullets, bx, by, mouseAngle, s);
                break;
            default: // pistol - single shot
                bullets.push(new Bullet(bx, by, mouseAngle, s.bulletSpeed, s.damage, this.id));
                break;
        }
    }

    fireParallel(player, bullets, bx, by, angle, s, gunLen) {
        const count = s.count;
        const spreadDist = 4 + this.level * 1.5;
        const perpAngle = angle + Math.PI / 2;
        const start = -(count - 1) / 2;
        for (let i = 0; i < count; i++) {
            const offset = start + i;
            const px = bx + Math.cos(perpAngle) * offset * spreadDist;
            const py = by + Math.sin(perpAngle) * offset * spreadDist;
            const spreadAngle = angle + (Math.random() - 0.5) * (s.spread || 0);
            bullets.push(new Bullet(px, py, spreadAngle, s.bulletSpeed * (0.95 + Math.random() * 0.1), s.damage, this.id));
        }
    }

    fireSpread(player, bullets, bx, by, angle, s) {
        for (let i = 0; i < s.count; i++) {
            const spreadAngle = angle + (i / (s.count - 1) - 0.5) * (s.spread || 0.4);
            const spd = s.bulletSpeed * (0.9 + Math.random() * 0.2);
            bullets.push(new Bullet(bx, by, spreadAngle, spd, s.damage, this.id));
        }
    }

    fireQuad(player, bullets, s, octo) {
        const baseAngles = [0, Math.PI / 2, Math.PI, -Math.PI / 2];
        const octoAngles = [Math.PI / 4, 3 * Math.PI / 4, -3 * Math.PI / 4, -Math.PI / 4];
        const allAngles = octo ? [...baseAngles, ...octoAngles] : baseAngles;
        const gunLen = player.size + 6;
        for (const a of allAngles) {
            const bx2 = player.x + Math.cos(a) * gunLen;
            const by2 = player.y + Math.sin(a) * gunLen;
            bullets.push(new Bullet(bx2, by2, a, s.bulletSpeed * 0.8, s.damage, this.id));
        }
    }

    fireLaser(player, bullets, enemies, angle, s, particles) {
        this.laserTimer = 0.1; // trigger laser render
        this.laserAngle = angle;
        this.laserOrigin = { x: player.x, y: player.y };

        const gunLen = player.size + 6;
        const ox = player.x + Math.cos(angle) * gunLen;
        const oy = player.y + Math.sin(angle) * gunLen;
        const range = s.range || 400;

        // Raycast: find first enemy hit
        let closestDist = range;
        let hitEnemy = null;

        for (const enemy of enemies) {
            if (!enemy.alive) continue;
            // Point-line distance from enemy to laser ray
            const dx = enemy.x - ox;
            const dy = enemy.y - oy;
            const t = dx * Math.cos(angle) + dy * Math.sin(angle);
            if (t < 0) continue;

            const projX = ox + t * Math.cos(angle);
            const projY = oy + t * Math.sin(angle);
            const dist = Math.sqrt((enemy.x - projX) ** 2 + (enemy.y - projY) ** 2);

            if (dist < enemy.size + 5 && t < closestDist) {
                closestDist = t;
                hitEnemy = enemy;
            }
        }

        // Damage all enemies along the beam
        const deadEnemies = [];
        for (const enemy of enemies) {
            if (!enemy.alive) continue;
            const dx = enemy.x - ox;
            const dy = enemy.y - oy;
            const t = dx * Math.cos(angle) + dy * Math.sin(angle);
            if (t < 0 || t > range) continue;
            const projX = ox + t * Math.cos(angle);
            const projY = oy + t * Math.sin(angle);
            const dist = Math.sqrt((enemy.x - projX) ** 2 + (enemy.y - projY) ** 2);
            if (dist < enemy.size + 5) {
                const died = enemy.takeDamage(s.damage);
                if (died) {
                    deadEnemies.push(enemy);
                    particles.explosion(enemy.x, enemy.y, enemy.color, false);
                } else {
                    particles.spark(enemy.x, enemy.y);
                }
            }
        }

        // Laser endpoint
        this.laserEndX = ox + Math.cos(angle) * (closestDist < range ? closestDist : range);
        this.laserEndY = oy + Math.sin(angle) * (closestDist < range ? closestDist : range);
        return deadEnemies;
    }

    firePierce(player, bullets, bx, by, angle, s) {
        const bullet = new Bullet(bx, by, angle, s.bulletSpeed, s.damage, this.id);
        bullet.pierce = s.pierce || 1;
        bullet.size = 4;
        bullets.push(bullet);
    }

    fireExplosive(player, bullets, bx, by, angle, s) {
        const bullet = new Bullet(bx, by, angle, s.bulletSpeed, s.damage, this.id);
        bullet.explodeRadius = s.explodeRadius || 60;
        bullet.isExplosive = true;
        bullets.push(bullet);
    }

    updateSpinner(player, bullets, dt, enemies) {
        const s = this.stats;
        if (s.special !== 'spinner') return;

        this.angle += dt * 2.5;

        // Auto-target nearby enemies
        let target = null;
        let minDist = s.radius;
        for (const enemy of enemies) {
            if (!enemy.alive) continue;
            const dx = enemy.x - player.x;
            const dy = enemy.y - player.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < minDist) {
                minDist = dist;
                target = enemy;
            }
        }

        const count = s.count;
        for (let i = 0; i < count; i++) {
            const a = this.angle + (Math.PI * 2 / count) * i;
            const orbitX = player.x + Math.cos(a) * s.radius;
            const orbitY = player.y + Math.sin(a) * s.radius;

            // Fire at target if in range
            if (target && Math.random() < 0.05) {
                const ta = Math.atan2(target.y - orbitY, target.x - orbitX);
                bullets.push(new Bullet(orbitX, orbitY, ta, 300, s.damage, this.id));
            }
        }
    }

    drawLaser(ctx) {
        if (this.laserTimer <= 0) return;
        const ox = this.laserOrigin.x;
        const oy = this.laserOrigin.y;
        const ex = this.laserEndX;
        const ey = this.laserEndY;

        // Outer glow
        ctx.strokeStyle = 'rgba(255, 50, 50, 0.3)';
        ctx.lineWidth = 12;
        ctx.shadowColor = '#ff0000';
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.moveTo(ox, oy);
        ctx.lineTo(ex, ey);
        ctx.stroke();

        // Main beam
        ctx.strokeStyle = '#ff4444';
        ctx.lineWidth = 4;
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.moveTo(ox, oy);
        ctx.lineTo(ex, ey);
        ctx.stroke();

        // Core
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(ox, oy);
        ctx.lineTo(ex, ey);
        ctx.stroke();

        ctx.shadowBlur = 0;
        ctx.lineWidth = 1;

        this.laserTimer -= 0.02;
    }
}
