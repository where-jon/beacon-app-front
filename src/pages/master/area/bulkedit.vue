<template>
  <div>
    <breadcrumb :items="items" />
    <bulkedit :name="name" :id="id" :backPath="backPath" :app-service-path="appServicePath" />
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
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
      name: 'area',
      id: 'areaId',
      backPath: '/master/area',
      appServicePath: '/core/area',
      items: [
        {
          text: this.$i18n.tnl('label.master'),
          active: true
        },
        {
          text: this.$i18n.tnl('label.area'),
          href: '/master/area',
        },
        {
          text: this.$i18n.tnl('label.area') + this.$i18n.tnl('label.bulkRegister'),
          active: true
        }
      ]
    }
  },
  computed: {
    ...mapState('app_service', [
      'area', 'areas'
    ]),
  },
  methods: {
    resetThumbnail(entity, dummyKey){
        const updateData = this.areas.find((val) => val.areaId == entity.areaId)
        if(updateData){
          entity.mapImage = updateData.mapImage
          entity.thumbnail = updateData.thumbnail
        }
        return dummyKey
    },
    async save(bulkSaveFunc) {
      const MAIN_COL = "areaId"
      const NUMBER_TYPE_LIST = ["areaId"]
      await bulkSaveFunc(MAIN_COL, NUMBER_TYPE_LIST, null, null, (entity, dummyKey) => this.resetThumbnail(entity, dummyKey))
    },
  }
}
</script>

<style scoped lang="scss">

</style>