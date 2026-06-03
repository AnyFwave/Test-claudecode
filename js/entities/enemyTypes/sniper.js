import { EnemyTypeConfig } from './EnemyTypeConfig.js';
import { EnemyTypeRegistry } from './EnemyTypeRegistry.js';
import { DamageInstance } from '../../sys/damage/DamageInstance.js';
import { PHYSICAL } from '../../sys/damage/damageTypes.js';
import { Bullet } from '../Bullet.js';

const config = new EnemyTypeConfig({
  typeId: 'sniper',
  name: 'Sniper',
  color: '#e67e22',
  size: 10,
  behavior: 'sniper',
  minWave: 3,
  weight: 1,
  initFn(enemy) {
    enemy.shootCooldown = 2.0;
    enemy.shootTimer = 1.5 + Math.random();
    enemy.preferredDist = 250;
  },
  updateFn(enemy, dt, playerX, playerY, gameState) {
    if (enemy.shootTimer <= 0) {
      enemy.shootTimer = enemy.shootCooldown;
      const angle = Math.atan2(playerY - enemy.y, playerX - enemy.x);
      const dmgInst = new DamageInstance({
        baseValue: enemy.damage,
        typeContributions: [{ type: PHYSICAL, proportion: 1.0 }]
      });
      const eb = new Bullet(enemy.x, enemy.y, angle, 300, dmgInst, 'sniper');
      gameState.addEnemyBullet(eb);
    }
  },
  drawFn(enemy, ctx) {
    const s = enemy._size;
    const flash = enemy.hitFlash > 0;
    ctx.fillStyle = flash ? '#fff' : enemy._color;
    ctx.strokeStyle = flash ? '#fff' : 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.moveTo(enemy.x, enemy.y - s * 1.2);
    ctx.lineTo(enemy.x + s * 1.2, enemy.y);
    ctx.lineTo(enemy.x, enemy.y + s * 1.2);
    ctx.lineTo(enemy.x - s * 1.2, enemy.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = flash ? '#fff' : 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 1;
    const ch = s * 0.6;
    ctx.beginPath();
    ctx.moveTo(enemy.x - ch, enemy.y);
    ctx.lineTo(enemy.x + ch, enemy.y);
    ctx.moveTo(enemy.x, enemy.y - ch);
    ctx.lineTo(enemy.x, enemy.y + ch);
    ctx.stroke();
    ctx.lineWidth = 1.5;

    ctx.strokeStyle = flash ? '#fff' : 'rgba(255,255,255,0.3)';
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y, s * 0.4, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y - s * 0.1, s * 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y - s * 0.1, s * 0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.arc(enemy.x + 1, enemy.y - s * 0.1, s * 0.15, 0, Math.PI * 2);
    ctx.fill();

    enemy._drawHpBar(ctx, s);
  }
});

EnemyTypeRegistry.register('sniper', config);
