<template>
  <div>
    <breadcrumb :items="items" />
    <div class="container">
      <alert :message="message" />

      <b-form v-if="show" @submit.prevent="onSubmit">
        <!--種別-->
        <b-form-group>
          <b-form-row>
            <label v-t="'label.notifyState'" class="control-label" />
          </b-form-row>
          <b-form-row>
            <b-col sm="5">
              <b-form-select v-model="form.notifyState" :options="notifyStateOptions" class="mr-2" @change="signalChange"/>
            </b-col>
          </b-form-row>
        </b-form-group>

        <!--通知媒体-->
        <b-form-group v-show="notify.length > 1">
          <label v-t="'label.notifyMedium'" />
          <b-form-radio-group v-model="form.potType" :options="notify" :disabled="!isEditable" />
        </b-form-group>

        <!--通知先-->
        <b-form-group>
          <label v-t="'label.notifyTo'" />
          <b-form-textarea v-model="form.description" :rows="3" :max-rows="6" :readonly="!isEditable" maxlength="1000" />
        </b-form-group>

        <!--件名-->
        <b-form-group>
          <label v-t="'label.subject'" />
          <input v-model="form.potName" :readonly="!isEditable" type="text" maxlength="20" class="form-control" required>
        </b-form-group>

        <!--From-->
        <b-form-group>
          <label v-t="'label.mailFrom'" />
          <input v-model="form.potName" :readonly="!isEditable" type="text" maxlength="20" class="form-control" required>
        </b-form-group>

        <!--テンプレート-->
        <b-form-group>
          <label v-t="'label.template'" />
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
import * as StateHelper from '../../../sub/helper/StateHelper'
import * as ViewHelper from '../../../sub/helper/ViewHelper'
import * as AppServiceHelper from '../../../sub/helper/AppServiceHelper'
import editmixinVue from '../../../components/mixin/editmixin.vue'
import * as Util from '../../../sub/util/Util'
import breadcrumb from '../../../components/layout/breadcrumb.vue'
import alert from '../../../components/parts/alert.vue'
import { getButtonTheme } from '../../../sub/helper/ThemeHelper'
import { CATEGORY, ZONE, NOTIFY_STATE,NOTIFY_MIDIUM } from '../../../sub/constant/Constants'
import showmapmixin from '../../../components/mixin/showmapmixin.vue'
import { APP } from '../../../sub/constant/config.js'

export default {
  components: {
    breadcrumb,
    alert,
  },
  mixins: [editmixinVue, showmapmixin],
  data() {
    return {
      name: 'zone',
      id: 'zoneId',
      notify: _.slice(NOTIFY_MIDIUM.getTypes(), 0, 2).filter((val) => APP.NOTIFY_MIDIUM_TYPES.includes(val.value)),
      backPath: '/master/mailTemplate',
      appServicePath: '/core/zone',
      form: ViewHelper.extract(this.$store.state.app_service.zone, ['zoneId', 'zoneName', 'areaId', 'locationZoneList.0.locationZonePK.locationId', 'zoneCategoryList.0.zoneCategoryPK.categoryId']),
      areaNames: [],
      categoryNames: [],
      isEnableNameText: true,
      zones: [],
      isRegist: false,
      items: [
        {
          text: this.$i18n.tnl('label.master'),
          active: true
        },
        {
          text: this.$i18n.tnl('label.mailTemplate'),
          href: '/master/mailTemplate',
        },
        {
          text: this.$i18n.tnl(Util.getDetailCaptionKey(this.$store.state.app_service.zone.zoneId)),
          active: true
        }
      ]
    }
  },
  computed: {
    notifyStateOptions() {
      return NOTIFY_STATE.getOptions()
    },

    hasId (){
      return Util.hasValue(this.form.zoneId)
    },
    theme () {
      const theme = getButtonTheme()
      return 'outline-' + theme
    },
    ...mapState('app_service', [
      'zone',
    ]),
  },
  created() {
    this.initAreaNames()
    this.initCategoryNames()
  },
  methods: {
    reset () {
    },
    async signalChange(evt) {
      if(evt!=1) {
        //APP.TX_NAME = false
      }
      //this.display()
      console.log(evt)
    },
    async initAreaNames() {
      await StateHelper.load('area')
      this.areaNames = StateHelper.getOptionsFromState('area', false, true)
      console.log(this.areaNames )
    },
    async initCategoryNames() {
      await StateHelper.load('category')
      this.categoryNames = StateHelper.getOptionsFromState('category', false, false, 
        category => !CATEGORY.POT_AVAILABLE.includes(category.categoryType)
      )
    },
    async save() {
      const zoneId = Util.hasValue(this.form.zoneId)? this.form.zoneId: -1
      const entity = {
        zoneId: zoneId,
        zoneName: this.form.zoneName,
        zoneType: ZONE.getTypes()[1].value,
        areaId: this.form.areaId,
        locationZoneList: this.form.locationId? [{locationZonePK: {zoneId: zoneId, locationId: this.form.locationId}}]: null,
        zoneCategoryList: this.form.categoryId? [{zoneCategoryPK: {zoneId: zoneId, categoryId: this.form.categoryId}}]: null
      }
      return await AppServiceHelper.bulkSave(this.appServicePath, [entity])
    },
  }
}
</script>

<style scoped lang="scss">
  label.control-label {
    padding-top: 7px;
  }
</style>