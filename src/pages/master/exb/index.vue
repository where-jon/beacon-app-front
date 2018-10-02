<template>
  <div>
    <breadcrumb :items="items" />
    <m-list :params="params" :list="exbs" />
  </div>
</template>

<script>
import mList from '../../../components/list.vue'
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import * as AppServiceHelper from '../../../sub/helper/AppServiceHelper'
import { addLabelByKey } from '../../../sub/helper/ViewHelper'
import listmixinVue from '../../../components/listmixin.vue';
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
        name: 'exb',
        id: 'exbId',
        editPath: '/master/exb/edit',
        bulkEditPath: '/master/exb/bulkedit',
        appServicePath: '/core/exb',
        fields: addLabelByKey(this.$i18n, [ 
          {key: "exbId", sortable: true },
          {key: "deviceId", sortable: true },
          {key: "deviceIdX", sortable: true },
          {key: "location.locationName", label:'locationName', sortable: true,},
          {key: "location.displayName", label:'displayName', sortable: true,},
          {key: "location.posId", label:'posId', sortable: true,},
          {key: "location.areaId", label:'areaId', sortable: true,},
          {key: "location.x", label:'locationX', sortable: true,},
          {key: "location.y", label:'locationY', sortable: true,},
          {key: "actions", thStyle: {width: '130px !important'} }
        ]),
        initTotalRows: this.$store.state.app_service.exbs.length
      },
      items: [
        {
          text: this.$i18n.t('label.master'),
          active: true
        },
        {
          text: this.$i18n.t('label.exb'),
          active: true
        }
      ]
    }
  },
  computed: {
    ...mapState('app_service', [
      'exbs',
      'exbImages',
    ]),
  },
  methods: {
    async fetchData(payload) {
      try {
        this.replace({showProgress: true})
        let exbs = await AppServiceHelper.fetchList('/core/exb/withLocation', 'exbId')
        exbs = exbs.map((exb) => {
          return {...exb, deviceIdX: exb.deviceId.toString(16).toUpperCase()}
        })
        if (payload && payload.done) {
          payload.done()
        }
        this.replaceAS({exbs})
      }
      catch(e) {
        console.error(e)
      }
      this.replace({showProgress: false})
    }
  }
}
</script>

<style scoped lang="scss">

</style>