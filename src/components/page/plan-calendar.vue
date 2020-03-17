<template>
  <div id="calendar-layout">
  <!-- layout -->
    <div class="tui-full-calendar-layout">
      <!-- week -->
      <div id="w-container" class="tui-full-calendar-week-container">
        <header-panel :planMode="planMode" :timeLineLeftAndWidth="viewModel.timeLineLeftAndWidth" :headerOpts="headerOpts" @handleScroll="handleScroll"></header-panel>
        <time-grid-panel :planMode="planMode" :timeSlots="timeSlots" :viewModel="viewModel" :headerOpts="headerOpts" :doCompare="doCompare" @handleScroll="handleScroll"></time-grid-panel>
      </div>
      <div>
        <schedule-detail-popup v-if="clickScheduleEvent && !doCompare" :event="clickScheduleEvent" @edit="doEdit" @delete="doDelete">
        </schedule-detail-popup>
        <compare-popup v-if="clickScheduleEvent && doCompare" :event="clickScheduleEvent">
        </compare-popup>
      </div>
    </div>
  </div>
</template>
<script>
import '../../sub/constant/tui/css/tui-calendar.css'
import headerPanel from '../parts/calendar/header-panel.vue'
import timeGridPanel from '../parts/calendar/time-grid-panel.vue'
import scheduleDetailPopup from '../parts/calendar/schedule-detail-popup.vue'
import comparePopup from '../parts/calendar/compare-popup.vue'

export default {
  components: {   
    headerPanel, timeGridPanel, scheduleDetailPopup, comparePopup
  },
  props: {
    name: null,
    id: null,
    appServicePath: null,
    planMode: null,
    currentUser: null,
    headerOpts: null,
    viewModel: null,
    dragHandler: null,
    clickScheduleEvent: null,
    doCompare: null,
  },
  data () {
    return {
      timeSlots: [
        {
          hidden: false,
          label: null
        }
      ],
      scrollFrom: null,
      timeoutId: 0,
    }
  },
  mounted() {
    this.timeSlots = [...Array(24).keys()].map((hour) => {
      // const meridiem = hour >= 12 ? 'pm' : 'am'
      // if (hour > 12) {
      //     hour = hour - 12;
      // }
      // return { 
      //   hidden: hour == 0 ? true : false,
      //   label: `${hour} ${meridiem}`
      // }
      return {
        hidden: hour == 0 || hour == 24 ? true : false,
        label: hour
      }
    })
  },
  methods: {
    doEdit(e) {
      this.$emit('doEdit', e)
    },
    doDelete(e) {
      this.$emit('doDelete', e)
    },
    handleScroll(callFrom) {
      if(this.scrollFrom === null){
        this.scrollFrom = callFrom;
      }
      if(this.scrollFrom !== callFrom) return;

      if(this.timeoutId !== 0) clearTimeout(this.timeoutId);
      this.timeoutId = setTimeout(()=>{
        this.timeoutId = 0;
        this.scrollFrom = null;
      }, 100);
      
      const basis = document.getElementById(callFrom);
      const scrollRatio = basis.scrollLeft / (basis.scrollWidth - basis.clientWidth);
      const elements = document.getElementsByClassName("sync-scroll");
      for (let i = 0; i < elements.length; i++) {
        if(elements[i].id === callFrom) continue;
        elements[i].scrollLeft =
          (elements[i].scrollWidth - elements[i].clientWidth) * scrollRatio;
      }
    },
  }
}
</script>
<style>
</style>