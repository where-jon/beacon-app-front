<template>
  <div class="container-fluid">
    <breadcrumb :items="breadCrumbs" />
    <div class="container">
      <alert :message="message" />

      <b-form v-if="show" @submit.prevent="save">
        <b-form-group>
          <label v-t="'label.id'" />
          <input v-model="form.groupCd" :readonly="!isEditable || useAd" type="text" maxlength="20" class="form-control">
        </b-form-group>
        <b-form-group>
          <label v-t="'label.groupName'" />
          <input v-model="form.groupName" :readonly="!isEditable || useAd" type="text" maxlength="20" class="form-control" required>
        </b-form-group>

        <extform :is-editable="isEditable" :form="form" :p-ext-value="extValue" :p-exclude-keys="excludeExtKeys"/>

        <b-form-group>
          <label v-t="'label.shape'" />
          <b-form-select v-model="form.displayShape" :options="shapes" :disabled="!isEditable" :readonly="!isEditable" required />
        </b-form-group>
        <color-picker :caption="'label.textColor'" :name="'displayColor'" />
        <color-picker :caption="'label.bgColor'" :name="'displayBgColor'" />
        <b-form-group>
          <label v-t="'label.description'" />
          <b-form-textarea v-model="form.description" :rows="3" :max-rows="6" :readonly="!isEditable || useAd" maxlength="1000" />
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
import { APP } from '../../../sub/constant/config'
import { SHAPE } from '../../../sub/constant/Constants'
import * as ColorUtil from '../../../sub/util/ColorUtil'
import * as Util from '../../../sub/util/Util'
import * as AppServiceHelper from '../../../sub/helper/dataproc/AppServiceHelper'
import * as ExtValueHelper from '../../../sub/helper/domain/ExtValueHelper'
import * as MasterHelper from '../../../sub/helper/domain/MasterHelper'
import * as ValidateHelper from '../../../sub/helper/dataproc/ValidateHelper'
import * as ViewHelper from '../../../sub/helper/ui/ViewHelper'
import breadcrumb from '../../../components/layout/breadcrumb.vue'
import commonmixin from '../../../components/mixin/commonmixin.vue'
import editmixin from '../../../components/mixin/editmixin.vue'
import alert from '../../../components/parts/alert.vue'
import colorPicker from '../../../components/parts/colorpicker.vue'
import extform from '../../../components/parts/extform.vue'

export default {
  components: {
    breadcrumb,
    alert,
    colorPicker,
    extform,
  },
  mixins: [commonmixin, editmixin],
  data() {
    const group = this.$store.state.app_service.group
    return {
      name: 'group',
      id: 'groupId',
      backPath: '/master/group',
      appServicePath: '/basic/group',
      breadCrumbs: ViewHelper.createBreadCrumbItems('master', {text: 'group', href: '/master/group'}, ViewHelper.getDetailCaptionKey(this.$store.state.app_service.group.groupId)),
      form: Util.extract(this.$store.state.app_service.group, [
        'groupId', 'groupCd', 'groupName', 'display', 'description',
        ...ExtValueHelper.getExtValueKeys(APP.GROUP, true)
      ]),
      defaultColor: '#000000',
      defaultBgColor: '#ffffff',
      oldShape: Util.getValue(group, 'display.shape'),
      oldColor: Util.getValue(group, 'display.color'),
      oldBgColor: Util.getValue(group, 'display.bgColor'),
      groupCdOld: null,
      useAd: APP.AUTH.USE_AD,
      excludeExtKeys: ['description'],
    }
  },
  computed: {
    ...mapState('app_service', [
      'group'
    ]),
    shapes(){
      return SHAPE.getShapes()
    },
    extValue() {
      return ExtValueHelper.getExtValue(APP.GROUP)
    },
  },
  created() {
    this.onBeforeReload(true)
  },
  mounted(){
    if(!Util.hasValue(this.form.groupCd)){
      this.form.groupCd = MasterHelper.createMasterCd('group', this.groups, this.group)
    }
    ValidateHelper.setCustomValidationMessage()
  },
  methods: {
    onBeforeReload(isInit){
      if(this.form){
        this.form.displayShape = this.oldShape? this.oldShape: this.shapes[0].value
        this.form.displayColor = ColorUtil.colorCd4display(this.oldColor? this.oldColor: null, this.defaultColor)
        this.form.displayBgColor = ColorUtil.colorCd4display(this.oldBgColor? this.oldBgColor: null, this.defaultBgColor)
      }
      if(!isInit){
        this.form.groupCd = MasterHelper.nextCd(this.groupCdOld)
      }
    },
    async onSaved(){
      this.groupCdOld = this.form.groupCd
    },
    async onSaving() {
      const entity = {
        updateKey: this.form.groupId || null,
        ID: this.form.groupCd,
        groupName: this.form.groupName,
        ruby: this.form.ruby,
        description: this.form.description,
        display: null,
        extValue: null,
      }

      if (this.form.displayShape && this.form.displayColor && this.form.displayBgColor) {
        entity.display = {
          shape: `${this.form.displayShape}`,
          color: ColorUtil.colorCd4display(this.form.displayColor),
          bgColor: ColorUtil.colorCd4display(this.form.displayBgColor),
        }
        entity.display = JSON.stringify(entity.display)
      }

      const extValue = {}
      ExtValueHelper.getExtValueKeys(APP.GROUP).forEach(key => {
        if (this.form[key]) {
          extValue[key] = this.form[key]
        }
      })
      if (Object.keys(extValue).length > 0) {
        entity.extValue = JSON.stringify(extValue)
      }

      this.oldShape = this.form.displayShape
      this.oldColor = this.form.displayColor
      this.oldBgColor = this.form.displayBgColor
      return await AppServiceHelper.bulkSaveByCsvStr(this.appServicePath, [entity])
    },
  },
}
</script>

<style scoped lang="scss">

</style>