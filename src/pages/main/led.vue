<template>
  <div>
    <breadcrumb :items="items" />
    <b-container>
      <b-alert variant="danger" dismissible :show="showAlert"  @dismissed="showAlert=false">{{ message }}</b-alert>
      <b-form-row>
        <b-form @submit="onSubmit">
          <b-form-group :label="$t('label.deviceId')">
            <b-form-select v-model="form.deviceId" :options="deviceIds" required :readonly="!isEditable" />
          </b-form-group>
          <b-form-group :label="$t('label.color')">
            <b-form-checkbox-group v-model="form.colors">
              <b-form-checkbox class="checkBlue" :value="ledColors.BLUE" :readonly="!isEditable">
                {{$t('label.blue')}}
              </b-form-checkbox>
              <b-form-checkbox class="checkRed" :value="ledColors.RED" :readonly="!isEditable">
                {{$t('label.red')}}
              </b-form-checkbox>
              <b-form-checkbox class="checkPurple" :value="ledColors.PURPLE" :readonly="!isEditable">
                {{$t('label.purple')}}
              </b-form-checkbox>
              <b-form-checkbox class="checkGreen" :value="ledColors.GREEN" :readonly="!isEditable">
                {{$t('label.green')}}
              </b-form-checkbox>
              <b-form-checkbox class="checkPaleblue" :value="ledColors.PALEBLUE" :readonly="!isEditable">
                {{$t('label.paleblue')}}
              </b-form-checkbox>
              <b-form-checkbox class="checkYellow" :value="ledColors.YELLOW" :readonly="!isEditable">
                {{$t('label.yellow')}}
              </b-form-checkbox>
              <b-form-checkbox class="checkWhite" :value="ledColors.WHITE" :readonly="!isEditable">
                {{$t('label.white')}}
              </b-form-checkbox>
              <b-form-checkbox class="checkBlack" :value="ledColors.BLACK" :readonly="!isEditable">
                {{$t('label.black')}}
              </b-form-checkbox>
            </b-form-checkbox-group>
          </b-form-group>
          <b-form-group :label="$t('label.blink')">
            <b-form-radio-group v-model="form.blink">
              <b-form-radio :value="ledBlinkTypes.CHANGE_SLOW" :readonly="!isEditable">
                {{$t('label.changeSlow')}}
              </b-form-radio>
              <b-form-radio :value="ledBlinkTypes.CHANGE_FAST" :readonly="!isEditable">
                {{$t('label.changeFast')}}
              </b-form-radio>
              <b-form-radio :value="ledBlinkTypes.BLINK_SLOW" :readonly="!isEditable">
                {{$t('label.blinkSlow')}}
              </b-form-radio>
              <b-form-radio :value="ledBlinkTypes.BLINK_FAST" :readonly="!isEditable">
                {{$t('label.blinkFast')}}
              </b-form-radio>
            </b-form-radio-group>
          </b-form-group>
          <b-button v-show="isEditable" type="submit" 
              @click="buttonClick(true)" v-t="'label.start'" :variant="theme" />
          <b-button v-show="isEditable" type="submit" class="ml-2" 
              @click="buttonClick(false)" v-t="'label.end'" :variant="theme" :disabled="!form.lightOn"/>
        </b-form>
      </b-form-row>
    </b-container>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import * as StateHelper from '../../sub/helper/StateHelper'
import breadcrumb from '../../components/layout/breadcrumb.vue'
import { DISP, EXCLOUD } from '../../sub/constant/config'
import { getButtonTheme } from '../../sub/helper/ThemeHelper'
import { LED_COLORS, LED_BLINK_TYPES, SENSOR } from '../../sub/constant/Constants'
import * as ViewHelper from '../../sub/helper/ViewHelper'
import * as AppServiceHelper from '../../sub/helper/AppServiceHelper'
import * as EXCloudHelper from '../../sub/helper/EXCloudHelper'
import * as Util from '../../sub/util/Util'
import editmixinVue from '../../components/mixin/editmixin.vue'

export default {
  mixins: [
    editmixinVue,
  ],
  components: {
    breadcrumb,
  },
  data () {
    return {
      name: 'led',
      id: 'ledId',
      appServicePath: '/core/excloud/led',
      mutex: false,
      selectedTheme: null,
      ledColors: LED_COLORS,
      ledBlinkTypes: LED_BLINK_TYPES,
      lightOnCandidate: false,
      again: false,
      form: {
        deviceId: "",
        colors: [2],
        blink: 1,
        lightOn: false,
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
      const theme = getButtonTheme(this.$store.state.loginId)
      return 'outline-' + theme
    },
    ...mapState('app_service', [
      'led',
      'deviceIds',
      'exbs',
    ]),
  },
  mounted(){
    this.createMessage = false
    this.fetchData()
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
  methods: {
    async fetchData(payload) {
      try {
        this.replace({showProgress: true})
        await StateHelper.load('exb')
        let deviceIds = _.filter(this.exbs,
          exb => exb.enabled && this.getSensorId(exb) == SENSOR.LED
        )
        .map(
          exb => {
            let deviceOffset = this.$store.state.currentRegion.deviceOffset
            return {text:(exb.deviceId - deviceOffset) + " (0x" + exb.deviceId.toString(16) + ", " + exb.deviceId + ")", value: exb.deviceId}
          }
        )

        if (deviceIds && deviceIds.length == 1) {
          this.form.deviceId = deviceIds[0].value
        }

        if (payload && payload.done) {
          payload.done()
        }
        this.replaceAS({deviceIds})
      } catch(e) {
        console.error(e)
      }
      this.replace({showProgress: false})
    },
    async save() {
      var rgb = 0
      var pattern = 0
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
      await EXCloudHelper.postLed(entity)
      this.form.lightOn = this.lightOnCandidate
    },
    buttonClick(bool) {
      this.lightOnCandidate = bool
    },
    backToList() {}, // editMixinのメソッドを無効化
    showMapImage() {}, // showMapMixin用ダミー
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