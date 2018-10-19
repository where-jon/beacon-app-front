<template>
  <div>
    <breadcrumb :items="items" />
    <m-list :params="params" :list="pots" />
  </div>
</template>

<script>
import mList from '../../../components/list.vue'
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import * as StateHelper from '../../../sub/helper/StateHelper'
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
        extraFilter: ['group', 'category'],
        custumCsvColumns: ["potId", "thumbnail", "txId", "txName", "potCd", "potName", "extValue.ruby",
            "displayName", "groupName", "categoryName", "extValue.post", "extValue.tel", "description", "actions"],
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
          {key: "actions", thStyle: {width:'130px !important'} , tdClass: "thumb-rowdata"},
        ]),
        initTotalRows: this.$store.state.app_service.pots.length,
      },
      name: 'pot',
      extValueDefault: {},
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
    ]),
  },
  methods: {
    async fetchData(payload) {
      try {
        this.replace({showProgress: true})
        await StateHelper.load('pot')
        if (payload && payload.done) {
          payload.done()
        }
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
