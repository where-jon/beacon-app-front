<template>
  <div>
    <breadcrumb :items="items" />
    <div class="container">

      <b-alert variant="info" :show="showInfo">{{ message }}</b-alert>
      <b-alert variant="danger" dismissible :show="showAlert"  @dismissed="showAlert=false">{{ message }}</b-alert>

      <b-form @submit="onSubmit" v-if="show">
        <b-form-group>
          <label v-t="'label.featureName'" />
          <b-form-select v-model="featureId" :options="featureNames" class="mb-3 ml-3 col-3" required :disabled="systemReadOnly" />
        </b-form-group>
        <b-form-group>
          <label v-t="'label.path'" />
          <b-form-textarea v-model="form.path" :rows="3" :max-rows="6" required readonly="readonly" />
        </b-form-group>
        <b-form-group>
          <label v-t="'label.mode'" />
          <b-form-select v-model="form.mode" :options="modes" class="mb-3 ml-3 col-3" required :readonly="!isEditable" />
        </b-form-group>

        <b-button type="button" variant="outline-danger" @click="backToList" v-t="'label.back'"/>
        <b-button v-if="isEditable" type="submit" :variant="theme" @click="register(false)" class="ml-2" >{{ label }}</b-button>
        <b-button v-if="isEditable && !isUpdate" type="submit" :variant="theme" @click="register(true)" class="ml-2" v-t="'label.registerAgain'"/>
      </b-form>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import _ from 'lodash'
import * as ViewHelper from '../../../sub/helper/ViewHelper'
import * as AppServiceHelper from '../../../sub/helper/AppServiceHelper'
import editmixinVue from '../../../components/editmixin.vue'
import * as Util from '../../../sub/util/Util'
import breadcrumb from '../../../components/breadcrumb.vue'
import { getButtonTheme } from '../../../sub/helper/ThemeHelper'
import { ROLE_FEATURE, FEATURE } from '../../../sub/constant/Constants'

export default {
  components: {
    breadcrumb,
  },
  mixins: [editmixinVue],
  data() {
    return {
      name: 'roleFeature',
      id: 'featureId',
      backPath: '/master/role/edit',
      appServicePath: '/meta/roleFeature',
      featureId: -1,
      form: ViewHelper.extract(this.$store.state.app_service.roleFeature, ["feature.featureId", "feature.featureName", "feature.path", "mode"]),
      featureNames: [],
      items: [
        {
          text: this.$i18n.t('label.master'),
          active: true
        },
        {
          text: this.$i18n.t('label.role'),
          href: '/master/role',
        },
        {
          text: this.$i18n.t('label.role') + this.$i18n.t('label.detail'),
          href: '/master/role/edit',
        },
        {
          text: this.$i18n.t('label.feature') + this.$i18n.t('label.detail'),
          active: true
        }
      ]
    }
  },
  created() {
    this.featureId = Util.hasValue(this.form.featureId)? this.form.featureId: -1
    this.roleFeature.featureId = Util.hasValue(this.form.featureId)? this.form.featureId: undefined
    this.resetFeatureNames()
  },
  computed: {
    theme () {
      const theme = getButtonTheme(this.$store.state.loginId)
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
  },
  watch: {
    featureId: function(newVal, oldVal) {
      const feature = this.features.find((val) => val.featureId === newVal)
      this.form.path = feature !== undefined? feature.path: ""
    },
  },
  methods: {
    async resetFeatureNames(){
      let roleFeatures = await AppServiceHelper.fetchList(`/meta/roleFeature/${this.role.roleId}`)
      if(!Util.isArray(roleFeatures)){
        roleFeatures = []
      }
      this.replaceAS({roleFeatures})
      const featureOptions = this.features.filter((feature) => {
        if(!Util.hasValue(this.roleFeatures)){
          return true
        }
        const roleFeature = this.roleFeatures.find((roleFeature) => feature.featureId === roleFeature.feature.featureId)
        return this.systemReadOnly? roleFeature !== undefined: roleFeature === undefined
      })
      this.featureNames = featureOptions.map((val) => ({text: val.featureName, value: val.featureId}))
    },
    beforeReload(){
      this.resetFeatureNames()
    },
    async save() {
      let entity = {
        roleFeaturePK:{roleId: this.role.roleId, featureId: this.featureId},
        mode: this.form.mode
      }
      const saveId = await AppServiceHelper.bulkSave(this.appServicePath, [entity])
      return saveId
    },
  }
}
</script>

<style scoped lang="scss">

</style>