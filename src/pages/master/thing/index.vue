<template>
  <div>
    <breadcrumb :items="items" />
    <m-list :params="params" :list="things">
    </m-list>
  </div>
</template>

<script>
import mList from '../../../components/list.vue'
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import * as AppServiceHelper from '../../../sub/helper/AppServiceHelper'
import { addLabelByKey } from '../../../sub/helper/ViewHelper'
import * as Util from '../../../sub/util/Util'
import listmixinVue from '../../../components/listmixin.vue'
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
        name: 'thing',
        id: 'thingId',
        editPath: '/master/thing/edit',
        bulkEditPath: '/master/thing/bulkedit',
        appServicePath: '/basic/thing',
        csvOut: true,
        fields: addLabelByKey(this.$i18n, [ 
          {key: "thingId", sortable: true },
          {key: "thingCd", sortable: true },
          {key: "thingName", sortable: true },
          {key: "thumbnail" },
          {key: "displayName", sortable: true },
          {key: "description", sortable: true},
          {key: "exbId", sortable: true, 'class': 'text-center' },
          {key: "txId", sortable: true, 'class': 'text-center' },
          {key: "categoryName" },
          {key: "actions", thStyle: {width:'130px !important'} }
        ]),
        initTotalRows: this.$store.state.app_service.things.length,
        autoInsertId: ["thingId"],
      },
      items: [
        {
          text: this.$i18n.t('label.master'),
          active: true
        },
        {
          text: this.$i18n.t('label.thing'),
          active: true
        }
      ]
    }
  },
  computed: {
    ...mapState('app_service', [
      'things',
      'thingImages',
    ]),
  },
  methods: {
    async fetchData(payload) {
      try {
        this.replace({showProgress: true})
        let things = await AppServiceHelper.fetchList("/basic/thing/", 'thingId')
        let thingImages = things.map((val) => val.thumbnail)
        things = things.map((val) => {
          return {
            ...val,
            categoryName: Util.hasValue(val.thingCategoryList)? val.thingCategoryList[0].category.categoryName: "",
            thumbnail: ""
          }
        }) // omit images to avoid being filtering target
        if (payload && payload.done) {
          payload.done()
        }
        this.replaceAS({things, thingImages})
      }
      catch(e) {
        console.error(e)
      }
      this.replace({showProgress: false})
    },
    thumbnail(index) {
      return this.thingImages[index]
    },
  }
}
</script>

<style scoped lang="scss">

</style>
