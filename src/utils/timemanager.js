import EventManager from "./eventmanager";

export default class TimeManager {
  static DAY_START = 6;

  static DAY_END = 18;

  static DAY_CHANGE_EVENT = "dayChange";

  constructor() {
    this.currentTime = new Date();
    this.updateInterval = 1000;
    this.eventManager = new EventManager();
  }

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

  isDay(time = this.currentTime) {
    const hours = time.getHours();
    return hours >= TimeManager.DAY_START && hours < TimeManager.DAY_END;
  }

  startUpdating() {
    this.notify(this.isDay(), this.currentTime, 0);

    this.intervalId = setInterval(() => this.updateTime(), this.updateInterval);
  }

  stopUpdating() {
    clearInterval(this.intervalId);
  }

  setDay() {
    this.notify(true, this.currentTime, 0);
  }

  setNight() {
    this.notify(false, this.currentTime, 0);
  }

  notify(isDay = this.isDay(), currentTime = this.currentTime, deltaTime = 0) {
    this.eventManager.emit(TimeManager.DAY_CHANGE_EVENT, {
      isDay,
      currentTime,
      deltaTime,
    });
  }
}
