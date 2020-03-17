<template>
  <!-- height設定 -->
  <div id="vlayout-area" class="tui-full-calendar-vlayout-area tui-full-calendar-vlayout-container">
    <div class="tui-full-calendar-timegrid-container">
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
          <div id="tg-h-g" class="tui-full-calendar-timegrid-h-grid">
            <div v-for="(timeSlot, idx) in timeSlots" :key="idx" class="tui-full-calendar-timegrid-gridline" :style="{height: styles.oneHourHeight}">
              <div class="tui-full-calendar-timegrid-gridline-half" :style="{height: styles.halfHourHeight, 'border-bottom': styles.halfHourBorderBottomone}"></div>
            </div>
          </div>
          <div id="tg-s" class="tui-full-calendar-timegrid-schedules">
            <div class="tui-full-calendar-timegrid-schedules-container">
              <div v-for="(headerOpt, idx) in headerOpts" :key="idx" :class="idx == headerOpts.length-1 ? 'tui-full-calendar-time-date-last' : 'tui-full-calendar-time-date'" :data-id="headerOpt.value" :style="timeDateStyle(headerOpt.value)">
                <time-panel-compare v-if="doCompare" :headerId="headerOpt.value" :viewModel="viewModel">
                </time-panel-compare>
                <time-panel v-if="!doCompare" :isToday="today == headerOpt.value" :headerId="headerOpt.value" :viewModel="viewModel">
                </time-panel>
              </div>
            </div>
          </div>
          <div v-if="showHourMarker && planMode == 'normal'" class="tui-full-calendar-timegrid-hourmarker" :style="{top: getTopPercentByTime() + '%'}">
            <div class="tui-full-calendar-timegrid-hourmarker-line-left" :style="{width: todaymarkerLeft + '%', 'border-top': styles.currentTimeLeftBorderTop}"></div>
            <div class="tui-full-calendar-timegrid-todaymarker" :style="{left: todaymarkerLeft + '%', 'background-color': styles.currentTimeBulletBackgroundColor}">today</div>
            <div class="tui-full-calendar-timegrid-hourmarker-line-today" :style="{left: todaymarkerLeft + '%', width: todaymarkerWidth + '%', 'border-top': styles.currentTimeTodayBorderTop}"></div>
            <div class="tui-full-calendar-timegrid-hourmarker-line-right" :style="{left: todaymarkerRight + '%', 'border-top': styles.currentTimeRightBorderTop}"></div>
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
      todaymarkerRight: 0
    }
  },
  computed: {
    timeDateStyle() {
      return (headerId) => {
        const lw = this.viewModel.timeLineLeftAndWidth
        return {
          left: (lw[headerId] ? lw[headerId].left : 0) + '%',
          width: (lw[headerId] ? lw[headerId].width : 0) + '%',
          'border-right': this.styles.borderRight,
        }
      }
    }
  },
  mounted() {
    this.theme = new Theme()
    this.styles = this.getStyles()
  },
  updated() {
    this.getTodaymarkerLeft()
    this.setCalendarHeight()
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
      this.todaymarkerLeft = lw[today] ? lw[today].left : 0
      this.todaymarkerWidth = lw[today] ? lw[today].width : 0
      this.todaymarkerRight = this.todaymarkerLeft + this.todaymarkerWidth
      this.showHourMarker = this.todaymarkerLeft > 0
    },
    getTopPercentByTime() {
      const time = this.now
      const maxMilliseconds = 24 * 3600000
      const hmsMilliseconds = time.getHours() * 60 * 60 * 1000 
        + time.getMinutes() * 60 * 1000 
        + time.getSeconds() * 1000
        + time.getMilliseconds()
      let topPercent = 100 * hmsMilliseconds / maxMilliseconds
      topPercent = topPercent < 0 ? 0 : topPercent
      topPercent = 100 < topPercent ? 100 : topPercent
      return topPercent
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
</style>