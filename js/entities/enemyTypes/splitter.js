import { EnemyTypeConfig } from './EnemyTypeConfig.js';
import { EnemyTypeRegistry } from './EnemyTypeRegistry.js';
import { Enemy } from '../Enemy.js';

const config = new EnemyTypeConfig({
  typeId: 'splitter',
  name: 'Splitter',
  color: '#e91e63',
  size: 11,
  behavior: 'chase',
  minWave: 5,
  weight: 1,
  initFn(enemy) {
    enemy.hasSplit = false;
  },
  onDeathFn(enemy, ctx) {
    if (enemy.hasSplit) return;
    enemy.hasSplit = true;
    for (let k = 0; k < 2; k++) {
      const angle = (Math.PI * 2 / 2) * k;
      const s = ctx.spawnEnemy(
        enemy.x + Math.cos(angle) * 20,
        enemy.y + Math.sin(angle) * 20,
        'basic',
        enemy._wave
      );
      if (s) {
        s._size = 6;
        s.stats.setBase('max_hp', Math.floor(enemy.maxHp * 0.3));
        s.stats.setBase('hp', s.stats.get('max_hp'));
        s._color = '#e91e63';
      }
    }
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

    ctx.strokeStyle = flash ? '#fff' : 'rgba(255,255,255,0.2)';
    ctx.beginPath();
    ctx.moveTo(enemy.x, enemy.y - s * 0.5);
    ctx.lineTo(enemy.x, enemy.y + s * 0.5);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(enemy.x - s * 0.5, enemy.y);
    ctx.lineTo(enemy.x + s * 0.5, enemy.y);
    ctx.stroke();

    enemy._drawEyes(ctx, s);
    enemy._drawHpBar(ctx, s);
  }
});

EnemyTypeRegistry.register('splitter', config);
