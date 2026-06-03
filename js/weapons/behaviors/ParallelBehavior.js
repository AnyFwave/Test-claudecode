import { Bullet } from '../../entities/Bullet.js';

export class ParallelBehavior {
  fire(weapon, owner, worldState) {
    const s = weapon.stats;
    const gunLen = owner.size + 6;
    const angle = owner.aimAngle;
    const bx = owner.x + Math.cos(angle) * gunLen;
    const by = owner.y + Math.sin(angle) * gunLen;
    const count = s.count;
    const spreadDist = 4 + weapon.level * 1.5;
    const perpAngle = angle + Math.PI / 2;
    const start = -(count - 1) / 2;

    for (let i = 0; i < count; i++) {
      const offset = start + i;
      const px = bx + Math.cos(perpAngle) * offset * spreadDist;
      const py = by + Math.sin(perpAngle) * offset * spreadDist;
      const spreadAngle = angle + (Math.random() - 0.5) * (s.spread || 0);
      const spd = s.bulletSpeed * (0.95 + Math.random() * 0.1);
      const dmgInstance = weapon.createDamageInstance();
      worldState.addBullet(new Bullet(px, py, spreadAngle, spd, dmgInstance, weapon.id));
    }
    return { type: 'parallel', count };
  }
}
