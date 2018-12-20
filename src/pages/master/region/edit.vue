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

      <b-form v-if="show" @submit.prevent="onSubmit">
        <b-form-group v-if="hasId">
          <label v-t="'label.regionId'" />
          <b-form-input v-model="form.regionId" type="text" readonly="readonly" />
        </b-form-group>
        <b-form-group>
          <label v-t="'label.regionName'" />
          <input v-model="form.regionName" type="text" maxlength="20" class="form-control" required :readonly="!isEditable">
        </b-form-group>
        <b-form-group>
          <label v-t="'label.meshId'" />
          <input v-model="form.meshId" type="number" min="0" max="65535" class="form-control" :readonly="!isEditable">
        </b-form-group>
        <b-form-group>
          <label v-t="'label.deviceOffset'" />
          <input v-model="form.deviceOffset" type="number" min="0" max="65535" class="form-control" required :readonly="!isEditable">
        </b-form-group>
        <b-form-group>
          <label v-t="'label.description'" />
          <b-form-textarea v-model="form.description" :rows="3" :max-rows="6" maxlength="1000" :readonly="!isEditable" />
        </b-form-group>

        <b-button v-t="'label.back'" type="button" variant="outline-danger" class="mr-2 my-1" @click="backToList" />
        <b-button v-if="isEditable" type="submit" :variant="theme" class="mr-2 my-1" @click="register(false)">
          {{ label }}
        </b-button>
        <b-button v-if="isEditable && !isUpdate" v-t="'label.registerAgain'" type="submit" :variant="theme" class="my-1" @click="register(true)" />
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
  components: {
    breadcrumb,
  },
  mixins: [editmixinVue],
  data() {
    return {
      name: 'region',
      id: 'regionId',
      backPath: '/master/region',
      appServicePath: '/core/region',
      form: ViewHelper.extract(this.$store.state.app_service.region,
        ['regionId', 'regionName', 'meshId', 'deviceOffset', 'description']),
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
          text: this.$i18n.tnl(Util.getDetailCaptionKey(this.$store.state.app_service.region.regionId)),
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