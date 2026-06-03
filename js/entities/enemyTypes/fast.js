import { EnemyTypeConfig } from './EnemyTypeConfig.js';
import { EnemyTypeRegistry } from './EnemyTypeRegistry.js';

const config = new EnemyTypeConfig({
  typeId: 'fast',
  name: 'Fast',
  color: '#2ecc71',
  size: 8,
  behavior: 'zigzag',
  minWave: 1,
  weight: 1,
  initFn(enemy) {
    enemy.zigTimer = 0;
    enemy.zigAngle = 0;
  },
  drawFn(enemy, ctx) {
    const s = enemy._size;
    const flash = enemy.hitFlash > 0;
    ctx.fillStyle = flash ? '#fff' : enemy._color;
    ctx.strokeStyle = flash ? '#fff' : 'rgba(0,0,0,0.4)';
    const bobY = Math.sin(enemy.animFrame * Math.PI / 2) * 1.5;
    ctx.beginPath();
    ctx.moveTo(enemy.x, enemy.y - s * 1.2 + bobY);
    ctx.lineTo(enemy.x + s * 1.1, enemy.y + bobY);
    ctx.lineTo(enemy.x, enemy.y + s * 1.2 + bobY);
    ctx.lineTo(enemy.x - s * 1.1, enemy.y + bobY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = flash ? '#fff' : `${enemy._color}44`;
    for (let i = 1; i <= 3; i++) {
      const alpha = 0.3 - i * 0.08;
      ctx.globalAlpha = alpha;
      const trailS = s * (1 - i * 0.15);
      ctx.fillRect(enemy.x - s * 1.2 - i * 4, enemy.y - trailS / 2, trailS * 2.2, trailS);
    }
    ctx.globalAlpha = 1;

    enemy._drawEyes(ctx, s);
    enemy._drawHpBar(ctx, s);
  }
});

EnemyTypeRegistry.register('fast', config);
