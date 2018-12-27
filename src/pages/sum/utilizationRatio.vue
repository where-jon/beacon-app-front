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
      <b-row>
        <b-form inline class="mb-2" @submit.prevent>
          <label v-t="'label.sumYearMonth'" />
          <v-select v-model="vModelYearMonth" :options="yearMonthOptions" :on-change="yearMonthChange" class="vselectMonth">
            <div slot="no-options">
              {{ $i18n.tnl('label.vSelectNoOptions') }}
            </div>
          </v-select>
        </b-form>
        <b-form inline class="mb-2" @submit.prevent>
          <label v-t="'label.sumDay'" />
          <v-select v-model="vModelDay" :options="dayOptions" :on-change="dayChange" class="vselectDay">
            <div slot="no-options">
              {{ $i18n.tnl('label.vSelectNoOptions') }}
            </div>
          </v-select>
        </b-form>
        <b-form inline class="mb-2" @submit.prevent>
          <label v-t="'label.zoneCategoryName'" />
          <v-select v-model="vModelCategory" :options="categoryOptions" :on-change="categoryChange" class="vselectCategory">
            <div slot="no-options">
              {{ $i18n.tnl('label.vSelectNoOptions') }}
            </div>
          </v-select>
        </b-form>
        <b-form inline class="mb-2" @submit.prevent>
          <label v-t="'label.zone'" />
          <v-select v-model="vModelZone" :options="zoneOptions" :on-change="zoneChange" class="vselectZone">
            <div slot="no-options">
              {{ $i18n.tnl('label.vSelectNoOptions') }}
            </div>
          </v-select>
        </b-form>
        <b-form inline class="mb-2" @submit.prevent>
          <b-button v-t="'label.search'" :variant="getButtonTheme()" size="sm" @click="search()" /> 
        </b-form>
      </b-row>
      <p />
      <b-row align-h="end">
        <b-col md="2" class="mb-2">
          <b-button v-if="!iosOrAndroid" v-t="'label.download'" :variant="getButtonTheme()" @click="download()" />
        </b-col>
      </b-row>
      <table class="table table-hover table-bordered">
        <thead>
          <tr>
            <th scope="col">
              {{ $i18n.tnl('label.zoneCategoryName') }}
            </th>
            <th scope="col">
              {{ $i18n.tnl('label.zoneName') }}
            </th>
            <th scope="col">
              {{ $i18n.tnl('label.utilizationRatioP') }}
            </th>
            <th scope="col">
              {{ $i18n.tnl('label.utilizationTime') }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(utilizationRatio, index) in utilizationRatios" :key="index" :class="{undetect: isUndetect(utilizationRatio.updated)}">
            <td>{{ utilizationRatio.zoneCategoryName }}</td>
            <td>{{ utilizationRatio.zoneName }}</td>
            <td>
              <div class="graph">
                <span :style="{ width:utilizationRatio.rate + '%' }" class="bar">
                  {{ utilizationRatio.rate }}%
                </span>
              </div>
            </td>
            <td>{{ (utilizationRatio.cnt/60).toFixed(2) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import * as AppServiceHelper from '../../sub/helper/AppServiceHelper'
import * as HtmlUtil from '../../sub/util/HtmlUtil'
import * as Util from '../../sub/util/Util'
import breadcrumb from '../../components/layout/breadcrumb.vue'
import commonmixinVue from '../../components/mixin/commonmixin.vue'
import reloadmixinVue from '../../components/mixin/reloadmixin.vue'
import { getCharSet } from '../../sub/helper/CharSetHelper'

export default {
  components: {
    breadcrumb,
  },
  mixins: [reloadmixinVue, commonmixinVue ],
  data () {
    return {
      items: [
        {
          text: this.$i18n.tnl('label.sumTitle'),
          active: true
        },
        {
          text: this.$i18n.tnl('label.utilizationRatio'),
          active: true
        }
      ],
      utilizationRatios: [],
      vModelCategory: null,
      vModelZone: null,
      vModelYearMonth: null,
      vModelDay: null,
      categoryOptionList: [{label:'', value:null}],
      zoneOptionList: [],
      dayOptionList: [],
      //
      zoneCategorys: [],
      categoryId: -1,
      zoneId: -1,
      selectedYearMonth: 0,
      selectedDay: 0,
      dataList: null,
      //
      showInfo: false,
      showAlert: false,
      message: ''
    }
  },
  computed: {
    categoryOptions() {
      return this.categoryOptionList
    },
    zoneOptions() {
      return this.zoneOptionList
    },
    yearMonthOptions() {
      var today = new Date()
      var yyyy = today.getFullYear()
      var mm = today.getMonth() + 1
      var pullDowns = []
      for (var idx = 0; idx < 6; idx++) {
        pullDowns.push({
          label: yyyy + '/' + ('00' + mm).substr(-2),
          value: yyyy*100 + mm
        })
        mm--
        if (mm < 1) {
          mm = 12
          yyyy--
        }
      }
      return pullDowns
    },
    dayOptions() {
      return this.dayOptionList
    },
  },
  mounted() {
    this.fetchPrev()
  },
  methods: {
    async fetchZoneCategoryList() {
      try {
        this.zoneCategorys = await AppServiceHelper.fetch(
          '/core/zone/categoryList',
          ''
        )
        var categories = {}
        this.zoneCategorys.forEach(elm => {
          if (elm.categoryId >= 0) {
            categories[elm.categoryId] = elm.categoryName
          }
        })
        this.categoryOptionList = []
        for (var catId in categories) {
          this.categoryOptionList.push({
            label: categories[catId],
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
        this.categoryId = -1
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
    yearMonthChange(val) {
      if (val == null) {
        this.selectedYearMonth = 0
        this.vModelDay = null
        this.dayOptionList = []
        return
      }
      var year = val.value/100
      var month = val.value%100
      var lastDay = new Date(year, month, 0).getDate()
      var pullDowns = []
      for (var idx = 1; idx <= lastDay; idx++) {
        pullDowns.push({
          label: '' + idx, value: idx
        })
      }
      this.selectedYearMonth = val.value
      this.vModelDay = null
      this.dayOptionList = pullDowns
    },
    dayChange(val) {
      if (val == null) {
        this.selectedDay = 0
        this.vModelDay = null
      } else {
        this.selectedDay = val.value
        this.vModelDay = val
      }
    },
    isUndetect(updated) {
      return false
    },
    download() {
      if (this.dataList == null || this.dataList.length == null) {
        this.message = this.$i18n.tnl('message.notFound')
        this.showAlert = true
        return
      }
      HtmlUtil.fileDL(
        'utilizationRatio.csv',
        Util.converToCsv(this.dataList),
        getCharSet(this.$store.state.loginId)
      )
    },
    async search() {
      this.showAlert = false
      if (this.selectedYearMonth == null || this.selectedYearMonth == 0) {
        this.message = this.$i18n.tnl('message.pleaseEnterSearchCriteria')
        this.showAlert = true
        return
      }
      var paramCategoryId = (this.categoryId != null)?this.categoryId:-1
      var paramZoneId = (this.zoneId != null)?this.zoneId:-1
      var paramDate = this.selectedYearMonth
      if (this.selectedDay > 0) {
        paramDate = paramDate*100 + this.selectedDay
      }
      var utilizationRatios = await AppServiceHelper.fetch(
        '/office/utilizationRatio/' + paramCategoryId + '/' + paramZoneId + '/' + paramDate,
        ''
      )
      this.dataList = utilizationRatios
      this.utilizationRatios = utilizationRatios
      if (utilizationRatios.length == null) {
        this.message = this.$i18n.tnl('message.notFound')
        this.showAlert = true
      }
    },
  }
}

</script>

<style scoped lang="scss">
.vselectCategory {
  width:200px;
  margin-left: 5px;
  margin-right: 20px;
}
.vselectZone {
  width:150px;
  margin-left: 5px;
  margin-right: 20px;
}
.vselectMonth {
  width:150px;
  margin-left: 5px;
  margin-right: 20px;
}
.vselectDay {
  width: 120px;
  margin-left: 5px;
  margin-right: 20px;
}
.graph {
    position: relative;
    width: 150px;
    border: 0px solid #000;
    padding: 3px;
}
.graph .bar {
    display: block;
    position: relative;
    background: #60A9A9;
    text-align: center;
    color: #0f0000;
    height: 1.5em;
    line-height: 1.4em;
}
.graph .bar span { position: absolute; left: 1em; }
</style>
