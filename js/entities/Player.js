import { Weapon } from '../weapons/Weapon.js';
import { WeaponRegistry } from '../weapons/WeaponRegistry.js';
import { StatBlockFactory } from '../sys/stats/StatBlockFactory.js';
import { STATS } from '../sys/stats/statDefinitions.js';
import { StatModifier } from '../sys/stats/StatModifier.js';
import { EquipmentSlot } from '../sys/traits/EquipmentSlot.js';

export class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.alive = true;
    this.animFrame = 0;
    this.animTimer = 0;
    this.shootAnim = 0;
    this.invincibleTimer = 0;
    this.invincibleDuration = 1.0;

    // StatBlock replaces raw properties
    this.stats = StatBlockFactory.playerDefault();

    this.fireCooldown = 0;
    this.switchCooldown = 0;

    this.level = 1;
    this.xp = 0;
    this.xpToNext = 20;

    // Equipment slots
    this.equipment = new Map();
    for (const slot of ['weapon', 'head', 'body', 'accessory']) {
      this.equipment.set(slot, null);
    }

    // Weapon inventory
    this.inventory = [];
    this.currentWeapon = 0;

    // Start with pistol
    this.inventory.push(new Weapon('pistol'));
  }

  get size() { return this.stats.get(STATS.SIZE); }
  get speed() { return this.stats.get(STATS.SPEED); }
  get maxHp() { return this.stats.get(STATS.MAX_HP); }
  get hp() { return this.stats.get(STATS.HP); }

  get weapon() {
    return this.inventory[this.currentWeapon] || null;
  }

  equip(equipment) {
    if (!equipment) return false;
    const slot = equipment.slot;
    const old = this.equipment.get(slot);

    // Remove old equipment + trait modifiers
    if (old) {
      this.stats.removeModifiersFromSource(`equip:${old.id}`);
    }

    // Apply new equipment modifiers
    for (const [statName, modifierData] of Object.entries(equipment.statModifiers)) {
      this.stats.addModifier(statName, new StatModifier({
        type: modifierData.type || 'add',
        value: modifierData.value || modifierData,
        source: `equip:${equipment.id}`
      }));
    }

    // Apply trait stat modifiers from equipment's traits
    if (equipment.traits) {
      for (const trait of equipment.traits) {
        if (trait && trait.statModifiers) {
          for (const [statName, modifierData] of Object.entries(trait.statModifiers)) {
            this.stats.addModifier(statName, new StatModifier({
              type: modifierData.type || 'add',
              value: modifierData.value || modifierData,
              source: `equip:${equipment.id}`
            }));
          }
        }
      }
    }

    this.equipment.set(slot, equipment);
    return true;
  }

  unequip(slot) {
    const old = this.equipment.get(slot);
    if (!old) return false;
    this.stats.removeModifiersFromSource(`equip:${old.id}`);
    this.equipment.set(slot, null);
    return true;
  }

  update(dt, input, canvasW, canvasH) {
    if (!this.alive) return;

    const speed = this.stats.get(STATS.SPEED);
    const dir = input.moveDir;
    this.x += dir.dx * speed * dt;
    this.y += dir.dy * speed * dt;

    const margin = this.size;
    this.x = Math.max(margin, Math.min(canvasW - margin, this.x));
    this.y = Math.max(margin, Math.min(canvasH - margin, this.y));

    if (dir.dx !== 0 || dir.dy !== 0) {
      this.animTimer += dt;
      if (this.animTimer > 0.15) {
        this.animTimer = 0;
        this.animFrame = (this.animFrame + 1) % 4;
      }
    } else {
      this.animFrame = 0;
      this.animTimer = 0;
    }

    if (this.invincibleTimer > 0) this.invincibleTimer -= dt;
    if (this.shootAnim > 0) this.shootAnim -= dt;
    if (this.fireCooldown > 0) this.fireCooldown -= dt;
    if (this.switchCooldown > 0) this.switchCooldown -= dt;
  }

  getAimAngle() {
    return Math.atan2(
      (window.Input && window.Input.mouseY || 0) - this.y,
      (window.Input && window.Input.mouseX || 0) - this.x
    );
  }

  tryShoot(input, worldState) {
    if (!this.alive) return false;

    const weapon = this.weapon;
    if (!weapon) return false;

    // Spinner auto-fire handled by Game loop
    if (weapon.special === 'spinner') {
      weapon.updateSpinner(this, worldState, 0.016);
      return 'spinner';
    }

    if (this.fireCooldown > 0) return false;

    const mouseAngle = this.getAimAngle();

    // Allow behavior to know player's aim angle
    this.aimAngle = mouseAngle;

    const result = weapon.fire(this, worldState);
    const fireRateMult = this.stats.get(STATS.FIRE_RATE);
    this.fireCooldown = weapon.fireRate * fireRateMult;
    this.shootAnim = weapon.special === 'laser' ? 0.05 : 0.08;

    return { angle: mouseAngle, result };
  }

  takeDamage(dmg) {
    if (this.invincibleTimer > 0) return false;
    const currentHp = this.stats.get(STATS.HP);
    const newHp = Math.max(0, currentHp - dmg);
    this.stats.setBase(STATS.HP, newHp);
    this.invincibleTimer = this.invincibleDuration;
    if (newHp <= 0) {
      this.stats.setBase(STATS.HP, 0);
      this.alive = false;
    }
    return true;
  }

  heal(amount) {
    const maxHp = this.stats.get(STATS.MAX_HP);
    const currentHp = this.stats.get(STATS.HP);
    const healAmount = Math.min(amount, maxHp - currentHp);
    this.stats.setBase(STATS.HP, currentHp + healAmount);
    return healAmount;
  }

  addXp(amount) {
    this.xp += amount;
    if (this.xp >= this.xpToNext) {
      this.xp -= this.xpToNext;
      this.level++;
      this.xpToNext = Math.floor(this.xpToNext * 1.25 + 5);
      return true;
    }
    return false;
  }

  pickupWeapon(weaponId) {
    const existing = this.inventory.find(w => w.id === weaponId);
    if (existing) {
      if (existing.upgrade()) {
        return { type: 'upgrade', msg: `Weapon Upgrade: ${existing.name} Lv.${existing.level}` };
      }
      return { type: 'none', msg: null };
    }

    if (this.inventory.length < 4) {
      const newWpn = new Weapon(weaponId);
      this.inventory.push(newWpn);
      this.currentWeapon = this.inventory.length - 1;
      return { type: 'new', msg: `New Weapon: ${newWpn.name}` };
    }

    return { type: 'replace', weaponId };
  }

  replaceWeapon(index, weaponId) {
    if (index < 0 || index >= this.inventory.length) return false;
    this.inventory[index] = new Weapon(weaponId);
    this.currentWeapon = index;
    return true;
  }

  getUpgradeOptions(count = 3, equipmentPool = []) {

    const statUpgrades = [
      { id: 'speed', name: 'Speed', desc: 'Speed +10%', icon: '>' },
      { id: 'damageAll', name: 'All Weapon Damage', desc: 'All weapons +15% dmg', icon: '!' },
      { id: 'maxHp', name: 'HP Boost', desc: 'Max HP +20', icon: '+' },
      { id: 'fireRateAll', name: 'All Weapon Fire Rate', desc: 'All weapons +10% fire rate', icon: '>>' },
    ];

    const weaponOptions = WeaponRegistry.getAllIds()
      .filter(id => id !== 'pistol' && !this.inventory.find(w => w.id === id))
      .map(id => {
        const data = WeaponRegistry.get(id);
        return {
          id: `weapon_${id}`,
          name: data ? data.name : id,
          desc: `New Weapon: ${data ? data.description : ''}`,
          icon: data ? data.icon : '?',
          weaponId: id
        };
      });

    const upgradableWeapons = this.inventory
      .filter(w => w.level < w.maxLevel && w.id !== 'pistol')
      .map(w => ({
        id: `upgrade_${w.id}`,
        name: `${w.name} Upgrade`,
        desc: `Lv.${w.level} → Lv.${w.level + 1}`,
        icon: '⬆',
        weaponId: w.id,
        isWeaponUpgrade: true
      }));

    // Equipment options for empty slots
    const emptySlots = [];
    for (const [slot, equipped] of this.equipment) {
      if (slot !== 'weapon' && !equipped) emptySlots.push(slot);
    }
    const equipmentOptions = equipmentPool
      .filter(eq => emptySlots.includes(eq.slot))
      .map(eq => ({
        id: `equip_${eq.id}`,
        name: eq.name,
        desc: `Equip ${eq.name} [${eq.slot}]`,
        icon: eq.icon || '◆',
        equipmentData: eq,
        isEquipment: true
      }));

    const allOptions = [];
    const pool = [];

    if (weaponOptions.length > 0) pool.push({ type: 'weapon', items: [...weaponOptions] });
    if (upgradableWeapons.length > 0) pool.push({ type: 'upgrade', items: [...upgradableWeapons] });
    if (equipmentOptions.length > 0) pool.push({ type: 'equipment', items: [...equipmentOptions] });
    pool.push({ type: 'stat', items: [...statUpgrades] });

    const hasEquip = equipmentOptions.length > 0;
    const weaponWeight = this.level < 5 ? 0.5 : 0.3;
    const upgradeWeight = upgradableWeapons.length > 0 ? 0.3 : 0;
    const equipWeight = hasEquip ? 0.15 : 0;
    const statWeight = 1 - weaponWeight - upgradeWeight - equipWeight;

    const weights = [];
    if (weaponOptions.length > 0) weights.push({ weight: weaponWeight, items: weaponOptions });
    if (upgradableWeapons.length > 0) weights.push({ weight: upgradeWeight, items: upgradableWeapons });
    if (equipmentOptions.length > 0) weights.push({ weight: equipWeight, items: equipmentOptions });
    weights.push({ weight: statWeight, items: statUpgrades });

    const usedPoolItems = new Map();
    usedPoolItems.set('weapon', [...weaponOptions]);
    usedPoolItems.set('upgrade', [...upgradableWeapons]);
    usedPoolItems.set('equipment', [...equipmentOptions]);
    usedPoolItems.set('stat', [...statUpgrades]);

    for (let i = 0; i < count; i++) {
      let chosen = null;
      let attempts = 0;
      while (!chosen && attempts < 20) {
        const category = this._weightedRandom(weights);
        const items = usedPoolItems.get(category.type);
        if (!items || items.length === 0) { attempts++; continue; }
        const idx = Math.floor(Math.random() * items.length);
        const pick = items.splice(idx, 1)[0];
        if (pick && !allOptions.find(o => o.id === pick.id)) {
          chosen = pick;
        }
        attempts++;
      }
      if (chosen) allOptions.push(chosen);
    }

    while (allOptions.length < count) {
      const pick = statUpgrades.find(s => !allOptions.find(o => o.id === s.id));
      if (pick) allOptions.push(pick);
      else break;
    }

    return allOptions;
  }

  _weightedRandom(weights) {
    const total = weights.reduce((s, w) => s + w.weight, 0);
    let r = Math.random() * total;
    for (const w of weights) {
      r -= w.weight;
      if (r <= 0) return w;
    }
    return weights[weights.length - 1];
  }

  applyUpgrade(option) {
    if (option.isEquipment) {
      this.equip(option.equipmentData);
      return { type: 'equipment', name: option.name };
    }

    if (option.weaponId && option.isWeaponUpgrade) {
      const weapon = this.inventory.find(w => w.id === option.weaponId);
      if (weapon) weapon.upgrade();
      return null;
    }

    if (option.weaponId) {
      return this.pickupWeapon(option.weaponId);
    }

    // Stat upgrades now use StatModifier system
    switch (option.id) {
      case 'speed':
        this.stats.addModifier(STATS.SPEED, new StatModifier({
          type: 'multiply', value: 1.1, source: 'upgrade:speed'
        }));
        break;
      case 'damageAll':
        // Add a global damage bonus to all physical types
        const dmgTypes = ['physical', 'collision', 'penetration', 'fire', 'ice', 'lightning', 'poison', 'mental'];
        for (const typeId of dmgTypes) {
          this.stats.addModifier(`damage_bonus_${typeId}`, new StatModifier({
            type: 'add', value: 0.15, source: 'upgrade:damageAll'
          }));
        }
        break;
      case 'maxHp':
        const oldMax = this.stats.get(STATS.MAX_HP);
        this.stats.setBase(STATS.MAX_HP, oldMax + 20);
        // Heal for the HP increase
        const currentHp = this.stats.get(STATS.HP);
        this.stats.setBase(STATS.HP, Math.min(currentHp + 20, oldMax + 20));
        break;
      case 'fireRateAll':
        this.stats.addModifier(STATS.FIRE_RATE, new StatModifier({
          type: 'multiply', value: 0.9, source: 'upgrade:fireRateAll'
        }));
        break;
    }
    return null;
  }

  getAngleToMouse(mouseX, mouseY) {
    return Math.atan2(mouseY - this.y, mouseX - this.x);
  }

  draw(ctx, mouseX, mouseY) {
    if (!this.alive) return;

    ctx.save();

    if (this.invincibleTimer > 0 && Math.floor(this.invincibleTimer * 10) % 2 === 0) {
      ctx.globalAlpha = 0.4;
    }

    const s = this.size;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(this.x, this.y + s, s * 0.8, s * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.fillStyle = '#3498db';
    ctx.strokeStyle = 'rgba(0,0,0,0.4)';
    ctx.lineWidth = 1.5;

    // Head
    ctx.beginPath();
    ctx.arc(this.x, this.y - s * 0.4, s * 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Body rect
    ctx.fillStyle = '#2980b9';
    ctx.fillRect(this.x - s * 0.5, this.y - s * 0.1, s, s * 0.8);
    ctx.strokeRect(this.x - s * 0.5, this.y - s * 0.1, s, s * 0.8);

    // Legs
    ctx.fillStyle = '#1a5276';
    const legW = s * 0.35;
    const legH = s * 0.5;
    const legOffset = s * 0.3;
    const walkCycle = Math.sin(this.animFrame * Math.PI / 2) * 2;
    ctx.fillRect(this.x - legOffset - legW / 2, this.y + s * 0.6, legW, legH + walkCycle);
    ctx.fillRect(this.x + legOffset - legW / 2, this.y + s * 0.6, legW, legH - walkCycle);

    // Eyes
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(this.x - 2.5, this.y - s * 0.45, 2, 0, Math.PI * 2);
    ctx.arc(this.x + 2.5, this.y - s * 0.45, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#2c3e50';
    ctx.beginPath();
    ctx.arc(this.x - 2, this.y - s * 0.45, 1, 0, Math.PI * 2);
    ctx.arc(this.x + 3, this.y - s * 0.45, 1, 0, Math.PI * 2);
    ctx.fill();

    // Gun
    const weapon = this.weapon;
    if (weapon && weapon.special !== 'spinner') {
      const angle = this.getAngleToMouse(mouseX, mouseY);
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(angle);

      const gunLen = s + 6;
      const gunW = 3.5;
      const weaponColors = {
        'pistol': { body: '#7f8c8d', tip: '#95a5a6' },
        'dual': { body: '#7f8c8d', tip: '#95a5a6' },
        'shotgun': { body: '#8e44ad', tip: '#9b59b6' },
        'quad': { body: '#27ae60', tip: '#2ecc71' },
        'laser': { body: '#c0392b', tip: '#e74c3c' },
        'sniper': { body: '#2c3e50', tip: '#34495e' },
        'bomb': { body: '#d35400', tip: '#e67e22' },
      };
      const colors = weaponColors[weapon.id] || { body: '#7f8c8d', tip: '#95a5a6' };

      ctx.fillStyle = colors.body;
      ctx.fillRect(2, -gunW / 2, gunLen, gunW);
      ctx.fillStyle = colors.tip;
      ctx.fillRect(gunLen - 2, -gunW / 2 - 0.5, 4, gunW + 1);

      if (this.shootAnim > 0) {
        ctx.fillStyle = '#f1c40f';
        ctx.shadowColor = '#f39c12';
        ctx.shadowBlur = 10;
        ctx.fillRect(gunLen, -3, 5 + this.shootAnim * 30, 6);
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#fff';
        ctx.fillRect(gunLen + 1, -2, 3 + this.shootAnim * 20, 4);
      }

      ctx.restore();
    }

    ctx.restore();
  }
}
