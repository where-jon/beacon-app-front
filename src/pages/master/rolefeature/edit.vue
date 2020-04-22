<template>
  <div class="container-fluid">
    <breadcrumb :items="breadCrumbs" />
    <div class="container">
      <alert :message="message" />

      <b-form v-if="show" @submit.prevent="save">
        <b-form-group>
          <label v-t="'label.featureName'" />
          <v-select v-model="vueSelected.feature" :options="featureNames" :disabled="systemReadOnly" :clearable="false" class="mb-3 vue-options-lg">
            <template slot="no-options">
              {{ vueSelectNoMatchingOptions }}
            </template>
          </v-select>
        </b-form-group>
        <b-form-group>
          <label v-t="'label.path'" />
          <b-form-textarea v-model="form.path" :rows="3" :max-rows="6" required readonly="readonly" />
        </b-form-group>
        <b-form-group>
          <label v-t="'label.mode'" />
          <b-form-group>
            <b-form-checkbox v-model="selectedAll" stacked :disabled="!isUpdatable" class="ml-3">
              {{ selectedAllText }}
            </b-form-checkbox>
            <b-form-checkbox-group v-if="!selectedAll" v-model="selectedModes" stacked :options="modeOptions" :disabled="!isUpdatable" class="mb-3 ml-3" />
          </b-form-group>
        </b-form-group>

        <b-button v-t="'label.back'" type="button" variant="outline-danger" class="mr-2 my-1" @click="backToList" />
        <b-button v-if="isButtonShow" :variant="theme" type="submit" class="mr-2 my-1" :disabled="!selectFeature" @click="doBeforeSubmit(false)">
          {{ $i18n.tnl(`label.${isUpdate? 'update': 'register'}`) }}
        </b-button>
        <b-button v-if="isRegistable && !isUpdate" v-t="'label.registerAgain'" :variant="theme" type="submit" class="my-1" :disabled="!selectFeature" @click="doBeforeSubmit(true)" />
      </b-form>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { ROLE_FEATURE } from '../../../sub/constant/Constants'
import * as ArrayUtil from '../../../sub/util/ArrayUtil'
import * as Util from '../../../sub/util/Util'
import * as AppServiceHelper from '../../../sub/helper/dataproc/AppServiceHelper'
import * as AuthHelper from '../../../sub/helper/base/AuthHelper'
import * as FeatureHelper from '../../../sub/helper/domain/FeatureHelper'
import * as LocalStorageHelper from '../../../sub/helper/base/LocalStorageHelper'
import * as ValidateHelper from '../../../sub/helper/dataproc/ValidateHelper'
import * as StateHelper from '../../../sub/helper/dataproc/StateHelper'
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
      name: 'roleFeature',
      id: 'featureId',
      authPath: '/master/rolefeature',
      backPath: '/master/role/edit',
      appServicePath: '/meta/roleFeature',
      breadCrumbs: ViewHelper.createBreadCrumbItems(
        'master',
        {text: 'role', href: '/master/role'},
        {text: 'update', href: '/master/role/edit'},
        'feature',
        ViewHelper.getDetailCaptionKey(this.$store.state.app_service.roleFeature.feature? this.$store.state.app_service.roleFeature.feature.featureId: null)
      ),
      form: Util.extract(this.$store.state.app_service.roleFeature, ['feature.featureId', 'feature.featureName', 'feature.path', 'mode']),
      vueSelected: {
        feature: null,
      },
      featureNames: [],
      featureId: -1,
      selectedModes: [],
      selectedAll: false,
      modeOptions: ROLE_FEATURE.getModeOptions(),
    }
  },
  computed: {
    ...mapState('app_service', [
      'role', 'features', 'roleFeatures', 'roleFeature'
    ]),
    modes(){
      return ROLE_FEATURE.getModeOptions()
    },
    systemReadOnly(){
      return !this.isEditable || Util.hasValue(this.form.featureId)
    },
    selectedAllText(){
      return ROLE_FEATURE.getAllAuthorizationOption().text
    },
    selectFeature(){
      return this.featureId && this.featureId > 0
    },
  },
  watch: {
    'vueSelected.feature': {
      handler: function(newVal, oldVal){
        this.featureId = Util.getValue(newVal, 'value')
      },
      deep: true,
    },
    featureId: function(newVal, oldVal) {
      const feature = this.features.find(val => val.featureId === newVal)
      this.form.path = feature != null? feature.path: ''
    },
    selectedAll: function(newVal, oldVal) {
      this.selectedModes = newVal? [ ROLE_FEATURE.getAllAuthorizationOption().value ]: []
    },
  },
  async created() {
    this.roleFeature.featureId = Util.hasValue(this.form.featureId)? this.form.featureId: null
    await this.resetFeatureNames()
    this.vueSelected.feature = VueSelectHelper.getVueSelectData(this.featureNames, Util.getValue(this, 'form.featureId', Util.getValue(this.featureNames, '0', {})))
    this.selectedModes = []
    this.modes.forEach(mode => {
      if(this.form.mode & mode.value || this.form.mode == mode.value){
        this.selectedModes.push(mode.value)
      }
    })
  },
  mounted(){
    ValidateHelper.setCustomValidationMessage()
    VueSelectHelper.disabledAllSubmit()
  },
  methods: {
    async resetFeatureNames(){
      await StateHelper.load('feature')
      let roleFeatures = await AppServiceHelper.fetchList(`/meta/roleFeature/${this.role.roleId}`)
      if(!ArrayUtil.isArray(roleFeatures)){
        roleFeatures = []
      }
      this.replaceAS({roleFeatures})
      const featureOptions = this.features.filter(feature => {
        if(!FeatureHelper.isSystemFeature(feature) && !FeatureHelper.isShowRelationFeature(feature)){
          return false
        }
        if(!Util.hasValue(this.roleFeatures)){
          return true
        }
        const sameFeature = this.roleFeatures.some(roleFeature => feature.featureId === roleFeature.feature.featureId)
        return this.systemReadOnly? sameFeature: !sameFeature
      })
      this.featureNames = featureOptions.map(val => ({
        text: this.$i18n.tnl(`label.${val.featureName}`),
        label: this.$i18n.tnl(`label.${val.featureName}`),
        value: val.featureId,
      }))
      this.featureNames = _(this.featureNames).sortBy(val => val.text).compact().value()
    },
    async onBeforeReload(){
      await this.resetFeatureNames()
      this.vueSelected.feature = VueSelectHelper.getVueSelectData(this.featureNames, null, true)
    },
    async onSaving() {
      let entity = {
        updateKey: `${this.role.roleId}/${this.featureId}`,
      }
      if (Util.hasValue(this.selectedModes)) {
        entity.mode = this.selectedModes.filter(v => v != '0')
          .map(v => this.modeOptions.find(opt => opt.value == v).text).join(';')
      } else {
        entity.mode = null
      }
      const saveId =  await AppServiceHelper.save2(this.appServicePath, [entity])
      return saveId
    },
    async onSaved(){
      const login = LocalStorageHelper.getLogin()
      if(Util.getValue(login, 'role.roleId') == this.role.roleId){
        await AuthHelper.switchAppService()
      }
    }
  }
}
</script>

<style scoped lang="scss">
@import "../../../sub/constant/vue.scss";
</style>