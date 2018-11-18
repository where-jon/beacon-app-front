
<template>
  <div>
    <breadcrumb :items="items" />
    <div class="container">
      <b-row>
        <b-col md="10" offset-md="1">
          <pagetitle title="label.system" />
          <edit-list :params="params" :multiList="categorySettings" :newForm="newForm" />
        </b-col>
      </b-row>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import * as StateHelper from '../../../sub/helper/StateHelper'
import _ from 'lodash'
import * as AppServiceHelper from '../../../sub/helper/AppServiceHelper'
import * as ConfigHelper from '../../../sub/helper/ConfigHelper'
import breadcrumb from '../../../components/layout/breadcrumb.vue'
import pagetitle from '../../../components/layout/pagetitle.vue'
import editList from '../../../components/page/editlist.vue'
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
      categorySettings: [],
      newForm: {},
      params: {
        name: 'setting',
        fields: [ 
          {key: "value", type: "valType", tooltip: "description" },
        ],
      },
      items: [
        {
          text: this.$i18n.tnl('label.setting'),
          active: true
        },
        {
          text: this.$i18n.tnl('label.system'),
          active: true
        },
      ],
    }
  },
  computed: {
    ...mapState('app_service', [
      'settings',
      'defaultConfig',
    ]),
  },
  methods: {
    async fetchData(force = false) {
      try {
        this.replace({showProgress: true})
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
      this.replace({showProgress: false})
    },
    async beforeReload(){
      this.newForm = {}
      await this.fetchData(true)
    },
    addNewEntity() {
      return {
        settingId: -1,
        key: this.newForm.key,
        valType: this.newForm.type,
        value: this.newForm.value,
      }
    },
    async deleteEntity(entity) {
      await AppServiceHelper.deleteEntity(this.appServicePath, entity.id)
      ConfigHelper.applyAppServiceSetting([entity], this.defaultConfig)
    },
    async save() {
      const entity = []
      for(let key in this.categorySettings){
        this.categorySettings[key].map((val) => {
          entity.push({
            settingId: val.settingId,
            value: val.value,
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
