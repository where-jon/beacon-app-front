<template>
  <div class="container-fluid">
    <breadcrumb :items="items" />
    <b-container>
      <alert :message="message" :force-hide="true" />

      <b-form-row>
        <b-form @submit.prevent="onSubmit">
          <b-form-group :label="$t('label.deviceId')">
            <b-form-select v-model="form.deviceId" :options="deviceIds" :readonly="!isEditable" required />
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
              <b-form-radio :value="ledBlinkTypes.CHANGE_SLOW" :readonly="!isEditable">
                {{ $t('label.changeSlow') }}
              </b-form-radio>
              <b-form-radio :value="ledBlinkTypes.CHANGE_FAST" :readonly="!isEditable">
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
                    :disabled="noDevice" type="submit" class="my-1" @click="buttonClick(true)"
          />
          <b-button v-show="isEditable" v-t="'label.end'" :variant="theme" 
                    :disabled="noDevice" type="submit" class="ml-2 my-1" @click="buttonClick(false)"
          />
        </b-form>
      </b-form-row>
    </b-container>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import * as StateHelper from '../../sub/helper/StateHelper'
import breadcrumb from '../../components/layout/breadcrumb.vue'
import alert from '../../components/parts/alert.vue'
import { getButtonTheme } from '../../sub/helper/ThemeHelper'
import { LED_COLORS, LED_BLINK_TYPES, SENSOR } from '../../sub/constant/Constants'
import * as EXCloudHelper from '../../sub/helper/EXCloudHelper'
import * as Util from '../../sub/util/Util'
import editmixinVue from '../../components/mixin/editmixin.vue'

export default {
  components: {
    breadcrumb,
    alert,
  },
  mixins: [
    editmixinVue,
  ],
  data () {
    return {
      name: 'led',
      id: 'ledId',
      appServicePath: '/core/excloud/led',
      deviceIds: [],
      ledColors: LED_COLORS,
      ledBlinkTypes: LED_BLINK_TYPES,
      lightOnCandidate: false,
      noDevice: false,
      again: false,
      form: {
        deviceId: '',
        colors: [2],
        blink: 1,
      },
      items: [
        {
          text: this.$i18n.tnl('label.main'),
          active: true
        },
        {
          text: this.$i18n.tnl('label.ledOperation'),
          active: true
        }
      ],
    }
  },
  computed: {
    theme() {
      const theme = getButtonTheme()
      return 'outline-' + theme
    },
    ...mapState('app_service', [
      'exbs',
    ]),
  },
  watch: {
    'form.colors': function(newVal, oldVal) {
      // チェックの数が0にされたら値を元に戻す。
      if (newVal.length == 0) {
        this.form.colors.push(oldVal[0])
        return
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
        await StateHelper.load('exb')
        let deviceIds = _.filter(this.exbs,
          exb => exb.enabled && this.getSensorId(exb) == SENSOR.LED
        )
          .map(
            exb => {
              let deviceOffset = this.$store.state.currentRegion.deviceOffset
              return {text:(exb.deviceId - deviceOffset) + ' (0x' + exb.deviceId.toString(16) + ', ' + exb.deviceId + ')', value: exb.deviceId}
            }
          )

        if (deviceIds && deviceIds.length == 1) {
          this.form.deviceId = deviceIds[0].value
        } else if(!Util.hasValue(deviceIds)) {
          this.noDevice = true
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
    async save() {
      var rgb = 0
      for (var i of this.form.colors) {
        rgb += i
      }
      let entity = [{
        deviceid: this.form.deviceId,
        rgb1: rgb,
        pattern1: this.lightOnCandidate ? this.form.blink : 0,
        rgb2: 0,
        pattern2: 0,
      }]
      Util.debug('led send: ', entity)
      await EXCloudHelper.postLed(entity)
    },
    buttonClick(bool) {
      this.lightOnCandidate = bool
    },
    backToList() {}, // editMixinのメソッドを無効化
  }
}
</script>

<style scoped lang="scss">
@import "../../sub/constant/config.scss";

::-webkit-scrollbar { 
  display: none; 
}

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