<template>
  <div>
    <breadcrumb :items="items" />
    <div class="container">

      <b-alert variant="info" dismissible :show="showInfo">{{ message }}</b-alert>
      <b-alert variant="danger" dismissible :show="showAlert"  @dismissed="showAlert=false">
        <div v-html="message" />
      </b-alert>

      <b-form @submit="onSubmit" v-if="show">
        <b-form-group v-if="hasId">
          <label v-t="'label.regionId'" />
          <b-form-input type="text" v-model="form.regionId" readonly="readonly" />
        </b-form-group>
        <b-form-group>
          <label v-t="'label.regionName'" />
          <b-form-input type="text" v-model="form.regionName" maxlength="20" required :readonly="!isEditable" />
        </b-form-group>
        <b-form-group>
          <label v-t="'label.meshId'" />
          <b-form-input type="number" v-model="form.meshId" min="0" max="65535" :readonly="!isEditable" />
        </b-form-group>
        <b-form-group>
          <label v-t="'label.deviceOffset'" />
          <b-form-input type="number" v-model="form.deviceOffset" min="0" max="65535" required :readonly="!isEditable" />
        </b-form-group>
        <b-form-group>
          <label v-t="'label.description'" />
          <b-form-textarea v-model="form.description" :rows="3" :max-rows="6" maxlength="1000" :readonly="!isEditable" ></b-form-textarea>
        </b-form-group>

        <b-button type="button" variant="outline-danger" @click="backToList" class="mr-2 my-1" v-t="'label.back'"/>
        <b-button v-if="isEditable" type="submit" :variant="theme" @click="register(false)" class="mr-2 my-1" >{{ label }}</b-button>
        <b-button v-if="isEditable && !isUpdate" type="submit" :variant="theme" @click="register(true)" class="my-1" v-t="'label.registerAgain'"/>
      </b-form>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import _ from 'lodash'
import * as ViewHelper from '../../../sub/helper/ViewHelper'
import * as AppServiceHelper from '../../../sub/helper/AppServiceHelper'
import editmixinVue from '../../../components/mixin/editmixin.vue'
import * as Util from '../../../sub/util/Util'
import breadcrumb from '../../../components/layout/breadcrumb.vue'
import { getButtonTheme } from '../../../sub/helper/ThemeHelper'

export default {
  mixins: [editmixinVue],
  components: {
    breadcrumb,
  },
  data() {
    return {
      name: 'region',
      id: 'regionId',
      backPath: '/master/region',
      appServicePath: '/core/region',
      form: ViewHelper.extract(this.$store.state.app_service.region,
          ["regionId", "regionName", "meshId", "deviceOffset", "description"]),
      items: [
        {
          text: this.$i18n.tnl('label.master'),
          active: true
        },
        {
          text: this.$i18n.tnl('label.region'),
          href: '/master/region',
        },
        {
          text: this.$i18n.tnl('label.region') + this.$i18n.tnl(Util.getDetailCaptionKey(this.$store.state.app_service.region.regionId)),
          active: true
        }
      ]
    }
  },
  computed: {
    hasId(){
      return Util.hasValue(this.form.regionId)
    },
    theme () {
      const theme = getButtonTheme()
      return 'outline-' + theme
    },
    ...mapState('app_service', [
      'region',
    ]),
  },
  methods: {
    async save() {
      let entity = {
        regionId: Util.hasValue(this.form.regionId)? this.form.regionId: -1,
        regionName: this.form.regionName,
        meshId: this.form.meshId,
        deviceOffset: this.form.deviceOffset? this.form.deviceOffset: 0,
        description: this.form.description,
      }
      return await AppServiceHelper.bulkSave(this.appServicePath, [entity])
   },
  }
}
</script>

<style scoped lang="scss">

</style>