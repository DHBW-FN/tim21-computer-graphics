export default class EventManager {
  static instance;

  constructor() {
    if (EventManager.instance) {
      // eslint-disable-next-line no-constructor-return
      return EventManager.instance;
    }
    this.listeners = new Map();
    EventManager.instance = this;
  }

  addListener(event, listener) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(listener);
  }

  removeListener(event, listener) {
    if (this.listeners.has(event)) {
      const index = this.listeners.get(event).indexOf(listener);
      if (index !== -1) {
        this.listeners.get(event).splice(index, 1);
      }
    }
  }

  emit(event, ...args) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach((listener) => listener(...args));
    }
  }
}
