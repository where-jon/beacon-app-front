<template>
  <div class="container-fluid">
    <breadcrumb :items="items" />
    <div class="container">
      <alert :message="message" />

      <b-form v-if="show" @submit.prevent="onSubmit">
        <b-form-group v-if="hasId">
          <label v-t="'label.groupId'" />
          <b-form-input v-model="form.groupId" type="text" readonly="readonly" />
        </b-form-group>
        <b-form-group>
          <label v-t="'label.groupName'" />
          <input v-model="form.groupName" :readonly="!isEditable" type="text" maxlength="20" class="form-control" required>
        </b-form-group>
        <b-form-group>
          <label v-t="'label.ruby'" />
          <input v-model="form.ruby" :readonly="!isEditable" type="text" class="form-control" maxlength="20">
        </b-form-group>
        <b-form-group>
          <label v-t="'label.shape'" />
          <b-form-select v-model="form.displayShape" :options="shapes" :disabled="!isEditable" :readonly="!isEditable" required />
        </b-form-group>
        <color-picker :caption="'label.textColor'" :name="'displayColor'" />
        <color-picker :caption="'label.bgColor'" :name="'displayBgColor'" />
        <b-form-group>
          <label v-t="'label.description'" />
          <b-form-textarea v-model="form.description" :rows="3" :max-rows="6" :readonly="!isEditable" maxlength="1000" />
        </b-form-group>

        <b-button v-t="'label.back'" type="button" variant="outline-danger" class="mr-2 my-1" @click="backToList" />
        <b-button v-if="isEditable" :variant="theme" type="submit" class="mr-2 my-1" @click="register(false)">
          {{ $i18n.tnl(`label.${isUpdate? 'update': 'register'}`) }}
        </b-button>
        <b-button v-if="isRegistable && !isUpdate" v-t="'label.registerAgain'" :variant="theme" type="submit" class="my-1" @click="register(true)" />
      </b-form>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import * as ViewHelper from '../../../sub/helper/ViewHelper'
import editmixinVue from '../../../components/mixin/editmixin.vue'
import * as HtmlUtil from '../../../sub/util/HtmlUtil'
import * as Util from '../../../sub/util/Util'
import * as AppServiceHelper from '../../../sub/helper/AppServiceHelper'
import * as StateHelper from '../../../sub/helper/StateHelper'
import breadcrumb from '../../../components/layout/breadcrumb.vue'
import alert from '../../../components/parts/alert.vue'
import { getButtonTheme } from '../../../sub/helper/ThemeHelper'
import { SHAPE } from '../../../sub/constant/Constants'
import colorPicker from '../../../components/parts/colorpicker.vue'

export default {
  components: {
    breadcrumb,
    alert,
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
  created() {
    this.beforeReload()
  },
  mounted(){
    HtmlUtil.setCustomValidationMessage()
  },
  methods: {
    beforeReload(){
      this.form.displayShape = this.form.display? this.form.display.shape: null
      this.form.displayColor = Util.colorCd4display(this.form.display? this.form.display.color: null, this.defaultColor)
      this.form.displayBgColor = Util.colorCd4display(this.form.display? this.form.display.bgColor: null, this.defaultBgColor)
    },
    afterCrud(){
      StateHelper.setForceFetch('pot', true)
    },
    async save() {
      const entity = {
        groupId: this.form.groupId || -1,
        groupName: this.form.groupName,
        ruby: this.form.ruby,
        description: this.form.description,
        display: {
          shape: `${this.form.displayShape}`,
          color: Util.colorCd4display(this.form.displayColor),
          bgColor: Util.colorCd4display(this.form.displayBgColor),
        },
      }
      return await AppServiceHelper.bulkSave(this.appServicePath, [entity])
    },
  },
}
</script>

<style scoped lang="scss">

</style>