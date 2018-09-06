// configuration for app
// Basically using const but values are not primitive but objects or arrays because it may change from outside.

import styles from './config.scss'
import { LOGIN_MODE } from './Constants'

export const DEV = {
  USE_MOCK_POS: false, // 測位APIの代わりにモックデータを使用する
  USE_MOCK_SENS: false, // センサーデータの代わりにモックデータを使用する
}

export const APP = {
  VERSION: "Version 0.1.2", // this application version
  TIMEOUT: 60 * 60 * 1000, // session timeout(using local storage)
  TOP_PAGE: "/master/person", // must not be / otherwise recursive infinitely
  LOGIN_PAGE: "/login", // if no login then /
  LOGIN_MODE: LOGIN_MODE.APP_SERVICE,
  UNDETECT_TIME: 10 * 60 * 1000, // used on telemetry 
  AREA_THUMBNAIL_MAX: 200,
}

export const LOCAL_LOGIN = { // local login md5 hash of id:pass // TODO: add Role
  ID_PASS: ["0636c3371cd14c53cf2dae4e81fd4aff", "d2abaa37a7c3db1137d385e1d8c15fd2"]
}

export const APP_SERVICE = { // used if APP.LOGIN_MODE == APP_SERVICE
  BASE_URL: "http://192.168.1.155:8080",
}
export const EXCLOUD_BASE_URL = "https://nsome8q880.execute-api.ap-northeast-1.amazonaws.com/prod" // used if APP.LOGIN_MODE != APP_SERVICE

export const EXCLOUD = {
  withCredentials: true, // false if APP.LOGIN_MODE != APP_SERVICE
  // POSITION_URL: EXCLOUD_BASE_URL + "/beacon/position-kalman?_=",
  // GATEWAY_URL: EXCLOUD_BASE_URL + "/gateway/0?=",
  // TELEMETRY_URL: EXCLOUD_BASE_URL + "/telemetry/0?=",
  POSITION_URL: APP_SERVICE.BASE_URL + "/core/excloud/position?_=",
  GATEWAY_URL: APP_SERVICE.BASE_URL + "/core/excloud/gateway?_=",
  TELEMETRY_URL: APP_SERVICE.BASE_URL + "/core/excloud/telemetry?_=",
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

  EXB_LOC_SIZE: {w: 60, h: 30},
  EXB_LOC_BGCOLOR: "#76ccf7",
  EXB_LOC_COLOR: "#000",
  EXB_LOC_FONT: "16px Arial",
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
