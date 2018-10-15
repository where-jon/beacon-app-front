// Various constants or types come here. Basically constants does not change by environment. 

let i18n

export const setI18n = (pI18n) => i18n = pI18n

export const LOGIN_MODE = {
  APP_SERVICE: 0,
  LOCAL: 1,
  NO_LOGIN: 2
}

export const ROLE_FEATURE = {
  MODE: {
    DENY: 0,
    RO_SYS: 1,
    RO: 2,
    RW: 3,
  },
  getModeOptions(){
    return [
      {text: i18n.t('label.allRejection'), value: 0},
      {text: i18n.t('label.systemReadOnly'), value: 1},
      {text: i18n.t('label.readOnly'), value: 2},
      {text: i18n.t('label.allAuthorization'), value: 3},
    ]
  }
}

export const FEATURE = {
  getTypeOptions(){
    return [
      {text: i18n.t('label.noLimitType'), value: 0},
      {text: i18n.t('label.limitType'), value: 1},
    ]
  },
  getEnabledOptions(){
    return [
      {text: i18n.t('label.disabledType'), value: false},
      {text: i18n.t('label.enabledType'), value: true},
    ]
  }
}

export const UPDATE_ONLY_NN = { NONE: 0, NULL: 1, EMPTY_ZERO: 2 };

export const txViewTypes = [
  {value: 1, text: "pattern1"},
  {value: 2, text: "pattern2"},
  {value: 3, text: "pattern3"},
]

export const CATEGORY = {
  getTypes(){ 
    return [
      {value: 0, text: i18n.t('label.person')},
      {value: 1, text: i18n.t('label.thing')},
      {value: 2, text: i18n.t('label.zone')},
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
}

export const DISCOMFORT = {
  HOT: "hot",
  COMFORT: "comfort",
  COLD: "cold",
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

export const MENU = [
  {
    key: 'main',
    base: 'main/',
    path: 'main/position',
    icon: 'fas fa-home',
    pages: [{
        key: 'showPosition',
        path: 'position',
        feature: '',
        icon: 'fas fa-map-marker-alt',
      },
      {
        key: 'pir',
        path: 'pir',
        feature: '',
        icon: 'fas fa-users',
      },
      {
        key: 'thermohumidity',
        path: 'thermohumidity',
        feature: '',
        icon: 'fas fa-thermometer-half',
      },
      {
        key: 'pot',
        path: 'pot',
        feature: '/basic/pot',
        icon: 'far fa-id-card',
      },
      {
        key: 'ledOperation',
        path: 'led',
        feature: '/basic/led',
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
        feature: '/core/region',
        icon: 'far fa-building',
      },
      {
        key: 'area',
        path: 'area',
        feature: '/core/area',
        icon: 'fas fa-image',
      },
      {
        key: 'exb',
        path: 'exb',
        feature: '/core/exb',
        icon: 'far fa-hdd',
      },
      {
        key: 'tx',
        path: 'tx',
        feature: '/core/tx',
        // icon: 'fal fa-location',
        // icon: 'fas fa-user-tag',
        icon: 'fa fa-tags',
      },
      {
        key: 'location',
        path: 'location',
        feature: '/core/location',
        icon: 'fas fa-map',
        // icon: 'fas fa-map-pin',
      },
      {
        key: 'pot',
        path: 'pot',
        feature: '/basic/pot',
        icon: 'far fa-id-card',
      },
      {
        key: 'category',
        path: 'category',
        feature: '/basic/category',
        icon: 'fas fa-sitemap',
      },
      {
        key: 'group',
        path: 'group',
        feature: '/basic/group',
        icon: 'fas fa-users',
      },
      {
        key: 'user',
        path: 'user',
        feature: '/core/user',
        icon: 'fas fa-user',
      },
      {
        key: 'role',
        path: 'role',
        feature: '/meta/role',
        icon: 'fas fa-chalkboard-teacher',
      },
      {
        key: 'locationZone',
        path: 'locationZone',
        feature: '/meta/locationzone',
        icon: 'far fa-compass',
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
        feature: '/core/gateway',
        icon: 'fas fa-road',
      },
      {
        key: 'position',
        path: 'position',
        feature: '/core/position',
        icon: 'fas fa-location-arrow',
      },
      {
        key: 'telemetry',
        path: 'telemetry',
        feature: '/core/telemetry',
        icon: 'fa fa-battery-three-quarters',
      },
    ]
  },
  {
    key: 'sumTitle',
    base: 'sum/',
    path: 'sum/utilizationRatio',
    icon: 'fas fa-chart-line',
    pages: [{
        key: 'utilizationRatio',
        path: 'utilizationRatio',
        feature: '/sum/utilizationRatio',
        icon: 'fas fa-chart-pie'
      },
      {
        key: 'numUsers',
        path: 'numUsers',
        feature: '/sum/numUsers',
        icon: 'fas fa-chart-area'
      },
    ]
  },
  {
    key: 'historyTitle',
    base: 'history/',
    path: '/history/temperatureHistory',
    icon: 'far fa-clipboard',
    pages: [{
        key: 'temperatureHistory',
        path: 'temperatureHistory',
        feature: '/history/temperatureHistory',
        icon: 'fas fa-thermometer'
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
        feature: '/core/personal',
        icon: 'fas fa-user-cog',
      },
      {
        key: 'system',
        path: 'system',
        feature: '/meta/system',
        icon: 'fas fa-cogs',
      },
    ]
  },
  {
    key: 'develop',
    base: 'develop/',
    path: 'develop/position-dev',
    icon: 'fas fa-wrench',
    roles: ['SYS_ADMIN'],
    pages: [
      {
        key: 'gateway',
        path: 'gateway',
        feature: '/develop/gateway',
        icon: 'fas fa-road',
      },
      {
        key: 'position',
        path: 'position',
        feature: '/develop/position',
        icon: 'fas fa-location-arrow',
      },
      {
        key: 'telemetry',
        path: 'telemetry',
        feature: '/develop/telemetry',
        icon: 'fa fa-battery-three-quarters',
      },
    ],
  },
]
