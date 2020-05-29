// Various constants or types come here. Basically constants does not change by environment.

import * as LocalStorageHelper from '../helper/base/LocalStorageHelper'

let i18n

export const setI18n = (pI18n) => i18n = pI18n

export const PLAN_TARGET_TYPE = {
  ZONE: 0,
  LOCATION: 1,
  POT_THING: 2,
  POT_PERSON: 3
}

export const THEME = [
  {id: 1,  name: 'default', color: '#588BC1'},
  {id: 2,  name: 'earthcolor', color: '#5C7886'},
  {id: 3,  name: 'autumn', color: '#927760'},
  {id: 4,  name: 'vivid', color: '#D50057'},
  {id: 5,  name: 'gray-scale', color: '#484848'},
  {id: 6,  name: 'indigo', color: '#5968B0'},
  {id: 7,  name: 'exeo', color: '#4861cc'},
]

export const CHAR_SET = [
  {id: 1,  name: 'UTF8'},
  {id: 2,  name: 'SJIS'},
]

export const LOCALE = [
  {id: 1,  name: 'null'},
  {id: 2,  name: 'ja'},
  {id: 3,  name: 'en'},
]

export const TIME_ZONE = {
  data: {
    JST: 'Asia/Tokyo',
    UTC: 'Etc/UTC',
    IST: 'Asia/Kolkata',
    EST: 'America/Indianapolis',
    MST: 'America/Phoenix',
    HST: 'Pacific/Honolulu',
    ACT: 'Australia/Darwin',
    AET: 'Australia/Sydney',
    AGT: 'America/Argentina/Buenos_Aires',
    ART: 'Africa/Cairo',
    AST: 'America/Anchorage',
    BET: 'America/Sao_Paulo',
    BST: 'Asia/Dhaka',
    CAT: 'Africa/Harare',
    CNT: 'America/St_Johns',
    CST: 'America/Chicago',
    CTT: 'Asia/Shanghai',
    EAT: 'Africa/Addis_Ababa',
    ECT: 'Europe/Paris',
    IET: 'America/Indiana/Indianapolis',
    MIT: 'Pacific/Apia',
    NET: 'Asia/Yerevan',
    NST: 'Pacific/Auckland',
    PLT: 'Asia/Karachi',
    PNT: 'America/Phoenix',
    PRT: 'America/Puerto_Rico',
    PST: 'America/Los_Angeles',
    SST: 'Pacific/Guadalcanal',
    VST: 'Asia/Ho_Chi_Minh',
  },
  getData(tz = 'UTC') {
    const key = tz.toUpperCase()
    return TIME_ZONE.data[key] != null? TIME_ZONE.data[key] : Object.values(TIME_ZONE.data).includes(tz) ?  tz : TIME_ZONE.data.UTC
  },
}

export const USER = {
  DUMMY: {
    PASS: 'dummy',
  },
  ENCRYPT: {
    ON: 1,
    OFF: 0,
  }
}

export const KEYCODE = {
  ENTER: 13
}

export const KEY = {
  CURRENT: {
    REGION: 'currentRegion',
    AREA: 'currentArea',
    SHOW_FILTER_ON_POSMAP: 'showFilterOnPosmap',
  },
}

export const PATTERN = {
  NUMBER: '^-?[0-9]+[.]?[0-9]*$',
  NUMBER_LIST: '^(-?[0-9]+[.]?[0-9]*)+(,-?[0-9]+[.]?[0-9]*)*$',
  MASTER_CD: '^[a-zA-Z0-9_\\-\\.:]*$',
  LOCATION_CD: '^[a-zA-Z0-9_\\-:]*$',
  REGEXP: {
    MASTER_CD: /^[a-zA-Z0-9_\-.:]*$/,
    LOCATION_CD: /^[a-zA-Z0-9_\-:]*$/,
  },
}

export const BULK = {
  PRIMARY_KEY: 'updateKey',
  SPLITTER: ';',
  REQUIRE: {
    REGION: { ALLOW: ['updateKey', 'ID', 'regionName', 'meshId'] },
    AREA: { ALLOW: ['updateKey', 'ID', 'areaName'], DISALLOW: ['deviceId', 'deviceIdX', 'zoneName'] },
    EXB: { ALLOW: ['updateKey', 'threshold1'] },
    TX: { ALLOW: ['updateKey'], DISALLOW: ['threshold1'] },
    LOCATION: { ALLOW: ['updateKey', 'ID', 'locationName', 'txViewType'] },
    POT: { ALLOW: ['updateKey', 'ID', 'potName', 'potType'] },
    CATEGORY: { ALLOW: ['updateKey', 'ID', 'categoryName', 'categoryType', 'color', 'bgColor', 'shape' ] },
    AUTH_CATEGORY: { ALLOW: ['updateKey', 'ID', 'categoryName', 'categoryType', 'guardNames', 'doorNames' ] },
    GROUP: { ALLOW: ['updateKey', 'ID', 'groupName', 'color', 'bgColor', 'shape'] },
    USER: { ALLOW: ['updateKey', 'loginId', 'roleName'], DISALLOW: ['potName'] },
    ROLE: { ALLOW: ['updateKey', 'roleName'], DISALLOW: ['loginId'] },
    ROLE_FEATURE: { ALLOW: ['updateKey', 'mode'] },
    ZONE: { ALLOW: ['updateKey', 'ID', 'zoneName'] },
  }
}

export const BOOLEAN = {
  getOptions(addBlank){
    return [
      addBlank? {text: '', value: ''}: null,
      {text: 'true', value: 'true'},
      {text: 'false', value: 'false'},
    ].filter(val => val)
  },
}

export const ROLE = {
}

export const ROLE_FEATURE = {
  MODE: {
    DENY: 0x0000,
    SYS_REFERENCE: 0x0001,
    SYS_UPDATE: 0x0002,
    LIST_REFERENCE: 0x0004,
    DETAIL_REFERENCE: 0x0008,
    BULK_REFERENCE: 0x0010,
    UPDATE: 0x0020,
    REGIST: 0x0040,
    DELETE: 0x0080,
    BULK_REGIST: 0x0100,
    RESERVATION_1: 0x0200,
    RESERVATION_2: 0x0400,
    RESERVATION_3: 0x0800,
    SYS_ALL: 0x01FF,
    ALL: 0x01FC,
  },
  getAllAuthorizationOption(){
    const isProviderUser = LocalStorageHelper.getLogin().isProviderUser
    return {text: i18n.tnl('label.allAuthorization'), value: isProviderUser? ROLE_FEATURE.MODE.SYS_ALL: ROLE_FEATURE.MODE.ALL}
  },
  getModeOptions(){
    const isProviderUser = LocalStorageHelper.getLogin().isProviderUser
    return [
      isProviderUser? {text: i18n.tnl('label.refer'), value: ROLE_FEATURE.MODE.SYS_REFERENCE}: null,
      isProviderUser? {text: i18n.tnl('label.update'), value: ROLE_FEATURE.MODE.SYS_UPDATE}: null,
      {text: i18n.tnl('label.listReference'), value: ROLE_FEATURE.MODE.LIST_REFERENCE},
      {text: i18n.tnl('label.detailReference'), value: ROLE_FEATURE.MODE.DETAIL_REFERENCE},
      {text: i18n.tnl('label.bulkReference'), value: ROLE_FEATURE.MODE.BULK_REFERENCE},
      {text: i18n.tnl('label.modify'), value: ROLE_FEATURE.MODE.UPDATE},
      {text: i18n.tnl('label.createNew'), value: ROLE_FEATURE.MODE.REGIST},
      {text: i18n.tnl('label.delete'), value: ROLE_FEATURE.MODE.DELETE},
      {text: i18n.tnl('label.bulkRegist'), value: ROLE_FEATURE.MODE.BULK_REGIST},
    ].filter((val) => val)
  }
}

export const FEATURE = {
  HIDE_LIST: ['MasterTenant'],
  NAME: {
    ALL_REGION: 'ALL_REGION'
  },
  getTypeOptions(){
    return [
      {text: i18n.tnl('label.noLimitType'), value: 0},
      {text: i18n.tnl('label.limitType'), value: 1},
    ]
  },
  getEnabledOptions(){
    return [
      {text: i18n.tnl('label.disabledType'), value: false},
      {text: i18n.tnl('label.enabledType'), value: true},
    ]
  }
}

export const UPDATE_ONLY_NN = { NONE: 0, NULL: 1, EMPTY_ZERO: 2 }

export const IGNORE = { OFF: 0, ON: 1 }

export const TX = {
  DISP: {
    NONE: 0,
    POS: 1,
    PIR: 2,
    ALWAYS: 4
  }
}

export const txViewTypes = [
  {value: 1, text: 'pattern1'},
  {value: 2, text: 'pattern2'},
  {value: 3, text: 'pattern3'},
]

export const EXB = {
  TYPE: {
    NONE_DIRECT: 0,
    DIRECT: 1,
  },
  getTypes() {
    return [
      { value: null, text: '' },
      { value: 0, text: i18n.tnl('label.noneDirect') },
      { value: 1, text: i18n.tnl('label.direct') },
    ]
  }
}

export const LOCATION = {
  EXT_VALUE: {
    TOILET: {
      MALE: 'male',
      FEMALE: 'female',
      MULTIP: 'multip',    
    }
  }
}

export const POT_TYPE = {
  PERSON: 1,
  THING: 2,
  OTHER: 3,
  getTypes(){
    return [
      {value: POT_TYPE.PERSON, text: i18n.tnl('label.person')},
      {value: POT_TYPE.THING, text: i18n.tnl('label.thing')},
      {value: POT_TYPE.OTHER, text: i18n.tnl('label.potOther')},
    ]
  },
}

export const CATEGORY = {
  PERSON: 1,
  THING: 2,
  ZONE: 3,
  AUTH: 4,
  OTHER: 5,
  getTypes(includeAuth){
    return [
      {value: CATEGORY.PERSON, text: i18n.tnl('label.person')},
      {value: CATEGORY.THING, text: i18n.tnl('label.thing')},
      {value: CATEGORY.ZONE, text: i18n.tnl('label.zone')},
      includeAuth? {value: CATEGORY.AUTH, text: i18n.tnl('label.auth')}: null,
      {value: CATEGORY.OTHER, text: i18n.tnl('label.potOther')},
    ].filter(val => val)
  },
  POT_AVAILABLE: [1, 2, 5],
  ZONE_AVAILABLE: [3],
}

export const TYPE_RELATION = {
  getPotCategory() {
    return {
      [POT_TYPE.PERSON]: CATEGORY.PERSON,
      [POT_TYPE.THING]: CATEGORY.THING,
      [POT_TYPE.ZONE]: CATEGORY.ZONE,
      [POT_TYPE.OTHER]: CATEGORY.OTHER,
    }
  }
}

export const PROCESS_SUM = {
  SUCCESS_COMPLETE: {value: 1, label: 'successComplete'},
  PROCESSING: {value: 2, label: 'processing'},
  NOT_SMOOTH: {value: 3, label: 'notSmooth', error: true},
  LATE: {value: 4, label: 'processLate', error: true},
  getTypes(){
    return [
      {value: CATEGORY.THING, text: i18n.tnl('label.thing')},
      {value: CATEGORY.PERSON, text: i18n.tnl('label.person')},
    ]
  },
}

export const NOTIFY_MIDIUM = {
  getTypes(){
    return [
      {value: 0, text: i18n.tnl('label.email')},
      {value: 1, text: i18n.tnl('label.slack')},
    ]
  },
}

export const SHAPE = {
  CIRCLE: 1,
  SQUARE: 2,
  ROUND_SQUARE: 3,
  getShapes() {
    return [
      {value: 1, text: i18n.tnl('label.circle')},
      {value: 2, text: i18n.tnl('label.square')},
      {value: 3, text: i18n.tnl('label.roundedSquare')},
    ]}
}

export const ZONE = {
  COORDINATE: 0,
  NON_COORDINATE: 1,
  GUARD: 2,
  DOOR: 3,
  getTypes(){
    return [
      {value: ZONE.COORDINATE, text: i18n.tnl('label.coordinate')},
      {value: ZONE.NON_COORDINATE, text: i18n.tnl('label.nonCoordinate')},
    ]
  },
  getOptions(){
    return [
      { value: ZONE.NON_COORDINATE, text: i18n.tnl('label.normal') },
      { value: ZONE.GUARD, text: i18n.tnl('label.zoneGuard') },
      { value: ZONE.DOOR, text: i18n.tnl('label.zoneDoor') },
    ]
  },
  MIN_WIDTH: 50,
  MIN_HEIGHT: 50,
}

export const SENSOR = {
  TEMPERATURE: 1,
  PIR: 2,
  THERMOPILE: 3,
  LED_TYPE2: 4,
  MEDITAG: 5,
  MAGNET: 6,
  BUTTON: 7,
  PRESSURE: 8,
  OMR_ENV: 9,
  OMR_TP_HUMAN: 10,
  OMR_TP_ENV: 11,
  LED_TYPE5: 12,
  LED_TYPE3: 13,
  CO2: 14,
  MAGNET_STATUS: {
    OFF: 0,
    ON: 4,
  },
  STRING: ['','temperature','pir','thermopile','led_type2','meditag','magnet','button','pressure','omr-env','omr-tp-human','omr-tp-env','led_type5'],
  NAMES: ['','thermohumidity','pir','thermopile','led_type2','meditag','magnet','button','pressure','omr-env','omr-tp-human','omr-tp-env','led_type5'],
  EXB_SENSORS: [2, 3, 6, 8, 14],
}

export const SUM_UNIT = {
  getOptions(){
    return [
      {value:1, text: i18n.t('label.minute'), param: 'minute'},
      {value:2, text: i18n.t('label.hours'), param: 'hour'},
      {value:3, text: i18n.t('label.day'), param: 'day'},
    ]
  }
}

export const SUM_TARGET = {
  IMMEDIATE: 1,
  AVERAGE: 2,
  MAX: 3,
  MIN: 4,
  getOptions(){
    return [
      {value:1, text: i18n.t('label.immediate')},
      {value:2, text: i18n.t('label.average')},
      {value:3, text: i18n.t('label.max')},
      {value:4, text: i18n.t('label.min')},
    ]
  }
}

export const SUM_FILTER_KIND = {
  getOptions(){
    return [
      {value:null, text: ''},
      {value:'potType', text: i18n.t('label.potType')},
      {value:'pot', text: i18n.t('label.pot')},
      {value:'category', text: i18n.t('label.category')},
      {value:'group', text: i18n.t('label.group')},
      {value:'area', text: i18n.t('label.area')},
      {value:'zone', text: i18n.t('label.zone')},
      {value:'zoneCategory', text: i18n.t('label.zoneCategory')},
    ]
  }
}

export const DEVICE = {
  EXB: 0,
  TX: 1,
  getOptions(){
    return [
      {value: 0, text: i18n.t('label.exb')},
      {value: 1, text: i18n.t('label.tx')},
    ]
  }
}

export const SUM_UNIT_STACK = {
  getOptions(){
    return [
      {value:'pot', text: i18n.t('label.pot')},
      {value:'area', text: i18n.t('label.area')},
      {value:'zone', text: i18n.t('label.zone')},
      {value:'zoneCategory', text: i18n.t('label.zoneCategory')},
    ]
  }
}

export const SUM_UNIT_AXIS = {
  getOptions(){
    return [
      {value:'month', text: i18n.t('label.month')},
      {value:'day', text: i18n.t('label.day')},
      {value:'pot', text: i18n.t('label.pot')},
      {value:'area', text: i18n.t('label.area')},
      {value:'zone', text: i18n.t('label.zone')},
      {value:'zoneCategory', text: i18n.t('label.zoneCategory')},
    ]
  }
}

export const PROXIMITY_STACK = {
  getOptions(){
    return [
      {value:'group', text: i18n.t('label.group')},
      {value:'category', text: i18n.t('label.category')},
      {value:'age', text: i18n.t('label.age')},
      {value:'zone', text: i18n.t('label.zone')},
      {value:'zoneCategory', text: i18n.t('label.zoneCategory')},
    ]
  }
}

export const PROXIMITY_FILTER_KIND = {
  getOptions(){
    return [
      {value:null, text: ''},
      {value:'pot', text: i18n.t('label.pot')},
      {value:'area', text: i18n.t('label.area')},
      {value:'category', text: i18n.t('label.category')},
      {value:'group', text: i18n.t('label.group')},
      {value:'zone', text: i18n.t('label.zone')},
      {value:'zoneCategory', text: i18n.t('label.zoneCategory')},
    ]
  }
}

export const PROXIMITY_TARGET = {
  getOptions(){
    return [
      {value:'time', text: i18n.t('label.proximityTime')},
      {value:'count', text: i18n.t('label.proximityCount')},
      {value:'total', text: i18n.t('label.proximityTotal')},
    ]
  }
}

export const STAY_RATIO_BASE_FILTER_KIND = {
  getOptions(){
    return [
      {value:null, text: ''},
      {value:'pot', text: i18n.t('label.pot')},
    ]
  }
}

export const THERMOHUMIDITY = {
  CALC: {
    DISCOMFORT: 1,
    TEMPERATURE: 2,
  },
}

export const PRESENCE = {
  STATUS: { // あえてキャメルに
    Available: 1,
    Busy: 2,
    DoNotDisturb: 3,
    BeRightBack: 5,
    Away: 4,
    Offline: 6,
    PresenceUnknown: 7,
  }
}

export const DISCOMFORT = {
  HOT: 'hot',
  COMFORT: 'comfort',
  COLD: 'cold',
}

export const LED_COLORS = {
  BLACK: parseInt('1', 2),
  BLUE: parseInt('10', 2),
  RED: parseInt('100', 2),
  PURPLE: parseInt('1000', 2),
  GREEN: parseInt('10000', 2),
  PALEBLUE: parseInt('100000', 2),
  YELLOW: parseInt('1000000', 2),
  WHITE: parseInt('10000000', 2),
}

export const LED_BLINK_TYPES = {
  ON: 0,
  CHANGE_SLOW: 1,
  CHANGE_FAST: 2,
  BLINK_SLOW: 3,
  BLINK_FAST: 4,
}

export const ALERT_STATE = {
  SCREEN: 'screen', // map,list,wholeすべて
  MAP: 'map',
  LIST: 'list',
  WHOLE: 'whole',
  GUEST: 'guest',
  MAIL: 'mail',
  LED: 'led',
}

export const DETECT_STATE = {
  DETECTED: 1,
  LOST: 2,
  UNDETECT: 4,
  NONE: 0,
  getTypes() {
    return [
      {value: this.DETECTED, text: i18n.t('label.detected')},
      {value: this.LOST, text: i18n.t('label.temporaryUndetect')},
      {value: this.UNDETECT, text: i18n.t('label.undetect')},
      {value: this.NONE, text: i18n.t('label.none')}
    ]
  },
}

export const BATTERY_STATE = {
  getTypes(){
    return [
      {value:1, text: i18n.t('label.power-good'), class: 'success'},
      {value:2, text: i18n.t('label.power-warning'), class: 'warning'},
      {value:3, text: i18n.t('label.power-poor'), class: 'danger'},
      {value:4, text: i18n.t('label.power-null'), class: 'secondary'},
    ]
  }
}

export const NOTIFY_STATE = {
  TX_DELIVERY_NOTIFY: 'TX_DELIVERY_NOTIFY',
  GW_ALERT: 'GW_ALERT',
  EXB_ALERT: 'EXB_ALERT',
  TX_BATTERY_ALERT: 'TX_BATTERY_ALERT',
  USER_REG_NOTIFY: 'USER_REG_NOTIFY',
  TX_SOS_ALERT: 'TX_SOS_ALERT',
  PROHIBIT_NOTIFY: 'PROHIBIT_NOTIFY',
  LOST_NOTIFY: 'LOST_NOTIFY',
  getOptions(){
    return [
      {value: this.TX_DELIVERY_NOTIFY, text: i18n.t('label.txBtnNotify'), index:0},
      {value:this.GW_ALERT, text: i18n.t('label.gwNotify'), index:1},
      {value:this.EXB_ALERT, text: i18n.t('label.exbNotify'), index:1},
      {value:this.TX_BATTERY_ALERT, text: i18n.t('label.txBatteryNotify'), index:1},
      {value:this.USER_REG_NOTIFY, text: i18n.t('label.userRegNotify'), index:2},
      {value:this.TX_SOS_ALERT, text: i18n.t('label.sosNotify'), index:3},
      {value:this.PROHIBIT_NOTIFY, text: i18n.t('label.prohibitNotify'), index:4},
      {value:this.LOST_NOTIFY, text: i18n.t('label.lostNotify'), index:5},
    ]
  }
}

export const ERROR_STATE = {
  NOT_REGIST: 'foreignKey',
  OVER_SIZE: 'uploadImgMax'
}

export const BATTERY_BOUNDARY = {
  GOOD: 31,
  WARNING: 21,
  POOR: 0,
}

export const POSITION = {
  SHOW_ICON_MIN_WIDTH: 768
}

export const TX_VIEW_TYPES = {
  DEFAULT: 1,
  SQUARE: 2,
  DIAMOND: 3,
  SPIRAL: 4,
  TILE: 5,
}

export const POSITION_STACK_TYPES = {
  getTypes(){
    return [
      {label: i18n.tnl('label.area'), value: 1},
      {label: i18n.tnl('label.zone'), value: 2},
    ]
  },
  AREA: 1,
  ZONE: 2,
}

export const FONT = {
  COLOR: {
    BLACK: '#000000',
  },
  SIZE: {
    MIN: 6,
  },
  OPTION: {
    BOLD: ' bold ',
  },
  TYPE: 'px sans-serif',
}

export const SETTING = {
  SPLITTER: ':',
  VALUES: ['string', 'stringList', 'number', 'numberList', 'boolean', 'date', 'datetime', 'time', 'json','password'],
  STRING: 'string',
  STRING_LIST: 'stringList',
  NUMBER: 'number',
  NUMBER_LIST: 'numberList',
  BOOLEAN: 'boolean',
  DATE: 'date',
  DATETIME: 'datetime',
  TIME: 'time',
  JSON: 'json',
  PASSWORD: 'password',
  SELECT: 'select',
  OTHER_CATEGORY: 'OTHER_CATEGORY',
  DATE_NOTATION: 'YYYY/MM/DD HH:mm:ss', // ハイフォンはIE11非対応
  getOptions(){
    return [
      {text: i18n.tnl('label.string'), value: 'string'},
      {text: i18n.tnl('label.stringList'), value: 'stringList'},
      {text: i18n.tnl('label.number'), value: 'number'},
      {text: i18n.tnl('label.numberList'), value: 'numberList'},
      {text: i18n.tnl('label.boolean'), value: 'boolean'},
      {text: i18n.tnl('label.date'), value: 'date'},
      {text: i18n.tnl('label.datetime'), value: 'datetime'},
      {text: i18n.tnl('label.time'), value: 'time'},
      {text: 'json', value: 'json'},
      {text: 'password', value: 'password'},
    ]
  },
  getType() {
    return {
      APP: {
        POS: {
          MOVING_AVERAGE_TIME: SETTING.NUMBER,
          GUEST_GROUP_CD_LIST: SETTING.STRING_LIST,
          PROHIBIT_GROUP_ZONE: SETTING.JSON,
          PROHIBIT_ALERT: SETTING.STRING_LIST,
          LOST_ALERT: SETTING.STRING_LIST,
          LOST_ALERT_TIME: SETTING.NUMBER,
          LOST_GROUP_ZONE: SETTING.JSON,
          PROHIBIT: {
            DUPLICATE_MAIL_TIME: SETTING.NUMBER,
          },
          LOST: {
            DUPLICATE_MAIL_TIME: SETTING.NUMBER,
          },
        },
        MENU: {
          MENU_HIDDEN_LIST: SETTING.STRING_LIST,
        },
        SENSOR: {
          TX_SENSOR: SETTING.NUMBER_LIST,
        },
        POS_LIST: {
          WITH: SETTING.STRING_LIST,
        },
        POS_STACK: {
          ADJUST_POPUP: SETTING.STRING_LIST,
          USE_POPUP: SETTING.BOOLEAN,
        },
        TX: {
          WITH: SETTING.STRING_LIST,
        },
        EXB: {
          WITH: SETTING.STRING_LIST,
          SENSOR: SETTING.NUMBER_LIST,
        },
        LOCATION: {
          WITH: SETTING.STRING_LIST,
          TYPE: {
            WITH: SETTING.STRING_LIST,
          },
          EXT_DEF: SETTING.JSON,
        },
        USER: {
          WITH: SETTING.STRING_LIST,
        },
        POT: {
          WITH: SETTING.STRING_LIST,
          EXT_DEF: SETTING.JSON,
        },
        PERSON: {
          WITH: SETTING.STRING_LIST,
          EXT_DEF: SETTING.JSON,
        },
        THING: {
          WITH: SETTING.STRING_LIST,
          EXT_DEF: SETTING.JSON,
        },
        CATEGORY: {
          TYPES: SETTING.NUMBER_LIST,
          WITH: SETTING.STRING_LIST,
          EXT_DEF: SETTING.JSON,
        },
        GROUP: {
          WITH: SETTING.STRING_LIST,
          EXT_DEF: SETTING.JSON,
        },
        ZONE: {
          TYPES: SETTING.NUMBER_LIST,
          WITH: SETTING.STRING_LIST,
          EXT_DEF: SETTING.JSON,
        },
        NOTIFY: {
          MIDIUM_TYPES: SETTING.NUMBER_LIST,
          STATE_TYPES: SETTING.NUMBER_LIST,
        },
        MAIL: {
          PASSWORD: SETTING.PASSWORD,
        },
        STAY_SUM: {
          SCALE_TIMES: SETTING.NUMBER_LIST,
        },
        TX_MON: {
          WITH: SETTING.STRING_LIST,
          WITH_SENSOR: SETTING.NUMBER_LIST,
        },
        SENSOR_LIST: {
          WITH: SETTING.STRING_LIST,
        },
        TXDETAIL: {
          ITEMS: SETTING.STRING_LIST,
        },
        ENTER: {
          START_TIME: SETTING.DATETIME,
        },
        SVC: {
          SLACK_CHANNEL: SETTING.STRING,
          SLACK_TOKEN: SETTING.STRING,
          STAY_SUM: {
            START: SETTING.NUMBER,
            END: SETTING.NUMBER,
            INTERVAL: SETTING.NUMBER,
            CALC_BY: SETTING.STRING,
            ADJUST_TIME: SETTING.NUMBER,
            REAL_TIME: SETTING.BOOLEAN,
          },
          PRESENCE: {
            INTERVAL: SETTING.NUMBER,
          },
          POS: {
            CACHE_TIME: SETTING.NUMBER,
          },
          PROXIMITY: {
            USE_TXAIR: SETTING.BOOLEAN,
            USE_MEETING_ROOM: SETTING.BOOLEAN,
            EXCLOUD_RAWLOG_DIR: SETTING.STRING,
            BLANK_RANGE: SETTING.NUMBER,
            MIN_RANGE: SETTING.NUMBER,
            REAL_TIME: SETTING.BOOLEAN,
            PATTERN: SETTING.NUMBER_LIST,
          },
          WORKLOAD: {
            PAUSE_TIMEOUT: SETTING.NUMBER,
          },
          PROCESS: {
            LOCATION_TYPE_TO_RELEASE_TX_POT: SETTING.NUMBER,
          },
        },
        SVCONLY: {
          EXCLOUD: {
            AUTH_HEADER: SETTING.PASSWORD,
            TX_REG: SETTING.BOOLEAN,
          }
        },
        BATCH: {
          POSITION: {
            INTERVAL: SETTING.NUMBER,
          },
          SENSOR_1: {
            INTERVAL: SETTING.NUMBER,
          },
          SENSOR_2: {
            INTERVAL: SETTING.NUMBER,
          },
          SENSOR_3: {
            INTERVAL: SETTING.NUMBER,
          },
          SENSOR_5: {
            INTERVAL: SETTING.NUMBER,
          },
          SENSOR_6: {
            INTERVAL: SETTING.NUMBER,
          },
          SENSOR_8: {
            INTERVAL: SETTING.NUMBER,
          },
          MONITOR: {
            INTERVAL: SETTING.NUMBER,
          },
          UTILIZATION: {
            CRON: SETTING.STRING,
          },
          STAY_SUM: {
            CRON: SETTING.STRING,
          },
          PROXIMITY: {
            CRON: SETTING.STRING,
          },
          AD_SYNC: {
            CRON: SETTING.STRING,
          },
          PRESENCE: {
            CRON: SETTING.STRING,
          },
          ENTER_COUNT: {
            CRON: SETTING.STRING,
          },
          LOST_ZONE: {
            INTERVAL: SETTING.NUMBER,
          },
          PROHIBIT_ZONE: {
            INTERVAL: SETTING.NUMBER,
          },
        },
        MANAGE: {
          SETTING_CATEGORY: SETTING.STRING_LIST,
        },
        OTHER: {
          EXT_DEF: SETTING.JSON,
        }
      },
      DISP: {
        TX: {
          ABSENT_ZONE_DISPLAY_TYPES: SETTING.STRING_LIST,
        },
        EXB_LOC: {
          BGCOLOR_PATTERN: SETTING.STRING_LIST,
          BGCOLOR_PATTERN_NOTX: SETTING.STRING_LIST,
        },
        THERMOH: {
          PATTERN: SETTING.STRING_LIST,
          HUMIDITY_PATTERN: SETTING.STRING_LIST,
        },
        POSITION_HISTORY: {
          HEADERS: SETTING.STRING_LIST,
        },
        MEDITAG: {
          STRESS_BG: SETTING.STRING_LIST,
        },
      },
      DEV: {
        SIMULATION: SETTING.NUMBER,
        SIMULATION_MOVE_PERCENT: SETTING.NUMBER,
        SIMULATION_MOVE_AREA_PERCENT: SETTING.NUMBER,
        ONLY_FROM_DB: SETTING.BOOLEAN,
      },
      EXSERVER: {
        BASE_URL: SETTING.STRING,
        MULTI_API: SETTING.BOOLEAN,
        MAX_DEVICES: SETTING.NUMBER,
      },
    }
  },
  getDefault() {
    return {
      APP: {
        POS: {
          PROHIBIT: {
            DUPLICATE_MAIL_TIME: 180000
          },
          LOST: {
            DUPLICATE_MAIL_TIME: 180000
          }
        },
        SVC: {
          STAY_SUM: {
            START: 0,
            END: 2400,
            INTERVAL: 60,
            CALC_BY: 'location',
            ADJUST_TIME: 4,
          },
          PROXIMITY:{
            BLANK_RANGE: 60000,
            MIN_RANGE: 60000,
          },
        },
      },
    }
  },
}

export const FORCE_PUSH_MENU = [
  {
    parent: '/provider/tenant',
    path: '/provider/tenant/tenantFeature',
    isPush: () => {
      const login = LocalStorageHelper.getLogin()
      return !login || !login.isTenantAdmin && login.isProviderUser
    } ,
  },
]

export const EXTRA_NAV = [
  {
    key: 'showPositionShort',
    path: '/main/position',
    icon: 'map-marker-alt',
  },
  {
    key: 'positionListShort',
    path: '/main/position-list',
    icon: 'list',
  },
  {
    key: 'positionStackShort',
    path: '/main/position-stack',
    icon: 'building',
  },
]

export const MENU = [
  {
    key: 'provider',
    base: 'provider/',
    path: 'provider/tenant',
    icon: 'cogs',
    tenantOnly: true,
    providerOnlyForce: true,
    singleOnlyForce: true,
    pages: [
      {
        key: 'tenant',
        path: 'tenant',
        icon: 'store-alt',
        providerOnlyForce: true,
      },
      {
        key: 'news',
        path: 'news',
        icon: 'newspaper',
        singleOnlyForce: true,
      },
    ]
  },
  {
    key: 'main',
    base: 'main/',
    path: 'main/position',
    icon: 'home',
    pages: [{
      key: 'showPosition',
      path: 'position',
      icon: 'map-marker-alt',
    },
    {
      key: 'positionList',
      path: 'position-list',
      icon: 'list',
    },
    {
      key: 'positionStack',
      path: 'position-stack',
      icon: 'building',
    },
    {
      key: 'guestAccess',
      path: 'guest-access',
      icon: 'user-tag',
    },
    {
      key: 'enterTable',
      path: 'enter-table',
      icon: 'table',
    },
    {
      key: 'pirMenu',
      path: 'pir',
      icon: 'users',
    },
    {
      key: 'planActual',
      path: 'plan-actual',
      icon: 'users',
    },
    {
      key: 'thermohumidity',
      path: 'thermohumidity',
      icon: 'thermometer-half',
    },
    {
      key: 'sensorList',
      path: 'sensor-list',
      icon: 'tablet',
    },
    {
      key: 'ledOperation',
      path: 'led',
      icon: 'lightbulb',
    },
    {
      key: 'plan',
      path: 'plan',
      icon: 'calendar-alt',
    },
    {
      key: 'toiletStatus',
      path: 'toilet',
      icon: 'toilet',
    },
  ]
  },
  {
    key: 'master',
    base: 'master/',
    path: 'master/area',
    icon: 'database',
    pages: [
      {
        key: 'region',
        path: 'region',
        icon: 'building',
      },
      {
        key: 'area',
        path: 'area',
        icon: 'image',
      },
      {
        key: 'exb',
        label: 'masterExb',
        path: 'exb',
        icon: 'hdd',
      },
      {
        key: 'tx',
        label: 'masterTx',
        path: 'tx',
        // icon: 'fal fa-location',
        // icon: 'fas fa-user-tag',
        icon: 'tags',
      },
      {
        key: 'locationSetting',
        path: 'location/position',
        icon: 'map',
      },
      {
        key: 'locationList',
        path: 'location',
        icon: 'location-arrow',
      },
      {
        key: 'pot',
        path: 'pot',
        icon: 'id-card',
      },
      /*
      {
        key: 'potPerson',
        path: 'potPerson',
        icon: 'id-card',
      },
      {
        key: 'potThing',
        path: 'potThing',
        icon: 'cubes',
      },
      {
        key: 'potOther',
        path: 'potOther',
        icon: 'cubes',
      },
      */
      {
        key: 'category',
        path: 'category',
        icon: 'object-group',
      },
      /*
      {
        key: 'categoryPerson',
        path: 'categoryPerson',
        icon: 'users',
      },
      */
      /*
      {
        key: 'categoryThing',
        path: 'categoryThing',
        icon: 'object-group',
      },
      */
      {
        key: 'categoryZone',
        path: 'categoryZone',
        icon: 'object-ungroup',
      },
      /*
      {
        key: 'categoryAuth',
        path: 'categoryAuth',
        icon: 'key',
      },
      */
      {
        key: 'group',
        path: 'group',
        icon: 'sitemap',
      },
      /*
      {
        key: 'user',
        path: 'user',
        icon: 'user',
      },
      */
      {
        key: 'role',
        path: 'role',
        icon: 'chalkboard-teacher',
      },
      {
        key: 'zoneClass',
        path: 'zoneClass',
        icon: 'compass',
      },
      {
        key: 'zoneBlock',
        path: 'zoneBlock',
        icon: 'th',
      },
      {
        key: 'notifyTemplate',
        path: 'notifyTemplate',
        icon: 'envelope',
      },
      {
        key: 'masterGateway',
        path: 'gateway',
        icon: 'road',
        exserver: true,
      },
    ]
  },
  {
    key: 'monitor',
    base: 'monitor/',
    path: 'monitor/position',
    icon: 'tachometer-alt',
    pages: [
      {
        key: 'gateway',
        path: 'gateway',
        icon: 'road',
      },
      {
        key: 'position',
        path: 'position',
        icon: 'location-arrow',
      },
      {
        key: 'telemetry',
        path: 'telemetry',
        icon: 'battery-three-quarters',
      },
      {
        key: 'installation',
        path: 'installation',
        icon: 'ruler-combined',
      },
    ]
  },
  {
    key: 'sumTitle',
    base: 'sum/',
    path: 'sum/usage-situation',
    icon: 'chart-line',
    pages: [
      /*
      {
        key: 'usageSituation',
        path: 'usage-situation',
        icon: 'chart-area'
      },
      {
        key: 'flowlineAnalysis',
        path: 'flowlineAnalysis',
        icon: 'shoe-prints'
      },
      {
        key: 'heatmapPosition',
        path: 'heatmap-position',
        icon: 'fire',
      },
      {
        key: 'sensorGraph',
        path: 'sensorGraph',
        icon: 'chart-line',
      },
      {
        key: 'stayTime',
        path: 'stayTime',
        icon: 'chart-bar',
      },
      {
        key: 'stayRatioGp',
        path: 'stayRatio',
        icon: 'clock',
      },
      {
        key: 'positionSummary',
        path: 'positionSummary',
        icon: 'map-marked-alt',
      },
      {
        key: 'processSum',
        path: 'processSum',
        icon: 'fast-forward',
      },
      {
        key: 'stayRatioBase',
        path: 'stayRatioBase',
        icon: 'clock',
      },
      {
        key: 'activityGraph',
        path: 'activityGraph',
        icon: 'clock',
      },
      {
        key: 'meetingGraph',
        path: 'meetingGraph',
        icon: 'clock',
      },
      {
        key: 'proximityGraph',
        path: 'proximityGraph',
        icon: 'chart-bar',
      },
      {
        key: 'planActual',
        path: 'planActual',
        icon: 'chart-bar',
      },
      */
      {
        key: 'attendanceWorkers',
        path: 'attendanceWorkers',
        icon: 'clock',
      },
      {
        key: 'attendanceCompanies',
        path: 'attendanceCompanies',
        icon: 'clock',
      },
      /*
      {
        key: 'attendanceDetail',
        path: 'attendanceDetail',
        icon: 'clock',
      },
      {
        key: 'presenceSum',
        path: 'presenceSum',
        icon: 'user-clock',
      },
      */
    ]
  },
  {
    key: 'historyTitle',
    base: 'history/',
    path: '/history/positionHistory',
    icon: 'clipboard',
    pages: [{
      key: 'positionHistory',
      path: 'positionHistory',
      icon: 'cube'
    },
    {
      key: 'positionHistoryExc',
      label: 'positionHistory',
      path: 'positionHistoryExc',
      feature: '/history/positionHistoryExc',
      icon: 'cube',
    },
    {
      key: 'sensorHistory',
      path: 'sensorHistory',
      icon: 'eye'
    },
    {
      key: 'sensorHistoryExc',
      label: 'sensorHistory',
      path: 'sensorHistoryExc',
      icon: 'eye'
    },
    {
      key: 'notifyHistory',
      path: 'notifyHistory',
      feature: '/history/notifyHistory',
      icon: 'history',
    },
    {
      key: 'planActualHistory',
      path: 'planActualHistory',
      feature: '/history/planActualHistory',
      icon: 'history',
    },
    ]
  },
  {
    key: 'setting',
    base: 'setting/',
    path: 'setting/personal',
    icon: 'cog',
    pages: [{
      key: 'personal',
      path: 'personal',
      icon: 'user-cog',
    },
    {
      key: 'systemChild',
      path: 'systemChild',
      icon: 'cogs',
    },
    {
      key: 'systemJson',
      path: 'systemJson',
      icon: 'cogs',
    },
    {
      key: 'system',
      path: 'system',
      icon: 'cogs',
    },
    ]
  },
  {
    key: 'develop',
    base: 'develop/',
    path: 'develop/position-dev',
    icon: 'wrench',
    providerOnly: true,
    pages: [
      {
        key: 'gateway',
        path: 'gateway',
        icon: 'road',
      },
      {
        key: 'position',
        path: 'position',
        icon: 'location-arrow',
      },
      {
        key: 'telemetry',
        path: 'telemetry',
        icon: 'battery-three-quarters',
      },
      {
        key: 'env',
        path: 'serverenv',
        icon: 'cog',
      },
      {
        key: 'execTask',
        path: 'execTask',
        icon: 'upload',
      },
      {
        key: 'createSimulationData',
        path: 'createSimulationData',
        icon: 'upload',
      },
      {
        key: 'createData',
        path: 'createData',
        icon: 'upload',
      },
    ],
  },
]

export const SYSTEM_ZONE_CATEGORY_NAME = { // TODO: CDに変更
  ABSENT: 'ABSENT',
  PROHIBIT: 'PROHIBIT',
  LOST: 'LOST',
  ABSENT_DISPLAY: 'ABSENT_DISPLAY',
  TOILET: 'TOILET',
  FIXED_POS: 'FIXED_POS',
}

export const PLUGIN_CONSTANTS = {
  IFRAME_BASE_DIR: 'plugin/',
  PLUGIN_KEY_PREFIX: 'plugin-index',
  VIEW_URL_PREFIX: '/plugin/'
}

export const TENANT = {
  STATUS: {
    invalidToken: -2,
    NOT_REGISTERED: -1,
    REGISTERED: 1,
    REQUIRE_TOKEN: 9,
    DISABLED: 0
  }
}

export const GROUP = {
  TYPE: {
    COMPANY: 9,
  }
}

export const TEMP_REGIST_WORKER_CATEGORYCD = 'TEMP_REGIST_WORKER'