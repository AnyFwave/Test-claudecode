export class DamageTypeRegistry {
  static #types = new Map();

  static register(damageType) {
    this.#types.set(damageType.typeId, damageType);
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
