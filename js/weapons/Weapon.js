import { WEAPON_DEFINITIONS } from './WeaponData.js';
import { WeaponRegistry } from './WeaponRegistry.js';

export class Weapon {
  constructor(id) {
    const data = WEAPON_DEFINITIONS[id];
    if (!data) throw new Error(`Unknown weapon: ${id}`);
    this.id = id;
    this.name = data.name;
    this.icon = data.icon;
    this.description = data.description;
    this.damageProfile = data.damageProfile;
    this.levels = data.levels;
    this.level = 1;
    this.maxLevel = data.levels.length;

    this.angle = 0;
    this.laserTimer = 0;
    this.laserAngle = 0;
    this.laserOrigin = { x: 0, y: 0 };
    this.laserEndX = 0;
    this.laserEndY = 0;
  }

  get stats() { return this.levels[this.level - 1]; }
  get damage() { return this.stats.damage; }
  get fireRate() { return this.stats.fireRate; }
  get bulletSpeed() { return this.stats.bulletSpeed; }
  get special() { return this.stats.special; }

  createDamageInstance() {
    return this.damageProfile.createInstance(this.stats.damage);
  }

  upgrade() {
    if (this.level < this.maxLevel) {
      this.level++;
      return true;
    }
    return false;
  }

  fire(owner, worldState) {
    const specialKey = this.special || null;
    const BehaviorClass = WeaponRegistry.getBehavior(specialKey);
    if (!BehaviorClass) return null;
    const behavior = new BehaviorClass();
    return behavior.fire(this, owner, worldState);
  }

  updateSpinner(owner, worldState, dt) {
    if (this.special !== 'spinner') return;
    const BehaviorClass = WeaponRegistry.getBehavior('spinner');
    if (!BehaviorClass) return;
    const behavior = new BehaviorClass();
    behavior.update(this, owner, worldState, dt);
  }

  getOrbitPositions(owner) {
    if (this.special !== 'spinner') return [];
    const BehaviorClass = WeaponRegistry.getBehavior('spinner');
    if (!BehaviorClass) return [];
    const behavior = new BehaviorClass();
    behavior.angle = this.angle;
    return behavior.getOrbitPositions(this, owner);
  }

  drawLaser(ctx) {
    if (this.laserTimer <= 0) return;
    const ox = this.laserOrigin.x;
    const oy = this.laserOrigin.y;
    const ex = this.laserEndX;
    const ey = this.laserEndY;

    ctx.strokeStyle = 'rgba(255, 50, 50, 0.3)';
    ctx.lineWidth = 12;
    ctx.shadowColor = '#ff0000';
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(ex, ey);
    ctx.stroke();

    ctx.strokeStyle = '#ff4444';
    ctx.lineWidth = 4;
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(ex, ey);
    ctx.stroke();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(ex, ey);
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.lineWidth = 1;

    this.laserTimer -= 0.02;
  }
}
