import { EnemyTypeConfig } from './EnemyTypeConfig.js';
import { EnemyTypeRegistry } from './EnemyTypeRegistry.js';

const config = new EnemyTypeConfig({
  typeId: 'tank',
  name: 'Tank',
  color: '#3498db',
  size: 14,
  behavior: 'chase',
  drawFn(enemy, ctx) {
    const s = enemy._size;
    const flash = enemy.hitFlash > 0;
    ctx.fillStyle = flash ? '#fff' : enemy._color;
    ctx.strokeStyle = flash ? '#fff' : 'rgba(0,0,0,0.4)';
    ctx.fillRect(enemy.x - s, enemy.y - s, s * 2, s * 2);
    ctx.strokeRect(enemy.x - s, enemy.y - s, s * 2, s * 2);

    ctx.strokeStyle = flash ? '#fff' : 'rgba(0,0,0,0.2)';
    ctx.strokeRect(enemy.x - s * 0.6, enemy.y - s * 0.6, s * 1.2, s * 1.2);

    ctx.fillStyle = flash ? '#fff' : '#2c3e50';
    const boltSize = 2;
    for (const [bx, by] of [[-0.8, -0.8], [0.8, -0.8], [-0.8, 0.8], [0.8, 0.8]]) {
      ctx.fillRect(enemy.x + bx * s - boltSize / 2, enemy.y + by * s - boltSize / 2, boltSize, boltSize);
    }
    enemy._drawEyes(ctx, s);
    enemy._drawHpBar(ctx, s);
  }
});

EnemyTypeRegistry.register('tank', config);
