import { Bullet } from '../../entities/Bullet.js';

export class PierceBehavior {
  fire(weapon, owner, worldState) {
    const s = weapon.stats;
    const gunLen = owner.size + 6;
    const angle = owner.aimAngle;
    const bx = owner.x + Math.cos(angle) * gunLen;
    const by = owner.y + Math.sin(angle) * gunLen;
    const dmgInstance = weapon.createDamageInstance();
    const bullet = new Bullet(bx, by, angle, s.bulletSpeed, dmgInstance, weapon.id);
    bullet.pierce = s.pierce || 1;
    bullet.size = 4;
    worldState.addBullet(bullet);
    return { type: 'pierce' };
  }
}
