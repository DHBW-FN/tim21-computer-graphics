import EventManager from "./EventManager";

export default class TimeManager {
  static DAY_START = 6;

  static DAY_END = 18;

  static DAY_CHANGE_EVENT = "dayChange";

  constructor() {
    this.currentTime = new Date();
    this.updateInterval = 1000;
    this.eventManager = new EventManager();

    this.startUpdating();
  }

  updateTime() {
    const prevTime = this.currentTime;
    this.currentTime = new Date();
    const deltaTime = this.currentTime - prevTime;

    const isDay = this.isDay();
    const wasDay = this.isDay(prevTime);

    if (isDay !== wasDay) {
      this.eventManager.emit(TimeManager.DAY_CHANGE_EVENT, {
        isDay,
        currentTime: this.currentTime,
        deltaTime,
      });
    }

    return deltaTime;
  }

  isDay(time = this.currentTime) {
    const hours = time.getHours();
    return hours >= TimeManager.DAY_START && hours < TimeManager.DAY_END;
  }

  startUpdating() {
    this.intervalId = setInterval(() => this.updateTime(), this.updateInterval);
  }

  stopUpdating() {
    clearInterval(this.intervalId);
  }
}
