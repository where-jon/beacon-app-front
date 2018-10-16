<template>
  <div>
    <breadcrumb :items="items" :reload="false" />
    <div class="container">
      <p></p>
      <b-row>
        <b-form inline>
          <label v-t="'label.zoneCategoryName'" />
          <v-select v-model="vModelCategory" :options="categoryOptions" :on-change="categoryChange" class="vselectCategory"></v-select>
          <label v-t="'label.zoneName'" />
          <v-select v-model="vModelZone" :options="zoneOptions" :on-change="zoneChange" class="vselectZone"></v-select>
          <label v-t="'label.sumYearMonth'" />
          <v-select v-model="vModelYearMonth" :options="yearMonthOptions" :on-change="yearMonthChange" class="vselectMonth"></v-select>
          <label v-t="'label.sumDay'" />
          <v-select v-model="vModelDay" :options="dayOptions" :on-change="dayChange" class="vselectDay"></v-select>
          <b-button size="sm" variant="info" v-t="'label.search'" @click="search()"></b-button> 
        </b-form>
      </b-row>
      <b-row align-h="end">
        <b-col md="2" class="mb-3 mr-3">
          <b-button variant='outline-primary' @click="download()" v-t="'label.download'" />
        </b-col>
      </b-row>
      <table class="table table-hover table-bordered">
        <thead>
          <tr>
            <th scope="col">{{ $i18n.t('label.zoneCategoryName') }}</th>
            <th scope="col">{{ $i18n.t('label.zoneName') }}</th>
            <th scope="col">{{ $i18n.t('label.numOfUsers') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(numUser, index) in numUsers" :key="index" :class="{undetect: isUndetect(numUser.updated)}">
            <td scope="row">{{ numUser.zoneCategoryName }}</td>
            <td>{{ numUser.zoneName }}</td>
            <td>{{ numUser.numUse }}</td>
          </tr>
        </tbody>
      </table>
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
          text: this.$i18n.t('label.sumTitle'),
          active: true
        },
        {
          text: this.$i18n.t('label.numUsers'),
          active: true
        }
      ],
      vModelCategory: null,
      vModelZone: null,
      vModelYearMonth: null,
      vModelDay: null,
      categoryOptionList: [{label:"", value:null}],
      zoneOptionList: [],
      dayOptionList: [{label:"", value:null}],
      //
      categoryId: -1,
      zoneId: -1,
      zoneCategorys: [],
      selectedYearMonth: null,
      selectedDay: 0,
      dataList: null
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
          label: yyyy + "/" + ("00" + mm).substr(-2),
          value: yyyy*100 + mm
        })
        mm--
        if (mm < 1) {
          mm = 12
          yyyy--;
        }
      }
      this.dayOptionList = []
      return pullDowns
    },
    dayOptions() {
      return this.dayOptionList
    },
    getTheme () {
      const theme = getTheme(this.$store.state.loginId)
      return 'outline-' + theme
    },
    ...mapState('monitor', [
      'numUsers',
    ])
  },
  mounted() {
    this.fetchPrev()
    this.replace({title: this.$i18n.t('label.numUsers')})
  },
  methods: {
    async fetchZoneCategoryList() {
      try {
        this.zoneCategorys = await AppServiceHelper.fetchList2(
          '/core/zone/categoryList',
          '/core/zone/categoryList',
          'categoryId'
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
          label: "" + idx, value: idx
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
      if (this.dataList == null) return
      if (this.dataList.length == 0) return
      HtmlUtil.fileDL(
        "numUsers.csv",
        Util.converToCsv(this.dataList),
        getCharSet(this.$store.state.loginId)
      )
    },
    async search() {
      if (this.selectedYearMonth == null) return
      let paramCategoryId = (this.categoryId != null)?this.categoryId:-1
      let paramZoneId = (this.zoneId != null)?this.zoneId:-1
      let paramDate = this.selectedYearMonth
      if (this.selectedDay > 0) {
        paramDate = paramDate*100 + this.selectedDay
      }
      let numUsers = await AppServiceHelper.fetchList2(
        'numUsers',
        '/office/numUsers/' + paramCategoryId + '/' + paramZoneId + '/' + paramDate,
        'numOfUsers'
      )
      this.dataList = numUsers
      this.replaceMonitor({numUsers})
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
  width:120px;
  margin-left: 5px;
  margin-right: 20px;
}
.vselectMonth {
  width:120px;
  margin-left: 5px;
  margin-right: 20px;
}
.vselectDay {
  width: 120px;
  margin-left: 5px;
  margin-right: 20px;
}
</style>
