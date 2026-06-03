export class Equipment {
  constructor({ id, name, slot, icon = '', statModifiers = {}, traits = [] }) {
    this.id = id;
    this.name = name;
    this.slot = slot;
    this.icon = icon;
    this.statModifiers = statModifiers;
    this.traits = traits;
  }
}
