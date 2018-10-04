<template>
  <div>
    <breadcrumb :items="items" />
    <div class="container">

      <b-alert variant="info" :show="showInfo">{{ message }}</b-alert>
      <b-alert variant="danger" dismissible :show="showAlert"  @dismissed="showAlert=false">{{ message }}</b-alert>

      <b-form @submit="onSubmit" v-if="show">
        <b-form-group v-if="hasId">
          <label v-t="'label.groupId'" />
          <b-form-input type="text" v-model="form.groupId" readonly="readonly" />
        </b-form-group>
        <b-form-group>
          <label v-t="'label.groupName'" />
          <b-form-input type="text" v-model="form.groupName" maxlength="20" required :readonly="!isEditable" />
        </b-form-group>
        <b-form-group>
          <label v-t="'label.ruby'" />
          <b-form-input type="text" v-model="form.ruby" pattern="^[ぁ-んー]+$" maxlength="20" :readonly="!isEditable" />
        </b-form-group>
        <b-form-group>
          <label v-t="'label.color'" />
          <b-form-input type="color" v-model="form.displayColor" required :readonly="!isEditable" />
        </b-form-group>
        <b-form-group>
          <label v-t="'label.bgColor'" />
          <b-form-input type="color" v-model="form.displayBgColor" required :readonly="!isEditable" />
        </b-form-group>
        <b-form-group>
          <label v-t="'label.description'" />
          <b-form-textarea v-model="form.description" :rows="3" :max-rows="6" :readonly="!isEditable" ></b-form-textarea>
        </b-form-group>

        <b-button type="button" variant="outline-danger" @click="backToList" v-t="'label.back'"/>
        <b-button v-if="isEditable" type="submit" :variant="getTheme" @click="beforeSubmit(false)" class="ml-2" >{{ label }}</b-button>
        <b-button v-if="isEditable && !isUpdate" type="submit" :variant="getTheme" @click="beforeSubmit(true)" class="ml-2" v-t="'label.registerAgain'"/>
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
  components: {
    breadcrumb,
  },
  mixins: [editmixinVue],
  data() {
    return {
      name: 'group',
      id: 'groupId',
      backPath: '/master/group',
      appServicePath: '/basic/group',
      defaultColor: "#000000",
      defaultBgColor: "#ffffff",
      form: ViewHelper.extract(this.$store.state.app_service.group, ["groupId", "groupName", "ruby", "color", "bgColor", "description"]),
      items: [
        {
          text: this.$i18n.t('label.master'),
          active: true
        },
        {
          text: this.$i18n.t('label.group'),
          href: '/master/group',
        },
        {
          text: this.$i18n.t('label.group') + this.$i18n.t('label.detail'),
          active: true
        }
      ]
    }
  },
  created() {
    this.beforeReload()
  },
  computed: {
    hasId(){
      return Util.hasValue(this.form.groupId)
    },
    getTheme () {
      const theme = getButtonTheme(this.$store.state.loginId)
      return 'outline-' + theme
    },
    ...mapState('app_service', [
      'group',
    ]),
  },
  methods: {
    beforeReload(){
      this.form.displayColor = Util.colorCd4display(this.form.color, this.defaultColor)
      this.form.displayBgColor = Util.colorCd4display(this.form.bgColor, this.defaultBgColor)
    },
    beforeSubmit(again){
      if(this.form.groupId !== undefined){
        this.form.groupId = String(this.form.groupId)
      }
      this.form.color = Util.colorCd4db(this.form.displayColor)
      this.form.bgColor = Util.colorCd4db(this.form.displayBgColor)
      this.register(again)
    }
  },
}
</script>

<style scoped lang="scss">

</style>