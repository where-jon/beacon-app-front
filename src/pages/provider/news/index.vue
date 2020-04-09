<template>
  <div>
    <breadcrumb :items="breadCrumbs" />
    <m-list :params="params" :list="newsList" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import * as StateHelper from '../../../sub/helper/dataproc/StateHelper'
import * as ViewHelper from '../../../sub/helper/ui/ViewHelper'
import breadcrumb from '../../../components/layout/breadcrumb.vue'
import reloadmixin from '../../../components/mixin/reloadmixin.vue'
import mList from '../../../components/page/list.vue'

export default {
  components: {
    breadcrumb,
    mList,
  },
  mixins: [reloadmixin],
  data() {
    return {
      params: {
        name: 'news',
        id: 'newsId',
        confirmName: 'newsContent',
        indexPath: '/provider/news',
        editPath: '/provider/news/edit',
        appServicePath: '/news',
        fields: ViewHelper.addLabelByKey(this.$i18n, [ 
          {key: 'newsDt', sortable: true },
          {key: 'content', label: 'newsContent', sortable: true },
          {key: 'dispState', label: 'dispFlg', sortable: true },
          {key: 'actions', thStyle: {width:'130px !important'} }
        ]),
        sortBy: 'newsDt',
        sortDesc: true,
        initTotalRows: this.$store.state.app_service.newsList.length
      },
      breadCrumbs: ViewHelper.createBreadCrumbItems('provider', 'news'),
    }
  },
  computed: {
    ...mapState('app_service', [
      'newsList',
    ]),
  },
  methods: {
    async fetchData(payload) {
      try {
        this.showProgress()
        await StateHelper.load('news',true) // 第２引数：強制取得する（true）
        if (payload && payload.done) {
          payload.done()
        }
      }
      catch(e) {
        console.error(e)
      }
      this.hideProgress()
    },
  }
}
</script>

<style scoped lang="scss">

</style>
