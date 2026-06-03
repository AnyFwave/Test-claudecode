import { Stat } from './Stat.js';
import { StatModifier } from './StatModifier.js';

export class StatBlock {
  constructor(statDefinitions = {}) {
    this._stats = {};
    for (const [name, config] of Object.entries(statDefinitions)) {
      this._stats[name] = new Stat(
        name,
        config.base,
        config.min ?? 0,
        config.max ?? Infinity
      );
    }
  }

  get(statName) {
    return this._stats[statName]?.getValue() ?? 0;
  }

  getStat(statName) {
    return this._stats[statName] || null;
  }

  setBase(statName, value) {
    const stat = this._stats[statName];
    if (stat) stat.baseValue = value;
  }

  addModifier(statName, modifier) {
    const stat = this._stats[statName];
    if (stat) stat.addModifier(modifier);
  }

  addModifiers(modifierMap) {
    for (const [statName, modifier] of Object.entries(modifierMap)) {
      this.addModifier(statName, modifier);
    }
  }

  removeModifiersFromSource(sourceId) {
    for (const stat of Object.values(this._stats)) {
      stat.removeModifiersFromSource(sourceId);
    }
  }

  clone() {
    const defs = {};
    for (const [name, stat] of Object.entries(this._stats)) {
      defs[name] = { base: stat.baseValue, min: stat.min, max: stat.max };
    }
    const cloned = new StatBlock(defs);
    for (const [name, stat] of Object.entries(this._stats)) {
      for (const mod of stat.modifiers) {
        cloned._stats[name].addModifier(new StatModifier({
          type: mod.type, value: mod.value, source: mod.source
        }));
      }
    }
    return cloned;
  }
}
