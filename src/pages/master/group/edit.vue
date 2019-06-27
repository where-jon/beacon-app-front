<template>
  <div class="container-fluid">
    <breadcrumb :items="items" />
    <div class="container">
      <alert :message="message" />

      <b-form v-if="show" @submit.prevent="save">
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
import * as ViewHelper from '../../../sub/helper/ViewHelper'
import * as ValidateHelper from '../../../sub/helper/ValidateHelper'
import editmixin from '../../../components/mixin/editmixin.vue'
import commonmixin from '../../../components/mixin/commonmixin.vue'
import * as Util from '../../../sub/util/Util'
import * as ColorUtil from '../../../sub/util/ColorUtil'
import * as AppServiceHelper from '../../../sub/helper/AppServiceHelper'
import * as StateHelper from '../../../sub/helper/StateHelper'
import breadcrumb from '../../../components/layout/breadcrumb.vue'
import alert from '../../../components/parts/alert.vue'
import { SHAPE } from '../../../sub/constant/Constants'
import colorPicker from '../../../components/parts/colorpicker.vue'

export default {
  components: {
    breadcrumb,
    alert,
    colorPicker,
  },
  mixins: [editmixin, commonmixin],
  data() {
    let group = this.$store.state.app_service.group
    return {
      name: 'group',
      id: 'groupId',
      backPath: '/master/group',
      appServicePath: '/basic/group',
      defaultColor: '#000000',
      defaultBgColor: '#ffffff',
      form: Util.extract(this.$store.state.app_service.group, ['groupId', 'groupName', 'ruby', 'display', 'description']),
      oldShape: Util.getValue(group, 'display.shape', null),
      oldColor: Util.getValue(group, 'display.color', null),
      oldBgColor: Util.getValue(group, 'display.bgColor', null),
      items: ViewHelper.createBreadCrumbItems('master', {text: 'group', href: '/master/group'}, ViewHelper.getDetailCaptionKey(this.$store.state.app_service.group.groupId)),
    }
  },
  computed: {
    ...mapState('app_service', [
      'group',
    ]),
    shapes(){
      return SHAPE.getShapes()
    },
  },
  created() {
    this.onBeforeReload()
  },
  mounted(){
    ValidateHelper.setCustomValidationMessage()
  },
  methods: {
    onBeforeReload(){
      if(this.form){
        this.form.displayShape = this.oldShape? this.oldShape: this.shapes[0].value
        this.form.displayColor = ColorUtil.colorCd4display(this.oldColor? this.oldColor: null, this.defaultColor)
        this.form.displayBgColor = ColorUtil.colorCd4display(this.oldBgColor? this.oldBgColor: null, this.defaultBgColor)
      }
    },
    onSaved(){
      StateHelper.setForceFetch('pot', true)
      StateHelper.setForceFetch('tx', true)
    },
    async onSaving() {
      const entity = {
        groupId: this.form.groupId || -1,
        groupName: this.form.groupName,
        ruby: this.form.ruby,
        description: this.form.description,
        display: {
          shape: `${this.form.displayShape}`,
          color: ColorUtil.colorCd4display(this.form.displayColor),
          bgColor: ColorUtil.colorCd4display(this.form.displayBgColor),
        },
      }
      this.oldShape = this.form.displayShape
      this.oldColor = this.form.displayColor
      this.oldBgColor = this.form.displayBgColor
      return await AppServiceHelper.bulkSave(this.appServicePath, [entity])
    },
  },
}
</script>

<style scoped lang="scss">

</style>