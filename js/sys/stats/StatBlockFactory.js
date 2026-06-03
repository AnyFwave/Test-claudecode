import { StatBlock } from './StatBlock.js';
import { STATS } from './statDefinitions.js';

export class StatBlockFactory {
  static playerDefault() {
    return new StatBlock({
      [STATS.MAX_HP]:           { base: 100 },
      [STATS.HP]:               { base: 100 },
      [STATS.SPEED]:            { base: 200 },
      [STATS.ARMOR]:            { base: 0 },
      [STATS.ARMOR_PENETRATION]: { base: 0 },
      [STATS.CRITICAL_CHANCE]:  { base: 0.05, min: 0, max: 1 },
      [STATS.CRITICAL_MULTIPLIER]: { base: 1.5, min: 1 },
      [STATS.FIRE_RATE]:        { base: 1.0, min: 0.1 },
      [STATS.PROJECTILE_SPEED]: { base: 1.0, min: 0.2 },
      [STATS.SIZE]:             { base: 12 },

      'resistance_physical':    { base: 0 },
      'resistance_fire':        { base: 0 },
      'resistance_ice':         { base: 0 },
      'resistance_lightning':   { base: 0 },
      'resistance_poison':      { base: 0 },
      'resistance_elem_reaction': { base: 0 },
      'resistance_elem_penetration': { base: 0 },
      'resistance_mental':      { base: 0.1 },
      'resistance_mental_collision': { base: 0 },
      'resistance_mental_interference': { base: 0 },
      'resistance_mental_penetration': { base: 0 },
      'resistance_mental_tear': { base: 0 },

      'vulnerability_physical': { base: 0 },
      'vulnerability_fire':     { base: 0 },
      'vulnerability_ice':      { base: 0 },
      'vulnerability_lightning': { base: 0 },
      'vulnerability_poison':   { base: 0 },

      'damage_bonus_physical':     { base: 0 },
      'damage_bonus_collision':    { base: 0 },
      'damage_bonus_penetration':  { base: 0 },
      'damage_bonus_fire':         { base: 0 },
      'damage_bonus_ice':          { base: 0 },
      'damage_bonus_lightning':    { base: 0 },
      'damage_bonus_poison':       { base: 0 },
      'damage_bonus_mental':       { base: 0 },
    });
  }

  static enemyByType(enemyTypeId, wave = 1) {
    const scale = 1 + wave * 0.02;

    const typeStats = {
      basic: {
        [STATS.MAX_HP]: { base: Math.floor(30 * scale) },
        [STATS.HP]:     { base: Math.floor(30 * scale) },
        [STATS.SPEED]:  { base: 80 + wave * 1.5 },
        [STATS.SIZE]:   { base: 10 },
        [STATS.COLLISION_DAMAGE]: { base: 10 },
        [STATS.XP_VALUE]: { base: 10 },
        'resistance_physical': { base: 0 },
      },
      fast: {
        [STATS.MAX_HP]: { base: Math.floor(20 * scale) },
        [STATS.HP]:     { base: Math.floor(20 * scale) },
        [STATS.SPEED]:  { base: 150 + wave * 2 },
        [STATS.SIZE]:   { base: 8 },
        [STATS.COLLISION_DAMAGE]: { base: 8 },
        [STATS.XP_VALUE]: { base: 15 },
        'resistance_physical': { base: 0 },
      },
      tank: {
        [STATS.MAX_HP]: { base: Math.floor(80 * scale) },
        [STATS.HP]:     { base: Math.floor(80 * scale) },
        [STATS.SPEED]:  { base: 50 + wave },
        [STATS.SIZE]:   { base: 14 },
        [STATS.ARMOR]:  { base: 10 },
        [STATS.COLLISION_DAMAGE]: { base: 15 },
        [STATS.XP_VALUE]: { base: 25 },
        'resistance_physical': { base: 0.2 },
        'resistance_fire':     { base: 0.1 },
      },
      boss: {
        [STATS.MAX_HP]: { base: Math.floor(300 * scale) },
        [STATS.HP]:     { base: Math.floor(300 * scale) },
        [STATS.SPEED]:  { base: 60 + wave },
        [STATS.SIZE]:   { base: 22 },
        [STATS.ARMOR]:  { base: 15 },
        [STATS.COLLISION_DAMAGE]: { base: 25 },
        [STATS.XP_VALUE]: { base: 100 },
        'resistance_physical': { base: 0.25 },
        'resistance_fire':     { base: 0.2 },
        'resistance_ice':      { base: 0.2 },
      },
      sniper: {
        [STATS.MAX_HP]: { base: Math.floor(25 * scale) },
        [STATS.HP]:     { base: Math.floor(25 * scale) },
        [STATS.SPEED]:  { base: 40 + wave },
        [STATS.SIZE]:   { base: 10 },
        [STATS.COLLISION_DAMAGE]: { base: 15 },
        [STATS.XP_VALUE]: { base: 20 },
        'resistance_physical': { base: 0 },
      },
      swarm: {
        [STATS.MAX_HP]: { base: Math.floor(8 * scale) },
        [STATS.HP]:     { base: Math.floor(8 * scale) },
        [STATS.SPEED]:  { base: 130 + wave * 3 },
        [STATS.SIZE]:   { base: 5 },
        [STATS.COLLISION_DAMAGE]: { base: 5 },
        [STATS.XP_VALUE]: { base: 5 },
        'resistance_physical': { base: -0.1 },
      },
      shield: {
        [STATS.MAX_HP]: { base: Math.floor(40 * scale) },
        [STATS.HP]:     { base: Math.floor(40 * scale) },
        [STATS.SPEED]:  { base: 55 + wave },
        [STATS.SIZE]:   { base: 13 },
        [STATS.COLLISION_DAMAGE]: { base: 10 },
        [STATS.XP_VALUE]: { base: 20 },
        'resistance_physical': { base: 0.1 },
      },
      splitter: {
        [STATS.MAX_HP]: { base: Math.floor(35 * scale) },
        [STATS.HP]:     { base: Math.floor(35 * scale) },
        [STATS.SPEED]:  { base: 70 + wave },
        [STATS.SIZE]:   { base: 11 },
        [STATS.COLLISION_DAMAGE]: { base: 10 },
        [STATS.XP_VALUE]: { base: 18 },
        'resistance_physical': { base: 0 },
      },
    };

    const defs = typeStats[enemyTypeId] || typeStats.basic;
    return new StatBlock(defs);
  }
}
