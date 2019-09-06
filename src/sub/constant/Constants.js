// Various constants or types come here. Basically constants does not change by environment. 

import * as LocalStorageHelper from '../helper/base/LocalStorageHelper'

let i18n

export const setI18n = (pI18n) => i18n = pI18n

export const LOGIN_MODE = {
  APP_SERVICE: 0,
  LOCAL: 1,
  NO_LOGIN: 2
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

export const PATTERN = {
  NUMBER: '^-?[0-9]+[.]?[0-9]*$',
  NUMBER_LIST: '^(-?[0-9]+[.]?[0-9]*)+(,-?[0-9]+[.]?[0-9]*)*$',
  MASTER_CD: '^[a-zA-Z0-9_\\-\\.]*$',
  LOCATION_CD: '^[a-zA-Z0-9_\\-]*$',
  REGEXP: {
    MASTER_CD: /^[a-zA-Z0-9_\-.]*$/,
    LOCATION_CD: /^[a-zA-Z0-9_\\-]*$/,
  },
}

export const BULK = {
  PRIMARY_KEY: 'updateKey',
  SPLITTER: ';',
  REQUIRE: {
    REGION: { ALLOW: ['regionId', 'regionName', 'meshId'] },
    AREA: { ALLOW: ['areaId', 'areaName', 'ID'], DISALLOW: ['deviceId', 'deviceIdX', 'zoneName'] },
    EXB: { ALLOW: ['exbId', 'locationName', 'deviceId'] },
    TX: { ALLOW: ['txId', 'btxId', 'minor'] },
    LOCATION: { ALLOW: ['locationId', 'locationCd', 'locationName'] },
    POT: { ALLOW: ['potId', 'potName', 'potCd'] },
    CATEGORY: { ALLOW: ['categoryId', 'categoryName', 'display'] },
    GROUP: { ALLOW: ['groupId', 'groupName', 'display'] },
    USER: { ALLOW: ['userId', 'loginId', 'roleName'], DISALLOW: ['potName'] },
    ROLE: { ALLOW: ['roleId', 'roleName'], DISALLOW: ['loginId'] },
    ROLE_FEATURE: { ALLOW: ['roleId', 'featureId', 'mode'] },
    ZONE: { ALLOW: ['zoneId', 'zoneName'] },
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
    const isProvider = LocalStorageHelper.getLogin().isProvider
    return {text: i18n.tnl('label.allAuthorization'), value: isProvider? ROLE_FEATURE.MODE.SYS_ALL: ROLE_FEATURE.MODE.ALL}
  },
  getModeOptions(){
    const isProvider = LocalStorageHelper.getLogin().isProvider
    return [
      isProvider? {text: i18n.tnl('label.refer'), value: ROLE_FEATURE.MODE.SYS_REFERENCE}: null,
      isProvider? {text: i18n.tnl('label.update'), value: ROLE_FEATURE.MODE.SYS_UPDATE}: null,
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

export const CATEGORY = {
  PERSON: 1,
  THING: 2,
  ZONE: 3,
  getTypes(){ 
    return [
      {value: CATEGORY.PERSON, text: i18n.tnl('label.person')},
      {value: CATEGORY.THING, text: i18n.tnl('label.thing')},
      {value: CATEGORY.ZONE, text: i18n.tnl('label.zone')},
    ]
  },
  POT_AVAILABLE: [1, 2],
  ZONE_AVAILABLE: [3],
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
  getTypes(){ 
    return [
      {value: ZONE.COORDINATE, text: i18n.tnl('label.coordinate')},
      {value: ZONE.NON_COORDINATE, text: i18n.tnl('label.nonCoordinate')},
    ]
  },
  MIN_WIDTH: 50,
  MIN_HEIGHT: 50,
}

export const SENSOR = {
  TEMPERATURE: 1,
  PIR: 2,
  THERMOPILE: 3,
  LED: 4,
  MEDITAG: 5,
  MAGNET: 6,
  BUTTON: 7,
  PRESSURE: 8,
  OMR_ENV: 9,
  OMR_TP_HUMAN: 10,
  OMR_TP_ENV: 11,
  MAGNET_STATUS: {
    OFF: 0,
    ON: 4,
  },
  STRING: ['','temperature','pir','thermopile','led','meditag','magnet','button','pressure','omr-env','omr-tp-human','omr-tp-env']
}

export const SUM_UNIT = {
  getOptions(){
    return [
      {value:1, text: i18n.t('label.minute'), param: 'minute'},
      {value:2, text: i18n.t('label.hour'), param: 'hour'},
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

export const THERMOHUMIDITY = {
  CALC: {
    DISCOMFORT: 1,
    TEMPERATURE: 2,
  },
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
  CHANGE_SLOW: 1,
  CHANGE_FAST: 2,
  BLINK_SLOW: 3,
  BLINK_FAST: 4,
}

export const ALERT_STATE = {
  SCREEN: 'screen',
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
      {text: i18n.tnl('label.area'), value: 1, className: 'area'},
      {text: i18n.tnl('label.zone'), value: 2, className: 'zone'},
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
  TYPE: 'px sans-serif',
}

export const SETTING = {
  VALUES: ['string', 'stringList', 'number', 'numberList', 'boolean', 'json'],
  STRING: 'string',
  STRING_LIST: 'stringList',
  NUMBER: 'number',
  NUMBER_LIST: 'numberList',
  BOOLEAN: 'boolean',
  JSON: 'json',
  SELECT: 'select',
  getOptions(){
    return [
      {text: i18n.tnl('label.string'), value: 'string'},
      {text: i18n.tnl('label.stringList'), value: 'stringList'},
      {text: i18n.tnl('label.number'), value: 'number'},
      {text: i18n.tnl('label.numberList'), value: 'numberList'},
      {text: i18n.tnl('label.boolean'), value: 'boolean'},
      {text: 'json', value: 'json'},
    ]
  },
  getType() {
    return {
      APP: {
        POS: {
          MOVING_AVERAGE_TIME: SETTING.NUMBER,
          PROHIBIT_GROUPS: SETTING.NUMBER_LIST,
          PROHIBIT_ALERT: SETTING.STRING_LIST,
          LOST_ALERT: SETTING.STRING_LIST,
          LOST_GROUPS: SETTING.NUMBER_LIST,
          PROHIBIT: {
            DUPLICATE_MAIL_TIME: SETTING.NUMBER,
          },
          LOST: {
            DUPLICATE_MAIL_TIME: SETTING.NUMBER,
          },
        },
        SENSOR: {
          EXB_SENSOR: SETTING.NUMBER_LIST,
          TX_SENSOR: SETTING.NUMBER_LIST,
        },
        POS_LIST: {
          WITH: SETTING.STRING_LIST,
        }, 
        TX: {
          WITH: SETTING.STRING_LIST,
        }, 
        EXB: {
          SENSOR: SETTING.NUMBER_LIST,
        }, 
        LOCATION: {
          WITH: SETTING.STRING_LIST,
          TYPE: {
            WITH: SETTING.STRING_LIST,
          },
        },
        USER: {
          WITH: SETTING.STRING_LIST,
        }, 
        POT: {
          WITH: SETTING.STRING_LIST,
          EXT_DEF: SETTING.JSON,
        }, 
        CATEGORY: {
          TYPES: SETTING.NUMBER_LIST,
        },
        NOTIFY: {
          MIDIUM_TYPES: SETTING.NUMBER_LIST,
          STATE_TYPES: SETTING.NUMBER_LIST,
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
          POS: {
            CACHE_TIME: SETTING.NUMBER,
          },
          PROXIMITY: {
            USE_TXAIR: SETTING.BOOLEAN,
            USE_MEETING_ROOM: SETTING.BOOLEAN,
            EXCLOUD_RAWLOG_DIR: SETTING.STRING,
            BLANK_RANGE: SETTING.NUMBER,
            MIN_RANGE: SETTING.NUMBER,
          },
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
          LOST_ZONE: {
            INTERVAL: SETTING.NUMBER,
          },
          PROHIBIT_ZONE: {
            INTERVAL: SETTING.NUMBER,
          },
        },
      },
      DISP: {
        TX: {
          ABSENT_ZONE_DISPLAY_TYPES: SETTING.STRING_LIST,
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
            STAY_SUM_START: 0, 
            STAY_SUM_END: 2400, 
            STAY_SUM_INTERVAL: 5, 
            STAY_SUM_CALC_BY: "location",
            STAY_SUM_ADJUST_TIME: 4,
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
      return !login || !login.tenantAdmin && login.isProvider
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
      key: 'pirMenu',
      path: 'pir',
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
    }
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
        path: 'exb',
        icon: 'hdd',
      },
      {
        key: 'tx',
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
        key: 'txLocationSetting',
        path: 'txlocation/position',
        icon: 'map-pin',
      },
      {
        key: 'pot',
        path: 'pot',
        icon: 'id-card',
      },
      {
        key: 'category',
        path: 'category',
        icon: 'object-group',
      },
      {
        key: 'group',
        path: 'group',
        icon: 'sitemap',
      },
      {
        key: 'user',
        path: 'user',
        icon: 'user',
      },
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
    ]
  },
  {
    key: 'sumTitle',
    base: 'sum/',
    path: 'sum/usage-situation',
    icon: 'chart-line',
    pages: [
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
        key: 'proximityGraph',
        path: 'proximityGraph',
        icon: 'chart-bar',
      },
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
        key: 'installation',
        path: 'installation',
        icon: 'ruler-combined',
      },
    ],
  },
]

export const SYSTEM_ZONE_CATEGORY_NAME = {
  ABSENT: 'ABSENT',
  PROHIBIT: 'PROHIBIT',
  ABSENT_DISPLAY: 'ABSENT_DISPLAY',
}
