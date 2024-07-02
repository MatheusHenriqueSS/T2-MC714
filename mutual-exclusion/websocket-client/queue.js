Array.prototype.pushSorted = function (el, compareFn) {
  this.splice((function (arr) {
    var m = 0;
    var n = arr.length - 1;

    while (m <= n) {
      var k = (n + m) >> 1;
      var cmp = compareFn(el, arr[k]);

      if (cmp > 0) m = k + 1;
      else if (cmp < 0) n = k - 1;
      else return k;
    }

    return -m - 1;
  })(this), 0, el);

  return this.length;
};

const sortByCounter = (a, b) => a.counter > b.counter;

class Queue {
  constructor() {
    this.queue = [];
  }

  enqueue(element) { // add element
    return this.queue.pushSorted(element, sortByCounter)
  }

  dequeue() {
    if (this.queue.length > 0) {
      return this.queue.shift();   // remove first element
    }
  }

  peek() {
    return this.queue[this.queue.length - 1];
  }

  size() {
    return this.queue.length;
  }

  isEmpty() {
    return this.queue.length == 0;
  }

  clear() {
    this.queue = [];
  }

  returnQueue() {
    return this.queue;
  }
}

module.exports = {
  Queue
}