export class FireBehavior {
  fire(weapon, owner, worldState) {
    throw new Error('FireBehavior.fire() must be implemented by subclass');
  }
}
