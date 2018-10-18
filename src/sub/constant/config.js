// configuration for app
// Basically using const but values are not primitive but objects or arrays because it may change from outside.

import { LOGIN_MODE } from './Constants'

export const DEV = {
  DEBUG: 0, // デバッグモード (0:なし、1以上デバッグレベル)
  USE_MOCK_APS: false || location.search.includes("mockAps"), // AppService API結果の代わりにモックデータを使用する
  USE_MOCK_EXC: false || location.search.includes("mockExc"), // Excloud API結果の代わりにモックデータを使用する
  NOT_FILTER_TX: true,
}

export const APP = {
  VERSION: "Version 0.9.0", // this application version
  TIMEOUT: 60 * 60 * 1000, // session timeout(using local storage)
  TOP_PAGE: "/main/position", // must not be / otherwise recursive infinitely
  LOGIN_PAGE: "/login", // if no login then /
  LOGIN_MODE: LOGIN_MODE.APP_SERVICE,
  UNDETECT_TIME: 10 * 60 * 1000, // used on telemetry 
  AREA_THUMBNAIL_MAX: 200,
  USE_THERMOPILE: true,
  LOG_KEEP_TIME: 30,
  MONITOR_REFESH_TIME: 10 * 60 * 1000,
  PASSWORD_CHANGEABLE: true,
  PASSWORD_CHECK: false,
  UPDATE_POSITION_EFFECT: true,
  TIME_ZONE: 0,
  DISP_REFRESH_TIME: 10 * 60 * 1000,
  SLACK_WEBHOOC: false,
  MAIL_ADDRESS: "",
  IP_ADDRESS_FILTER: "",
  EXB_SENSOR: [1,2,3,4], // EXBのタイプに設定可能なセンサーID
  TX_SENSOR: [5,6], // TXのタイプに設定可能なセンサーID
  TX_WITH_CATEGORY: true, // TX管理で個体.カテゴリを表示
  TX_WITH_DISPLAY_NAME: true, // TX管理で個体.表示名を表示
  TX_WITH_DESCRIPTION: true, // TX管理で個体.備考を表示
  TX_WITH_MAJOR: true, // TX管理でmajorを表示
  TX_BTX_MINOR: 'both', // both:両方表示し、別々に設定、minor/btxId:片方のみ表示し、保存の際同一の値を設定
  USER_WITH_EMAIL: false, // ユーザ設定でメールアドレスを使用する
  USER_WITH_NAME: false, // ユーザ設定で名前を使用する
}

export const LOCAL_LOGIN = { // local login md5 hash of id:pass // TODO: add Role
  ID_PASS: ["0636c3371cd14c53cf2dae4e81fd4aff", "d2abaa37a7c3db1137d385e1d8c15fd2"]
}

export const APP_SERVICE = { // used if APP.LOGIN_MODE == APP_SERVICE
  BASE_URL: "http://localhost:8080",
  REFRESH_TIME: 10 * 60 * 1000,
}
export const EXCLOUD_BASE_URL = "https://nsome8q880.execute-api.ap-northeast-1.amazonaws.com/prod" // used if APP.LOGIN_MODE != APP_SERVICE

export const EXCLOUD = {
  withCredentials: true, // false if APP.LOGIN_MODE != APP_SERVICE
  // POSITION_URL: EXCLOUD_BASE_URL + "/beacon/position-kalman?_=",
  // GATEWAY_URL: EXCLOUD_BASE_URL + "/gateway/0?=",
  // TELEMETRY_URL: EXCLOUD_BASE_URL + "/telemetry/0?=",
  POSITION_URL: "/core/excloud/position?_=",
  GATEWAY_URL: "/core/excloud/gateway?_=",
  TELEMETRY_URL: "/core/excloud/telemetry?_=",
  SENSOR_URL: "/core/excloud/sensor/{id}?_=",
  LED_URL: "/core/excloud/led?_=",
}


export const DISP = {
  TX_R: 26, // Txの半径
  TX_BGCOLOR: "#3bcddc",
  TX_COLOR: "#000",
  TX_FONT: "20px Arial",
  TX_DIV_2: 1, // Txが重なった際に２つ上下左右に並べる場合にずらす倍率
  TX_DIV_3: 0.5, // Txが重なった際に３つ左右に並べる場合にずらす倍率
  AUTO_RELOAD: 60000, // 自動リロード間隔(ミリ秒)
  SHOW_SIDEBAR: true, // show sidebar  
  THEME: "default",
  CHAR_SET: "UTF8",

  MAP_FIT: "both", // マップを画面表示範囲内にフィットさせるか。width or height or both 

  TX_POS_ONE_TO_ONE: false, // 1つの場所に1TXのみ存在可能
  RSSI_MIN: -67, // RSSI下限値
  MOVING_AVERAGE: 5, // 5回分移動平均
  TRANSPARENT_TIME: 1 * 1000, // 現在時刻から経過した段階で半透明(ms)
  HIDE_TIME: 90000 * 1000, // 現在時刻から経過した段階で表示(ms)
  
  EXB_LOC_SIZE: {w: 60, h: 30},
  EXB_LOC_BGCOLOR: "#76ccf7",
  EXB_LOC_COLOR: "#000",
  EXB_LOC_FONT: "16px Arial",

  THERMOH_DISP: "icon", // icon / color
  THERMOH_FONT: "12px Arial",
  DISCOMFORT_HOT: "#fc5800",
  DISCOMFORT_COMFORT: "#15db75",
  DISCOMFORT_COLD: "#7da6e8",

  TEMPERATURE_LINE_HOUR_START: 8,
  TEMPERATURE_LINE_HOUR_END: 21,
  TEMPERATURE_LINE_COLOR: "#fc5800",
  HUMIDITY_LINE_COLOR: "#7da6e8",

  PIR_R_SIZE: 26,
  PIR_MIN_COUNT: 2,
  PIR_BGCOLOR: "#FC7E82", // "#E2A6A5"
  PIR_FGCOLOR: "#FFFFFF",
  PIR_INUSE_LABEL: "InUse",
  PIR_INUSE_FONT: "bold 24px Arial",
  PIR_EMPTY_SHOW: true,
  PIR_EMPTY_BGCOLOR: "#595959",
  PIR_EMPTY_LABEL: "Empty",
  PIR_EMPTY_FONT: "bold 32px Arial",

  THERMOPILE_S_SIZE: 20,
  THERMOPILE_M_SIZE: 40,
  THERMOPILE_L_SIZE: 60,
}

export const EXB = [ // used when APP.LOGIN_MODE != APP_SERVICE with excloud old api
  {pos_id: 1, x: 110, y: 60},
  {pos_id: 2, x: 101, y: 208},
  {pos_id: 3, x: 318, y: 225},
  {pos_id: 4, x: 551, y: 221},
  {pos_id: 5, x: 250, y: 265},
  {pos_id: 6, x: 300, y: 265},
  {pos_id: 7, x: 350, y: 265},
  {pos_id: 8, x: 400, y: 265},
  {pos_id: 9, x: 450, y: 265},
  {pos_id: 10, x: 500, y: 265},
  {pos_id: 11, x: 550, y: 265},
  {pos_id: 12, x: 500, y: 265},
  {pos_id: 13, x: 100, y: 265},
  {pos_id: 14, x: 150, y: 265},
  {pos_id: 15, x: 200, y: 265},
  {pos_id: 16, x: 250, y: 265},
  {pos_id: 17, x: 265, y: 265},
  {pos_id: 18, x: 350, y: 265},
  {pos_id: 19, x: 400, y: 265},
  {pos_id: 20, x: 450, y: 265},
  {pos_id: 21, x: 500, y: 265},
  {pos_id: 22, x: 550, y: 265},
  {pos_id: 23, x: 550, y: 265},
  {pos_id: 24, x: 600, y: 265},
]

export const Tx = [ // used when APP.LOGIN_MODE != APP_SERVICE with excloud old api
  {id: 1},
  {id: 2},
  {id: 3},
  {id: 4},
  {id: 5},
  {id: 6},
  {id: 7},
  {id: 154},
  {id: 156},
  {id: 178},
  {id: 179},
  {id: 180},
  {id: 181},
  {id: 799},
  {id: 800},
]

export const THEME = [
  {id: 1,  name: 'default'},
  {id: 2,  name: 'earthcolor'},
  {id: 3,  name: 'autumn'},
  {id: 4,  name: 'vivid'},
]

export const CHAR_SET = [
  {id: 1,  name: "UTF8"},
  {id: 2,  name: "SJIS"},
]

export const MONITOR_TX = {
  ABSENT: 20 * 60 * 1000,
  UNDETECT: 24 * 60 * 60 * 1000
}

export const PASSWORD_LENGTH = {
  BOTTOM: 4,
  LIMIT: 21
}

export const GATEWAY = {
  MALFUNCTION: 30 * 60 * 1000,
  NOTRECEIVE: 60 * 60 * 1000,
  UNDETECT: 24 * 60 * 60 * 1000,
  STATE_COLOR: {
    NORMAL: '#28a745',
    MALFUNCTION: '#dc3545',
    NOTRECEIVE: '#ffc107',
    UNDETECT: '#dc3545'
  }
}

export const TXDETAIL_ITEMS = [
  {name: 'minor', disp: true},
  {name: 'major', disp: true},
  {name: 'name', disp: true},
  {name: 'timestamp', disp: true},
  {name: 'group', disp: true},
  {name: 'category', disp: true},
]