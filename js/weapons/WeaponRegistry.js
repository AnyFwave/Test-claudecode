export class WeaponRegistry {
  static #weapons = new Map();
  static #behaviorMap = new Map();

  static register(definition) {
    this.#weapons.set(definition.id, definition);
  }

  static registerBehavior(specialKey, behaviorClass) {
    this.#behaviorMap.set(specialKey, behaviorClass);
  }

  static get(id) {
    return this.#weapons.get(id) || null;
  }

  static getBehavior(specialKey) {
    return this.#behaviorMap.get(specialKey) || null;
  }

  static getAll() {
    return [...this.#weapons.values()];
  }

  static getAllIds() {
    return [...this.#weapons.keys()];
  }

  static createWeapon(id) {
    const def = this.get(id);
    if (!def) return null;
    const Weapon = def.WeaponClass;
    return new Weapon(def);
  }
}
