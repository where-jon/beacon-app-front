<template>
  <div class="container" :style="cssVars">
    <breadcrumb :items="items" :reload="false" />
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
            <v-select v-if="vueSelected.filterType == 'potPerson'" v-model="vueSelected.filters" :options="potPersonOpts" multiple :close-on-select="false" class="vue-options-multi">
              <template slot="selected-option" slot-scope="option">
                {{ vueSelectCutOn(option) }}
              </template>
              <template slot="no-options">
                {{ vueSelectNoMatchingOptions }}
              </template>
            </v-select>
            <v-select v-else v-model="vueSelected.filter" :options="filterOpts" class="ml-2 inputSelect vue-options" :style="vueSelectStyle">
              <template slot="selected-option" slot-scope="option">
                {{ vueSelectCutOn(option) }}
              </template>
              <template slot="no-options">
                {{ vueSelectNoMatchingOptions }}
              </template>
            </v-select>
          </span>
        </b-form-row>
        <b-form-row v-if="planMode == 'normal' && currentUser && currentUser.role.roleName == 'SYS_ADMIN'" class="my-1 ml-2 ml-sm-0">
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
            ref="datePicker"
            v-show="true"
            v-model="today"
            :type="datePickerType"
            :format="datePickerFormat"
            size="large"
            style="width: 170px;"
            :placeholder="datePickerPlaceholder"
            @blur="onDatePickerBlur"
            >
          </date-picker>
        </b-form-row>
        <b-form-row v-if="planMode == 'meetingRoom' && doCompare" class="my-1 ml-2 ml-sm-0">
          <label class="ml-sm-4 ml-2 mr-2">
            {{ '判例' }}
          </label>
          <ul class="list-group list-group-horizontal">
            <li class="list-group-item actual-in-plan">予定有・利用有</li>
            <li class="list-group-item no-actual">予定有・利用無</li>
            <li class="list-group-item actual-out-of-plan">予定無・利用有</li>
          </ul>
        </b-form-row>
      </b-form>
    </b-row>
    <plan-calendar :name="name" :id="id" :appServicePath="appServicePath" :planMode="planMode" :currentUser="currentUser" :headerOpts="headerOpts" :viewModel="viewModel" :dragHandler="dragHandler" :clickScheduleEvent="clickScheduleEvent" :mgViewModel="mgViewModel" :doCompare="doCompare" @doEdit="doEdit" @doDelete="onDeleteSchedule">
    </plan-calendar>
    <div>
      <b-modal id="editPlanModal" v-model="showEdit" 
        hide-footer
        :title="$t('label.schedule')"
        header-class="editPlanHeader"
      >
      <edit-plan :name="name" :id="id" :appServicePath="appServicePath" :currentUser="currentUser" :plan="targetPlan" :zoneOpts="zoneOpts" :locationOpts="locationOpts" :potPersonOpts="filterPotPersonOpts" :potThingOpts="potThingOpts" :vueSelected="editVueSelected" @doneSave="onEditSave" @delete="onEditDelete"/>
      </b-modal>
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
import * as StateHelper from '../../sub/helper/dataproc/StateHelper'
import * as AppServiceHelper from '../../sub/helper/dataproc/AppServiceHelper.js'
import * as LocaleHelper from '../../sub/helper/base/LocaleHelper'
import * as Util from '../../sub/util/Util'
import { CATEGORY, UPDATE_ONLY_NN } from '../../sub/constant/Constants'
import { DISP } from '../../sub/constant/config'
import '../../sub/constant/tui/css/tui-calendar.css'
// import '../../sub/constant/tui/css/icons.css'
import * as app from '../../sub/calendar/calendar'
import { domevent } from '../../sub/calendar/common/domevent'
import { domutil } from '../../sub/calendar/common/domutil'
import { DatePicker } from 'element-ui'
import { Drag } from '../../sub/calendar/handler/drag'
import { TimeClick } from '../../sub/calendar/handler/time/click'
import { TimeCreation } from '../../sub/calendar/handler/time/creation'
import { TimeMove } from '../../sub/calendar/handler/time/move'
import { TimeResize } from '../../sub/calendar/handler/time/resize'
import * as BrowserUtil from '../../sub/util/BrowserUtil'
import {getLogin} from '../../sub/helper/base/LocalStorageHelper'

export default {
  mixins: [commonmixin],
  components: {
    editPlan, breadcrumb, DatePicker, planCalendar
  },
  data () {
    return {
      name: 'plan',
      id: 'planId',
      appServicePath: '/office/plans',
      items: ViewHelper.createBreadCrumbItems('main', 'plan'),
      currentUser: null,
      currentUserPotIds: [],

      moveGuideHandler: null,
      mgViewModel: null,
      clickScheduleEvent: null,

      planMode: 'normal',
      planModeOpts: [
        {value:'normal', label: this.$t('label.planNormalMode')},
        {value:'meetingRoom', label: this.$t('label.planMeetingRoomMode')},
      ],
      planModeFilter: null,
      doCompare: false,

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
      loadStates: ['areas', 'zones', 'locations', 'groups', 'categories', 'pots'],
      options: [],
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
        {value:'potPerson', text: this.$t('label.potPerson')},
      ],
      mRoomFilterTypeOpts: [
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
    zoneOpts() {
      return this.options['zones']
    },
    locationOpts() {
      return this.options['locations']
    },
    cssVars() {
      return {
      '--editPlanHeaderBgColor': DISP.PLAN.EDIT_PLAN_HEADER_BG_COLOR,
      '--actualInPlanBgColor': DISP.PLAN.ACTUAL_IN_PLAN_BG_COLOR,
      '--noActualBgColor': DISP.PLAN.NO_ACTUAL_IN_PLAN_BG_COLOR,
      '--actualOutOfPlanBgColor': DISP.PLAN.ACTUAL_OUT_OF_PLAN_BG_COLOR,
      }
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
    planModeFilter: {
      handler: function(newVal, oldVal){
        if (this.planMode != newVal.value) {
          this.doCompare = false
          const picker = this.$refs.datePicker
          let dt = new Date(picker.value)
          if (newVal.value == 'normal') {
            this.filterTypeOpts = this.normalFilterTypeOpts
            this.datePickerType = 'week'
            this.datePickerFormat = this.datePickerFormatWeek
            this.datePickerPlaceholder = this.datePickerPlaceholderWeek
            dt = moment(dt).day(1).toDate()
            this.headerOptsWeekSchedule = this.getNormalHeader(moment(dt).day(0).toDate())
            this.headerOpts = this.headerOptsWeekSchedule
          } else {
            this.filterTypeOpts = this.mRoomFilterTypeOpts
            this.datePickerType = 'date'
            this.datePickerFormat = this.datePickerFormatDay
            this.datePickerPlaceholder = this.datePickerPlaceholderDay
            this.headerOpts = this.headerOptsMeetingRoom
          }
          picker.emitInput(dt)
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
        this.selectedFilter.filterId = null
        this.selectedFilter.filterIds = []
        this.vueSelected.filter = null
        this.vueSelected.filters = []
        this.filterOpts = this.loadStates.includes(newVal) ? this.options[newVal] : []
        console.log('!!!', this.filterOpts)
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
  },
  async mounted() {
    domevent.on(document.body, 'mousedown', this.onMouseDown, this);
    if (!this.currentUser) {
      this.currentUser = await AppServiceHelper.getCurrentUser()
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
    // マスタ
    async loadMaster() {
      await this.loadStates.map(state => StateHelper.load(state))
      this.potPersonOpts = this.pots.filter(pot => pot.potType == CATEGORY.PERSON).map(pot => {
        return {value: pot.potId, label: pot.potName}
      })
      this.potThingOpts = this.pots.filter(pot => pot.potType == CATEGORY.THING).map(pot => {
        return {value: pot.potId, label: pot.potName}
      })
      this.headerOptsMeetingRoom = this.zones.filter(z => {
        return z.categoryList.map(cate => cate.categoryCd=='MEETING_ROOM').includes(true)
      })
      this.makeOpts()
    },
    async makeOpts() {
      this.loadStates.forEach( st => {
        this.options[st] = this[st].map( e => {
          switch (st) {
          case 'areas': 
            return {value: e.areaId, label: e.areaName}
          case 'zones': 
            return {value: e.zoneId, label: e.zoneName}
          case 'locations': 
            return {value: e.locationId, label: e.locationName}
          case 'groups': 
            return {value: e.groupId, label: e.groupName}
          case 'categories': 
            return {value: e.categoryId, label: e.categoryName}
          case 'pots': 
            return {value: e.potId, label: e.potName}
          }
        })
      })
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
          return;
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
      if (LocaleHelper.getSystemLocale() == 'ja') {
        moment.updateLocale('ja', {
            weekdays: ["日曜日","月曜日","火曜日","水曜日","木曜日","金曜日","土曜日"],
            weekdaysShort: ["日","月","火","水","木","金","土"],
        }) 
      }
      const sunday = moment(date).day(0)
      return [...Array(7).keys()].map(i => {
        const dt = moment(sunday).add(i, 'd')
        return { 
          value: dt.format('YYYYMMDD'),
          label: dt.format('ddd')
        }
      })
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
          this.planMap = result[0]
          this.viewModel = result[1]
          this.dragHandler = new Drag({distance: 10}, document.getElementById('calendar-layout'))
          this.createHandlers()
        }
      }
      catch(err) {
        console.error(err)
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
      const result = await AppServiceHelper.update(this.appServicePath, this.targetPlan)
      this.fetchData()
    },
    onEditSave(event) {
            this.showEdit = false
      const self = this
      setTimeout(() => {
        self.fetchData()
      }, 500);
    },
    onEditDelete(e) {
      this.showEdit = false
      this.onDeleteSchedule(e)
    },
    async onDeleteSchedule(event) {
      this.clickScheduleEvent = null
      await AppServiceHelper.deleteEntity(this.appServicePath, event.schedule.data.planId)
      this.fetchData()
    },
    async onClickSync() {
      const login =  getLogin()
      const region = login.currentRegion
      const batch = {
        tenantId: login.currentTenant.tenantId,
        regionId: region.regionId,
        meshId: region.meshId,
        batchTarget: 'AD_SYNC',
        expired: -1,
        param: '',
        batchType: 'INTERVAL'
      }
      const queueName = 'INTERVAL'
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
  background-color: var(--editPlanHeaderBgColor);
  border-color: var(--editPlanHeaderBgColor);
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
.actual-in-plan {
  background-color: var(--actualInPlanBgColor);
  color: white;
}

.no-actual {
  background-color: var(--noActualBgColor);
  color: white;
}

.actual-out-of-plan {
  background-color: var(--actualOutOfPlanBgColor);
  color: white;
}
</style>