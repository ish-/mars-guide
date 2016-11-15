import {IS_ANDROID, IS_IOS} from 'config'

var bluetooth = new Vue ({
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
        cordova.plugins.diagnostic.switchToBluetoothSettings();
    },
    init: function () {
      setTimeout(() => {
        cordova.plugins.diagnostic.isBluetoothAvailable(function(enabled){
          bluetooth.enabled = enabled
          if (!enabled && IS_ANDROID)
            cordova.plugins.locationManager.enableBluetooth(() => {
              document.addEventListener('beforeunload', () => cordova.plugins.locationManager.disableBluetooth() )
            })
          console.log("Bluetooth setting is " + (enabled ? "enabled" : "disabled"));
        }, function(error){
          console.error("The following error occurred: "+error);
        });

        cordova.plugins.diagnostic.registerBluetoothStateChangeHandler(function(state){
          console.log('Bluetooth state is: ' + state)
          if(state === cordova.plugins.diagnostic.bluetoothState.POWERED_ON)
            return bluetooth.enabled = true
          if(state === cordova.plugins.diagnostic.bluetoothState.POWERED_OFF)
            return bluetooth.enabled = false
        });
      }, IS_IOS ? 500 : 0)

      if (IS_ANDROID)
        cordova.plugins.diagnostic.hasBluetoothSupport((supported) => {
          this.$emit('ble-support', supported)
        }, function(error){
          console.error("The following error occurred: "+error);
        });
    }
  },
})

export default bluetooth