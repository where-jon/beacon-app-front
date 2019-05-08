<template>
  <div>
    <breadcrumb :items="items" />
    <m-list :params="params" :list="newsList" />
  </div>
</template>

<script>
import mList from '../../../components/page/list.vue'
import { mapState } from 'vuex'
import * as StateHelper from '../../../sub/helper/StateHelper'
import * as ViewHelper from '../../../sub/helper/ViewHelper'
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
        name: 'news',
        id: 'newsId',
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
      items: ViewHelper.createBreadCrumbItems('provider', 'news'),
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
        await StateHelper.load('news')
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
