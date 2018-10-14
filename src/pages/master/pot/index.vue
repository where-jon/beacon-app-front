<template>
  <div>
    <breadcrumb :items="items" />
    <m-list :params="params" :list="pots" />
  </div>
</template>

<script>
import mList from '../../../components/list.vue'
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import * as AppServiceHelper from '../../../sub/helper/AppServiceHelper'
import * as Util from '../../../sub/util/Util'
import { addLabelByKey } from '../../../sub/helper/ViewHelper'
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
        name: 'pot',
        id: 'potId',
        editPath: '/master/pot/edit',
        appServicePath: '/basic/pot',
        bulkEditPath: '/master/pot/bulkEdit',
        csvOut: true,
        fields: addLabelByKey(this.$i18n, [ 
          {key: "potId", sortable: true, tdClass: "thumb-rowdata"},
          {key: "thumbnail", tdClass: "thumb-rowdata" },
          {key: "txIdName", label:'tx', sortable: true, 'class': 'text-center' , tdClass: "thumb-rowdata"},
          {key: "potCd", sortable: true , tdClass: "thumb-rowdata"},
          {key: "potName", sortable: true , tdClass: "thumb-rowdata"},
          {key: "extValue.ruby", label: "ruby", sortable: true, tdClass: "thumb-rowdata"},
          {key: "displayName", sortable: true, tdClass: "thumb-rowdata"},
          {key: "groupName", label: "group", sortable: true, tdClass: "thumb-rowdata"},
          {key: "categoryName", label: "category", sortable: true, tdClass: "thumb-rowdata"},
          {key: "extValue.post", label: "post", tdClass: "thumb-rowdata"},
          {key: "actions", thStyle: {width:'130px !important'} , tdClass: "thumb-rowdata"}
        ]),
        initTotalRows: this.$store.state.app_service.pots.length,
      },
      items: [
        {
          text: this.$i18n.t('label.master'),
          active: true
        },
        {
          text: this.$i18n.t('label.pot'),
          active: true
        }
      ]
    }
  },
  computed: {
    ...mapState('app_service', [
      'pots',
      'potImages',
      'groups',
      'categories',
    ]),
  },
  methods: {
    async fetchData(payload) {
      try {
        this.replace({showProgress: true})
        let pots = await AppServiceHelper.fetchList("/basic/pot/withThumbnail", 'potId')
        let potImages = pots.map((val) => val.thumbnail)
        pots = pots.map((val) => ({
          ...val,
          txIdName: val.txId? Util.getValue(val, 'tx.txName', '') + '(' + val.txId + ')': null,
          groupName: Util.getValue(val, 'potGroupList.0.group.groupName', ''),
          categoryName: Util.getValue(val, 'potCategoryList.0.category.categoryName', ''),
          thumbnail: ""
        })) // omit images to avoid being filtering target
        if (payload && payload.done) {
          payload.done()
        }
        this.replaceAS({pots, potImages})
      }
      catch(e) {
        console.error(e)
      }
      this.replace({showProgress: false})
    },
    thumbnail(index) {
      return this.potImages[index]
    },
  }
}
</script>

<style scoped lang="scss">

</style>
