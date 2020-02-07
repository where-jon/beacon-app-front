<template>
  <div class="container-fluid">
    <breadcrumb :items="items" />
    <div class="container">
      <alert :message="message" />

      <b-form v-if="show" @submit.prevent="save">
        <b-form-group>
          <label v-t="'label.id'" />
          <input v-model="form.regionCd" :readonly="!isEditable" type="text" maxlength="20" class="form-control" :pattern="cdPattern" required>
        </b-form-group>
        <b-form-group>
          <label v-t="'label.regionName'" />
          <input v-model="form.regionName" :readonly="!isEditable" type="text" maxlength="20" class="form-control" required>
        </b-form-group>
        <b-form-group>
          <label v-t="'label.meshId'" />
          <input v-model="form.meshId" :readonly="!isEditable" type="number" min="0" max="65535" class="form-control" required>
        </b-form-group>
        <b-form-group>
          <label v-t="'label.description'" />
          <b-form-textarea v-model="form.description" :rows="3" :max-rows="6" :readonly="!isEditable" maxlength="1000" />
        </b-form-group>

        <b-button v-t="'label.back'" type="button" variant="outline-danger" class="mr-2 my-1" @click="backToList" />
        <b-button v-if="isEditable" :variant="theme" type="submit" class="mr-2 my-1" @click="doBeforeSubmit(false)">
          {{ $i18n.tnl(`label.${isUpdate? 'update': 'register'}`) }}
        </b-button>
        <b-button v-if="isRegistable && !isUpdate" v-t="'label.registerAgain'" :variant="theme" type="submit" class="my-1" @click="doBeforeSubmit(true)" />
      </b-form>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { PATTERN } from '../../../sub/constant/Constants'
import * as Util from '../../../sub/util/Util'
import * as AppServiceHelper from '../../../sub/helper/dataproc/AppServiceHelper'
import * as AuthHelper from '../../../sub/helper/base/AuthHelper'
import * as StateHelper from '../../../sub/helper/dataproc/StateHelper'
import * as MasterHelper from '../../../sub/helper/domain/MasterHelper'
import * as ValidateHelper from '../../../sub/helper/dataproc/ValidateHelper'
import * as ViewHelper from '../../../sub/helper/ui/ViewHelper'
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
      name: 'region',
      id: 'regionId',
      backPath: '/master/region',
      appServicePath: '/core/region',
      items: ViewHelper.createBreadCrumbItems('master', {text: 'region', href: '/master/region'}, ViewHelper.getDetailCaptionKey(this.$store.state.app_service.region.regionId)),
      form: Util.extract(this.$store.state.app_service.region,
        ['regionId', 'regionCd', 'regionName', 'meshId', 'description']),
    }
  },
  computed: {
    hasId(){
      return Util.hasValue(this.form.regionId)
    },
    ...mapState('app_service', [
      'region', 'regions',
    ]),
    cdPattern(){
      return PATTERN.MASTER_CD
    },
  },
  mounted(){
    console.error(this.$store.state.app_service.region)
    ValidateHelper.setCustomValidationMessage()
    if(!Util.hasValue(this.form.regionCd)){
      this.form.regionCd = MasterHelper.createMasterCd('region', this.regions, this.region)
    }
  },
  methods: {
    async onSaving() {
      let entity = {
        regionId: Util.hasValue(this.form.regionId)? this.form.regionId: -1,
        regionCd: this.form.regionCd,
        regionName: this.form.regionName,
        meshId: this.form.meshId,
        description: this.form.description,
      }
      return await AppServiceHelper.bulkSave(this.appServicePath, [entity])
    },
    async onSaved(){
      // StateHelper.setForceFetch('user', true)
      await MasterHelper.loadMaster()
      await AuthHelper.switchAppService()
    },
    onBeforeReload(){
      this.form.regionCd = MasterHelper.createMasterCd('region', this.regions, this.region)
    },
  }
}
</script>

<style scoped lang="scss">

</style>