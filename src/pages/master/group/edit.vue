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
          <label v-t="'label.groupId'" />
          <b-form-input v-model="form.groupId" type="text" readonly="readonly" />
        </b-form-group>
        <b-form-group>
          <label v-t="'label.groupName'" />
          <input v-model="form.groupName" type="text" maxlength="20" class="form-control" required :readonly="!isEditable">
        </b-form-group>
        <b-form-group>
          <label v-t="'label.ruby'" />
          <input v-model="form.ruby" type="text" class="form-control" maxlength="20" :readonly="!isEditable">
        </b-form-group>
        <b-form-group>
          <label v-t="'label.shape'" />
          <b-form-select v-model="form.displayShape" :options="shapes" required :disabled="!isEditable" :readonly="!isEditable" />
        </b-form-group>
        <color-picker :caption="'label.textColor'" :name="'displayColor'" />
        <color-picker :caption="'label.bgColor'" :name="'displayBgColor'" />
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
import { mapState } from 'vuex'
import * as ViewHelper from '../../../sub/helper/ViewHelper'
import editmixinVue from '../../../components/mixin/editmixin.vue'
import * as Util from '../../../sub/util/Util'
import * as AppServiceHelper from '../../../sub/helper/AppServiceHelper'
import breadcrumb from '../../../components/layout/breadcrumb.vue'
import { getButtonTheme } from '../../../sub/helper/ThemeHelper'
import { SHAPE } from '../../../sub/constant/Constants'
import colorPicker from '../../../components/parts/colorpicker.vue'

export default {
  components: {
    breadcrumb,
    colorPicker,
  },
  mixins: [editmixinVue],
  data() {
    return {
      name: 'group',
      id: 'groupId',
      backPath: '/master/group',
      appServicePath: '/basic/group',
      defaultColor: '#000000',
      defaultBgColor: '#ffffff',
      form: ViewHelper.extract(this.$store.state.app_service.group, ['groupId', 'groupName', 'ruby', 'display', 'description']),
      items: [
        {
          text: this.$i18n.tnl('label.master'),
          active: true
        },
        {
          text: this.$i18n.tnl('label.group'),
          href: '/master/group',
        },
        {
          text: this.$i18n.tnl(Util.getDetailCaptionKey(this.$store.state.app_service.group.groupId)),
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
    theme () {
      const theme = getButtonTheme()
      return 'outline-' + theme
    },
    ...mapState('app_service', [
      'group',
    ]),
    shapes(){
      return SHAPE.getShapes()
    },
  },
  methods: {
    beforeReload(){
      this.form.displayShape = this.form.display? this.form.display.shape: null
      this.form.displayColor = Util.colorCd4display(this.form.display? this.form.display.color: null, this.defaultColor)
      this.form.displayBgColor = Util.colorCd4display(this.form.display? this.form.display.bgColor: null, this.defaultBgColor)
    },
    async save() {
      const entity = {
        groupId: this.form.groupId || -1,
        groupName: this.form.groupName,
        ruby: this.form.ruby,
        description: this.form.description,
        display: {
          shape: this.form.displayShape,
          color: Util.colorCd4db(this.form.displayColor),
          bgColor: Util.colorCd4db(this.form.displayBgColor),
        },
      }
      return await AppServiceHelper.bulkSave(this.appServicePath, [entity])
    },
  },
}
</script>

<style scoped lang="scss">

</style>