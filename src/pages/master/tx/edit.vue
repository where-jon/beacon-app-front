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
            <b-form-group v-show="isShown('TX.WITH', 'category')">
              <b-form-row>
                <label v-t="'label.category'" class="d-flex align-items-center" />
                <v-select v-model="vueSelected.category" :options="categoryOptions" :disabled="!isEditable" :readonly="!isEditable" class="mb-3 ml-2 vue-options-lg">
                  <template slot="no-options">
                    {{ vueSelectNoMatchingOptions }}
                  </template>
                </v-select>
              </b-form-row>
            </b-form-group>
            <b-form-group v-show="isShown('TX.WITH', 'group')">
              <b-form-row>
                <label v-t="'label.group'" class="d-flex align-items-center" />
                <v-select v-model="vueSelected.group" :options="groupOptions" :disabled="!isEditable" :readonly="!isEditable" class="mb-3 ml-2 vue-options-lg">
                  <template slot="no-options">
                    {{ vueSelectNoMatchingOptions }}
                  </template>
                </v-select>
              </b-form-row>
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
            <b-form-group v-if="form.x != null || form.y != null">
              <label v-t="'label.locationZoneName'" />
              <input v-model="form.locationName" :readonly="!isEditable" type="text" maxlength="20" class="form-control" :required="form.x != null || form.y != null">
            </b-form-group>
            <b-form-group v-if="form.x != null">
              <label v-t="'label.locationX'" />
              <input v-model="form.x" :readonly="!isEditable" type="number" min="0" class="form-control">
            </b-form-group>
            <b-form-group v-if="form.y != null">
              <label v-t="'label.locationY'" />
              <input v-model="form.y" :readonly="!isEditable" type="number" min="0" class="form-control">
            </b-form-group>
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
import { CATEGORY, SENSOR } from '../../../sub/constant/Constants'
import * as Util from '../../../sub/util/Util'
import * as AppServiceHelper from '../../../sub/helper/dataproc/AppServiceHelper'
import * as SensorHelper from '../../../sub/helper/domain/SensorHelper'
import * as StateHelper from '../../../sub/helper/dataproc/StateHelper'
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
      items: ViewHelper.createBreadCrumbItems('master', {text: 'tx', href: '/master/tx'}, ViewHelper.getDetailCaptionKey(this.$store.state.app_service.tx.txId)),
      form: Util.extract(this.$store.state.app_service.tx, [
        'txId', 'btxId', 'major', 'minor', 'potTxList.0.pot.displayName', 'mapImage', 'dispPos', 'dispPir', 'dispAlways',
        'txSensorList.0.sensor.sensorId', 'locationId', 'location.locationName', 'location.x', 'location.y', 'location',
        'potTxList.0.pot.potId', 'potTxList.0.pot.potCd', 'potTxList.0.pot.displayName', 'potTxList.0.pot.description',
        'potTxList.0.pot.potCategoryList.0.category.categoryId',
        'potTxList.0.pot.potGroupList.0.group.groupId',
      ]),
      vueSelected: {
        category: null,
        group: null,
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
    categoryOptions() {
      return StateHelper.getOptionsFromState('category', false, true, 
        category => CATEGORY.POT_AVAILABLE.includes(category.categoryType)
      )
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
      'categories',
      'groups',
      'sensors',
      'pots',
      'potImages',
    ]),
  },
  watch: {
    'vueSelected.category': {
      handler: function(newVal, oldVal){
        this.form.categoryId = Util.getValue(newVal, 'value', null)
      },
      deep: true,
    },
    'vueSelected.group': {
      handler: function(newVal, oldVal){
        this.form.groupId = Util.getValue(newVal, 'value', null)
      },
      deep: true,
    },
  },
  async mounted() {
    Util.applyDef(this.form, this.defValue)
    StateHelper.load('sensor')
    await Promise.all(['category', 'group'].map(StateHelper.load))
    this.vueSelected.category = VueSelectHelper.getVueSelectData(this.categoryOptions, this.form.categoryId)
    this.vueSelected.group = VueSelectHelper.getVueSelectData(this.groupOptions, this.form.groupId)
    ValidateHelper.setCustomValidationMessage()
  },
  methods: {
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
      this.vueSelected.category = VueSelectHelper.getVueSelectData(this.categoryOptions, null)
      this.vueSelected.group = VueSelectHelper.getVueSelectData(this.groupOptions, null)
    },
    onSaved(){
      StateHelper.setForceFetch('pot', true)
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
      const pot = await this.getRelatedPot(txId)
      if (pot) {
        pot.potTxList = null // potTx関連を削除
        pot.potUserList = null // ここではpotUser関連は登録しない
        pot.user = null
      }
      if (this.form.location) {
        var location = _.cloneDeep(this.form.location)
        location.locationName = Util.getValue(this.form, 'locationName', SensorHelper.createTxLocationDummyName(this.form))
        location.posId = this.form.btxId * -1
        location.x = Util.hasValue(this.form.x)? this.form.x: null
        location.y = Util.hasValue(this.form.y)? this.form.y: null
      }
      const entity = {
        ...this.form,
        txId,
        disp,
        location,
        potTxList: pot? [{potTxPK:{txId, potId: pot.potId}, pot}]: null,
        txSensorList: this.form.sensorId? [
          {txSensorPK: {sensorId: this.form.sensorId}}
        ]: null
      }
      return await AppServiceHelper.bulkSave(this.appServicePath, [entity])
    },
    async getRelatedPot(txId) {
      StateHelper.setForceFetch('pot', true)
      await StateHelper.load('pot')
      const randName = () =>  txId + '_' + (new Date().getTime() % 10000)
      const relatedPot = _.find(this.pots, (pot) => pot.potId == this.form.potId)
      const isPotForm = this.form.potId || this.form.categoryId || this.form.groupId
          || this.form.displayName || this.form.description

      let newPot = {}
      if (!relatedPot) {
        if (!isPotForm) {
          return null
        } else {
          newPot.potId = -2
          newPot.potCd = randName()
          newPot.potName = randName()
        }
      } else {
        newPot = _.cloneDeep(relatedPot)
      }
      newPot.potCd = this.form.potCd || newPot.potCd
      newPot.displayName = this.form.displayName || newPot.displayName
      newPot.description = this.form.description != null? this.form.description: newPot.description

      newPot.potCategoryList = this.form.categoryId? [ {potCategoryPK: {categoryId: this.form.categoryId}} ]: null
      const category = _.find(this.categories, (cat) => cat.categoryId == this.form.categoryId)
      newPot.potType = category ? category.categoryType : CATEGORY.getTypes()[0].value

      newPot.potGroupList = this.form.groupId? [ {potGroupPK: {groupId: this.form.groupId}} ]: null
      newPot.tx = null
      return newPot
    },
  }
}
</script>

<style scoped lang="scss">
@import "../../../sub/constant/vue.scss";
</style>