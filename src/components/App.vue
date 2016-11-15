<script lang="babel">

import Shared from 'services/shared'
import VideoPlayer from 'components/VideoPlayer'
import Sensors from 'components/Sensors'
import Feedback from 'components/Feedback'
import Spinner from 'components/spinner'

import {MOCK_CURRENT_BEACON} from 'config'

export default {
  data () {
    return {
      videoUrl: '',
      showFeedback: false,
      showDebug: true,
    }
  },
  components: {
    VideoPlayer, Sensors, Feedback, Spinner
  },
  // created: function () {
  //   var that = this
  // },
  methods: {
    playBeaconVideo (beacon) {
      var videoName
      if (!beacon || !(videoName = config.BEACON_VIDEO_MAP[beacon.minor]))
        return
      this.setVideoUrl(videoName)
    },
    setVideoUrl (videoName, lang = Shared.language) {
      this.videoName = videoName
      this.videoUrl = config.VIDEO_PATH + lang.toLowerCase() + '/' + videoName + '.mp4'
    },
    _playVideoOnIosSimulator (minor = 6842) {
      Shared.bluetooth.enabled = true
      Shared.beacons.available = []
      setTimeout(() => {
        Shared.beacons.current = {minor}
      }, 2000)
    }
  },
  mounted: function () {
    if (MOCK_CURRENT_BEACON)
      Shared.$.beacons.current = MOCK_CURRENT_BEACON
    // setTimeout(() => {
      // this.$refs.player.init(config.VIDEO_PATH + '4 What Hides The Voice READY.mp4')
      // if (!Shared.beacons.current.minor)
      //   this.setVideoUrl(config.BEACON_VIDEO_START)
        // this.videoUrl = config.VIDEO_PATH + '4 What Hides The Voice READY.mp4'
    // }, 2500)
  },
  watch: {
    '$.beacons.current' (beacon, old) {
      if (!beacon || (old && beacon.minor === old.minor))
        return
      this.playBeaconVideo(beacon)
    },
    '$.language' (lang, old) {
      if (!lang || lang === old)
        return
      this.setVideoUrl(this.videoName, lang)
    },
  },

}

</script>
<template lang="pug">

#app
  #app-logo-container: img(src="res/mars-logo-recentered.jpg")
  .debug-beacons(v-if='showDebug && $.DEV && $.rangingAvailable', @click="showDebug = !showDebug")
    .beacon(style='font-style: bold')
      span Selected: <b>{{$.beacons.current.minor}} ({{$.config.BEACON_VIDEO_MAP[$.beacons.current.minor]}})</b> {{$.beacons.current.rssi}} ({{$.beacons.current.accuracy}}) {{$.beacons.current._time !== $.beacons.updateTime ? 'no sig' : ''}}
    div Available:
      .beacon(v-for='b in $.beacons.available', track-by='b.minor') 
        span <b>{{b.minor}} ({{$.config.BEACON_VIDEO_MAP[b.minor]}})</b> {{b.rssi}} ({{b.accuracy}}) {{b._time !== $.beacons.updateTime ? 'no signal' : ''}}
  //- .msg-not-in-place(v-if="!$.inPlace") {{$.l['NOT_IN_PLACE']}}
  video-player(
    ref='player',
    :url="$.rangingAvailable && videoUrl",
    @click-feedback="showFeedback = true")
  transition(name="opacity")
    spinner(
      v-if="$.rangingAvailable && !$.beacons.current.minor",
      :alt="$.inPlace ? $.l['SEARCHING'] : $.l['NOT_IN_PLACE']")
  transition(name="translate-from-left", appear)
    sensors(v-if="!$.rangingAvailable")
  transition(name="translate-from-down")
    feedback(v-if="showFeedback",
      ref="feedback",
      @close="showFeedback = false")

</template>
<style lang="stylus">

.debug-beacons
  absolute: top $ios-statusbar-height left $page-padding
  z-index: 3000
  
  .beacon span
    background: $backdrop-color

.msg-not-in-place
  background: $backdrop-color
  padding: 10px 15px
  color: white

    
#app 
  > .c-sensors
    size: 68px 136px
    absolute: top 50% left 10px
    margin-top: -107px
    z-index: 200
    
  .c-spinner
    absolute: left 50% top 50%
    margin-top: -5px
    margin-left: -5px  
    z-index: 101
    
    &:after
      position: absolute
      margin-top: 65px
      content: attr(alt)
      margin-left: -100px
      width: 200px
      text-align: center
      background: $backdrop-color
      
  > .c-spinner:after
    margin-left: -50px
    width: 100px
  
#app-logo-container
  display: flex
  flex-direction: column
  align-items: center
  justify-content: space-around
  height: 100%
  fullscreen()
  
  img
    opacity: .9
    height: 80%
    max-height: 350px

</style>