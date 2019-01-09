<template>
  <div>
    <breadcrumb :items="items" :reload="false" />
    <div class="container">
      <b-alert :show="showInfo" variant="info" dismissible>
        {{ message }}
      </b-alert>
      <b-alert :show="showAlert" variant="danger" dismissible @dismissed="showAlert=false">
        {{ message }}
      </b-alert>
      <b-form @submit.prevent>
        <b-form-group>
          <b-form-row>
            <b-form-row class="mr-2">
              <label v-t="'label.historyDateFrom'" class="mr-2 mb-2 d-flex align-items-center" />
              <b-form-input v-if="useInputDate" type="date" required class="mb-2 inputdatefrom" @change="dateFromChange" />
              <date-picker v-else v-model="dateFrom" type="date" value-format="yyyyMMdd" class="mr-2 mb-2 inputdatefrom" />
            </b-form-row>
            <b-form-row class="mr-2">
              <label v-t="'label.historyDateTo'" class="mr-2 mb-2 d-flex align-items-center" />
              <b-form-input v-if="useInputDate" type="date" required class="mb-2 inputdateto" @change="dateToChange" />
              <date-picker v-else v-model="dateTo" type="date" value-format="yyyyMMdd" class="mb-2 inputdateto" />
            </b-form-row>
          </b-form-row>
        </b-form-group>
        <b-form-group>
          <b-form-row>
            <b-form-row class="mr-2 mb-3">
              <label v-t="'label.zoneCategoryName'" class="mr-2 mb-2 d-flex align-items-center" />
              <v-select v-model="vModelCategory" :options="categoryOptions" :on-change="categoryChange" required class="ml-2 mb-2">
                <div slot="no-options">
                  {{ $i18n.tnl('label.vSelectNoOptions') }}
                </div>
              </v-select>
            </b-form-row>
            <b-form-row class="mb-2">
              <label v-t="'label.zone'" class="mr-2 mb-2 d-flex align-items-center" />
              <v-select v-model="vModelZone" :options="zoneOptions" :on-change="zoneChange" required class="ml-2 mb-2">
                <div slot="no-options">
                  {{ $i18n.tnl('label.vSelectNoOptions') }}
                </div>
              </v-select>
            </b-form-row>
          </b-form-row>
        </b-form-group>
        <b-form-group>
          <b-form-radio-group v-model="historyType">
            <b-form-radio :value="0">
              {{ $t('label.temperatureHistoryType0') }}
            </b-form-radio>
            <b-form-radio :value="1">
              {{ $t('label.temperatureHistoryType1') }}
            </b-form-radio>
          </b-form-radio-group>
        </b-form-group>
      </b-form>
      <p />
      <b-row>
        <b-col md="10" offset-md="2">
          <b-button v-if="!iosOrAndroid" v-t="'label.download'" :variant="getButtonTheme()" @click="download()" />
        </b-col>
      </b-row>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { DatePicker } from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import locale from 'element-ui/lib/locale'
import * as AppServiceHelper from '../../sub/helper/AppServiceHelper'
import * as StateHelper from '../../sub/helper/StateHelper'
import * as HtmlUtil from '../../sub/util/HtmlUtil'
import * as Util from '../../sub/util/Util'
import breadcrumb from '../../components/layout/breadcrumb.vue'
import commonmixinVue from '../../components/mixin/commonmixin.vue'
import reloadmixinVue from '../../components/mixin/reloadmixin.vue'
import { getCharSet } from '../../sub/helper/CharSetHelper'

export default {
  components: {
    breadcrumb,
    DatePicker,
  },
  mixins: [reloadmixinVue, commonmixinVue ],
  data () {
    return {
      items: [
        {
          text: this.$i18n.tnl('label.historyTitle'),
          active: true
        },
        {
          text: this.$i18n.tnl('label.thermohumidity'),
          active: true
        }
      ],
      vModelCategory: null,
      vModelZone: null,
      vModelYearMonth: null,
      vModelDay: null,
      categoryOptionList: [{label:'', value:null}],
      zoneOptionList: [],
      //
      zoneCategorys: [],
      categoryId: null,
      zoneId: null,
      dateFrom: Util.supportInputType('date')? 0: null,
      dateTo: Util.supportInputType('date')? 0: null,
      historyType: 0,
      temperatureHistoryData: null,
      //
      showInfo: false,
      showAlert: false,
      message: '',
      //
      useInputDate: Util.supportInputType('date'),
    }
  },
  computed: {
    categoryOptions() {
      return this.categoryOptionList
    },
    zoneOptions() {
      return this.zoneOptionList
    },
    ...mapState('monitor', [
      'temperatureHistory',
    ])
  },
  async mounted() {
    import(`element-ui/lib/locale/lang/${this.$i18n.locale}`).then( (mojule) =>{
      locale.use(mojule.default)
    })
    await StateHelper.load('category')
    this.fetchPrev()
  },
  methods: {
    async fetchZoneCategoryList() {
      try {
        this.zoneCategorys = await AppServiceHelper.fetch(
          '/core/zone/categoryList',
          ''
        )
        console.log(this.zoneCategorys)
        this.categoryOptionList = this.getZoneCategoryOptions(this.zoneCategorys)
      } catch(e) {
        console.error(e)
      }
    },
    async fetchPrev() {
      await this.fetchZoneCategoryList()
      this.categoryChange(null)
    },
    categoryChange(val) {
      this.zoneOptionList = this.getZoneOptions(this.zoneCategorys, val)
      if (val == null) {
        this.categoryId = null
        this.vModelCategory = null
      } else {
        this.categoryId = val.value
        this.vModelCategory = val
      }
      this.vModelZone = null
    },
    zoneChange(val) {
      if (val == null) {
        this.zoneId = null
        this.vModelZone = null
      } else {
        this.zoneId = val.value
        this.vModelZone = val
      }
    },
    dateFromChange(val) {
      if (val == null) {
        this.dateFrom = 0
      } else {
        this.dateFrom = (val.substr(0, 4) + val.substr(5, 2) + val.substr(8, 2))/1
      }
    },
    dateToChange(val) {
      if (val == null) {
        this.dateTo = 0
      } else {
        this.dateTo = (val.substr(0, 4) + val.substr(5, 2) + val.substr(8, 2))/1
      }
    },
    typeChange(val) {
      if (val == null) {
        this.historyType = 0
      } else {
        this.historyType = val.value
      }
    },
    async dataDownload() {
      let paramCategoryId = (this.categoryId != null)?this.categoryId:-1
      let paramZoneId = (this.zoneId != null)?this.zoneId:-1
      let paramExbId = -1
      let paramDyFrom = this.dateFrom
      let paramDyTo = this.dateTo
      let paramHistoryType = this.historyType
      var list = []
      try {
        list = await AppServiceHelper.fetch(
          '/basic/sensorHistory/' + paramCategoryId + '/' +
            paramZoneId + '/' +
            paramExbId + '/' +
            paramDyFrom + '/' +
            paramDyTo + '/' +
            paramHistoryType,
          ''
        )
        if (list.length == null) {
          return []
        }
        list.forEach(data => {
          delete data['sensorHistoryId']
        })
      } catch (e) {
        console.log(e)
        list = []
      }
      return list
    },
    async download() {
      this.showInfo = false
      this.showAlert = false
      if (this.dateFrom == 0 || this.dateTo == 0 || !Util.hasValue(this.dateFrom) || !Util.hasValue(this.dateTo)) {
        this.message = this.$i18n.tnl('message.required', {target: this.$i18n.tnl('label.historyDateFrom')})
        this.showAlert = true
        return
      }
      this.temperatureHistoryData = await this.dataDownload()
      if (this.temperatureHistoryData == null || this.temperatureHistoryData.length == 0) {
        this.message = this.$i18n.tnl('message.notFound')
        this.showAlert = true
        return
      }
      HtmlUtil.fileDL(
        'temperatureHistory.csv',
        Util.converToCsv(this.temperatureHistoryData),
        getCharSet(this.$store.state.loginId)
      )
    },
  }
}
</script>

<style scoped lang="scss">
.inputdatefrom {
  width: 180px;
}
.inputdateto {
  width: 180px;
}
</style>
