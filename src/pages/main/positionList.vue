<template>
  <div>
    <breadcrumb :items="items" />
    <m-list :params="params" :list="txComposites" />
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import breadcrumb from '../../components/breadcrumb.vue'
import mList from '../../components/list.vue'
import listmixinVue from '../../components/listmixin.vue'
import * as AppServiceHelper from '../../sub/helper/AppServiceHelper'
import { addLabelByKey } from '../../sub/helper/ViewHelper'
import * as Util from '../../sub/util/Util'

let that

export default {
  components: {
    mList,
    breadcrumb,
  },
  mixins: [listmixinVue],
  data() {
    return {
      params: {
        name: 'positionList',
        id: 'positionListId',
        //editPath: '/master/pot/edit',
        appServicePath: '/core/tx',
        //bulkEditPath: '/master/pot/bulkEdit',
        //csvOut: true,
        extraFilter: ['detectState', 'group', 'area'],
        // TODO オプション準備
        disableTableButtons: true,
        fields: addLabelByKey(this.$i18n, [ 
          {key: "txId", label: 'tx', sortable: true},
          {key: "potCd", sortable: true},
          {key: "potName", label: 'tx', sortable: true},
          {key: "detectState", label: 'state', sortable: true},
          {key: "groupName", label: 'group', sortable: true},
          {key: "areaName", label: 'area', sortable: true},
          {key: "timestamp", label: 'final-receive-timestamp', sortable: true},
          {key: "powerLevel", label: 'power-level'},
        ]),
        initTotalRows: this.$store.state.app_service.txComposites.length,
      },
      // name: 'pot',
      // extValueDefault: {},
      items: [
        {
          text: this.$i18n.t('label.main'),
          active: true
        },
        {
          text: this.$i18n.t('label.positionList'),
          active: true
        }
      ]
    }
  },
  computed: {
    ...mapState('app_service', [
      'txComposites',
    ]),
  },
  methods: {
    async fetchData(payload) {
      // try {
      //   this.replace({showProgress: true})
      //   let pots = await AppServiceHelper.fetchList("/basic/pot/withThumbnail", 'potId')
      //   let potImages = pots.map((val) => val.thumbnail)
      //   pots = pots.map((val) => ({
      //     ...val,
      //     txIdName: val.txId? Util.getValue(val, 'tx.txName', '') + '(' + val.txId + ')': null,
      //     groupName: Util.getValue(val, 'potGroupList.0.group.groupName', ''),
      //     groupId: Util.getValue(val, 'potGroupList.0.group.groupId', ''),
      //     categoryName: Util.getValue(val, 'potCategoryList.0.category.categoryName', ''),
      //     categoryId: Util.getValue(val, 'potCategoryList.0.category.categoryId', ''),
      //     extValue: val.extValue ? val.extValue : this.extValueDefault,
      //     thumbnail: ""
      //   })) // omit images to avoid being filtering target
      //   if (payload && payload.done) {
      //     payload.done()
      //   }
      //   this.replaceAS({pots, potImages})
      // }
      // catch(e) {
      //   console.error(e)
      // }
      // this.replace({showProgress: false})
      return [{}]
    },
    thumbnail(index) {
      return this.potImages[index]
    },
  }
}
</script>

<style scoped lang="scss">

</style>
