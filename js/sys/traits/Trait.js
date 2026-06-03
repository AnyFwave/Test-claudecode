export class Trait {
  constructor({ id, name, description, statModifiers = {}, conditions = [], rarity = 'common' }) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.statModifiers = statModifiers;
    this.conditions = conditions;
    this.rarity = rarity;
  }
}
