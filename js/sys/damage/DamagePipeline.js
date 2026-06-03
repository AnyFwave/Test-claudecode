import { DamageResult } from './DamageResult.js';

export class DamagePipeline {
  static calculate(source, target, damageInstance) {
    let totalFinal = 0;
    let totalRaw = 0;
    let totalMitigated = 0;
    const breakdown = [];
    const flags = [];

    const sourceStats = source.stats;
    const targetStats = target.stats;

    for (const { type, rawValue } of damageInstance.getDamageByType()) {
      totalRaw += rawValue;

      const resistance = targetStats.get(`resistance_${type.typeId}`);
      const vulnerability = targetStats.get(`vulnerability_${type.typeId}`);

      let armorReduction = 0;
      if (type.isType('physical')) {
        const armor = targetStats.get('armor');
        const pen = sourceStats.get('armor_penetration');
        armorReduction = Math.max(0, armor * (1 - pen));
      }

      const damageBonus = sourceStats.get(`damage_bonus_${type.typeId}`);

      let effectiveResist = resistance - vulnerability;
      effectiveResist = Math.max(-1, Math.min(1, effectiveResist));

      let afterResist = rawValue * (1 - effectiveResist);
      afterResist = Math.max(0, afterResist - armorReduction);

      let afterBonus = afterResist * (1 + damageBonus);

      if (type.modifiers.weaknessMultiplier && effectiveResist < 0) {
        afterBonus *= type.modifiers.weaknessMultiplier;
        flags.push('weakness_hit');
      }

      const critChance = sourceStats.get('critical_chance');
      if (Math.random() < critChance) {
        const critMultiplier = sourceStats.get('critical_multiplier');
        afterBonus *= critMultiplier;
        flags.push('critical');
      }

      const mitigated = rawValue - afterBonus;
      totalMitigated += mitigated;
      totalFinal += afterBonus;

      breakdown.push({ type: type.typeId, rawValue, final: afterBonus, mitigated });

      if (type.onHit) {
        type.onHit(target, { type, rawValue, final: afterBonus });
      }
    }

    return new DamageResult({
      rawDamage: totalRaw,
      finalDamage: Math.max(0, Math.round(totalFinal)),
      mitigated: totalMitigated,
      bonus: totalFinal - (totalRaw - totalMitigated),
      breakdown,
      flags
    });
  }
}
