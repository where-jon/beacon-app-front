<template>
  <div>
    <breadcrumb :items="items" />
    <div class="container">
      <b-alert variant="info" dismissible :show="showInfo">
        {{ message }}
      </b-alert>
      <b-alert variant="danger" dismissible :show="showAlert" @dismissed="showAlert=false">
        <div v-html="message" />
      </b-alert>


      <b-row>
        <b-col md="8" offset-md="2">
          <b-form v-if="show" @submit.prevent="onSubmit">
            <b-form-group v-if="hasId" v-show="isShown('TX_WITH_TXID')">
              <label v-t="'label.txId'" />
              <b-form-input v-model="form.txId" type="text" readonly="readonly" />
            </b-form-group>
            <b-form-group v-if="showMinorHead" v-show="showTx('minor')">
              <label v-t="'label.minor'" />
              <input v-model="form.minor" type="number" min="0" max="65535" class="form-control" :readonly="!isEditable" :required="showTx('minor')">
            </b-form-group>
            <b-form-group>
              <label v-t="'label.type'" />
              <b-form-select v-model="form.sensorId" :options="sensorOptionsTx" class="mb-3 ml-3 col-4" :disabled="!isEditable" :readonly="!isEditable" />
            </b-form-group>
            <b-form-group v-show="isShown('TX_WITH_CATEGORY')">
              <label v-t="'label.category'" />
              <b-form-select v-model="form.categoryId" :options="categoryOptions" class="mb-3 ml-3 col-4" :disabled="!isEditable" :readonly="!isEditable" />
            </b-form-group>
            <b-form-group v-show="isShown('TX_WITH_GROUP')">
              <label v-t="'label.group'" />
              <b-form-select v-model="form.groupId" :options="groupOptions" class="mb-3 ml-3 col-4" :disabled="!isEditable" :readonly="!isEditable" />
            </b-form-group>
            <b-form-group v-show="showTx('btxId')">
              <label v-t="'label.btxId'" />
              <input v-model="form.btxId" type="number" min="0" max="65535" class="form-control" :required="showTx('btxId')" :readonly="!isEditable">
            </b-form-group>
            <b-form-group v-show="isShown('TX_WITH_MAJOR')">
              <label v-t="'label.major'" />
              <input v-model="form.major" type="number" min="0" max="65535" class="form-control" :required="isMajorRequired" :readonly="!isEditable">
            </b-form-group>
            <b-form-group v-if="showMinorMid" v-show="showTx('minor')">
              <label v-t="'label.minor'" />
              <input v-model="form.minor" type="number" min="0" max="65535" class="form-control" :readonly="!isEditable" :required="showTx('minor')">
            </b-form-group>
            <b-form-group>
              <label v-t="'label.txName'" />
              <input v-model="form.txName" type="text" maxlength="20" class="form-control" :readonly="!isEditable">
            </b-form-group>
            <b-form-group v-show="isShown('TX_WITH_DISPLAY_NAME')">
              <label v-t="'label.displayName'" />
              <input v-model="form.displayName" type="text" maxlength="3" class="form-control" :readonly="!isEditable">
            </b-form-group>
            <b-form-group v-show="isShown('TX_WITH_DESCRIPTION')">
              <label v-t="'label.description'" />
              <b-form-textarea v-model="form.description" :rows="3" :max-rows="6" maxlength="1000" :readonly="!isEditable" />
            </b-form-group>
            <b-button v-t="'label.back'" type="button" variant="outline-danger" class="mr-2 my-1" @click="backToList" />
            <b-button v-if="isEditable" type="submit" :variant="theme" class="mr-2 my-1" @click="register(false)">
              {{ label }}
            </b-button>
            <b-button v-if="isEditable && !isUpdate" v-t="'label.registerAgain'" type="submit" :variant="theme" class="my-1" @click="register(true)" />
          </b-form>
        </b-col>
      </b-row>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import _ from 'lodash'
import * as ViewHelper from '../../../sub/helper/ViewHelper'
import * as Util from '../../../sub/util/Util'
import editmixinVue from '../../../components/mixin/editmixin.vue'
import breadcrumb from '../../../components/layout/breadcrumb.vue'
import { getButtonTheme } from '../../../sub/helper/ThemeHelper'
import * as AppServiceHelper from '../../../sub/helper/AppServiceHelper'
import * as StateHelper from '../../../sub/helper/StateHelper'
import { APP } from '../../../sub/constant/config.js'
import { CATEGORY } from '../../../sub/constant/Constants'

export default {
  components: {
    breadcrumb,
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
        'txId', 'btxId', 'major', 'minor', 'txName', 'displayName',  'mapImage',
        'txSensorList.0.sensor.sensorId',
        'pot.potId', 'pot.potCd', 'pot.displayName', 'pot.description',
        'pot.potCategoryList.0.category.categoryId',
        'pot.potGroupList.0.group.groupId',
      ]),
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
      options.unshift({value:null, text:this.$i18n.tnl('label.normal')})
      return options
    },
    categoryOptions() {
      let options = this.categories.filter((category) => {
        return category.categoryType != CATEGORY.getTypes()[2].value
      }).map((category) => {
        return {
          value: category.categoryId,
          text: category.categoryName
        }
      }
      )
      options.unshift({value:null, text:''})
      return options
    },
    groupOptions() {
      let options = this.groups.map((group) => {
        return {
          value: group.groupId,
          text: group.groupName
        }
      }
      )
      options.unshift({value:null, text:''})
      return options
    },
    showMinorMid() {
      return !this.showMinorHead
    },
    showMinorHead() {
      return !APP.TX_WITH_TXID && APP.TX_BTX_MINOR == 'minor'
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
    StateHelper.load('sensor')
    StateHelper.load('category')
    StateHelper.load('group')
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
      case 'btxId':
        this.form.minor = this.form.btxId
      }
      let entity = {
        ...this.form,
        txId,
        pot: await this.getRelatedPot(txId),
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