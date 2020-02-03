<template>
<div v-if="event.schedule" class="tui-full-calendar-floating-layer" style="position: absolute;">
  <div class="tui-full-calendar-popup tui-full-calendar-popup-detail">
    <div class="tui-full-calendar-popup-container">
      <div class="tui-full-calendar-popup-section tui-full-calendar-section-header">
        <div>
          <span class="tui-full-calendar-schedule-private tui-full-calendar-icon tui-full-calendar-ic-private"></span>
          <span class="tui-full-calendar-schedule-title">{{ event.schedule.title }}</span>
        </div>
        <div class="tui-full-calendar-popup-detail-date tui-full-calendar-content">{{ calendarContent }}</div>
      </div>
      <div class="tui-full-calendar-section-detail">
          <div v-if="event.schedule.location" class="tui-full-calendar-popup-detail-item"><span class="tui-full-calendar-icon tui-full-calendar-ic-location-b"></span><span class="tui-full-calendar-content">{{ event.schedule.location }}</span></div>
          <div v-if="event.schedule.attendees" class="tui-full-calendar-popup-detail-item tui-full-calendar-popup-detail-item-indent"><span class="tui-full-calendar-icon tui-full-calendar-ic-user-b"></span><span class="tui-full-calendar-content">{{ (event.schedule.attendees || []).join(', ') }}</span></div>
          <div v-if="event.calendar" class="tui-full-calendar-popup-detail-item"><span class="tui-full-calendar-icon tui-full-calendar-calendar-dot" style="{'background-color': event.schedule.bgColor}"></span><span class="tui-full-calendar-content">{{ calendar.name }}</span></div>
          <div v-if="event.schedule.body" class="tui-full-calendar-popup-detail-item tui-full-calendar-popup-detail-item-separate"><span class="tui-full-calendar-content">{{ event.schedule.body }}</span></div>
      </div>
      <div v-if="!event.schedule.isReadOnly" class="tui-full-calendar-section-button">
        <button class="tui-full-calendar-popup-edit" @click="onClickEdit"><span class="tui-full-calendar-icon tui-full-calendar-ic-edit"></span><span class="tui-full-calendar-content">{{ 'Edit' }}</span></button>
        <div class="tui-full-calendar-popup-vertical-line"></div>
        <button class="tui-full-calendar-popup-delete" @click="onClickDelete"><span class="tui-full-calendar-icon tui-full-calendar-ic-delete"></span><span class="tui-full-calendar-content">{{ 'Delete' }}</span></button>
      </div>
    </div>
    <div class="tui-full-calendar-popup-top-line" style="{'background-color': event.schedule.bgColor}"></div>
    <div id="tui-full-calendar-popup-arrow" class="tui-full-calendar-popup-arrow tui-full-calendar-arrow-left">
      <div class="tui-full-calendar-popup-arrow-border">
          <div class="tui-full-calendar-popup-arrow-fill"></div>
      </div>
    </div>
  </div>
</div>
</template>
<script>
import moment from 'moment'
import { domutil } from '../../../sub/calendar/common/domutil'
import { domevent } from '../../../sub/calendar/common/domevent'
import { config } from '../../../sub/calendar/config'

export default {
  components: {
  },
  props: {
    event: null,
  },
  data () {
    return {
      name: 'plan',
      id: 'planId',
      appServicePath: '/office/plans',

      ARROW_WIDTH_HALF:8
    }
  },
  computed: {
    calendarContent() {
      const start = moment(this.event.schedule.start).format("YYYY-MM-DD HH:mm")
      const end = moment(this.event.schedule.end).format("YYYY-MM-DD HH:mm")
      return `${start} - ${end}`
    }
  },
  watch: {
  },
  async created() {
  },
  async mounted() {
    this._setPopupPositionAndArrowDirection()
  },
  updated() {
  },
  methods: {
    onClickEdit(e) {
      this.$emit('edit', {schedule: this.event.schedule})
    },
    onClickDelete(e) {
      this.$emit('delete', {schedule: this.event.schedule})
    },
    _setPopupPositionAndArrowDirection() {
      //tui-full-calendar-floating-layer
      var layerO = document.getElementsByClassName('tui-full-calendar-floating-layer')[0];
        var layer = document.getElementsByClassName('tui-full-calendar-popup')[0];
        // var layer = domutil.find(config.classname('.popup'), this.layer.container);
        var layerSize = {
            width: layer.offsetWidth,
            height: layer.offsetHeight
        };
        var windowSize = {
            right: window.innerWidth,
            bottom: window.innerHeight
        };
        //tui-full-calendar-layout
        var parent = document.getElementsByClassName('tui-full-calendar-layout')[0];
        var parentRect = parent.getBoundingClientRect();
        var parentBounds = {
            left: parentRect.left,
            top: parentRect.top
        };
        var scheduleEl = this.event.event.target || this.event.event.srcElement;
        var blockEl = domutil.closest(scheduleEl, '.tui-full-calendar-time-date-schedule-block')
            || domutil.closest(scheduleEl, '.tui-full-calendar-weekday-schedule')
            || scheduleEl;
        var scheduleBound = blockEl.getBoundingClientRect();
        var pos;
        pos = this._calcRenderingData(layerSize, windowSize, scheduleBound);
        pos.x -= parentBounds.left + 4;
        pos.y -= (parentBounds.top + this.ARROW_WIDTH_HALF);
        domutil.setPosition(layerO, pos.x, pos.y);
        this._setArrowDirection(pos.arrow);
    },
    _calcRenderingData(layerSize, parentSize, guideBound) {
        var guideVerticalCenter = (guideBound.top + guideBound.bottom) / 2;
        var x = guideBound.right;
        var y = guideVerticalCenter;
        var arrowDirection = 'arrow-left';
        var arrowTop;

        if (y < 0) {
            y = y + (layerSize.height / 2) - guideVerticalCenter;
        }

        if (x > 0 && (x + layerSize.width > parentSize.right)) {
            x = guideBound.left - layerSize.width - this.ARROW_WIDTH_HALF - 3;
            arrowDirection = 'arrow-right';
        }

        if (x < 0) {
            x = 0;
        }

        if (guideBound.right > x + layerSize.width) {
            arrowDirection = 'arrow-right';
        }

        /**
         * @typedef {Object} PopupRenderingData
         * @property {number} x - left position
         * @property {number} y - top position
         * @property {string} arrow.direction - direction of popup arrow
         * @property {number} [arrow.position] - relative position of popup arrow, if it is not set, arrow appears on the middle of popup
         */
        return {
            x: x + this.ARROW_WIDTH_HALF,
            y: y - (layerSize.height / 2) + this.ARROW_WIDTH_HALF,
            arrow: {
                direction: arrowDirection,
                position: arrowTop
            }
        };
    },
    _setArrowDirection(arrow) {
        var direction = arrow.direction || 'arrow-left';
        var arrowEl = document.getElementsByClassName('tui-full-calendar-popup-arrow')[0];
        var borderElement = document.getElementsByClassName('tui-full-calendar-popup-arrow-border')[0];
        if (direction !== 'tui-full-calendar-arrow-left') {
            domutil.removeClass(arrowEl, 'tui-full-calendar-arrow-left');
            domutil.addClass(arrowEl, 'tui-full-calendar-' + direction);
        }

        if (arrow.position) {
            borderElement.style.top = arrow.position + 'px';
        }
    },
  }
}
</script>
<style>
</style>
