<template>
  <div>
    <breadcrumb :items="items" />
    <m-list :params="params" :list="regions" />
  </div>
</template>

<script>
import mList from '../../../components/page/list.vue'
import { mapState } from 'vuex'
import * as StateHelper from '../../../sub/helper/StateHelper'
import { addLabelByKey } from '../../../sub/helper/ViewHelper'
import listmixinVue from '../../../components/mixin/listmixin.vue'
import breadcrumb from '../../../components/layout/breadcrumb.vue'

export default {
  components: {
    mList, 
    breadcrumb,
  },
  mixins: [listmixinVue],
  data() {
    return {
      params: {
        name: 'region',
        id: 'regionId',
        editPath: '/master/region/edit',
        bulkEditPath: '/master/region/bulkedit',
        appServicePath: '/core/region',
        csvOut: true,
        fields: addLabelByKey(this.$i18n, [ 
          {key: 'regionId', sortable: true },
          {key: 'regionName', sortable: true },
          {key: 'meshId', sortable: true},
          {key: 'deviceOffset', sortable: true},
          {key: 'description', sortable: true },
          {key: 'actions', thStyle: {width:'130px !important'} }
        ]),
        initTotalRows: this.$store.state.app_service.regions.length
      },
      items: [
        {
          text: this.$i18n.tnl('label.master'),
          active: true
        },
        {
          text: this.$i18n.tnl('label.region'),
          active: true
        }
      ]
    }
  },
  computed: {
    ...mapState('app_service', [
      'regions',
    ]),
  },
  methods: {
    async fetchData(payload) {
      try {
        this.replace({showProgress: true})
        await StateHelper.load('region')
        if (payload && payload.done) {
          payload.done()
        }
      }
      catch(e) {
        console.error(e)
      }
      this.replace({showProgress: false})
    },
  }
}
</script>

<style scoped lang="scss">

</style>
