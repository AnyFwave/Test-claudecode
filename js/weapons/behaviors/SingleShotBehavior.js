import { Bullet } from '../../entities/Bullet.js';

export class SingleShotBehavior {
  fire(weapon, owner, worldState) {
    const s = weapon.stats;
    const gunLen = owner.size + 6;
    const angle = owner.aimAngle;
    const bx = owner.x + Math.cos(angle) * gunLen;
    const by = owner.y + Math.sin(angle) * gunLen;
    const dmgInstance = weapon.createDamageInstance();
    worldState.addBullet(new Bullet(bx, by, angle, s.bulletSpeed, dmgInstance, weapon.id));
    return { type: 'single' };
  }
}
