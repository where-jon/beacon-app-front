<template>
  <div>
    <breadcrumb :items="items" :reload="false" />
    <div class="container">
      <alert :message="message" />

      <div class="mb-5">
        <b-form inline @submit.prevent>
          <b-form-group>
            <b-form-row>
              <b-form-row class="mr-2">
                <label v-t="'label.year'" class="mr-2 d-flex align-items-center" />
                <v-select v-model="year" :options="years" class="mr-2">
                  <div slot="no-options">
                    {{ $i18n.tnl('label.vSelectNoOptions') }}
                  </div>
                </v-select>
              </b-form-row>
              <b-form-row class="mr-2">
                <label v-t="'label.month'" class="mr-2 d-flex align-items-center" />
                <v-select v-model="month" :options="months" class="mr-2">
                  <div slot="no-options">
                    {{ $i18n.tnl('label.vSelectNoOptions') }}
                  </div>
                </v-select>
              </b-form-row>
            </b-form-row>
          </b-form-group>
        </b-form>
        <b-row class="mt-4" />
        <b-table :items="viewList" :fields="fields" :sort-by.sync="sortBy" striped hover outlined >
          <template slot="actions" slot-scope="row">
            <b-button v-t="'label.download'" :variant="theme" size="sm" @click.stop="download(row.item)" />
          </template>
        </b-table>
      </div>
    </div>
  </div>
</template>

<script>
import 'element-ui/lib/theme-chalk/index.css'
import breadcrumb from '../../components/layout/breadcrumb.vue'
import alert from '../../components/parts/alert.vue'
import showmapmixin from '../../components/mixin/showmapmixin.vue'
import { addLabelByKey } from '../../sub/helper/ViewHelper'
import * as ExcloudHelper from '../../sub/helper/ExcloudHelper'
import * as Util from '../../sub/util/Util'
import * as HtmlUtil from '../../sub/util/HtmlUtil'
import { getTheme } from '../../sub/helper/ThemeHelper'
import { EXCLOUD } from '../../sub/constant/config'


export default {
  components: {
    breadcrumb,
    alert,
  },
  mixins: [showmapmixin ],
  data () {
    return {
      name: 'positionHistory',
      items: [
        {
          text: this.$i18n.tnl('label.historyTitle'),
          active: true
        },
        {
          text: this.$i18n.tnl('label.positionHistory'),
          active: true
        }
      ],
      year: new Date().getFullYear(),
      month: Util.zeroPad(new Date().getMonth() + 1, 2),
      years: Util.range(2019, new Date().getFullYear()).map(e => ({label: '' + e, value: e})),
      months: Array(12).fill().map((_, i) => ({label: '' + ++i, value: Util.zeroPad(i, 2)})),
      viewList: [],
      fields: addLabelByKey(this.$i18n, [
        {key: 'date', sortable: true, label:'date'},
        {key: 'actions', thStyle: {width: '130px !important'}, tdClass: 'action-rowdata' }
      ]),
      message: null
    }
  },
  watch: {
    month: function(newVal, oldVal) {
      this.loadDate()
    },
    year: function(newVal, oldVal) {
      this.loadDate()
    }
  },
  computed: {
    theme () {
      const theme = getTheme(this.$store.state.loginId)
      return 'outline-' + theme
    },
  },
  mounted() {
    this.loadDate()
  },
  methods: {
    async loadDate() {
      let year = this.year
      let month = this.month
      if (year instanceof Object) {
        year = year.value
      }
      if (month instanceof Object) {
        month = month.value
      }
      if (year && month) {
        this.viewList = await ExcloudHelper.fetchDlList(year + '' + month)
      }
    },
    async download(item) {
      let url = ExcloudHelper.url(EXCLOUD.DL_URL).replace('{yyyymmdd}', item.date.split('/').join('')) + new Date().getTime()
      HtmlUtil.executeFileDL(url)
    },
  }
}
</script>

<style scoped>
.v-select {
  min-width: 100px;
  width: 100px;
}

.table {
  width: 40%;
}
</style>
