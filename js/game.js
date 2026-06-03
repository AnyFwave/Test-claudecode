class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        this.state = 'menu';

        this.player = null;
        this.bullets = [];
        this.enemyBullets = []; // bullets shot by snipers
        this.enemies = [];
        this.pickups = [];
        this.explosions = [];
        this.particles = new ParticleSystem();
        this.camera = new Camera();
        this.hud = new HUD();
        this.menu = new MenuManager(this);

        this.wave = 0;
        this.score = 0;
        this.enemiesSpawned = 0;
        this.enemiesPerWave = 0;
        this.spawnTimer = 0;
        this.spawnInterval = 1.2;
        this.waveCountdown = 0;
        this.waveActive = false;

        this.upgradeOptions = [];
        this.notificationText = '';
        this.notificationTimer = 0;

        this.stage = 1;
        this.pendingReplaceWeaponId = null;

        this.resize();
        window.addEventListener('resize', () => this.resize());

        this.menu.showStart();
    }

    resize() {
        const w = document.documentElement.clientWidth;
        const h = document.documentElement.clientHeight;
        this.canvas.width = w;
        this.canvas.height = h;
    }

    start() {
        this.player = new Player(this.canvas.width / 2, this.canvas.height / 2);
        this.bullets = [];
        this.enemyBullets = [];
        this.enemies = [];
        this.pickups = [];
        this.explosions = [];
        this.particles.clear();

        this.wave = 0;
        this.stage = 1;
        this.score = 0;
        this.pendingReplaceWeaponId = null;
        this.state = 'playing';

        this.startNextWave();
    }

    startNextWave() {
        this.wave++;
        this.stage = Math.ceil(this.wave / 5);
        this.waveActive = true;
        this.enemiesSpawned = 0;
        this.enemiesPerWave = 3 + this.wave * 2;
        this.spawnTimer = 0;
        this.spawnInterval = Math.max(0.3, 1.2 - this.wave * 0.03);
        this.menu.announceWave(this.wave);
    }

    update(dt) {
        this.menu.update(dt);

        // Weapon switching
        const weaponKeys = ['1', '2', '3', '4'];
        for (let i = 0; i < weaponKeys.length; i++) {
            if (Input.keys[weaponKeys[i]] || Input.keys['Digit' + weaponKeys[i]]) {
                Input.keys[weaponKeys[i]] = false;
                Input.keys['Digit' + weaponKeys[i]] = false;
                this.switchToWeapon(i);
            }
        }

        if (this.state === 'playing') {
            this.updatePlaying(dt);
        } else if (this.state === 'upgrading' || this.state === 'replacing' || this.state === 'stageComplete') {
            // paused
        } else if (this.state === 'gameover') {
            this.particles.update();
            this.camera.update();
        }

        // Notification
        if (this.notificationTimer > 0) {
            this.notificationTimer -= dt;
        }
    }

    updatePlaying(dt) {
        const player = this.player;
        if (!player) return;

        player.update(dt, Input, this.canvas.width, this.canvas.height);

        // Shooting with current weapon
        if (Input.mouseDown) {
            const result = player.tryShoot(Input, this.bullets, this.enemies, this.particles);
            if (result !== false && result !== 'spinner') {
                // Laser returns {angle, deadEnemies}, normal weapons return number (angle)
                const angle = result.deadEnemies ? result.angle : result;
                this.particles.spark(
                    player.x + Math.cos(angle) * (player.size + 6),
                    player.y + Math.sin(angle) * (player.size + 6)
                );
                // Process laser kills (xp, score, drops)
                if (result.deadEnemies) {
                    for (const enemy of result.deadEnemies) {
                        this.onEnemyDeath(enemy);
                    }
                }
            }
        }

        // Update spinner auto-fire
        if (player.weapon && player.weapon.special === 'spinner') {
            player.updateWeaponSpinners(this.bullets, dt, this.enemies);
        }

        // Player bullets
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const b = this.bullets[i];
            b.update(dt, this.canvas.width, this.canvas.height, 150);
            if (!b.alive) { this.bullets.splice(i, 1); continue; }
        }

        // Enemy bullets (from snipers)
        for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
            const eb = this.enemyBullets[i];
            eb.update(dt, this.canvas.width, this.canvas.height, 50);
            if (!eb.alive) { this.enemyBullets.splice(i, 1); continue; }
            // Hit player
            if (player.alive) {
                const dx = player.x - eb.x;
                const dy = player.y - eb.y;
                if (Math.sqrt(dx*dx + dy*dy) < player.size + eb.radius) {
                    eb.alive = false;
                    if (player.takeDamage(eb.damage || 10)) {
                        this.camera.shake(4);
                        this.particles.spark(player.x, player.y);
                    }
                    this.enemyBullets.splice(i, 1);
                }
            }
        }

        // Enemies
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            enemy.update(dt, player.x, player.y);

            // Sniper shooting
            if (enemy.type === 'sniper' && enemy.alive && enemy.shootTimer <= 0) {
                enemy.shootTimer = enemy.shootCooldown;
                const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
                this.enemyBullets.push(new Bullet(enemy.x, enemy.y, angle, 300, enemy.damage, 'sniper'));
            }

            // Enemy-player collision
            if (enemy.alive && player.alive) {
                const dx = player.x - enemy.x;
                const dy = player.y - enemy.y;
                if (Math.sqrt(dx*dx + dy*dy) < enemy.size + player.size - 2) {
                    if (player.takeDamage(enemy.damage)) {
                        this.camera.shake(6);
                        this.particles.explosion(player.x, player.y, '#e74c3c', false);
                    }
                }
            }

            if (!enemy.alive) this.enemies.splice(i, 1);
        }

        // Bullet-enemy collision
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            if (!bullet.alive) continue;

            for (let j = this.enemies.length - 1; j >= 0; j--) {
                const enemy = this.enemies[j];
                if (!enemy.alive) continue;

                // Check if already hit this enemy (piercing)
                if (bullet.hitEnemies && bullet.hitEnemies.has(enemy)) continue;

                const dx = bullet.x - enemy.x;
                const dy = bullet.y - enemy.y;
                if (Math.sqrt(dx*dx + dy*dy) < enemy.size + bullet.radius) {
                    // Track hits for piercing
                    if (bullet.hitEnemies) bullet.hitEnemies.add(enemy);

                    if (bullet.pierce > 0) {
                        bullet.pierce--;
                        if (bullet.pierce <= 0) bullet.alive = false;
                    } else {
                        bullet.alive = false;
                    }

                    const died = enemy.takeDamage(bullet.damage);
                    this.particles.spark(bullet.x, bullet.y);

                    // Explosive bullet
                    if (bullet.isExplosive) {
                        this.explosions.push(new Explosion(bullet.x, bullet.y, bullet.explodeRadius, bullet.damage * 0.5));
                        this.particles.explosion(bullet.x, bullet.y, '#e74c3c', true);
                    }

                    if (died) {
                        this.onEnemyDeath(enemy);
                    }

                    if (!bullet.alive) break;
                }
            }
        }

        // Explosions
        for (let i = this.explosions.length - 1; i >= 0; i--) {
            const exp = this.explosions[i];
            exp.update(dt);
            exp.damageEnemies(this.enemies, this.particles);
            if (!exp.alive) this.explosions.splice(i, 1);
        }

        // Pickups
        for (let i = this.pickups.length - 1; i >= 0; i--) {
            const p = this.pickups[i];
            p.update(dt);
            if (!p.alive) { this.pickups.splice(i, 1); continue; }
            if (p.canPickup(player.x, player.y)) {
                if (p.type === 'weapon') {
                    const result = player.pickupWeapon(p.weaponId);
                    if (result.type === 'replace') {
                        this.pendingReplaceWeaponId = p.weaponId;
                        this.state = 'replacing';
                        this.menu.showReplace(player.inventory);
                    } else if (result.msg) {
                        this.showNotification(result.msg);
                        this.camera.shake(3);
                    }
                } else if (p.type === 'health') {
                    const healed = player.heal(25);
                    if (healed > 0) {
                        this.showNotification(`+${healed} HP`);
                        this.particles.spark(player.x, player.y);
                    }
                }
                this.pickups.splice(i, 1);
            }
        }

        // Spawn enemies
        if (this.waveActive && this.enemiesSpawned < this.enemiesPerWave) {
            this.spawnTimer -= dt;
            if (this.spawnTimer <= 0) {
                this.spawnTimer = this.spawnInterval;
                this.spawnEnemy();
                this.enemiesSpawned++;
            }
        }

        // Wave complete
        if (this.waveActive && this.enemiesSpawned >= this.enemiesPerWave && this.enemies.length === 0) {
            this.waveActive = false;

            // Stage complete when clearing a boss wave (every 5th wave)
            if (this.wave % 5 === 0) {
                this.state = 'stageComplete';
                this.menu.showStageComplete(this.stage, this.wave, this.score);
            } else {
                this.waveCountdown = 3.0;
            }
        }

        if (!this.waveActive && this.state === 'playing') {
            this.waveCountdown -= dt;
            if (this.waveCountdown <= 0) this.startNextWave();
        }

        this.camera.update();
        this.particles.update();

        // Game over
        if (!player.alive && this.state === 'playing') {
            this.state = 'gameover';
            this.menu.showGameOver(this.score, this.wave, player.level, this.stage);
            this.particles.explosion(player.x, player.y, '#3498db', true);
        }
    }

    onEnemyDeath(enemy) {
        const isBoss = enemy.type === 'boss';
        this.particles.explosion(enemy.x, enemy.y, enemy.color, isBoss);
        this.score += enemy.xp;
        this.camera.shake(isBoss ? 10 : 3);

        // Splitter: spawn 2 small enemies
        if (enemy.type === 'splitter' && !enemy.hasSplit) {
            for (let k = 0; k < 2; k++) {
                const angle = (Math.PI * 2 / 2) * k;
                const splitEnemy = new Enemy(
                    enemy.x + Math.cos(angle) * 20,
                    enemy.y + Math.sin(angle) * 20,
                    'basic', this.wave
                );
                splitEnemy.size = 6;
                splitEnemy.maxHp = Math.floor(enemy.maxHp * 0.3);
                splitEnemy.hp = splitEnemy.maxHp;
                splitEnemy.color = '#e91e63';
                this.enemies.push(splitEnemy);
            }
        }

        // Boss guarantees a weapon drop
        if (isBoss) {
            this.spawnWeaponPickup(enemy.x, enemy.y);
        } else {
            // Random drop chance: 8% weapon, 12% health
            const r = Math.random();
            if (r < 0.08) {
                this.spawnWeaponPickup(enemy.x, enemy.y);
            } else if (r < 0.20) {
                this.pickups.push(new Pickup(enemy.x, enemy.y, 'health'));
            }
        }

        // XP
        if (this.player.alive) {
            const leveled = this.player.addXp(enemy.xp);
            if (leveled) {
                this.state = 'upgrading';
                this.upgradeOptions = this.player.getUpgradeOptions(3);
                this.menu.showUpgrade(this.upgradeOptions);
            }
        }
    }

    spawnWeaponPickup(x, y) {
        // Choose a random weapon that's not pistol
        const weaponIds = Object.keys(WEAPON_DATA).filter(id => id !== 'pistol');
        const id = weaponIds[Math.floor(Math.random() * weaponIds.length)];
        this.pickups.push(new Pickup(x, y, 'weapon', id));
    }

    spawnEnemy() {
        const types = ['basic', 'basic', 'basic', 'fast', 'tank'];
        const availableTypes = [...types];

        // Add new types based on wave
        if (this.wave >= 3) availableTypes.push('sniper', 'swarm', 'swarm');
        if (this.wave >= 5) availableTypes.push('shield', 'splitter');
        if (this.wave >= 8) availableTypes.push('sniper', 'shield');

        let type = availableTypes[Math.floor(Math.random() * availableTypes.length)];

        if (this.wave % 5 === 0 && this.enemiesSpawned === 0) type = 'boss';

        // Swarm: spawn in groups
        if (type === 'swarm') {
            const count = 3 + Math.floor(Math.random() * 3);
            for (let k = 0; k < count; k++) {
                const margin = 50;
                const side = Math.floor(Math.random() * 4);
                let x, y;
                switch (side) {
                    case 0: x = Math.random() * this.canvas.width; y = -margin; break;
                    case 1: x = this.canvas.width + margin; y = Math.random() * this.canvas.height; break;
                    case 2: x = Math.random() * this.canvas.width; y = this.canvas.height + margin; break;
                    case 3: x = -margin; y = Math.random() * this.canvas.height; break;
                }
                this.enemies.push(new Enemy(x + k * 8, y + k * 8, 'swarm', this.wave));
            }
            return;
        }

        const margin = 50;
        const side = Math.floor(Math.random() * 4);
        let x, y;
        switch (side) {
            case 0: x = Math.random() * this.canvas.width; y = -margin; break;
            case 1: x = this.canvas.width + margin; y = Math.random() * this.canvas.height; break;
            case 2: x = Math.random() * this.canvas.width; y = this.canvas.height + margin; break;
            case 3: x = -margin; y = Math.random() * this.canvas.height; break;
        }

        this.enemies.push(new Enemy(x, y, type, this.wave));
    }

    selectUpgrade(idx) {
        if (this.state !== 'upgrading') return;
        if (idx >= 0 && idx < this.upgradeOptions.length) {
            const option = this.upgradeOptions[idx];
            const result = this.player.applyUpgrade(option);

            // Inventory full with new weapon → redirect to replace UI
            if (result && result.type === 'replace') {
                this.menu.hideUpgrade();
                this.pendingReplaceWeaponId = result.weaponId;
                this.state = 'replacing';
                this.menu.showReplace(this.player.inventory);
                this.upgradeOptions = [];
                return;
            }

            if (option.weaponId && !option.isWeaponUpgrade) {
                this.showNotification(`获得新武器: ${WEAPON_DATA[option.weaponId].name}`);
            } else if (option.isWeaponUpgrade) {
                const w = this.player.inventory.find(w => w.id === option.weaponId);
                if (w) this.showNotification(`${w.name} 升级到 Lv.${w.level}`);
            } else {
                this.showNotification(`${option.name} 已强化`);
            }
        }
        this.upgradeOptions = [];
        this.menu.hideUpgrade();
        this.state = 'playing';
    }

    selectReplace(idx) {
        if (this.state !== 'replacing') return;
        if (this.pendingReplaceWeaponId && idx >= 0 && idx < this.player.inventory.length) {
            const oldName = this.player.inventory[idx].name;
            this.player.replaceWeapon(idx, this.pendingReplaceWeaponId);
            this.showNotification(`替换: ${oldName} → ${WEAPON_DATA[this.pendingReplaceWeaponId].name}`);
        }
        this.pendingReplaceWeaponId = null;
        this.menu.hideReplace();
        this.state = 'playing';
    }

    cancelReplace() {
        if (this.state !== 'replacing') return;
        this.pendingReplaceWeaponId = null;
        this.menu.hideReplace();
        this.menu.hideUpgrade();
        this.state = 'playing';
    }

    nextStage() {
        if (this.state !== 'stageComplete') return;
        this.menu.hideStageComplete();
        this.state = 'playing';
        this.startNextWave();
    }

    showNotification(text) {
        this.notificationText = text;
        this.notificationTimer = 2.0;
    }

    switchToWeapon(idx) {
        if (!this.player || !this.player.alive) return;
        if (idx < this.player.inventory.length && idx !== this.player.currentWeapon) {
            this.player.currentWeapon = idx;
        }
    }

    render() {
        const ctx = this.ctx;
        const canvas = this.canvas;

        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        this.drawGrid(ctx);
        this.camera.apply(ctx);

        if (this.player && this.state !== 'menu') {
            // Pickups
            for (const p of this.pickups) p.draw(ctx);

            // Enemies
            for (const enemy of this.enemies) enemy.draw(ctx);

            // Player
            this.player.draw(ctx, Input.mouseX, Input.mouseY);

            // Bullets
            for (const bullet of this.bullets) bullet.draw(ctx);
            for (const eb of this.enemyBullets) eb.draw(ctx);

            // Explosions
            for (const exp of this.explosions) exp.draw(ctx);

            // Laser beam (draw on top)
            const weapon = this.player.weapon;
            if (weapon && weapon.special === 'laser') {
                weapon.drawLaser(ctx);
            }
        }

        this.particles.draw(ctx);
        this.camera.restore(ctx);

        // HUD
        if (this.state !== 'menu' && this.state !== 'gameover') {
            this.hud.update(this.player, this.wave, this.score, this.stage);
        }

        // Notification
        if (this.notificationTimer > 0) {
            const alpha = Math.min(1, this.notificationTimer);
            ctx.globalAlpha = alpha;
            ctx.fillStyle = '#f39c12';
            ctx.font = 'bold 18px "Courier New", monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillText(this.notificationText, canvas.width / 2, 70);
            ctx.globalAlpha = 1;
        }

        // Wave countdown
        if (!this.waveActive && this.state === 'playing' && this.waveCountdown > 0) {
            ctx.fillStyle = 'rgba(255,255,255,0.5)';
            ctx.font = '16px "Courier New", monospace';
            ctx.textAlign = 'center';
            ctx.fillText(`下一波 ${Math.ceil(this.waveCountdown)}s`,
                canvas.width / 2,
                canvas.height / 2 + canvas.height / 4);
        }
    }

    drawGrid(ctx) {
        ctx.strokeStyle = 'rgba(255,255,255,0.04)';
        ctx.lineWidth = 1;
        const gs = 48;
        for (let x = 0; x < this.canvas.width; x += gs) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, this.canvas.height); ctx.stroke();
        }
        for (let y = 0; y < this.canvas.height; y += gs) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(this.canvas.width, y); ctx.stroke();
        }
    }
}
