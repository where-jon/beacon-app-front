
<template>
  <div>
    <breadcrumb :items="items" />
    <div class="container">
      <b-row>
        <b-col md="10" offset-md="1">
          <pagetitle title="label.system" />
          <edit-list ref="editList" :params="params" :multi-list="categorySettings" :new-form="newForm" :show-key-name="true" />
        </b-col>
      </b-row>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import * as StateHelper from '../../../sub/helper/StateHelper'
import _ from 'lodash'
import * as AppServiceHelper from '../../../sub/helper/AppServiceHelper'
import * as ConfigHelper from '../../../sub/helper/ConfigHelper'
import * as AuthHelper from '../../../sub/helper/AuthHelper'
import * as ViewHelper from '../../../sub/helper/ViewHelper'
import breadcrumb from '../../../components/layout/breadcrumb.vue'
import pagetitle from '../../../components/layout/pagetitle.vue'
import editList from '../../../components/page/editlist.vue'
import * as HtmlUtil from '../../../sub/util/HtmlUtil'
import * as Util from '../../../sub/util/Util'
import editmixinVue from '../../../components/mixin/editmixin.vue'

export default {
  components: {
    breadcrumb,
    pagetitle,
    editList,
  },
  mixins: [editmixinVue],
  data () {
    return {
      appServicePath: '/meta/setting',
      featurePath: '/setting/system',
      categorySettings: {},
      newForm: {},
      params: {
        backPath: '/setting/system',
        name: 'setting',
        fields: [ 
          {key: 'value', type: 'valType', tooltip: 'description' },
        ],
      },
      items: ViewHelper.createBreadCrumbItems('setting', 'system'),
    }
  },
  computed: {
    ...mapState('app_service', [
      'settings',
    ]),
  },
  mounted(){
    HtmlUtil.setCustomValidationMessage()
  },
  methods: {
    async fetchData(force = false) {
      try {
        this.showProgress()
        await StateHelper.load('settings', force)
        if(force){
          ConfigHelper.applyAppServiceSetting(this.settings)
        }
        if(!Util.isArray(this.settings)){
          this.settings = []
        }
        const categorySettings = {}
        _.forEach(this.settings, (value, key) => {
          if(categorySettings[value.category] == null){
            categorySettings[value.category] = []
          }
          categorySettings[value.category].push({
            ...value,
            id: value.settingId,
          })
        })
        this.categorySettings = categorySettings
      }
      catch(e) {
        console.error(e)
      }
      this.hideProgress()
    },
    async beforeReload(){
      this.newForm = {}
      await this.fetchData(true)
    },
    formatNumberList(str, type){
      return str.split(',').filter((val) => val.trim().length != 0).map((val) => {
        val.trim()
        if(/^number.*$/.test(type)){
          val = Number(val)
        }
        return val
      }).join(',')
    },
    format(str, type){
      const typeLow = type.toLowerCase()
      if(this.$refs.editList.useInputNumberType(typeLow)){
        return Number(str)
      }
      if(/^.*(list|array)$/.test(typeLow)){
        return this.formatNumberList(str, typeLow)
      }
      return str
    },
    createAddEntity() {
      return Util.hasValue(this.newForm.key) && this.newForm.type != null && Util.hasValue(this.newForm.value)?{
        settingId: -1,
        key: this.newForm.key,
        valType: this.newForm.type,
        value: this.format(this.newForm.value, this.newForm.type),
      }: null
    },
    async deleteEntity(entity) {
      await AppServiceHelper.deleteEntity(this.appServicePath, entity.id)
      ConfigHelper.applyAppServiceSetting([entity], JSON.parse(window.localStorage.getItem('defaultConfig')))
    },
    resetNewForm(isShow){
      if(!isShow){
        this.newForm = {}
      }
    },
    async afterCrud() {
      const login = JSON.parse(window.localStorage.getItem('login'))
      const userInfo = await AuthHelper.getUserInfo(login.tenantAdmin)
      AuthHelper.resetConfig(login.tenantAdmin, userInfo.setting)
    },
    async save() {
      const newEntity = this.createAddEntity()
      if(newEntity){
        return await AppServiceHelper.bulkSave(this.appServicePath, [newEntity])
      }
      const entity = []
      for(let key in this.categorySettings){
        this.categorySettings[key].forEach((val) => {
          entity.push({
            settingId: val.settingId,
            value: this.format(val.value, val.valType),
            key: val.key,
            valType: val.valType,
          })
        })
      }
      return await AppServiceHelper.bulkSave(this.appServicePath, entity)
    }
  }
}
</script>

<style scoped lang="scss">

</style>
