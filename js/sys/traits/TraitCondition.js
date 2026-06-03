export class TraitCondition {
  constructor({ event, predicate = null, effect }) {
    this.event = event;
    this.predicate = predicate || (() => true);
    this.effect = effect;
  }

  evaluate(context, worldState) {
    if (this.predicate(context)) {
      this.effect(context, worldState);
      return true;
    }
    return false;
  }
}
