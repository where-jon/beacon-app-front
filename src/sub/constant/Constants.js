// Various constants or types come here. Basically constants does not change by environment. 

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
    const isProvider = JSON.parse(window.localStorage.getItem('login')).isProvider
    return {text: i18n.tnl('label.allAuthorization'), value: isProvider? ROLE_FEATURE.MODE.SYS_ALL: ROLE_FEATURE.MODE.ALL}
  },
  getModeOptions(){
    const isProvider = JSON.parse(window.localStorage.getItem('login')).isProvider
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

export const CATEGORY = {
  getTypes(){ 
    return [
      {value: 1, text: i18n.tnl('label.person')},
      {value: 2, text: i18n.tnl('label.thing')},
      {value: 3, text: i18n.tnl('label.zone')},
    ]
  },
  POT_AVAILABLE: [1, 2],
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
  getTypes(){ 
    return [
      {value: 0, text: i18n.tnl('label.coordinate')},
      {value: 1, text: i18n.tnl('label.nonCoordinate')},
    ]
  },
}

export const SENSOR = {
  TEMPERATURE: 1,
  PIR: 2,
  THERMOPILE: 3,
  LED: 4,
  MEDITAG: 5,
  MAGNET: 6,
  BUTTON: 7,
  MAGNET_STATUS: {
    OFF: 0,
    ON: 4,
  }
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
  getOptions(){
    return [
      {value:1, text: i18n.t('label.immediate')},
      {value:2, text: i18n.t('label.average')},
      {value:3, text: i18n.t('label.max')},
      {value:4, text: i18n.t('label.min')},
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

export const DETECT_STATE = {
  DETECTED: 1,
  LOST: 2,
  TODAY_UNDETECT: 3,
  UNDETECT: 4,
  NONE: 0,
  getTypes() {
    return [
      {value: this.DETECTED, text: i18n.t('label.detected')},
      {value: this.LOST, text: i18n.t('label.temporaryUndetect')},
      {value: this.TODAY_UNDETECT, text: i18n.t('label.todayUndetect')},
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
  getOptions(){
    return [
      {value:'TX_DELIVERY_NOTIFY', text: i18n.t('label.txBtnNotify'), index:0},
      {value:'GW_ALERT', text: i18n.t('label.gwNotify'), index:1},
      {value:'EXB_ALERT', text: i18n.t('label.exbNotify'), index:1},
      {value:'TX_BATTERY_ALERT', text: i18n.t('label.txBatteryNotify'), index:1},
      {value:'USER_REG_NOTIFY', text: i18n.t('label.userRegNotify'), index:2},
      {value:'TX_SOS_ALERT', text: i18n.t('label.sosNotify'), index:3},
    ]
  }
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

export const FONT = {
  COLOR: {
    BLACK: '#000000',
  },
  SIZE: {
    MIN: 6,
  },
  TYPE: 'px Arial',
}

export const EXTRA_NAV = [
  {
    key: 'showPositionShort',
    path: '/main/position',
    icon: 'fas fa-map-marker-alt',
  },
  {
    key: 'positionListShort',
    path: '/main/position-list',
    icon: 'fas fa-list',
  },
  {
    key: 'positionStackShort',
    path: '/main/position-stack',
    icon: 'far fa-building',
  },
]

export const MENU = [
  {
    key: 'provider',
    base: 'provider/',
    path: 'provider/tenant',
    icon: 'fas fa-cogs',
    tenantOnly: true,
    pages: [
      {
        key: 'tenant',
        path: 'tenant',
        icon: 'fas fa-store-alt',
      },
    ]
  },
  {
    key: 'main',
    base: 'main/',
    path: 'main/position',
    icon: 'fas fa-home',
    pages: [{
      key: 'showPosition',
      path: 'position',
      icon: 'fas fa-map-marker-alt',
    },
    {
      key: 'positionList',
      path: 'position-list',
      icon: 'fas fa-list',
    },
    {
      key: 'positionStack',
      path: 'position-stack',
      icon: 'far fa-building',
    },
    {
      key: 'pir',
      path: 'pir',
      icon: 'fas fa-users',
    },
    {
      key: 'thermohumidity',
      path: 'thermohumidity',
      icon: 'fas fa-thermometer-half',
    },
    {
      key: 'ledOperation',
      path: 'led',
      icon: 'far fa-lightbulb',
    }
    ]
  },
  {
    key: 'master',
    base: 'master/',
    path: 'master/area',
    icon: 'fas fa-database',
    pages: [
      {
        key: 'region',
        path: 'region',
        icon: 'far fa-building',
      },
      {
        key: 'area',
        path: 'area',
        icon: 'fas fa-image',
      },
      {
        key: 'exb',
        path: 'exb',
        icon: 'far fa-hdd',
      },
      {
        key: 'tx',
        path: 'tx',
        // icon: 'fal fa-location',
        // icon: 'fas fa-user-tag',
        icon: 'fa fa-tags',
      },
      {
        key: 'locationSetting',
        path: 'location',
        icon: 'fas fa-map',
        // icon: 'fas fa-map-pin',
      },
      {
        key: 'txLocationSetting',
        path: 'txlocation',
        icon: 'fas fa-map-pin',
      },
      {
        key: 'pot',
        path: 'pot',
        icon: 'far fa-id-card',
      },
      {
        key: 'category',
        path: 'category',
        icon: 'fa fa-object-group',
      },
      {
        key: 'group',
        path: 'group',
        icon: 'fas fa-sitemap',
      },
      {
        key: 'user',
        path: 'user',
        icon: 'fas fa-user',
      },
      {
        key: 'role',
        path: 'role',
        icon: 'fas fa-chalkboard-teacher',
      },
      {
        key: 'zoneClass',
        path: 'zoneClass',
        icon: 'far fa-compass',
      },
      {
        key: 'zoneBlock',
        path: 'zoneBlock',
        icon: 'fas fa-th',
      },
      {
        key: 'notifyTemplate',
        path: 'notifyTemplate',
        icon: 'fas fa-envelope',
      },
    ]
  },
  {
    key: 'monitor',
    base: 'monitor/',
    path: 'monitor/position',
    icon: 'fas fa-tachometer-alt',
    pages: [
      {
        key: 'gateway',
        path: 'gateway',
        icon: 'fas fa-road',
      },
      {
        key: 'position',
        path: 'position',
        icon: 'fas fa-location-arrow',
      },
      {
        key: 'telemetry',
        path: 'telemetry',
        icon: 'fa fa-battery-three-quarters',
      },
    ]
  },
  {
    key: 'sumTitle',
    base: 'sum/',
    path: 'sum/usage-situation',
    icon: 'fas fa-chart-line',
    pages: [
      {
        key: 'usageSituation',
        path: 'usage-situation',
        icon: 'fas fa-chart-area'
      },
      {
        key: 'flowlineAnalysis',
        path: 'flowlineAnalysis',
        icon: 'fas fa-shoe-prints'
      },
      {
        key: 'heatmapPosition',
        path: 'heatmap-position',
        icon: 'fas fas fa-fire',
      },
      {
        key: 'sensorGraph',
        path: 'sensorGraph',
        icon: 'fas fa-chart-bar',
      },
    ]
  },
  {
    key: 'historyTitle',
    base: 'history/',
    path: '/history/temperatureHistory',
    icon: 'far fa-clipboard',
    pages: [{
      key: 'thermohumidity',
      path: 'temperatureHistory',
      icon: 'fas fa-thermometer'
    },
    {
      key: 'positionHistory',
      path: 'positionHistory',
      icon: 'fas fa-cube'
    },
    {
      key: 'sensorHistory',
      path: 'sensorHistory',
      icon: 'fas fa-eye'
    },
    {
      key: 'notifyHistory',
      path: 'notifyHistory',
      feature: '/history/notifyHistory',
      icon: 'fa fa-history',
    },
    ]
  },
  {
    key: 'setting',
    base: 'setting/',
    path: 'setting/personal',
    icon: 'fas fa-cog',
    pages: [{
      key: 'personal',
      path: 'personal',
      icon: 'fas fa-user-cog',
    },
    {
      key: 'system',
      path: 'system',
      icon: 'fas fa-cogs',
    },
    ]
  },
  {
    key: 'develop',
    base: 'develop/',
    path: 'develop/position-dev',
    icon: 'fas fa-wrench',
    providerOnly: true,
    pages: [
      {
        key: 'gateway',
        path: 'gateway',
        icon: 'fas fa-road',
      },
      {
        key: 'position',
        path: 'position',
        icon: 'fas fa-location-arrow',
      },
      {
        key: 'telemetry',
        path: 'telemetry',
        icon: 'fa fa-battery-three-quarters',
      },
      {
        key: 'env',
        path: 'serverenv',
        icon: 'fas fa-cog',
      },
    ],
  },
]
