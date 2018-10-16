<template>
  <div>
    <breadcrumb :items="items" />
    <m-list :params="params" :list="areas"></m-list>
  </div>
</template>

<script>
import mList from '../../../components/list.vue'
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import * as AppServiceHelper from '../../../sub/helper/AppServiceHelper'
import { addLabelByKey } from '../../../sub/helper/ViewHelper'
import listmixinVue from '../../../components/listmixin.vue'
import breadcrumb from '../../../components/breadcrumb.vue'

export default {
  components: {
    mList, 
    breadcrumb,
  },
  mixins: [listmixinVue],
  data() {
    return {
      params: {
        name: 'area',
        id: 'areaId',
        editPath: '/master/area/edit',
        bulkEditPath: '/master/area/bulkedit',
        appServicePath: '/core/area',
        csvOut: true,
        fields: addLabelByKey(this.$i18n, [ 
          {key: "areaId", sortable: true, tdClass: "action-rowdata" },
          {key: "areaName", sortable: true, tdClass: "action-rowdata"},
          {key: "thumbnail", tdClass: "action-rowdata" },
          {key: "actions", thStyle: {width: '130px !important'}, tdClass: "action-rowdata" }
        ]),
        initTotalRows: this.$store.state.app_service.areas.length
      },
      items: [
        {
          text: this.$i18n.t('label.master'),
          active: true
        },
        {
          text: this.$i18n.t('label.area'),
          active: true
        }
      ]
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
        let areas = await AppServiceHelper.fetchList('/core/area', 'areaId')
        let areaImages = areas.map((val) => val.thumbnail)
        areas = areas.map((val) => ({...val, mapImage: "", thumbnail: ""})) // omit images to avoid being filtering target
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
  },
}
</script>

<style scoped lang="scss"></style>