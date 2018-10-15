<template>
  <div>
    <breadcrumb :items="items" />
    <div class="container">

      <b-alert variant="info" :show="showInfo">{{ message }}</b-alert>
      <b-alert variant="danger" dismissible :show="showAlert"  @dismissed="showAlert=false">{{ message }}</b-alert>


      <b-row>
        <b-col md="8" offset-md="2">
          <b-form @submit="onSubmit" v-if="show">
            <b-form-group v-if="form.txId">
              <label v-t="'label.txId'" />
              <b-form-input type="text" v-model="form.txId" readonly="readonly" />
            </b-form-group>
            <b-form-group>
              <label v-t="'label.type'" />
              <b-form-select v-model="form.sensorId" :options="sensorOptionsTx" class="mb-3 ml-3 col-4" :readonly="!isEditable" />
            </b-form-group>
            <b-form-group v-show="isShown('TX_WITH_CATEGORY')">
              <label v-t="'label.category'" />
              <b-form-select v-model="form.categoryId" :options="categoryOptions" class="mb-3 ml-3 col-4" :readonly="!isEditable" />
            </b-form-group>
            <b-form-group v-show="showTx('btxId')">
              <label v-t="'label.btxId'" />
              <b-form-input type="number" v-model="form.btxId" required :readonly="!isEditable" />
            </b-form-group>
            <b-form-group v-show="isShown('TX_WITH_MAJOR')">
              <label v-t="'label.major'" />
              <b-form-input type="number" v-model="form.major" :readonly="!isEditable" />
            </b-form-group>
            <b-form-group v-show="showTx('minor')">
              <label v-t="'label.minor'" />
              <b-form-input type="number" v-model="form.minor" :readonly="!isEditable" />
            </b-form-group>
            <b-form-group>
              <label v-t="'label.txName'" />
              <b-form-input type="text" v-model="form.txName" maxlength="20" :readonly="!isEditable" />
            </b-form-group>
            <b-form-group>
              <label v-t="'label.displayName'" v-show="isShown('TX_WITH_DISPLAY_NAME')" />
              <b-form-input type="text" v-model="form.displayName" maxlength="3" :readonly="!isEditable" />
            </b-form-group>
            <b-form-group v-show="isShown('TX_WITH_DESCRIPTION')">
              <label v-t="'label.description'" />
              <b-form-textarea v-model="form.description" :rows="3" :max-rows="6" :readonly="!isEditable" ></b-form-textarea>
            </b-form-group>
            <b-button type="button" variant="outline-danger" @click="backToList" v-t="'label.back'"/>
            <b-button v-if="isEditable" type="submit" :variant="theme" @click="register(false)" class="ml-2">{{ label }}</b-button>
            <b-button v-if="isEditable && !isUpdate" type="submit" :variant="theme" @click="register(true)" class="ml-2" v-t="'label.registerAgain'"/>
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
import editmixinVue from '../../../components/editmixin.vue'
import breadcrumb from '../../../components/breadcrumb.vue'
import { getButtonTheme } from '../../../sub/helper/ThemeHelper'
import * as AppServiceHelper from '../../../sub/helper/AppServiceHelper'
import * as StateHelper from '../../../sub/helper/StateHelper'
import { APP } from '../../../sub/constant/config.js'

let that

export default {
  components: {
    breadcrumb,
  },
  mixins: [editmixinVue],
  data() {
    const labelTx = this.$i18n.t('label.tx')
    return {
      name: 'tx',
      id: 'txId',
      backPath: '/master/tx',
      appServicePath: '/core/tx',
      form: ViewHelper.extract(this.$store.state.app_service.tx, [
        "txId", "btxId", "major", "minor", "txName", "displayName",  "mapImage",
        "txSensorList.0.sensor.sensorId",
        "pot.potId", "pot.potCd", "pot.displayName", "pot.description",
        "pot.potCategoryList.0.category.categoryId",
      ]),
      items: [
        {
          text: this.$i18n.t('label.master'),
          active: true
        },
        {
          text: labelTx,
          href: '/master/tx'
        },
        {
          text: labelTx + this.$i18n.t('label.detail'),
          active: true
        },
      ]
    }
  },
  computed: {
    theme () {
      const theme = getButtonTheme(this.$store.state.loginId)
      return 'outline-' + theme
    },
    sensorOptionsTx() {
      let options = this.sensorOptions('tx')
      options.unshift({value:null, text:this.$i18n.t('label.normal')})
      return options
    },
    categoryOptions() {
      let options = this.categories.map((category) => {
          return {
            value: category.categoryId,
            text: category.categoryName
          }
        }
      )
      options.unshift({value:null, text:''})
      return options
    },
    ...mapState('app_service', [
      'tx',
      'categories',
      'sensors',
    ]),
  },
  mounted() {
    that = this
    StateHelper.loadSensors()
    StateHelper.loadCategorys()
  },
  methods: {
    isShown(conf) {
      return APP[conf]
    },
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
    async save() {
      let txId = this.form.txId? this.form.txId: -1
      let entity = {
        ...this.form,
        txId,
        pot: (this.form.categoryId || this.form.displayName || this.form.description)? {
          displayName: Util.getValue(this.form, 'displayName', null),
          description: Util.getValue(this.form, 'displayName', null),
          potId: Util.getValue(this.form, 'potId', -2),
          potCd: Util.getValue(this.form, 'potCd', txId + "_" + (new Date().getTime() % 10000)),
          potName: Util.getValue(this.form, 'potName', txId + "_" + (new Date().getTime() % 10000)),
          potCategoryList: this.form.categoryId? [
            {potCategoryPK: {categoryId: this.form.categoryId}}
          ]: null
        }: null,
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

</style>