class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.speed = 200;
        this.maxHp = 100;
        this.hp = 100;
        this.damage = 10; // fallback
        this.fireRate = 0.3; // fallback
        this.fireCooldown = 0;

        this.level = 1;
        this.xp = 0;
        this.xpToNext = 20;

        this.alive = true;
        this.invincibleTimer = 0;
        this.invincibleDuration = 1.0;

        this.animFrame = 0;
        this.animTimer = 0;
        this.shootAnim = 0;
        this.size = 12;

        // === Weapon System ===
        this.inventory = [];      // Array of Weapon objects, max 4
        this.currentWeapon = 0;   // Index into inventory
        this.switchCooldown = 0;

        // Start with pistol
        this.inventory.push(new Weapon('pistol'));
    }

    get weapon() {
        return this.inventory[this.currentWeapon] || null;
    }

    update(dt, input, canvasW, canvasH) {
        if (!this.alive) return;

        const dir = input.moveDir;
        this.x += dir.dx * this.speed * dt;
        this.y += dir.dy * this.speed * dt;

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

    tryShoot(input, bullets, enemies, particles) {
        if (!this.alive) return false;

        const weapon = this.weapon;
        if (!weapon) return false;

        // Different cooldown for spinner (auto)
        if (weapon.special === 'spinner') {
            weapon.updateSpinner(this, bullets, 0.016, enemies);
            return 'spinner';
        }

        if (this.fireCooldown > 0) return false;

        const mouseAngle = Math.atan2(
            input.mouseY - this.y,
            input.mouseX - this.x
        );

        if (weapon.special === 'laser') {
            const deadEnemies = weapon.fire(this, bullets, enemies, mouseAngle, particles);
            this.fireCooldown = weapon.fireRate;
            this.shootAnim = 0.05;
            return { angle: mouseAngle, deadEnemies: deadEnemies || [] };
        }

        weapon.fire(this, bullets, enemies, mouseAngle, particles);
        this.fireCooldown = weapon.fireRate;
        this.shootAnim = 0.08;

        return mouseAngle;
    }

    updateWeaponSpinners(bullets, dt, enemies) {
        const weapon = this.weapon;
        if (weapon && weapon.special === 'spinner') {
            weapon.updateSpinner(this, bullets, dt, enemies);
        }
    }

    takeDamage(dmg) {
        if (this.invincibleTimer > 0) return false;
        this.hp -= dmg;
        this.invincibleTimer = this.invincibleDuration;
        if (this.hp <= 0) {
            this.hp = 0;
            this.alive = false;
        }
        return true;
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

    // Pick up a weapon pickup
    pickupWeapon(weaponId) {
        // Check if already have this weapon
        const existing = this.inventory.find(w => w.id === weaponId);
        if (existing) {
            // Upgrade it if possible
            if (existing.upgrade()) {
                return { type: 'upgrade', msg: `武器升级: ${existing.name} Lv.${existing.level}` };
            }
            return { type: 'none', msg: null }; // Already max level
        }

        // New weapon - add to inventory if space
        if (this.inventory.length < 4) {
            const newWpn = new Weapon(weaponId);
            this.inventory.push(newWpn);
            this.currentWeapon = this.inventory.length - 1;
            return { type: 'new', msg: `获得新武器: ${newWpn.name}` };
        }

        // Inventory full - signal to show replace UI
        return { type: 'replace', weaponId: weaponId };
    }

    // Replace weapon at specific index
    replaceWeapon(index, weaponId) {
        if (index < 0 || index >= this.inventory.length) return false;
        this.inventory[index] = new Weapon(weaponId);
        this.currentWeapon = index;
        return true;
    }

    // Heal pickup
    heal(amount) {
        const before = this.hp;
        this.hp = Math.min(this.hp + amount, this.maxHp);
        return this.hp - before;
    }

    getUpgradeOptions(count = 3) {
        const statUpgrades = [
            { id: 'speed', name: '移动速度', desc: '速度 +10%', icon: '>' },
            { id: 'damageAll', name: '全武器伤害', desc: '所有武器伤害 +15%', icon: '!' },
            { id: 'maxHp', name: '生命强化', desc: '最大生命 +20', icon: '+' },
            { id: 'fireRateAll', name: '全武器射速', desc: '所有武器射速 +10%', icon: '>>' },
        ];

        // Weapon upgrades - weapons the player doesn't have yet
        const weaponOptions = Object.keys(WEAPON_DATA)
            .filter(id => id !== 'pistol' && !this.inventory.find(w => w.id === id))
            .map(id => ({
                id: `weapon_${id}`,
                name: WEAPON_DATA[id].name,
                desc: `获得新武器: ${WEAPON_DATA[id].description}`,
                icon: WEAPON_DATA[id].icon,
                weaponId: id
            }));

        // Upgrade existing weapon
        const upgradableWeapons = this.inventory
            .filter(w => w.level < w.maxLevel && w.id !== 'pistol') // pistol upgrades are stat upgrades
            .map(w => ({
                id: `upgrade_${w.id}`,
                name: `${w.name} 升级`,
                desc: `Lv.${w.level} → Lv.${w.level + 1}`,
                icon: '⬆',
                weaponId: w.id,
                isWeaponUpgrade: true
            }));

        // Combine: 40% chance weapon/new, 30% weapon upgrade, 30% stat
        const allOptions = [];
        const pool = [];

        // Always include at least one weapon-related option
        if (weaponOptions.length > 0) {
            pool.push({ type: 'weapon', items: weaponOptions });
        }
        if (upgradableWeapons.length > 0) {
            pool.push({ type: 'upgrade', items: upgradableWeapons });
        }
        pool.push({ type: 'stat', items: statUpgrades });

        // Weighted selection
        const weights = [];
        // Give weapon options more weight early
        const weaponWeight = this.level < 5 ? 0.5 : 0.3;
        const upgradeWeight = upgradableWeapons.length > 0 ? 0.3 : 0;
        const statWeight = 1 - weaponWeight - upgradeWeight;

        if (weaponOptions.length > 0) weights.push({ weight: weaponWeight, items: weaponOptions });
        if (upgradableWeapons.length > 0) weights.push({ weight: upgradeWeight, items: upgradableWeapons });
        weights.push({ weight: statWeight, items: statUpgrades });

        for (let i = 0; i < count; i++) {
            let chosen = null;
            let attempts = 0;
            while (!chosen && attempts < 20) {
                const category = this.weightedRandom(weights);
                const pool = category.items;
                if (pool.length === 0) { attempts++; continue; }
                const pick = pool.splice(Math.floor(Math.random() * pool.length), 1)[0];
                if (pick && !allOptions.find(o => o.id === pick.id)) {
                    chosen = pick;
                }
                attempts++;
            }
            if (chosen) allOptions.push(chosen);
        }

        // Fallback: fill with stats
        while (allOptions.length < count && statUpgrades.length > 0) {
            const pick = statUpgrades.splice(Math.floor(Math.random() * statUpgrades.length), 1)[0];
            if (!allOptions.find(o => o.id === pick.id)) allOptions.push(pick);
        }

        return allOptions;
    }

    weightedRandom(weights) {
        const total = weights.reduce((s, w) => s + w.weight, 0);
        let r = Math.random() * total;
        for (const w of weights) {
            r -= w.weight;
            if (r <= 0) return w;
        }
        return weights[weights.length - 1];
    }

    applyUpgrade(option) {
        if (option.weaponId && option.isWeaponUpgrade) {
            // Upgrade existing weapon
            const weapon = this.inventory.find(w => w.id === option.weaponId);
            if (weapon) weapon.upgrade();
            return null;
        }

        if (option.weaponId) {
            // New weapon — return the result so caller can handle 'replace'
            return this.pickupWeapon(option.weaponId);
        }

        // Stat upgrades
        switch (option.id) {
            case 'speed':
                this.speed *= 1.1;
                break;
            case 'damageAll':
                for (const w of this.inventory) {
                    for (const lvl of w.levels) {
                        lvl.damage = Math.floor(lvl.damage * 1.15);
                    }
                }
                break;
            case 'maxHp':
                this.maxHp += 20;
                this.hp = Math.min(this.hp + 20, this.maxHp);
                break;
            case 'fireRateAll':
                for (const w of this.inventory) {
                    for (const lvl of w.levels) {
                        lvl.fireRate *= 0.9;
                    }
                }
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

        // Body rectangle
        ctx.fillStyle = '#2980b9';
        ctx.fillRect(this.x - s * 0.5, this.y - s * 0.1, s, s * 0.8);
        ctx.strokeRect(this.x - s * 0.5, this.y - s * 0.1, s, s * 0.8);

        // Legs
        ctx.fillStyle = '#1a5276';
        const legW = s * 0.35;
        const legH = s * 0.5;
        const legOffset = s * 0.3;
        const walkCycle = Math.sin(this.animFrame * Math.PI / 2) * 2;
        ctx.fillRect(this.x - legOffset - legW/2, this.y + s * 0.6, legW, legH + walkCycle);
        ctx.fillRect(this.x + legOffset - legW/2, this.y + s * 0.6, legW, legH - walkCycle);

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

        // Gun - uses current weapon
        const weapon = this.weapon;
        if (weapon && weapon.special !== 'spinner') {
            const angle = this.getAngleToMouse(mouseX, mouseY);
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(angle);

            const gunLen = s + 6;
            const gunW = 3.5;

            // Draw weapon-specific gun
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

            // Muzzle flash
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
