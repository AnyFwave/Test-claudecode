export class Stat {
  constructor(name, baseValue, min = 0, max = Infinity) {
    this.name = name;
    this.baseValue = baseValue;
    this.originalBase = baseValue;
    this.min = min;
    this.max = max;
    this.modifiers = [];
  }

  addModifier(modifier) {
    this.modifiers.push(modifier);
  }

  removeModifiersFromSource(sourceId) {
    this.modifiers = this.modifiers.filter(m => m.source !== sourceId);
  }

  getValue() {
    let additive = 0;
    let multiplicative = 1.0;
    let override = null;

    for (const mod of this.modifiers) {
      switch (mod.type) {
        case 'add':      additive += mod.value; break;
        case 'multiply': multiplicative *= mod.value; break;
        case 'override': override = mod.value; break;
      }
    }

    let value;
    if (override !== null) {
      value = override;
    } else {
      value = (this.baseValue + additive) * multiplicative;
    }

    return Math.max(this.min, Math.min(this.max, value));
  }

  getBase() { return this.baseValue; }
}
