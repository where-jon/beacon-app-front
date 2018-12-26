<template>
  <div>
    <breadcrumb :items="items" />
    <div class="container">
      <b-alert :show="showInfo" variant="info" dismissible>
        {{ message }}
      </b-alert>
      <b-alert :show="showAlert" variant="danger" dismissible @dismissed="showAlert=false">
        <template v-if="Array.isArray(message)">
          <span v-for="line in message" :key="line">
            {{ line }} <br>
          </span>
        </template>
        <span v-else>
          {{ message }}
        </span>
      </b-alert>

      <b-form v-if="show" @submit.prevent="onSubmit">
        <b-form-group>
          <label v-t="'label.featureName'" />
          <b-form-select v-model="featureId" :options="featureNames" :disabled="systemReadOnly" class="mb-3 ml-3 col-3" required />
        </b-form-group>
        <b-form-group>
          <label v-t="'label.path'" />
          <b-form-textarea v-model="form.path" :rows="3" :max-rows="6" required readonly="readonly" />
        </b-form-group>
        <b-form-group>
          <label v-t="'label.mode'" />
          <b-form-select v-model="form.mode" :options="modes" :disabled="!isEditable" :readonly="!isEditable" class="mb-3 ml-3 col-3" required />
        </b-form-group>

        <b-button v-t="'label.back'" type="button" variant="outline-danger" class="mr-2 my-1" @click="backToList" />
        <b-button v-if="isEditable" :variant="theme" type="submit" class="mr-2 my-1" @click="register(false)">
          {{ label }}
        </b-button>
        <b-button v-t="'label.registerAgain'" v-if="isEditable && !isUpdate" :variant="theme" type="submit" class="my-1" @click="register(true)" />
      </b-form>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import * as ViewHelper from '../../../sub/helper/ViewHelper'
import * as AppServiceHelper from '../../../sub/helper/AppServiceHelper'
import editmixinVue from '../../../components/mixin/editmixin.vue'
import * as Util from '../../../sub/util/Util'
import breadcrumb from '../../../components/layout/breadcrumb.vue'
import { getButtonTheme } from '../../../sub/helper/ThemeHelper'
import { ROLE_FEATURE } from '../../../sub/constant/Constants'

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
      form: ViewHelper.extract(this.$store.state.app_service.roleFeature, ['feature.featureId', 'feature.featureName', 'feature.path', 'mode']),
      featureNames: [],
      items: [
        {
          text: this.$i18n.tnl('label.master'),
          active: true
        },
        {
          text: this.$i18n.tnl('label.role'),
          href: '/master/role',
        },
        {
          text: this.$i18n.tnl('label.update'),
          href: '/master/role/edit',
        },
        {
          text: this.$i18n.tnl('label.feature'),
          active: true
        },
        {
          text: this.$i18n.tnl(Util.getDetailCaptionKey(this.$store.state.app_service.roleFeature.feature? this.$store.state.app_service.roleFeature.feature.featureId: null)),
          active: true
        },
      ]
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
  },
  watch: {
    featureId: function(newVal, oldVal) {
      const feature = this.features.find((val) => val.featureId === newVal)
      this.form.path = feature != null? feature.path: ''
    },
  },
  created() {
    this.featureId = Util.hasValue(this.form.featureId)? this.form.featureId: -1
    this.roleFeature.featureId = Util.hasValue(this.form.featureId)? this.form.featureId: null
    this.resetFeatureNames()
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
        return this.systemReadOnly? roleFeature != null: roleFeature == null
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