export default {
  mode: 'spa',
  /*
  ** Headers of the page
  */
  head: {
    title: process.env.npm_package_name || '',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: process.env.npm_package_description || '' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },
  /*
  ** Customize the progress-bar color
  */
  loading: { color: '#3B8070' },
  /*
  ** Global CSS
  */
  css: [
  ],
  /*
  ** Plugins to load before mounting the App
  */
  plugins: [
    '~/plugins/init',
    '~/plugins/i18n'
  ],
  /*
  ** Nuxt.js modules
  */
  modules: [
    'nuxt-fontawesome',
    '@nuxtjs/sentry'
  ],
  sentry: {
    dsn: process.env.SENTRY_DSN
  },
  router: {
    base: '/',
    middleware: ['reset', 'check-auth']
  },
  /*
  ** Build configuration
  */
  build: {
    babel: {
      presets: [
        [
          '@babel/preset-env',
          {
            targets: ['>0.25% in JP', 'not ie <= 10', 'not op_mini all'],
            useBuiltIns: 'usage',
            corejs: 3
          }
        ]
      ]
    },
    extend (config, { isDev, isClient }) {
      config.module.rules.forEach((val) => {
        if (val.loader == 'babel-loader') {
          val.exclude = /node_modules\/(?!@createjs\/).*/
          console.log(JSON.stringify(val))
        }
      })
    }
  },
  generate: {
    dir: 'dist'
  },
  srcDir: 'src/',
  fontawesome: {
    imports: [
      {
        set: '@fortawesome/free-solid-svg-icons',
        icons: ['fas']
      }
    ]
  },
}
