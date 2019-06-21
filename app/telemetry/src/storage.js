export default {
  storage: {},
  memory: true,
  get (key) {
    let stored
    try {
      stored = (window.localStorage && window.localStorage.getItem(key)) || this.storage[key]
    } catch (e) {
      stored = this.storage[key]
    }
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch (e) {
        return undefined
      }
    } else {
      return undefined
    }
  },
  set (key, value) {
    // handle Safari private mode (setItem is not allowed)
    value = JSON.stringify(value)
    try {
      window.localStorage.setItem(key, value)
    } catch (e) {
      if (!this.memory) {
        console.error('setting local storage failed, falling back to in-memory storage')
        this.memory = true
      }
      this.storage[key] = value
    }
  }
}
