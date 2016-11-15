<script lang="babel">

import Shared from 'services/shared'
import Spinner from 'components/spinner'
import Language from 'components/Language'
// import ping from 'services/ping'
import wifi from 'services/wifi'

export default {
  props: ['url'],
  data: function () {
    return {
      playing: false,
      show: false,
      seek: 0,
      ended: false,
      loading: false,
      active: false,
      error: false,
      initDate: 0,
    }
  },
  components: {
    Spinner, Language
  },
  methods: {
    reinit (initDate) {
      if (initDate !== this.initDate)
        return
      this.init(this.url, this._lastCurrentTime)
    },
    init (url, currentTime) {
      console.log('VideoPlayer init ', url)
      if (!url)
        return console.error('VideoPlayer: You should specify url')
      this.active = true
      this.error = false
      if (this.$currentVideo) {
        this.stop()
      }
      this.loading = true
      var $video = document.createElement('VIDEO')
      this.seek = 0
      this.$currentVideo = $video
      $video.controls = false
      if (config.IS_ANDROID)
        $video.poster = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
      else
        $video.playsInline = $video.webkitPlaysInline = true
      $video.addEventListener('timeupdate', this._onTimeupdate)
      $video.addEventListener('waiting', this._onWaiting)
      $video.addEventListener('error', this._onError)
      $video.addEventListener('canplay', this._onCanplay)
      this.setLoadingTimeout()
      this.initDate = Date.now()
      $video.src = url
      $video.load()
      if (currentTime)
        $video.currentTime = Math.max(currentTime, 0)
      this.show = true
      this.error = this.playing = false
      this.showControls()
      this.$nextTick(() => {
        this.ended = false
        this.$el.appendChild($video)
      })
    },
    stop () {
      if (!this.$currentVideo)
        return

      this.$currentVideo.pause()
      this.$currentVideo.removeEventListener('timeupdate', this._onTimeupdate)
      this.$currentVideo.removeEventListener('waiting', this._onWaiting)
      this.$currentVideo.removeEventListener('error', this._onError)
      this.$el.removeChild(this.$currentVideo)
      this.$currentVideo = null
    },
    destroy () {
      this.stop()
      this.active = false
    },
    setLoadingTimeout (time) {
      clearTimeout(this.loadingTimeout)
      this.loadingTimeout = setTimeout(this._onError, time || config.VIDEO_LOADING_TIMEOUT)
    },
    _onCanplay (e) {
      if (e.target !== this.$currentVideo)
        return
      clearTimeout(this.loadingTimeout)
      this.loading = false
      this._lastCurrentTime = 0
      if (!Shared.appPaused) {
        this.play()
      }
    },
    _onTimeupdate () {
      var $video = this.$currentVideo
      this.seek = $video.currentTime / $video.duration
      if ($video.currentTime === $video.duration) {
        this.playing = false
        this.ended = true
      }
    },
    _onWaiting () {
      this.loading = true
      this.setLoadingTimeout(config.VIDEO_LOADING_TIMEOUT * 3)
    },
    _onError () {
      this.loading = false
      this.error = "VIDEO_ERROR"
      clearTimeout(this.loadingTimeout)
      this._lastCurrentTime = this.$currentVideo.currentTime

      this.stop()

      // this.waitVideoServer()
    },
    waitVideoServer () {
      var initDate = this.initDate
      setTimeout(() => {
        wifi.checkAvailable((status) => status && this.reinit(initDate))
      }, 3000)
    },
    pause () {
      this.playing = false
      if (!this.$currentVideo)
        return
      try {
        this.$currentVideo.pause()
      } catch (e) {
        this.$currentVideo.play()
      }
    },
    play () {
      this.ended = false
      if (!this.$currentVideo)
        return
      this.playing = true
      this.$currentVideo.play()
    },
    togglePlayback () {
      if (this.loading)
        return
      !this.playing ? this.play() : this.pause()
    },
    showControls () {
      if (this.controlsTimeout)
        clearTimeout(this.controlsTimeout)
      this.controlsTimeout = _.setClassFor(this.$el, 'is-interactive', 3000)
    },
  },
  watch: {
    url (url) {
      if (url)
        return this.init(url)
      this.destroy()
    }
  },
  created () {
    this.$currentVideo = null
    this.controlsTimeout = null
    this.checking = _.noop

    this._onTimeupdate = this._onTimeupdate.bind(this)
    this._onError = this._onError.bind(this)
    this._onWaiting = this._onWaiting.bind(this)
    this._onCanplay = this._onCanplay.bind(this)

    cordova.on('resume', () => !this.ended && this.play())
    cordova.on('pause', () => this.pause())
    cordova.on('online', () => this.error && this.waitVideoServer())
  },
  beforeDestroy () {
    this.destroy()
  }
}

</script>
<template lang="pug">

transition(name="opacity-transition", appear)
  .c-vplayer(:class="{'is-loading': loading, 'is-paused': !playing, 'is-ended': ended}", v-show="active")
    .c-vplayer__controls(@click='showControls()')
      language
      button.o-btn.o-btn-play.o-clickable(@click.stop="togglePlayback()", v-show="!loading && !error")
        transition(name="opacity-scale")
          .o-btn-play__icon-play(v-if="!playing", key="play")
          .o-btn-play__icon-pause(v-else, key="pause")
      .c-vplayer__time(ref='time', :style="{transform: 'translateX(' + (seek-1)*100 + '%)'}")
    transition(name="opacity", appear)
      spinner(v-if="loading", :alt="$.l['LOADING']", key="loading")
      .c-vplayer__error(v-if='error', key="error") 
        span {{$.l[error]}}
        br
        button.o-btn.o-btn__action(@click="reinit(initDate)") {{$.l['VIDEO_RELOAD']}}
    //- transition(name="opacity")
    .o-btn.o-btn__share.o-btn__paneled(v-if="$.DEV", @click="$emit('click-feedback'), pause()")
      .o-icon.o-icon__share

</template>
<style lang="stylus">

.c-vplayer
  background: $backdrop-color
  // fixed: top left right bottom
  fullscreen()
  z-index: 100
  text-align: center

  display: flex
  flex-direction: column
  align-items: center
  justify-content: space-around

  overflow: hidden
  
  .c-language
    absolute: right 10px top 10px
    z-index: 101
    

  // &__loading
  //   flex-center()
    
  //   span
  //     position: absolute
  //     margin-top: 70px
  
  &__controls
    opacity: 0
    z-index: 101
    absolute: left bottom right top
    transition: opacity .2s
    transition-timeout: 0
    
    display: flex
    flex-direction: column
    align-items: center
    justify-content: space-around

  // &.is-loading .loading
  //   display: inline-block
  
  .c-vplayer__error
    // absolute: top 20px left 20px
    transition-delay: .2s
    z-index: 101
    
    span
      background: $backdrop-color
      padding: 10px 15px
      color: white

    .o-btn__action
      margin-top: 20px
      // background-color: rgb(99, 199, 242)

  .c-vplayer__time
    absolute: left right bottom
    background-color: white
    height: 2px
  

  &.is-paused &__controls,
  &.is-interactive &__controls
    opacity: 1
    transition-timeout: .4s
    
  &.is-paused .o-btn__share,
  &.is-interactive .o-btn__share
    opacity: 1
    transition-timeout: .4s
  

  video
    transition: opacity .3s
    opacity: 1
    width: 100%
    height: 100%
    
  &.is-ended video
    opacity: 0
  
  
  &.is-paused,
  &.is-loading
    video
      opacity: .4
    
  .o-btn__share
    background: none
    absolute: bottom 10px right 10px
    z-index: 200
    transition-default()
    opacity: .2
    
    .o-icon.o-icon
      width: $btn-layout-size - 10px
      height: $btn-layout-size - 10px
    
    .o-icon__share
      background-image: url('../assets/share.svg')
    
.o-btn-play
  size: 140px
  margin: 0 50px
  position: relative  

  > *
    pointer-events: none
  
  &:after
    content: ''
    size: 140px
    border-radius: (@width / 2)
    // background-image: radial-gradient(74% 131%, #C1F1FF 31%, #F2F8FF 100%);
    background: rgba(0,0,0,.5)
    absolute: top left
    
    transition: box-shadow .1s ease
    box-shadow: 0 0 0 0 black inset
    
  &.is-clicked:after
    box-shadow: 0 2px 5px 0 grey inset
    z-index: 1
  
  // &:before
  //   content: ''
  //   size: 160px
  //   border-radius: (@width / 2)
  //   background-image: radial-gradient(74% 131%, #C1F1FF 31%, #F2F8FF 100%);
  //   absolute: top -10px left -10px
  //   transform: scale(0.8)
  //   opacity: 0
  //   transition: all .4s ease
    
  // &.is-loading:before
  //   transform: scale(1)
  //   opacity: 1
  //   animation: rotate .2s infinite
  //   z-index: 1

  &__icon-pause
    size: 42px 54px
    absolute: top 50% left 50%
    margin-top: -(@height / 2)
    margin-left -(@width / 2)
    z-index: 2
    
    &:before, &:after
      size: 16px 54px
      content: ''
      background: white
      position: absolute
      
    &:before
      left: 0
    &:after
      right: 0
      

  &__icon-play
    $size = 54px
    $half-size = $size / 2

    absolute: top 50% left 50%
    margin-top: -($size / 2)
    margin-left: -($size / 2 - $size / 7)
    z-index: 2
    
    width: 0;
    height: 0;
    border-style: solid;
    border-width: $half-size 0 $half-size $size;
    border-color: transparent transparent transparent white;
    
    &.opacity-scale-enter
      transform: scale(.6)
    &.opacity-scale-leave
      transform: scale(2)
</style>