<template>
  <div>
    <breadcrumb :items="items" />
    <div class="container">

      <b-alert variant="info" dismissible :show="showInfo">{{ message }}</b-alert>
      <b-alert variant="danger" dismissible :show="showAlert"  @dismissed="showAlert=false">
        <div v-html="message" />
      </b-alert>

      <b-form @submit.prevent="onSubmit" v-if="show">
        <b-form-group v-if="hasId">
          <label v-t="'label.roleId'" />
          <b-form-input type="text" v-model="form.roleId" readonly="readonly" />
        </b-form-group>
        <b-form-group>
          <label v-t="'label.roleName'" />
          <input type="text" v-model="form.roleName" maxlength="20" class="form-control" required :readonly="!isEditable" />
        </b-form-group>

        <b-form-group>
          <label v-t="'label.feature'" />
          <rolefeature-index/>
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
import rolefeatureIndex from '../rolefeature/index.vue'

export default {
  components: {
    breadcrumb,
    rolefeatureIndex, 
  },
  mixins: [editmixinVue],
  data() {
    return {
      name: 'role',
      id: 'roleId',
      backPath: '/master/role',
      appServicePath: '/meta/role',
      form: ViewHelper.extract(this.$store.state.app_service.role, ["roleId", "roleName"]),
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
          text: this.$i18n.tnl(Util.getDetailCaptionKey(this.$store.state.app_service.role.roleId)),
          active: true
        }
      ]
    }
  },
  computed: {
    hasId(){
      return Util.hasValue(this.form.roleId)
    },
    theme () {
      const theme = getButtonTheme()
      return 'outline-' + theme
    },
    ...mapState('app_service', [
      'role',
    ]),
  },
  methods: {
    async save() {
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