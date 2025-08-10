// --- State.js (Reactive Store) ---
const State = {
  role: 'default',
  listeners: {},

  set(key, value) {
    const oldValue = this[key];
    this[key] = value;
    if (this.listeners[key]) {
      this.listeners[key].forEach(fn => fn(value, oldValue));
    }
  },

  get(key) {
    return this[key];
  },

  on(key, fn) {
    if (!this.listeners[key]) this.listeners[key] = [];
    this.listeners[key].push(fn);
  }
};

export default State;