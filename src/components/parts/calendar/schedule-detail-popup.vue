<template>
<div v-if="event.schedule" class="tui-full-calendar-floating-layer" style="position: absolute;">
  <div class="tui-full-calendar-popup tui-full-calendar-popup-detail" :style="{'border-top': `10px solid ${event.schedule.basicColor}`}">
    <div class="tui-full-calendar-popup-container">
      <div class="tui-full-calendar-popup-section tui-full-calendar-section-header">
          <span class="tui-full-calendar-schedule-private tui-full-calendar-icon tui-full-calendar-ic-private"></span>
          <span class="tui-full-calendar-schedule-title" :style="{color: event.schedule.basicColor}">{{ event.schedule.title }}</span>
      </div>
      <div class="tui-full-calendar-section-detail">
        <div class="tui-full-calendar-popup-detail-item"><div class="popup-left"><img src="~/assets/icon/clock.svg" class="popup-icon"></div><div class="popup-right"><span class="tui-full-calendar-content">{{ calendarContent }}</span></div></div>
        <div v-if="event.schedule.location" class="tui-full-calendar-popup-detail-item"><div class="popup-left"><img src="~/assets/icon/location.svg" class="popup-icon"></div><div class="popup-right"><span class="tui-full-calendar-content">{{ event.schedule.location }}</span></div></div>
        <div v-if="event.schedule.attendees" class="tui-full-calendar-popup-detail-item"><div class="popup-left"><img src="~/assets/icon/person.svg" class="popup-icon"></div><div class="popup-right"><span class="tui-full-calendar-content">{{ (event.schedule.attendees || []).join(', ') }}</span></div></div>
        <div v-if="event.schedule.thing" class="tui-full-calendar-popup-detail-item"><div class="popup-left"><img src="~/assets/icon/box.svg" class="popup-icon"></div><div class="popup-right"><span class="tui-full-calendar-content">{{ event.schedule.thing }}</span></div></div>
        <div v-if="event.schedule.body" class="tui-full-calendar-popup-detail-item"><div class="popup-left"><img src="~/assets/icon/memo.svg" class="popup-icon"></div><div id="popup-content" class="popup-right tui-full-calendar-content"></div></div>
      </div>
      <div v-if="!event.schedule.isReadOnly" class="tui-full-calendar-section-button">
        <button class="tui-full-calendar-popup-edit" @click="onClickEdit"><div class="popup-left"><img src="~/assets/icon/edit.svg" class="popup-icon"></div><div class="popup-right"><span class="tui-full-calendar-content">{{ 'Edit' }}</span></div></button>
        <div class="tui-full-calendar-popup-vertical-line"></div>
        <button class="tui-full-calendar-popup-delete" @click="onClickDelete"><img src="~/assets/icon/trash.svg" class="popup-icon" style="width: 0.8rem; height: 0.8rem;"><span class="tui-full-calendar-content">{{ 'Delete' }}</span></button>
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
      const start = moment(this.event.schedule.start).format("YYYY/MM/DD (ddd) HH:mm")
      const end = moment(this.event.schedule.end).format("HH:mm")
      return `${start} - ${end}`
    }
  },
  watch: {
  },
  async created() {
  },
  async mounted() {
    const elm = document.getElementById('popup-content')
    if (elm) {
      elm.innerHTML = this.event.schedule.body
      // elm.textContent = this.event.schedule.body
    }
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
        domutil.setPosition(layerO, pos.x, pos.y)
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
.popup-icon {
  width: 1rem;
  height: 1rem;
}
.tui-full-calendar-popup-detail-item {
  /* height: auto; */
}
.popup-left {
  display: table-cell;
  width: 1.5rem;
}
.popup-right {
  display: table-cell;
}
</style>
