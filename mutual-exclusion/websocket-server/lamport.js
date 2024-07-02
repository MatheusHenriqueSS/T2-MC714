const LamportClock = class LamportClock {
  constructor() {
    this.counter = 0;
  }

  increment() {
    this.counter += 1
  }

  update(received_clock) {
    this.counter = Math.max(this.counter, received_clock) + 1
  }

  getCounter() {
    return this.counter
  }

}

module.exports = {
  LamportClock
}