class HUD {
    constructor() {
        this.hpFill = document.getElementById('hp-bar-fill');
        this.hpText = document.getElementById('hp-text');
        this.xpFill = document.getElementById('xp-bar-fill');
        this.xpText = document.getElementById('xp-text');
        this.waveDisplay = document.getElementById('wave-display');
        this.scoreDisplay = document.getElementById('score-display');
    }

    update(player, wave, score, stage) {
        // HP
        const hpPct = Math.max(0, (player.hp / player.maxHp) * 100);
        this.hpFill.style.width = hpPct + '%';
        this.hpText.textContent = `${Math.ceil(player.hp)}/${player.maxHp}`;

        // XP
        const xpPct = player.xpToNext > 0 ? (player.xp / player.xpToNext) * 100 : 0;
        this.xpFill.style.width = Math.min(100, xpPct) + '%';
        this.xpText.textContent = `Lv.${player.level}`;

        // Wave & Stage
        this.waveDisplay.textContent = `STAGE ${stage} · WAVE ${wave}`;

        // Score
        this.scoreDisplay.textContent = `SCORE: ${score}`;

        // Weapon display
        this.updateWeaponDisplay(player);
    }

    updateWeaponDisplay(player) {
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
