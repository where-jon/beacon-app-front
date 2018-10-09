<template>
  <b-container>
    <breadcrumb :items="items" />
    <!--<pagetitle title="label.led" />-->
    <b-row>
      <b-col md="6" offset-md="3">
        <b-form-group :label="$t('label.color')" horizontal>
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
          </b-form-checkbox-group>
          <b-form-checkbox-group v-model="form.colors">
            <b-form-checkbox class="checkGreen" :value="ledColors.GREEN" :readonly="!isEditable">
              {{$t('label.green')}}
            </b-form-checkbox>
            <b-form-checkbox class="checkPaleblue" :value="ledColors.PALEBLUE" :readonly="!isEditable">
              {{$t('label.paleblue')}}
            </b-form-checkbox>
            <b-form-checkbox class="checkYellow" :value="ledColors.YELLOW" :readonly="!isEditable">
              {{$t('label.yellow')}}
            </b-form-checkbox>
          </b-form-checkbox-group>
          <b-form-checkbox-group v-model="form.colors">
            <b-form-checkbox class="checkWhite" :value="ledColors.WHITE" :readonly="!isEditable">
              {{$t('label.white')}}
            </b-form-checkbox>
          </b-form-checkbox-group>
        </b-form-group>
        <b-form-group :label="$t('label.blink')" horizontal>
          <b-form-radio-group v-model="form.blink">
            <b-form-radio :value="ledBlinkTypes.CHANGE_SLOW" :readonly="!isEditable">
              {{$t('label.changeSlow')}}
            </b-form-radio>
            <b-form-radio :value="ledBlinkTypes.CHANGE_FAST" :readonly="!isEditable">
              {{$t('label.changeFast')}}
            </b-form-radio>
          </b-form-radio-group>
          <b-form-radio-group v-model="form.blink">
            <b-form-radio :value="ledBlinkTypes.BLINK_SLOW" :readonly="!isEditable">
              {{$t('label.blinkSlow')}}
            </b-form-radio>
            <b-form-radio :value="ledBlinkTypes.BLINK_FAST" :readonly="!isEditable">
              {{$t('label.blinkFast')}}
            </b-form-radio>
          </b-form-radio-group>
        </b-form-group>
        <b-button v-show="form.lightOn == 0 && isEditable" @click="buttonClick" v-t="'label.start'" :variant="theme" />
        <b-button v-show="form.lightOn == 1 && isEditable" @click="buttonClick" v-t="'label.end'" :variant="theme" />
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import breadcrumb from '../../components/breadcrumb.vue'
import pagetitle from '../../components/pagetitle.vue'
import { DISP, THEME } from '../../sub/constant/config'
import { getButtonTheme } from '../../sub/helper/ThemeHelper'
import { LED_COLORS, LED_BLINK_TYPES, LED_STATE } from '../../sub/constant/Constants'
import * as ViewHelper from '../../sub/helper/ViewHelper'
import * as AppServiceHelper from '../../sub/helper/AppServiceHelper'
import editmixinVue from '../../components/editmixin.vue'
import { extract } from '../../sub/helper/ViewHelper'


export default {
  mixins: [editmixinVue],
  components: {
    breadcrumb,
  },
  data () {
    return {
      name: 'led',
      id: 'ledId',
      appServicePath: '/main/led',
      mutex: false,
      items: [
        {
          text: this.$i18n.t('label.main'),
          active: true
        },
        {
          text: this.$i18n.t('label.led'),
          active: true
        }
      ],
      selectedTheme: null,
      ledColors: LED_COLORS,
      ledBlinkTypes: LED_BLINK_TYPES,
      ledState: LED_STATE,
      form: {
        colors: [1],
        blink: 1,
        lightOn: 0,
      },
    }
  },
  computed: {
    theme () {
      const theme = getButtonTheme(this.$store.state.loginId)
      return 'outline-' + theme
    },
    ...mapState('app_service', [
      'led',
    ]),
  },
  watch: {
    'form.colors': function(newVal, oldVal) {
      // チェックの数が0にされたら値を元に戻す。
      if (newVal.length == 0) {
        this.form.colors.push(oldVal[0])
        return
      }
      if (this.form.lightOn == 1) {
        this.sendData()
      }
    },
    'form.blink': function(newVal, oldVal) {
      if (this.form.lightOn == 1) {
        this.sendData()
      }
    },
  },
  methods: {
    sendData() {
      return
    },
    buttonClick() {
      if (this.form.lightOn == 0) {
        this.form.lightOn = 1
      } else {
        this.form.lightOn = 0
      }
      this.sendData()
    }
  }
}
</script>

<style scoped lang="scss">
@import "../../sub/constant/config.scss";

::-webkit-scrollbar { 
  display: none; 
}

div[class^="check"] {
  padding-right: 8px;
  padding-left: 30px;
}

.checkBlue {
  background-color: royalblue;
}

.checkRed {
  background-color: red;
}

.checkPurple {
  background-color: magenta;
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

</style>