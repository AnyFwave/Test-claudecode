import { EnemyTypeRegistry } from './enemyTypes/EnemyTypeRegistry.js';
import { StatBlockFactory } from '../sys/stats/StatBlockFactory.js';
import { STATS } from '../sys/stats/statDefinitions.js';

export class Enemy {
  constructor(x, y, type, wave) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.alive = true;
    this.hitFlash = 0;
    this.animFrame = 0;
    this.animTimer = 0;
    this.invincibleTimer = 0;
    this.shootAngle = 0;
    this._wave = wave;

    const config = EnemyTypeRegistry.get(type);

    this.stats = StatBlockFactory.enemyByType(type, wave);

    this._size = config ? config.size : 10;
    this._color = config ? config.color : '#e74c3c';
    this._behavior = config ? config.behavior : 'chase';

    // Type-specific init
    if (config && config.initFn) {
      config.initFn(this);
    }

    // Speed
    this.speed = this.stats.get(STATS.SPEED);
    this.baseSpeed = this.speed;
  }

  get size() { return this._size; }
  get color() { return this._color; }
  get maxHp() { return this.stats.get(STATS.MAX_HP); }
  get hp() { return this.stats.get(STATS.HP); }
  get xp() { return this.stats.get(STATS.XP_VALUE); }
  get damage() { return this.stats.get(STATS.COLLISION_DAMAGE); }

  update(dt, playerX, playerY) {
    this.animTimer += dt;
    if (this.animTimer > 0.2) {
      this.animTimer = 0;
      this.animFrame = (this.animFrame + 1) % 4;
    }

    if (this.hitFlash > 0) this.hitFlash -= dt;
    if (this.invincibleTimer > 0) this.invincibleTimer -= dt;

    // Slow recovery (from ice effects)
    if (this._slowTimer > 0) {
      this._slowTimer -= dt;
      if (this._slowTimer <= 0) {
        this.speed = this.baseSpeed;
      }
    }

    const dx = playerX - this.x;
    const dy = playerY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const dirX = dist > 0 ? dx / dist : 0;
    const dirY = dist > 0 ? dy / dist : 0;

    switch (this._behavior) {
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
        if (dist < this.preferredDist - 30) {
          this.x -= dirX * this.speed * dt;
          this.y -= dirY * this.speed * dt;
        } else if (dist > this.preferredDist + 30) {
          this.x += dirX * this.speed * dt;
          this.y += dirY * this.speed * dt;
        } else {
          const pDirX = -dirY;
          const pDirY = dirX;
          this.x += pDirX * this.speed * 0.5 * dt;
          this.y += pDirY * this.speed * 0.5 * dt;
        }
        this.shootTimer -= dt;
        break;

      case 'boss':
        this.bossTimer += dt;
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

    // Type-specific update
    const config = EnemyTypeRegistry.get(this.type);
    if (config && config.updateFn) {
      config.updateFn(this, dt);
    }
  }

  takeDamage(dmg) {
    if (this.invincibleTimer > 0) return false;

    // Type-specific damage handling
    const config = EnemyTypeRegistry.get(this.type);
    if (config && config.damageFn) {
      const result = config.damageFn(this, dmg);
      if (result !== null) return result;
    }

    // Default: subtract from HP via StatBlock
    const currentHp = this.stats.get(STATS.HP);
    const newHp = Math.max(0, currentHp - dmg);
    this.stats.setBase(STATS.HP, newHp);
    this.hitFlash = 0.1;

    if (newHp <= 0) {
      this.alive = false;
      this.stats.setBase(STATS.HP, 0);
      return true;
    }

    this.invincibleTimer = 0.05;
    return false;
  }

  _getDrawConfig() {
    return EnemyTypeRegistry.get(this.type);
  }

  draw(ctx) {
    ctx.save();

    const s = this._size;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(this.x, this.y + s * 0.8, s * 0.8, s * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();

    const config = this._getDrawConfig();
    if (config && config.drawFn) {
      config.drawFn(this, ctx);
    } else {
      // Fallback draw
      ctx.fillStyle = this.hitFlash > 0 ? '#fff' : this._color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, s, 0, Math.PI * 2);
      ctx.fill();
      this._drawEyes(ctx, s);
      this._drawHpBar(ctx, s);
    }

    ctx.restore();
  }

  _drawEyes(ctx, s) {
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

  _drawHpBar(ctx, s) {
    const maxHp = this.stats.get(STATS.MAX_HP);
    const hp = this.stats.get(STATS.HP);
    if (hp >= maxHp) return;

    const barW = s * 2.5;
    const barH = 3;
    const bx = this.x - barW / 2;
    const by = this.y - s - 6;
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(bx, by, barW, barH);
    ctx.fillStyle = hp / maxHp > 0.5 ? '#2ecc71' :
                    hp / maxHp > 0.25 ? '#f39c12' : '#e74c3c';
    ctx.fillRect(bx, by, barW * (hp / maxHp), barH);
  }
}
