<template>
  <div>
    <breadcrumb :items="items" />
    <m-list :params="params" :list="regions" >
    </m-list>
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
        name: 'region',
        id: 'regionId',
        editPath: '/master/region/edit',
        appServicePath: '/core/region',
        fields: addLabelByKey(this.$i18n, [ 
          {key: "regionId", sortable: true },
          {key: "regionName", sortable: true },
          {key: "meshId", sortable: true},
          {key: "description", sortable: true },
          {key: "actions", thStyle: {width:'130px !important'} }
        ]),
        initTotalRows: this.$store.state.app_service.regions.length
      },
      items: [
        {
          text: this.$i18n.t('label.master'),
          active: true
        },
        {
          text: this.$i18n.t('label.region'),
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
        let regions = await AppServiceHelper.fetchList("/core/region/", 'regionId')
        if (payload && payload.done) {
          payload.done()
        }
        this.replaceAS({regions})
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
