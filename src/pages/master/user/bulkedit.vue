<template>
  <div class="container-fluid">
    <breadcrumb :items="items" />
    <bulkedit :id="id" ref="bulkEdit" :name="name" :back-path="backPath" :app-service-path="appServicePath" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { BULK } from '../../../sub/constant/Constants'
import * as Util from '../../../sub/util/Util'
import * as StateHelper from '../../../sub/helper/dataproc/StateHelper'
import * as MasterHelper from '../../../sub/helper/domain/MasterHelper'
import * as ViewHelper from '../../../sub/helper/ui/ViewHelper'
import breadcrumb from '../../../components/layout/breadcrumb.vue'
import bulkedit from '../../../components/page/bulkedit.vue'

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
      'roles',
    ]),
  },
  methods: {
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
    onRestruct(entity, dummyKey){
      if(Util.hasValue(entity.roleName)) {
        const role = this.roles.find(role => role.roleName == entity.roleName)
        entity.roleId = role? role.roleId: null
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
    async onSaving() {
      await this.$refs.bulkEdit.bulkSave2()
    },
    getConf() {
      return {}
    },
  }
}
</script>

<style scoped lang="scss">

</style>