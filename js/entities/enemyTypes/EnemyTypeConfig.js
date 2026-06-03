export class EnemyTypeConfig {
  constructor({
    typeId, name, color, size, behavior,
    statOverrides = {},
    drawFn = null, initFn = null, updateFn = null, damageFn = null,
    // Spawn configuration
    minWave = 1,
    weight = 1,
    isBoss = false,
    groupMin = 1,
    groupMax = 1,
    // Death hook
    onDeathFn = null,
  }) {
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
    // Spawn config
    this.minWave = minWave;
    this.weight = weight;
    this.isBoss = isBoss;
    this.groupMin = groupMin;
    this.groupMax = groupMax;
    // Death hook
    this.onDeathFn = onDeathFn;
  }
}
