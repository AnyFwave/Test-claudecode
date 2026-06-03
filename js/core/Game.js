import { GameState } from './GameState.js';
import { EventBus } from './EventBus.js';
import { CombatSystem } from '../sys/combat/CombatSystem.js';
import { Player } from '../entities/Player.js';
import { Enemy } from '../entities/Enemy.js';
import { Pickup } from '../entities/Pickup.js';
import { WeaponRegistry } from '../weapons/WeaponRegistry.js';
import { ParticleSystem } from '../rendering/ParticleSystem.js';
import { Camera } from '../rendering/Camera.js';
import { HUD } from '../ui/HUD.js';
import { MenuManager } from '../ui/MenuManager.js';
import { WaveManager } from '../spawn/WaveManager.js';
import { EnemyTypeRegistry } from '../entities/enemyTypes/EnemyTypeRegistry.js';
import { ConditionEvaluator } from '../sys/traits/ConditionEvaluator.js';

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    this.state = new GameState();
    this.state.canvasWidth = canvas.width;
    this.state.canvasHeight = canvas.height;

    this.particles = new ParticleSystem();
    this.camera = new Camera();
    this.state.particles = this.particles;
    this.state.camera = this.camera;

    this.state.onEnemyDeath = (enemy) => this.onEnemyDeath(enemy);

    this.combat = new CombatSystem(this.state);
    this.waveManager = new WaveManager(this.state);

    this.hud = new HUD();
    this.menu = new MenuManager(this);

    this.upgradeOptions = [];
    this.notificationText = '';
    this.notificationTimer = 0;
    this._pendingReplaceWeaponId = null;

    // EventBus listeners for wave/stage events
    EventBus.on('wave:started', ({ wave }) => {
      this.menu.announceWave(wave);
    });
    EventBus.on('stage:complete', ({ stage, wave, score }) => {
      this.menu.showStageComplete(stage, wave, score);
    });

    // Trait/Equipment condition evaluation
    EventBus.on('bullet:hit', (data) => {
      if (this.player && this.player.alive) {
        ConditionEvaluator.evaluate(this.player, 'bullet:hit', data, this._buildWorldState());
      }
    });
    EventBus.on('enemy:killed', (data) => {
      if (this.player && this.player.alive) {
        ConditionEvaluator.evaluate(this.player, 'enemy:killed', data, this._buildWorldState());
      }
    });
    EventBus.on('player:damaged', (data) => {
      if (this.player && this.player.alive) {
        ConditionEvaluator.evaluate(this.player, 'player:damaged', data, this._buildWorldState());
      }
    });

    this.resize();
    this._resizeHandler = () => this.resize();
    window.addEventListener('resize', this._resizeHandler);

    this.menu.showStart();
  }

  get scene() { return this.state.scene; }
  set scene(v) { this.state.scene = v; }
  get player() { return this.state.player; }
  set player(v) { this.state.player = v; }

  resize() {
    const w = document.documentElement.clientWidth;
    const h = document.documentElement.clientHeight;
    this.canvas.width = w;
    this.canvas.height = h;
    this.state.canvasWidth = w;
    this.state.canvasHeight = h;
  }

  start() {
    const cx = this.state.canvasWidth / 2;
    const cy = this.state.canvasHeight / 2;
    this.state.reset();
    this.state.player = new Player(cx, cy);
    this.state.bullets = [];
    this.state.enemyBullets = [];
    this.state.enemies = [];
    this.state.pickups = [];
    this.state.explosions = [];
    this.particles.clear();

    this.scene = 'playing';
    this.waveManager.startGame();
  }

  update(dt) {
    this.menu.update(dt);

    // Weapon switching
    const weaponKeys = ['1', '2', '3', '4'];
    for (let i = 0; i < weaponKeys.length; i++) {
      if (window.Input && (window.Input.keys[weaponKeys[i]] || window.Input.keys['Digit' + weaponKeys[i]])) {
        if (window.Input.keys) {
          window.Input.keys[weaponKeys[i]] = false;
          window.Input.keys['Digit' + weaponKeys[i]] = false;
        }
        this.switchToWeapon(i);
      }
    }

    if (this.scene === 'playing') {
      this.updatePlaying(dt);
    } else if (['upgrading', 'replacing', 'stageComplete'].includes(this.scene)) {
      // paused
    } else if (this.scene === 'gameover') {
      this.particles.update();
      this.camera.update();
    }

    if (this.notificationTimer > 0) {
      this.notificationTimer -= dt;
    }
  }

  updatePlaying(dt) {
    const player = this.player;
    if (!player) return;

    // Player movement
    player.update(dt, window.Input, this.state.canvasWidth, this.state.canvasHeight);

    // Build worldState for weapon firing
    const worldState = this._buildWorldState();

    // Shooting
    if (window.Input && window.Input.mouseDown) {
      const result = player.tryShoot(window.Input, worldState);
      if (result !== false && result !== 'spinner') {
        const angle = result.angle;
        this.particles.spark(
          player.x + Math.cos(angle) * (player.size + 6),
          player.y + Math.sin(angle) * (player.size + 6)
        );

        // Laser kills processing
        if (result.result && result.result.deadEnemies) {
          for (const enemy of result.result.deadEnemies) {
            this.onEnemyDeath(enemy);
          }
        }
      }
    }

    // Spinner auto-fire
    if (player.weapon && player.weapon.special === 'spinner') {
      player.weapon.updateSpinner(player, worldState, dt);
    }

    // Update enemies (movement, animation, type-specific AI)
    if (player) {
      for (const enemy of this.state.enemies) {
        if (!enemy.alive) continue;
        enemy.update(dt, player.x, player.y, this.state);
      }
    }

    // Run combat system (handles all collisions)
    this.combat.update(dt);

    // Clean dead enemies
    for (let i = this.state.enemies.length - 1; i >= 0; i--) {
      if (!this.state.enemies[i].alive) this.state.enemies.splice(i, 1);
    }

    // Pickups
    for (let i = this.state.pickups.length - 1; i >= 0; i--) {
      const p = this.state.pickups[i];
      p.update(dt);
      if (!p.alive) { this.state.pickups.splice(i, 1); continue; }
      if (p.canPickup(player.x, player.y)) {
        this._collectPickup(p, i);
      }
    }

    // Wave management
    this.waveManager.update(dt);

    // Game over check
    if (!player.alive && this.scene === 'playing') {
      this.scene = 'gameover';
      this.menu.showGameOver(this.state.score, this.state.wave, player.level, this.state.stage);
      this.particles.explosion(player.x, player.y, '#3498db', true);
    }

    this.camera.update();
    this.particles.update();
  }

  _buildWorldState() {
    return {
      addBullet: (b) => this.state.addBullet(b),
      addExplosion: (e) => this.state.addExplosion(e),
      getEnemies: () => this.state.enemies,
      particles: this.particles,
      game: this,
    };
  }

  _collectPickup(p, index) {
    const player = this.player;
    if (p.type === 'weapon') {
      const result = player.pickupWeapon(p.weaponId);
      if (result.type === 'replace') {
        this._pendingReplaceWeaponId = p.weaponId;
        this.scene = 'replacing';
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
    } else if (p.type === 'equipment') {
      this._collectEquipment(p);
      return;
    }
    this.state.pickups.splice(index, 1);
  }

  onEnemyDeath(enemy) {
    const config = EnemyTypeRegistry.get(enemy.type);
    const isBoss = config ? config.isBoss : false;

    this.particles.explosion(enemy.x, enemy.y, enemy.color, isBoss);
    this.state.score += enemy.xp;
    this.camera.shake(isBoss ? 10 : 3);

    // Type-specific death hook (splitter splitting, boss guaranteed drops, etc.)
    if (config && config.onDeathFn) {
      config.onDeathFn(enemy, {
        spawnEnemy: (x, y, type, wave) => {
          const e = new Enemy(x, y, type, wave || this.state.wave);
          this.state.addEnemy(e);
          return e;
        },
        spawnWeaponPickup: (x, y) => this._spawnWeaponPickup(x, y),
        spawnEquipmentPickup: (x, y) => this._spawnEquipmentPickup(x, y),
      });
    }

    // Default drop table for non-boss enemies
    if (!isBoss) {
      this._defaultDrop(enemy);
    }

    // XP
    const player = this.player;
    if (player && player.alive) {
      const leveled = player.addXp(enemy.xp);
      if (leveled) {
        this.scene = 'upgrading';
        this.upgradeOptions = player.getUpgradeOptions(3, Game._equipmentPool || []);
        this.menu.showUpgrade(this.upgradeOptions);
      }
    }
  }

  _defaultDrop(enemy) {
    const r = Math.random();
    if (r < 0.08) {
      this._spawnWeaponPickup(enemy.x, enemy.y);
    } else if (r < 0.20) {
      this.state.addPickup(new Pickup(enemy.x, enemy.y, 'health'));
    } else if (r < 0.23) {
      this._spawnEquipmentPickup(enemy.x, enemy.y);
    }
  }

  _spawnWeaponPickup(x, y) {
    const ids = WeaponRegistry.getAllIds().filter(id => id !== 'pistol');
    const id = ids[Math.floor(Math.random() * ids.length)];
    this.state.addPickup(new Pickup(x, y, 'weapon', id));
  }

  _spawnEquipmentPickup(x, y) {
    // Deferred import — Equipment modules self-register
    const eq = this._getRandomEquipment();
    if (eq) this.state.addPickup(new Pickup(x, y, 'equipment', eq));
  }

  _getRandomEquipment() {
    // EquipmentPool set by equipment definitions at import time
    if (!Game._equipmentPool || Game._equipmentPool.length === 0) return null;
    return Game._equipmentPool[Math.floor(Math.random() * Game._equipmentPool.length)];
  }

  static registerEquipment(eq) {
    if (!Game._equipmentPool) Game._equipmentPool = [];
    Game._equipmentPool.push(eq);
  }

  _collectEquipment(p) {
    const player = this.player;
    const eq = p.equipmentData;
    if (!eq) return;
    player.equip(eq);
    const traits = eq.traits && eq.traits.length > 0
      ? ` [${eq.traits.map(t => t.name).join(', ')}]`
      : '';
    this.showNotification(`Equipped: ${eq.name}${traits}`);
    this.camera.shake(5);
  }

  // === UI Actions ===

  selectUpgrade(idx) {
    if (this.scene !== 'upgrading') return;
    if (idx >= 0 && idx < this.upgradeOptions.length) {
      const option = this.upgradeOptions[idx];
      const result = this.player.applyUpgrade(option);

      if (result && result.type === 'replace') {
        this.menu.hideUpgrade();
        this._pendingReplaceWeaponId = result.weaponId;
        this.scene = 'replacing';
        this.menu.showReplace(this.player.inventory);
        this.upgradeOptions = [];
        return;
      }

      if (option.isEquipment) {
        this.showNotification(`${option.name} equipped`);
        this.camera.shake(5);
      } else if (option.weaponId && !option.isWeaponUpgrade) {
        const def = WeaponRegistry.get(option.weaponId);
        this.showNotification(`New Weapon: ${def ? def.name : option.weaponId}`);
      } else if (option.isWeaponUpgrade) {
        const w = this.player.inventory.find(w => w.id === option.weaponId);
        if (w) this.showNotification(`${w.name} upgraded to Lv.${w.level}`);
      } else {
        this.showNotification(`${option.name} enhanced`);
      }
    }
    this.upgradeOptions = [];
    this.menu.hideUpgrade();
    this.scene = 'playing';
  }

  selectReplace(idx) {
    if (this.scene !== 'replacing') return;
    if (this._pendingReplaceWeaponId && idx >= 0 && idx < this.player.inventory.length) {
      const oldName = this.player.inventory[idx].name;
      this.player.replaceWeapon(idx, this._pendingReplaceWeaponId);
      const def = WeaponRegistry.get(this._pendingReplaceWeaponId);
      this.showNotification(`Replaced: ${oldName} → ${def ? def.name : '?'}`);
    }
    this._pendingReplaceWeaponId = null;
    this.menu.hideReplace();
    this.scene = 'playing';
  }

  cancelReplace() {
    if (this.scene !== 'replacing') return;
    this._pendingReplaceWeaponId = null;
    this.menu.hideReplace();
    this.menu.hideUpgrade();
    this.scene = 'playing';
  }

  nextStage() {
    if (this.scene !== 'stageComplete') return;
    this.menu.hideStageComplete();
    this.scene = 'playing';
    this.waveManager.startNextWave();
  }

  switchToWeapon(idx) {
    const p = this.player;
    if (!p || !p.alive) return;
    if (idx < p.inventory.length && idx !== p.currentWeapon) {
      p.currentWeapon = idx;
    }
  }

  showNotification(text) {
    this.notificationText = text;
    this.notificationTimer = 2.0;
  }

  // === Render ===

  render() {
    const ctx = this.ctx;
    const canvas = this.canvas;

    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    this._drawGrid(ctx);
    this.camera.apply(ctx);

    const player = this.player;
    if (player && this.scene !== 'menu') {
      for (const p of this.state.pickups) p.draw(ctx);
      for (const enemy of this.state.enemies) enemy.draw(ctx);

      if (window.Input) {
        player.draw(ctx, window.Input.mouseX, window.Input.mouseY);
      } else {
        player.draw(ctx, canvas.width / 2, canvas.height / 2);
      }

      for (const bullet of this.state.bullets) bullet.draw(ctx);
      for (const eb of this.state.enemyBullets) eb.draw(ctx);
      for (const exp of this.state.explosions) exp.draw(ctx);

      const weapon = player.weapon;
      if (weapon && weapon.special === 'laser') {
        weapon.drawLaser(ctx);
      }
    }

    this.particles.draw(ctx);
    this.camera.restore(ctx);

    if (this.scene !== 'menu' && this.scene !== 'gameover') {
      this.hud.update(player, this.state.wave, this.state.score, this.state.stage);
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
    if (!this.state.waveActive && this.scene === 'playing' && this.waveManager.countdown > 0) {
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = '16px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`Next wave ${Math.ceil(this.waveManager.countdown)}s`,
        canvas.width / 2, canvas.height / 2 + canvas.height / 4);
    }
  }

  _drawGrid(ctx) {
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
