<script lang="babel">

import {IS_ANDROID, IS_IOS} from 'config'

const SHARE_MSG_TPL = "#marsgallery\n\n"

export default {
  data () {
    return {
      attachment: null,
      attachmentType: null,
      text: '',
      name: ''
    }
  },
  methods: {
    setAttachment (url) {
      var type = url && (/\.(gif|jp?g|tiff|png)$/i).test(url) ? 'image' :
        (/avi|wmv|flv|mp?g|mp4$|mov|3gp/i).test(url) ? 'video' : null

      if (!type)
        return this.attachment = this.attachmentType = null
      this.attachmentType = type
      this.attachment = url
      return url
    },
    getPhoto () {
      navigator.camera.getPicture((url) => {
        console.log(url)
        this.setAttachment(url)
      }, this._onError)
    },
    getVideo () {
      navigator.device.capture.captureVideo(([{fullPath}]) => {
        console.log(fullPath)
        this.setAttachment(fullPath)
      }, this._onError)
    },
    getFromAlbum () {
      navigator.camera.getPicture((url) => {
        if (IS_ANDROID)
          url = 'file://' + url
        this.setAttachment(url)
      }, this._onError, {
        quality: 90,
        sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
        mediaType: Camera.MediaType.ALLMEDIA,
      })
    },
    share (via) {
      var name = this.$refs.name.value.trim(),
          text = this.$refs.text.value.trim()
      // if (!name) {
      //   alert(this.$.l['FEEDBACK_FILL_NAME'])
      //   this.$refs.name.focus()
      //   return 
      // }
      if (!via)
        return window.plugins.socialsharing.share(
          SHARE_MSG_TPL + text, 
          null,
          this.attachment,
          null,
          this._onSuccess,
          this._onError
        )

      if (via === 'vk')
        return window.plugins.socialsharing.shareVia(
          'vk',
          SHARE_MSG_TPL + text, 
          null,
          this.attachment,
          null,
          this._onSuccess,
          this._onError
        )

      if (via === 'facebook')
        return window.plugins.socialsharing.shareViaFacebookWithPasteMessageHint(
          SHARE_MSG_TPL + text, 
          this.attachment,
          null,
          'Paste it dude!',
          this._onSuccess,
          this._onError
        )
    },
    removeAttachment (e) {
      if (confirm(this.$.l['CONFIRM_CLEAR_ATTACHMENT']))
        this.attachment = this.attachmentType = ''
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
      setTimeout(() => window.screen.lockOrientation('portrait-primary'))
      this.setAttachment('file:///storage/emulated/0/DCIM/Camera/IMG_20161124_201706.jpg')
    })
  },
  beforeDestroy () {
    setTimeout(() => window.screen.lockOrientation('landscape-primary'))
  }
}

</script>
<template lang="pug">

.c-feedback
  .c-feedback__panel
    .o-btn.o-btn-back(@click="$emit('close')")
      .o-icon.o-icon__cross
    h2 {{$.l['FEEDBACK_TITLE']}}
  form(@submit="_preventDefault")
    .form-group.c-feedback__name
      label(for="feedback__name") {{$.l['YOUR_NAME']}}: 
      input(id="feedback__name", name="first_name", ref="name", required)
    .form-group.c-feedback__text
      label(for="feedback__text") {{$.l['YOUR_OPINION']}}:
      textarea(ref="text", id="feedback__text", name="text")
    .form-group
      div(v-if="!attachment")
        button.o-btn.o-btn__action(@click="getVideo()") + {{$.l['VIDEO']}}
        button.o-btn.o-btn__action(@click="getPhoto()") + {{$.l['PHOTO']}}
        button.o-btn.o-btn__action(@click="getFromAlbum()") + {{$.l['FROM_ALBUM']}}
      .c-feedback__attachment(v-if="attachment")
        video(:src="attachment", v-if="attachmentType === 'video'", preload, onclick="this.paused ? this.play() : this.pause()")
        img(:src="attachment", v-if="attachmentType === 'image'", onclick="this.classList[this.classList.contains('is-fullwidth') ? 'remove' : 'add']('is-fullwidth')")
        .c-feedback__attachment-remove(@click="removeAttachment()")
  .c-feedback__submit
    h2 {{$.l['FEEDBACK_SHARE']}}
    div(style="white-space: nowrap")
      button.o-btn.o-btn__action(@click="share('facebook')") facebook
      button.o-btn.o-btn__action(@click="share('vk')") vk
      button.o-btn.o-btn__action(@click="share()")  other

</template>
<style lang="stylus">

$panel-height = 60px
$panel-bg = #1d1d1d

.c-feedback
  fullscreen()
  z-index: 400
  background: black
  overflow-y: auto
  padding-bottom: 100px
  
  .o-btn__action
    padding: 6px 10px
    box-shadow: 0 1px 3px -2px #007aff inset
    background: #1f3146
    // border: 1px solid #007aff
    border: 1px solid #98c9ff
    font-size: 16px
  
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
    text-align: right
    fixed: bottom 0 right 0 left 0
    padding: $page-padding
    background: transparentify($panel-bg, #000, .8)
    // background: rgba(24,24,24,.8)
    // background: #101010
    color: white
    
    h2
      display: inline-block
      // float: left

    button.o-btn__action
      color: white
      margin: 10px 0 0 10px
      font-size: 21px
      background: #2661a5
      border: 1px solid #9ea9b5
      
  &__attachment
    position: relative
    
    &-remove
      $size = 20px
      $margin = 5px
      $padding = 4px
      
      display: inline-block
      border-radius: 3px
      opacity: .7
      position: absolute
      margin: $margin 0 0 (-($size + $margin))
      size: $size
      background-position: center center
      background-size: ($size - $padding * 2) ($size - $padding * 2)
      background-image: url('../assets/cross.svg')
      background-repeat: no-repeat
      background-color: black
      
    video, img
      // position: relative
      // width: 100%
      max-height: 50vh
      max-width: 100%
      border-radius: 3px
      // border: 1px solid #333
      box-shadow: 0 0 0 1px rgba(100, 100, 100, .5) inset
      
      &.is-fullwidth
        min-width: 100%
        max-height: initial
    
  &__panel
    line-height: 40px
    padding: 10px 20px
    height: $panel-height
    background: $panel-bg
    
    .t-ios &
      padding-top: 30px
      height: 80px
    
    h2
      color: white
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
      // border: 1px solid #333
      box-shadow: 0 0 0 1px rgba(100, 100, 100, .5) inset
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
    
    button
      margin: 0 10px 10px 0

</style>