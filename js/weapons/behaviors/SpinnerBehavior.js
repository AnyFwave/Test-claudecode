import { Bullet } from '../../entities/Bullet.js';

export class SpinnerBehavior {
  fire(weapon, owner, worldState) {
    // Spinner is handled in updateSpinner(), not on click
  }

  update(weapon, owner, worldState, dt) {
    const s = weapon.stats;
    const enemies = worldState.getEnemies();
    weapon.angle = (weapon.angle || 0) + dt * 2.5;

    let target = null;
    let minDist = s.radius;
    for (const enemy of enemies) {
      if (!enemy.alive) continue;
      const dx = enemy.x - owner.x;
      const dy = enemy.y - owner.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < minDist) {
        minDist = dist;
        target = enemy;
      }
    }

    const count = s.count;
    for (let i = 0; i < count; i++) {
      const a = weapon.angle + (Math.PI * 2 / count) * i;
      const orbitX = owner.x + Math.cos(a) * s.radius;
      const orbitY = owner.y + Math.sin(a) * s.radius;

      if (target && Math.random() < 0.05) {
        const ta = Math.atan2(target.y - orbitY, target.x - orbitX);
        const dmgInstance = weapon.createDamageInstance();
        worldState.addBullet(new Bullet(orbitX, orbitY, ta, 300, dmgInstance, weapon.id));
      }
    }
  }

  getOrbitPositions(weapon, owner) {
    const s = weapon.stats;
    const a = weapon.angle || 0;
    const positions = [];
    for (let i = 0; i < (s.count || 0); i++) {
      const angle = a + (Math.PI * 2 / s.count) * i;
      positions.push({
        x: owner.x + Math.cos(angle) * s.radius,
        y: owner.y + Math.sin(angle) * s.radius,
      });
    }
    return positions;
  }
}
