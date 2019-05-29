<template>
  <div class="container-fluid">
    <breadcrumb :items="items" />
    <div class="container">
      <alert :message="message" />

      <b-form v-if="show" @submit.prevent="onSubmit">
        <b-form-group>
          <label v-t="'label.featureName'" />
          <v-select v-model="vueSelected.feature" :options="featureNames" :disabled="systemReadOnly" :clearable="false" class="mb-3 vue-options-lg" />
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
        <b-button v-if="isEditable" :variant="theme" type="submit" class="mr-2 my-1" :disabled="!selectFeature" @click="register(false)">
          {{ $i18n.tnl(`label.${isUpdate? 'update': 'register'}`) }}
        </b-button>
        <b-button v-if="isRegistable && !isUpdate" v-t="'label.registerAgain'" :variant="theme" type="submit" class="my-1" :disabled="!selectFeature" @click="register(true)" />
      </b-form>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import * as ViewHelper from '../../../sub/helper/ViewHelper'
import * as AppServiceHelper from '../../../sub/helper/AppServiceHelper'
import * as ParamHelper from '../../../sub/helper/ParamHelper'
import editmixinVue from '../../../components/mixin/editmixin.vue'
import featuremixinVue from '../../../components/mixin/featuremixin.vue'
import controlmixinVue from '../../../components/mixin/controlmixin.vue'
import * as HtmlUtil from '../../../sub/util/HtmlUtil'
import * as Util from '../../../sub/util/Util'
import breadcrumb from '../../../components/layout/breadcrumb.vue'
import alert from '../../../components/parts/alert.vue'
import { getButtonTheme } from '../../../sub/helper/ThemeHelper'
import { ROLE_FEATURE } from '../../../sub/constant/Constants'

export default {
  components: {
    breadcrumb,
    alert,
  },
  mixins: [editmixinVue, featuremixinVue, controlmixinVue],
  data() {
    return {
      name: 'roleFeature',
      id: 'featureId',
      backPath: '/master/role/edit',
      appServicePath: '/meta/roleFeature',
      featureId: -1,
      form: ViewHelper.extract(this.$store.state.app_service.roleFeature, ['feature.featureId', 'feature.featureName', 'feature.path', 'mode']),
      vueSelected: {
        feature: null,
      },
      featureNames: [],
      selectedModes: [],
      selectedAll: false,
      modeOptions: ROLE_FEATURE.getModeOptions(),
      items: ViewHelper.createBreadCrumbItems(
        'master',
        {text: 'role', href: '/master/role'},
        {text: 'update', href: '/master/role/edit'},
        'feature',
        Util.getDetailCaptionKey(this.$store.state.app_service.roleFeature.feature? this.$store.state.app_service.roleFeature.feature.featureId: null)
      ),
    }
  },
  computed: {
    theme () {
      const theme = getButtonTheme()
      return 'outline-' + theme
    },
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
        this.featureId = Util.getValue(newVal, 'value', null)
      },
      deep: true,
    },
    featureId: function(newVal, oldVal) {
      const feature = this.features.find((val) => val.featureId === newVal)
      this.form.path = feature != null? feature.path: ''
    },
    selectedAll: function(newVal, oldVal) {
      this.selectedModes = newVal? [ ROLE_FEATURE.getAllAuthorizationOption().value ]: []
    },
  },
  async created() {
    this.roleFeature.featureId = Util.hasValue(this.form.featureId)? this.form.featureId: null
    await this.resetFeatureNames()
    this.vueSelected.feature = ParamHelper.getVueSelectData(this.featureNames, Util.getValue(this, 'form.featureId', Util.getValue(this.featureNames, '0', {}).value))
    this.selectedModes = []
    this.modes.forEach((mode) => {
      if(this.form.mode & mode.value || this.form.mode == mode.value){
        this.selectedModes.push(mode.value)
      }
    })
  },
  mounted(){
    HtmlUtil.setCustomValidationMessage()
  },
  methods: {
    async resetFeatureNames(){
      let roleFeatures = await AppServiceHelper.fetchList(`/meta/roleFeature/${this.role.roleId}`)
      if(!Util.isArray(roleFeatures)){
        roleFeatures = []
      }
      this.replaceAS({roleFeatures})
      const featureOptions = this.features.filter((feature) => {
        if(this.isSystemFeature(feature)){
          return true
        }
        if(!this.isShowRelationFeature(feature)){
          return false
        }
        if(!Util.hasValue(this.roleFeatures)){
          return true
        }
        const sameFeature = this.roleFeatures.find((roleFeature) => feature.featureId === roleFeature.feature.featureId)
        return this.systemReadOnly? sameFeature: !sameFeature
      })
      this.featureNames = featureOptions.map(val => ({
        text: this.$i18n.tnl(`label.${val.featureName}`),
        label: this.$i18n.tnl(`label.${val.featureName}`),
        value: val.featureId,
      }))
      this.featureNames = _(this.featureNames).sortBy((val) => val.text).compact().value()
    },
    async beforeReload(){
      await this.resetFeatureNames()
      this.vueSelected.feature = ParamHelper.getVueSelectData(this.featureNames, null, true)
    },
    async save() {
      let entity = {
        roleFeaturePK:{roleId: this.role.roleId, featureId: this.featureId},
        mode: Util.hasValue(this.selectedModes)? this.selectedModes.reduce((a, b) => a | b): 0
      }
      const saveId = await AppServiceHelper.bulkSave(this.appServicePath, [entity])
      return saveId
    },
  }
}
</script>

<style scoped lang="scss">
@import "../../../sub/constant/vue.scss";
</style>