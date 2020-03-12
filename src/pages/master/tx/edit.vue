<template>
  <div class="container-fluid">
    <breadcrumb :items="items" />
    <div class="container">
      <alert :message="message" />

      <b-row>
        <b-col md="8" offset-md="2">
          <b-form v-if="show" @submit.prevent="save">
            <b-form-group v-if="showMinorHead" v-show="showTx('minor')">
              <label v-t="'label.minor'" />
              <input v-model="form.minor" :readonly="!isEditable" :required="requiredMinor" type="number" min="0" max="65535" class="form-control">
            </b-form-group>
            <b-form-group>
              <label v-t="'label.type'" />
              <b-form-select v-model="form.sensorId" :options="sensorOptionsTx" :disabled="!isEditable" :readonly="!isEditable" class="mb-3 ml-3 col-4" />
            </b-form-group>
            <b-form-group v-show="showTx('btxId')">
              <label v-t="'label.btxId'" />
              <input v-model="form.btxId" :required="showTx('btxId')" :readonly="!isEditable" type="number" min="0" max="65535" class="form-control">
            </b-form-group>
            <b-form-group v-show="isShown('TX.WITH', 'major')">
              <label v-t="'label.major'" />
              <input v-model="form.major" :required="isMajorRequired" :readonly="!isEditable" type="number" min="0" max="65535" class="form-control">
            </b-form-group>
            <b-form-group v-if="showMinorMid" v-show="showTx('minor')">
              <label v-t="'label.minor'" />
              <input v-model="form.minor" :readonly="!isEditable" :required="requiredMinor" type="number" min="0" max="65535" class="form-control">
            </b-form-group>
            <b-form-group v-show="isShown('TX.WITH', 'displayName')">
              <label v-t="'label.displayName'" />
              <input v-model="form.displayName" :readonly="!isEditable" type="text" maxlength="3" class="form-control">
            </b-form-group>
            <b-form-group v-show="isShown('TX.WITH', 'description')">
              <label v-t="'label.description'" />
              <b-form-textarea v-model="form.description" :rows="3" :max-rows="6" :readonly="!isEditable" maxlength="1000" />
            </b-form-group>
            <b-form-group>
              <b-form-checkbox id="dispPos" v-model="form.dispPos" :value="1" :unchecked-value="0">
                <span v-text="$i18n.tnl('label.dispPos')" />
              </b-form-checkbox>
            </b-form-group>
            <b-form-group v-if="isShown('TX.WITH', 'dispPir')">
              <b-form-checkbox id="dispPir" v-model="form.dispPir" :value="2" :unchecked-value="0">
                <span v-text="$i18n.tnl('label.dispPir')" />
              </b-form-checkbox>
            </b-form-group>
            <b-form-group v-if="isShown('TX.WITH', 'dispAlways')">
              <b-form-checkbox id="dispAlways" v-model="form.dispAlways" :value="4" :unchecked-value="0">
                <span v-text="$i18n.tnl('label.dispAlways')" />
              </b-form-checkbox>
            </b-form-group>
            <b-form-row class="mb-3">
              <b-col>
                <label v-t="'label.area'" />
                <v-select v-model="vueSelected.area" :options="areaOptions" :disabled="!isEditable" :readonly="!isEditable" class="vue-options-lg">
                  <template slot="no-options">
                    {{ vueSelectNoMatchingOptions }}
                  </template>
                </v-select>
              </b-col>
              <b-col>
                <label v-t="'label.locationName'" />
                <v-select v-model="vueSelected.location" :options="getLocationOptions()" :disabled="!isEditable" :readonly="!isEditable" class="vue-options-lg">
                  <template slot="no-options">
                    {{ vueSelectNoMatchingOptions }}
                  </template>
                </v-select>
              </b-col>
            </b-form-row>
            <b-button v-t="'label.back'" type="button" variant="outline-danger" class="mr-2 my-1" @click="backToList" />
            <b-button v-if="isEditable" :variant="theme" type="submit" class="mr-2 my-1" @click="doBeforeSubmit(false)">
              {{ $i18n.tnl(`label.${isUpdate? 'update': 'register'}`) }}
            </b-button>
            <b-button v-if="isRegistable && !isUpdate" v-t="'label.registerAgain'" :variant="theme" type="submit" class="my-1" @click="doBeforeSubmit(true)" />
          </b-form>
        </b-col>
      </b-row>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import _ from 'lodash'
import { APP } from '../../../sub/constant/config'
import { SENSOR } from '../../../sub/constant/Constants'
import * as Util from '../../../sub/util/Util'
import * as AppServiceHelper from '../../../sub/helper/dataproc/AppServiceHelper'
import * as MasterHelper from '../../../sub/helper/domain/MasterHelper'
import * as ValidateHelper from '../../../sub/helper/dataproc/ValidateHelper'
import * as ViewHelper from '../../../sub/helper/ui/ViewHelper'
import * as VueSelectHelper from '../../../sub/helper/ui/VueSelectHelper'
import breadcrumb from '../../../components/layout/breadcrumb.vue'
import commonmixin from '../../../components/mixin/commonmixin.vue'
import editmixin from '../../../components/mixin/editmixin.vue'
import alert from '../../../components/parts/alert.vue'

export default {
  components: {
    breadcrumb,
    alert,
  },
  mixins: [commonmixin, editmixin],
  data() {
    return {
      name: 'tx',
      id: 'txId',
      backPath: '/master/tx',
      appServicePath: '/core/tx',
      items: ViewHelper.createBreadCrumbItems('master', {text: 'masterTx', href: '/master/tx'}, ViewHelper.getDetailCaptionKey(this.$store.state.app_service.tx.txId)),
      form: Util.extract(this.$store.state.app_service.tx, [
        'txId', 'btxId', 'major', 'minor', 'dispPos', 'dispPir', 'dispAlways',
        'txSensorList.0.sensor.sensorId',
        'locationId', 'location.areaId',
      ]),
      vueSelected: {
        area: null,
        location: null,
      },
      defValue: {
        'dispPos': 1,
      },
    }
  },
  computed: {
    isMajorRequired() {
      return APP.TX.MAJOR_REQUIRED
    },
    showMinorMid() {
      return !this.showMinorHead
    },
    showMinorHead() {
      return APP.TX.BTX_MINOR == 'minor'
    },
    requiredMinor() {
      return this.showTx('minor') && this.form.sensorId != SENSOR.TEMPERATURE
    },
    ...mapState('app_service', [
      'tx',
    ]),
  },
  watch: {
    'vueSelected.area': {
      handler: function(newVal, oldVal){
        this.form.areaId = Util.getValue(newVal, 'value')
        this.vueSelected.location = null
      },
      deep: true,
    },
    'vueSelected.location': {
      handler: function(newVal, oldVal){
        this.form.locationId = Util.getValue(newVal, 'value')
      },
      deep: true,
    },
  },
  async mounted() {
    Util.applyDef(this.form, this.defValue)
    this.vueSelected.area = VueSelectHelper.getVueSelectData(this.areaOptions, this.form.areaId)
    this.$nextTick(() => this.vueSelected.location = VueSelectHelper.getVueSelectData(this.getLocationOptions(), this.form.locationId))
    ValidateHelper.setCustomValidationMessage()
    VueSelectHelper.disabledAllSubmit()
  },
  methods: {
    getLocationOptions(){
      return MasterHelper.getOptionsFromState('location', false, true, location => location.areaId == this.form.areaId)
    },
    showTx(col) {
      switch(APP.TX.BTX_MINOR) {
      case 'both':
        return true
      case 'minor':
        return col == 'minor'
      case 'btxId':
        return col == 'btxId'
      }
      return true
    },
    onBeforeReload(){
      this.form.sensorId = null
      this.vueSelected.area = VueSelectHelper.getVueSelectData(this.areaOptions)
      this.vueSelected.location = null
    },
    async onSaved(){
    },
    async onSaving() {
      const txId = Util.hasValue(this.form.txId)? this.form.txId: -1
      switch(APP.TX.BTX_MINOR) {
      case 'minor':
        this.form.btxId = this.form.minor
        break
      case 'btxId':
        this.form.minor = this.form.btxId
      }
      const disp = this.form.dispPos |  this.form.dispPir | this.form.dispAlways
      const entity = {
        ...this.form,
        txId,
        disp,
        txSensorList: this.form.sensorId? [
          {txSensorPK: {sensorId: this.form.sensorId}}
        ]: null
      }
      return await AppServiceHelper.bulkSave(this.appServicePath, [entity])
    },
  }
}
</script>

<style scoped lang="scss">
@import "../../../sub/constant/vue.scss";
</style>