import { Bullet } from '../../entities/Bullet.js';

export class QuadBehavior {
  fire(weapon, owner, worldState) {
    const s = weapon.stats;
    const isOcto = s.special === 'octo';
    const baseAngles = [0, Math.PI / 2, Math.PI, -Math.PI / 2];
    const octoAngles = [Math.PI / 4, 3 * Math.PI / 4, -3 * Math.PI / 4, -Math.PI / 4];
    const allAngles = isOcto ? [...baseAngles, ...octoAngles] : baseAngles;
    const gunLen = owner.size + 6;

    for (const a of allAngles) {
      const bx = owner.x + Math.cos(a) * gunLen;
      const by = owner.y + Math.sin(a) * gunLen;
      const spd = s.bulletSpeed * 0.8;
      const dmgInstance = weapon.createDamageInstance();
      worldState.addBullet(new Bullet(bx, by, a, spd, dmgInstance, weapon.id));
    }
    return { type: isOcto ? 'octo' : 'quad', count: allAngles.length };
  }
}
