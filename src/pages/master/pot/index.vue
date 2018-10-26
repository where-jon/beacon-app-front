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
import { APP } from '../../../sub/constant/config.js'
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
        bulkUploadPath: '/master/pot/bulkUpload',
        csvOut: true,
        extraFilter: ['group', 'category'],
        custumCsvColumns: ["potId", "thumbnail", "txId", "txName", "potCd", "potName", "extValue.ruby",
            "displayName", "groupName", "categoryName", "extValue.post", "extValue.tel", "description", "actions"],
        fields: addLabelByKey(this.$i18n, [ 
          {key: "potId", sortable: true, tdClass: "thumb-rowdata"},
          {key: "thumbnail", tdClass: "thumb-rowdata" },
          {key: "txIdName", label:'tx', sortable: true, 'class': 'text-center' , tdClass: "thumb-rowdata"},
          APP.POT_WITH_POTCD? {key: "potCd", sortable: true , tdClass: "thumb-rowdata"}: null,
          {key: "potName", sortable: true , tdClass: "thumb-rowdata"},
          APP.POT_WITH_RUBY? {key: "extValue.ruby", label: "ruby", sortable: true, tdClass: "thumb-rowdata"}: null,
          {key: "displayName", sortable: true, tdClass: "thumb-rowdata"},
          APP.POT_WITH_GROUP? {key: "groupName", label: "group", sortable: true, tdClass: "thumb-rowdata"}: null,
          APP.POT_WITH_CATEGORY? {key: "categoryName", label: "category", sortable: true, tdClass: "thumb-rowdata"}: null,
          APP.POT_WITH_POST? {key: "extValue.post", label: "post", tdClass: "thumb-rowdata"}: null,
          APP.POT_WITH_TEL? {key: "extValue.tel", label: "tel", tdClass: "thumb-rowdata"}: null,
          {key: "actions", thStyle: {width:'130px !important'} , tdClass: "thumb-rowdata"},
        ]),
        initTotalRows: this.$store.state.app_service.pots.length,
      },
      name: 'pot',
      extValueDefault: {},
      items: [
        {
          text: this.$i18n.tnl('label.master'),
          active: true
        },
        {
          text: this.$i18n.tnl('label.pot'),
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
    thumbnail(row) {
      const img = this.potImages.find((val) => val.id == row.potId)
      return img? img.thumbnail: null
    },
  }
}
</script>

<style scoped lang="scss">

</style>
