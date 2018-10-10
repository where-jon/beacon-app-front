// Various constants or types come here. Basically constants does not change by environment. 

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
  MODE_OPTIONS: [
    {text: "すべて拒否", value: 0},
    {text: "システムの読み取りのみ許可", value: 1},
    {text: "読み取りのみ許可", value: 2},
    {text: "すべて許可", value: 3},
  ]
}

export const FEATURE = {
  TYPE_OPTIONS: [
    {text: "制限なし", value: 0},
    {text: "制限あり", value: 1},
  ],
  ENABLED_OPTIONS: [
    {text: "無効", value: false},
    {text: "有効", value: true},
  ]
}

export const UPDATE_ONLY_NN = {
  NONE: 0,
  NULL: 1,
  EMPTY_ZERO: 2,
}

export const txViewTypes = [
  {value: 1, text: "pattern1"},
  {value: 2, text: "pattern2"},
  {value: 3, text: "pattern3"},
]

export const CATEGORY = {
  TYPES: [
    {value: 0, text: "人"},
    {value: 1, text: "物"},
  ],
}

export const SENSOR = {
  TEMPERATURE: 1,
  PIR: 2,
  THERMOPILE: 3
}

export const DISCOMFORT = {
  HOT: "hot",
  COMFORT: "comfort",
  COLD: "cold",
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
        key: 'person',
        path: 'person',
        feature: '/basic/person',
        icon: 'far fa-id-card',
      },
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
        icon: 'fas fa-industry',
      },
      {
        key: 'area',
        path: 'area',
        feature: '/core/area',
        icon: 'far fa-building',
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
        key: 'person',
        path: 'person',
        feature: '/basic/person',
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
        key: 'thing',
        path: 'thing',
        feature: '/basic/thing',
        icon: 'fas fa-cube',
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
      {
        key: 'gateway-dev',
        path: 'gateway',
        feature: '/core/gateway',
        icon: 'fas fa-road',
        debug: 1,
      },
      {
        key: 'position-dev',
        path: 'position',
        feature: '/core/position',
        icon: 'fas fa-location-arrow',
        debug: 1,
      },
      {
        key: 'telemetry-dev',
        path: 'telemetry',
        feature: '/core/telemetry',
        icon: 'fa fa-battery-three-quarters',
        debug: 1,
      },
    ]
  },
  {
    key: 'analyze',
    base: 'analyze/',
    path: 'analyze/utilizationRatio',
    icon: 'fas fa-balance-scale',
    pages: [      {
        key: 'utilizationRatio',
        path: 'utilizationRatio',
        feature: '/analyze/utilizationRatio',
        icon: 'fas fa-balance-scale'
      },
      {
        key: 'numUsers',
        path: 'numUsers',
        feature: '/analyze/numUsers',
        icon: 'fas fa-balance-scale'
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
    ]
  },
]
