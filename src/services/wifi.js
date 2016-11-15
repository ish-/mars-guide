import {IS_ANDROID, IS_IOS, MOCK_WIFI_ENABLED} from 'config'
import ping from 'services/ping'

var wifi = new Vue({
  data: {
    enabled: MOCK_WIFI_ENABLED || false,
    available: false,
  },
  methods: {
    init () {
      this.checkAvailable()
    },
    enable (silent) {
      if (this.enabled)
        return
      if (IS_ANDROID)
        cordova.plugins.diagnostic.setWifiState(
          this.checkAvailable, 
          silent ? null : ::this.enableViaSettings, 
          true
        )
      else
        this.enableViaSettings()
    },
    check (cb) {
      cordova.plugins.diagnostic.isWifiAvailable((enabled) => {
        this.enabled = enabled
        if (!enabled)
          this.enable(true)
        cb && cb(enabled)
        console.log("WiFi is " + (enabled ? "enabled" : "disabled"));
      }, function(error){
        cb && cb(false)
        console.error("The following error occurred: "+error);
      });
    },
    checkAvailable (cb) {
      this.check((enabled) => {
        if (!enabled)
          return this.available = false
        ping.subscribe((status) => {
          this.available = status
          if (status)
            cb && cb(true)
        })
      })
    },
    enableViaSettings () {
      if (IS_IOS)
        cordova.plugins.diagnostic.switchToSettings()
      else
        cordova.plugins.diagnostic.switchToWifiSettings()

      cordova.once('resume', () => this.checkAvailable())
    },
  },
  created () {
    this.$watch('enabled', (enabled) => {
      if (!enabled)
        return this.available = false

      // ping.subscribe((status) => status && (this.enabled = this.available = true))
      //   if (!status)
      //     return
      //   this.enabled = this.available = true
      // })
    }, {immediate: true})
  }
})

export default wifi