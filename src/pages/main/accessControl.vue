<template>
  <div>
    <breadcrumb :items="breadCrumbs" :reload="false" />
    <div class="container">
      <alert :message="message" />

      <b-form inline @submit.prevent>
        <b-form-group>
          <b-form-row class="mr-3">

            <label v-t="'label.name'" />
            <span :title="vueSelectTitle(form.pot)">
              <v-select v-model="form.pot" :options="potOptions" class="ml-2 inputSelect vue-options">
                <template slot="selected-option" slot-scope="option">
                  {{ vueSelectCutOn(option) }}
                </template>
                <template slot="no-options">
                  {{ vueSelectNoMatchingOptions }}
                </template>
              </v-select>
            </span>
            
            <label v-t="'label.group'" class="ml-2" />
            <span :title="vueSelectTitle(form.group)">
              <v-select v-model="form.group" :options="groupOptions" class="ml-2 inputSelect vue-options">
                <template slot="selected-option" slot-scope="option">
                  {{ vueSelectCutOn(option) }}
                </template>
                <template slot="no-options">
                  {{ vueSelectNoMatchingOptions }}
                </template>
              </v-select>
            </span>
          </b-form-row>

          <b-form-row class="mt-3 mb-3">
            <span v-t="'label.date'" class="d-flex align-items-center" />
            <date-picker v-model="form.date" :clearable="false" type="date" class="ml-2 inputdatefrom" required />

            <b-button v-t="'label.display'" type="submit" :variant="theme" @click="display" class="ml-2" />
            <b-button v-t="'label.download'" type="submit" :variant="theme" @click="download" class="ml-2" />
          </b-form-row>
        </b-form-group>
      </b-form>

      <b-row class="mt-2" v-if="allDayWorkPer">
        {{$i18n.tnl("label.allDayWorkPer")}} {{allDayWorkPer}} {{$i18n.tnl("label.halfDayWorkPer")}} {{halfDayWorkPer}}
      </b-row>

      <b-row class="mt-3">
        <b-table :items="viewList" :fields="getField()" :current-page="currentPage" :per-page="perPage" :sort-by.sync="sortBy" :sort-compare="defaultSortCompare" stacked="md" striped hover outlined />
      </b-row>
      <b-row>
        <b-col md="6" class="mt-1 mb-3">
          <b-pagination v-model="currentPage" :total-rows="totalRows" :per-page="perPage" class="my-0" />
        </b-col>
      </b-row>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import { mapState } from 'vuex'
import { DatePicker } from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import { APP, DEV } from '../../sub/constant/config'
import { CATEGORY } from '../../sub/constant/Constants'
import * as DateUtil from '../../sub/util/DateUtil'
import * as BrowserUtil from '../../sub/util/BrowserUtil'
import * as Util from '../../sub/util/Util'
import * as ViewHelper from '../../sub/helper/ui/ViewHelper'
import * as MasterHelper from '../../sub/helper/domain/MasterHelper'
import * as HttpHelper from '../../sub/helper/base/HttpHelper'
import * as CharSetHelper from '../../sub/helper/base/CharSetHelper'
import breadcrumb from '../../components/layout/breadcrumb.vue'
import commonmixin from '../../components/mixin/commonmixin.vue'
import alert from '../../components/parts/alert.vue'
import moment from 'moment'

export default {
  components: {
    DatePicker,
    breadcrumb,
    alert,
  },
  mixins: [commonmixin],
  data () {
    return {
      breadCrumbs: ViewHelper.createBreadCrumbItems('sumTitle', 'accessControl'),
      form: {
        date: '',
        pot: null,
        group: null
      },
      message: '',
      viewList: [],
      currentPage: 1,
      perPage: 20,
      sortBy: 'name',
      totalRows: 0,
      allDayWorkPer: null,
      halfDayWorkPer: null
    }
  },
  computed: {
  },
  async created() {
    const date = DateUtil.getDefaultDate()
    this.form.date = DateUtil.getDatetime(date, {date: -1})
  },
  async mounted() {
    ViewHelper.importElementUI()
    window.addEventListener('resize', () => {
      this.$forceUpdate()
    })
    if (this.categories.length < 1) {
      return
    }
  },
  methods: {
    getField(){
      return [
        {key: 'name', sortable: true, label: this.$i18n.tnl('label.potName')},
        {key: 'groupName', sortable: true, label: this.$i18n.tnl('label.groupName') },
        {key: 'entranceTime', sortable: false, label: this.$i18n.tnl('label.entranceTime') },
        {key: 'exitTime', sortable: false, label: this.$i18n.tnl('label.exitTime') },
        {key: 'lastDetected', sortable: false, label: this.$i18n.tnl('label.lastDetected') },
        {key: 'stayTime', sortable: false, label: this.$i18n.tnl('label.stayTime') },
        {key: 'status', sortable: false, label: this.$i18n.tnl('label.status') },
      ]
    },
    async display() {
      Util.debug('form', this.form)

      try {
        this.replace({showAlert: false})
        this.showProgress()
        if ( !Util.hasValue(this.form.date) ) {
          this.message = this.$i18n.tnl('message.pleaseEnterSearchCriteria')
          this.replace({showAlert: true})
          this.hideProgress()
          return
        }

        // データ取得
        const res = await this.fetchData(this.form)
        if (_.isEmpty(res)) {
          this.message = this.$i18n.t('message.listEmpty')
          this.replace({showAlert: true})
          this.hideProgress()
          return
        }

        let allCount = 0
        let halfCount = 0
        this.viewList = res.map( e => {
          const pot = this.potIdMap[e.potId]
          console.log('pot', pot)
          const group = pot.group ? this.groupIdMap[pot.group.groupId] : null
          const location = this.locationIdMap[e.locationId]
          console.log('location', location)
          const zoneName = location ? location.zoneList.length>0 && location.zoneList[0].zoneName : null

          // 勤務時間判定 TODO:仮実装
          let status = ''
          if((e.outDt - e.inDt)>=1000*60*60*9){
            status = this.$i18n.tnl("label.allDayWork")
            allCount++
          }else if((e.outDt - e.inDt)>=1000*60*60*4){
            status = this.$i18n.tnl("label.halfDayWork")
            halfCount++
          }else{
            status = this.$i18n.tnl("label.temporaryTimeWork")
          }
          return {
            name: e.potName, 
            groupName: group ? group.groupName : null,
            entranceTime: DateUtil.formatDate(e.inDt),
            exitTime: DateUtil.formatDate(e.outDt),
            lastDetected: zoneName,
            stayTime: DateUtil.toHHmm( (e.outDt - e.inDt)/1000),
            status
          }
        })
        Util.debug("viewList", this.viewList)

        if(this.viewList.length > 0){
          this.allDayWorkPer = Math.floor(allCount / this.viewList.length * 100) + '%'
          this.halfDayWorkPer = Math.floor(halfCount / this.viewList.length * 100) + '%'
        }

        this.totalRows = this.viewList.length
      }
      catch(e) {
        console.error(e)
      }
      finally {
        this.hideProgress()
      }
    },
    async fetchData(form){
      const date = moment(form.date).format('YYYYMMDD')
      const potId = this.form.pot ? this.form.pot.value : 0
      const groupId = this.form.group ? this.form.group.value : 0
      const url = `/office/accessControl/list/${date}/${potId}/${groupId}`
      const data = await HttpHelper.getAppService(url)
      Util.debug('data', data)
      return data
    },
    async download(){
      let csv = _.map(this.getField(), e => e.label).join(',') + '\n' // ヘッダー
      _.forEach(this.viewList, v => {
        csv += `${v.name},${v.groupName ? v.groupName : ''},${v.entranceTime},${v.exitTime},${v.lastDetected},${v.stayTime},${v.status}\n`
      })
      BrowserUtil.fileDL('accessControl.csv', csv, CharSetHelper.getCharSet(this.$store.state.loginId))
    }
  }
}
</script>

<style scoped lang="scss">
@import "../../sub/constant/input.scss";
.stay-bar {
  position: relative;
  display: inline-block;
  cursor: default;
  box-sizing:border-box;
}
.lost-bar {
  position: relative;
  display: inline-block;
  background: #ccc;
  cursor: default;
  box-sizing:border-box;
}
.graph-arrow-box {
  display: none;
  position: absolute;
  top: 100%;
  padding: 8px;
  -webkit-border-radius: 5px;
  -moz-border-radius: 5px;  
  border-radius: 5px;
  background: #333;
  color: #fff;
  white-space: nowrap;
  z-index: 5;
}
.stay-bar:hover .graph-arrow-box, .lost-bar:hover .graph-arrow-box {
  display: block;
}
</style>
