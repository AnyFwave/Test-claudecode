import { DamageType } from './DamageType.js';
import { DamageTypeRegistry } from './DamageTypeRegistry.js';

// === Physical Branch ===
export const PHYSICAL = new DamageType({
  typeId: 'physical',
  typeName: 'Physical Damage'
});

export const COLLISION = new DamageType({
  typeId: 'collision',
  typeName: 'Collision Damage',
  parentType: PHYSICAL
});

export const PENETRATION = new DamageType({
  typeId: 'penetration',
  typeName: 'Penetration Damage',
  parentType: PHYSICAL,
  modifiers: { weaknessMultiplier: 1.2 }
});

// === Magic Branch ===
export const MAGIC = new DamageType({
  typeId: 'magic',
  typeName: 'Magic Damage'
});

export const FIRE = new DamageType({
  typeId: 'fire',
  typeName: 'Fire Damage',
  parentType: MAGIC,
  onHit: (target, result) => {
    if (!target.statusEffects) return;
    target.statusEffects.add('burning', { damage: result.final * 0.2, duration: 3, source: 'fire' });
  }
});

export const ICE = new DamageType({
  typeId: 'ice',
  typeName: 'Ice Damage',
  parentType: MAGIC,
  onHit: (target, result) => {
    if (!target.statusEffects) return;
    target.statusEffects.add('chilled', { slowAmount: 0.3, duration: 2, source: 'ice' });
  }
});

export const LIGHTNING = new DamageType({
  typeId: 'lightning',
  typeName: 'Lightning Damage',
  parentType: MAGIC
});

export const POISON = new DamageType({
  typeId: 'poison',
  typeName: 'Poison Damage',
  parentType: MAGIC,
  onHit: (target, result) => {
    if (!target.statusEffects) return;
    target.statusEffects.add('poisoned', { damage: result.final * 0.15, duration: 5, source: 'poison' });
  }
});

export const ELEMENTAL_REACTION = new DamageType({
  typeId: 'elem_reaction',
  typeName: 'Elemental Reaction',
  parentType: MAGIC,
  modifiers: { weaknessMultiplier: 1.5 }
});

export const ELEMENTAL_PENETRATION = new DamageType({
  typeId: 'elem_penetration',
  typeName: 'Elemental Penetration',
  parentType: MAGIC,
  modifiers: { penetrationBonus: 0.5 }
});

// === Mental Branch ===
export const MENTAL = new DamageType({
  typeId: 'mental',
  typeName: 'Mental Damage'
});

export const MENTAL_COLLISION = new DamageType({
  typeId: 'mental_collision',
  typeName: 'Mental Collision',
  parentType: MENTAL
});

export const MENTAL_INTERFERENCE = new DamageType({
  typeId: 'mental_interference',
  typeName: 'Mental Interference',
  parentType: MENTAL,
  onHit: (target, result) => {
    if (!target.statusEffects) return;
    target.statusEffects.add('confused', { duration: 3, source: 'mental' });
  }
});

export const MENTAL_PENETRATION = new DamageType({
  typeId: 'mental_penetration',
  typeName: 'Mental Penetration',
  parentType: MENTAL,
  modifiers: { penetrationBonus: 0.5 }
});

export const MENTAL_TEAR = new DamageType({
  typeId: 'mental_tear',
  typeName: 'Mental Tear',
  parentType: MENTAL,
  onHit: (target, result) => {
    if (!target.statusEffects) return;
    target.statusEffects.add('mental_tear', { damage: result.final * 0.25, duration: 4, source: 'mental_tear' });
  }
});

// Register all
const ALL_TYPES = [
  PHYSICAL, COLLISION, PENETRATION,
  MAGIC, FIRE, ICE, LIGHTNING, POISON,
  ELEMENTAL_REACTION, ELEMENTAL_PENETRATION,
  MENTAL, MENTAL_COLLISION, MENTAL_INTERFERENCE,
  MENTAL_PENETRATION, MENTAL_TEAR
];

ALL_TYPES.forEach(t => DamageTypeRegistry.register(t));
