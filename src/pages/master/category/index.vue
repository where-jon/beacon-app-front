<template>
  <div>
    <breadcrumb :items="items" />
    <m-list :params="params" :list="categories" />
  </div>
</template>

<script>
import mList from '../../../components/page/list.vue'
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import * as StateHelper from '../../../sub/helper/StateHelper'
import * as AppServiceHelper from '../../../sub/helper/AppServiceHelper'
import { addLabelByKey } from '../../../sub/helper/ViewHelper'
import listmixinVue from '../../../components/mixin/listmixin.vue'
import * as Util from '../../../sub/util/Util'
import breadcrumb from '../../../components/layout/breadcrumb.vue'
import { CATEGORY } from '../../../sub/constant/Constants'

export default {
  components: {
    mList, 
    breadcrumb,
  },
  mixins: [listmixinVue],
  data() {
    return {
      params: {
        name: 'category',
        id: 'categoryId',
        editPath: '/master/category/edit',
        bulkEditPath: '/master/category/bulkedit',
        appServicePath: '/basic/category',
        csvOut: true,
        custumCsvColumns: ["categoryId", "categoryName", "categoryTypeName", "display.color", "display.bgColor", "display.shape", "description"],
        fields: addLabelByKey(this.$i18n, [ 
          {key: "categoryId", sortable: true },
          {key: "categoryName", sortable: true },
          {key: "categoryTypeName", label: "categoryType", sortable: true },
          {key: "style", label: "display" },
          {key: "description" },
          {key: "actions", thStyle: {width:'130px !important'} }
        ]),
        initTotalRows: this.$store.state.app_service.categories.length
      },
      categoryStyles: [],
      items: [
        {
          text: this.$i18n.tnl('label.master'),
          active: true
        },
        {
          text: this.$i18n.tnl('label.category'),
          active: true
        }
      ]
    }
  },
  computed: {
    ...mapState('app_service', [
      'categories',
    ]),
  },
  methods: {
    async fetchData(payload) {
      try {
        this.replace({showProgress: true})
        await StateHelper.load('category')
        this.categoryStyles = this.getStyleDisplay(this.categories)
        if (payload && payload.done) {
          payload.done()
        }
      }
      catch(e) {
        console.error(e)
      }
      this.replace({showProgress: false})
    },
    style(row) {
      const categoryStyle = this.categoryStyles.find((val) => val.entity.categoryId == row.categoryId)
      return categoryStyle? categoryStyle.style: null
    },
  }
}
</script>

<style scoped lang="scss">

</style>
