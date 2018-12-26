<template>
  <div>
    <breadcrumb :items="items" />
    <m-list :params="params" :list="pots" />
  </div>
</template>

<script>
import mList from '../../../components/page/list.vue'
import { mapState } from 'vuex'
import * as StateHelper from '../../../sub/helper/StateHelper'
import { addLabelByKey } from '../../../sub/helper/ViewHelper'
import { APP } from '../../../sub/constant/config.js'
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
        name: 'pot',
        id: 'potId',
        editPath: '/master/pot/edit',
        appServicePath: '/basic/pot',
        bulkEditPath: '/master/pot/bulkEdit',
        bulkUploadPath: '/master/pot/bulkUpload',
        csvOut: true,
        extraFilter: this.getExtraFilter(),
        custumCsvColumns: [
          'potId',
          'thumbnail',
          APP.TX_WITH_TXID? 'txId': APP.TX_BTX_MINOR == 'minor'? 'minor': 'btxId',
          'txName',
          APP.POT_WITH_POTCD? 'potCd': null,
          'potName',
          'potType',
          APP.POT_WITH_RUBY? 'extValue.ruby': null,
          'displayName',
          APP.POT_WITH_GROUP? 'groupName': null,
          APP.POT_WITH_CATEGORY? 'categoryName': null,
          APP.POT_WITH_POST? 'extValue.post': null,
          APP.POT_WITH_TEL? 'extValue.tel': null,
          'description'].filter((val) => val),
        fields: addLabelByKey(this.$i18n, [ 
          {key: 'potId', sortable: true, tdClass: 'thumb-rowdata'},
          {key: 'thumbnail', tdClass: 'thumb-rowdata' },
          {key: 'txIdName', label:'tx', sortable: true, tdClass: 'thumb-rowdata'},
          APP.POT_WITH_POTCD? {key: 'potCd', sortable: true , tdClass: 'thumb-rowdata'}: null,
          {key: 'potName', sortable: true , tdClass: 'thumb-rowdata'},
          APP.POT_WITH_RUBY? {key: 'ruby', label: 'ruby', sortable: true, tdClass: 'thumb-rowdata'}: null,
          {key: 'displayName', sortable: true, tdClass: 'thumb-rowdata'},
          APP.POT_WITH_GROUP? {key: 'groupName', label: 'group', sortable: true, tdClass: 'thumb-rowdata'}: null,
          APP.POT_WITH_CATEGORY? {key: 'categoryName', label: 'category', sortable: true, tdClass: 'thumb-rowdata'}: null,
          APP.POT_WITH_POST? {key: 'extValue.post', label: 'post', tdClass: 'thumb-rowdata'}: null,
          APP.POT_WITH_TEL? {key: 'extValue.tel', label: 'tel', tdClass: 'thumb-rowdata'}: null,
          {key: 'actions', thStyle: {width:'130px !important'} , tdClass: 'thumb-rowdata'},
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
      'forceFetchPot',
    ]),
  },
  methods: {
    afterCrud(){
      StateHelper.setForceFetch('tx', true)
    },
    getExtraFilter(){
      return [this.isEnabledMenu('group') && APP.POT_WITH_GROUP? 'group': null, this.isEnabledMenu('category') && APP.POT_WITH_CATEGORY? 'category': null].filter((val) => val)
    },
    async fetchData(payload) {
      try {
        this.showProgress()
        await StateHelper.load('pot', this.forceFetchPot)
        StateHelper.setForceFetch('pot', false)
        if (payload && payload.done) {
          payload.done()
        }
      }
      catch(e) {
        console.error(e)
      }
      this.hideProgress()
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
