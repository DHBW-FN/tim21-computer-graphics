import EventManager from "./eventmanager";

/**
 * Class representing a time manager for tracking and notifying events related to the time of day.
 */
export default class TimeManager {
  /**
   * The start hour of the day.
   * @type {number}
   * @static
   */
  static DAY_START = 6;

  /**
   * The end hour of the day.
   * @type {number}
   * @static
   */
  static DAY_END = 18;

  /**
   * The name of the event triggered when the day changes.
   * @type {string}
   * @static
   */
  static DAY_CHANGE_EVENT = "dayChange";

  /**
   * Create a TimeManager instance.
   * @constructor
   */
  constructor() {
    /**
     * The current time represented as a Date object.
     * @type {Date}
     */
    this.currentTime = new Date();

    /**
     * The interval (in milliseconds) at which the time is updated.
     * @type {number}
     */
    this.updateInterval = 1000;

    /**
     * An event manager for handling and notifying events related to time changes.
     * @type {EventManager}
     */
    this.eventManager = new EventManager();
  }

  /**
   * Update the current time and notify if there is a change in the time of day.
   * @returns {number} The time elapsed since the last update, in milliseconds.
   */
  updateTime() {
    const prevTime = this.currentTime;
    this.currentTime = new Date();
    const deltaTime = this.currentTime - prevTime;

    const isDay = this.isDay();
    const wasDay = this.isDay(prevTime);

    if (isDay !== wasDay) {
      this.notify(isDay, this.currentTime, deltaTime);
    }

    return deltaTime;
  }

  /**
   * Check if it is daytime.
   * @param {Date} [time=this.currentTime] - The time to check. Defaults to the current time.
   * @returns {boolean} True if it is daytime, false otherwise.
   */
  isDay(time = this.currentTime) {
    const hours = time.getHours();
    return hours >= TimeManager.DAY_START && hours < TimeManager.DAY_END;
  }

  /**
   * Start updating the time and notify the initial time of day.
   */
  startUpdating() {
    this.notify(this.isDay(), this.currentTime, 0);

    this.intervalId = setInterval(() => this.updateTime(), this.updateInterval);
  }

  /**
   * Stop updating the time.
   */
  stopUpdating() {
    clearInterval(this.intervalId);
  }

  /**
   * Set the time of day to daytime and notify the change.
   */
  setDay() {
    this.notify(true, this.currentTime, 0);
  }

  /**
   * Set the time of day to nighttime and notify the change.
   */
  setNight() {
    this.notify(false, this.currentTime, 0);
  }

  /**
   * Notify the event manager about a change in the time of day.
   * @param {boolean} isDay - Whether it is currently daytime.
   * @param {Date} currentTime - The current time.
   * @param {number} deltaTime - The time elapsed since the last update, in milliseconds.
   */
  notify(isDay = this.isDay(), currentTime = this.currentTime, deltaTime = 0) {
    this.eventManager.emit(TimeManager.DAY_CHANGE_EVENT, {
      isDay,
      currentTime,
      deltaTime,
    });
  }
}
