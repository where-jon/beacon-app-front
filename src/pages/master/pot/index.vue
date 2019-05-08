<template>
  <div class="container-fluid">
    <breadcrumb :items="items" />
    <m-list :params="params" :list="pots" />
  </div>
</template>

<script>
import mList from '../../../components/page/list.vue'
import { mapState } from 'vuex'
import * as StateHelper from '../../../sub/helper/StateHelper'
import * as ViewHelper from '../../../sub/helper/ViewHelper'
import { APP } from '../../../sub/constant/config.js'
import listmixinVue from '../../../components/mixin/listmixin.vue'
import breadcrumb from '../../../components/layout/breadcrumb.vue'
import * as Util from '../../../sub/util/Util'

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
        indexPath: '/master/pot',
        editPath: '/master/pot/edit',
        appServicePath: '/basic/pot',
        bulkEditPath: '/master/pot/bulkEdit',
        bulkUploadPath: '/master/pot/bulkUpload',
        csvOut: true,
        extraFilter: this.getExtraFilter(),
        custumCsvColumns: this.getCustomCsvColumns(),
        fields: this.getFields(),
        sortBy: 'potName',
        initTotalRows: this.$store.state.app_service.pots.length,
      },
      name: 'pot',
      extValueDefault: {},
      items: ViewHelper.createBreadCrumbItems('master', 'pot'),
    }
  },
  computed: {
    ...mapState('app_service', [
      'pots',
      'potImages',
      'roles',
      'forceFetchPot',
    ]),
  },
  methods: {
    getCustomCsvColumns(){
      return [
        APP.TX_BTX_MINOR == 'minor'? 'minor': 'btxId',
        'potCd',
        'potName',
        'potType',
        APP.POT_WITH_RUBY? 'extValue.ruby': null,
        'displayName',
        APP.POT_WITH_GROUP? 'groupName': null,
        APP.POT_WITH_CATEGORY? 'categoryName': null,
        APP.POT_WITH_POST? 'extValue.post': null,
        APP.POT_WITH_TEL? 'extValue.tel': null,
        APP.POT_WITH_DESCRIPTION? 'description': null,
        'loginId',
        'roleName',
        'pass',
        'email',
      ].filter(val => val)
    },
    customCsvData(val){ // TODO:
      const id = APP.TX_BTX_MINOR == 'minor'? 'minor': 'btxId'
      if(Util.hasValue(val.potTxList)){
        val[id] = val.potTxList.map(potTx => potTx.tx? potTx.tx[id]: '').join(';')
      }
      if(Util.hasValue(val.potUserList)){
        val.loginId = val.potUserList[0].user.loginId
        val.email = val.potUserList[0].user.email
        const targetRole = this.roles.find(role => role.roleId == val.potUserList[0].user.roleId)
        val.roleName = targetRole? targetRole.roleName: ''
      }
    },
    getFields(){
      return ViewHelper.addLabelByKey(this.$i18n, [ 
        {key: 'potName', sortable: true , tdClass: 'thumb-rowdata'},
        {key: 'thumbnail', tdClass: 'thumb-rowdata' },
        {key: 'txIdName', label:'tx', sortable: true, },
        {key: 'potCd', sortable: true , tdClass: 'thumb-rowdata'},
        APP.POT_WITH_RUBY? {key: 'ruby', label: 'ruby', sortable: true, tdClass: 'thumb-rowdata'}: null,
        {key: 'displayName', sortable: true, tdClass: 'thumb-rowdata'},
        APP.POT_WITH_GROUP? {key: 'groupName', label: 'group', sortable: true, tdClass: 'thumb-rowdata'}: null,
        APP.POT_WITH_CATEGORY? {key: 'categoryName', label: 'category', sortable: true, tdClass: 'thumb-rowdata'}: null,
        APP.POT_WITH_POST? {key: 'extValue.post', label: 'post', tdClass: 'thumb-rowdata'}: null,
        APP.POT_WITH_TEL? {key: 'extValue.tel', label: 'tel', tdClass: 'thumb-rowdata'}: null,
        {key: 'actions', thStyle: {width:'130px !important'} , tdClass: 'thumb-rowdata'},
      ])
    },
    afterCrud(){
      StateHelper.setForceFetch('tx', true)
    },
    getExtraFilter(){
      return [this.isEnabledMenu('group') && APP.POT_WITH_GROUP? 'group': null, this.isEnabledMenu('category') && APP.POT_WITH_CATEGORY? 'category': null].filter((val) => val)
    },
    async fetchData(payload) {
      try {
        this.showProgress()
        await StateHelper.load('role')
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
