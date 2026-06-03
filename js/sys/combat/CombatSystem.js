import { HitDetection } from './HitDetection.js';
import { DamagePipeline } from '../damage/DamagePipeline.js';
import { DamageInstance } from '../damage/DamageInstance.js';
import { EventBus } from '../../core/EventBus.js';
import { Explosion } from '../../entities/Explosion.js';

export class CombatSystem {
  constructor(gameState) {
    this.state = gameState;
  }

  update(dt) {
    this.processPlayerBullets(dt);
    this.processEnemyBullets(dt);
    this.processEnemyPlayerCollision();
    this.processExplosions(dt);
  }

  processPlayerBullets(dt) {
    const { bullets, enemies, player } = this.state;
    if (!player) return;

    for (let i = bullets.length - 1; i >= 0; i--) {
      const bullet = bullets[i];
      bullet.update(dt, this.state.canvasWidth, this.state.canvasHeight, 150);
      if (!bullet.alive) { bullets.splice(i, 1); continue; }

      for (let j = enemies.length - 1; j >= 0; j--) {
        const enemy = enemies[j];
        if (!enemy.alive) continue;
        if (bullet.hitEnemies && bullet.hitEnemies.has(enemy)) continue;

        if (HitDetection.circleVsCircle(bullet, enemy)) {
          if (bullet.hitEnemies) bullet.hitEnemies.add(enemy);

          if (bullet.pierce > 0) {
            bullet.pierce--;
            if (bullet.pierce <= 0) bullet.alive = false;
          } else {
            bullet.alive = false;
          }

          const result = DamagePipeline.calculate(player, enemy, bullet.damageInstance);

          EventBus.emit('bullet:hit', { bullet, enemy, damageResult: result, source: player });

          // Particles
          if (this.state.particles) {
            this.state.particles.spark(bullet.x, bullet.y);
          }

          // Explosive bullet
          if (bullet.isExplosive) {
            const expDmg = bullet.damageInstance
              ? new DamageInstance({
                  baseValue: bullet.damageInstance.baseValue * 0.5,
                  typeContributions: bullet.damageInstance.typeContributions
                })
              : null;
            this.state.addExplosion(new Explosion(
              bullet.x, bullet.y, bullet.explodeRadius, expDmg
            ));
            if (this.state.particles) {
              this.state.particles.explosion(bullet.x, bullet.y, '#e74c3c', true);
            }
          }

          const died = enemy.takeDamage(result.finalDamage);

          if (died) {
            EventBus.emit('enemy:killed', { enemy, killer: player, damageResult: result });
            this.state.onEnemyDeath(enemy);
          }

          if (!bullet.alive) break;
        }
      }
    }
  }

  processEnemyBullets(dt) {
    const { enemyBullets, player } = this.state;
    if (!player || !player.alive) return;

    for (let i = enemyBullets.length - 1; i >= 0; i--) {
      const eb = enemyBullets[i];
      eb.update(dt, this.state.canvasWidth, this.state.canvasHeight, 100);
      if (!eb.alive) { enemyBullets.splice(i, 1); continue; }

      if (HitDetection.circleVsCircle(eb, player)) {
        eb.alive = false;
        const rawDmg = eb.damageInstance
          ? eb.damageInstance.getTotalRaw()
          : (eb.damage || 10);
        const dmg = Math.round(rawDmg);

        const tookDmg = player.takeDamage(dmg);
        if (tookDmg) {
          EventBus.emit('player:damaged', { player, source: eb, damage: dmg });
          if (this.state.camera) this.state.camera.shake(3);
          if (this.state.particles) {
            this.state.particles.explosion(player.x, player.y, '#ff4444', false);
          }
        }
      }
    }
  }

  processEnemyPlayerCollision() {
    const { enemies, player } = this.state;
    if (!player || !player.alive) return;

    for (const enemy of enemies) {
      if (!enemy.alive) continue;
      if (HitDetection.circleVsCircle(player, enemy)) {
        const dmg = enemy.stats.get('collision_damage');
        const tookDmg = player.takeDamage(dmg);
        if (tookDmg) {
          EventBus.emit('player:damaged', { player, source: enemy, damage: dmg });
          if (this.state.camera) this.state.camera.shake(4);
          if (this.state.particles) {
            this.state.particles.spark(player.x, player.y);
          }
        }
      }
    }
  }

  processExplosions(dt) {
    const { explosions, enemies } = this.state;

    for (let i = explosions.length - 1; i >= 0; i--) {
      const exp = explosions[i];
      exp.update(dt);
      if (!exp.alive) { explosions.splice(i, 1); continue; }

      for (let j = enemies.length - 1; j >= 0; j--) {
        const enemy = enemies[j];
        if (!enemy.alive) continue;
        if (exp.hitEnemies.has(enemy)) continue;

        if (HitDetection.circleVsCircle(exp, enemy)) {
          exp.hitEnemies.add(enemy);

          const dmg = Math.round(exp.damage);

          if (this.state.particles) {
            this.state.particles.spark(enemy.x, enemy.y);
          }

          const died = enemy.takeDamage(dmg);
          if (died) {
            EventBus.emit('enemy:killed', { enemy, killer: this.state.player, damageResult: { finalDamage: dmg } });
            this.state.onEnemyDeath(enemy);
          }
        }
      }
    }
  }
}
