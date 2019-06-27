<template>
  <div class="container-fluid">
    <breadcrumb :items="items" />
    <bulkedit :id="id" ref="bulkEdit" :name="name" :back-path="backPath" :app-service-path="appServicePath" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { BULK } from '../../../sub/constant/Constants'
import breadcrumb from '../../../components/layout/breadcrumb.vue'
import bulkedit from '../../../components/page/bulkedit.vue'
import * as ViewHelper from '../../../sub/helper/ViewHelper'
import * as StateHelper from '../../../sub/helper/StateHelper'
import * as Util from '../../../sub/util/Util'

export default {
  components: {
    breadcrumb,
    bulkedit,
  },
  data() {
    return {
      name: 'user',
      id: 'userId',
      backPath: '/master/user',
      appServicePath: '/meta/user',
      items: ViewHelper.createBreadCrumbItems('master', {text: 'user', href: '/master/user'}, 'bulkRegister'),
    }
  },
  computed: {
    ...mapState('app_service', [
      'user',
    ]),
  },
  methods: {
    async onSaving() {
      await this.$refs.bulkEdit.bulkSave()
    },
    restructRegion(entity, dummyKey){
      if(!Util.hasValue(entity.regionNames)){
        entity.userRegionList = []
        return dummyKey
      }
      entity.userRegionList = entity.regionNames.split(BULK.SPLITTER).map(regionName => ({
        userRegionPK: {userId: dummyKey--, regionId: dummyKey--},
        regionName: regionName,
      }))
      return dummyKey
    },
    restruct(entity, dummyKey){
      if(Util.hasValue(entity.roleName)) {
        entity.role = {roleId: dummyKey--, roleName: entity.roleName}
      }
      if(Util.hasValue(entity.regionNames)) {
        entity.userRegionList = entity.regionNames.split(BULK.SPLITTER).map(regionName => ({
          userRegionPK: {userId: dummyKey--, regionId: dummyKey--},
          regionName: regionName,
        }))
      }
      else{
        entity.userRegionList = []
      }
      return dummyKey
    },
    onSaved(){
      StateHelper.setForceFetch('pot', true)
    },
  }
}
</script>

<style scoped lang="scss">

</style>