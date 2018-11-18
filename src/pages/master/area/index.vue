<template>
  <div>
    <breadcrumb :items="items" />
    <m-list :params="params" :list="areaList" :another-page-params="anotherPageParams" ></m-list>
  </div>
</template>

<script>
import mList from '../../../components/page/list.vue'
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import * as StateHelper from '../../../sub/helper/StateHelper'
import { addLabelByKey } from '../../../sub/helper/ViewHelper'
import listmixinVue from '../../../components/mixin/listmixin.vue'
import breadcrumb from '../../../components/layout/breadcrumb.vue'
import * as Util from '../../../sub/util/Util'

export default {
  components: {
    mList, 
    breadcrumb,
  },
  mixins: [listmixinVue],
  data() {
    return {
      areaList: [],
      areaImages: [],
      params: {
        name: 'area',
        id: 'areaId',
        editPath: '/master/area/edit',
        bulkEditPath: '/master/area/bulkedit',
        bulkUploadPath: '/master/area/bulkUpload',
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
      anotherPageParams: [
        { name: "zone", id: "zoneList", jumpPath: "/master/zoneBlock/", sendParamNames: ["areaId"]},
        { name: "location", id: "locationList", jumpPath: "/master/location/", sendParamNames: ["areaId"]}, 
      ],
      items: [
        {
          text: this.$i18n.tnl('label.master'),
          active: true
        },
        {
          text: this.$i18n.tnl('label.area'),
          active: true
        }
      ]
    }
  },
  computed: {
    ...mapState('app_service', [
      'areas',
    ]),
  },
  methods: {
    async fetchData(payload) {
      try {
        this.replace({showProgress: true})
        await StateHelper.load('area')
        this.areaImages = this.areas.map((val) => ({ id: val.areaId, mapImage: val.mapImage, thumbnail: val.thumbnail}))
        this.areaList = this.areas.map((val) => ({
          ...val,
          zoneList: Util.hasValue(val.zoneList)? val.zoneList: [],
          locationList: Util.hasValue(val.locationList)? val.locationList: [],
          mapImage: "",
          thumbnail: ""
        })) // omit images to avoid being filtering target
        if (payload && payload.done) {
          payload.done()
        }
      }
      catch(e) {
        console.error(e)
      }
      this.replace({showProgress: false})
    },
    thumbnail(row) {
      const img = this.areaImages.find((val) => val.id == row.areaId)
      return img? img.thumbnail: null
    },
  },
}
</script>

<style scoped lang="scss"></style>