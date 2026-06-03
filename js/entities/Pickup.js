import { WeaponRegistry } from '../weapons/WeaponRegistry.js';

export class Pickup {
  constructor(x, y, type, data = null) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.weaponId = (type === 'weapon') ? data : null;
    this.equipmentData = (type === 'equipment') ? data : null;
    this.radius = 12;
    this.alive = true;
    this.lifetime = 8;
    this.blinkTimer = 0;
    this.bobOffset = Math.random() * Math.PI * 2;
  }

  update(dt) {
    this.blinkTimer += dt;
    this.lifetime -= dt;
    if (this.lifetime <= 0) this.alive = false;
  }

  get bobY() {
    return Math.sin(this.blinkTimer * 3 + this.bobOffset) * 3;
  }

  canPickup(px, py) {
    const dx = px - this.x;
    const dy = py - this.y;
    return Math.sqrt(dx * dx + dy * dy) < this.radius + 18;
  }

  draw(ctx) {
    const y = this.y + this.bobY;
    const blinking = this.lifetime < 2;

    ctx.save();

    if (blinking && Math.floor(this.blinkTimer * 5) % 2 === 0) {
      ctx.globalAlpha = 0.4;
    }

    if (this.type === 'weapon') {
      this._drawWeapon(ctx, y);
    } else if (this.type === 'health') {
      this._drawHealth(ctx, y);
    } else if (this.type === 'equipment') {
      this._drawEquipment(ctx, y);
    }

    ctx.restore();
  }

  _drawWeapon(ctx, y) {
    const r = this.radius;

    // Glow
    ctx.fillStyle = 'rgba(241, 196, 15, 0.3)';
    ctx.shadowColor = '#f1c40f';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(this.x, y, r + 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Circle
    ctx.fillStyle = '#f1c40f';
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(this.x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.lineWidth = 1;

    // Icon
    const config = WeaponRegistry.get(this.weaponId);
    const icon = config ? config.icon : '?';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#fff';
    ctx.fillText(icon, this.x, y);

    // Label
    const name = config ? config.name : (this.weaponId || '?');
    ctx.font = '9px monospace';
    ctx.fillStyle = '#fff';
    ctx.fillText(name, this.x, y - r - 8);
  }

  _drawEquipment(ctx, y) {
    const r = this.radius;
    const eq = this.equipmentData;

    // Glow
    ctx.fillStyle = 'rgba(155, 89, 182, 0.3)';
    ctx.shadowColor = '#9b59b6';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(this.x, y, r + 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Diamond shape
    ctx.fillStyle = '#9b59b6';
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(this.x, y - r);
    ctx.lineTo(this.x + r, y);
    ctx.lineTo(this.x, y + r);
    ctx.lineTo(this.x - r, y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.lineWidth = 1;

    // Slot icon
    const slotIcons = { head: '⛑', body: '🛡', accessory: '💍' };
    const icon = slotIcons[eq.slot] || '◆';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#fff';
    ctx.fillText(icon, this.x, y);

    // Label
    ctx.font = '9px monospace';
    ctx.fillStyle = '#fff';
    ctx.fillText(eq.name || 'Equipment', this.x, y - r - 8);
  }

  _drawHealth(ctx, y) {
    const r = this.radius;

    // Glow
    ctx.fillStyle = 'rgba(46, 204, 113, 0.3)';
    ctx.shadowColor = '#2ecc71';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(this.x, y, r + 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Circle
    ctx.fillStyle = '#2ecc71';
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(this.x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.lineWidth = 1;

    // Cross
    ctx.fillStyle = '#fff';
    const crossW = 3;
    const crossH = 10;
    ctx.fillRect(this.x - crossW / 2, y - crossH / 2, crossW, crossH);
    ctx.fillRect(this.x - crossH / 2, y - crossW / 2, crossH, crossW);

    // Label
    ctx.font = '9px monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff';
    ctx.fillText('HP+25', this.x, y - r - 8);
  }
}
