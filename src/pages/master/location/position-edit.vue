<template>
  <div class="container-fluid">
    <div class="container">
      <b-alert :show="!successUpdate()" variant="danger" dismissible>
        <span v-for="line in messageList" :key="line">
          {{ line }} <br>
        </span>
      </b-alert>

      <b-row>
        <b-col md="8" offset-md="2">
          <b-form v-if="show" @submit.prevent="execUpdate">
            <b-form-group>
              <label v-t="'label.id'" />
              <input v-model="form.locationCd" :readonly="!isEditable" type="text" :maxlength="validationMap.locationCd" class="form-control" :pattern="cdPattern" required>
            </b-form-group>
            <b-form-group>
              <label v-t="'label.locationName'" />
              <input v-model="form.locationName" :readonly="!isEditable" type="text" maxlength="40" class="form-control" required>
            </b-form-group>
            <b-form-group>
              <label v-t="'label.exb'" />
              <v-select v-model="vueSelected.exbIdList" :options="iExbOptions" :disabled="!isEditable" multiple :close-on-select="false" class="vue-options-multi">
                <template slot="no-options">
                  {{ vueSelectNoMatchingOptions }}
                </template>
              </v-select>
            </b-form-group>
            <b-form-group>
              <label v-t="'label.tx'" />
              <v-select v-model="vueSelected.txIdList" :options="iTxOptions" :disabled="!isEditable" multiple :close-on-select="false" class="vue-options-multi">
                <template slot="no-options">
                  {{ vueSelectNoMatchingOptions }}
                </template>
              </v-select>
            </b-form-group>

            <b-button v-if="isDeleteable" v-t="'label.delete'" type="button" variant="outline-danger" class="mr-2 my-1" @click="execDelete" />
            <b-button v-if="isEditable" v-t="'label.update'" :variant="theme" type="submit" class="mr-2 my-1" />
          </b-form>
        </b-col>
      </b-row>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { PATTERN } from '../../../sub/constant/Constants'
import * as Util from '../../../sub/util/Util'
import * as ConfigHelper from '../../../sub/helper/dataproc/ConfigHelper'
import * as HttpHelper from '../../../sub/helper/base/HttpHelper'
import * as MasterHelper from '../../../sub/helper/domain/MasterHelper'
import * as VueSelectHelper from '../../../sub/helper/ui/VueSelectHelper'
import commonmixin from '../../../components/mixin/commonmixin.vue'
import editmixin from '../../../components/mixin/editmixin.vue'

export default {
  mixins: [commonmixin, editmixin],
  data() {
    return {
      vueSelected: {
        exbIdList: null,
        txIdList: null,
      },
      form: {
        locationId: null,
        locationCd: null,
        locationName: null,
        exbIdList: [],
        txIdList: [],
      },
      validationParam: {
        locationList: [],
        exbList: [],
        txList: [],
      },
      validationMap: {
        locationCd: null,
      },
      messageList: [],
    }
  },
  computed: {
    ...mapState('app_service', [
      'exb', 'tx', 'location'
    ]),
    cdPattern(){
      return PATTERN.LOCATION_CD
    },
    iExbOptions() {
      return MasterHelper.getOptionsFromState(
        'exb',
        ConfigHelper.includesDeviceType('deviceId')? 'deviceId': 'deviceIdX',
        true,
        exb => this.validationParam.exbList.some(val => val.exbId == exb.exbId)
      )
    },
    iTxOptions() {
      return MasterHelper.getOptionsFromState(
        'tx',
        tx => MasterHelper.getLocationTxName(tx),
        true,
        tx => this.validationParam.txList.some(val => val.txId == tx.txId)
      )
    },
  },
  watch: {
    'vueSelected.exbIdList': {
      handler: function(newVal, oldVal){
        console.error(newVal, oldVal)
        this.form.exbIdList = newVal.map(val => val.value)
      },
      deep: true,
    },
    'vueSelected.txIdList': {
      handler: function(newVal, oldVal){
        this.form.txIdList = newVal.map(val => val.value)
      },
      deep: true,
    },
  },
  async mounted() {
    await this.fetchValidationData()
  },
  methods: {
    async fetchValidationData(){
      const validationData = await HttpHelper.getAppService('/core/location/validation')
      this.validationMap.locationCd = Util.getValue(validationData, 'max', 20)
    },
    successUpdate(){
      return !Util.hasValue(this.messageList)
    },
    setParam(location, vLocationList, vExbList, vTxList){
      this.messageList = []
      this.validationParam.locationList = vLocationList
      this.validationParam.exbList = vExbList
      this.validationParam.txList = vTxList
      this.form.locationId = location.locationId
      this.form.locationCd = location.locationCd
      this.form.locationType = location.locationType
      this.form.locationName = location.locationName
      this.vueSelected.exbIdList = Util.getValue(location, 'exbList', []).map(exb => VueSelectHelper.getVueSelectData(this.iExbOptions, exb.exbId)).sort((a, b) => a.label < b.label? -1: 1)
      this.vueSelected.txIdList = Util.getValue(location, 'txList', []).map(tx => VueSelectHelper.getVueSelectData(this.iTxOptions, tx.txId)).sort((a, b) => a.label < b.label? -1: 1)
    },
    validation(){
      this.messageList = []
      const locCdMap = {}
      const locNameMap = {}
      this.validationParam.locationList.forEach(location => {
        if(location.locationId != this.form.locationId){
          if(!locCdMap[location.locationCd]){
            locCdMap[location.locationCd] = []
          }
          locCdMap[location.locationCd].push(location.locationType)
          if(!locNameMap[location.locationName]){
            locNameMap[location.locationName] = []
          }
          locNameMap[location.locationName].push(location.locationType)
        }
      })
      if(locCdMap[this.form.locationCd] && locCdMap[this.form.locationCd].some(type => type == this.form.locationType)){
        this.messageList.push(this.$i18n.tnl('message.bulkUniqueFailed', { col: this.$i18n.tnl('label.locationCd'), value: this.form.locationCd }))
      }
      if(locNameMap[this.form.locationName] && locNameMap[this.form.locationName].some(type => type == this.form.locationType)){
        this.messageList.push(this.$i18n.tnl('message.bulkUniqueFailed', { col: this.$i18n.tnl('label.locationName'), value: this.form.locationName }))
      }
      return this.successUpdate()
    },
    execUpdate(){
      if(this.validation()){
        this.$parent.$emit('update', this.form)
        this.$root.$emit('bv::hide::modal', 'modalEdit')
      }
    },
    execDelete(){
      this.$parent.$emit('delete')
    },
  }
}
</script>

<style scoped lang="scss">
@import "../../../sub/constant/vue.scss";
</style>