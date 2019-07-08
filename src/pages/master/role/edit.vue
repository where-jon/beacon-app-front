<template>
  <div class="container-fluid">
    <breadcrumb :items="items" />
    <div class="container">
      <alert :message="message" />

      <b-form v-if="show" @submit.prevent="save">
        <b-form-group>
          <label v-t="'label.roleName'" />
          <input v-model="form.roleName" :readonly="!isEditable" type="text" maxlength="20" class="form-control" required>
        </b-form-group>

        <b-form-group>
          <label v-t="'label.feature'" />
          <rolefeature-index ref="roleFeatureComponent" :message-params="roleFeatureMessages" />
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
import * as Util from '../../../sub/util/Util'
import * as AppServiceHelper from '../../../sub/helper/dataprocess/AppServiceHelper'
import * as StateHelper from '../../../sub/helper/dataprocess/StateHelper'
import * as ValidateHelper from '../../../sub/helper/dataprocess/ValidateHelper'
import * as ViewHelper from '../../../sub/helper/ui/ViewHelper'
import breadcrumb from '../../../components/layout/breadcrumb.vue'
import commonmixin from '../../../components/mixin/commonmixin.vue'
import editmixin from '../../../components/mixin/editmixin.vue'
import alert from '../../../components/parts/alert.vue'
import rolefeatureIndex from '../rolefeature/index.vue'

export default {
  components: {
    breadcrumb,
    alert,
    rolefeatureIndex, 
  },
  mixins: [commonmixin, editmixin],
  data() {
    return {
      name: 'role',
      id: 'roleId',
      backPath: '/master/role',
      appServicePath: '/meta/role',
      items: ViewHelper.createBreadCrumbItems('master', {text: 'role', href: '/master/role'}, ViewHelper.getDetailCaptionKey(this.$store.state.app_service.role.roleId)),
      form: Util.extract(this.$store.state.app_service.role, ['roleId', 'roleName']),
      roleFeatureMessages: {message: ''},
    }
  },
  computed: {
    ...mapState('app_service', [
      'role',
    ]),
  },
  watch: {
    'roleFeatureMessages.message' : function(newVal, oldVal){
      this.message = newVal
    }
  },
  created() {
    this.message = this.listMessage
    this.replaceAS({listMessage: null})
  },
  mounted() {
    if(Util.hasValue(this.message)){
      this.replace({showInfo: true})
    }
    ValidateHelper.setCustomValidationMessage()
  },
  methods: {
    onSaved(){
      StateHelper.setForceFetch('user', true)
    },
    async onSaving() {
      let entity = {
        roleId: Util.hasValue(this.form.roleId)? this.form.roleId: -1,
        roleName: this.form.roleName,
      }
      return await AppServiceHelper.bulkSave(this.appServicePath, [entity])
    },
  }
}
</script>

<style scoped lang="scss">

</style>