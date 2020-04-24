<template>
  <b-container :style="cssVars">
    <b-form @submit.prevent="onSave">
        <!-- タイトル -->
        <b-form-row class="mt-3 mb-3">
          <b-col cols="1" align="middle"><img src="~/assets/icon/dot.svg" class="edit-plan-icon"></b-col>
          <b-col cols="11"><b-form-input v-model="plan.planName" :placeholder="planNameMessage" style="font-weight: bold;" :disabled="!plan.editable" @input="onPlanNameInput"></b-form-input></b-col>
        </b-form-row>
        <b-form-row>
          <b-col>
          <b-alert v-model="isPlanNameEmpty" variant="danger" class="mb-0">
            {{ planNameMessage }}
          </b-alert>
          <b-alert v-model="isPlanNameSizeError" variant="danger" class="mb-0">
            {{ planNameSizeErrorMessage }}
          </b-alert>
          <b-alert v-model="hasServerError" variant="danger" class="mb-0">
            {{ $t('message.error') }}
          </b-alert>
          </b-col>
        </b-form-row>
        <!-- 出席者 -->
        <b-form-row class="mt-3 mb-3">
          <b-col cols="1" align="middle"><img src="~/assets/icon/person.svg" class="edit-plan-icon"></b-col>
          <b-col cols="11">
          <div>
          <v-select v-model="vueSelected.potPersonList" :options="potPersonOpts" multiple :close-on-select="false" class="vue-options-multi" style="width: 380px;">
            <template slot="selected-option" slot-scope="option">
              {{ vueSelectCutOn(option) }}
            </template>
            <template slot="no-options">
              {{ vueSelectNoMatchingOptions }}
            </template>
          </v-select>
          </div>
            </b-col>
        </b-form-row>
        <b-form-row>
          <b-col>
          <b-alert v-model="isPotPersonDuplicate" variant="danger" class="mb-0">
            {{ $t('message.alreadyReserved') }}
          </b-alert>
          </b-col>
        </b-form-row>
        <!-- 日時 -->
        <b-form-row class="mt-3 mb-3">
            <b-col cols="1" align="middle"><img src="~/assets/icon/clock.svg" class="edit-plan-icon"></b-col>
            <b-col cols="4">
            <date-picker
              v-model="plan.date"
              type="date"
              :placeholder="$t('label.date')"
              size="large"
              style="width: 9rem;"
              :disabled="!plan.editable"
              @blur="onPlanDateBlur"
            >
            </date-picker>
            </b-col>
            <b-col cols="7">
            <time-picker
              is-range
              v-model="plan.timeRange"
              :start-placeholder="$t('label.start')"
              :end-placeholder="$t('label.end')"
              value-format="HH:mm:ss"
              style="width: 15rem;"
              :disabled="!plan.editable"
              @blur="onPlanDateBlur"
            >
            </time-picker>
            </b-col>
        </b-form-row>
        <b-form-row>
          <b-col>
          <b-alert v-model="isDateTimeEmpty" variant="danger" class="mb-0">
            {{ dateTimeMessage }}
          </b-alert>
          </b-col>
        </b-form-row>
        <b-form-row class="mt-3 mb-3">
          <div>
        <toggle-button :value="plan.isLocation"
               :color="{checked: '#66cdaa', unchecked: '#87cefa', disabled: '#cccccc'}"
               :sync="true"
               :labels="{checked: $t('label.initLocation'), unchecked: $t('label.meetingRoom')}"
               :width="locationToggleWidth" @change="onChangeToggle"/>
          </div>
        </b-form-row>
        <!-- 会議室 -->
        <b-form-row v-if="!plan.isLocation" class="mt-3">
          <b-col cols="1" align="middle"><img src="~/assets/icon/location.svg" class="edit-plan-icon"></b-col>
          <b-col cols="11">
          <v-select v-model="vueSelected.zone" :options="zoneOpts" class="inputSelect vue-options" style="width: 380px;" :disabled="!plan.editable">
            <template slot="selected-option" slot-scope="option">
              {{ vueSelectCutOnWithWidth(option, 380) }}
            </template>
            <template slot="no-options">
              {{ vueSelectNoMatchingOptions }}
            </template>
          </v-select>
            <span style="color: #868e96;font-size: 80%;font-weight: 400;">{{ meetingRoomMessage }}</span>
          </b-col>
        </b-form-row>
        <b-form-row v-if="!plan.isLocation">
          <b-col>
          <b-alert v-model="isZoneDuplicate" variant="danger" class="mb-0">
            {{ $t('message.alreadyReserved') }}
          </b-alert>
          </b-col>
        </b-form-row>
        <!-- 場所 -->
        <b-form-row v-if="plan.isLocation" class="mt-3">
          <b-col cols="1" align="middle"><img src="~/assets/icon/location.svg" class="edit-plan-icon"></b-col>
          <b-col cols="11">
          <v-select v-model="vueSelected.location" :options="locationOpts" class="inputSelect vue-options" style="width: 380px;" :disabled="!plan.editable">
            <template slot="selected-option" slot-scope="option">
              {{ vueSelectCutOnWithWidth(option, 380) }}
            </template>
            <template slot="no-options">
              {{ vueSelectNoMatchingOptions }}
            </template>
          </v-select>
            <span style="color: #868e96;font-size: 80%;font-weight: 400;">{{ locationMessage }}</span>
          </b-col>
        </b-form-row>
        <b-form-row v-if="plan.isLocation">
          <b-col>
          <b-alert v-model="isLocationDuplicate" variant="danger" class="mb-0">
            {{ $t('message.alreadyReserved') }}
          </b-alert>
          </b-col>
        </b-form-row>
        <!-- 物 -->
        <b-form-row class="mt-3">
          <b-col cols="1" align="middle"><img src="~/assets/icon/box.svg" class="edit-plan-icon"></b-col>
          <b-col cols="11">
          <v-select v-model="vueSelected.potThing" :options="potThingOpts" class="inputSelect vue-options" style="width: 380px;" :disabled="!plan.editable">
            <template slot="selected-option" slot-scope="option">
              {{ vueSelectCutOnWithWidth(option, 380) }}
            </template>
            <template slot="no-options">
              {{ vueSelectNoMatchingOptions }}
            </template>
          </v-select>
          <span style="color: #868e96;font-size: 80%;font-weight: 400;">{{ potThingMessage }}</span></b-col>
        </b-form-row>
        <b-form-row>
          <b-col>
          <b-alert v-model="isPotThingDuplicate" variant="danger" class="mb-0">
            {{ $t('message.alreadyReserved') }}
          </b-alert>
          </b-col>
        </b-form-row>
        <!-- 説明 -->
        <b-form-row class="mt-3 mb-3">
          <b-col cols="1" align="middle"><img src="~/assets/icon/notebook.svg" class="edit-plan-icon"></b-col>
          <b-col cols="11">
          <b-form-input v-model="plan.description" :placeholder="descriptionMessage"></b-form-input>
          </b-col>
        </b-form-row>
        <!-- 登録者 -->
        <b-form-row class="mt-3 mb-3">
          <b-col>
          <span>{{ $t('label.registeredPerson') }}:&nbsp;<span style="font-weight: bold;">{{ userName }}</span></span>
          </b-col>
        </b-form-row>
        <!-- ボタン -->
        <b-form-row class="mt-3 mb-0">
          <b-col cols="2"><b-button :variant="theme" type="submit" class="saveBtn">{{ $t('label.save') }}</b-button></b-col>
          <b-col v-if="plan && plan.planId" cols="10"><b-button @click="onDelete" class="delBtn">{{ $t('label.remove') }}</b-button></b-col>
        </b-form-row>
    </b-form>
  </b-container>
</template>
<script>
import commonmixin from '../mixin/commonmixin.vue'
import editmixin from '../mixin/editmixin.vue'
import * as Util from '../../sub/util/Util'
import * as AppServiceHelper from '../../sub/helper/dataproc/AppServiceHelper.js'
import { importElementUI } from '../../sub/helper/ui/ViewHelper'
import { DISP } from '../../sub/constant/config'
import { DatePicker, TimePicker } from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import * as HttpHelper from '../../sub/helper/base/HttpHelper'
import moment from 'moment'
import { ToggleButton } from 'vue-js-toggle-button'

export default {
  mixins: [commonmixin, editmixin],
  components: {
    DatePicker, TimePicker, ToggleButton
  },
  props: {
    showEdit: null,
    name: null,
    id: null,
    appServicePath: null,
    showEdit: false,
    locale: null,
    plan: null,
    zoneOpts: null,
    locationOpts: null,
    potThingOpts: null,
    potPersonOpts: null,
    vueSelected: null,
    currentUser: null,
  },
  data () {
    return {
      isZoneDuplicate: false,
      isLocationDuplicate: false,
      isPotThingDuplicate: false,
      isPotPersonDuplicate: false,
      isPlanNameEmpty: false,
      isDateTimeEmpty: false,
      isPlanNameSizeError: false,
      hasServerError: false
    }
  },
  watch: {
    showEdit: {
      handler: function(newVal, oldVal){
        if (newVal) {
          this.isZoneDuplicate = false
          this.isLocationDuplicate = false
          this.isPotThingDuplicate = false
          this.isPotPersonDuplicate = false
          this.isPlanNameEmpty = false
          this.isDateTimeEmpty = false
          this.isPlanNameSizeError = false
          this.hasServerError = false
        }
      },
      deep: false,
    },
    'vueSelected.zone': {
      handler: function(newVal, oldVal){
        this.isZoneDuplicate = false
        this.plan.zoneId = newVal == null ? null : newVal.value
        if (this.plan.zoneId) {
          this.isDuplicate('zones', this.plan.zoneId, (v) => this.isZoneDuplicate = v)
        }
      },
      deep: false,
    },
    'vueSelected.location': {
      handler: function(newVal, oldVal){
        this.isLocationDuplicate = false
        this.plan.locationId = newVal == null ? null : newVal.value
        if (this.plan.locationId) {
          this.isDuplicate('locations', this.plan.locationId, (v) => this.isLocationDuplicate = v)
        }
      },
      deep: false,
    },
    'vueSelected.potThing': {
      handler: function(newVal, oldVal){
        this.isPotThingDuplicate = false
        this.plan.potThingId = newVal == null ? null : newVal.value
        if (this.plan.potThingId) {
          this.isDuplicate('pots', this.plan.potThingId, (v) => this.isPotThingDuplicate = v)
        }
      },
      deep: false,
    },
    'vueSelected.potPersonList': {
      handler: function(newVal, oldVal){
        this.isPotPersonDuplicate = false
        this.plan.potPersonIds = newVal.map(e => e.value)
        this.plan.potPersonIds.map(id => {
          this.isDuplicate('pots', id, (v) => {
            if (!this.isPotPersonDuplicate) this.isPotPersonDuplicate = v
          })
        })
      },
      deep: true,
    },
  },
  computed: {
    locationToggleWidth() {
      return this.locale == 'ja' ? 60 : 100
    },
    userName() {
      return this.currentUser && this.currentUser.isAd ? this.plan.potName : this.plan.userName
    },
    planNameMessage() {
      return this.$t('message.required', {target: this.$t('label.planName')})
    },
    planNameSizeErrorMessage() {
      return this.$t('message.bulkSizeFailed', {col: this.$t('label.planName'), value: this.plan.planName,min: 1, max: 40})
    },
    participantMessage() {
      return this.$t('message.required', {target: this.$t('label.participant')})
    },
    dateTimeMessage() {
      return this.$t('message.required', {target: this.$t('label.dt')})
    },
    meetingRoomMessage() {
      return this.$t('message.required', {target: this.$t('label.meetingRoom')})
    },
    locationMessage() {
      return this.$t('message.required', {target: this.$t('label.initLocation')})
    },
    potThingMessage() {
      return this.$t('message.required', {target: this.$t('label.potThing')})
    },
    descriptionMessage() {
      return this.$t('message.required', {target: this.$t('label.description')})
    },
    cssVars() {
      return {
      '--editPlanHeaderBgColor': DISP.PLAN.EDIT_PLAN_HEADER_BG_COLOR,
      }
    },
  },
  async mounted() {
    importElementUI()
  },
  methods: {
    onPlanNameInput(e) {
      if (this.isPlanNameEmpty) this.isPlanNameEmpty = (!this.plan.planName || !this.plan.planName.trim())
    },
    onPlanDateBlur(e) {
      if (this.isDateTimeEmpty) {
        this.isDateTimeEmpty = (!this.plan.date)
        if (!this.isDateTimeEmpty) this.isDateTimeEmpty = (!this.plan.timeRange)
      }
      if (!this.isDateTimeEmpty) {
        if (this.plan.zoneId) {
          this.isDuplicate('zones', this.plan.zoneId, (v) => this.isZoneDuplicate = v)
        }
        if (this.plan.locationId) {
          this.isDuplicate('locations', this.plan.locationId, (v) => this.isLocationDuplicate = v)
        }
        if (this.plan.potThingId) {
          this.isDuplicate('pots', this.plan.potThingId, (v) => this.isPotThingDuplicate = v)
        }
        this.isPotPersonDuplicate = false
        this.plan.potPersonIds.map(id => {
          this.isDuplicate('pots', id, (v) => {
            if (!this.isPotPersonDuplicate) this.isPotPersonDuplicate = v
          })
        })
      }
    },
    onChangeToggle(e) {
      this.plan.isLocation = !this.plan.isLocation
      if (this.plan.isLocation) {
        this.plan.zoneId = null
        this.vueSelected.zone = null
      } else {
        this.plan.locationId = null
        this.vueSelected.location = null
      }
    },
    async isDuplicate(filterType, filterId, callback) {
      const date = moment(this.plan.date).format("YYYY-MM-DD")
      const sDt = `${date}T${this.plan.timeRange[0]}.000`
      const eDt = `${date}T${this.plan.timeRange[1]}.000`
      try {
        const data = await HttpHelper.getAppService(`${this.appServicePath}?startDt=${sDt}&endDt=${eDt}&filterType=${filterType}&filterId=${filterId}&isDuplicate=true`)
        if (Array.isArray(data)) {
          const self = this
          callback(data[0].plans.filter(e => e.planId != self.plan.planId).length > 0)
        }
      }
      catch(e) {
        console.error(e)
        this.hasServerError = true
      }
    },
    async onSaving() {
      const date = moment(this.plan.date).format("YYYY-MM-DD")
      this.plan.startDt = new Date(`${date} ${this.plan.timeRange[0]}`)
      this.plan.endDt = new Date(`${date} ${this.plan.timeRange[1]}`)

      const potPersonIds = this.plan.potPersonIds.length > 0 
        ? this.plan.potPersonIds.concat(this.plan.currentUserPotIds)
        : this.plan.currentUserPotIds
      this.plan.potPersonIds = potPersonIds.join()

      try {
        if (this.plan.planId == null) {
          return await AppServiceHelper.save(this.appServicePath, this.plan, this.updateOnlyNN)
        }
        return await AppServiceHelper.update(this.appServicePath, this.plan)
      }
      catch(e) {
        console.error(e)
        this.hasServerError = true
      }
    },
    async onDelete(event) {
      event.schedule = { data: { planId: this.plan.planId } }
      this.$emit('delete', event);
    },
    async onSave(event) {
      if (this.validate()) {
        await this.save(event)
      }
    },
    async onSaved() {
      this.$emit('doneSave', this.message);
    },
    validate() {
      this.isPlanNameEmpty = (!this.plan.planName || !this.plan.planName.trim())

      this.isPlanNameSizeError = false
      if (!this.isPlanNameEmpty) {
        const title = this.plan.planName.trim()
        if (title.length > 40) {
          this.isPlanNameSizeError = true
        }
      }

      this.isDateTimeEmpty = (!this.plan.date)

      if (!this.isDateTimeEmpty) this.isDateTimeEmpty = (!this.plan.timeRange)

      return (!this.isPlanNameEmpty && !this.isDateTimeEmpty && !this.isPlanNameSizeError)
    }
  }
}
</script>
<style>
.saveBtn {
  color: #ffffff;
  background-color: var(--editPlanHeaderBgColor);
  border-color: var(--editPlanHeaderBgColor);
  font-weight: bold;
}
.delBtn {
  color: #000000;
  background-color: #ffffff;
  border-color: #000000;
  font-weight: bold;
}
.edit-plan-icon {
  width: 14px;
  height: 14px;
  vertical-align: bottom;
  display: inline-block;
}
</style>