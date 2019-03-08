<template>
  <div>
    <breadcrumb :items="items" />
    <div class="container">
      <alert :message="message" />

      <b-row>
        <b-col md="8" offset-md="2">
          <b-form v-if="show" @submit.prevent="onSubmit">
            <b-form-group v-if="hasId" v-show="isShown('TX_WITH_TXID')">
              <label v-t="'label.txId'" />
              <b-form-input v-model="form.txId" type="text" readonly="readonly" />
            </b-form-group>
            <b-form-group v-if="showMinorHead" v-show="showTx('minor')">
              <label v-t="'label.minor'" />
              <input v-model="form.minor" :readonly="!isEditable" :required="requiredMinor" type="number" min="0" max="65535" class="form-control">
            </b-form-group>
            <b-form-group>
              <label v-t="'label.type'" />
              <b-form-select v-model="form.sensorId" :options="sensorOptionsTx" :disabled="!isEditable" :readonly="!isEditable" class="mb-3 ml-3 col-4" />
            </b-form-group>
            <b-form-group v-show="isShown('TX_WITH_CATEGORY')">
              <label v-t="'label.category'" />
              <b-form-select v-model="form.categoryId" :options="categoryOptions" :disabled="!isEditable" :readonly="!isEditable" class="mb-3 ml-3 col-4" />
            </b-form-group>
            <b-form-group v-show="isShown('TX_WITH_GROUP')">
              <label v-t="'label.group'" />
              <b-form-select v-model="form.groupId" :options="groupOptions" :disabled="!isEditable" :readonly="!isEditable" class="mb-3 ml-3 col-4" />
            </b-form-group>
            <b-form-group v-show="showTx('btxId')">
              <label v-t="'label.btxId'" />
              <input v-model="form.btxId" :required="showTx('btxId')" :readonly="!isEditable" type="number" min="0" max="65535" class="form-control">
            </b-form-group>
            <b-form-group v-show="isShown('TX_WITH_MAJOR')">
              <label v-t="'label.major'" />
              <input v-model="form.major" :required="isMajorRequired" :readonly="!isEditable" type="number" min="0" max="65535" class="form-control">
            </b-form-group>
            <b-form-group v-if="showMinorMid" v-show="showTx('minor')">
              <label v-t="'label.minor'" />
              <input v-model="form.minor" :readonly="!isEditable" :required="requiredMinor" type="number" min="0" max="65535" class="form-control">
            </b-form-group>
            <b-form-group>
              <label v-t="'label.txName'" />
              <input v-model="form.txName" :readonly="!isEditable" type="text" maxlength="20" class="form-control">
            </b-form-group>
            <b-form-group v-show="isShown('TX_WITH_DISPLAY_NAME')">
              <label v-t="'label.displayName'" />
              <input v-model="form.displayName" :readonly="!isEditable" type="text" maxlength="3" class="form-control">
            </b-form-group>
            <b-form-group v-show="isShown('TX_WITH_DESCRIPTION')">
              <label v-t="'label.description'" />
              <b-form-textarea v-model="form.description" :rows="3" :max-rows="6" :readonly="!isEditable" maxlength="1000" />
            </b-form-group>
            <b-form-group>
              <b-form-checkbox id="dispPos" v-model="form.dispPos" :value="1" :unchecked-value="0">
                <span v-text="$i18n.tnl('label.dispPos')" />
              </b-form-checkbox>
            </b-form-group>
            <b-form-group>
              <b-form-checkbox id="dispPir" v-model="form.dispPir" :value="2" :unchecked-value="0">
                <span v-text="$i18n.tnl('label.dispPir')" />
              </b-form-checkbox>
            </b-form-group>
            <b-form-group v-if="isShown('TX_WITH_DISP_ALWAYS')">
              <b-form-checkbox id="dispAlways" v-model="form.dispAlways" :value="4" :unchecked-value="0">
                <span v-text="$i18n.tnl('label.dispAlways')" />
              </b-form-checkbox>
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
            <b-button v-if="isEditable" :variant="theme" type="submit" class="mr-2 my-1" @click="register(false)">
              {{ $i18n.tnl(`label.${isUpdate? 'update': 'register'}`) }}
            </b-button>
            <b-button v-if="isRegistable && !isUpdate" v-t="'label.registerAgain'" :variant="theme" type="submit" class="my-1" @click="register(true)" />
          </b-form>
        </b-col>
      </b-row>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import _ from 'lodash'
import * as ViewHelper from '../../../sub/helper/ViewHelper'
import * as HtmlUtil from '../../../sub/util/HtmlUtil'
import * as Util from '../../../sub/util/Util'
import editmixinVue from '../../../components/mixin/editmixin.vue'
import breadcrumb from '../../../components/layout/breadcrumb.vue'
import alert from '../../../components/parts/alert.vue'
import { getButtonTheme } from '../../../sub/helper/ThemeHelper'
import * as AppServiceHelper from '../../../sub/helper/AppServiceHelper'
import * as StateHelper from '../../../sub/helper/StateHelper'
import { APP } from '../../../sub/constant/config.js'
import { CATEGORY, SENSOR } from '../../../sub/constant/Constants'

export default {
  components: {
    breadcrumb,
    alert,
  },
  mixins: [editmixinVue],
  data() {
    const labelTx = this.$i18n.tnl('label.tx')
    return {
      name: 'tx',
      id: 'txId',
      backPath: '/master/tx',
      appServicePath: '/core/tx',
      form: ViewHelper.extract(this.$store.state.app_service.tx, [
        'txId', 'btxId', 'major', 'minor', 'txName', 'potTxList.0.pot.displayName', 'mapImage', 'dispPos', 'dispPir', 'dispAlways',
        'txSensorList.0.sensor.sensorId', 'locationId', 'location.x', 'location.y', 'location',
        'potTxList.0.pot.potId', 'potTxList.0.pot.potCd', 'potTxList.0.pot.displayName', 'potTxList.0.pot.description',
        'potTxList.0.pot.potCategoryList.0.category.categoryId',
        'potTxList.0.pot.potGroupList.0.group.groupId',
      ]),
      defValue: {
        'dispPos': 1,
      },
      items: [
        {
          text: this.$i18n.tnl('label.master'),
          active: true
        },
        {
          text: labelTx,
          href: '/master/tx'
        },
        {
          text: this.$i18n.tnl(Util.getDetailCaptionKey(this.$store.state.app_service.tx.txId)),
          active: true
        },
      ]
    }
  },
  computed: {
    hasId(){
      return Util.hasValue(this.form.txId)
    },
    theme () {
      const theme = getButtonTheme()
      return 'outline-' + theme
    },
    isMajorRequired() {
      return APP.TX_MAJOR_REQUIRED
    },
    sensorOptionsTx() {
      let options = this.sensorOptions('tx')
      return options
    },
    categoryOptions() {
      return StateHelper.getOptionsFromState('category', false, false, 
        category => CATEGORY.POT_AVAILABLE.includes(category.categoryType)
      )
    },
    showMinorMid() {
      return !this.showMinorHead
    },
    showMinorHead() {
      return !APP.TX_WITH_TXID && APP.TX_BTX_MINOR == 'minor'
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
  mounted() {
    ViewHelper.applyDef(this.form, this.defValue)
    StateHelper.load('sensor')
    StateHelper.load('category')
    StateHelper.load('group')
    HtmlUtil.setCustomValidationMessage()
  },
  methods: {
    showTx(col) {
      switch(APP.TX_BTX_MINOR) {
      case 'both':
        return true
      case 'minor':
        return col == 'minor'
      case 'btxId':
        return col == 'btxId'
      }
      return true
    },
    afterCrud(){
      StateHelper.setForceFetch('pot', true)
    },
    async save() {
      let txId = Util.hasValue(this.form.txId)? this.form.txId: -1
      switch(APP.TX_BTX_MINOR) {
      case 'minor':
        this.form.btxId = this.form.minor
        break
      case 'btxId':
        this.form.minor = this.form.btxId
      }
      let disp = this.form.dispPos |  this.form.dispPir | this.form.dispAlways
      let pot = await this.getRelatedPot(txId)
      if (pot) {
        pot.potTxList = null // potTx関連を削除
        pot.potUserList = null // ここではpotUser関連は登録しない
        pot.user = null
      }
      if (this.form.location) {
        var location = _.cloneDeep(this.form.location)
        location.x = this.form.x || 0
        location.y = this.form.y || 0
      }
      let entity = {
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
        newPot.thumbnail = _.find(this.potImages, (pi) => pi.id == newPot.potId).thumbnail
      }
      newPot.potCd = this.form.potCd || newPot.potCd
      newPot.displayName = this.form.displayName || newPot.displayName
      newPot.description = this.form.description || newPot.description

      newPot.potCategoryList = this.form.categoryId? [ {potCategoryPK: {categoryId: this.form.categoryId}} ]: null
      const category = _.find(this.categories, (cat) => cat.categoryId == this.form.categoryId)
      newPot.potType = category ? category.categoryType : null

      newPot.potGroupList = this.form.groupId? [ {potGroupPK: {groupId: this.form.groupId}} ]: null
      newPot.tx = null
      return newPot
    },
  }
}
</script>

<style scoped lang="scss">

</style>