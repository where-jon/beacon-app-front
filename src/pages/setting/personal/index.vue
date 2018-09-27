
<template>
  <div class="container">
    <breadcrumb :items="items" />
    <!--
    <b-alert variant="info" :show="showInfo">{{ message }}</b-alert>
    <b-alert variant="danger" dismissible :show="showAlert"  @dismissed="showAlert=false">{{ message }}</b-alert>
    -->

    <b-row>
      <b-col md="8">
        <b-form>
          <b-form-group>
            <label v-t="'label.loginId'" />
            <b-form-input type="text" :value="loginId" readonly="readonly" />
          </b-form-group>
          <b-form-group>
            <label v-t="'label.theme'" />
            <b-form-select v-model="selectedTheme" :options="theme" class="mb-3" @change="themeSelected"/>
          </b-form-group>
        </b-form>
      </b-col>
    </b-row>

  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import breadcrumb from '../../../components/breadcrumb.vue'
import { DISP, THEME } from '../../../sub/constant/config'
import { getTheme } from '../../../sub/helper/ThemeHelper'

export default {
  components: {
    breadcrumb,
  },
  data () {
    return {
      items: [
        {
          text: this.$i18n.t('label.setting'),
          active: true
        },
        {
          text: this.$i18n.t('label.personal'),
          active: true
        },
      ],
      selectedTheme: null,
      theme: []
    }
  },
  computed: {
    loginId () {
      return this.$store.state.loginId
    },
  },
  created () {
    const theme = getTheme(this.loginId)
    const selected = THEME.find((item) => {
      return item.name === theme
    })
    this.selectedTheme = (typeof selected) !== 'undefined' ? selected.id : THEME[0].id
    this.theme = THEME.map((e) => {
        return { value: e.id, text: e.label }
    })
  },
  methods: {
    themeSelected (selected) {
      const t = THEME.find((e) => {
        return e.id === selected
      })
      const theme = (typeof t !== 'undefined') ? t.name : 'default'
      // storeにテーマをセット。navbar,sidebar,menu-itemのcomputedプロパティにて
      // storeを参照しているため、テーマの変更を検知する
      this.replaceSetting({theme})
      window.localStorage.setItem(this.loginId + '-theme', theme)
    },
    ...mapMutations('setting', [
      'replaceSetting', 
    ]),
  }
}
</script>

<style scoped lang="scss">
</style>