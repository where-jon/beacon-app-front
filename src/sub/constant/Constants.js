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
  }
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
  TEMPARATURE: 1,
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
        key: 'user',
        path: 'user',
        feature: '/core/user',
        icon: 'fas fa-user',
      },
    ]
  },
  {
    key: 'monitor',
    base: 'monitor/',
    path: 'monitor/position',
    icon: 'fas fa-tachometer-alt',
    pages: [{
        key: 'gateway',
        path: 'gateway',
        feature: '/core/gateway',
        icon: 'fas fa-road'
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
