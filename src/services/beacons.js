import {MOCK_CURRENT_BEACON, BEACON_VIDEO_MAP} from 'config'

const BEACON_NULL = {minor: 0, rssi: -150, accuracy: 10}

var changeTimeout
var condidate = BEACON_NULL

var monitored = {}

var beacons = new Vue({
  data: {
    enabled: false,
    available: [],
    updateTime: 0,
    current: Object.assign({}, BEACON_NULL)
  },
  methods: {
    init: function () {
      var that = this

      var beaconRegion = new cordova.plugins.locationManager.BeaconRegion(config.BEACONS_UUID, config.BEACONS_UUID, config.BEACONS_MAJOR)

      var delegate = new cordova.plugins.locationManager.Delegate();

      delegate.didDetermineStateForRegion = function (pluginResult) {

          console.log('[DOM] didDetermineStateForRegion: ' + JSON.stringify(pluginResult));

          cordova.plugins.locationManager.appendToDeviceLog('[DOM] didDetermineStateForRegion: '
              + JSON.stringify(pluginResult));
      };

      delegate.didStartMonitoringForRegion = function (pluginResult) {
          console.log('didStartMonitoringForRegion:', pluginResult);

          console.log('didStartMonitoringForRegion:' + JSON.stringify(pluginResult));
      };

      delegate.didRangeBeaconsInRegion = (message) => {
        if (!this.enabled)
          return
        var beacons = message.beacons

        // beacons.sort(function (a, b) {
        //   return a.rssi < b.rssi
        // })

        // update current minor
        // var current
        var time = this.updateTime = Date.now()
        for (var i = 0; i < beacons.length; i++) {
          var beacon = beacons[i]
          beacon._time = time
          if (beacon.rssi !== 0)
            monitored[beacon.minor] = Object.assign(monitored[beacon.minor] || {}, beacon)
          // if (this.current.minor === beacon.minor) 
          //   this.current = beacon
        }

        this.available = Object.keys(monitored).map((minor) => {
          var beacon = monitored[minor]
          if (beacon._time !== time) {
            beacon.rssi -= 3
            beacon.accuracy = beacon.accuracy + .2
          }
          return beacon
        })
        .filter(({rssi, accuracy}) => rssi > -150 && accuracy < 10)
        .sort((a, b) => b.rssi - a.rssi)

        setTimeout(() => {
          var theFirst = this.available.length && this.available[0]
          if (this.current.minor !== theFirst.minor)
            this.changeCurrentBeacon(theFirst)
        })
      }

      this.beaconRegion = new cordova.plugins.locationManager.BeaconRegion(config.BEACONS_UUID, config.BEACONS_UUID, config.BEACONS_MAJOR);

      cordova.plugins.locationManager.setDelegate(delegate);
      cordova.plugins.locationManager.requestWhenInUseAuthorization(); 
      // cordova.plugins.locationManager.requestAlwaysAuthorization(); 
    },
    changeCurrentBeacon (beacon) {
      // console.log('changeCurrentBeacon (' + beacon.minor + ')')
      var isTheSameBeacon = beacon.minor === condidate.minor
      condidate = beacon

      if (isTheSameBeacon) {
        // console.log('beacon === condidate')
        return
      }
      
      clearTimeout(changeTimeout)

      var _change = (time) => {
        changeTimeout = setTimeout(() => {
          if (this.current.minor === condidate.minor) {
            // console.log('current.minor === condidate.minor')
            return
          }
          // console.log('check ::: current', JSON.stringify(this.current))
          // console.log('check ::: condidate', JSON.stringify(condidate))
          if (this.current.rssi + 5 < condidate.rssi 
            && this.current.accuracy > condidate.accuracy / 1.2
          ) {
            if (!BEACON_VIDEO_MAP[condidate.minor])
              return console.log('BEACONS NOT CHANGED CAUSE ITS NOT IN BEACON_VIDEO_MAP')
            this.current = condidate
            condidate = BEACON_NULL
            console.log('BEACON CHANGED TO ' + beacon.minor)
          }
          else {
            // console.log('try to change later')
            _change(800)
          }
        }, time || config.BEACONS_CHANGE_DEBOUNCE_TIME)
      }
      _change()
    },
    enable: function () {
      console.log('Ranging beacons: START')
      this.enabled = true
      cordova.plugins.locationManager.startRangingBeaconsInRegion(this.beaconRegion)
          .fail(function(e) { console.error(e); })
          .done();
      
    },
    disable: function () {
      console.log('Ranging beacons: STOP')
      this.enabled = false
      cordova.plugins.locationManager.stopMonitoringForRegion(this.beaconRegion)
        .fail(function(e) { console.error(e); })
        .done();
    },
  }
})

export default beacons