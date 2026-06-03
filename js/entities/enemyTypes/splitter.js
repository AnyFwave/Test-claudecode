import { EnemyTypeConfig } from './EnemyTypeConfig.js';
import { EnemyTypeRegistry } from './EnemyTypeRegistry.js';

const config = new EnemyTypeConfig({
  typeId: 'splitter',
  name: 'Splitter',
  color: '#e91e63',
  size: 11,
  behavior: 'chase',
  initFn(enemy) {
    enemy.hasSplit = false;
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
