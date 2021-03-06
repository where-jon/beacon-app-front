<template>
  <!-- height設定 -->
  <div id="vlayout-area" class="tui-full-calendar-vlayout-area tui-full-calendar-vlayout-container">
    <div id="tgc" class="tui-full-calendar-timegrid-container">
      <!-- left -->
      <div id="tg-left" class="tui-full-calendar-timegrid-left" :style="{width: styles.leftWidth, 'font-size': styles.leftFontSize}">
        <div class="tui-full-calendar-timegrid-timezone" :style="{position: 'absolute', top: 0, width: '100%', left: '0%', 'border-right': styles.leftBorderRight, 'background-color': styles.displayTimezoneLabelBackgroundColor}">
          <div v-for="(timeSlot, idx) in timeSlots" :key="idx" class="tui-full-calendar-timegrid-hour" :style="{height: styles.oneHourHeight}">
            <span style="{color: 'black'}">{{ timeSlot.label }}</span>
          </div>
        </div>
      </div>
      <!-- right -->
      <div id='tgScrl' class="tui-full-calendar-timegrid-right sync-scroll" :style="{'margin-left': styles.leftWidth}" @scroll="handleScroll">
          <div id="wt-tg-s" class="wt-timegrid-schedules">
            <div v-for="(headerOpt, idx) in headerOpts" :key="idx" class="wt-time-date" :style="workingTimeDateStyle(headerOpt.value)">
            </div>
          </div>
          <div id="tg-h-g" class="tui-full-calendar-timegrid-h-grid">
            <div v-for="(timeSlot, idx) in timeSlots" :key="idx" class="tui-full-calendar-timegrid-gridline" :style="{height: styles.oneHourHeight}">
              <div class="tui-full-calendar-timegrid-gridline-half" :style="{height: styles.halfHourHeight, 'border-bottom': styles.halfHourBorderBottomone}"></div>
            </div>
          </div>
          <div id="tg-s" class="tui-full-calendar-timegrid-schedules">
            <div class="tui-full-calendar-timegrid-schedules-container">
              <div v-for="(headerOpt, idx) in headerOpts" :key="idx" class="tui-full-calendar-time-date" :data-id="headerOpt.value" :style="timeDateStyle(headerOpt.value, headerOpts.length-1 == idx)">
                <time-panel-compare v-if="doCompare" :headerId="headerOpt.value" :viewModel="viewModel">
                </time-panel-compare>
                <time-panel v-if="!doCompare" :isToday="today == headerOpt.value" :headerId="headerOpt.value" :viewModel="viewModel">
                </time-panel>
              </div>
            </div>
          </div>
          <div v-if="showHourMarker && planMode == 'normal'" class="tui-full-calendar-timegrid-hourmarker" :style="getTopWidthByTime()">
            <div class="tui-full-calendar-timegrid-hourmarker-line-left" :style="{width: todaymarkerLeft + 'px', 'border-top': styles.currentTimeLeftBorderTop}"></div>
            <div class="tui-full-calendar-timegrid-todaymarker" :style="{left: todaymarkerLeft + 'px', 'background-color': styles.currentTimeBulletBackgroundColor}">today</div>
            <div class="tui-full-calendar-timegrid-hourmarker-line-today" :style="{left: todaymarkerLeft + 'px', width: todaymarkerWidth + 'px', 'border-top': styles.currentTimeTodayBorderTop}"></div>
            <div class="tui-full-calendar-timegrid-hourmarker-line-right" :style="{left: todaymarkerRight + 'px', 'border-top': styles.currentTimeRightBorderTop}"></div>
          </div>
          <div v-if="showHourMarker && planMode == 'meetingRoom'" class="tui-full-calendar-timegrid-hourmarker" :style="getTopWidthByTime()">
            <div class="tui-full-calendar-timegrid-hourmarker-line-today" :style="{width: '100%', 'border-top': styles.currentTimeTodayBorderTop}"></div>
          </div>
          <div v-if="showHourMarker && planMode == 'meetingRoom' && doCompare" class="tui-full-calendar-timegrid-hourmarker" :style="getTopWidthByTime(true)">
            <div :style="{width: '100%', height: styles.oneHourHeight, backgroundColor: '#e5e5e5'}"></div>
          </div>
      </div>
    </div>
    <div class="tui-full-calendar-timegrid-sticky-container" style="display: none;">
    </div>
  </div>
</template>
<script>
import * as BrowserUtil from '../../../sub/util/BrowserUtil'
import '../../../sub/constant/tui/css/tui-calendar.css'
import { Theme } from '../../../sub/calendar/theme/theme'
import moment from 'moment'
import timePanel from './time-panel.vue'
import timePanelCompare from './time-panel-compare.vue'
import * as chroma from 'chroma-js'

export default {
  components: {
    timePanel, timePanelCompare
  },
  props: {
    planMode: null,
    headerOpts: null,
    timeSlots: null,
    viewModel: null,
    doCompare: null,
    holidays: null,
    working: null,
    doUpate: null,
  },
  data () {
    return {
      styles: {},
      theme: null,
      now: new Date(),
      today: moment().format('YYYYMMDD'),
      showHourMarker: false,
      todaymarkerLeft: 0,
      todaymarkerWidth: 0,
      todaymarkerRight: 0,
      workingBgColor: chroma('#edebe9').alpha(0.25),
    }
  },
  computed: {
    timeDateStyle() {
      return (headerId, isLast) => {
        const lw = this.viewModel.timeLineLeftAndWidth
        return {
          left: (lw[headerId] ? lw[headerId].left : 0) + 'px',
          width: (lw[headerId] ? lw[headerId].width : 0) + 'px',
          'border-right': isLast ? 'none' : this.styles.borderRight,
        }
      }
    },
    workingTimeDateStyle() {
      return (headerId) => {
        let isHoliday = false
        if (this.holidays) {
          isHoliday = this.holidays.includes(headerId)
        }
        const baseMS = 24 * 60 * 60 * 1000
        const baseHeight = 1248

        let start = !isHoliday && this.working ? this.working.start : 0
        let end = !isHoliday && this.working ? this.working.end : 0

        const duration = end - start
        const top = (baseHeight * start) / baseMS
        const height = (baseHeight * duration) / baseMS

        const lw = this.viewModel.timeLineLeftAndWidth
        return {
          left: (lw[headerId] ? lw[headerId].left : 0) + 'px',
          width: (lw[headerId] ? lw[headerId].width : 0) + 'px',
          top: `${top}px`,
          height: `${height}px`,
          backgroundColor: this.workingBgColor
        }
      }
    }
  },
  watch: {
    doUpate: {
      handler: function(newVal, oldVal) {
        this.getTodaymarkerLeft()
        this.setCalendarHeight()
      },
      deep: false
    },
  },
  mounted() {
    this.theme = new Theme()
    this.styles = this.getStyles()
  },
  methods: {
    handleScroll(e) {
      this.$emit('handleScroll', 'tgScrl')
    },
    setCalendarHeight() {
      const container = document.getElementById('vlayout-area')
      if (BrowserUtil.isAndroidOrIOS()) {
        container.style.height = '250px'
      } else {
        const h = document.documentElement.clientHeight - container.getBoundingClientRect().top - 30
        container.style.height = `${h}px`
      }
    },
    getTodaymarkerLeft() {
      const lw = this.viewModel.timeLineLeftAndWidth
      const today = this.today
      if (this.planMode == 'normal') {
        this.todaymarkerLeft = lw[today] ? lw[today].left : 0
        this.todaymarkerWidth = lw[today] ? lw[today].width : 0
        this.todaymarkerRight = this.todaymarkerLeft + this.todaymarkerWidth
        this.showHourMarker = this.todaymarkerLeft > 0
      } else {
        const picker = this.$parent.$parent.$refs.datePicker
        const d = moment(picker.value).format('YYYYMMDD')
        this.showHourMarker = this.today == d
      }
    },
    getTopWidthByTime(isUnavailable
 = false) {
      const lw = this.viewModel.timeLineLeftAndWidth
      const w = Object.keys(lw).reduce((accum, k) => {
        accum += lw[k] ? lw[k].width : 0
        return accum
      }, 0)
      const time = isUnavailable ? moment(this.now).add(-1, 'h').toDate() : this.now
      const maxMilliseconds = 24 * 3600000
      const hmsMilliseconds = time.getHours() * 60 * 60 * 1000 
        + time.getMinutes() * 60 * 1000 
        + time.getSeconds() * 1000
        + time.getMilliseconds()
      let topPercent = 100 * hmsMilliseconds / maxMilliseconds
      topPercent = topPercent < 0 ? 0 : topPercent
      topPercent = 100 < topPercent ? 100 : topPercent
      return {top: topPercent + '%', width: w + 'px'}
    },
    getStyles() {
      const theme = this.theme
      const styles = {}

      if (theme) {
        styles.borderBottom = theme.week.timegridHorizontalLine.borderBottom || theme.common.border
        styles.halfHourBorderBottom = theme.week.timegridHalfHour.borderBottom || theme.common.border

        styles.todayBackgroundColor = theme.week.today.backgroundColor
        styles.weekendBackgroundColor = theme.week.weekend.backgroundColor
        styles.backgroundColor = theme.week.daygrid.backgroundColor
        styles.leftWidth = theme.week.timegridLeft.width
        styles.leftBackgroundColor = theme.week.timegridLeft.backgroundColor
        styles.leftBorderRight = theme.week.timegridLeft.borderRight || theme.common.border
        styles.leftFontSize = theme.week.timegridLeft.fontSize
        styles.timezoneWidth = theme.week.timegridLeft.width
        styles.additionalTimezoneBackgroundColor = theme.week.timegridLeftAdditionalTimezone.backgroundColor || styles.leftBackgroundColor

        styles.displayTimezoneLabelHeight = theme.week.timegridLeftTimezoneLabel.height
        styles.displayTimezoneLabelBackgroundColor = theme.week.timegridLeft.backgroundColor === 'inherit' ? 'white' : theme.week.timegridLeft.backgroundColor

        styles.oneHourHeight = theme.week.timegridOneHour.height
        styles.halfHourHeight = theme.week.timegridHalfHour.height
        styles.quaterHourHeight = (parseInt(styles.halfHourHeight, 10) / 2) + 'px'

        styles.currentTimeColor = theme.week.currentTime.color
        styles.currentTimeFontSize = theme.week.currentTime.fontSize
        styles.currentTimeFontWeight = theme.week.currentTime.fontWeight

        styles.pastTimeColor = theme.week.pastTime.color
        styles.pastTimeFontWeight = theme.week.pastTime.fontWeight

        styles.futureTimeColor = theme.week.futureTime.color
        styles.futureTimeFontWeight = theme.week.futureTime.fontWeight

        styles.currentTimeLeftBorderTop = theme.week.currentTimeLinePast.border
        styles.currentTimeBulletBackgroundColor = theme.week.currentTimeLineBullet.backgroundColor
        styles.currentTimeTodayBorderTop = theme.week.currentTimeLineToday.border
        styles.currentTimeRightBorderTop = theme.week.currentTimeLineFuture.border

        styles.borderRight = theme.week.timegrid.borderRight || theme.common.border

        styles.halfHourBorderBottomone = '1px dashed #e5e5e5'
      }

      return styles
    }
  }
}
</script>
<style>
.tui-full-calendar-vlayout-container {
  position: relative;
  border-left: 1px solid #e5e5e5;
  border-right: 1px solid #e5e5e5;
  border-bottom: 1px solid #e5e5e5;
}
.tui-full-calendar-timegrid-hour span {
  position: absolute;
  top: -11px;
  left: 0;
  right: 0;
  text-align: center;
  line-height: 25px;
}
.wt-timegrid-schedules {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  cursor: pointer;
}
.wt-time-date {
  position: absolute;
  height: 100%;
  margin-left: -1px;
  box-sizing: content-box;
}
</style>