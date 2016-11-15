var utils = {
  setClassFor ($el, className, time) {
    $el.classList.add(className)
    return setTimeout(() => {
      $el.classList.remove(className)
    }, time || 300)
  },
  on ($el, eventName, fn) {
    $el.addEventListener(eventName, fn)
    return () => $el.removeEventListener(eventName, fn)
  },
  once ($el, eventName, fn) {
    var off = this.on($el, eventName, () => {off(), fn()})
    return off
  },
  noop (a) { return a},
}

module.exports = utils