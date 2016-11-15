const AUTOCLOSE_TIMEOUT = 5000

var notifications = new Vue({
  data: {
    arr: [], // {text: '', autoclose: false, action: {text: '' , cb: Function}}
  },
  methods: {
    add (n) {
      var i = this.arr.push(n)
      if (n.autoclose)
        setTimeout(() => {
          this.arr.splice(this.arr.indexOf(n), 1)
        }, n.autoclose === true ? AUTOCLOSE_TIMEOUT : n.autoclose)
    }
  }
})

window._notifications = notifications

export default notifications

export const NOT_IN_PLACE = {text: 'NOT_IN_PLACE'}
export const VIDEO_MIMPI = {
  text: 'NOTIFICATION_VIDEO_MIMPI', 
  action: {
    text: 'OPEN'
  }
}