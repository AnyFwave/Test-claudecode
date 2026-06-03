import { EnemyTypeConfig } from './EnemyTypeConfig.js';
import { EnemyTypeRegistry } from './EnemyTypeRegistry.js';

const config = new EnemyTypeConfig({
  typeId: 'basic',
  name: 'Basic',
  color: '#e74c3c',
  size: 10,
  behavior: 'chase',
  drawFn(enemy, ctx) {
    const s = enemy._size;
    const flash = enemy.hitFlash > 0;
    ctx.fillStyle = flash ? '#fff' : enemy._color;
    ctx.strokeStyle = flash ? '#fff' : 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y, s, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    enemy._drawEyes(ctx, s);
    enemy._drawHpBar(ctx, s);
  }
});

EnemyTypeRegistry.register('basic', config);
