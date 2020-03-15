<template>
  <div class="tui-full-calendar-dayname-layout">
    <div ref="daynameContainer" class="tui-full-calendar-dayname-container">
      <div class="tui-full-calendar-dayname-leftmargin" :style="{'margin-left': styles.marginLeft}">
        <div v-for="(headerOpt, idx) in headerOpts" :key="idx" :class="className(headerOpt)" :style="style(headerOpt)">
          <span class="tui-full-calendar-dayname-date-area" :style="color(headerOpt)">
            <span class="tui-full-calendar-dayname-date">{{ date(headerOpt) }}</span>&nbsp;&nbsp;
            <span v-if="planMode == 'normal'" class="tui-full-calendar-dayname-name">{{ headerOpt.label }}</span>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import '../../../sub/constant/tui/css/tui-calendar.css'
import { Theme } from '../../../sub/calendar/theme/theme'
import moment from 'moment'

export default {
  props: {
    planMode: null,
    headerOpts: null,
    timeLineLeftAndWidth: null,
  },
  data () {
    return {
      styles: {},
      theme: null,
      today: moment().set({hour:0,minute:0,second:0,millisecond:0})
    }
  },
  computed: {
    style() {
      return (headerOpt) => {
        const lw = this.timeLineLeftAndWidth
        const val = headerOpt.value
        return {
          width: (lw[val] ? lw[val].width : 0) + '%',
          left: (lw[val] ? lw[val].left : 0) + '%',
          'line-height': this.styles.height,
          'border-left': this.styles.borderLeft,
          'padding-left': this.styles.paddingLeft
        }
      }
    },
    className() {
      return (headerOpt) => {
        let className = 'tui-full-calendar-dayname'
        if (this.planMode == 'normal') {
          const dt = moment(headerOpt.value)
          const day = dt.day()
          const isToday = dt.isSame(this.today)
          if (isToday) {
            className += ' tui-full-calendar-today'
          }
          if (day == 0) {
            className += ' tui-full-calendar-holiday-sun'
          }
          if (day == 6) {
            className += ' tui-full-calendar-holiday-sat'
          }
        }
        return className
      }
    },
    color() {
      return (headerOpt) => {
        if (this.planMode == 'normal') {
          const dt = moment(headerOpt.value)
          const day = dt.day()
          const isToday = dt.isSame(this.today)
          const isPastDay = dt.isBefore(this.today) && !isToday
          return {
            color: this.getDayNameColor(this.theme, day, isToday, isPastDay)
          }
        }
      }
    },
    date() {
      if (this.planMode == 'normal') { 
        return (headerOpt) => moment(headerOpt.value).format('D')
      }
      return (headerOpt) => headerOpt.zoneName // TODO: これでいいか要確認
    }
  },
  mounted() {
    this.theme = new Theme()
    this.styles = this.getStyles()
    this.applyTheme()
  },
  methods: {
    getDayNameColor(theme, day, isToday, isPastDay) {
      let color = ''
      if (theme) {
        if (day === 0) {
          color = theme.common.holiday.color
        } else if (isPastDay) {
          color = theme.week.pastDay.color || theme.common.dayname.color
        } else if (day === 6) {
          color = theme.common.saturday.color
        } else if (isToday) {
          color = theme.week.today.color || theme.common.today.color
        } else {
          color = theme.common.dayname.color
        }
      }
      return color
    },
    getStyles() {
      const theme = this.theme
      const styles = {}
      if (theme) {
        styles.borderTop = theme.week.dayname.borderTop || theme.common.border
        styles.borderBottom = theme.week.dayname.borderBottom || theme.common.border
        styles.borderLeft = theme.week.dayname.borderLeft || theme.common.border
        styles.paddingLeft = theme.week.dayname.paddingLeft
        styles.backgroundColor = theme.week.dayname.backgroundColor
        styles.height = theme.week.dayname.height
        styles.textAlign = theme.week.dayname.textAlign
        styles.marginLeft = theme.week.daygridLeft.width
      }
      return styles
    },
    applyTheme() {
      const styles = this.styles
      const container = this.$refs.daynameContainer
      const style = container.style

      style.borderTop = styles.borderTop
      style.borderBottom = styles.borderBottom
      style.height = styles.height
      style.backgroundColor = styles.backgroundColor
      style.textAlign = styles.textAlign

      return style
    }
  }
}
</script>
<style>
.tui-full-calendar-dayname-layout {
  border-left: 1px solid #e5e5e5;
  border-right: 1px solid #e5e5e5;
}
.tui-full-calendar-dayname-date {
  font-size: 1.5rem;
}
.tui-full-calendar-dayname-name {
  /* font-weight: bold; */
  font-size: 1rem;
}
</style>