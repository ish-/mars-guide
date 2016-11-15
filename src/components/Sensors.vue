<template lang="pug">

.c-sensors
  button.o-btn.o-btn__paneled(@click="$.wifi.enable()")
    .o-icon.o-icon__wifi(v-if="$.wifi.available")
    .o-icon.o-icon__wifi-off(v-if="!$.wifi.available")
  button.o-btn.o-btn__paneled(@click="$.bluetooth.enable()")
    .o-icon.o-icon__bluetooth(v-if="$.bluetooth.enabled")
    .o-icon.o-icon__bluetooth-off(v-if="!$.bluetooth.enabled")
  button.o-btn.o-btn__paneled(@click="$.location.enable()")
    .o-icon.o-icon__location(v-if="$.location.enabled")
    .o-icon.o-icon__location-off(v-if="!$.location.enabled")

</template>
<style lang="stylus">

.o-btn__paneled
  padding: $btn-layout-padding
  background-color: $btn-layout-bg
  border-radius: 56px
  margin-bottom: 10px
  
  .o-icon
    size: $btn-layout-size
    background-size: contain

.c-sensors
  width: $btn-layout-size
    
  
  .o-icon
    &__bluetooth
      background-image: url('../assets/bluetooth.svg')
    &__bluetooth-off
      animation: blink .9s infinite
      background-image: url('../assets/bluetooth-off.svg')
    &__location
      background-image: url('../assets/location.svg')
    &__location-off
      animation: blink .9s infinite
      background-image: url('../assets/location-off.svg')
    &__wifi
      background-image: url('../assets/wifi.svg')
    &__wifi-off
      animation: blink .9s infinite
      background-image: url('../assets/wifi-off.svg')
    

</style>