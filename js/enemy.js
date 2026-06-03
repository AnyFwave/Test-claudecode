class Enemy {
    constructor(x, y, type, wave) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.alive = true;
        this.hitFlash = 0;
        this.animFrame = 0;
        this.animTimer = 0;

        const scale = 1 + wave * 0.02;
        switch (type) {
            case 'basic':
                this.maxHp = Math.floor(30 * scale);
                this.speed = 80 + wave * 1.5;
                this.size = 10;
                this.xp = 10;
                this.color = '#e74c3c';
                this.damage = 10;
                this.behavior = 'chase';
                break;
            case 'fast':
                this.maxHp = Math.floor(20 * scale);
                this.speed = 150 + wave * 2;
                this.size = 8;
                this.xp = 15;
                this.color = '#2ecc71';
                this.damage = 8;
                this.behavior = 'zigzag';
                this.zigTimer = 0;
                this.zigAngle = 0;
                break;
            case 'tank':
                this.maxHp = Math.floor(80 * scale);
                this.speed = 50 + wave;
                this.size = 14;
                this.xp = 25;
                this.color = '#3498db';
                this.damage = 15;
                this.behavior = 'chase';
                break;
            case 'boss':
                this.maxHp = Math.floor(300 * scale);
                this.speed = 60 + wave;
                this.size = 22;
                this.xp = 100;
                this.color = '#9b59b6';
                this.damage = 25;
                this.behavior = 'boss';
                this.bossPhase = 0;
                this.bossTimer = 0;
                break;
            case 'sniper':
                this.maxHp = Math.floor(25 * scale);
                this.speed = 40 + wave;
                this.size = 10;
                this.xp = 20;
                this.color = '#e67e22';
                this.damage = 15;
                this.behavior = 'sniper';
                this.shootCooldown = 2.0;
                this.shootTimer = 1.5 + Math.random();
                this.preferredDist = 250;
                break;
            case 'swarm':
                this.maxHp = Math.floor(8 * scale);
                this.speed = 130 + wave * 3;
                this.size = 5;
                this.xp = 5;
                this.color = '#f1c40f';
                this.damage = 5;
                this.behavior = 'chase';
                break;
            case 'shield':
                this.maxHp = Math.floor(40 * scale);
                this.speed = 55 + wave;
                this.size = 13;
                this.xp = 20;
                this.color = '#1abc9c';
                this.damage = 10;
                this.behavior = 'chase';
                this.shieldHp = Math.floor(30 * scale);
                this.maxShieldHp = this.shieldHp;
                this.shieldRechargeDelay = 3.0;
                this.shieldRechargeTimer = 0;
                this.shieldActive = true;
                break;
            case 'splitter':
                this.maxHp = Math.floor(35 * scale);
                this.speed = 70 + wave;
                this.size = 11;
                this.xp = 18;
                this.color = '#e91e63';
                this.damage = 10;
                this.behavior = 'chase';
                this.hasSplit = false;
                break;
        }

        this.hp = this.maxHp;
        this.baseSpeed = this.speed;
        this.invincibleTimer = 0;
        this.shootAngle = 0;
    }

    update(dt, playerX, playerY) {
        this.animTimer += dt;
        if (this.animTimer > 0.2) {
            this.animTimer = 0;
            this.animFrame = (this.animFrame + 1) % 4;
        }

        if (this.hitFlash > 0) this.hitFlash -= dt;
        if (this.invincibleTimer > 0) this.invincibleTimer -= dt;

        const dx = playerX - this.x;
        const dy = playerY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const dirX = dist > 0 ? dx / dist : 0;
        const dirY = dist > 0 ? dy / dist : 0;

        // Behavior-specific movement and AI
        switch (this.behavior) {
            case 'chase':
                this.x += dirX * this.speed * dt;
                this.y += dirY * this.speed * dt;
                break;

            case 'zigzag':
                this.zigTimer += dt;
                this.zigAngle = Math.sin(this.zigTimer * 8) * 0.8;
                const zx = Math.cos(this.zigAngle) * dirX - Math.sin(this.zigAngle) * dirY;
                const zy = Math.sin(this.zigAngle) * dirX + Math.cos(this.zigAngle) * dirY;
                this.x += zx * this.speed * dt;
                this.y += zy * this.speed * dt;
                break;

            case 'sniper':
                // Keep distance and strafe
                if (dist < this.preferredDist - 30) {
                    this.x -= dirX * this.speed * dt;
                    this.y -= dirY * this.speed * dt;
                } else if (dist > this.preferredDist + 30) {
                    this.x += dirX * this.speed * dt;
                    this.y += dirY * this.speed * dt;
                } else {
                    // Strafe perpendicular
                    const pDirX = -dirY;
                    const pDirY = dirX;
                    this.x += pDirX * this.speed * 0.5 * dt;
                    this.y += pDirY * this.speed * 0.5 * dt;
                }

                // Shoot at player
                this.shootTimer -= dt;
                break;

            case 'boss':
                this.bossTimer += dt;
                // Move toward player but with phases
                if (this.bossTimer > 3) {
                    this.bossPhase = (this.bossPhase + 1) % 3;
                    this.bossTimer = 0;
                }
                const bossSpeed = this.speed * (this.bossPhase === 0 ? 1.5 : this.bossPhase === 1 ? 0.5 : 1);
                this.x += dirX * bossSpeed * dt;
                this.y += dirY * bossSpeed * dt;
                break;

            default:
                this.x += dirX * this.speed * dt;
                this.y += dirY * this.speed * dt;
        }

        // Shield recharge
        if (this.type === 'shield' && !this.shieldActive) {
            this.shieldRechargeTimer -= dt;
            if (this.shieldRechargeTimer <= 0) {
                this.shieldActive = true;
                this.shieldHp = this.maxShieldHp;
            }
        }
    }

    takeDamage(dmg) {
        if (this.invincibleTimer > 0) return false;

        // Shield absorbs damage first
        if (this.type === 'shield' && this.shieldActive) {
            this.shieldHp -= dmg;
            this.hitFlash = 0.1;
            if (this.shieldHp <= 0) {
                this.shieldActive = false;
                this.shieldRechargeTimer = this.shieldRechargeDelay;
            }
            return false;
        }

        this.hp -= dmg;
        this.hitFlash = 0.1;
        if (this.hp <= 0) {
            this.alive = false;
            return true;
        }
        this.invincibleTimer = 0.05;
        return false;
    }

    draw(ctx) {
        ctx.save();

        const s = this.size;
        const flash = this.hitFlash > 0;

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(this.x, this.y + s * 0.8, s * 0.8, s * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();

        const color = flash ? '#fff' : this.color;
        ctx.lineWidth = 1.5;

        switch (this.type) {
            case 'basic':
                this.drawBasic(ctx, s, color, flash);
                break;
            case 'fast':
                this.drawFast(ctx, s, color, flash);
                break;
            case 'tank':
                this.drawTank(ctx, s, color, flash);
                break;
            case 'boss':
                this.drawBoss(ctx, s, color, flash);
                break;
            case 'sniper':
                this.drawSniper(ctx, s, color, flash);
                break;
            case 'swarm':
                this.drawSwarm(ctx, s, color, flash);
                break;
            case 'shield':
                this.drawShield(ctx, s, color, flash);
                break;
            case 'splitter':
                this.drawSplitter(ctx, s, color, flash);
                break;
        }

        // Eyes (not for swarm)
        if (this.type !== 'swarm') {
            this.drawEyes(ctx, s);
        }

        // HP bar
        if (this.hp < this.maxHp && this.type !== 'swarm') {
            const barW = s * 2.5;
            const barH = 3;
            const bx = this.x - barW / 2;
            const by = this.y - s - 6;
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.fillRect(bx, by, barW, barH);
            ctx.fillStyle = this.hp / this.maxHp > 0.5 ? '#2ecc71' :
                           this.hp / this.maxHp > 0.25 ? '#f39c12' : '#e74c3c';
            ctx.fillRect(bx, by, barW * (this.hp / this.maxHp), barH);
        }

        ctx.restore();
    }

    // === DRAW METHODS ===

    drawBasic(ctx, s, color, flash) {
        ctx.fillStyle = color;
        ctx.strokeStyle = flash ? '#fff' : 'rgba(0,0,0,0.4)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, s, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    }

    drawFast(ctx, s, color, flash) {
        ctx.fillStyle = color;
        ctx.strokeStyle = flash ? '#fff' : 'rgba(0,0,0,0.4)';
        ctx.beginPath();
        const bobY = Math.sin(this.animFrame * Math.PI / 2) * 1.5;
        ctx.moveTo(this.x, this.y - s * 1.2 + bobY);
        ctx.lineTo(this.x + s * 1.1, this.y + bobY);
        ctx.lineTo(this.x, this.y + s * 1.2 + bobY);
        ctx.lineTo(this.x - s * 1.1, this.y + bobY);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Speed trail effect
        ctx.fillStyle = flash ? '#fff' : `${this.color}44`;
        for (let i = 1; i <= 3; i++) {
            const alpha = 0.3 - i * 0.08;
            ctx.globalAlpha = alpha;
            const trailS = s * (1 - i * 0.15);
            ctx.fillRect(this.x - s * 1.2 - i * 4, this.y - trailS/2, trailS * 2.2, trailS);
        }
        ctx.globalAlpha = 1;
    }

    drawTank(ctx, s, color, flash) {
        ctx.fillStyle = color;
        ctx.strokeStyle = flash ? '#fff' : 'rgba(0,0,0,0.4)';
        ctx.fillRect(this.x - s, this.y - s, s * 2, s * 2);
        ctx.strokeRect(this.x - s, this.y - s, s * 2, s * 2);

        // Armor lines
        ctx.strokeStyle = flash ? '#fff' : 'rgba(0,0,0,0.2)';
        ctx.strokeRect(this.x - s * 0.6, this.y - s * 0.6, s * 1.2, s * 1.2);

        // Corner bolts
        ctx.fillStyle = flash ? '#fff' : '#2c3e50';
        const boltSize = 2;
        const boltPositions = [
            [-s * 0.8, -s * 0.8], [s * 0.8, -s * 0.8],
            [-s * 0.8, s * 0.8], [s * 0.8, s * 0.8]
        ];
        for (const [bx, by] of boltPositions) {
            ctx.fillRect(this.x + bx - boltSize/2, this.y + by - boltSize/2, boltSize, boltSize);
        }
    }

    drawBoss(ctx, s, color, flash) {
        // Hexagon body
        ctx.fillStyle = color;
        ctx.strokeStyle = flash ? '#fff' : 'rgba(0,0,0,0.4)';
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i - Math.PI / 6;
            const bx = this.x + Math.cos(angle) * s;
            const by = this.y + Math.sin(angle) * s;
            i === 0 ? ctx.moveTo(bx, by) : ctx.lineTo(bx, by);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Crown
        ctx.fillStyle = '#f1c40f';
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i + Math.PI / 6;
            const px = this.x + Math.cos(angle) * s * 0.5;
            const py = this.y + Math.sin(angle) * s * 0.5;
            ctx.fillRect(px - 2, py - 2, 4, 4);
        }

        // Crown spikes on top
        ctx.fillStyle = '#f1c40f';
        ctx.beginPath();
        ctx.moveTo(this.x - s * 0.5, this.y - s * 0.8);
        ctx.lineTo(this.x, this.y - s * 1.4);
        ctx.lineTo(this.x + s * 0.5, this.y - s * 0.8);
        ctx.fill();

        // Glow
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 20;
        ctx.stroke();
        ctx.shadowBlur = 0;
    }

    drawSniper(ctx, s, color, flash) {
        ctx.fillStyle = color;
        ctx.strokeStyle = flash ? '#fff' : 'rgba(0,0,0,0.4)';

        // Diamond shape
        ctx.beginPath();
        ctx.moveTo(this.x, this.y - s * 1.2);
        ctx.lineTo(this.x + s * 1.2, this.y);
        ctx.lineTo(this.x, this.y + s * 1.2);
        ctx.lineTo(this.x - s * 1.2, this.y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Crosshair reticle
        ctx.strokeStyle = flash ? '#fff' : 'rgba(255,255,255,0.4)';
        ctx.lineWidth = 1;
        const ch = s * 0.6;
        ctx.beginPath();
        ctx.moveTo(this.x - ch, this.y);
        ctx.lineTo(this.x + ch, this.y);
        ctx.moveTo(this.x, this.y - ch);
        ctx.lineTo(this.x, this.y + ch);
        ctx.stroke();
        ctx.lineWidth = 1.5;

        // Scope circle
        ctx.strokeStyle = flash ? '#fff' : 'rgba(255,255,255,0.3)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, s * 0.4, 0, Math.PI * 2);
        ctx.stroke();
    }

    drawSwarm(ctx, s, color, flash) {
        ctx.fillStyle = color;
        ctx.strokeStyle = flash ? '#fff' : 'rgba(0,0,0,0.3)';

        // Small pulsing circle
        const pulse = 1 + Math.sin(this.animFrame * Math.PI / 2) * 0.2;
        ctx.beginPath();
        ctx.arc(this.x, this.y, s * pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Glowing
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 5;
        ctx.fill();
        ctx.shadowBlur = 0;
    }

    drawShield(ctx, s, color, flash) {
        ctx.fillStyle = color;
        ctx.strokeStyle = flash ? '#fff' : 'rgba(0,0,0,0.4)';

        // Pentagon-ish shape
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (Math.PI * 2 / 5) * i - Math.PI / 2;
            const px = this.x + Math.cos(angle) * s;
            const py = this.y + Math.sin(angle) * s;
            i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Shield bubble
        if (this.shieldActive) {
            const shieldPct = this.shieldHp / this.maxShieldHp;
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.3 + shieldPct * 0.4})`;
            ctx.lineWidth = 3;
            ctx.shadowColor = '#1abc9c';
            ctx.shadowBlur = 12;
            ctx.beginPath();
            ctx.arc(this.x, this.y, s + 4, 0, Math.PI * 2);
            ctx.stroke();
            ctx.shadowBlur = 0;
            ctx.lineWidth = 1.5;
        }
    }

    drawSplitter(ctx, s, color, flash) {
        ctx.fillStyle = color;
        ctx.strokeStyle = flash ? '#fff' : 'rgba(0,0,0,0.4)';

        // Pentagon
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (Math.PI * 2 / 5) * i - Math.PI / 2;
            const px = this.x + Math.cos(angle) * s;
            const py = this.y + Math.sin(angle) * s;
            i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Inner split line
        ctx.strokeStyle = flash ? '#fff' : 'rgba(255,255,255,0.2)';
        ctx.beginPath();
        ctx.moveTo(this.x, this.y - s * 0.5);
        ctx.lineTo(this.x, this.y + s * 0.5);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(this.x - s * 0.5, this.y);
        ctx.lineTo(this.x + s * 0.5, this.y);
        ctx.stroke();
    }

    drawEyes(ctx, s) {
        if (this.type === 'boss') {
            // Boss: big angry eyes
            const be = s * 0.5;
            ctx.fillStyle = '#fff';
            ctx.fillRect(this.x - be - 2, this.y - s * 0.2, be, be * 1.2);
            ctx.fillRect(this.x + 2, this.y - s * 0.2, be, be * 1.2);
            ctx.fillStyle = '#e74c3c';
            ctx.fillRect(this.x - be, this.y - s * 0.1, be * 0.6, be * 0.8);
            ctx.fillRect(this.x + 4, this.y - s * 0.1, be * 0.6, be * 0.8);
            return;
        }

        if (this.type === 'sniper') {
            // Sniper: one big eye (scope)
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(this.x, this.y - s * 0.1, s * 0.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#e74c3c';
            ctx.beginPath();
            ctx.arc(this.x, this.y - s * 0.1, s * 0.25, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#111';
            ctx.beginPath();
            ctx.arc(this.x + 1, this.y - s * 0.1, s * 0.15, 0, Math.PI * 2);
            ctx.fill();
            return;
        }

        // Normal eyes
        ctx.fillStyle = '#fff';
        const eyeS = s * 0.35;
        const eyeY = this.y - s * 0.15;
        const eyeOffset = s * 0.45;
        ctx.beginPath();
        ctx.arc(this.x - eyeOffset, eyeY, eyeS, 0, Math.PI * 2);
        ctx.arc(this.x + eyeOffset, eyeY, eyeS, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#111';
        ctx.beginPath();
        ctx.arc(this.x - eyeOffset + 1, eyeY + 0.5, eyeS * 0.5, 0, Math.PI * 2);
        ctx.arc(this.x + eyeOffset + 1, eyeY + 0.5, eyeS * 0.5, 0, Math.PI * 2);
        ctx.fill();
    }
}
