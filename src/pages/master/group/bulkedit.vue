<template>
  <div>
    <breadcrumb :items="items" />
    <bulkedit :id="id" :name="name" :back-path="backPath" :app-service-path="appServicePath" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import _ from 'lodash'
import * as Util from '../../../sub/util/Util'
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
      items: [
        {
          text: this.$i18n.tnl('label.master'),
          active: true
        },
        {
          text: this.$i18n.tnl('label.group'),
          href: '/master/group',
        },
        {
          text: this.$i18n.tnl('label.bulkRegister'),
          active: true
        }
      ]
    }
  },
  computed: {
    ...mapState('app_service', [
      'group', 'groups'
    ]),
  },
  methods: {
    resetStyle(entity, dummyKey){
      const updateData = this.groups.find((val) => val.groupId == entity.groupId)
      if(updateData && updateData.display){
        if (!entity.display) {
          entity.display = {}
        }
        if(entity.display.color == null){
          entity.display.color = updateData.display.color
        }
        if(entity.display.bgColor == null){
          entity.display.bgColor = updateData.display.bgColor
        }
        if(entity.display.shape == null){
          entity.display.shape = updateData.display.shape
        }
      }
      return dummyKey
    },
    async save(bulkSaveFunc) {
      const MAIN_COL = 'groupId'
      const NUMBER_TYPE_LIST = ['shape']
      const DISPLAY_COL = ['shape', 'color', 'bgColor']
      await bulkSaveFunc(MAIN_COL, NUMBER_TYPE_LIST, null, (entity, headerName, val, dummyKey) => {
        if(headerName == MAIN_COL){
          entity.groupId = Util.hasValue(val)? Number(val): --dummyKey  
        }
        else if (_.includes(DISPLAY_COL, headerName)) {
          if (!entity.display) {
            entity.display = {}
          }
          entity.display[headerName] = val
        }
        else{
          entity[headerName] = val
        }
        return dummyKey
      }, (entity, dummyKey) => this.resetStyle(entity, dummyKey))
    },
  }
}
</script>

<style scoped lang="scss">

</style>