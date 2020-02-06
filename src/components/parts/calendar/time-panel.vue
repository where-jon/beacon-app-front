<template>
  <div ref="blockWrap"  class="tui-full-calendar-time-date-schedule-block-wrap" :style="{'margin-right': styles.marginRight}">
    <div v-if="viewModel && viewModel.timeLineMap && viewModel.timeLineMap.hasOwnProperty(headerId)">
      <div v-for="(matrix, matrixIdx) in viewModel.timeLineMap[headerId]" :key="matrixIdx" >
        <div v-for="(row, rowIdx) in matrix" :key="rowIdx" >
          <div v-for="(schedule, colIdx) in row" :key="colIdx" >
            <div v-if="schedule" class="tui-full-calendar-time-date-schedule-block" :data-id="schedule.id" :style="timeScheduleBlockStyle(headerId, matrixIdx, rowIdx, colIdx)">
              <div class="tui-full-calendar-time-schedule" :style="{
                'border-bottom-left-radius': styles.borderRadius,
                'border-bottom-right-radius': styles.borderRadius,
                'border-top-left-radius': styles.borderRadius,
                'border-top-right-radius': styles.borderRadius,
                'color': schedule.color,
                'background-color': schedule.bgColor,
                'border-color': schedule.borderColor,
                'font-size': 0}">
                <div class="tui-full-calendar-time-schedule-content tui-full-calendar-time-schedule-content-time" 
                :style="{ height: '100%', 'font-size': '1rem', 'font-weight': '600', 'border-left-width': '6px', 'border-color': schedule.basicColor, 'padding-left': '3px' }">
                  {{ schedule.title }}
                </div>
              </div>
              <div v-if="!schedule.isReadOnly" class="tui-full-calendar-time-resize-handle handle-x" :style="{'margin-left': styles.paddingLeft}">&nbsp;</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import '../../../sub/constant/tui/css/tui-calendar.css'
import { Theme } from '../../../sub/calendar/theme/theme'

export default {
  components: {    
  },
  props: {
    isToday: null,
    headerId: null,
    viewModel: null,
  },
  data () {
    return {
      styles: {},
      theme: null,
    }
  },
  computed: {
    timeScheduleBlockStyle() {
      return (headerId, matrixIdx, rowIdx, colIdx) => {
        const bounds = this.viewModel.scheduleViewBoundsMap[headerId][matrixIdx][rowIdx][colIdx]
        return {
          top: `${bounds[1].top}px`,
          left: `${bounds[0].left}%`,
          width: `${bounds[0].width}%`,
          height: `${bounds[1].height}px`,
          'padding-left': bounds[0].left == 0 ? '0px' : this.styles.paddingLeft
        }
      }
    }
  },
  mounted() {
    this.theme = new Theme()
    this.styles = this.getStyles()
  },
  methods: {
    getStyles() {
      const theme = this.theme
      var styles = {}
      if (theme) {
          styles.borderRight = theme.week.timegrid.borderRight || theme.common.border
          styles.marginRight = theme.week.timegrid.paddingRight
          styles.borderRadius = theme.week.timegridSchedule.borderRadius
          styles.paddingLeft = theme.week.timegridSchedule.paddingLeft
          styles.backgroundColor = this.isToday ? theme.week.today.backgroundColor : 'inherit'
      }

      return styles
    },
  }
}
</script>
<style>
</style>