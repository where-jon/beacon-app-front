<template>
  <div class="container">
    <breadcrumb :items="breadCrumbs" :reload="false" />
    <alert :message="message" />
    <div v-if="isFeatureAvailabe">
      <b-row class="mt-2">
        <b-form inline @submit.prevent>
          <b-form-row class="my-1 ml-2 ml-sm-0">
            <label class="ml-sm-4 ml-2 mr-1">
              {{ $t('label.mode') }}
            </label>
            <span :title="vueSelectTitle(planModeFilter)">
              <v-select v-model="planModeFilter" :options="planModeOpts" :clearable="false" class="ml-1 mr-2 vue-options" :style="vueSelectStyle">
                <template slot="selected-option" slot-scope="option">
                  {{ vueSelectCutOn(option, true) }}
                </template>
                <template slot="no-options">
                  {{ vueSelectNoMatchingOptions }}
                </template>
              </v-select>
            </span>
          </b-form-row>
          <b-form-row class="my-1 ml-2 ml-sm-0">
            <label class="ml-sm-4 ml-2 mr-1">
              {{ $t('label.filter') }}
            </label>
            <b-form-select v-model="vueSelected.filterType" :options="filterTypeOpts" class="ml-2 inputSelect" />
            <span :title="vueSelectTitle(vueSelected.filter)">
              <v-select v-if="vueSelected.filterType == 'potPersons'" v-model="vueSelected.filters" :options="potPersonOpts" multiple :close-on-select="false" class="vue-options-multi" style="width: 400px;">
                <template slot="selected-option" slot-scope="option">
                  {{ vueSelectCutOn(option) }}
                </template>
                <template slot="no-options">
                  {{ vueSelectNoMatchingOptions }}
                </template>
              </v-select>
              <v-select v-else v-model="vueSelected.filter" :options="filterOpts" class="ml-2 inputSelect vue-options" style="width: 400px;">
                <template slot="selected-option" slot-scope="option">
                  {{ vueSelectCutOnWithWidth(option, 400) }}
                </template>
                <template slot="no-options">
                  {{ vueSelectNoMatchingOptions }}
                </template>
              </v-select>
            </span>
          </b-form-row>
          <b-form-row v-if="planMode == 'normal' && currentUser" class="my-1 ml-2 ml-sm-0">
            <b-button class="ml-sm-4 ml-2 mr-1" :variant="theme" @click="onClickSync">{{ $t('label.syncWithOutlook') }}</b-button>
          </b-form-row>
          <b-form-row v-if="planMode == 'meetingRoom'" class="my-1 ml-2 ml-sm-0">
            <b-form-checkbox v-model="doCompare">
              {{ $t('label.planActual') }}
            </b-form-checkbox>
          </b-form-row>
        </b-form>
      </b-row>
      <b-row class="mt-2 mb-2">
        <b-form inline>
          <b-form-row class="my-1 ml-2 ml-sm-0 mr-2">
            <div class="ml-sm-4 ml-2" @click="onClickNavi">
              <b-button :variant="theme" data-action="move-today">{{ $t('label.today') }}</b-button>
              <b-button :variant="theme" data-action="move-prev">&lt;</b-button>
              <b-button :variant="theme" data-action="move-next">&gt;</b-button>
            </div>
          </b-form-row>
          <b-form-row class="my-1 ml-2 ml-sm-0">
            <date-picker
              v-show="true"
              ref="datePicker"
              v-model="today"
              :type="datePickerType"
              :format="datePickerFormat"
              size="large"
              style="width: 11rem;"
              :placeholder="datePickerPlaceholder"
              @blur="onDatePickerBlur"
            />
          </b-form-row>
          <b-form-row v-if="planMode == 'meetingRoom' && doCompare" class="my-1 ml-2 ml-sm-0">
            <label class="ml-sm-4 ml-2 mr-2">
              {{ $t('label.legend') }}
            </label>
            <ul class="list-group list-group-horizontal">
              <li class="list-group-item actualInPlan">{{ $t('label.planned') }}・{{ $t('label.used') }}</li>
              <li class="list-group-item noActual">{{ $t('label.planned') }}・{{ $t('label.noUse') }}</li>
              <li class="list-group-item actualOutOfPlan">{{ $t('label.noPlan') }}・{{ $t('label.used') }}</li>
            </ul>
          </b-form-row>
        </b-form>
      </b-row>
      <plan-calendar :id="id" :name="name" :appServicePath="appServicePath" :planMode="planMode" :headerOpts="headerOpts" :viewModel="viewModel" :dragHandler="dragHandler" :clickScheduleEvent="clickScheduleEvent" :doCompare="doCompare" :holidays="holidays" :working="working" :doUpate="doUpate" @doEdit="doEdit" @doDelete="onDeleteSchedule"/>
      <div>
        <b-modal v-model="showEdit" hide-footer :title="$t('label.schedule')" header-class="editPlanHeader">
          <edit-plan :showEdit="showEdit" :id="id" :name="name" :appServicePath="appServicePath" :currentUser="currentUser" :locale="locale" :plan="targetPlan" :zoneOpts="zoneOpts" :locationOpts="locationOpts" :potPersonOpts="filterPotPersonOpts" :potThingOpts="potThingOpts" :vueSelected="editVueSelected" @doneSave="onEditSave" @delete="onEditDelete"/>
        </b-modal>
      </div>
    </div>
  </div>
</template>
<script>

import moment from 'moment'
import breadcrumb from '../../components/layout/breadcrumb.vue'
import commonmixin from '../../components/mixin/commonmixin.vue'
import editPlan from '../../components/page/edit-plan.vue'
import planCalendar from '../../components/page/plan-calendar.vue'
import * as HttpHelper from '../../sub/helper/base/HttpHelper'
import * as ViewHelper from '../../sub/helper/ui/ViewHelper'
import * as AppServiceHelper from '../../sub/helper/dataproc/AppServiceHelper.js'
import * as LocaleHelper from '../../sub/helper/base/LocaleHelper'
import * as LocalStorageHelper from '../../sub/helper/base/LocalStorageHelper'
import { CATEGORY, UPDATE_ONLY_NN } from '../../sub/constant/Constants'
import { DISP } from '../../sub/constant/config'
import '../../sub/constant/tui/css/tui-calendar.css'
import * as app from '../../sub/calendar/calendar'
import { domevent } from '../../sub/calendar/common/domevent'
import { domutil } from '../../sub/calendar/common/domutil'
import { DatePicker } from 'element-ui'
import { Drag } from '../../sub/calendar/handler/drag'
import { TimeClick } from '../../sub/calendar/handler/time/click'
import { TimeCreation } from '../../sub/calendar/handler/time/creation'
import { TimeMove } from '../../sub/calendar/handler/time/move'
import { TimeResize } from '../../sub/calendar/handler/time/resize'
import {getLogin} from '../../sub/helper/base/LocalStorageHelper'
import alert from '../../components/parts/alert.vue'
import * as MasterHelper from '../../sub/helper/domain/MasterHelper'

export default {
  components: {
    editPlan, breadcrumb, DatePicker, planCalendar, alert
  },
  mixins: [commonmixin],
  data () {
    return {
      name: 'plan',
      id: 'planId',
      appServicePath: '/office/plans',
      breadCrumbs: ViewHelper.createBreadCrumbItems('main', 'plan'),
      currentUser: null,
      currentUserPotIds: [],
      message: '',
      locale: null,
      doUpate: false,
      bgColorIsSet: false,

      clickScheduleEvent: null,

      planMode: 'normal',
      planModeOpts: [
        {value:'normal', label: this.$t('label.planNormalMode')},
        {value:'meetingRoom', label: this.$t('label.planMeetingRoomMode')},
      ],
      planModeFilter: null,
      doCompare: false,
      featureAvailabe: true,

      // datePicker
      datePickerType: 'week',
      datePickerFormatWeek: 'yyyy-MM-dd ' + this.$t('label.week'),
      datePickerFormatDay: 'yyyy-MM-dd',
      datePickerFormat: null,
      datePickerPlaceholderWeek: this.$t('label.week'),
      datePickerPlaceholderDay: this.$t('label.day'),
      datePickerPlaceholder: null,
      planMap: {},
      today: moment().day(1).set({hour:0,minute:0,second:0,millisecond:0}).toDate(),
      preDate: moment().day(1).set({hour:0,minute:0,second:0,millisecond:0}).toDate(),
      doFetchData: false,
      holidays: [],
      working: {},

      // 会議室モード
      headerOpts: [],
      headerOptsWeekSchedule: [],
      headerOptsMeetingRoom: [],
      viewModel: {
        timeLineMap: {},
        timeLineLeftAndWidth: [],
        scheduleViewBoundsMap: {},
      },
      dragHandler: null,
      clickHandler: null, 
      creationHandler: null, 
      moveHandler: null, 
      resizeHandler: null,

      // マスタ情報
      areaOpts: [],
      zoneOpts: [],
      locationOpts: [],
      groupOpts: [],
      categoryOpts: [],
      potOpts: [],
      potPersonOpts: [],
      potThingOpts: [],

      // フィルター
      normalFilterTypeOpts: [
        {value:null, text: ''},
        {value:'areas', text: this.$t('label.area')},
        {value:'zones', text: this.$t('label.zone')},
        {value:'locations', text: this.$t('label.location')},
        {value:'groups', text: this.$t('label.group')},
        {value:'categories', text: this.$t('label.category')},
        {value:'pots', text: this.$t('label.pot')},
        {value:'potPersons', text: this.$t('label.potPerson')},
      ],
      mRoomFilterTypeOpts: [
        {value:null, text: ''},
        {value:'areas', text: this.$t('label.area')},
      ],
      filterTypeOpts: [],
      filterOpts: [],
      selectedFilter: {
        filterType: null,
        filterId: null,
        filterIds: []
      },
      vueSelected: {
        filterType: null,
        filter: null,
        filters: [],
      },

      // 編集モーダル
      showEdit: false,
      targetPlan: {
        planId: null,
        planName: null,
        description: null,
        date: null,
        timeRange: [],
        userId: null,
        userName: null,
        potId: null,
        potName: null,
        zoneId: null,
        locationId: null,
        potThingId: null,
        potPersonIds: [],
        editable: false,
        currentUserPotIds: [],
        isLocation: false,
      },
      editVueSelected: {
        zone: null,
        location: null,
        potThing: null,
        potPersonList: []
      },
    }
  },
  computed: {
    isFeatureAvailabe() {
      return this.featureAvailabe
    },
    filterPotPersonOpts() {
      const doFilter = !this.currentUser ? false : this.currentUser.isAd
        ? this.targetPlan.potId == null || this.targetPlan.potId == this.currentUser.adPot.potId ? true : false
        : this.targetPlan.userId == null || this.targetPlan.userId == this.currentUser.userId ? true : false
      return doFilter
        ? this.potPersonOpts.filter(opt => {
          const potId = opt.value
          return !this.currentUserPotIds.includes(potId)
        })
        : this.potPersonOpts
    },
  },
  watch: {
    showEdit: {
      handler: function(newVal, oldVal) {
        if (!newVal && oldVal) {
          this.creationHandler.clearGuideElement()
        }
      },
      deep: false
    },
    planModeFilter: {
      handler: function(newVal, oldVal){
        if (this.planMode != newVal.value) {
          this.doCompare = false
          const picker = this.$refs.datePicker
          if (newVal.value == 'normal') {
            this.today = moment().day(1).set({hour:0,minute:0,second:0,millisecond:0}).toDate()
            this.filterTypeOpts = this.normalFilterTypeOpts
            this.datePickerType = 'week'
            this.datePickerFormat = this.datePickerFormatWeek
            this.datePickerPlaceholder = this.datePickerPlaceholderWeek
            this.headerOptsWeekSchedule = this.getNormalHeader(moment(this.today).day(0).toDate())
            this.headerOpts = this.headerOptsWeekSchedule
          } else {
            this.today = moment().set({hour:0,minute:0,second:0,millisecond:0}).toDate()
            this.filterTypeOpts = this.mRoomFilterTypeOpts
            this.datePickerType = 'date'
            this.datePickerFormat = this.datePickerFormatDay
            this.datePickerPlaceholder = this.datePickerPlaceholderDay
            this.headerOpts = this.headerOptsMeetingRoom
          }
          this.vueSelected = {
            filterType: newVal.value == 'normal' ? null : 'area',
            filter: null,
            filters: [],
          }
          this.planMode = newVal.value
          this.doFetchData = true
        }
      },
      deep: true,
    },
    'vueSelected.filterType': {
      handler: function(newVal, oldVal){
        this.selectedFilter.filterType = newVal
        this.selectedFilter.filterId = null
        this.selectedFilter.filterIds = []
        this.vueSelected.filter = null
        this.vueSelected.filters = []
        switch (newVal) {
          case 'areas':
            this.filterOpts = this.areaOpts
            break;
          case 'zones':
            this.filterOpts = this.zoneOpts
            break;
          case 'locations':
            this.filterOpts = this.locationOpts
            break;
          case 'groups':
            this.filterOpts = this.groupOpts
            break;
          case 'categories':
            this.filterOpts = this.categoryOpts
            break;
          case 'pots':
            this.filterOpts = this.potOpts
            break;
          default:
            this.filterOpts = []
        }
        if (!newVal) {
          this.fetchData()
        }
      },
      deep: false,
    },
    'vueSelected.filter': {
      handler: function(newVal, oldVal){
        if (!this.doFetchData && this.selectedFilter.filterType && newVal) {
          this.selectedFilter.filterId = newVal.value
          this.fetchData()
        }
      },
      deep: true,
    },
    'vueSelected.filters': {
      handler: function(newVal, oldVal){
        if (!this.doFetchData && this.selectedFilter.filterType && newVal && newVal.length > 0) {
          this.selectedFilter.filterIds = newVal.map(e => e.value)
          this.fetchData()
        }
      },
      deep: true,
    },
    doCompare: {
      handler: function(newVal, oldVal) {
        if (newVal) {
          this.bgColorIsSet = false
        }
        if (this.planMode == 'meetingRoom') {
          this.fetchData()
        }
      },
      deep: false,
    }
  },
  async created() {
    this.datePickerFormat = this.datePickerFormatWeek
    this.datePickerPlaceholder = this.datePickerPlaceholderWeek
    this.planModeFilter = this.planModeOpts[0]
    this.filterTypeOpts = this.normalFilterTypeOpts
    this.loadMaster()
  },
  updated() {
    if (this.doFetchData) {
      this.doFetchData = false
      this.fetchData()
    }
    if (!this.bgColorIsSet && this.planMode == 'meetingRoom' && this.doCompare) {
      this.bgColorIsSet = true
      this.setBgColor()
    }
  },
  async mounted() {
    this.setBgColor()
    this.locale = LocaleHelper.getSystemLocale()
    domevent.on(document.body, 'mousedown', this.onMouseDown, this)
    const tgc = document.getElementById('tgc')
    if (tgc) {
      domevent.on(tgc, 'scroll', this.onScroll, this)
    }
    if (!this.currentUser) {
      this.currentUser = await this.getCurrentUser()
      if (this.currentUser.isAd) {
        this.currentUserPotIds = [this.currentUser.adPot.potId]
      } else {
        if (this.currentUser.potUserList) {
          this.currentUserPotIds = this.currentUser.potUserList.map(e => e.potUserPK.potId)
        }
      }
    }
    this.headerOptsWeekSchedule = this.getNormalHeader(moment(this.today).day(0).toDate())
    this.headerOpts = this.headerOptsWeekSchedule
    this.fetchData()
  },
  methods: {
    setBgColor() {
      document.getElementsByClassName('editPlanHeader').forEach(e => {
        e.style['background-color'] = DISP.PLAN.EDIT_PLAN_HEADER_BG_COLOR
        e.style['border-color'] = DISP.PLAN.EDIT_PLAN_HEADER_BG_COLOR
      })
      document.getElementsByClassName('actualInPlan').forEach(e => {
        e.style['background-color'] = DISP.PLAN.ACTUAL_IN_PLAN_BG_COLOR
      })
      document.getElementsByClassName('noActual').forEach(e => {
        e.style['background-color'] = DISP.PLAN.NO_ACTUAL_IN_PLAN_BG_COLOR
      })
      document.getElementsByClassName('actualOutOfPlan').forEach(e => {
        e.style['background-color'] = DISP.PLAN.ACTUAL_OUT_OF_PLAN_BG_COLOR
      })
    },
    onMouseDown(mouseDownEvent) {
      if (this.clickScheduleEvent) {
        const target = (mouseDownEvent.target || mouseDownEvent.srcElement)
        const popupLayer = domutil.closest(target, '.tui-full-calendar-floating-layer')
        if (popupLayer) {
          return;
        }
        this.clickScheduleEvent = null
      }
    },
    onScroll(event) {
      event.stopPropagation()
      if (this.clickScheduleEvent) {
        this.clickScheduleEvent = null
      }
    },
    // マスタ
    async loadMaster() {
      this.areaOpts = this.areas.map(area => {
        return {value: area.areaId, label: area.areaName}
      })
      this.zoneOpts = this.zones.map(zone => {
        return {value: zone.zoneId, label: zone.zoneName}
      })
      this.locationOpts = this.locations.map(location => {
        return {value: location.locationId, label: location.locationName}
      })
      this.groupOpts = this.groups.map(e => {
        return {value: e.groupId, label: e.groupName}
      })
      this.categoryOpts = MasterHelper.getOptionsFromState('category',
        category => MasterHelper.getDispCategoryName(category),
        true
      )
      this.potOpts = this.pots.map(e => {
        return {value: e.potId, label: e.potName}
      })
      this.potPersonOpts = this.pots.filter(pot => pot.potType == CATEGORY.PERSON).map(pot => {
        return {value: pot.potId, label: pot.potName}
      })
      this.potThingOpts = this.pots.filter(pot => pot.potType == CATEGORY.THING).map(pot => {
        return {value: pot.potId, label: pot.potName}
      })
      this.headerOptsMeetingRoom = this.zones.filter(z => {
        return z.categoryList.map(cate => cate.categoryCd=='MEETING_ROOM').includes(true)
      }).map(zone => {
        return {value: zone.zoneId, label: zone.zoneName}
      }).sort((a, b) => a.value < b.value ? -1 : 1)
    },
    onClickNavi(e) {
      var action = e.target.dataset ? e.target.dataset.action : e.target.getAttribute('data-action')
      const picker = this.$refs.datePicker
      let dt = new Date(picker.value)
      switch (action) {
      case 'move-prev':
        dt = this.planMode == 'normal' ? moment(dt).day(-6).toDate() : moment(dt).add(-1, 'd').toDate()
        break
      case 'move-next':
        dt = this.planMode == 'normal' ? moment(dt).day(8).toDate() : moment(dt).add(1, 'd').toDate()
        break
      case 'move-today':
        dt = this.planMode == 'normal' ? moment().day(1) : moment()
        dt = dt.set({hour:0,minute:0,second:0,millisecond:0}).toDate()
        break
      default:
        return
      }
      if (this.planMode == 'normal') {
        this.headerOptsWeekSchedule = this.getNormalHeader(moment(dt).day(0).toDate())
        this.headerOpts = this.headerOptsWeekSchedule
      }
      picker.emitInput(dt)
      this.fetchData(dt)
      this.preDate = dt
    },
    onDatePickerBlur(e) {
      const picker = this.$refs.datePicker
      let dt = new Date(picker.value)
      dt = this.planMode == 'normal' ? moment(dt).day(1).toDate() : dt
      if (this.preDate.getTime() != dt.getTime()) {
        if (this.planMode == 'normal') {
          this.headerOptsWeekSchedule = this.getNormalHeader(moment(dt).day(0).toDate())
          this.headerOpts = this.headerOptsWeekSchedule
        }
        this.fetchData()
      }
      this.preDate = dt
    },
    getNormalHeader(date) {
      moment.updateLocale(this.locale, {
        weekdays: [this.$t('label.sunday'),this.$t('label.monday'),this.$t('label.tuesday'),this.$t('label.wednesday'),this.$t('label.thursday'),this.$t('label.friday'),this.$t('label.saturday')],
        weekdaysShort: [this.$t('label.sun'),this.$t('label.mon'),this.$t('label.tue'),this.$t('label.wed'),this.$t('label.thu'),this.$t('label.fri'),this.$t('label.sat')],
      }) 
      const sunday = moment(date).day(0)
      return [...Array(7).keys()].map(i => {
        const dt = moment(sunday).add(i, 'd')
        return { 
          value: dt.format('YYYYMMDD'),
          label: dt.format('ddd')
        }
      })
    },
    async getCurrentUser() {
      return await HttpHelper.getAppService(`${this.appServicePath}/currentUser`)
    },
    async fetchData(dt = null) {
      try {
        const startFormat = 'YYYY-MM-DDTHH:mm:00.000'
        const endFormat = 'YYYY-MM-DDT23:59:59.999'
        const mDt = dt ? moment(dt) : moment(this.$refs.datePicker.value)
        let startDt, endDt, headerOpts
        if (this.planMode == 'normal') {
          startDt = mDt.day(0).format(startFormat)
          endDt = mDt.day(6).format(endFormat)
        } else {
          startDt = mDt.format(startFormat)
          endDt = mDt.format(endFormat)
        }
        let query = this.selectedFilter.filterIds.length > 0
          ? `filterType=${this.selectedFilter.filterType}&filterIds=${this.selectedFilter.filterIds}`
          : this.selectedFilter.filterId
            ? `filterType=${this.selectedFilter.filterType}&filterId=${this.selectedFilter.filterId}` 
            : ''
        query = `startDt=${startDt}&endDt=${endDt}&${query}`
        const url = this.doCompare ? `${this.appServicePath}/m-rooms/actuals` : `${this.appServicePath}`
        let data = await HttpHelper.getAppService(`${url}?${query}`)

        this.planMap = {}
        this.viewModel = {}
        if (Array.isArray(data)) {
          this.destoryHandlers()
          const dupMessage = this.$t('label.duplicateSchedule')
          const result = app.loadTimeLine(this.planMode, data, this.currentUser, dupMessage, this.headerOpts, this.doCompare, this.currentUserPotIds)
          this.holidays = data.length > 0 ? data[0].holidays : []
          this.working = data.length > 0 && data[0].workingStart ? this.workingTime(data[0].workingStart, data[0].workingEnd) : {}
          this.planMap = result[0]
          this.viewModel = result[1]
          this.dragHandler = new Drag({distance: 10}, document.getElementById('calendar-layout'))
          this.createHandlers()
          this.doUpate = moment()
        }
      }
      catch(e) {
        console.error(e)
        const message = e.response.data
        if (message == 'noPersonAssociated') {
          this.message = this.$t(`message.${message}`)
          this.featureAvailabe = false
        }
        this.replace({showAlert: true})
        window.scrollTo(0, 0)
      }
    },
    workingTime(start, end) {
      const stHour = parseInt(start.substring(0, 2))
      const stMin = parseInt(start.substring(2, 4))
      const enHour = parseInt(end.substring(0, 2))
      const enMin = parseInt(end.substring(2, 4))

      return {
        start: stHour * 3600000 + stMin * 60000,
        end: enHour * 3600000 + enMin * 60000
      }
    },
    destoryHandlers() {
      if (this.clickHandler) {
        this.clickHandler.destroy()
        this.clickHandler = null
      }
      if (this.creationHandler) {
        this.creationHandler.destroy()
        this.creationHandler = null
      }
      if (this.moveHandler) {
        this.moveHandler.destroy()
        this.moveHandler = null
      }
      if (this.resizeHandler) {
        this.resizeHandler.destroy()
        this.resizeHandler = null
      }
      if (this.dragHandler) {
        this.dragHandler.destroy()
        this.dragHandler = null
      }
    },
    createHandlers() {
      const timeLines = Array.prototype.slice.call(document.getElementsByClassName('tui-full-calendar-time-date'))
      if (timeLines.length > 0) {
        const timeLineElmMap = timeLines.reduce((accum, timeLine) => {
          const headerId = domutil.getData(timeLine, 'id')
          if (headerId) {
            accum[headerId] = timeLine
          }
          return accum
        }, {})
        const dt = this.planMode == 'normal' ? null : this.$refs.datePicker.value
        this.clickHandler = new TimeClick(this.dragHandler, timeLineElmMap, this.planMap)
        if (!this.doCompare) {
          this.creationHandler = new TimeCreation(this.planMode, this.dragHandler, timeLineElmMap, dt)
          this.moveHandler = new TimeMove(this.planMode, this.dragHandler, timeLineElmMap, dt, this.planMap)
          this.resizeHandler = new TimeResize(this.planMode, this.dragHandler, timeLineElmMap, this.planMap, dt)
        }
        this.bindEvent()
      }
    },
    bindEvent() {
      this.clickHandler.on({
        'clickSchedule':(e) => {
          e.triggerEventName = 'click'
          this.clickScheduleEvent = e
        },
      })
      if (this.doCompare) {
        return
      }
      this.creationHandler.on({
        'beforeCreateSchedule': (e) => {
          this.onCreateSchedule(e)
        },
      })
      this.moveHandler.on({
        'beforeUpdateSchedule': (e) => {
          this.onDragSchedule(e)
        },
      })
      this.resizeHandler.on({
        'beforeUpdateSchedule': (e) => {
          this.onDragSchedule(e)
        },
      })
    },
    initEdit() {
      this.targetPlan.planId = null
      this.targetPlan.planName = null
      this.targetPlan.description = null
      this.targetPlan.date = null
      this.targetPlan.timeRange = []
      this.targetPlan.userId = null
      this.targetPlan.userName = null
      this.targetPlan.potId = null
      this.targetPlan.potName = null
      this.targetPlan.zoneId = null
      this.targetPlan.locationId = null
      this.targetPlan.potThingId = null
      this.targetPlan.potPersonIds = []
      this.targetPlan.editable = false
      this.targetPlan.currentUserPotIds = []
      this.targetPlan.isLocation = false
      this.editVueSelected.zone = null
      this.editVueSelected.location = null
      this.editVueSelected.potThing = null
      this.editVueSelected.potPersonList = []
      this.showEdit = false
    },
    onCreateSchedule(event) {
      this.initEdit()
      this.targetPlan.date = moment(event.start).format("YYYY-MM-DD")
      this.targetPlan.timeRange = [moment(event.start).format("HH:mm:00"), moment(event.end).format("HH:mm:00")]
      if (this.currentUser.isAd) {
        this.targetPlan.potId = this.currentUser.adPot.potId
        this.targetPlan.potName = this.currentUser.adPot.potName
      } else {
        this.targetPlan.userId = this.currentUser.userId
        this.targetPlan.userName = this.currentUser.name
      }
      
      this.targetPlan.editable = true
      this.targetPlan.currentUserPotIds = this.currentUserPotIds
      if (event.hasOwnProperty('headerId')) {
        if (this.planMode == 'meetingRoom') {
          this.editVueSelected.zone = this.zoneOpts.filter((e) => e.value == event.headerId)[0]
        }
      }
      this.showEdit = true
      return event
    },
    doEdit(e) {
      this.clickScheduleEvent = null
      this.onEditSchedule(e, true)
    },
    onEditSchedule(event, isClick, headerId = null) {
      this.initEdit()
      const plan = this.planMap[event.schedule.id].data
      this.targetPlan.planId = plan.planId
      this.targetPlan.planName = plan.planName
      this.targetPlan.description = plan.description
      this.targetPlan.date = isClick ? new Date(plan.startDt) : event.start
      this.targetPlan.timeRange = isClick 
        ? [moment(new Date(plan.startDt)).format("HH:mm:00"), moment(new Date(plan.endDt)).format("HH:mm:00")] 
        : [moment(event.start).format("HH:mm:00"), moment(event.end).format("HH:mm:00")]
      this.targetPlan.userId = plan.userId
      this.targetPlan.userName = plan.userName
      this.targetPlan.potId = plan.userPotId
      this.targetPlan.potName = plan.userPotName
      this.targetPlan.currentUserPotIds = this.currentUserPotIds
      const self = this
      plan.details.forEach((e) => {
        if (e.targetType == 0) {
          self.targetPlan.zoneId = this.planMode == 'meetingRoom' && headerId ? headerId : e.zoneId
          self.targetPlan.isLocation = false
        }
        if (e.targetType == 1) {
          self.targetPlan.locationId = e.locationId
          self.targetPlan.isLocation = true
        }
        if (e.targetType == 2) {
          self.targetPlan.potThingId = e.potId
        }
        if (e.targetType == 3) {
          self.targetPlan.potPersonIds.push(e.potId)
        }
      })
      
      if (!isClick) {
        const potPersonIds = this.targetPlan.potPersonIds
        this.targetPlan.potPersonIds = potPersonIds.join()
        return
      }

      let arr = this.zoneOpts.filter(opt => opt.value == this.targetPlan.zoneId)
      this.editVueSelected.zone = arr.length == 1 ? arr[0] : null

      arr = this.locationOpts.filter(opt => opt.value == this.targetPlan.locationId)
      this.editVueSelected.location = arr.length == 1 ? arr[0] : null

      arr = this.potThingOpts.filter(opt => opt.value == self.targetPlan.potThingId)
      this.editVueSelected.potThing = arr.length == 1 ? arr[0] : null

      arr = this.potPersonOpts.filter(e => {
        return this.targetPlan.potPersonIds.includes(e.value)
      })
      if (this.currentUser.isAd) {
        if (this.targetPlan.potId == this.currentUser.adPot.potId) {
          arr = arr.filter(e => !this.currentUserPotIds.includes(e.value))
        }
      } else {
        if (this.targetPlan.userId == this.currentUser.userId) {
          arr = arr.filter(e => !this.currentUserPotIds.includes(e.value))
        }
      }
      this.editVueSelected.potPersonList = arr

      this.targetPlan.editable = this.currentUser.isAd 
        ? this.currentUser.adPot.adId == plan.adId ? true : false
        : this.currentUser.userId == plan.userId ? true : false
      this.showEdit = true
    },
    async onDragSchedule(e) {
      if (e.hasOwnProperty('headerId')) {
        this.onEditSchedule(e, false, e.headerId)
      } else {
        this.onEditSchedule(e, false)
      }
      this.targetPlan.startDt = e.start
      this.targetPlan.endDt = e.end
      try {
        const result = await AppServiceHelper.update(this.appServicePath, this.targetPlan)
        this.fetchData()
      }
      catch(e) {
        console.error(e)
        this.message = e.response.data
        this.replace({showAlert: true})
        window.scrollTo(0, 0)
      }
    },
    onEditError(message) {
      this.showEdit = false
      this.message = message
      this.replace({showAlert: true})
      window.scrollTo(0, 0)
    },
    onEditSave(message) {
      this.showEdit = false
      this.message = message
      this.replace({showInfo: true})
      setTimeout(() => {
        this.fetchData()
      }, 500);
    },
    onEditDelete(e) {
      this.showEdit = false
      this.onDeleteSchedule(e)
    },
    async onDeleteSchedule(event) {
      this.clickScheduleEvent = null
      try {
        await AppServiceHelper.deleteEntity(this.appServicePath, event.schedule.data.planId)
        this.fetchData()
      }
      catch(e) {
        console.error(e)
        this.message = e.response.data
        this.replace({showAlert: true})
        window.scrollTo(0, 0)
      }
    },
    async onClickSync() {
      const login =  getLogin()
      const region = login.currentRegion
      const batch = {
        tenantId: login.currentTenant.tenantId,
        regionId: region.regionId,
        meshId: region.meshId,
        batchTarget: 'AD_SYNC',
        expired: moment().add(10, 's').valueOf(),
        param: '',
        batchType: 'CRON'
      }
      const queueName = 'CRON'
      const stopAfter = 10
      const path = `/meta/tenant/publishTask?updateOnlyNN=${UPDATE_ONLY_NN.NONE}&queueName=${queueName}&stopAfter=${stopAfter}&_=${new Date().getTime()}`
      let result = await HttpHelper.putAppService(path, batch)
    }
  }
}
</script>
<style>
.editPlanHeader {
  color: #ffffff;
  font-weight: bold;
}
.tui-full-calendar-week-container {
  width: 100%;
  height: inherit;
  display: inline-block;
  font-size: 10px;
  min-height: 470px;
}
.tui-full-calendar-month {
  height: 100%;
  min-height: 470px;
}
.tui-full-calendar-section-title input {
  width: 364px;
}
.tui-full-calendar-button.tui-full-calendar-section-private {
  height: 32px;
  padding: 8px;
  font-size: 0;
  margin-left: 3px;
}
.tui-full-calendar-section-start-date input,
.tui-full-calendar-section-end-date input {
  width: 138px;
}
.tui-full-calendar-popup-edit,
.tui-full-calendar-popup-delete {
  display: inline-block;
  padding: 9px 9px 0px 9px;
  width: calc(50% - 2px);
  outline: none;
  background: none;
  border: none;
  cursor: pointer;
}
.list-group-item {
  line-height: 10px;
}
.actualInPlan {
  color: black;
}

.noActual {
  color: black;
}

.actualOutOfPlan {
  color: black;
}
</style>