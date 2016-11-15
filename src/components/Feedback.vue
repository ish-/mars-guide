<script lang="babel">

const SHARE_MSG_TPL = "#marsgallery\n\n"

export default {
  data () {
    return {
      video: '',
      photo: '',
      text: '',
      name: ''
    }
  },
  methods: {
    getPhoto () {
      navigator.camera.getPicture((url) => {
        console.log(url)
        this.photo = url
      }, this._onError)
    },
    getVideo () {
      navigator.device.capture.captureVideo(([{fullPath}]) => {
        console.log(fullPath)
        this.video = fullPath
      }, this._onError)
    },
    getFromAlbum () {
      navigator.camera.getPicture((url) => {
        this.photo = url
      }, this._onError, {
        quality: 90,
        sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
        mediaType: Camera.MediaType.ALLMEDIA,
      })
    },
    share (via) {
      if (!via)
        return window.plugins.socialsharing.share(
          SHARE_MSG_TPL + this.$refs.text.value.trim(), 
          this.photo,
          null,
          this._onSuccess,
          this._onError
        )

      window.plugins.socialsharing.shareVia(
        via || null, 
        SHARE_MSG_TPL + this.$refs.text.value.trim(), 
        this.photo,
        null,
        this._onSuccess,
        this._onError
      )
    },
    _onSuccess (e) {
      console.log(e)
    },
    _onError (e) {
      console.error(e)
    },
    _onError (err) {
      console.error(err)
    },
    _preventDefault (e) {
      e.preventDefault()
    }
  },
  mounted () {
    cordova.ready(() => {
      setTimeout(() => {
        window.screen.lockOrientation('portrait')
      })
    })
  },
  beforeDestroy () {
    window.screen.lockOrientation('landscape')
  }
}

</script>
<template lang="pug">

.c-feedback
  .c-feedback__panel
    .o-btn.o-btn-back(@click="$emit('close')")
      .o-icon.o-icon__cross
    h2 Отзыв
  form(@submit="_preventDefault")
    .form-group.c-feedback__name
      label(for="feedback__name") Name: 
      input(id="feedback__name", name="name", ref="name")
    .form-group.c-feedback__text
      label(for="feedback__text") Ваш отзыв:
      textarea(ref="text", id="feedback__text", name="text")
    .form-group
      button.o-btn.o-btn__action(@click="getVideo()") + video
      | &nbsp;
      button.o-btn.o-btn__action(@click="getPhoto()") + photo
      | &nbsp;
      button.o-btn.o-btn__action(@click="getFromAlbum()") + from album
      br
      img(:src="photo", v-if="photo", height="100")
      br
      video(:src="video.fullPath", v-if="video", height="100")
  .c-feedback__submit
    h2 Share via:
    button.o-btn.o-btn__action(@click="share('facebook')") facebook
    button.o-btn.o-btn__action(@click="share('vk')") vk
    button.o-btn.o-btn__action(@click="share()")  other

</template>
<style lang="stylus">

$panel-height = 60px

.c-feedback
  fullscreen()
  z-index: 400
  background: black
  overflow-y: auto
  
  .o-btn-back
    float: right
    padding: 10px
    margin-top: 5px
    margin: -5px -10px
    
    .o-icon
      size: 32px
      background-size: contain
      background-image: url('../assets/cross.svg')
      background-repeat: no-repeat
  
  &__submit
    fixed: bottom 10px right 10px left 10px
    
  &__panel
    line-height: 40px
    padding: 10px 20px
    height: $panel-height
    background: white
    
    .t-ios &
      padding-top: 30px
      height: 80px
    
    h2
      color: black
      display: inline-block
  
  .form-group
    position: relative
    padding: 10px 0
    
    label
      background: black
      color: white
      padding: 0 10px
      absolute: top left 10px
      
    input, textarea
      background: black
      border: 1px solid white
      border-radius: 3px
      color: white
      font-size: 21px
      padding: 15px 10px 10px
      width: 100%
  
  form
    width: 100%
    max-width: 480px
    margin: 0 auto
    position: relative
    padding: $page-padding

</style>