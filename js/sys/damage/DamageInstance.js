export class DamageInstance {
  constructor({ baseValue, typeContributions }) {
    this.baseValue = baseValue;
    const total = typeContributions.reduce((s, t) => s + t.proportion, 0);
    this.typeContributions = typeContributions.map(tc => ({
      type: tc.type,
      proportion: total > 0 ? tc.proportion / total : 0
    }));
  }

  getDamageByType() {
    return this.typeContributions
      .filter(tc => tc.proportion > 0)
      .map(({ type, proportion }) => ({
        type,
        rawValue: this.baseValue * proportion
      }));
  }

  getTotalRaw() {
    return this.baseValue;
  }
}
