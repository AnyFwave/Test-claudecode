// Damage types - self-register on import
import '../sys/damage/damageTypes.js';

// Weapon behaviors - register with WeaponRegistry
import { WeaponRegistry } from '../weapons/WeaponRegistry.js';
import { SingleShotBehavior } from '../weapons/behaviors/SingleShotBehavior.js';
import { ParallelBehavior } from '../weapons/behaviors/ParallelBehavior.js';
import { SpreadBehavior } from '../weapons/behaviors/SpreadBehavior.js';
import { QuadBehavior } from '../weapons/behaviors/QuadBehavior.js';
import { LaserBehavior } from '../weapons/behaviors/LaserBehavior.js';
import { PierceBehavior } from '../weapons/behaviors/PierceBehavior.js';
import { SpinnerBehavior } from '../weapons/behaviors/SpinnerBehavior.js';
import { ExplosiveBehavior } from '../weapons/behaviors/ExplosiveBehavior.js';

WeaponRegistry.registerBehavior(null, SingleShotBehavior);
WeaponRegistry.registerBehavior('parallel', ParallelBehavior);
WeaponRegistry.registerBehavior('spread', SpreadBehavior);
WeaponRegistry.registerBehavior('quad', QuadBehavior);
WeaponRegistry.registerBehavior('octo', QuadBehavior);
WeaponRegistry.registerBehavior('laser', LaserBehavior);
WeaponRegistry.registerBehavior('pierce', PierceBehavior);
WeaponRegistry.registerBehavior('spinner', SpinnerBehavior);
WeaponRegistry.registerBehavior('explosive', ExplosiveBehavior);

// Weapon definitions
import { WEAPON_DEFINITIONS } from '../weapons/WeaponData.js';
for (const [id, def] of Object.entries(WEAPON_DEFINITIONS)) {
  WeaponRegistry.register(def);
}

// Enemy types - self-register on import
import '../entities/enemyTypes/basic.js';
import '../entities/enemyTypes/fast.js';
import '../entities/enemyTypes/tank.js';
import '../entities/enemyTypes/boss.js';
import '../entities/enemyTypes/sniper.js';
import '../entities/enemyTypes/swarm.js';
import '../entities/enemyTypes/shield.js';
import '../entities/enemyTypes/splitter.js';

// Traits - self-register on import
import '../sys/traits/traitDefinitions.js';

// Equipment - registers via Game.registerEquipment()
import './equipmentDefinitions.js';
