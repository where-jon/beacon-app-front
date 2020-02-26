<template>
<div v-if="event.schedule" class="tui-full-calendar-floating-layer" style="position: absolute;">
  <div class="tui-full-calendar-popup tui-full-calendar-popup-detail">
    <div class="tui-full-calendar-popup-container">
      <!-- <b-card-group deck> -->
      <b-card no-body header="予定 " style="margin-left: 2px;margin-right: 1px;">
        <b-list-group flush>
          <div v-if="0 == event.schedule.id.indexOf('p-')">
            <b-list-group-item>
              <b-form-row>
                <b-col cols="4"><span style="font-weight: bold;">タイトル</span></b-col>
                <b-col cols="8">
                  <span>{{ event.schedule.title }}</span>
                </b-col>
              </b-form-row>
            </b-list-group-item>
            <b-list-group-item>
              <b-form-row>
                <b-col cols="4"><span style="font-weight: bold;">時間</span></b-col>
                <b-col cols="8">
                  <span>{{ calendarContent }}</span>
                </b-col>
              </b-form-row>
            </b-list-group-item>
            <b-list-group-item>
              <b-form-row>
                <b-col cols="4"><span style="font-weight: bold;">利用者</span></b-col>
                <b-col cols="8">
                  <span>{{ event.schedule.potPersons }}</span>
                </b-col>
              </b-form-row>
            </b-list-group-item>
            <b-list-group-item>
              <b-form-row>
                <b-col cols="4"><span style="font-weight: bold;">物</span></b-col>
                <b-col cols="8">
                  <span>{{ event.schedule.potThing }}</span>
                </b-col>
              </b-form-row>
            </b-list-group-item>
          </div>
          <div v-else>
            <b-list-group-item>
              <b-form-row>
                <b-col cols="4"><span>-</span></b-col>
                <b-col cols="8">
                </b-col>
              </b-form-row>
            </b-list-group-item>
          </div>
        </b-list-group>
      </b-card>
      <b-card no-body header="実績" style="margin-left: 1px;margin-right: 2px;">
        <b-list-group flush>
          <b-list-group-item>
            <b-form-row>
              <b-col cols="4"><span style="font-weight: bold;">利用者</span></b-col>
              <b-col cols="8">
                <div v-if="0 == event.schedule.id.indexOf('p-')">
                  <div v-if="event.schedule.inPlanPersons.length > 0">
                    <div v-for="(p, personIdx) in event.schedule.inPlanPersons" :key="personIdx">
                      <span>{{ p.range + ' ... ' + p.potName }}<br></span>
                    </div>
                  </div>
                  <div v-else>
                    <span>-</span>
                  </div>
                </div>
                <div v-else>
                  <div v-if="event.schedule.outOfPlanPersons.length > 0">
                    <div v-for="(opp, oppIdx) in event.schedule.outOfPlanPersons" :key="oppIdx">
                      <span>{{ opp.range + ' ... ' + opp.potName }}<br></span>
                    </div>
                  </div>
                  <div v-else>
                    <span>-</span>
                  </div>
                </div>
              </b-col>
            </b-form-row>
          </b-list-group-item>
          <b-list-group-item>
            <b-form-row>
              <b-col cols="4"><span style="font-weight: bold;">物</span></b-col>
              <b-col cols="8">
                <div v-if="0 == event.schedule.id.indexOf('p-')">
                  <span v-if="event.schedule.inPlanThing">{{ event.schedule.inPlanThing.range + ' ... ' + event.schedule.inPlanThing.potName }}<br></span>
                  <span v-else>-</span>
                </div>
                <div v-else>
                  <div v-if="event.schedule.outOfPlanThings.length > 0">
                    <div v-for="(opt, optIdx) in event.schedule.outOfPlanThings" :key="optIdx">
                      <span>{{ opt.range + ' ... ' + opt.potName }}<br></span>
                    </div>
                  </div>
                  <div v-else>
                    <span>-</span>
                  </div>
                </div>
              </b-col>
            </b-form-row>
          </b-list-group-item>
        </b-list-group>
      </b-card>
      <!-- </b-card-group> -->
    </div>
    <div class="tui-full-calendar-popup-top-line" style="{'background-color': event.schedule.bgColor}"></div>
    <div id="tui-full-calendar-popup-arrow" class="tui-full-calendar-popup-arrow tui-full-calendar-arrow-left">
      <div class="tui-full-calendar-popup-arrow-border">
          <div class="tui-full-calendar-popup-arrow-fill"></div>
      </div>
    </div>
  </div>
</div>
</template><script>
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
      ARROW_WIDTH_HALF:8      
    }
  },
  computed: {
    calendarContent() {
      const start = moment(this.event.schedule.start).format("HH:mm")
      const end = moment(this.event.schedule.end).format("HH:mm")
      return `${start} - ${end}`
    },
    aaa() {
      const a = this.event.schedule.ips.map( p => p.potName + ' ' + p.range).join(',')
      return a
    },
  },
  async mounted() {
    this._setPopupPositionAndArrowDirection()
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
