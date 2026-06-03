export class DropTable {
  constructor() {
    this.entries = [];
  }

  addEntry({ type, weight, weaponId = null }) {
    this.entries.push({ type, weight, weaponId });
  }

  roll() {
    const total = this.entries.reduce((s, e) => s + e.weight, 0);
    let r = Math.random() * total;
    for (const entry of this.entries) {
      r -= entry.weight;
      if (r <= 0) return entry;
    }
    return this.entries[this.entries.length - 1] || null;
  }
}
