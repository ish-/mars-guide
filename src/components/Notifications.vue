<script lang="babel">

import notifications from 'services/notifications'

export default {
  data () {
    return {arr: notifications.arr}
  },
  methods: {
    close () {
      this.arr.splice(0, 1)
    },
    action (n) {
      this.close()
      n.action.cb()
    },
  }
}

</script>
<template lang="pug">

.c-notifications(v-if="arr.length")
  .c-notifications__notify(ref="notify")
    span.c-notifications__notify-text {{$.l[arr[0].text]}}
    span.c-notifications__notify-close(v-if="!arr[0].preventClose", @click="close()") {{$.l['HIDE']}}
    span.c-notifications__notify-action(v-if="arr[0].action", @click="action(n)") {{$.l[arr[0].action.text]}}

</template>
<style lang="stylus">

.c-notifications
  position: relative
  text-align: center

  &__notify
    background: white
    border-radius: 3px
    border: 1px solid black
    margin-top: 10px
    display: inline-block
    color: #333
    font-size: 14px
    
    * 
      display: inline-block
      padding: 5px 10px
      
    &-text
      margin-right: 10px
    
    &-action,
    &-close
      padding: 5px 10px
      float: right
      color: blue
      position: relative
      line-height: 15px
      
      &:before
        absolute: left top 50%
        content: ''
        font-size: 0
        height: 14px
        margin-top: -7px
        border: 1px solid grey
        border-width: 0 0 0 1px
        
</style>