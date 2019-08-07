<template>
  <div class="container-fluid">
    <breadcrumb :items="items" />
    <bulkedit :id="id" ref="bulkEdit" :name="name" :back-path="backPath" :app-service-path="appServicePath" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import * as Util from '../../../sub/util/Util'
import * as StateHelper from '../../../sub/helper/dataproc/StateHelper'
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
      name: 'group',
      id: 'groupId',
      backPath: '/master/group',
      appServicePath: '/basic/group',
      items: ViewHelper.createBreadCrumbItems('master', {text: 'group', href: '/master/group'}, 'bulkRegister'),
      masterCd: null,
    }
  },
  computed: {
    ...mapState('app_service', [
      'group', 'groups'
    ]),
  },
  async created() {
    await StateHelper.load('group')
    this.masterCd = StateHelper.createMasterCd('group', this.groups, null)
  },
  methods: {
    onRestruct(entity, dummyKey){
      if(Util.hasValueAny(entity.shape, entity.color, entity.bgColor)){
        Util.setValue(entity, 'display.shape', entity.shape)
        Util.setValue(entity, 'display.color', entity.color)
        Util.setValue(entity, 'display.bgColor', entity.bgColor)
      }
      if(!Util.hasValue(entity.groupCd)){
        entity.groupCd = this.masterCd
        this.masterCd = StateHelper.createMasterCd('group', [{groupCd: this.masterCd}], null)
      }
      return dummyKey
    },
    onSaved(){
      StateHelper.setForceFetch('pot', true)
      StateHelper.setForceFetch('tx', true)
    },
  }
}
</script>

<style scoped lang="scss">

</style>