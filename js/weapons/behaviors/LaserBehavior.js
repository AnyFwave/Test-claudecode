import { HitDetection } from '../../sys/combat/HitDetection.js';
import { DamagePipeline } from '../../sys/damage/DamagePipeline.js';
import { EventBus } from '../../core/EventBus.js';

export class LaserBehavior {
  fire(weapon, owner, worldState) {
    const s = weapon.stats;
    weapon.laserTimer = 0.1;
    const angle = owner.aimAngle;
    weapon.laserAngle = angle;
    weapon.laserOrigin = { x: owner.x, y: owner.y };

    const gunLen = owner.size + 6;
    const ox = owner.x + Math.cos(angle) * gunLen;
    const oy = owner.y + Math.sin(angle) * gunLen;
    const range = s.range || 400;

    const deadEnemies = [];
    const enemies = worldState.getEnemies();

    for (const enemy of enemies) {
      if (!enemy.alive) continue;
      if (HitDetection.rayVsCircle(ox, oy, angle, range, enemy.x, enemy.y, enemy.size)) {
        const dmgInstance = weapon.createDamageInstance();
        const result = DamagePipeline.calculate(owner, enemy, dmgInstance);
        const died = enemy.takeDamage(result.finalDamage);

        if (died) {
          deadEnemies.push(enemy);
          EventBus.emit('enemy:killed', { enemy, killer: owner, damageResult: result });
          if (worldState.particles) {
            worldState.particles.explosion(enemy.x, enemy.y, enemy.color, false);
          }
        } else {
          if (worldState.particles) {
            worldState.particles.spark(enemy.x, enemy.y);
          }
        }
      }
    }

    // Find closest hit for laser endpoint
    let closestDist = range;
    for (const enemy of enemies) {
      if (!enemy.alive) continue;
      const dx = enemy.x - ox;
      const dy = enemy.y - oy;
      const t = dx * Math.cos(angle) + dy * Math.sin(angle);
      if (t < 0 || t > range) continue;
      const projX = ox + t * Math.cos(angle);
      const projY = oy + t * Math.sin(angle);
      const dist = Math.sqrt((enemy.x - projX) ** 2 + (enemy.y - projY) ** 2);
      if (dist < enemy.size + 5 && t < closestDist) {
        closestDist = t;
      }
    }

    weapon.laserEndX = ox + Math.cos(angle) * (closestDist < range ? closestDist : range);
    weapon.laserEndY = oy + Math.sin(angle) * (closestDist < range ? closestDist : range);

    return { type: 'laser', deadEnemies };
  }
}
