const DEV = false
const DEV_WEB = false

const IS_IOS = window.cordova && cordova.platformId === 'ios'
const IS_ANDROID = window.cordova && cordova.platformId === 'android'

var config = {
  DEV,
  IS_ANDROID,
  IS_IOS,
  BEACONS_CHANGE_DEBOUNCE_TIME: 1700,
  BEACONS_UUID: 'b9407f30-f5f8-466e-aff9-25556b57fe6d',
  BEACONS_MAJOR: 4660,
  VIDEO_PATH: !DEV ? 'http://127.0.0.1/' : 'http://' + process.env.DEV_SERVER_IP + '/videos/',
  VIDEO_LOADING_TIMEOUT: 5000,
  LANGUAGES: ['RU', 'EN'],
  // BEACON_VIDEO_START: 'stage-2',
  BEACON_VIDEO_MAP: {

    /* stage 4 */
    6985: 'stage-4',
    6837: 'mimpi',
    6986: 'timee',
    6838: 'vtol',
    6842: 'other_portrait',

    /* stage 3 */
    6984: 'stage-3',
    6841: 'what_hides_the_voice',
    6839: 'black_noise',
    6988: 'rose',

    // stage 2
    6836: 'stage-2',
    6987: 'video',
  },
}

const MOCKS = {
  // MOCK_CURRENT_BEACON: {minor: 6841},
}

const MOCKS_WEB = {
  MOCK_RANGING_AVAILABLE: true,
  MOCK_WIFI_ENABLED: true
}

if (DEV)
  Object.assign(config, MOCKS)
if (DEV && DEV_WEB)
  Object.assign(config, MOCKS_WEB)

module.exports = config