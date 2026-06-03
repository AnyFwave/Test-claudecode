export class ConditionEvaluator {
  static evaluate(entity, eventName, context, worldState) {
    if (!entity || !entity.equipment) return;

    const allTraits = [];
    for (const equip of entity.equipment.values()) {
      if (equip && equip.traits) {
        allTraits.push(...equip.traits);
      }
    }

    for (const trait of allTraits) {
      for (const condition of trait.conditions) {
        if (condition.event === eventName) {
          condition.evaluate(context, worldState);
        }
      }
    }
  }
}
