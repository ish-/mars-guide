Object.assign(window.cordova || (window.cordova = {}), {
  _ready: false,
  ready (fn) {
    if (this._ready)
      return fn()
    this.on('deviceready', fn)
  },
  on: _.on.bind(_, document),
  once: _.once.bind(_, document),
})

var pauseTimeout
cordova.on('pause', function () {
  console.log('App is paused')
  clearTimeout(pauseTimeout)
  pauseTimeout = setTimeout(function () {
    window.navigator.app.exitApp()
  }, 3 * 60000)
})
cordova.on('resume', function () {
  console.log('App is resumes')
  clearTimeout(pauseTimeout)
})
cordova.on('backbutton', function () {
  window.navigator.Backbutton.goBack(null, () => console.error('Cannot go back'));
})

cordova.ready(function onCordovaReady () {
  // navigator.splashscreen.hide()
  window.screen.lockOrientation('landscape-primary')
  // cordova.plugins.backgroundMode.setDefaults({silent: true})
  // cordova.plugins.backgroundMode.enable()
  AndroidFullScreen.immersiveMode()
  cordova._ready = true
})