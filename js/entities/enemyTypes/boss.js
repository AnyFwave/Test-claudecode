import { EnemyTypeConfig } from './EnemyTypeConfig.js';
import { EnemyTypeRegistry } from './EnemyTypeRegistry.js';

const config = new EnemyTypeConfig({
  typeId: 'boss',
  name: 'Boss',
  color: '#9b59b6',
  size: 22,
  behavior: 'boss',
  minWave: 5,
  weight: 0,
  isBoss: true,
  initFn(enemy) {
    enemy.bossPhase = 0;
    enemy.bossTimer = 0;
  },
  onDeathFn(enemy, ctx) {
    ctx.spawnWeaponPickup(enemy.x, enemy.y);
    ctx.spawnEquipmentPickup(enemy.x, enemy.y);
  },
  drawFn(enemy, ctx) {
    const s = enemy._size;
    const flash = enemy.hitFlash > 0;
    ctx.fillStyle = flash ? '#fff' : enemy._color;
    ctx.strokeStyle = flash ? '#fff' : 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 6;
      const bx = enemy.x + Math.cos(angle) * s;
      const by = enemy.y + Math.sin(angle) * s;
      i === 0 ? ctx.moveTo(bx, by) : ctx.lineTo(bx, by);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#f1c40f';
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i + Math.PI / 6;
      const px = enemy.x + Math.cos(angle) * s * 0.5;
      const py = enemy.y + Math.sin(angle) * s * 0.5;
      ctx.fillRect(px - 2, py - 2, 4, 4);
    }

    ctx.fillStyle = '#f1c40f';
    ctx.beginPath();
    ctx.moveTo(enemy.x - s * 0.5, enemy.y - s * 0.8);
    ctx.lineTo(enemy.x, enemy.y - s * 1.4);
    ctx.lineTo(enemy.x + s * 0.5, enemy.y - s * 0.8);
    ctx.fill();

    ctx.shadowColor = enemy._color;
    ctx.shadowBlur = 20;
    ctx.stroke();
    ctx.shadowBlur = 0;

    const be = s * 0.5;
    ctx.fillStyle = '#fff';
    ctx.fillRect(enemy.x - be - 2, enemy.y - s * 0.2, be, be * 1.2);
    ctx.fillRect(enemy.x + 2, enemy.y - s * 0.2, be, be * 1.2);
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(enemy.x - be, enemy.y - s * 0.1, be * 0.6, be * 0.8);
    ctx.fillRect(enemy.x + 4, enemy.y - s * 0.1, be * 0.6, be * 0.8);

    enemy._drawHpBar(ctx, s);
  }
});

EnemyTypeRegistry.register('boss', config);
