<template>
  <div class="container-fluid">
    <breadcrumb :items="items" />
    <alert :message="message" />
    <b-row>
      <b-form v-if="show" inline @submit.prevent>
        <b-form-row class="ml-2 mb-2">
          <label v-t="'label.areaName'" class="control-label mr-sm-2" />
          <span :title="vueSelectTitle(vueSelected.area)">
            <v-select v-model="vueSelected.area" :options="areaNames" :clearable="false" class="mb-2 mr-sm-2 mb-sm-0 vue-options" :style="vueSelectStyle">
              <template slot="selected-option" slot-scope="option">
                {{ vueSelectCutOn(option, true) }}
              </template>
              <template slot="no-options">
                {{ vueSelectNoMatchingOptions }}
              </template>
            </v-select>
          </span>
        </b-form-row>
        <b-form-row class="ml-2 mb-2">
          <label v-t="'label.zoneName'" class="control-label mr-sm-2" />
          <input v-model="zoneName" type="text" maxlength="20" :disabled="!isEnableNameText" class="form-control mb-2 mr-sm-2 mb-sm-0" required>
        </b-form-row>
        <b-form-row class="ml-2 mb-2">
          <label v-t="'label.categoryName'" class="control-label mr-sm-2" />
          <span :title="vueSelectTitle(vueSelected.category)">
            <v-select v-model="vueSelected.category" :options="categoryNames" :disabled="!isEnableNameText" :clearable="false" class="mb-2 mr-sm-2 mb-sm-0 vue-options" :style="vueSelectStyle">
              <template slot="selected-option" slot-scope="option">
                {{ vueSelectCutOn(option) }}
              </template>
              <template slot="no-options">
                {{ vueSelectNoMatchingOptions }}
              </template>
            </v-select>
          </span>
        </b-form-row>
        <b-form-row class="ml-2 mb-2">
          <b-button v-if="isEditable || isDeleteable" v-t="'label.delete'" type="button" variant="outline-danger" :disabled="!isEnableNameText" @click="confirmDelete($event.target)" />
          <b-button v-if="isEditable || isDeleteable" class="button-regist" :variant="theme" type="button" @click="regist()">
            {{ label }}
          </b-button>
        </b-form-row>
      </b-form>
    </b-row>
    <ZoneCanvas :area-id="areaId" :zone-name="zoneName" :category-id="categoryId" :is-regist="isRegist" :is-complete-regist="isCompleteRegist" :is-delete="isDelete" :auth="{regist: isRegistable, update: isUpdatable, delete: isDeleteable}"
                @regist="doRegist"
                @selected="onSelected"
                @unselected="unSelected"
                @deleted="onDeleted"
                @pressDelKey="confirmDelete"
                @validated="validated"
                @reloaded="reloaded"
    />
    <!-- modal -->
    <b-modal id="modalInfo" :title="`${$t('label.Zone')}${$t('label.delete')}`" @ok="isDelete = true">
      {{ $i18n.tnl('message.deleteConfirm', {target: zoneName}) }}
    </b-modal>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { CATEGORY } from '../../../sub/constant/Constants'
import * as Util from '../../../sub/util/Util'
import * as AppServiceHelper from '../../../sub/helper/dataprocess/AppServiceHelper'
import * as StateHelper from '../../../sub/helper/dataprocess/StateHelper'
import * as ViewHelper from '../../../sub/helper/ui/ViewHelper'
import * as VueSelectHelper from '../../../sub/helper/ui/VueSelectHelper'
import breadcrumb from '../../../components/layout/breadcrumb.vue'
import commonmixin from '../../../components/mixin/commonmixin.vue'
import editmixin from '../../../components/mixin/editmixin.vue'
import showmapmixin from '../../../components/mixin/showmapmixin.vue'
import alert from '../../../components/parts/alert.vue'
import ZoneCanvas from '../../../components/parts/zonecanvas.vue'

export default {
  components: {
    breadcrumb,
    alert,
    ZoneCanvas,
  },
  mixins: [commonmixin, editmixin, showmapmixin],
  data() {
    return {
      id: -1,
      backPath: '/master/zoneBlock',
      appServicePath: '/core/zone',
      zoneClassPath: '/master/zoneClass',
      items: ViewHelper.createBreadCrumbItems('master', 'zoneBlock'),
      form: Util.extract(this.$store.state.app_service.zone, ['zoneId', 'zoneName', 'areaId', 'locationZoneList.0.locationZonePK.locationId', 'zoneCategoryList.0.zoneCategoryPK.categoryId']),
      vueSelected: {
        area: null,
      },
      areaNames: [],
      areaId: null,
      categoryNames: [],
      categoryId: null,
      deletedIds: [],
      isEnableNameText: false,
      zoneName: null,
      isRegist: false,
      isDelete: false,
      isCompleteRegist: false,
      nameAndCategory: {
        name: '',
        categoryId: -1,
      },
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
    ...mapState('app_service', [
      'zone', 'locations', 'areas', 'pageSendParam'
    ]),
  },
  watch: {
    'vueSelected.area': {
      handler: function(newVal, oldVal){
        this.areaId = Util.getValue(newVal, 'value', null)
      },
      deep: true,
    },
    'vueSelected.category': {
      handler: function(newVal, oldVal){
        this.categoryId = Util.getValue(newVal, 'value', null)
      },
      deep: true,
    },
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
        this.vueSelected.category = VueSelectHelper.getVueSelectData(this.areaNames, this.pageSendParam.areaId)
        this.replaceAS({pageSendParam: null})
      }
      else{
        this.areaId = this.areaNames[0].value
        this.vueSelected.category = VueSelectHelper.getVueSelectData(this.areaNames, this.areaId)
      }
    },
    async initCategoryNames() {
      await StateHelper.load('category')
      this.categoryNames = StateHelper.getOptionsFromState('category',
        category => StateHelper.getDispCategoryName(category),
        true, 
        category => !CATEGORY.POT_AVAILABLE.includes(category.categoryType)
      )
      const none = this.$i18n.t('label.none')
      this.categoryNames.unshift({label: none, text: none, value: -1})
      this.categoryId = this.categoryNames[0].value
      this.nameAndCategory.categoryId = this.categoryId
      this.vueSelected.category = VueSelectHelper.getVueSelectData(this.categoryNames, this.categoryId)
    },
    confirmDelete (button) {
      this.$root.$emit('bv::show::modal', 'modalInfo', button)
    },
    onSelected (zoneData) {
      this.replace({showAlert: false})
      this.id = zoneData.id
      this.zoneName = zoneData.name
      this.vueSelected.category = VueSelectHelper.getVueSelectData(this.categoryNames, zoneData.categoryId)
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
    switchMessageType(showMessageType = null){
      this.replace({showInfo: false})
      this.replace({showAlert: false})
      if(showMessageType){
        this.replace({[showMessageType]: true})
      }
    },
    validated (message) {
      this.message = message
      this.switchMessageType('showAlert')
      window.scrollTo(0, 0)
    },
    async doRegist (zones) {
      const path = this.appServicePath
      this.switchMessageType()
      this.message = ''
      await this.deletedIds.forEach((id) => AppServiceHelper.deleteEntity(path, id))
      let saveId = -1
      try {
        saveId = await AppServiceHelper.bulkSave(this.appServicePath + '/edit', zones, 0)
        this.isRegist = false
        this.message = this.$i18n.t('message.updateCompleted', { target: this.$i18n.t('label.zone') })
        this.switchMessageType('showInfo')
        this.isCompleteRegist = true
        // ストア内のゾーンレコードを最新に更新する
        await StateHelper.load('zone', true)
        StateHelper.setForceFetch('tx', true)
        StateHelper.setForceFetch('exb', true)
      } catch (e) {
        e.bulkError = e.response.data
        this.message = ViewHelper.getSubmitErrorMessage(e, this.showLine, this.crud, this.name)
        this.replace({showAlert: true})
        window.scrollTo(0, 0)
      }
      this.isRegist = false
      return saveId
    },
    reloaded() {
      this.isCompleteRegist = false
    },
  }
}
</script>

<style scoped lang="scss">
@import "../../../sub/constant/vue.scss";
  form.form-inline {
    margin-bottom: 20px;
  }
  button.button-regist {
    margin-left: 10px;
  }
</style>