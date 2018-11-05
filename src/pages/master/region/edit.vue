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
          <b-form-textarea v-model="form.description" :rows="3" :max-rows="6" :readonly="!isEditable" ></b-form-textarea>
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
import editmixinVue from '../../../components/editmixin.vue'
import * as Util from '../../../sub/util/Util'
import breadcrumb from '../../../components/breadcrumb.vue'
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
          text: this.$i18n.tnl('label.region') + this.$i18n.tnl('label.detail'),
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
      const theme = getButtonTheme(this.$store.state.loginId)
      return 'outline-' + theme
    },
    ...mapState('app_service', [
      'region',
    ]),
  },
}
</script>

<style scoped lang="scss">

</style>