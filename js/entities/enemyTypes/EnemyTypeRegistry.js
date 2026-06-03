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
}
