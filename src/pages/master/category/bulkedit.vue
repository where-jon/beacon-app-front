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
import breadcrumb from '../../../components/breadcrumb.vue'
import bulkedit from '../../../components/bulkedit.vue'

export default {
  components: {
    breadcrumb,
    bulkedit,
  },
  data() {
    return {
      name: 'category',
      id: 'categoryId',
      backPath: '/master/category',
      appServicePath: '/basic/category',
      items: [
        {
          text: this.$i18n.tnl('label.master'),
          active: true
        },
        {
          text: this.$i18n.tnl('label.category'),
          href: '/master/category',
        },
        {
          text: this.$i18n.tnl('label.category') + this.$i18n.tnl('label.bulkRegister'),
          active: true
        }
      ]
    }
  },
  computed: {
    ...mapState('app_service', [
      'category', 'categories'
    ]),
  },
  methods: {
    resetStyle(entity){
        const updateData = this.categories.find((val) => val.categoryId == entity.categoryId)
        if(updateData && updateData.display){
          if (!entity.display) {
            entity.display = {}
          }
          if(!entity.display.color){
            entity.display.color = updateData.display.color
          }
          if(!entity.display.bgColor){
            entity.display.bgColor = updateData.display.bgColor
          }
          if(!entity.display.shape){
            entity.display.shape = updateData.display.shape
          }
        }
    },
    async save(bulkSaveFunc) {
      const MAIN_COL = "categoryId"
      const NUMBER_TYPE_LIST = ["categoryType", "shape"]
      const DISPLAY_COL = ["shape", "color", "bgColor"]
      await bulkSaveFunc(MAIN_COL, NUMBER_TYPE_LIST, null, (entity, headerName, val, dummyKey) => {
        if(headerName == MAIN_COL){
          entity.categoryId = Util.hasValue(val)? Number(val): --dummyKey  
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
      }, (entity, dummyKey) => this.resetStyle(entity))
    },
  }
}
</script>

<style scoped lang="scss">

</style>