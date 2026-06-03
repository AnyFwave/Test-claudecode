import { EnemyTypeConfig } from './EnemyTypeConfig.js';
import { EnemyTypeRegistry } from './EnemyTypeRegistry.js';

const config = new EnemyTypeConfig({
  typeId: 'shield',
  name: 'Shield',
  color: '#1abc9c',
  size: 13,
  behavior: 'chase',
  minWave: 5,
  weight: 1,
  statOverrides: {
    resistance_physical: { base: 0.1 },
  },
  initFn(enemy) {
    const scale = 1 + (enemy._wave || 1) * 0.02;
    enemy.shieldHp = Math.floor(30 * scale);
    enemy.maxShieldHp = enemy.shieldHp;
    enemy.shieldRechargeDelay = 3.0;
    enemy.shieldRechargeTimer = 0;
    enemy.shieldActive = true;
  },
  updateFn(enemy, dt) {
    if (!enemy.shieldActive) {
      enemy.shieldRechargeTimer -= dt;
      if (enemy.shieldRechargeTimer <= 0) {
        enemy.shieldActive = true;
        enemy.shieldHp = enemy.maxShieldHp;
      }
    }
  },
  damageFn(enemy, dmg) {
    if (enemy.shieldActive) {
      enemy.shieldHp -= dmg;
      enemy.hitFlash = 0.1;
      if (enemy.shieldHp <= 0) {
        enemy.shieldActive = false;
        enemy.shieldRechargeTimer = enemy.shieldRechargeDelay;
      }
      return false; // Shield absorbed, enemy didn't die
    }
    // Default damage processing
    return null;
  },
  drawFn(enemy, ctx) {
    const s = enemy._size;
    const flash = enemy.hitFlash > 0;
    ctx.fillStyle = flash ? '#fff' : enemy._color;
    ctx.strokeStyle = flash ? '#fff' : 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = (Math.PI * 2 / 5) * i - Math.PI / 2;
      const px = enemy.x + Math.cos(angle) * s;
      const py = enemy.y + Math.sin(angle) * s;
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    if (enemy.shieldActive) {
      const shieldPct = enemy.shieldHp / enemy.maxShieldHp;
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.3 + shieldPct * 0.4})`;
      ctx.lineWidth = 3;
      ctx.shadowColor = '#1abc9c';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(enemy.x, enemy.y, s + 4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.lineWidth = 1.5;
    }

    enemy._drawEyes(ctx, s);
    enemy._drawHpBar(ctx, s);
  }
});

EnemyTypeRegistry.register('shield', config);
