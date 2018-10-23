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
      name: 'group',
      id: 'groupId',
      backPath: '/master/group',
      appServicePath: '/basic/group',
      items: [
        {
          text: this.$i18n.t('label.master'),
          active: true
        },
        {
          text: this.$i18n.t('label.group'),
          href: '/master/group',
        },
        {
          text: this.$i18n.t('label.group') + this.$i18n.t('label.bulkRegister'),
          active: true
        }
      ]
    }
  },
  computed: {
    ...mapState('app_service', [
      'group',
    ]),
  },
  methods: {
    async save(bulkSaveFunc) {
      const MAIN_COL = "groupId"
      const NUMBER_TYPE_LIST = ["shape"]
      const DISPLAY_COL = ["shape", "color", "bgColor"]
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
      })
    },
  }
}
</script>

<style scoped lang="scss">

</style>