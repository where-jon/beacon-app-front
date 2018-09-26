<template>
  <m-list :params="params" :list="categories" >
  </m-list>
</template>

<script>
import mList from '../../../components/list.vue'
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import * as AppServiceHelper from '../../../sub/helper/AppServiceHelper'
import { addLabelByKey } from '../../../sub/helper/ViewHelper'
import listmixinVue from '../../../components/listmixin.vue';
import * as Util from '../../../sub/util/Util'
import { CATEGORY } from '../../../sub/constant/Constants'

export default {
  components: {
    mList, 
  },
  mixins: [listmixinVue],
  data() {
    return {
      params: {
        name: 'category',
        id: 'categoryId',
        editPath: '/master/category/edit',
        appServicePath: '/basic/category',
        fields: addLabelByKey(this.$i18n, [ 
          {key: "categoryId", sortable: true },
          {key: "categoryName", sortable: true },
          {key: "categoryTypeName", label: "categoryType", sortable: true },
          {key: "style", label: "displayColor" },
          {key: "description" },
          {key: "actions", thStyle: {width:'130px !important'} }
        ]),
        initTotalRows: this.$store.state.app_service.categories.length
      }
    }
  },
  computed: {
    ...mapState('app_service', [
      'categories',
    ]),
  },
  methods: {
    getCategoryTypeName(category){
      const categoryTypeName = CATEGORY.TYPES.find((tval) => tval.value === category.categoryType)
      return categoryTypeName !== undefined? categoryTypeName.text: undefined
    },
    async fetchData(payload) {
      try {
        this.replace({showProgress: true})
        let categories = await AppServiceHelper.fetchList("/basic/category/", 'categoryId')
        categories = categories.map((val) => ({
          ...val,
          categoryTypeName: this.getCategoryTypeName(val),
          color: "",
          bgColor: "",
          style: {
            "color": Util.colorCd4display(val.color),
            "background-color": Util.colorCd4display(val.bgColor),
            "text-align": "center",
          },
        }))
        if (payload && payload.done) {
          payload.done()
        }
        this.replaceAS({categories})
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
