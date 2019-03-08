// configuration for app
// Basically using const but values are not primitive but objects or arrays because it may change from outside.

import { DETECT_STATE, LOGIN_MODE } from './Constants'

export const DEV = { // 開発デバッグ関連
  DEBUG: 0, // デバッグモード (0:なし、1以上デバッグレベル)
  USE_MOCK_APS: false || location.search.indexOf('mockAps') != -1, // AppService API結果の代わりにモックデータを使用する
  USE_MOCK_EXC: false || location.search.indexOf('mockExc') != -1, // Excloud API結果の代わりにモックデータを使用する
  NOT_FILTER_TX: true,
}

export const APP = { // 機能面に関する設定
  VERSION: 'Version 1.0.0', // バージョン　this application version
  LOGIN_MODE: LOGIN_MODE.APP_SERVICE, // ログインモード(なし、ローカル、AppService)
  SAAS_DOMAIN: '.saas.',

  // ページ遷移設定
  TOP_PAGE: '/main/position', // トップページパス　must not be / otherwise recursive infinitely
  LOGIN_PAGE: '/login', // ログインページパス　if no login then /
  ERROR_PAGE: '/error', // エラーページパス　if no login then /

  // 時間設定
  TIMEOUT: 60 * 60 * 1000, // session timeout(using local storage)
  AUTO_RELOAD: 60000, // 自動リロード間隔(ミリ秒)

  TRANSPARENT_TIME: 1 * 1000, // 半透明：現在時刻から経過した段階で半透明（ミリ秒）
  LOST_TIME: 3 * 1000, // 消失とみなす時間（ミリ秒）
  UNDETECT_TIME: 60 * 60 * 1000, // 未検知とみなす時間（ミリ秒）
  GATEWAY: {
    LOST_TIME: 30 * 60 * 1000, // 消失とみなす時間（ミリ秒）
    UNDETECT_TIME: 60 * 60 * 1000, // 未検知とみなす時間（ミリ秒）
  },
  TELEMETRY: {
    LOST_TIME: 30 * 60 * 1000, // 消失とみなす時間（ミリ秒）
    UNDETECT_TIME: 60 * 60 * 1000, // 未検知とみなす時間（ミリ秒）
  },

  DOWN_RED_TIME: 60000, // MEDiTAG使用時：転倒時赤枠の表示時間
  TEMPERATURE_LINE_HOUR_START: 8,  // 温湿度グラフの開始時間
  TEMPERATURE_LINE_HOUR_END: 21,  // 温湿度グラフの終了時間
    
  // 測位関連設定
  USE_POSITION_HISTORY: true, // 位置情報にT_POSITION_HISTORYを使う
  TX_POS_ONE_TO_ONE: false, // 1つの場所に1TXのみ存在可能
  RSSI_MIN: -67, // RSSI下限値
  MOVING_AVERAGE: 5, // 5回分移動平均
  USE_MULTI_POSITIONING: false, // ３点測位を使う
  
  // 機能
  USE_THERMOPILE: true, // サーモパイルセンサーの使用
  USE_MEDITAG: false, // メディタグの使用
  USE_MAGNET: false, // マグネットセンサの使用
  USE_LEGEND: false, // 凡例を表示
  SHOW_DETECTED_COUNT: false, // 検知数を表示
  SHOW_MAGNET_ON_PIR: false, // 人感センサ画面でマグネットセンサを表示
  MAGNET_ON_IS_USED: true, // マグネットセンサーONのとき使用中とするか

  // 将来実装予定項目 START
  LOG_KEEP_TIME: 30,
  MONITOR_REFESH_TIME: 10 * 60 * 1000,
  PASSWORD_CHANGEABLE: true,
  PASSWORD_CHECK: false,
  UPDATE_POSITION_EFFECT: true,
  TIME_ZONE: 0,
  SLACK_WEBHOOC: false,
  MAIL_ADDRESS: '',
  IP_ADDRESS_FILTER: '',
  // 将来実装予定項目 END

  // TX関連設定
  TX_SENSOR: [5,6,7], // TXのタイプに設定可能なセンサーID
  TX_WITH_TXID: false, // 画面上TXIDを使用するか否か
  TX_WITH_CATEGORY: true, // TX管理で個体.カテゴリを表示
  TX_WITH_GROUP: false, // TX管理で個体.グループを表示
  TX_WITH_DISPLAY_NAME: true, // TX管理で個体.表示名を表示
  TX_WITH_DESCRIPTION: true, // TX管理で個体.備考を表示
  TX_WITH_MAJOR: true, // TX管理でmajorを表示
  TX_MAJOR_REQUIRED: false, // majorを必須にする ※サーバでも要設定
  TX_BTX_MINOR: 'both', // both:両方表示し、別々に設定、minor/btxId:片方のみ表示し、保存の際同一の値を設定
  TX_WITH_LOCATION: true, // TXを固定位置表示する（TX管理画面に影響）

  // EXB関連設定
  EXB_SENSOR: [1,2,3,4], // EXBのタイプに設定可能なセンサーID
  EXB_WITH_EXBID: false,       // 画面上EXBIDを使用するか否か 
  EXB_WITH_DEVICE_NUM: true,  // 画面上端末IDを使用するか否か
  EXB_WITH_DEVICE_ID: false,   // 画面上デバイスIDを使用するか否か
  EXB_WITH_DEVICE_IDX: false,  // 画面上デバイスID（16進数）を使用するか否か
  EXB_WITH_POSID: true,      // 画面上POSIDを使用するか否か

  EXB_MULTI_SENSOR: true,
  EXB_SENSOR_MAX: 2,   // センサー種類最大数

  // USER関連設定
  USER_WITH_EMAIL: true, // ユーザ設定でメールアドレスを使用する
  USER_WITH_NAME: true, // ユーザ設定で名前を使用する

  // 位置把握(一覧)画面
  POSITION_WITH_AREA: true, // エリアを表示
  POSITION_TIMEZONE: -9, // 午前0時を決定するためのタイムゾーン(時)

  // POT関連設定
  POT_WITH_RUBY: false,       // るび使用　use ruby on pot master
  POT_WITH_POST: false,       // 役職使用　use post on pot master
  POT_WITH_TEL: false,        // 電話使用　use tel on pot master
  POT_WITH_POTCD: false,      // コード使用　use potCd on pot master
  POT_WITH_GROUP: false,      // グループ使用　use group on pot master
  POT_WITH_CATEGORY: true,   // カテゴリ使用　use category on pot master
  POT_WITH_USER: true,        // ユーザ使用
  POT_MULTI_TX: true,         // 複数Tx使用

  POT_TX_MAX: 2,   // 所持Tx最大数

  // category
  CATEGORY_TYPES: [1,2],   // 選択可能な種別（1人,2物,3ゾーン）
  // 通知媒体
  NOTIFY_MIDIUM_TYPES: [0,1],   // 選択可能な種別（1メール,2slack）

  // 通知
  NOTIFY_STATE_TYPES: [0,1,2], // 選択可能な種別（0 TXボタン通知,1 アラート系, 2 ユーザ登録・更新 , 3 sos）

  // 動線分析関連設定
  ANALYSIS_DATETIME_INTERVAL: 60 * 24, // Fromを設定した場合、この設定値分未来の日付をToに自動入力する（分単位）

  // その他
  MAX_IMAGE_SIZE: 20 * 1024 * 1024, // アップロード可能な最大イメージサイズ(Byte)
  AREA_THUMBNAIL_MAX: 200, // サムネイルリサイズ時の最大幅・高さ(エリア)
  POT_THUMBNAIL_MAX: 200, // サムネイルリサイズ時の最大幅・高さ(pot)
  POWER_LEVEL_GOOD: 50,  // 電池レベルで良好とみなす下限値
  POWER_LEVEL_WARN: 30,  // 電池レベルで減少とみなす下限値

  // 禁止区域関連設定
  PROHIBIT_ALERT : true,
  PROHIBIT_TWINKLE: 1500, // 点滅間隔(ミリ秒)
}


// URL関連設定
export const APP_SERVICE = { // used if APP.LOGIN_MODE == APP_SERVICE
  BASE_URL: 'http://localhost:8080'
}

export const EXCLOUD_BASE_URL = 'https://nsome8q880.execute-api.ap-northeast-1.amazonaws.com/prod' // used if APP.LOGIN_MODE != APP_SERVICE

export const EXCLOUD = {
  withCredentials: true, // false if APP.LOGIN_MODE != APP_SERVICE
  // POSITION_URL: EXCLOUD_BASE_URL + "/beacon/position-kalman?_=",
  // GATEWAY_URL: EXCLOUD_BASE_URL + "/gateway/0?=",
  // TELEMETRY_URL: EXCLOUD_BASE_URL + "/telemetry/0?=",
  POSITION_URL: '/core/excloud/position?_=',
  GATEWAY_URL: '/core/excloud/gateway?_=',
  TELEMETRY_URL: '/core/excloud/telemetry?_=',
  SENSOR_URL: '/core/excloud/sensor/{id}?_=',
  LED_URL: '/core/excloud/led?_=',
  POSITION_HISTORY_FETCH_URL: '/core/positionHistory/fetch?_=',
}

export const DISP = { // 表示系設定（表示・色・フォント・サイズ）
  // 位置表示：TX
  TX_R: 26, // Txの半径
  TX_FIX_R: 26, // Txの半径(カテゴリ一覧、グループ一覧、凡例表示用)
  ROUNDRECT_RADIUS: 13, // Tx角丸表示時のRADIUS
  TX_BGCOLOR: '3bcddc', // Tx表示時のデフォルト背景色
  TX_COLOR: '000000', // Tx表示時のデフォルト文字色
  TX_STROKE_COLOR: 'cccccc', // Tx表示時のデフォルト枠線色
  TX_STROKE_WIDTH: 1, // Tx表示時のデフォルト枠線幅
  TX_ALPHA: 0.6, // Tx表示時(離席)のデフォルト透過値
  TX_LOST_ALPHA: 0.1, // Tx固定表示(不在)時のデフォルト透過値
  TX_FONT: '20px Arial', // Tx表示時のフォント
  TX_DIV_2: 1, // Txが重なった際に２つ上下左右に並べる場合にずらす倍率
  TX_DIV_3: 0.5, // Txが重なった際に３つ左右に並べる場合にずらす倍率
  TX_HORIZON: 5, // TXアイコンタイル表示時の列数
  TX_VERTICAL: 5, // TXアイコンタイル表示時の行数

  SHOW_NAV: true, // show nav  
  SHOW_SIDEBAR: true, // show sidebar  
  SHOW_LOGO: true, // show logo (or show title text)
  THEME: 'default', // デフォルトのテーマ
  DISPLAY_PRIORITY: ['category','group'], // TX表示の際に参照するdisplay方法の優先順位

  MAP_FIT: 'both', // マップを画面表示範囲内にフィットさせるか。width or height or both
  MAP_FIT_MOBILE: 'width', // (モバイル)マップを画面表示範囲内にフィットさせるか。width or height or both

  EXB_LOC_SIZE: {w: 60, h: 30}, // EXB配置設定のEXB表示サイズ
  EXB_LOC_BGCOLOR: '#76ccf7', // EXB配置設定のEXB表示背景色
  EXB_LOC_COLOR: '#000', // EXB配置設定のEXB表示文字色
  EXB_LOC_FONT: '16px Arial', // EXB配置設定のEXB表示フォント

  THERMOH_DISP: 'color', // icon / color
  THERMOH_FONT: '12px Arial', // 温湿度表示時のフォント
  DISCOMFORT_HOT: '#fc5800', // 温湿度表示時の不快指数Hot時の背景色
  DISCOMFORT_COMFORT: '#15db75', // 温湿度表示時の不快指数Comfort時の背景色
  DISCOMFORT_COLD: '#7da6e8', // 温湿度表示時の不快指数Cold時の背景色

  TEMPERATURE_LINE_COLOR: '#fc5800',// 温度グラフの線色
  HUMIDITY_LINE_COLOR: '#7da6e8',// 湿度グラフの線色
  PIR_LINE_COLOR: '#fc5800',// 人感センサグラフの線色
  THERMOPILE_LINE_COLOR: '#fc5800',// サーモパイルセンサグラフの線色
  LED_LINE_COLOR: '#fc5800',// LEDセンサグラフの線色
  MAGNET_LINE_COLOR: '#fc5800',// マグネットセンサグラフの線色
  H_BLOOD_PRESSURE_LINE_COLOR: '#fc5800',// MEDiTAGセンサグラフの線色
  L_BLOOD_PRESSURE_LINE_COLOR: '#7da6e8',// 湿度グラフの線色
  HEART_RATE_LINE_COLOR: '#7de8a6',// 湿度グラフの線色
  STEP_LINE_COLOR: '#7da6e8',// 歩数グラフの線色
  DOWN_COUNT_LINE_COLOR: '#fc5800',// 転倒数グラフの線色

  BLOOD_PRESSURE_MAX: 200,// 血圧最大メモリ
  BLOOD_PRESSURE_STEP: 25,// 血圧メモリ間隔
  HEART_RATE_MAX: 200,// 心拍最大メモリ
  HEART_RATE_STEP: 25,// 心拍メモリ間隔
  STEP_MAX: 200,// 歩数最大メモリ
  STEP_STEP: 25,// 歩数メモリ間隔
  DOWN_COUNT_MAX: 200,// 転倒数メモリ
  DOWN_COUNT_STEP: 25,// 転倒数メモリ間隔

  PIR_R_SIZE: 26,  // PIR表示時の円の半径
  PIR_MIN_COUNT: 0, // PIRでの存在条件の最小カウント値
  PIR_BGCOLOR: '#FC7E82', // "#E2A6A5" // PIR表示の円の背景色
  PIR_FGCOLOR: '#FFFFFF', // PIR表示時の文字色
  PIR_INUSE_LABEL: 'InUse', // PIRで存在時のラベルキー
  PIR_EMPTY_SHOW: true, // PIRで不在時に表示するか否か
  PIR_EMPTY_BGCOLOR: '#595959', // PIRで不存時の背景色
  PIR_EMPTY_LABEL: 'Empty', // PIRで不在時のラベルキー

  THERMOPILE_S_SIZE: 20, // サーモパイル円Sサイズ
  THERMOPILE_M_SIZE: 40, // サーモパイル円Mサイズ
  THERMOPILE_L_SIZE: 60, // サーモパイル円Lサイズ

  STRESS_BG: ['#85A9D1', '#F0C864', '#F49696'], // ストレスレベルに応じた背景色

  ZONE: {
    MIN_WIDTH: 30,
    MIN_HEIGHT: 30,
  },
  
  TXDETAIL_ITEMS: { // TX詳細表示項目
    minor: true,
    major: true,
    name: true,
    group: true,
    category: true,
    timestamp: true,
  },

  GATEWAY: { // ゲートウエイ
    STATE_COLOR: { // 状態別色
      [DETECT_STATE.DETECTED]: '#28a745',
      [DETECT_STATE.LOST]: '#ffc107',
      [DETECT_STATE.UNDETECT]: '#dc3545',
      [DETECT_STATE.NONE]: '#dc3545'
    }
  },

  ANALYSIS: { // 分析
    LINE: {
      MAX_WEIGHT: 10,   // 動線の最大太さ
      COLOR: '#ff0000', // 動線の色 (#xxxxxx)
      OPACITY: 1,       // 動線の透過度 (0～1。0.5などの小数も可)
    },
    HEATMAP: {
      RADIUS: 150,      // 直径
    },
  },

  INSTALLATION: { // 設置支援
    RSSI_ICON_WIDTH: 100,
    RSSI_ICON_HEIGHT: 20,
  }
}

// used when APP.LOGIN_MODE != APP_SERVICE with excloud old api -----------------------------------------------------

// ローカルログイン認証設定
export const LOCAL_LOGIN = { // local login md5 hash of id:pass // TODO: add Role
  ID_PASS: ['0636c3371cd14c53cf2dae4e81fd4aff', 'd2abaa37a7c3db1137d385e1d8c15fd2']
}

export const EXB = [
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

export const Tx = [
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
