module.exports = {
  mode: 'spa',
  modules: [
    'nuxt-fontawesome'
  ],
  router: {
    base: '/',
    middleware: ['reset', 'check-auth']
  },
  plugins: [
    '~/plugins/init',
    '~/plugins/i18n'
  ],
  /*
  ** Headers of the page
  */
  head: {
    title: 'EXBeacon Project',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'EXBeacon Project' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },
  /*
  ** Customize the progress bar color
  */
  loading: { color: '#3B8070' },
  /*
  ** Build configuration
  */
  build: {
    babel: {
      presets: [
        [
          'vue-app',
          {
            targets:  { ie: 11 },
            useBuiltIns: true
          }
        ]
      ]
    },
    vendor: [ 'babel-polyfill', 'url-search-params-polyfill' ],

    /*
    ** Run ESLint on save
    */
    extend (config, { isDev, isClient }) {
      if (isDev && isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/
        })
      }
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
  }
}
