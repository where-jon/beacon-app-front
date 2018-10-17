<template>
  <div>
    <breadcrumb :items="items" />
    <m-list :params="params" :list="exbs" />
  </div>
</template>

<script>
import mList from '../../../components/list.vue'
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import * as StateHelper from '../../../sub/helper/StateHelper'
import { addLabelByKey } from '../../../sub/helper/ViewHelper'
import listmixinVue from '../../../components/listmixin.vue'
import breadcrumb from '../../../components/breadcrumb.vue'
import * as Util from '../../../sub/util/Util'

let that

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
        csvOut: true,
        fields: addLabelByKey(this.$i18n, [ 
          {key: "exbId", sortable: true },
          {key: "deviceId", sortable: true },
          {key: "deviceIdX", sortable: true },
          {key: "locationName", label:'locationName', sortable: true,},
          {key: "posId", label:'posId', sortable: true,},
          {key: "areaName", label:'areaName', sortable: true,},
          {key: "x", label:'locationX', sortable: true,},
          {key: "y", label:'locationY', sortable: true,},
          {key: "sensor", label:'type', sortable: true,},
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
  mounted() {
    that = this
  },
  methods: {
    async fetchData(payload) {
      try {
        this.replace({showProgress: true})
        await StateHelper.load('exb')
        if (payload && payload.done) {
          payload.done()
        }
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