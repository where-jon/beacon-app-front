// configuration for app
// Basically using const but values are not primitive but objects or arrays because it may change from outside.

import { DETECT_STATE, SHAPE } from './Constants'

export const DEV = { // 開発デバッグ関連
  DEBUG: 0, // デバッグモード (0:なし、1以上デバッグレベル)
  USE_MOCK_APS: false || location.search.indexOf('mockAps') != -1, // AppService API結果の代わりにモックデータを使用する
  USE_MOCK_EXC: false || location.search.indexOf('mockExc') != -1, // Excloud API結果の代わりにモックデータを使用する
  DEFAULT_DATE: '', // yyyy/MM/dd hh:mm:ss
}

export const APP = { // 機能面に関する設定
  SAAS_DOMAIN: '.saas.',
  COMMON: {
    VERSION: 'Version 1.3.3', // バージョン　this application version
    TIME_ZONE: 'JST', // 午前0時を決定するためのタイムゾーン
    AUTO_RELOAD: 60000, // 自動リロード間隔(ミリ秒)
  },
  SYS: {
    TIMEOUT: 60 * 60 * 1000, // session timeout(using local storage)
    STATE_EXPIRE_TIME: 3 * 60 * 1000, // マスタキャッシュ有効時間(ミリ秒)
  },
  AUTH: {
    USE_AD: false, // ActiveDirectoryで認証
    // APP_ID: 'fcfc143f-c8c8-454e-ab72-fdf2e49f862f',
    // REDIRECT_URL: 'https://xxx.saas.msteams.exbeacon.com/azlogin/adminend/',
    REDIRECT_URL: 'https://xxx.saas.dev-133.exbeacon.com/azlogin/end/', // 認証後redirect先
    APP_ID: 'dd3ea682-9b02-49ec-9d15-c63cee38c792', // AAD clientId
  },  
  MENU: {
    SHOW_MENU_LINK: '',
    SHOW_MENU_LINK_URL: '',
    TOP_PAGE: '/main/position', // トップページパス　must not be / otherwise recursive infinitely
    // ページ遷移設定
    LOGIN_PAGE: '/login', // ログインページパス　if no login then /
    AZLOGIN_PAGE: '/azlogin/', // ADログインページパス
    ERROR_PAGE: '/error/', // エラーページパス
    MENU_HIDDEN_LIST: [], // サイドバーとナビバーで非表示にするメニューのfeature_name('showPosition','positionList','positionStack')をセット
  },
  SETTING: {
    DISABLED_THEME: false,
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
    TX_POS_ONE_TO_ONE: false, // 1つの場所に1TXのみ存在可能
    RSSI_MIN: -99, // RSSI下限値
    MOVING_AVERAGE: 5, // 5回分移動平均
    USE_MULTI_POSITIONING: false, // 多点測位を使う
    MULTI_POSITIONING_NUM: 3,     // 多点測位の点数
    // 禁止区域関連設定
    PROHIBIT_ALERT : null,  // 文字列リストで画面かバッチに通知するか判断["screen","map","list","whole","mail","led"]
    PROHIBIT_GROUP_ZONE: null, // 禁止区域非許可{"groupCd":"GR1", "zoneCd":["Z1"]}のJSON配列の形
    // 重要物品関連設定
    LOST_ALERT : null,  // 文字列リストで画面かバッチに通知するか判断["screen","map","list","whole","mail"]
    LOST_ALERT_TIME: 0, // 所定の場所から移動されて、指定ミリ秒経過後にアラートを出す（0の場合すぐに出す）
    LOST_GROUP_ZONE: null, // 重要物品設定{"groupCd":"GR1", "zoneCd":["Z1"]}のJSON配列の形
    USE_LEGEND: false, // 凡例を表示
    SHOW_DETECTED_COUNT: false, // 検知数を表示
    SHOW_QUANTITY: false, // 数量（トグルボタン）を表示
    SHOW_TOILET: false, // トイレ情報を表示
    SHOW_TX_NO_OWNER: true, // POTと紐付いていないタグを表示する
    GUEST_GROUP_CD_LIST: ['GUEST'], // ゲスト（来客）のグループコード

    WITH: {
      CATEGORY: true, // 位置表示(地図)にカテゴリを表示
      GROUP: false, // 位置表示(地図)にグループを表示
      PRESENCE: false, // 位置表示（地図）のアイコンにプレゼンスステータスを表示（デフォルトは必ずfalse）
    },

    PLUGIN: {
      FILTER: false,
    },
  },
  SENSOR: {
    TX_SENSOR: [1,5,6,7,9], // TXのタイプに設定可能なセンサーID
    MEDITAG: {
      DOWN_RED_TIME: 60000, // MEDiTAG使用時：転倒時赤枠の表示時間
    },
    USE_THERMOPILE: true, // サーモパイルセンサーの使用
    USE_MEDITAG: false, // メディタグの使用
    USE_MAGNET: false, // マグネットセンサの使用
    USE_PRESSURE: true, // 圧力センサの使用
    SHOW_MAGNET_ON_PIR: false, // 利用状況画面でマグネットセンサを表示
    MAGNET_ON_IS_USED: true, // マグネットセンサーONのとき使用中とするか
    LED: {
      AUTO_OFF_TIME: 300, // 点灯させたLEDに対し、指定秒後に消灯する
    },
    // 温湿度
    USE_HUMIDITY_ALERT: true, // 湿度アラートの使用
    USE_THERMOH_HEATMAP: false, // ヒートマップの使用
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
    WITH: ['mapDisplay'],  // 表示対象の文字列を配列に追加で列を表示する。mapDisplay:「マップ表示」列、tel:「電話番号」列、presenceStatus：「プレゼンス状態」列
  },
  // 位置表示(全体)
  POS_STACK: {
    USE_POPUP: false,   // Txアイコンクリック時にポップアップ表示する
    ADJUST_POPUP: {   // ポップアップの調整　設定した座標だけマイナス
      X: 15,                   // X座標　増加分、右に移動
      Y: 5,                     // Y座標　増加分、下に移動
    },
  },
  // TX関連設定
  TX: {
    WITH: ['major', 'dispFlg', 'location', 'dispPir'],
    MAJOR_REQUIRED: false, // majorを必須にする ※サーバでも要設定
    BTX_MINOR: 'both', // both:両方表示し、別々に設定、minor/btxId:片方のみ表示し、保存の際同一の値を設定
  },
  // EXB関連設定
  EXB: {
    WITH: [],
    SENSOR: [
      // 1,2,3,4,8,9,10,11,12,13
    ], // EXBのタイプに設定可能なセンサーID(m_settingとのずれを防ぐためデフォルトは空にする)
    DEVICEID_TYPE: 'deviceId',
    MULTI_SENSOR: true,
    SENSOR_MAX: 2,   // センサー種類最大数
  },
  // 場所関連設定
  LOCATION: {
    WITH: ['zoneClass', 'zoneBlock'],
    TYPE: {
      WITH: [],
    },
    // 拡張項目定義（サンプル）: デフォルトはなし
    EXT_DEF: [
      // {key: 'description', type: 'string', length: 100, showlist: true, sort: true },
      // {key: 'toilet', type: 'list', format: 'male|female|multip', showlist: true, sort: false},
      // {key:'led_no',type:'int',min:1,max:5,showlist:false},
      // {key:'led_device_id',type:'string',format:'^[0-9]+(,[0-9]+)*$',showlist:false},
    ],
  },
  // USER関連設定
  USER: {
    WITH: ['email', 'name'],
  },
  // 位置把握(一覧)画面
  POSITION_WITH_AREA: true, // エリアを表示
  // POT関連設定
  POT: {
    WITH: ['thumbnail', 'category', 'ruby', 'description'],
    MULTI_TX: false,         // 複数Tx使用
    TX_MAX: 2,   // 所持Tx最大数
    TYPES: [1, 2, 3],   // 選択可能な種別（1人,2物,3物(その他)）
    // 拡張項目定義（サンプル）: デフォルトはなし
    EXT_DEF: [
      // {key: 'post', type: 'string', showlist: true, sort: true},
      // {key: 'tel', type: 'tel', showlist: true, sort: true},
      // {key: 'mobile', type: 'tel', showlist: false, sort: false},
      // {key: 'entrydate', type: 'date', showlist: true, sort: false},
      // {key: 'salary', type: 'int', min: 0, max: 1200000, showlist: false, sort: false},
      // {key: 'score', type: 'float', default: 50, min: -100, max: 100, showlist: false, sort: false},
      // {key: 'manager', type: 'boolean', default: 'はい', checked:'はい', unchecked:' ', showlist: true, sort: false},
      // {key: 'address', type: 'string', default:'Tokyo', required: true, length:10, format: '[a-zA-Z]+', showlist: false, sort: false},
    ],
  },
  PERSON: {
    WITH: ['thumbnail', 'category', 'user', 'ruby', 'description'],
    MULTI_TX: false,         // 複数Tx使用
    TX_MAX: 2,   // 所持Tx最大数
    // 拡張項目定義（サンプル）: デフォルトはなし
    EXT_DEF: [
      // {key: 'post', type: 'string', showlist: true, sort: true},
      // {key: 'tel', type: 'tel', showlist: true, sort: true},
      // {key: 'mobile', type: 'tel', showlist: false, sort: false},
      // {key: 'entrydate', type: 'date', showlist: true, sort: false},
      // {key: 'salary', type: 'int', min: 0, max: 1200000, showlist: false, sort: false},
      // {key: 'score', type: 'float', default: 50, min: -100, max: 100, showlist: false, sort: false},
      // {key: 'manager', type: 'boolean', default: 'はい', checked:'はい', unchecked:' ', showlist: true, sort: false},
      // {key: 'address', type: 'string', default:'Tokyo', required: true, length:10, format: '[a-zA-Z]+', showlist: false, sort: false},
    ],
  },
  THING: {
    WITH: ['thumbnail', 'category', 'user', 'ruby', 'description'],
    MULTI_TX: false,         // 複数Tx使用
    TX_MAX: 2,   // 所持Tx最大数
    // 拡張項目定義（サンプル）: デフォルトはなし
    EXT_DEF: [
      // {key: 'post', type: 'string', showlist: true, sort: true},
      // {key: 'tel', type: 'tel', showlist: true, sort: true},
      // {key: 'mobile', type: 'tel', showlist: false, sort: false},
      // {key: 'entrydate', type: 'date', showlist: true, sort: false},
      // {key: 'salary', type: 'int', min: 0, max: 1200000, showlist: false, sort: false},
      // {key: 'score', type: 'float', default: 50, min: -100, max: 100, showlist: false, sort: false},
      // {key: 'manager', type: 'boolean', default: 'はい', checked:'はい', unchecked:' ', showlist: true, sort: false},
      // {key: 'address', type: 'string', default:'Tokyo', required: true, length:10, format: '[a-zA-Z]+', showlist: false, sort: false},
    ],
  },
  OTHER: {
    WITH: ['thumbnail', 'category', 'user', 'ruby', 'description'],
    MULTI_TX: false,         // 複数Tx使用
    TX_MAX: 2,   // 所持Tx最大数
    // 拡張項目定義（サンプル）: デフォルトはなし
    EXT_DEF: [
      // {key: 'post', type: 'string', showlist: true, sort: true},
      // {key: 'tel', type: 'tel', showlist: true, sort: true},
      // {key: 'mobile', type: 'tel', showlist: false, sort: false},
      // {key: 'entrydate', type: 'date', showlist: true, sort: false},
      // {key: 'salary', type: 'int', min: 0, max: 1200000, showlist: false, sort: false},
      // {key: 'score', type: 'float', default: 50, min: -100, max: 100, showlist: false, sort: false},
      // {key: 'manager', type: 'boolean', default: 'はい', checked:'はい', unchecked:' ', showlist: true, sort: false},
      // {key: 'address', type: 'string', default:'Tokyo', required: true, length:10, format: '[a-zA-Z]+', showlist: false, sort: false},
    ],
  },
  // category
  CATEGORY: {
    TYPES: [1,2],   // 選択可能な種別（1人,2物,3ゾーン,4:権限）
    WITH: [],
    // 拡張項目定義（サンプル）: デフォルトはなし
    EXT_DEF: [
      // {key: 'ruby', type: 'string', length: 20, showlist: true, sort: true },
    ],
  },
  // group
  GROUP: {
    WITH: [], // 'ruby'
    // 拡張項目定義（サンプル）: デフォルトはなし
    EXT_DEF: [
      // {key: 'ruby', type: 'string', length: 20, showlist: true, sort: true },
    ],
  },
  // zone
  ZONE: {
    WITH: [],
    TYPES: [1],   // 選択可能な種別（0, 1: 通常, 2: 警戒ゾーン, 3: ドア）
    // 拡張項目定義（サンプル）: デフォルトはなし
    EXT_DEF: [
      // {key: 'description', type: 'string', length: 100, showlist: true, sort: true },
    ],
  },
  NOTIFY: {
    // 通知媒体
    MIDIUM_TYPES: [0,1],   // 選択可能な種別（1メール,2slack）
    // 通知
    STATE_TYPES: [0,1,2,4,5], // 選択可能な種別（0 TXボタン通知,1 アラート系, 2 ユーザ登録・更新 , 3 sos, 4 進入禁止, 5 重要物品 ）
  },
  // 動線分析関連設定
  ANALYSIS: {
    DATETIME_DEFAULT: 24, // デフォルトの期間Fromに現在時刻から設定値分過去の日時を自動入力する
    DATETIME_DEFAULT_UNIT: 'hours', // デフォルトの期間Fromに現在時刻から設定値分過去の日時を自動入力する（単位）
    DATETIME_LIMIT: 366, // 分析期間の上限
    DATETIME_INTERVAL: 60 * 24, // Fromを設定した場合、この設定値分未来の日付をToに自動入力する（分単位）
  },
  // 集計
  STAY_SUM: {
    LOST_LIMIT: 90 * 60,  // 滞在時間集計不在判定時間（秒）
    ABSENT_LIMIT: 30 * 60,  // 滞在時間集計離席判定時間（秒）
    PARSENT_DIGIT: 100, // 在席率表示時の小数点以下桁数。なしなら1、1桁なら10、2桁なら100 …
    AXIS_FILL_GAP: 2, // 滞在時間集計の横軸で0件項目を表示(0:しない,1:する,2:月日の場合検索期間すべて表示)
    SCALE_TIMES: [5, 12, 18], // 滞在率画面グラフ目盛り時刻(時)
    OTHER_COLOR: '#404040', // 滞在率その他の色
    GRAPH_LIMIT: 0.3, // 日単位滞在分析グラフの足切り％
    ENABLE_DISPLAY_SPECIFIED: false // 日単位滞在分析画面の表示指定ボタン表示有無
  },
  // 交流分析
  PROXIMITY: {
    UNIT_HOUR: 5 * 60 * 60, // 指定秒を軸単位の最大値が超えた場合、滞在時間集計の表示を時間単位で表示する
    UNIT_MINUTE: 20 * 60,  // 指定秒を軸単位の最大値が超えた場合、滞在時間集計の表示を分単位で表示する
  },
  // Tx状態監視
  TX_MON: {
    WITH: ['btxId', 'major', 'minor', 'name', 'powerLevel', 'locationName'],
    WITH_SENSOR: [], // マージするセンサ情報のIDリスト
    POWER_LEVEL_GOOD: 80,  // 電池レベルで良好とみなす下限値
    POWER_LEVEL_WARN: 30,  // 電池レベルで減少とみなす下限値
  },
  SENSOR_LIST: {
    WITH: ['deviceId', 'deviceIdX'],
  },
  SENSORGRAPH: {
    SENSOR: [1,2,3,5,6,7,8,9],        // グラフで利用するセンサー一覧
    WITH_DEVICE: true,                // 画面上でデバイスを使用するか否か
    CSV_IMMEDIATE: false,             // csvで直近値を出力するか否か
  },
  HISTORY_EXC: {
    SORT: 'desc', // 履歴情報Excの日付デフォルトソート（asc or desc）
  },
  TXDETAIL: {
    // TX詳細表示項目（presenceStatus: プレゼンス情報）
    ITEMS: ['minor', 'major', 'name', 'group', 'category', 'tel', 'timestamp'],
    NO_UNREGIST_THUMB: false, // TX詳細サムネイル非表示（未登録の場合）,
    SHOW_LABEL: true, // 標準項目にラベルを表示する,
    TEXT_MAX: 38 // 指定文字数を超えたら...表示にする
  },
  PROCESS_SUM: {
    TIME: {
      SUCCESS_COMPLETE: 30, // 最終工程がn秒以上の場合、正常終了
      LATE: 300, // 最終工程以外がn秒を上回る場合、超過エラー
    },
  },
  SVC: {
    TOILET: {
      LED: {
        ENABLE: false,
        RGB: -1,
      }
    },
    STAY_SUM: {
      START: 0, // 滞在時間集計開始時間(時分)
      END: 2400, // 滞在時間集計終了時間(時分)  
    }
  },
  ENTER: {
    AUTO_PAGE: 1, // 0:Disable, 1:Enable & Default Pause, 2:Enable && Default Start
    START_TIME: 1576148292834, // unix time msec
    AUTO_PAGER_MSEC: 10000, // 自動ページャー更新間隔(ミリ秒)
  },
  MANAGE: {
    SETTING_CATEGORY: [], // 表示するシステム設定カテゴリ
  },
  TOILET: {
    AUTO_RELOAD: true, // 自動リロード
  },

  // 活動実績
  ACTIVITY: {
    STACK_TYPE: 'location'
  },
  // 会議室利用実績
  MEETING: {
    MAX_NUM: 6 // 利用人数の最大値
  },
  // 入退室管理
  ATTENDANCE: {
    ALL_DAY_HOUR: 8,
    HALF_DAY_HOUR: 4,
    LATE_HOUR: 10,
    TEMP_MIN_HOUR: 1,
  },
  
  // その他
  SPLIT_UPLOAD_SIZE: 50 * 1024 * 1024, // 分割アップロードのサイズ閾値（Byte）
  SPLIT_UPLOAD_SIZE_IE: 10 * 1024 * 1024, // 分割アップロードのサイズ閾値（Byte）（for IE）
  MAX_IMAGE_SIZE: 1.5 * 1024 * 1024, // アップロード可能な最大イメージサイズ(Byte)
  MAX_IMAGE_ZIP_SIZE: 100 * 1024 * 1024, // アップロード可能な最大イメージzipサイズ(Byte)
  AREA_THUMBNAIL_MAX: 300, // サムネイルリサイズ時の最大幅・高さ(エリア)
  POT_THUMBNAIL_MAX: 200, // サムネイルリサイズ時の最大幅・高さ(pot)

  POSITION_SUMMARY_START: 10, // 位置情報csvダウンロード開始時刻（時）
  POSITION_SUMMARY_END: 19,    // 位置情報csvダウンロード終了時刻（時）
  POSITION_SUMMARY_INTERVAL: 10, // 位置情報csvダウンロード間隔（分）
  POSITION_SUMMARY_RECEIVE_COUNT: 2 // 位置情報における受信回数の閾値
}


// URL関連設定
export const APP_SERVICE = {
  // BASE_URL: 'https://msteams-data.dev.exbeacon.com',
  BASE_URL: 'http://localhost:8080',
}

export const EXCLOUD = {
  BASE_URL: 'https://excloud-evalktdv-api.azurewebsites.net/api', 

  // TODO: EXCloud直はなくなったため、以下はConstantに移す
  withCredentials: true,
  // POSITION_URL: EXCLOUD.BASE_URL + "/beacon/position-kalman?_=",
  // GATEWAY_URL: EXCLOUD.BASE_URL + "/gateway/0?=",
  // TELEMETRY_URL: EXCLOUD.BASE_URL + "/telemetry/0?=",
  POSITION_URL: '/core/excloud/position?_=',
  GATEWAY_URL: '/core/excloud/gateway?_=',
  TELEMETRY_URL: '/core/excloud/telemetry?_=',
  SENSOR_URL: '/core/excloud/sensor/{id}?_=',
  SENSOR_URL_NEW: '/basic/sensorHistory/fetch/{id}?_=', // 十分に確認が取れた段階でSENSOR_URLに変更
  DL_LIST_URL: '/core/excloud/dllist/{type}/{yyyymm}?_=',
  DL_URL: '/core/excloud/dl/{type}/{yyyymmdd}?_=',
  LED_URL: '/core/excloud/led?_=',
  POSITION_HISTORY_FETCH_URL: '/core/positionHistory/fetch/{allFetch}?_=',
  AREA_THUMBNAIL_URL: '/core/area/mapThumbnail/{id}?_=',
  POT_THUMBNAIL_URL: '/basic/pot/potThumbnail/{id}?_=',
}

export const EXSERVER = {
  ENABLE: false
}

export const DISP = { // 表示系設定（表示・色・フォント・サイズ）
  MENU: {
    SHOW_NAV: true, // show nav  
    SHOW_SIDEBAR: true, // show sidebar  
    SHOW_LOGO: true, // show logo (or show title text)
    SHOW_HELP: true,
    THEME: 'default', // デフォルトのテーマ
  },
  // 位置表示：TX
  TX: {
    R_ABSOLUTE: true, // Txの半径を画面解像度に合わせる
    R: 26, // Txの半径
    ASPECT_RATIO: 1, // 四角形の場合のアスペクト比（高さ/幅）
    FIX_R: 26, // Txの半径(カテゴリ一覧、グループ一覧、凡例表示用)
    ROUNDRECT_RADIUS: 13, // Tx角丸表示時のRADIUS
    BGCOLOR: '#3bcddc', // Tx表示時のデフォルト背景色
    COLOR: '#000000', // Tx表示時のデフォルト文字色
    SHAPE: SHAPE.CIRCLE, // Tx表示時のデフォルト形状
    STROKE_COLOR: '#cccccc', // Tx表示時のデフォルト枠線色
    STROKE_WIDTH: 1, // Tx表示時のデフォルト枠線幅
    ALPHA: 0.6, // Tx表示時(離席)のデフォルト透過値
    LOST_ALPHA: 0.1, // Tx固定表示(不在)時のデフォルト透過値
    // TX_FONT: '20px Arial', // Tx表示時のフォント
    DIV_2: 1, // Txが重なった際に２つ上下左右に並べる場合にずらす倍率
    DIV_3: 0.5, // Txが重なった際に３つ左右に並べる場合にずらす倍率
    HORIZON: 10, // TXアイコンタイル表示時の列数
    VERTICAL: 10, // TXアイコンタイル表示時の行数
    DISPLAY_PRIORITY: 'category', // TX表示の際に参照するdisplay方法
    ABSENT_ZONE_DISPLAY_TYPES: ['undetected','lost','absent'],   // undetected:未検知, lost:消失, absent:不在ゾーン）
    FIXED_POS: {
      APPLY_COLOR: true, // この設定を適用するか。falseの場合、カテゴリ/グループの色と不在時の透過を用いる
      SHAPE: SHAPE.CIRCLE,
      R: 20,
      COLOR: '#FFFFFF',
      IN_ZONE_BGCOLOR: '#4472C4', // 固定ゾーンにいる場合
      OUT_ZONE_BGCOLOR: '#C00000', // 固定ゾーン外の同一エリアに居る場合
      UNDETECT_BGCOLOR: '#B78811', // 未検知
      LOST_BGCOLOR: '#3D3D3D', // 消失
    },
    PRESENCE: {
      R: 8 // プレゼンス・ステータスのアイコンの半径
    }
  },
  // 位置表示(数量)：TX
  TX_NUM: {
    R: 20, // Txの半径
    ROUNDRECT_RADIUS: 13, // Tx角丸表示時のRADIUS
    BGCOLOR: '#ff7f50', // Tx表示時のデフォルト背景色
    COLOR: '#000000', // Tx表示時のデフォルト文字色
    STROKE_COLOR: '#cccccc', // Tx表示時のデフォルト枠線色
    STROKE_WIDTH: 1, // Tx表示時のデフォルト枠線幅

    // ツールチップ内の表示要素
    TOOLTIP_ITEMS: {
      TX_LOCATION_NAME: true, // 場所名
      TX_LOCATION_TYPE: true, // 場所タイプ
    },
    TOOLTIP_FONT: '12px Arial', // ツールチップフォント
    TOOLTIP_COLOR: '#000000', // ツールチップ文字色
    TOOLTIP_BORDERCOLOR: '#888888', // ツールチップ枠線色
    TOOLTIP_BGCOLOR: '#FFFDE6', // ツールチップ背景色
    TOOLTIP_ROUNDRECT: 16, // ツールチップ角丸半径
  },
  EXB_LOC: {
    // 場所配置設定のEXB表示サイズ
    SIZE: {
      W: 60,
      H: 30
    },
    BGCOLOR_DEFAULT: '#76ccf7', // 場所配置設定のアイコン表示背景色(デフォルト)
    BGCOLOR_DEFAULT_NOTX: '#76ccf7', // 場所配置設定のアイコン表示背景色(デフォルト)
    COLOR: '#000', // 場所配置設定のアイコン表示文字色
    FONT: 'Arial', // 場所配置設定のアイコン表示フォント
    RSSI_BGCOLOR: '#76ccf7',
    MAX_FONT_SIZE: 26, // 場所配置設定のアイコン表示最大フォントサイズ
    BGCOLOR_PATTERN: [], // 場所配置設定のアイコン表示背景色(種類別:Tx関連時)
    BGCOLOR_PATTERN_NOTX: [], // 場所配置設定のアイコン表示背景色(種類別:Tx未関連時)
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
    PATTERN: ['19 #5b9bd5', '26 #ffd966', '31 #ff5050', '#ff2525 $DANGER'], // 温度アイコンパターン（順不同。数値：閾値。先頭が#：カラーコード。先頭が$：点滅パターン。OR：閾値に同値を含む。）
    HUMIDITY_PATTERN: ['LESS 30', 'LESS 50', 'MORE 85'], // 湿度アラートパターン（順不同。数値：閾値。LESS：閾値以下の場合に警告。MORE：閾値以上の場合に警告）
  
    TEMPERATURE_MAX: 28,  // 温湿度ヒートマップ最大値
    TEMPERATURE_MIN: 0,   // 温湿度ヒートマップ最小値
    TEMPERATURE_RADIUS: 150,   // 温湿度ヒートマップ直径
    TEMPERATURE_DECIMAL_DIGITS:1,   // 温度小数桁（ゼロパディング）
  },
  PIR: {
    R_SIZE: 26,  // PIR表示時の円の半径
    MIN_COUNT: 0, // PIRでの存在条件の最小カウント値
    BGCOLOR: '#FC7E82', // "#E2A6A5" // PIR表示の円の背景色
    FGCOLOR: '#FFFFFF', // PIR表示時の文字色
    INUSE_LABEL: 'inUse', // PIRで存在時のラベルキー
    EMPTY_SHOW: true, // PIRで不在時に表示するか否か
    EMPTY_BGCOLOR: '#595959', // PIRで不存時の背景色
    EMPTY_LABEL: 'sensorEmpty', // PIRで不在時のラベルキー
  },
  PRESSURE: {
    R_SIZE: 26,  // 圧力センサ表示時の円の半径
    VOL_MIN: 1100, // 圧力センサの使用判定値(指定値以下で使用中扱い)
    BGCOLOR: '#FC7E82', // "#E2A6A5" // 圧力センサ表示の円の背景色
    FGCOLOR: '#FFFFFF', // 圧力センサ表示時の文字色
    INUSE_LABEL: 'inUse', // 圧力センサで使用時のラベルキー
    EMPTY_SHOW: true, // 圧力センサで未使用時に表示するか否か
    EMPTY_BGCOLOR: '#595959', // 圧力センサで不存時の背景色
    EMPTY_LABEL: 'sensorEmpty', // 圧力センサで未使用時のラベルキー
  },
  MEDITAG: {
    STRESS_BG: ['#85A9D1', '#F0C864', '#F49696'], // ストレスレベルに応じた背景色
  },
  PRESENCE: {
    BG: ['#92C353', '#C4314B', '#FF314B', '#FCD116', '#F0E68C', '#F6f6F6', '#ccc', '#A381DD'], // 1 -7
  },
  ANALYSIS: { // 分析
    LINE: {
      MIN_WEIGHT: 3,    // 動線の最小太さ
      MAX_WEIGHT: 10,   // 動線の最大太さ
      COLOR: '#ff0000', // 動線の色 (#xxxxxx)
      OPACITY: 1,       // 動線の透過度 (0～1。0.5などの小数も可)
    },
    HEATMAP: {
      RADIUS: 150,      // 直径
    },
  },
  CONTROL: {
    COMBO_BOX: {
      W: 165,
    },
    MAP: {
      MIN_HEIGHT: 32,
    },
  },
  ENTER: {
    COL_CNT: 7, // 表の列数
    LOST_COLOR: 'gray', // 消失者の文字色
    ABSENT_BGCOLOR: 'rgb(255,153,153)', // 退場者の背景色 
    ENTER_BGCOLOR: 'rgb(217,217,217)', // 入場者の背景色
  },

  FONT_ICON_ADJUST_SCALE: 1.0, // アイコン内テキストのフォントサイズ係数 TODO:次のバージョンでTX以下へ移動
  IS_SCALE_ICON_TEXT: false, // アイコン内のテキストを自動スケールさせる TODO:次のバージョンでTX以下へ移動
  DUMMY_ICON_TEXT: 'あああ',
  SHOW_MAP_RATIO: false, // 寸法設定を表示する

  MAP_FIT: 'both', // マップを画面表示範囲内にフィットさせるか。width or height or both
  MAP_FIT_MOBILE: 'width', // (モバイル)マップを画面表示範囲内にフィットさせるか。width or height or both

  TEMPERATURE_LINE_COLOR: '#fc5800',// 温度グラフの線色
  HUMIDITY_LINE_COLOR: '#7da6e8',// 湿度グラフの線色
  PIR_LINE_COLOR: '#fc5800',// 人感センサグラフの線色
  THERMOPILE_LINE_COLOR: '#fc5800',// サーモパイルセンサグラフの線色
  LED_LINE_COLOR: '#fc5800',// LEDセンサグラフの線色
  MAGNET_LINE_COLOR: '#fc5800',// マグネットセンサグラフの線色
  PRESSURE_LINE_COLOR: '#fc5800',// 圧力センサグラフの線色
  AMBIENT_LIGHT_COLOR: '#AC787C',// 照度センサグラフの線色
  SOUND_NOISE_COLOR: '#95A4DE',// 騒音センサグラフの線色
  H_BLOOD_PRESSURE_LINE_COLOR: '#fc5800',// MEDiTAGセンサグラフの線色
  L_BLOOD_PRESSURE_LINE_COLOR: '#7da6e8',// 湿度グラフの線色
  HEART_RATE_LINE_COLOR: '#7de8a6',// 湿度グラフの線色
  STEP_LINE_COLOR: '#7da6e8',// 歩数グラフの線色
  DOWN_COUNT_LINE_COLOR: '#fc5800',// 転倒数グラフの線色
  SUM_STACK_COLOR: ['#F78D7C','#AC787C','#95A4DE','#9DC3E6','#A9D18E','#FFD966','#D9D9D9','#A6A6A6','#7F7F7F'], // 滞在集計の色パターン
  SUM_STACK_BORDER_COLOR: 'gray',

  BLOOD_PRESSURE_MAX: 200,// 血圧最大メモリ
  BLOOD_PRESSURE_STEP: 25,// 血圧メモリ間隔
  HEART_RATE_MAX: 200,// 心拍最大メモリ
  HEART_RATE_STEP: 25,// 心拍メモリ間隔

  THERMOPILE_S_SIZE: 20, // サーモパイル円Sサイズ
  THERMOPILE_M_SIZE: 40, // サーモパイル円Mサイズ
  THERMOPILE_L_SIZE: 60, // サーモパイル円Lサイズ

  ZONE: {
    MIN_WIDTH: 30,
    MIN_HEIGHT: 30,
  },
  
  TXDETAIL_DIFF: 25, // TX詳細の表示位置差分（ポップアップ左端から吹き出しの中央までの距離）
  TXDETAIL_POPUP_SIZE: 150, // TX詳細表示ポップアップの高さ
  TXSENSOR_POPUP_SIZE: 165, // TXセンサー表示ポップアップの高さ
  TXMEDITAG_POPUP_SIZE: 230, // TXMEDITAG表示ポップアップの高さ

  POSITION_HISTORY: {
    HEADERS: ['potName', 'major', 'minor', 'deviceId', 'locationName', 'areaName'], // 位置表示履歴の表示カラム
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
    WIDTH: 50,
    HEIGHT: 20,
    BG_COLOR: ['#dc143c', '#ff4500', '#ff6347', '#7F7F7F'],
    FONT_COLOR: ['white', 'white', 'white', 'white'],
    FONT_SIZE: 15,
  },

  // 禁止区域関連設定
  PROHIBIT: {
    TWINKLE_TIME: 1500, // 点滅間隔(ミリ秒)
    FONT_COLOR: 'black',
    FONT_SIZE: 26,
    BG_COLOR: 'rgba(255,0,0,0.5)',
  },
  // システム設定カテゴリ
  SYSTEM_USE: {
    BG_COLOR: {
      ABSENT: '', // 背景色カラーコード
      PROHIBIT: '', // 背景色カラーコード  
    }
  },

  PLAN: {
    PLAN_COLOR: '#ffffff',
    PLAN_BG_COLOR: '#0079d6',
    ACTUAL_IN_PLAN_BG_COLOR: '#1aff1a', // 予定有・利用有 green
    NO_ACTUAL_IN_PLAN_BG_COLOR: '#ffff80', // 予定有・利用無 yellow
    ACTUAL_OUT_OF_PLAN_BG_COLOR: '#ff9999', // 予定無・利用有 red
    NO_ACTUAL_NO_PLAN_BG_COLOR: '#595959', // 予定無・利用無 gray
    EDIT_PLAN_HEADER_BG_COLOR: '#0078d4',
  },

  // 位置表示（全体）
  POS_STACK: {
    TYPE: 1, // 表示方法
    ZONE_OTHER: true // ゾーンその他を表示する
  },
}

