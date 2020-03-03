<template>
  <div class="container-fluid">
    <breadcrumb :items="items" />
    <b-container>
      <alert :message="message" :force-hide="true" />

      <b-form @submit.prevent="save">
        <b-form-group :label="$t('label.device')">
          <v-select v-model="vueSelected.deviceId" :options="deviceIds" :disable="!isEditable" :clearable="false" class="vue-options-lg">
            <template slot="no-options">
              {{ vueSelectNoMatchingOptions }}
            </template>
          </v-select>
        </b-form-group>
        <b-form-group v-if="deviceType == 5" :label="$t('label.ledNo')">
          <select v-model="ledNo">
            <option v-for="option in ledNoOptions" :key="option.value" :value="option.value">
              {{ option.text }}
            </option>
          </select>
        </b-form-group>
        <b-form-group :label="$t('label.ledColor')">
          <b-form-checkbox-group v-model="form.colors">
            <b-form-checkbox :value="ledColors.BLUE" :readonly="!isEditable" class="checkBlue">
              {{ $t('label.blue') }}
            </b-form-checkbox>
            <b-form-checkbox :value="ledColors.RED" :readonly="!isEditable" class="checkRed">
              {{ $t('label.red') }}
            </b-form-checkbox>
            <b-form-checkbox :value="ledColors.PURPLE" :readonly="!isEditable" class="checkPurple">
              {{ $t('label.purple') }}
            </b-form-checkbox>
            <b-form-checkbox :value="ledColors.GREEN" :readonly="!isEditable" class="checkGreen">
              {{ $t('label.green') }}
            </b-form-checkbox>
            <b-form-checkbox :value="ledColors.PALEBLUE" :readonly="!isEditable" class="checkPaleblue">
              {{ $t('label.paleblue') }}
            </b-form-checkbox>
            <b-form-checkbox :value="ledColors.YELLOW" :readonly="!isEditable" class="checkYellow">
              {{ $t('label.yellow') }}
            </b-form-checkbox>
            <b-form-checkbox :value="ledColors.WHITE" :readonly="!isEditable" class="checkWhite">
              {{ $t('label.white') }}
            </b-form-checkbox>
            <b-form-checkbox :value="ledColors.BLACK" :readonly="!isEditable" class="checkBlack">
              {{ $t('label.black') }}
            </b-form-checkbox>
          </b-form-checkbox-group>
        </b-form-group>
        <b-form-group :label="$t('label.blink')">
          <b-form-radio-group v-model="form.blink">
            <b-form-radio v-if="deviceType == 5" :value="ledBlinkTypes.ON" :readonly="!isEditable">
              {{ $t('label.ledOn') }}
            </b-form-radio>
            <b-form-radio v-if="deviceType == 2" :value="ledBlinkTypes.CHANGE_SLOW" :readonly="!isEditable">
              {{ $t('label.changeSlow') }}
            </b-form-radio>
            <b-form-radio v-if="deviceType == 2" :value="ledBlinkTypes.CHANGE_FAST" :readonly="!isEditable">
              {{ $t('label.changeFast') }}
            </b-form-radio>
            <b-form-radio :value="ledBlinkTypes.BLINK_SLOW" :readonly="!isEditable">
              {{ $t('label.blinkSlow') }}
            </b-form-radio>
            <b-form-radio :value="ledBlinkTypes.BLINK_FAST" :readonly="!isEditable">
              {{ $t('label.blinkFast') }}
            </b-form-radio>
          </b-form-radio-group>
        </b-form-group>
        <b-button v-show="isEditable" v-t="'label.start'" :variant="theme"
                  :disabled="!deviceType" type="button" class="my-1" @click="buttonClick(true)"
        />
        <b-button v-show="isEditable" v-t="'label.end'" :variant="theme" 
                  :disabled="!deviceType" type="button" class="ml-2 my-1" @click="buttonClick(false)"
        />
      </b-form>
    </b-container>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { APP } from '../../sub/constant/config'
import { LED_COLORS, LED_BLINK_TYPES, SENSOR } from '../../sub/constant/Constants'
import * as Util from '../../sub/util/Util'
import * as EXCloudHelper from '../../sub/helper/dataproc/EXCloudHelper'
import * as StateHelper from '../../sub/helper/dataproc/StateHelper'
import * as ViewHelper from '../../sub/helper/ui/ViewHelper'
import * as VueSelectHelper from '../../sub/helper/ui/VueSelectHelper'
import breadcrumb from '../../components/layout/breadcrumb.vue'
import commonmixin from '../../components/mixin/commonmixin.vue'
import editmixin from '../../components/mixin/editmixin.vue'
import alert from '../../components/parts/alert.vue'

export default {
  components: {
    breadcrumb,
    alert,
  },
  mixins: [commonmixin, editmixin],
  data () {
    return {
      name: 'led',
      id: 'ledId',
      appServicePath: '/core/excloud/led',
      form: {
        deviceId: '',
        colors: [2],
        blink: 1,
      },
      vueSelected: {
        deviceId: null,
      },
      items: ViewHelper.createBreadCrumbItems('main', 'ledOperation'),
      deviceIds: [],
      ledColors: LED_COLORS,
      ledBlinkTypes: LED_BLINK_TYPES,
      lightOnCandidate: false,
      again: false,
      ledNo: 1,
      ledNoOptions: [1,2,3].map(e => ({text: e, value: e}))
    }
  },
  computed: {
    // ...mapState('app_service', [
    //   'exbs',
    // ]),
    deviceType() {
      if (!this.form.deviceId) return null
      return this.deviceIdMap[this.form.deviceId].sensorIdList.includes(SENSOR.LED_TYPE2)? 2: 5
    },
  },
  watch: {
    'vueSelected.deviceId': {
      handler: function(newVal, oldVal){
        this.form.deviceId = Util.getValue(newVal, 'value')
        this.form.colors = [2]
        this.form.blink = this.deviceType == 2? 1: 0
      },
      deep: true,
    },
    'form.colors': function(newVal, oldVal) {
      // チェックの数が0にされたら値を元に戻す。
      if (newVal.length == 0) {
        this.$nextTick(() => {
          this.form.colors = [oldVal[0]]
        })
        return
      }
      if (this.deviceType == 5 && newVal.length > 1) { // Type5の場合、一つのみチェック
        this.form.colors = [newVal[newVal.length - 1]]
      }
    },
  },
  mounted(){
    this.createMessage = false
    this.fetchData()
  },
  methods: {
    async fetchData(payload) {
      try {
        this.showProgress()
        const deviceIds = _.filter(this.exbs, exb => exb.sensorIdList.includes(SENSOR.LED_TYPE2) || exb.sensorIdList.includes(SENSOR.LED_TYPE5))
          .map(exb => {
            const locationName = Util.hasValue(exb.locationName)? (exb.locationName) + ' : ': ''
            const label = locationName + (exb.deviceId) + ' (0x' + exb.deviceId.toString(16) + ')'
            return { text: label, label: label, value: exb.deviceId }
          })

        if (deviceIds && deviceIds.length == 1) {
          this.vueSelected.deviceId = VueSelectHelper.getVueSelectData(deviceIds, null, true)
        } else if(!Util.hasValue(deviceIds)) {
          this.showErrorModal({key: 'noLedDevice'})
        }

        if (payload && payload.done) {
          payload.done()
        }
        this.deviceIds = deviceIds
      } catch(e) {
        console.error(e)
      }
      this.hideProgress()
    },
    createEntity(isOn) {
      var rgb = 0
      for (var i of this.form.colors) {
        if (this.deviceType == 2) {
          rgb += i
        }
        else {
          rgb = Math.log2(i)
        }
      }
      const no = this.deviceType == 5? this.ledNo: 1
      return [{
        deviceType: this.deviceType,
        deviceId: this.form.deviceId,
        ['rgb' + no]: !isOn && this.deviceType == 5? 0: rgb,
        ['pattern' + no]: isOn? this.form.blink: 0,
      }]
    },
    async buttonClick(bool) {
      this.showProgress()
      try {
        this.lightOnCandidate = bool
        const entity = this.createEntity(this.lightOnCandidate)
        Util.debug('led send: ', entity)
        await EXCloudHelper.postLed(entity)

        const timerKey = 'led-' + entity[0].deviceId
        if(APP.SENSOR.LED.AUTO_OFF_TIME > 0) {
          if(this.lightOnCandidate) {
            const req = this.createEntity(false)
            this.pushTimer(timerKey, APP.SENSOR.LED.AUTO_OFF_TIME * 1000, () => EXCloudHelper.postLed(req))
          } else {
            this.popTimer(timerKey)
          }
        }
      }
      finally {
        this.hideProgress()
      }
    },
    backToList() {
      ViewHelper.disabledButtons(false)
    }, // editMixinのメソッドを無効化
  }
}
</script>

<style scoped lang="scss">
@import "../../sub/constant/config.scss";
@import "../../sub/constant/browser.scss";
@import "../../sub/constant/vue.scss";

div[class^="check"] {
  padding-right: 16px;
  padding-left: 40px;
  padding-top: 8px;
  padding-bottom: 8px;
  margin-bottom: 8px;
}

.checkBlue {
  background-color: royalblue;
  color: white;
}

.checkRed {
  background-color: red;
  color: white;
}

.checkPurple {
  background-color: magenta;
  color: white;
}

.checkGreen {
  background-color: limegreen;
}

.checkPaleblue {
  background-color: deepskyblue;
}

.checkYellow {
  background-color: yellow;
}
.checkBlack {
  background-color: black;
  color: white;
}

</style>