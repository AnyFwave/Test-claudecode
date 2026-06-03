import { DamageProfile } from './DamageProfile.js';
import { PHYSICAL, COLLISION, PENETRATION, FIRE, LIGHTNING } from '../sys/damage/damageTypes.js';

const DP = {
  physicalCollision: new DamageProfile([{ type: COLLISION, proportion: 1.0 }]),
  physicalPenetrate: new DamageProfile([{ type: PENETRATION, proportion: 1.0 }]),
  physicalQuad: new DamageProfile([
    { type: COLLISION, proportion: 0.7 },
    { type: LIGHTNING, proportion: 0.3 }
  ]),
  laserMix: new DamageProfile([
    { type: PENETRATION, proportion: 0.3 },
    { type: FIRE, proportion: 0.7 }
  ]),
  bombMix: new DamageProfile([
    { type: COLLISION, proportion: 0.5 },
    { type: FIRE, proportion: 0.5 }
  ]),
};

function L(damage, fireRate, bulletSpeed, count, spread, special, extra = {}) {
  return Object.freeze({ damage, fireRate, bulletSpeed, count, spread, special, ...extra });
}

export const WEAPON_DEFINITIONS = Object.freeze({
  pistol: Object.freeze({
    id: 'pistol',
    name: '手枪',
    icon: '🔫',
    description: '均衡的单发射击',
    damageProfile: DP.physicalPenetrate,
    levels: Object.freeze([
      L(10, 0.30, 500, 1, 0, null),
      L(12, 0.28, 520, 1, 0, null),
      L(15, 0.22, 550, 1, 0, null),
      L(18, 0.20, 580, 1, 0, null),
      L(22, 0.16, 620, 2, 0.1, 'parallel'),
    ])
  }),
  dual: Object.freeze({
    id: 'dual',
    name: '双枪',
    icon: '🔫🔫',
    description: '两发平行子弹',
    damageProfile: DP.physicalCollision,
    levels: Object.freeze([
      L(8,  0.32, 480, 2, 0.15, 'parallel'),
      L(9,  0.30, 500, 2, 0.2,  'parallel'),
      L(10, 0.28, 520, 3, 0.18, 'parallel'),
      L(11, 0.25, 550, 4, 0.2,  'parallel'),
      L(14, 0.22, 580, 4, 0.15, 'parallel'),
    ])
  }),
  shotgun: Object.freeze({
    id: 'shotgun',
    name: '散弹枪',
    icon: '💥',
    description: '扇形范围射击',
    damageProfile: DP.physicalCollision,
    levels: Object.freeze([
      L(6,  0.5,  400, 5,  0.4,  'spread'),
      L(7,  0.45, 420, 5,  0.3,  'spread'),
      L(8,  0.4,  450, 7,  0.35, 'spread'),
      L(9,  0.35, 480, 9,  0.35, 'spread'),
      L(11, 0.3,  500, 11, 0.3,  'spread'),
    ])
  }),
  quad: Object.freeze({
    id: 'quad',
    name: '四向枪',
    icon: '✚',
    description: '十字四方向射击',
    damageProfile: DP.physicalQuad,
    levels: Object.freeze([
      L(8,  0.4,  400, 4,  0, 'quad'),
      L(9,  0.35, 420, 8,  0, 'octo'),
      L(10, 0.3,  450, 8,  0, 'octo'),
      L(12, 0.25, 480, 12, 0, 'octo'),
      L(14, 0.2,  500, 12, 0, 'octo'),
    ])
  }),
  laser: Object.freeze({
    id: 'laser',
    name: '激光',
    icon: '⚡',
    description: '持续光束穿透敌人',
    damageProfile: DP.laserMix,
    levels: Object.freeze([
      L(15, 0.15, 0, 1, 0, 'laser', { range: 400 }),
      L(20, 0.13, 0, 1, 0, 'laser', { range: 500 }),
      L(30, 0.10, 0, 1, 0, 'laser', { range: 600 }),
      L(40, 0.08, 0, 1, 0, 'laser', { range: 750 }),
      L(55, 0.06, 0, 1, 0, 'laser', { range: 900 }),
    ])
  }),
  sniper: Object.freeze({
    id: 'sniper',
    name: '狙击枪',
    icon: '🎯',
    description: '高伤害穿透射击',
    damageProfile: DP.physicalPenetrate,
    levels: Object.freeze([
      L(35,  0.8,  800,  1, 0, 'pierce', { pierce: 1 }),
      L(45,  0.75, 850,  1, 0, 'pierce', { pierce: 2 }),
      L(60,  0.7,  900,  1, 0, 'pierce', { pierce: 3 }),
      L(80,  0.6,  950,  1, 0, 'pierce', { pierce: 6 }),
      L(100, 0.5,  1100, 1, 0, 'pierce', { pierce: 99 }),
    ])
  }),
  spinner: Object.freeze({
    id: 'spinner',
    name: '旋转枪',
    icon: '🌀',
    description: '子弹环绕自动攻击',
    damageProfile: DP.physicalCollision,
    levels: Object.freeze([
      L(6,  0.2,  0, 3,  0, 'spinner', { radius: 80 }),
      L(7,  0.18, 0, 3,  0, 'spinner', { radius: 90 }),
      L(8,  0.15, 0, 6,  0, 'spinner', { radius: 100 }),
      L(9,  0.13, 0, 8,  0, 'spinner', { radius: 115 }),
      L(11, 0.1,  0, 10, 0, 'spinner', { radius: 130 }),
    ])
  }),
  bomb: Object.freeze({
    id: 'bomb',
    name: '爆破枪',
    icon: '💣',
    description: '子弹命中后范围爆炸',
    damageProfile: DP.bombMix,
    levels: Object.freeze([
      L(12, 0.45, 350, 1, 0, 'explosive', { explodeRadius: 60 }),
      L(15, 0.4,  370, 1, 0, 'explosive', { explodeRadius: 75 }),
      L(18, 0.35, 400, 1, 0, 'explosive', { explodeRadius: 90 }),
      L(22, 0.3,  430, 1, 0, 'explosive', { explodeRadius: 110 }),
      L(28, 0.25, 480, 1, 0, 'explosive', { explodeRadius: 140 }),
    ])
  }),
});
