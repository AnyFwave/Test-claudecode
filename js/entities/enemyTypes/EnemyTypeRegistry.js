export class EnemyTypeRegistry {
  static #types = new Map();

  static register(typeId, config) {
    this.#types.set(typeId, config);
  }

  static get(typeId) {
    return this.#types.get(typeId) || null;
  }

  static getAll() {
    return [...this.#types.values()];
  }

  static getAllIds() {
    return [...this.#types.keys()];
  }

  /** Returns a weighted flat array of non-boss type IDs available at the given wave */
  static getSpawnPool(wave) {
    const pool = [];
    for (const [id, config] of this.#types) {
      if (config.isBoss) continue;
      if (wave < config.minWave) continue;
      for (let i = 0; i < config.weight; i++) {
        pool.push(id);
      }
    }
    return pool;
  }

  /** Returns array of type IDs that are bosses */
  static getBossTypes() {
    const bosses = [];
    for (const [id, config] of this.#types) {
      if (config.isBoss) bosses.push(id);
    }
    return bosses;
  }
}
