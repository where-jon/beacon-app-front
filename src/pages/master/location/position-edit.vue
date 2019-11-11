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
              <input v-model="form.locationCd" :readonly="!isEditable" type="text" maxlength="20" class="form-control" :pattern="cdPattern" required>
            </b-form-group>
            <b-form-group>
              <label v-t="'label.locationName'" />
              <input v-model="form.locationName" :readonly="!isEditable" type="text" maxlength="40" class="form-control" required>
            </b-form-group>
            <b-form-group>
              <label v-t="'label.exb'" />
              <v-select v-model="vueSelected.exbIdList" :options="exbOptions" :disabled="!isEditable" multiple :close-on-select="false" class="vue-options-multi">
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
import * as StateHelper from '../../../sub/helper/dataproc/StateHelper'
import * as VueSelectHelper from '../../../sub/helper/ui/VueSelectHelper'
import commonmixin from '../../../components/mixin/commonmixin.vue'
import editmixin from '../../../components/mixin/editmixin.vue'
import alert from '../../../components/parts/alert.vue'

export default {
  components: {
    alert,
  },
  mixins: [commonmixin, editmixin],
  data() {
    return {
      vueSelected: {
        exbIdList: null,
      },
      form: {
        locationId: null,
        locationCd: null,
        locationName: null,
        exbIdList: [],
      },
      validationParam: {
        locationList: [],
        exbList: [],
      },
      messageList: [],
    }
  },
  computed: {
    ...mapState('app_service', [
      'exb', 'location'
    ]),
    cdPattern(){
      return PATTERN.LOCATION_CD
    },
    exbOptions() {
      return StateHelper.getOptionsFromState(
        'exb',
        ConfigHelper.includesDeviceType('deviceId')? 'deviceId': 'deviceIdX',
        true,
        exb => this.validationParam.exbList.some(val => val.exbId == exb.exbId)
      )
    },
  },
  watch: {
    'vueSelected.exbIdList': {
      handler: function(newVal, oldVal){
        this.form.exbIdList = newVal.map(val => val.value)
      },
      deep: true,
    },
  },
  methods: {
    successUpdate(){
      return !Util.hasValue(this.messageList)
    },
    setParam(location, vLocationList, vExbList){
      this.messageList = []
      this.validationParam.locationList = vLocationList
      this.validationParam.exbList = vExbList
      this.form.locationId = location.locationId
      this.form.locationCd = location.locationCd
      this.form.locationType = location.locationType
      this.form.locationName = location.locationName
      this.vueSelected.exbIdList = Util.getValue(location, 'exbList', []).map(exb => VueSelectHelper.getVueSelectData(this.exbOptions, exb.exbId)).sort((a, b) => a.label < b.label? -1: 1)
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