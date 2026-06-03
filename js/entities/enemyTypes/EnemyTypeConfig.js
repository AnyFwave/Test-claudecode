export class EnemyTypeConfig {
  constructor({ typeId, name, color, size, behavior, statOverrides = {}, drawFn = null, initFn = null, updateFn = null, damageFn = null }) {
    this.typeId = typeId;
    this.name = name;
    this.color = color;
    this.size = size;
    this.behavior = behavior;
    this.statOverrides = statOverrides;
    this.drawFn = drawFn;
    this.initFn = initFn;
    this.updateFn = updateFn;
    this.damageFn = damageFn;
  }
}
