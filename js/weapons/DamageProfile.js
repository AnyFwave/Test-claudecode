import { DamageInstance } from '../sys/damage/DamageInstance.js';

export class DamageProfile {
  constructor(typeContributions = []) {
    const total = typeContributions.reduce((s, t) => s + t.proportion, 0);
    this.typeContributions = typeContributions.map(tc => ({
      type: tc.type,
      proportion: total > 0 ? tc.proportion / total : 0
    }));
  }

  createInstance(baseValue) {
    return new DamageInstance({
      baseValue,
      typeContributions: this.typeContributions
    });
  }
}
