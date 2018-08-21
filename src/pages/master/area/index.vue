<template>
  <m-list :params="params" :list="areas" >
  </m-list>
</template>

<script>
import mList from '../../../components/list.vue'
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import * as AppServiceHelper from '../../../sub/helper/AppServiceHelper'
import { addLabelByKey } from '../../../sub/helper/ViewHelper'
import listmixinVue from '../../../components/listmixin.vue';

export default {
  components: {
    mList, 
  },
  mixins: [listmixinVue],
  data() {
    return {
      params: {
        name: 'area',
        id: 'areaId',
        editPath: '/master/area/edit',
        appServicePath: '/core/area',
        fields: addLabelByKey(this.$i18n, [ 
          {key: "areaId", sortable: true },
          {key: "areaName", sortable: true,},
          {key: "thumbnail" },
          {key: "actions", thStyle: {width: '130px !important'} }
        ]),
        initTotalRows: this.$store.state.app_service.areas.length
      }
    }
  },
  computed: {
    ...mapState('app_service', [
      'areas',
      'areaImages',
    ]),
  },
  methods: {
    async fetchData(payload) {
      try {
        this.replace({showProgress: true})
        let areas = await AppServiceHelper.fetchList('/core/area')
        let areaImages = areas.map((val) => val.mapImage)
        areas = areas.map((val) => ({...val, mapImage: ""})) // omit images to avoid being filtering target
        if (payload && payload.done) {
          payload.done()
        }
        this.replaceAS({areas, areaImages})
      }
      catch(e) {
        console.error(e)
      }
      this.replace({showProgress: false})
    },
    thumbnail(index) {
      return this.areaImages[index]
    },
  }
}
</script>

<style scoped lang="scss">

</style>