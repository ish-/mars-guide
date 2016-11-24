import language from 'language'

import ping from 'services/ping'
import bluetooth from 'services/bluetooth'
import location from 'services/location'
import beacons from 'services/beacons'
import wifi from 'services/wifi'

import {MOCK_RANGING_AVAILABLE} from 'config'

var _lang = localStorage.getItem('lang') || (/ru/i.test(window.navigator.language) ? 'RU' : 'EN')
var inPlaceTimeout

var Shared = new Vue ({
  data: {
    DEV: config.DEV,
    location, bluetooth, beacons, wifi,
    language: _lang,
    l: language[_lang],
    appPaused: false,
    online: false,
    inPlace: true,
    config,
  },
  computed: {
    rangingAvailable: function () {
      var enabled = Shared.location.enabled && Shared.bluetooth.enabled
      this.$emit('beacons:available', enabled)
      cordova.ready(() => {
        this.beacons[enabled ? 'enable' : 'disable']()
      })
      return MOCK_RANGING_AVAILABLE || enabled
    },
  },
  watch: {
    language (lang) {
      this.l = language[lang]
    },
    'beacons.available' (available) {
      if (!this.rangingAvailable)
        return this.inPlace = false

      if (available.length) {
        clearTimeout(inPlaceTimeout)
        return this.inPlace = true
      }

      if (inPlaceTimeout)
        return
      inPlaceTimeout = setTimeout(() => {
        if (!this.beacons.available.length)
          this.inPlace = false
      }, 10000)
    }
  },
  methods: {
    checkInPlace () {
      setTimeout()
    }
  },
  created () {
    this.bluetooth.$on('ble-support', (supported) => {
      if (!supported)
        alert('Your device does not support BluetoothLE technology to locate beacons')
    })
    cordova.ready(() => {
      location.init()
      wifi.init()
      bluetooth.init()
      beacons.init()
    })

    cordova.on('pause', () => this.appPaused = true)
    cordova.on('resume', () => this.appPaused = false)

    cordova.on('online', () => this.online = true)
    cordova.on('offline', () => this.online = false)
  }
})

export default Shared