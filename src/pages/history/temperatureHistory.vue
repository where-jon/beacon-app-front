<template>
  <div>
    <breadcrumb :items="items" :reload="false" />
    <div class="container">
      <b-alert variant="info" :show="showInfo">{{ message }}</b-alert>
      <b-alert variant="danger" dismissible :show="showAlert"  @dismissed="showAlert=false">{{ message }}</b-alert>
      <b-row>
        <b-col md="10" offset-md="2">
          <b-form inline>
            <label v-t="'label.historyDateFrom'" class="leftsidelabel"/>
            <b-form-input type="date" required v-on:change="dateFromChange" class="inputdatefrom" />
            <label v-t="'label.historyDateTo'" />
            <b-form-input type="date" required v-on:change="dateToChange" class="inputdateto" />
          </b-form>
        </b-col>
      </b-row>
      <p></p>
      <b-row>
        <b-col md="10" offset-md="2">
          <b-form inline>
            <label v-t="'label.zoneCategoryName'" class="leftsidelabel"/>
            <v-select v-model="vModelCategory" :options="categoryOptions" :on-change="categoryChange" required class="ml-2">
              <div slot="no-options">{{$i18n.t('label.vSelectNoOptions')}}</div>
            </v-select>
            <label v-t="'label.zoneName'" />
            <v-select v-model="vModelZone" :options="zoneOptions" :on-change="zoneChange" required class="ml-2">
              <div slot="no-options">{{$i18n.t('label.vSelectNoOptions')}}</div>
            </v-select>
          </b-form>
        </b-col>
      </b-row>
      <p></p>
      <b-row>
        <b-col md="10" offset-md="2">
          <b-form inline>
            <b-form-radio-group v-model="historyType">
              <b-form-radio :value="0">
                {{$t('label.temperatureHistoryType0')}}
              </b-form-radio>
              <b-form-radio :value="1">
                {{$t('label.temperatureHistoryType1')}}
              </b-form-radio>
            </b-form-radio-group>
          </b-form>
        </b-col>
      </b-row>
      <p></p>
      <b-row>
        <b-col md="10" offset-md="2">
          <b-button :variant="theme" @click="download()" v-t="'label.download'" />
        </b-col>
      </b-row>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import * as AppServiceHelper from '../../sub/helper/AppServiceHelper'
import * as HtmlUtil from '../../sub/util/HtmlUtil'
import * as Util from '../../sub/util/Util'
import { EventBus } from '../../sub/helper/EventHelper'
import { EXB, DISP, APP } from '../../sub/constant/config'
import breadcrumb from '../../components/breadcrumb.vue'
import { getTheme } from '../../sub/helper/ThemeHelper'
import reloadmixinVue from '../../components/reloadmixin.vue'
import { getCharSet } from '../../sub/helper/CharSetHelper'

export default {
  mixins: [reloadmixinVue],
  components: {
    breadcrumb,
  },
  data () {
    return {
      items: [
        {
          text: this.$i18n.t('label.historyTitle'),
          active: true
        },
        {
          text: this.$i18n.t('label.temperatureHistory'),
          active: true
        }
      ],
      vModelCategory: null,
      vModelZone: null,
      vModelYearMonth: null,
      vModelDay: null,
      categoryOptionList: [{label:"", value:null}],
      zoneOptionList: [],
      //
      zoneCategorys: [],
      categoryId: null,
      zoneId: null,
      dateFrom: 0,
      dateTo: 0,
      historyType: 0,
      temperatureHistoryData: null,
      //
      showInfo: false,
      showAlert: false,
      message: ""
    }
  },
  computed: {
    categoryOptions() {
      return this.categoryOptionList
    },
    zoneOptions() {
      return this.zoneOptionList
    },
    theme () {
      const theme = getTheme(this.$store.state.loginId)
      return 'outline-' + theme
    },
    ...mapState('monitor', [
      'temperatureHistory',
    ])
  },
  mounted() {
    this.fetchPrev()
    this.replace({title: this.$i18n.t('label.temperatureHistory')})
  },
  methods: {
    async fetchZoneCategoryList() {
      try {
        this.zoneCategorys = await AppServiceHelper.fetch(
          '/core/zone/categoryList',
          ''
        )
        console.log(this.zoneCategorys)
        var categorys = {}
        this.zoneCategorys.forEach(elm => {
          if (elm.categoryId >= 0) {
            categorys[elm.categoryId] = elm.categoryName
          }
        })
        this.categoryOptionList = []
        for (var catId in categorys) {
          this.categoryOptionList.push({
            label: categorys[catId],
            value: catId
          })
        }
      } catch(e) {
        console.error(e)
      }
    },
    async fetchPrev() {
      await this.fetchZoneCategoryList()
      this.categoryChange(null)
    },
    categoryChange(val) {
      var zoneUniqs = {}
      if (val == null) {
        this.zoneCategorys.forEach(elm => {
          zoneUniqs[elm.zoneId] = elm.zoneName
        })
      } else {
        this.zoneCategorys.forEach(elm => {
          if (elm.categoryId == val.value) {
            zoneUniqs[elm.zoneId] = elm.zoneName
          }
        })
      }
      this.zoneOptionList = []
      for (var zId in zoneUniqs) {
        this.zoneOptionList.push({
          label: zoneUniqs[zId],
          value: zId
        })
      }
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
          '/basic/sensorHistory/' + paramCategoryId + "/" +
            paramZoneId + "/" +
            paramExbId + "/" +
            paramDyFrom + "/" +
            paramDyTo + "/" +
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
      if (this.dateFrom == 0 || this.dateTo == 0) {
        this.message = this.$i18n.t('message.required', {target: this.$i18n.t('label.historyDateFrom')})
        this.showAlert = true
        return
      }
      this.temperatureHistoryData = await this.dataDownload()
      if (this.temperatureHistoryData == null || this.temperatureHistoryData.length == 0) {
        this.message = this.$i18n.t('message.notFound')
        this.showAlert = true
        return
      }
      HtmlUtil.fileDL(
        "temperatureHistory.csv",
        Util.converToCsv(this.temperatureHistoryData),
        getCharSet(this.$store.state.loginId)
      )
    },
  }
}
</script>

<style scoped lang="scss">
.leftsidelabel {
  width:130px;
  text-align: left;
  justify-content: left;
}
.inputdatefrom {
  margin-left: 8px;
  margin-right: 20px;
  width: 200px;
}
.inputdateto {
  margin-left: 20px;
  margin-right: 0px;
  width: 200px;
}
</style>
