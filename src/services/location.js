import {IS_ANDROID, IS_IOS} from 'config'

var location = new Vue ({
  data: {
    enabled: false,
  },
  methods: {
    enable: function () {
      if (this.enabled)
        return
      if (IS_IOS)
        cordova.plugins.diagnostic.switchToSettings();
      else
        cordova.plugins.diagnostic.switchToLocationSettings();
    },
    check () {
      cordova.plugins.diagnostic.isLocationAvailable(function(enabled){
        location.enabled = enabled
        console.log("Location setting is " + (enabled ? "enabled" : "disabled"));
      }, function(error){
        console.error("The following error occurred: "+error);
      });
    },
    init: function () {
      cordova.on('resume', this.check)
      this.check()
      cordova.plugins.diagnostic.registerLocationStateChangeHandler(function(state){
        if((cordova.platformId === "android" && state !== cordova.plugins.diagnostic.locationMode.LOCATION_OFF)
            || (cordova.platformId === "ios") && ( state === cordova.plugins.diagnostic.permissionStatus.GRANTED
            || state === cordova.plugins.diagnostic.permissionStatus.GRANTED_WHEN_IN_USE
        )){
          location.enabled = true
          console.log("Location is available");
        } else {
          location.enabled = false
          console.log("Location is NOT available");
        }
      });
    }
  },
})

export default location