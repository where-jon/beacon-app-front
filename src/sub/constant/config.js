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
  LOGIN_MODE: LOGIN_MODE.APP_SERVICE, // ログインモード(なし、ローカル、AppService)
  SAAS_DOMAIN: '.saas.',
  COMMON: {
    VERSION: 'Version 1.2.0', // バージョン　this application version
    TIME_ZONE: -9, // 午前0時を決定するためのタイムゾーン(時)
    AUTO_RELOAD: 60000, // 自動リロード間隔(ミリ秒)
  },
  SYS: {
    TIMEOUT: 60 * 60 * 1000, // session timeout(using local storage)
    STATE_EXPIRE_TIME: 10 * 60 * 1000, // マスタキャッシュ有効時間(ミリ秒)
  },
  MENU: {
    SHOW_MENU_LINK: '',
    SHOW_MENU_LINK_URL: '',
    TOP_PAGE: '/main/position', // トップページパス　must not be / otherwise recursive infinitely
    // ページ遷移設定
    LOGIN_PAGE: '/login', // ログインページパス　if no login then /
    ERROR_PAGE: '/error', // エラーページパス　if no login then /
  },
  GATEWAY: {
    LOST_TIME: 30 * 60 * 1000, // 消失とみなす時間（ミリ秒）
    UNDETECT_TIME: 60 * 60 * 1000, // 未検知とみなす時間（ミリ秒）
  },
  TELEMETRY: {
    LOST_TIME: 30 * 60 * 1000, // 消失とみなす時間（ミリ秒）
    UNDETECT_TIME: 60 * 60 * 1000, // 未検知とみなす時間（ミリ秒）
    WITH_POWER_LEVEL: true,         // 画面上で電池レベルを使用するか否か
  },
  POS: {
    AUTO_RELOAD: 60000, // 測位の自動リロード間隔(ミリ秒)
    TRANSPARENT_TIME: 60 * 1000, // 半透明：現在時刻から経過した段階で半透明（ミリ秒）
    LOST_TIME: 10 * 60 * 1000, // 消失とみなす時間（ミリ秒）
    UNDETECT_TIME: 60 * 60 * 1000, // 未検知とみなす時間（ミリ秒）
    USE_POSITION_HISTORY: true, // 位置情報にT_POSITION_HISTORYを使う
    TX_POS_ONE_TO_ONE: false, // 1つの場所に1TXのみ存在可能
    RSSI_MIN: -99, // RSSI下限値
    MOVING_AVERAGE: 5, // 5回分移動平均
    USE_MULTI_POSITIONING: false, // ３点測位を使う
    // 禁止区域関連設定
    PROHIBIT_ALERT : true, // 禁止区域アラート設定
    PROHIBIT_GROUPS: null, // 禁止区域非許可GROUPID[1,2,3]の形

    USE_LEGEND: false, // 凡例を表示
    SHOW_DETECTED_COUNT: false, // 検知数を表示

    WITH: {
      CATEGORY: true, // 位置表示(地図)にカテゴリを表示
      GROUP: false, // 位置表示(地図)にグループを表示
    },
  },
  SENSOR: {
    TX_SENSOR: [1,5,6,7], // TXのタイプに設定可能なセンサーID
    MEDITAG: {
      DOWN_RED_TIME: 60000, // MEDiTAG使用時：転倒時赤枠の表示時間
    },
    USE_THERMOPILE: true, // サーモパイルセンサーの使用
    USE_MEDITAG: false, // メディタグの使用
    USE_MAGNET: false, // マグネットセンサの使用
    USE_PRESSURE: true, // 圧力センサの使用
    SHOW_MAGNET_ON_PIR: false, // 人感センサ画面でマグネットセンサを表示
    MAGNET_ON_IS_USED: true, // マグネットセンサーONのとき使用中とするか
    // 温湿度
    USE_HUMIDITY_ALERT: true, // 湿度アラートの使用
    USE_THERMOH_HEATMAP: true, // ヒートマップの使用
    USE_THERMOH_TOOLTIP: false, // ツールチップを使用する
    TEMPERATURE: {
      LINE_HOUR_START: 0,  // 温湿度グラフの開始時間
      LINE_HOUR_END: 24,  // 温湿度グラフの終了時間
    },
  },
  // ヒートマップ
  HEATMAP: {
    USE_INDIVIDUAL: false, // 個人プルダウンの表示
  },
  // 位置表示(一覧)
  POS_LIST: {
    WITH: ['tel'],
  },
  // TX関連設定
  TX: {
    WITH: ['major', 'sensor', 'dispFlg', 'location', 'dispPir'],
    MAJOR_REQUIRED: false, // majorを必須にする ※サーバでも要設定
    BTX_MINOR: 'both', // both:両方表示し、別々に設定、minor/btxId:片方のみ表示し、保存の際同一の値を設定
  },
  // EXB関連設定
  EXB: {
    SENSOR: [1,2,3,4,8], // EXBのタイプに設定可能なセンサーID
    WITH: ['deviceNum', 'posId', 'zone'],
    MULTI_SENSOR: true,
    SENSOR_MAX: 2,   // センサー種類最大数
  },
  // USER関連設定
  USER: {
    WITH: ['email', 'name'],
  },
  // 位置把握(一覧)画面
  POSITION_WITH_AREA: true, // エリアを表示
  // POT関連設定
  POT: {
    WITH: ['category', 'user', 'description'],
    MULTI_TX: false,         // 複数Tx使用
    TX_MAX: 2,   // 所持Tx最大数
  },
  // category
  CATEGORY: {
    TYPES: [1,2],   // 選択可能な種別（1人,2物,3ゾーン）
  },
  NOTIFY: {
    // 通知媒体
    MIDIUM_TYPES: [0,1],   // 選択可能な種別（1メール,2slack）
    // 通知
    STATE_TYPES: [0,1,2], // 選択可能な種別（0 TXボタン通知,1 アラート系, 2 ユーザ登録・更新 , 3 sos）
  },
  // 動線分析関連設定
  ANALYSIS: {
    DATETIME_INTERVAL: 60 * 24, // Fromを設定した場合、この設定値分未来の日付をToに自動入力する（分単位）
  },
  // 集計
  STAY_SUM: {
    LOST_LIMIT: 90 * 60,  // 滞在時間集計不在判定時間（秒）
    ABSENT_LIMIT: 30 * 60,  // 滞在時間集計離席判定時間（秒）
    PARSENT_DIGIT: 100, // 在席率表示時の小数点以下桁数。なしなら1、1桁なら10、2桁なら100 …
    AXIS_FILL_GAP: 2, // 滞在時間集計の横軸で0件項目を表示(0:しない,1:する,2:月日の場合検索期間すべて表示)
    UNIT_HOUR: 5 * 60 * 60, // 指定秒を軸単位の最大値が超えた場合、滞在時間集計の表示を時間単位で表示する
    UNIT_MINUTE: 20 * 60,  // 指定秒を軸単位の最大値が超えた場合、滞在時間集計の表示を分単位で表示する
    FROM: 0,  // 滞在時間集計開始時間(時分)
    TO: 2400,  // 滞在時間集計終了時間(時分)
  },
  // Tx状態監視
  TX_MON: {
    WITH: ['btxId', 'major', 'minor', 'name', 'powerLevel', 'locationName'],
    WITH_SENSOR: [], // マージするセンサ情報のIDリスト
    POWER_LEVEL_GOOD: 50,  // 電池レベルで良好とみなす下限値
    POWER_LEVEL_WARN: 30,  // 電池レベルで減少とみなす下限値
  },
  SENSOR_LIST: {
    WITH: ['posId', 'deviceId', 'deviceIdX', 'locationName'],
  },
  SENSORGRAPH: {
    WITH_DEVICE: true,             // 画面上でデバイスを使用するか否か
    CSV_IMMEDIATE: false,             // csvで直近値を出力するか否か
  },
  HISTORY_EXC: {
    SORT: 'desc', // 履歴情報Excの日付デフォルトソート（asc or desc）
  },
  TXDETAIL: {
    // TX詳細表示項目
    ITEMS: ['minor', 'major', 'name', 'group', 'category', 'tel', 'timestamp'],
    NO_UNREGIST_THUMB: false, // TX詳細サムネイル非表示（未登録の場合）
  },
  SVC: {
    POS: {
      EXSERVER: false, // EXServerを使う
    },
  },

  
  // 将来実装予定項目 START
  LOG_KEEP_TIME: 30,
  PASSWORD_CHANGEABLE: true,
  PASSWORD_CHECK: false,
  UPDATE_POSITION_EFFECT: true,
  // 将来実装予定項目 END

  // その他
  MAX_IMAGE_SIZE: 20 * 1024 * 1024, // アップロード可能な最大イメージサイズ(Byte)
  AREA_THUMBNAIL_MAX: 200, // サムネイルリサイズ時の最大幅・高さ(エリア)
  POT_THUMBNAIL_MAX: 200, // サムネイルリサイズ時の最大幅・高さ(pot)

  POSITION_SUMMARY_START: 10, // 位置情報csvダウンロード開始時刻（時）
  POSITION_SUMMARY_END: 19,    // 位置情報csvダウンロード終了時刻（時）
  POSITION_SUMMARY_INTERVAL: 10, // 位置情報csvダウンロード間隔（分）
  POSITION_SUMMARY_RECEIVE_COUNT: 2 // 位置情報における受信回数の閾値
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
  DL_LIST_URL: '/core/excloud/dllist/{type}/{yyyymm}?_=',
  DL_URL: '/core/excloud/dl/{type}/{yyyymmdd}?_=',
  LED_URL: '/core/excloud/led?_=',
  POSITION_HISTORY_FETCH_URL: '/core/positionHistory/fetch/{allFetch}?_=',
}

export const DISP = { // 表示系設定（表示・色・フォント・サイズ）
  MENU: {
    SHOW_NAV: false, // show nav  
    SHOW_SIDEBAR: true, // show sidebar  
    SHOW_LOGO: true, // show logo (or show title text)
    THEME: 'default', // デフォルトのテーマ
  },
  // 位置表示：TX
  TX: {
    R_ABSOLUTE: true, // Txの半径を画面解像度に合わせる
    R: 26, // Txの半径
    FIX_R: 26, // Txの半径(カテゴリ一覧、グループ一覧、凡例表示用)
    ROUNDRECT_RADIUS: 13, // Tx角丸表示時のRADIUS
    BGCOLOR: '3bcddc', // Tx表示時のデフォルト背景色
    COLOR: '000000', // Tx表示時のデフォルト文字色
    STROKE_COLOR: 'cccccc', // Tx表示時のデフォルト枠線色
    STROKE_WIDTH: 1, // Tx表示時のデフォルト枠線幅
    ALPHA: 0.6, // Tx表示時(離席)のデフォルト透過値
    LOST_ALPHA: 0.1, // Tx固定表示(不在)時のデフォルト透過値
    // TX_FONT: '20px Arial', // Tx表示時のフォント
    DIV_2: 1, // Txが重なった際に２つ上下左右に並べる場合にずらす倍率
    DIV_3: 0.5, // Txが重なった際に３つ左右に並べる場合にずらす倍率
    HORIZON: 5, // TXアイコンタイル表示時の列数
    VERTICAL: 5, // TXアイコンタイル表示時の行数
    DISPLAY_PRIORITY: ['category','group'], // TX表示の際に参照するdisplay方法の優先順位
  },
  EXB_LOC: {
    // EXB配置設定のEXB表示サイズ
    SIZE: {
      W: 60,
      H: 30
    },
    BGCOLOR: '#76ccf7', // EXB配置設定のEXB表示背景色
    COLOR: '#000', // EXB配置設定のEXB表示文字色
    FONT: 'Arial', // EXB配置設定のEXB表示フォント
  },
  TX_LOC: {
    // TX配置設定のTX表示サイズ
    SIZE: {
      W: 60,
      H: 30
    },
    BGCOLOR: '#76ccf7', // TX配置設定のTX表示背景色
    COLOR: '#000', // TX配置設定のTX表示文字色
    FONT: 'Arial', // TX配置設定のTX表示フォント
    ALPHA: 1.0, // TX配置設定のTX表示フォント
  },
  THERMOH: {
    // ツールチップ内の表示要素
    TOOLTIP_ITEMS: {
      TXNAME: true,
      TEMPERATURE: true,
      HUMIDITY: true,
      DESCRIPTION: true,
      DATE: false,
    },
    TOOLTIP_FONT: '12px Arial', // ツールチップフォント
    TOOLTIP_COLOR: '#000000', // ツールチップ文字色
    TOOLTIP_BORDERCOLOR: '#888888', // ツールチップ枠線色
    TOOLTIP_BGCOLOR: '#FFFDE6', // ツールチップ背景色
    TOOLTIP_ROUNDRECT: 16, // ツールチップ角丸半径
  
    ALERT_FIX_HEIGHT: 0, // 警告欄固定行高さ(0で無効)
    ALERT_WEIGHT: 'bold', // 警告フォント太さ
  
    DISP: 'color', // icon / color
    WITH_LABEL: true, // アイコンに温湿度を表示する
    FONT: '12px Arial', // 温湿度表示時のフォント
    R_SIZE: 26, // 温湿度表示時の円の半径
    COLOR: '#ffffff', // 温湿度表示時の文字色
    DISCOMFORT_HOT: '#fc5800', // 温湿度表示時の不快指数Hot時の背景色
    DISCOMFORT_COMFORT: '#15db75', // 温湿度表示時の不快指数Comfort時の背景色
    DISCOMFORT_COLD: '#7da6e8', // 温湿度表示時の不快指数Cold時の背景色
    CALC: 2, // アイコン状態算出方法(1:不快指数 2:温度)
    FLASH: {
      WARN: 1000, // 警告アイコン点滅周期(ミリ秒)
      DANGER: 500, // 危険アイコン点滅周期(ミリ秒)
    },
    ALPHA: 1, // アルファ値(0:透明～1:不透明)
    PATTERN: ['19 #5b9bd5', '25 #6eb290', '26 #ffd966', '27 #ff9966', '31 #ff5050', '32 #ffd966 $WARN', '#ff2525 $DANGER'], // 温度アイコンパターン（順不同。数値：閾値。先頭が#：カラーコード。先頭が$：点滅パターン。OR：閾値に同値を含む。）
    HUMIDITY_PATTERN: ['LESS 30', 'LESS 50', 'MORE 85'], // 湿度アラートパターン（順不同。数値：閾値。LESS：閾値以下の場合に警告。MORE：閾値以上の場合に警告）
  
    TEMPERATURE_MAX: 28,  // 温湿度ヒートマップ最大値
    TEMPERATURE_MIN: 0,   // 温湿度ヒートマップ最小値
    TEMPERATURE_RADIUS: 150,   // 温湿度ヒートマップ直径
  },
  PIR: {
    R_SIZE: 26,  // PIR表示時の円の半径
    MIN_COUNT: 0, // PIRでの存在条件の最小カウント値
    BGCOLOR: '#FC7E82', // "#E2A6A5" // PIR表示の円の背景色
    FGCOLOR: '#FFFFFF', // PIR表示時の文字色
    INUSE_LABEL: 'InUse', // PIRで存在時のラベルキー
    EMPTY_SHOW: true, // PIRで不在時に表示するか否か
    EMPTY_BGCOLOR: '#595959', // PIRで不存時の背景色
    EMPTY_LABEL: 'Empty', // PIRで不在時のラベルキー
  },
  PRESSURE: {
    R_SIZE: 26,  // 圧力センサ表示時の円の半径
    VOL_MIN: 1100, // 圧力センサの使用判定値(指定値以下で使用中扱い)
    BGCOLOR: '#FC7E82', // "#E2A6A5" // 圧力センサ表示の円の背景色
    FGCOLOR: '#FFFFFF', // 圧力センサ表示時の文字色
    INUSE_LABEL: 'InUse', // 圧力センサで使用時のラベルキー
    EMPTY_SHOW: true, // 圧力センサで未使用時に表示するか否か
    EMPTY_BGCOLOR: '#595959', // 圧力センサで不存時の背景色
    EMPTY_LABEL: 'Empty', // 圧力センサで未使用時のラベルキー
  },
  MEDITAG: {
    STRESS_BG: ['#85A9D1', '#F0C864', '#F49696'], // ストレスレベルに応じた背景色
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

  FONT_ICON_ADJUST_SCALE: 0.7, // アイコン内テキストのフォントサイズ係数

  MAP_FIT: 'both', // マップを画面表示範囲内にフィットさせるか。width or height or both
  MAP_FIT_MOBILE: 'width', // (モバイル)マップを画面表示範囲内にフィットさせるか。width or height or both

  TEMPERATURE_LINE_COLOR: '#fc5800',// 温度グラフの線色
  HUMIDITY_LINE_COLOR: '#7da6e8',// 湿度グラフの線色
  PIR_LINE_COLOR: '#fc5800',// 人感センサグラフの線色
  THERMOPILE_LINE_COLOR: '#fc5800',// サーモパイルセンサグラフの線色
  LED_LINE_COLOR: '#fc5800',// LEDセンサグラフの線色
  MAGNET_LINE_COLOR: '#fc5800',// マグネットセンサグラフの線色
  PRESSURE_LINE_COLOR: '#fc5800',// 圧力センサグラフの線色
  H_BLOOD_PRESSURE_LINE_COLOR: '#fc5800',// MEDiTAGセンサグラフの線色
  L_BLOOD_PRESSURE_LINE_COLOR: '#7da6e8',// 湿度グラフの線色
  HEART_RATE_LINE_COLOR: '#7de8a6',// 湿度グラフの線色
  STEP_LINE_COLOR: '#7da6e8',// 歩数グラフの線色
  DOWN_COUNT_LINE_COLOR: '#fc5800',// 転倒数グラフの線色
  SUM_STACK_COLOR: ['red','orange','yellow','green','purple','skyblue','blue','navy','gray','white'], // 滞在集計の色パターン
  SUM_STACK_BORDER_COLOR: 'gray',

  BLOOD_PRESSURE_MAX: 200,// 血圧最大メモリ
  BLOOD_PRESSURE_STEP: 25,// 血圧メモリ間隔
  HEART_RATE_MAX: 200,// 心拍最大メモリ
  HEART_RATE_STEP: 25,// 心拍メモリ間隔
  STEP_MAX: 200,// 歩数最大メモリ
  STEP_STEP: 25,// 歩数メモリ間隔
  DOWN_COUNT_MAX: 200,// 転倒数メモリ
  DOWN_COUNT_STEP: 25,// 転倒数メモリ間隔

  THERMOPILE_S_SIZE: 20, // サーモパイル円Sサイズ
  THERMOPILE_M_SIZE: 40, // サーモパイル円Mサイズ
  THERMOPILE_L_SIZE: 60, // サーモパイル円Lサイズ

  ZONE: {
    MIN_WIDTH: 30,
    MIN_HEIGHT: 30,
  },
  
  TXDETAIL_DIFF: 25, // TX詳細の表示位置差分（ポップアップ左端から吹き出しの中央までの距離）
  TXDETAIL_POPUP_SIZE: 211, // TX詳細表示ポップアップの高さ
  TXSENSOR_POPUP_SIZE: 165, // TXセンサー表示ポップアップの高さ
  TXMEDITAG_POPUP_SIZE: 236, // TXMEDITAG表示ポップアップの高さ

  POSITION_HISTORY: {
    HEADERS: ['txName', 'major', 'minor', 'deviceNum', 'locationName', 'posId', 'areaName'], // 位置表示履歴の表示カラム
  },

  GATEWAY: { // ゲートウエイ
    STATE_COLOR: { // 状態別色
      [DETECT_STATE.DETECTED]: '#28a745',
      [DETECT_STATE.LOST]: '#ffc107',
      [DETECT_STATE.UNDETECT]: '#dc3545',
      [DETECT_STATE.NONE]: '#dc3545'
    }
  },

  INSTALLATION: { // 設置支援
    RSSI_ICON_WIDTH: 100,
    RSSI_ICON_HEIGHT: 20,
  },
  // 禁止区域関連設定
  PROHIBIT_TWINKLE_TIME: 1500, // 点滅間隔(ミリ秒) ＸＸＸ_TIME dispに変更
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
