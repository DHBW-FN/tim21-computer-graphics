/**
 * Class representing an event manager for handling and managing custom events.
 * @module
 */
export default class EventManager {
  /**
   * Create an EventManager instance.
   * @constructor
   */
  constructor() {
    /**
     * A map to store event listeners, where the keys are event names and the values are arrays of listeners.
     * @type {Map<string, Array<Function>>}
     */
    this.listeners = new Map();

    // Ensure singleton pattern
    if (EventManager.instance) {
      // eslint-disable-next-line no-constructor-return
      return EventManager.instance;
    }

    // Set the instance to this object
    EventManager.instance = this;
  }

  /**
   * Adds a listener function for a specific event.
   * @param {string} event - The name of the event.
   * @param {Function} listener - The listener function to be added.
   */
  addListener(event, listener) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(listener);
  }

  /**
   * Removes a listener function for a specific event.
   * @param {string} event - The name of the event.
   * @param {Function} listener - The listener function to be removed.
   */
  removeListener(event, listener) {
    if (this.listeners.has(event)) {
      const index = this.listeners.get(event).indexOf(listener);
      if (index !== -1) {
        this.listeners.get(event).splice(index, 1);
      }
    }
  }

  /**
   * Emits an event and calls all registered listeners for that event.
   * @param {string} event - The name of the event to be emitted.
   * @param {...any} args - Arguments to be passed to the event listeners.
   */
  emit(event, ...args) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach((listener) => listener(...args));
    }
  }
}
