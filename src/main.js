import 'assets/polyfill'
import 'styles/main'

import {IS_IOS} from 'config'

window._errors = []

// window.addEventListener('error', ({error: {message, stack}}) => {
//   window._errors.push({message, stack});
// })
// window.onerror = ({error: {message, stack}}) => {
//   window._errors.push({message, stack});
// }

import 'services/cordova'
import FastClick from 'fastclick'
import Shared from 'services/shared'

import AppComponent from 'components/App'

window.Vue = Vue
window.AppComponent = AppComponent

// FastClick.attach(document.body)

Vue.prototype.$ = Shared
Vue.prototype._log = (...args) => {
  console.log(...args)
  return args[0]
}

document.addEventListener('load', () => document.documentElement.classList.add('is-loaded'))


// document.addEventListener('click', (e) => {
//   const $el = e.target
//   if (!$el.classList.contains('o-clickable'))
//     return true

//   let time = Number($el.getAttribute('o-clickable-time'))
//   _.setClassFor($el, time || 200)
//   // $el.classList.add('is-clicked')
//   // setTimeout(() => {
//   //   $el.classList.remove('is-clicked')
//   // }, time || 200)
// })

document.addEventListener('DOMContentLoaded', () => {
  FastClick.attach(document.body)
  var App = window.App = new Vue(AppComponent)
  if (IS_IOS)
    document.documentElement.classList.add('t-ios')
  App.$mount('#app')
})

