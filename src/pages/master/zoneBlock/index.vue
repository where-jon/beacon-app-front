<template>
  <div class="container-fluid">
    <breadcrumb :items="items" />
    <div class="container">
      <alert :message="message" />
      <b-form v-if="show" inline @submit.prevent>
        <label v-t="'label.areaName'" class="control-label mr-sm-2" />
        <b-form-select v-model="areaId" :options="areaNames" class="mb-2 mr-sm-2 mb-sm-0" required />
        <label v-t="'label.zoneName'" class="control-label mr-sm-2" />
        <input v-model="zoneName" type="text" maxlength="20" :disabled="!isEnableNameText" class="form-control mb-2 mr-sm-2 mb-sm-0" required>
        <label v-t="'label.categoryName'" class="control-label mr-sm-2" />
        <b-form-select v-model="categoryId" :options="categoryNames" :disabled="!isEnableNameText" class="mb-2 mr-sm-2 mb-sm-0" />
        <b-button v-if="isEditable || isDeleteable" v-t="'label.delete'" type="button" variant="outline-danger" :disabled="!isEnableNameText" @click="confirmDelete($event.target)" />
        <b-button v-if="isEditable || isDeleteable" class="button-regist" :variant="theme" type="button" @click="regist()">
          {{ label }}
        </b-button>
      </b-form>
      <ZoneCanvas :area-id="areaId" :zone-name="zoneName" :category-id="categoryId" :is-regist="isRegist" :is-complete-regist="isCompleteRegist" :is-delete="isDelete" :auth="{regist: isRegistable, update: isUpdatable, delete: isDeleteable}"
                  @regist="doRegist"
                  @selected="onSelected"
                  @unselected="unSelected"
                  @deleted="onDeleted"
                  @pressDelKey="confirmDelete"
                  @validated="validated"
                  @reloaded="reloaded"
      />
    </div>
    <!-- modal -->
    <b-modal id="modalInfo" :title="`${$t('label.Zone')}${$t('label.delete')}`" @ok="isDelete = true">
      {{ $i18n.tnl('message.deleteConfirm', {target: zoneName}) }}
    </b-modal>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import * as StateHelper from '../../../sub/helper/StateHelper'
import * as ViewHelper from '../../../sub/helper/ViewHelper'
import * as AppServiceHelper from '../../../sub/helper/AppServiceHelper'
import editmixinVue from '../../../components/mixin/editmixin.vue'
import ZoneCanvas from '../../../components/parts/zonecanvas.vue'
import * as Util from '../../../sub/util/Util'
import breadcrumb from '../../../components/layout/breadcrumb.vue'
import alert from '../../../components/parts/alert.vue'
import { getButtonTheme } from '../../../sub/helper/ThemeHelper'
import { CATEGORY } from '../../../sub/constant/Constants'
import showmapmixin from '../../../components/mixin/showmapmixin.vue'

export default {
  components: {
    breadcrumb,
    alert,
    ZoneCanvas,
  },
  mixins: [editmixinVue, showmapmixin],
  data() {
    return {
      id: -1,
      zoneClassPath: '/master/zoneClass',
      backPath: '/master/zoneBlock',
      appServicePath: '/core/zone',
      appServiceSavePath: '/edit',
      form: ViewHelper.extract(this.$store.state.app_service.zone, ['zoneId', 'zoneName', 'areaId', 'locationZoneList.0.locationZonePK.locationId', 'zoneCategoryList.0.zoneCategoryPK.categoryId']),
      areaNames: [],
      areaId: null,
      categoryNames: [],
      categoryId: null,
      isEnableNameText: false,
      zoneName: null,
      deletedIds: [],
      isRegist: false,
      isDelete: false,
      isCompleteRegist: false,
      nameAndCategory: {
        name: '',
        categoryId: -1,
      },
      items: ViewHelper.createBreadCrumbItems('master', 'zoneBlock'),
    }
  },
  computed: {
    base64 () {
      const areaImage = this.$store.state.app_service.areaImages.find((a) => { return a.areaId === this.areaId })
      return areaImage ? areaImage.mapImage : ''
    },
    hasId (){
      return Util.hasValue(this.form.zoneId)
    },
    theme () {
      const theme = getButtonTheme()
      return 'outline-' + theme
    },
    ...mapState('app_service', [
      'zone', 'locations', 'areas', 'pageSendParam'
    ]),
  },
  created() {
    this.initAreaNames()
    this.initCategoryNames()
  },
  methods: {
    async initAreaNames() {
      await StateHelper.load('area')
      this.areaNames = StateHelper.getOptionsFromState('area', false, true)
      if(this.pageSendParam){
        this.areaId = this.pageSendParam.areaId
        this.replaceAS({pageSendParam: null})
      }
      else{
        this.areaId = this.areaNames[0].value
      }
    },
    async initCategoryNames() {
      await StateHelper.load('category')
      this.categoryNames = StateHelper.getOptionsFromState('category', false, true, 
        category => !CATEGORY.POT_AVAILABLE.includes(category.categoryType)
      )
      const none = this.$i18n.t('label.none')
      this.categoryNames.unshift({label: none, text: none, value: -1})
      this.categoryId = this.categoryNames[0].value
      this.nameAndCategory.categoryId = this.categoryId
    },
    confirmDelete (button) {
      this.$root.$emit('bv::show::modal', 'modalInfo', button)
    },
    onSelected (zoneData) {
      this.replace({showAlert: false})
      this.id = zoneData.id
      this.zoneName = zoneData.name
      this.categoryId = zoneData.categoryId
      this.isEnableNameText = true
    },
    unSelected () {
      this.isEnableNameText = false
      this.zoneName = ''
    },
    onDeleted (id) {
      if (id > -1) {
        this.deletedIds.push(id)
      }
      this.isDelete = false
      this.unSelected()
    },
    regist () {
      this.isRegist = true
    },
    validated (message) {
      this.message = message
      this.replace({showAlert: true})
      window.scrollTo(0, 0)
    },
    async doRegist (zones) {
      const path = this.appServicePath
      this.replace({showInfo: false})
      this.message = ''
      await this.deletedIds.forEach((id) => AppServiceHelper.deleteEntity(path, id))
      const saveId = await AppServiceHelper.bulkSave(this.appServicePath + this.appServiceSavePath, zones, 0)
      this.isRegist = false
      this.message = this.$i18n.t('message.updateCompleted', { target: this.$i18n.t('label.zone') })
      this.replace({showInfo: true})
      this.isCompleteRegist = true
      return saveId
    },
    reloaded() {
      this.isCompleteRegist = false
    },
  }
}
</script>

<style scoped lang="scss">
  form.form-inline {
    margin-bottom: 20px;
  }
  button.button-regist {
    margin-left: 10px;
  }
</style>