<template>
  <div>
    <breadcrumb :items="items" />
    <m-list :params="params" :list="categories" >
    </m-list>
  </div>
</template>

<script>
import mList from '../../../components/list.vue'
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import * as StateHelper from '../../../sub/helper/StateHelper'
import * as AppServiceHelper from '../../../sub/helper/AppServiceHelper'
import { addLabelByKey } from '../../../sub/helper/ViewHelper'
import listmixinVue from '../../../components/listmixin.vue'
import * as Util from '../../../sub/util/Util'
import breadcrumb from '../../../components/breadcrumb.vue'
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
        fields: addLabelByKey(this.$i18n, [ 
          {key: "categoryId", sortable: true },
          {key: "categoryName", sortable: true },
          {key: "categoryTypeName", label: "categoryType", sortable: true },
          {key: "style", label: "displayColor" },
          {key: "description" },
          {key: "actions", thStyle: {width:'130px !important'} }
        ]),
        initTotalRows: this.$store.state.app_service.categories.length
      },
      categoryStyles: [],
      items: [
        {
          text: this.$i18n.t('label.master'),
          active: true
        },
        {
          text: this.$i18n.t('label.category'),
          active: true
        }
      ]
    }
  },
  computed: {
    ...mapState('app_service', [
      'categories', 'categoryStyles',
    ]),
  },
  methods: {
    async fetchData(payload) {
      try {
        this.replace({showProgress: true})
        await StateHelper.load('category')
        this.categoryStyles = this.categories.map((val) => ({
          "color": Util.colorCd4display(val.color),
          "background-color": Util.colorCd4display(val.bgColor),
          "text-align": "center",
        }))
        if (payload && payload.done) {
          payload.done()
        }
      }
      catch(e) {
        console.error(e)
      }
      this.replace({showProgress: false})
    },
    style(index) {
      return this.categoryStyles[index]
    },
  }
}
</script>

<style scoped lang="scss">

</style>
