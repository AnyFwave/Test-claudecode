export class DamageResistanceProfile {
  constructor() {
    this.resistances = new Map();
    this.vulnerabilities = new Map();
  }

  setResistance(typeId, value) {
    this.resistances.set(typeId, Math.max(-1, Math.min(1, value)));
  }

  setVulnerability(typeId, value) {
    this.vulnerabilities.set(typeId, Math.max(0, Math.min(2, value)));
  }

  getResistance(typeId) {
    return this.resistances.get(typeId) || 0;
  }

  getVulnerability(typeId) {
    return this.vulnerabilities.get(typeId) || 0;
  }
}
