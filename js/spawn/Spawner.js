import { EnemyTypeRegistry } from '../entities/enemyTypes/EnemyTypeRegistry.js';

export class Spawner {
  static getRandomEdgePosition(canvasW, canvasH, margin = 50) {
    const side = Math.floor(Math.random() * 4);
    switch (side) {
      case 0: return { x: Math.random() * canvasW, y: -margin };
      case 1: return { x: canvasW + margin, y: Math.random() * canvasH };
      case 2: return { x: Math.random() * canvasW, y: canvasH + margin };
      case 3: return { x: -margin, y: Math.random() * canvasH };
    }
  }
}
