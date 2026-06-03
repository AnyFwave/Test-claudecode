export class HUD {
  constructor() {
    this.hpFill = document.getElementById('hp-bar-fill');
    this.hpText = document.getElementById('hp-text');
    this.xpFill = document.getElementById('xp-bar-fill');
    this.xpText = document.getElementById('xp-text');
    this.waveDisplay = document.getElementById('wave-display');
    this.scoreDisplay = document.getElementById('score-display');
  }

  update(player, wave, score, stage) {
    if (!player) return;

    const hp = player.hp;
    const maxHp = player.maxHp;
    const hpPct = Math.max(0, (hp / maxHp) * 100);
    this.hpFill.style.width = hpPct + '%';
    this.hpText.textContent = `${Math.ceil(hp)}/${maxHp}`;

    const xpPct = player.xpToNext > 0 ? (player.xp / player.xpToNext) * 100 : 0;
    this.xpFill.style.width = Math.min(100, xpPct) + '%';
    this.xpText.textContent = `Lv.${player.level}`;

    this.waveDisplay.textContent = `STAGE ${stage} · WAVE ${wave}`;
    this.scoreDisplay.textContent = `SCORE: ${score}`;

    this._updateWeaponDisplay(player);
    this._updateEquipmentDisplay(player);
  }

  _updateEquipmentDisplay(player) {
    let container = document.getElementById('equipment-hud');
    if (!container) {
      container = document.createElement('div');
      container.id = 'equipment-hud';
      document.getElementById('hud').appendChild(container);
    }

    const slotOrder = ['head', 'body', 'accessory'];
    const slotIcons = { head: '⛑', body: '🛡', accessory: '💍' };
    let html = '';
    for (const slot of slotOrder) {
      const eq = player.equipment.get(slot);
      const icon = eq ? eq.icon || slotIcons[slot] : slotIcons[slot];
      const name = eq ? eq.name : 'Empty';
      const cls = eq ? 'equipped' : 'empty';
      html += `<div class="equip-slot ${cls}">
        <span class="equip-icon">${icon}</span>
        <span class="equip-name">${name}</span>
      </div>`;
    }
    container.innerHTML = html;
  }

  _updateWeaponDisplay(player) {
    let container = document.getElementById('weapon-hud');
    if (!container) {
      container = document.createElement('div');
      container.id = 'weapon-hud';
      document.getElementById('hud').appendChild(container);
    }

    let html = '';
    player.inventory.forEach((w, i) => {
      const active = i === player.currentWeapon ? 'active' : '';
      const stars = '★'.repeat(w.level) + '☆'.repeat(w.maxLevel - w.level);
      html += `<div class="weapon-slot ${active}" data-index="${i}">
        <span class="weapon-key">${i + 1}</span>
        <span class="weapon-icon">${w.icon}</span>
        <span class="weapon-name">${w.name}</span>
        <span class="weapon-level">${stars}</span>
      </div>`;
    });
    container.innerHTML = html;
  }
}
