<template>
  <div>
    <breadcrumb :items="items" />
    <div class="container">

      <b-alert variant="info" :show="showInfo">{{ message }}</b-alert>
      <b-alert variant="danger" dismissible :show="showAlert"  @dismissed="showAlert=false">{{ message }}</b-alert>

      <b-form @submit="onSubmit" v-if="show">
        <b-form-group v-if="hasId">
          <label v-t="'label.featureId'" />
          <b-form-input type="text" v-model="form.featureId" readonly="readonly" />
        </b-form-group>
        <b-form-group>
          <label v-t="'label.featureName'" />
          <b-form-input type="text" v-model="form.featureName" maxlength="20" required readonly="readonly" />
        </b-form-group>
        <b-form-group>
          <label v-t="'label.path'" />
          <b-form-textarea v-model="form.path" :rows="3" :max-rows="6" required readonly="readonly" />
        </b-form-group>
        <b-form-group>
          <label v-t="'label.mode'" />
          <b-form-select v-model="mode" :options="modes" class="mb-3 ml-3 col-3" required :readonly="!isEditable" />
        </b-form-group>
        <b-form-group>
          <label v-t="'label.featureType'" />
          <b-form-select v-model="form.featureType" :options="featureTypes" class="mb-3 ml-3 col-3" required :disabled="true" />
        </b-form-group>
        <b-form-group>
          <label v-t="'label.enabled'" />
          <b-form-select v-model="form.enabled" :options="enableds" class="mb-3 ml-3 col-2" required :disabled="true" />
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
import editmixinVue from '../../../components/editmixin.vue';
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
      name: 'feature',
      id: 'featureId',
      backPath: '/master/role/edit',
      appServicePath: '/meta/roleFeature',
      form: ViewHelper.extract(this.$store.state.app_service.feature, ["featureId", "featureName", "path", "featureType", "enabled"]),
      roleId: this.$store.state.app_service.role.roleId,
      mode: undefined,
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
  created(){
    const roleFeature = this.$store.state.app_service.role.roleFeatureList.find((val) => val.roleFeaturePK.featureId === this.form.featureId)
    this.mode = roleFeature !== undefined? roleFeature.mode: this.modes[0].value
  },
  computed: {
    hasId(){
      return Util.hasValue(this.form.featureId)
    },
    theme () {
      const theme = getButtonTheme(this.$store.state.loginId)
      return 'outline-' + theme
    },
    ...mapState('app_service', [
      'feature', 'role'
    ]),
    modes(){
      return ROLE_FEATURE.MODE_OPTIONS
    },
    featureTypes(){
      return FEATURE.TYPE_OPTIONS
    },
    enableds(){
      return FEATURE.ENABLED_OPTIONS
    },
  },
  methods: {
    async save() {
      let entity = {
        roleFeaturePK:{roleId: this.roleId, featureId: this.form.featureId},
        mode: this.mode
      }
      const saveId = await AppServiceHelper.bulkSave(this.appServicePath, [entity])
      const role = await AppServiceHelper.fetch("/meta/role", this.roleId)
      this.replaceAS({role})
      return saveId
    },
  }
}
</script>

<style scoped lang="scss">

</style>