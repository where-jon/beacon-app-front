<template>
  <div class="container-fluid">
    <breadcrumb :items="items" />
    <bulkedit :id="id" :name="name" :back-path="backPath" :app-service-path="appServicePath" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import * as Util from '../../../sub/util/Util'
import breadcrumb from '../../../components/layout/breadcrumb.vue'
import bulkedit from '../../../components/page/bulkedit.vue'
import * as AuthHelper from '../../../sub/helper/AuthHelper'
import * as ViewHelper from '../../../sub/helper/ViewHelper'

export default {
  components: {
    breadcrumb,
    bulkedit,
  },
  data() {
    return {
      name: 'region',
      id: 'regionId',
      backPath: '/master/region',
      appServicePath: '/core/region',
      items: ViewHelper.createBreadCrumbItems('master', {text: 'region', href: '/master/region'}, 'bulkRegister'),
    }
  },
  computed: {
    ...mapState('app_service', [
      'region',
    ]),
  },
  methods: {
    async save(bulkSaveFunc) {
      const MAIN_COL = 'regionId'
      const NUMBER_TYPE_LIST = ['regionId', 'meshId', 'deviceOffset']
      await bulkSaveFunc(MAIN_COL, null, null, (entity, headerName, val, dummyKey) => {
        if(Util.equalsAny(headerName, NUMBER_TYPE_LIST)){
          const num = Number(val)
          if(!Util.hasValue(val) || isNaN(num)){
            entity[`${headerName}Name`] = val
          }
          else{
            val = num
          }
        }
        if (headerName == MAIN_COL){
          if(!val) {
            val = dummyKey--
          }
        }
        entity[headerName] = val
        return dummyKey
      })
    },
    async afterCrud(){
      await AuthHelper.switchAppService()
    }
  }
}
</script>

<style scoped lang="scss">

</style>