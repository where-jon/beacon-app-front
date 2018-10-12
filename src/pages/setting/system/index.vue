
<template>
  <div>
    <breadcrumb :items="items" />
    <div class="container">
      <b-row>
        <b-col md="10" offset-md="1">
          <pagetitle title="label.system" />
          <edit-list :params="params" :multiList="categorySettings" />
        </b-col>
      </b-row>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import _ from 'lodash'
import * as AppServiceHelper from '../../../sub/helper/AppServiceHelper'
import breadcrumb from '../../../components/breadcrumb.vue'
import pagetitle from '../../../components/pagetitle.vue'
import editList from '../../../components/editlist.vue'
import * as Util from '../../../sub/util/Util'
import listmixinVue from '../../../components/listmixin.vue'

export default {
  components: {
    breadcrumb,
    pagetitle,
    editList,
  },
  mixins: [listmixinVue],
  data () {
    return {
      appServicePath: '/meta/setting',
      categorySettings: [],
      params: {
        name: 'setting',
        fields: [ 
          {key: "value", type: "valType", tooltip: "description" },
        ],
      },
      items: [
        {
          text: this.$i18n.t('label.setting'),
          active: true
        },
        {
          text: this.$i18n.t('label.system'),
          active: true
        },
      ],
    }
  },
  methods: {
    async fetchData() {
      try {
        this.replace({showProgress: true})
        let settings = await AppServiceHelper.fetchList("/meta/setting/", 'settingId')
        if(!Util.isArray(settings)){
          settings = []
        }
        const categorySettings = {}
        _.forEach(settings, (value, key) => {
          if(categorySettings[value.category] === undefined){
            categorySettings[value.category] = []
          }
          categorySettings[value.category].push({
            id: value.settingId,
            ...value,
          })
        })
        this.categorySettings = categorySettings
      }
      catch(e) {
        console.error(e)
      }
      this.replace({showProgress: false})
    },
    async save() {
      const entity = []
      for(let key in this.categorySettings){
        this.categorySettings[key].map((val) => {
          entity.push({
            settingId: val.settingId,
            category: val.category,
            key: val.key,
            description: val.description,
            valType: val.valType,
            value: val.value,
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
