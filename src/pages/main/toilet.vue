<template>
  <div class="container-fluid">
    <breadcrumb :items="breadCrumbs" reload :auto-reload="autoReload" />
    <toiletview :data-list="dataList" :show-area="true" icon-header="iconHeaderLarge" />
  </div>
</template>

<script>
import { APP } from '../../sub/constant/config'
import * as ViewHelper from '../../sub/helper/ui/ViewHelper'
import * as ToiletHelper from '../../sub/helper/domain/ToiletHelper'
import breadcrumb from '../../components/layout/breadcrumb.vue'
import reloadmixin from '../../components/mixin/reloadmixin.vue'
import toiletview from '../../components/parts/toiletview.vue'

export default {
  components: {
    breadcrumb,
    toiletview
  },
  mixins: [reloadmixin],
  data() {
    return {
      reload: false,
      dataList: [],
    }
  },
  computed: {
    autoReload() {
      return APP.TOILET.AUTO_RELOAD
    },
    breadCrumbs() {
      return ViewHelper.createBreadCrumbItems('main', 'toiletStatus')
    },
  },
  async mounted() {
    await this.fetchData()
  },
  methods: {
    async fetchData(payload){
      try {
        this.showProgress()
        this.dataList = await ToiletHelper.fetchData()
        if (payload && payload.done) {
          payload.done()
        }
      } catch(e) {
        console.error(e)
      }
      this.hideProgress()
    },
  },
}
</script>

<style scoped lang="scss">
</style>
