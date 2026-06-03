import { Trait } from './Trait.js';
import { TraitCondition } from './TraitCondition.js';
import { TraitRegistry } from './TraitRegistry.js';
import { StatModifier } from '../stats/StatModifier.js';
import { STATS } from '../stats/statDefinitions.js';
import { Explosion } from '../../entities/Explosion.js';

export const TRAIT_LIFESTEAL = new Trait({
  id: 'lifesteal',
  name: 'Lifesteal',
  description: 'Heal 5% of damage dealt',
  rarity: 'rare',
  conditions: [
    new TraitCondition({
      event: 'bullet:hit',
      predicate: (ctx) => ctx.damageResult && ctx.damageResult.finalDamage > 0,
      effect: (ctx) => {
        const healAmt = Math.ceil(ctx.damageResult.finalDamage * 0.05);
        if (ctx.source && ctx.source.heal) ctx.source.heal(healAmt);
      }
    })
  ]
});

export const TRAIT_CHAIN_REACTION = new Trait({
  id: 'chain_reaction',
  name: 'Chain Reaction',
  description: 'Killed enemies explode for 30% damage',
  rarity: 'epic',
  conditions: [
    new TraitCondition({
      event: 'enemy:killed',
      predicate: (ctx) => ctx.enemy && ctx.damageResult,
      effect: (ctx, worldState) => {
        if (worldState && worldState.addExplosion && ctx.enemy) {
          const dmg = ctx.damageResult ? ctx.damageResult.finalDamage * 0.3 : 10;
          worldState.addExplosion(new Explosion(
            ctx.enemy.x, ctx.enemy.y, 60, dmg
          ));
        }
      }
    })
  ]
});

export const TRAIT_ICE_ARMOR = new Trait({
  id: 'ice_armor',
  name: 'Ice Armor',
  description: 'When hit, slow nearby enemies',
  rarity: 'uncommon',
  statModifiers: {
    [STATS.ARMOR]: new StatModifier({ type: 'add', value: 5, source: 'trait:ice_armor' }),
  },
  conditions: [
    new TraitCondition({
      event: 'player:damaged',
      predicate: () => true,
      effect: (ctx, worldState) => {
        if (!worldState || !ctx.player) return;
        const enemies = worldState.getEnemies ? worldState.getEnemies() : [];
        for (const enemy of enemies) {
          if (!enemy.alive) continue;
          const dx = enemy.x - ctx.player.x;
          const dy = enemy.y - ctx.player.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            enemy.speed = enemy.baseSpeed * 0.3;
            if (!enemy._slowTimer) enemy._slowTimer = 0;
            enemy._slowTimer = 2.0;
          }
        }
      }
    })
  ]
});

export const TRAIT_BERSERKER = new Trait({
  id: 'berserker',
  name: 'Berserker',
  description: 'Lower HP = higher damage',
  rarity: 'rare',
  conditions: [
    new TraitCondition({
      event: 'bullet:hit',
      predicate: (ctx) => ctx.source && ctx.source.stats,
      effect: (ctx) => {
        const hp = ctx.source.stats.get(STATS.HP);
        const maxHp = ctx.source.stats.get(STATS.MAX_HP);
        const hpRatio = Math.max(0.1, hp / maxHp);
        const bonus = (1 - hpRatio) * 0.5;
        ctx.damageResult.finalDamage = Math.round(
          ctx.damageResult.finalDamage * (1 + bonus)
        );
      }
    })
  ]
});

export const TRAIT_VAMPIRE_TOUCH = new Trait({
  id: 'vampire_touch',
  name: 'Vampire Touch',
  description: 'Kills heal 10 HP',
  rarity: 'uncommon',
  conditions: [
    new TraitCondition({
      event: 'enemy:killed',
      predicate: () => true,
      effect: (ctx) => {
        if (ctx.killer && ctx.killer.heal) ctx.killer.heal(10);
      }
    })
  ]
});

TraitRegistry.register(TRAIT_LIFESTEAL);
TraitRegistry.register(TRAIT_CHAIN_REACTION);
TraitRegistry.register(TRAIT_ICE_ARMOR);
TraitRegistry.register(TRAIT_BERSERKER);
TraitRegistry.register(TRAIT_VAMPIRE_TOUCH);
