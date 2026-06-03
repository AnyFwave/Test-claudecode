import { Bullet } from '../../entities/Bullet.js';

export class SpreadBehavior {
  fire(weapon, owner, worldState) {
    const s = weapon.stats;
    const gunLen = owner.size + 6;
    const angle = owner.aimAngle;
    const bx = owner.x + Math.cos(angle) * gunLen;
    const by = owner.y + Math.sin(angle) * gunLen;

    for (let i = 0; i < s.count; i++) {
      const spreadAngle = s.count === 1
        ? angle
        : angle + (i / (s.count - 1) - 0.5) * (s.spread || 0.4);
      const spd = s.bulletSpeed * (0.9 + Math.random() * 0.2);
      const dmgInstance = weapon.createDamageInstance();
      worldState.addBullet(new Bullet(bx, by, spreadAngle, spd, dmgInstance, weapon.id));
    }
    return { type: 'spread', count: s.count };
  }
}
