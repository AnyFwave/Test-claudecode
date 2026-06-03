import { Equipment } from '../sys/traits/Equipment.js';
import { EquipmentSlot } from '../sys/traits/EquipmentSlot.js';
import { StatModifier } from '../sys/stats/StatModifier.js';
import { STATS } from '../sys/stats/statDefinitions.js';
import { TraitRegistry } from '../sys/traits/TraitRegistry.js';
import { Game } from '../core/Game.js';

const EQ = [
  new Equipment({
    id: 'vampire_crown',
    name: 'Vampire Crown',
    slot: EquipmentSlot.HEAD,
    icon: '⛑',
    statModifiers: {
      [STATS.MAX_HP]: new StatModifier({ type: 'add', value: 15, source: 'equip:vampire_crown' }),
    },
    traits: [TraitRegistry.get('vampire_touch')].filter(Boolean),
  }),
  new Equipment({
    id: 'berserker_plate',
    name: 'Berserker Plate',
    slot: EquipmentSlot.BODY,
    icon: '🛡',
    statModifiers: {
      [STATS.MAX_HP]: new StatModifier({ type: 'add', value: 20, source: 'equip:berserker_plate' }),
      [STATS.ARMOR]: new StatModifier({ type: 'add', value: 5, source: 'equip:berserker_plate' }),
    },
    traits: [TraitRegistry.get('berserker')].filter(Boolean),
  }),
  new Equipment({
    id: 'frost_ring',
    name: 'Frost Ring',
    slot: EquipmentSlot.ACCESSORY,
    icon: '💍',
    statModifiers: {
      [STATS.ARMOR]: new StatModifier({ type: 'add', value: 5, source: 'equip:frost_ring' }),
    },
    traits: [TraitRegistry.get('ice_armor')].filter(Boolean),
  }),
  new Equipment({
    id: 'soul_amulet',
    name: 'Soul Amulet',
    slot: EquipmentSlot.ACCESSORY,
    icon: '💍',
    statModifiers: {
      [STATS.CRITICAL_CHANCE]: new StatModifier({ type: 'add', value: 0.05, source: 'equip:soul_amulet' }),
    },
    traits: [TraitRegistry.get('lifesteal')].filter(Boolean),
  }),
  new Equipment({
    id: 'chainmail',
    name: 'Chainmail',
    slot: EquipmentSlot.BODY,
    icon: '🛡',
    statModifiers: {
      [STATS.ARMOR]: new StatModifier({ type: 'add', value: 10, source: 'equip:chainmail' }),
    },
    traits: [TraitRegistry.get('chain_reaction')].filter(Boolean),
  }),
];

for (const eq of EQ) {
  Game.registerEquipment(eq);
}
