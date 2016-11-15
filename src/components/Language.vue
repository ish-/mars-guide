<script>

export default {
  // props: {
  //   'selected': {
  //     'default': () => config.LANGUAGES[1]
  //   }
  // },
  data () {
    return {
      languages: config.LANGUAGES,
    }
  },
  methods: {
    set (lang) {
      this.$.language = lang
      localStorage.setItem('lang', lang)
    }
  }
}

</script>

<template lang="pug">

.c-language
  button.c-language__btn(v-for="lang in languages", @click="set(lang)", :class="{'is-active': lang === $.language}") {{lang}}

</template>
<style lang="stylus">

.c-language
  border-radius: 5px
  height: $btn-layout-size
  background-color: $btn-layout-bg
  
  button
    padding: 0 13px
    height: $btn-layout-size
    line-height: $btn-layout-size
    font-size: 21px
    font-style: bold
    color: grey
    background: none
    
    &.is-active
      color: white

</style>