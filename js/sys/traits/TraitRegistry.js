export class TraitRegistry {
  static #traits = new Map();

  static register(trait) {
    this.#traits.set(trait.id, trait);
  }

  static get(id) {
    return this.#traits.get(id) || null;
  }

  static getAll() {
    return [...this.#traits.values()];
  }

  static getByRarity(rarity) {
    return this.getAll().filter(t => t.rarity === rarity);
  }

  static randomByRarity(rarity) {
    const pool = this.getByRarity(rarity);
    if (pool.length === 0) return null;
    return pool[Math.floor(Math.random() * pool.length)];
  }
}
