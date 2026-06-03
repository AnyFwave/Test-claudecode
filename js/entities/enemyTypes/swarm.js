import { EnemyTypeConfig } from './EnemyTypeConfig.js';
import { EnemyTypeRegistry } from './EnemyTypeRegistry.js';

const config = new EnemyTypeConfig({
  typeId: 'swarm',
  name: 'Swarm',
  color: '#f1c40f',
  size: 5,
  behavior: 'chase',
  minWave: 3,
  weight: 2,
  groupMin: 3,
  groupMax: 6,
  drawFn(enemy, ctx) {
    const s = enemy._size;
    const flash = enemy.hitFlash > 0;
    ctx.fillStyle = flash ? '#fff' : enemy._color;
    ctx.strokeStyle = flash ? '#fff' : 'rgba(0,0,0,0.3)';
    const pulse = 1 + Math.sin(enemy.animFrame * Math.PI / 2) * 0.2;
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y, s * pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.shadowColor = enemy._color;
    ctx.shadowBlur = 5;
    ctx.fill();
    ctx.shadowBlur = 0;
  }
});

EnemyTypeRegistry.register('swarm', config);
