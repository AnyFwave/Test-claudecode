export class DamageResult {
  constructor({ rawDamage = 0, finalDamage = 0, mitigated = 0, bonus = 0, breakdown = [], flags = [] }) {
    this.rawDamage = rawDamage;
    this.finalDamage = finalDamage;
    this.mitigated = mitigated;
    this.bonus = bonus;
    this.breakdown = breakdown;
    this.flags = [...new Set(flags)];
  }
}
