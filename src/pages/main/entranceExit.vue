<template>
  <div>
    <breadcrumb :items="breadCrumbs" :reload="false" />
    <div class="container">
      <alert :message="message" />

      <b-form inline @submit.prevent>
        <b-form-group>
          <b-form-row class="mr-3">

            <label v-t="'label.name'" class="ml-2" />
            <span :title="vueSelectTitle(vueSelected.group)">
              <v-select v-model="vueSelected.group" :options="groupOptions" class="ml-2 inputSelect vue-options">
                <template slot="selected-option" slot-scope="option">
                  {{ vueSelectCutOn(option) }}
                </template>
                <template slot="no-options">
                  {{ vueSelectNoMatchingOptions }}
                </template>
              </v-select>
            </span>
            
            <label v-t="'label.group'" class="ml-2" />
            <span :title="vueSelectTitle(vueSelected.group)">
              <v-select v-model="vueSelected.group" :options="groupOptions" class="ml-2 inputSelect vue-options">
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

            <b-button v-t="'label.display'" type="submit" :variant="theme" @click="display(false)" class="ml-2" />
            <b-button v-t="'label.download'" type="submit" :variant="theme" @click="display(true)" class="ml-2" />
          </b-form-row>
        </b-form-group>
      </b-form>

      <slot />
      <b-row class="mt-3" />
      <b-table :items="viewList" :fields="getField()" :current-page="currentPage" :per-page="perPage" :sort-by.sync="sortBy" :sort-compare="defaultSortCompare" stacked="md" striped hover outlined />
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
import * as Util from '../../sub/util/Util'
import * as ViewHelper from '../../sub/helper/ui/ViewHelper'
import * as MasterHelper from '../../sub/helper/domain/MasterHelper'
import * as HttpHelper from '../../sub/helper/base/HttpHelper'
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
      breadCrumbs: ViewHelper.createBreadCrumbItems('sumTitle', 'entranceExit'),
      form: {
        date: '',
      },
      vueSelected: {
        group: null,
        category: null,
      },
      message: '',
      viewList: [],
      name: '',
      currentPage: 1,
      perPage: 20,
      sortBy: 'name',
      totalRows: 0,
      potMap: null,
      exbMap: null
    }
  },
  computed: {
  },
  watch: {
    'vueSelected.group': {
      handler: function(newVal, oldVal){
        this.form.groupId = Util.getValue(newVal, 'value', null)
      },
      deep: true,
    },
    'vueSelected.area': {
      handler: function(newVal, oldVal){
        this.form.areaId = Util.getValue(newVal, 'value', null)
      },
      deep: true,
    },
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
      ]
    },
    async display(isDownload) {
      this.replace({showAlert: false})
      this.showProgress()
      try {
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

        this.viewList = res.map( e => {
          const pot = this.potIdMap[e.potId]
          console.log('pot', pot)
          const group = pot.group ? this.groupIdMap[pot.group.groupId] : null
          const location = this.locationIdMap[e.locationId]
          console.log('location', location)
          const zoneName = location ? location.zoneList.length>0 && location.zoneList[0].zoneName : null
          return {
            name: e.potName, 
            groupName: group ? group.groupName : null,
            entranceTime: DateUtil.formatDate(e.inDt),
            exitTime: DateUtil.formatDate(e.outDt),
            lastDetected: zoneName,
            stayTime: DateUtil.toHHmm( (e.outDt - e.inDt)/1000)
          }
        })
        Util.debug("viewList", this.viewList)

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
      const url = `/office/entranceExit/list/${date}`
      Util.debug('url', url)
      const data = await HttpHelper.getAppService(url)
      Util.debug('data', data)
      return data
    },
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
