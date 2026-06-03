export class EventBus {
  static #listeners = new Map();

  static on(event, callback, priority = 0) {
    if (!this.#listeners.has(event)) {
      this.#listeners.set(event, []);
    }
    this.#listeners.get(event).push({ callback, priority });
    this.#listeners.get(event).sort((a, b) => b.priority - a.priority);
  }

  static emit(event, data = {}) {
    const listeners = this.#listeners.get(event);
    if (!listeners) return;
    for (const { callback } of [...listeners]) {
      callback(data);
    }
  }

  static off(event, callback) {
    const listeners = this.#listeners.get(event);
    if (!listeners) return;
    this.#listeners.set(event, listeners.filter(l => l.callback !== callback));
  }

  static clear() {
    this.#listeners.clear();
  }
}
