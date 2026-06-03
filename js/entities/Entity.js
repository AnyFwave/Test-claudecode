export class Entity {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
    this.alive = true;
    this.stats = null;
    this.statusEffects = null;
    this.equipment = null;
  }

  update(dt) {}

  draw(ctx) {}

  takeDamage(dmg) {
    if (!this.stats) return false;
    const hp = this.stats.get('hp');
    if (hp <= 0) return false;
    const newHp = Math.max(0, hp - dmg);
    this.stats.setBase('hp', newHp);
    if (newHp <= 0) {
      this.alive = false;
      this.stats.setBase('hp', 0);
      return true;
    }
    return false;
  }

  heal(amount) {
    if (!this.stats) return 0;
    const maxHp = this.stats.get('max_hp');
    const currentHp = this.stats.get('hp');
    const healAmount = Math.min(amount, maxHp - currentHp);
    this.stats.setBase('hp', currentHp + healAmount);
    return healAmount;
  }
}
