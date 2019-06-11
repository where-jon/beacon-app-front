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
import { APP_SERVICE, EXCLOUD } from '../../../sub/constant/config'

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
      thumbnailUrl: APP_SERVICE.BASE_URL + EXCLOUD.POT_THUMBNAIL_URL,
    }
  },
  computed: {
    ...mapState('app_service', [
      'pots',
      'roles',
<<<<<<< HEAD
      'forceFetchPot',
      'updatedPotThumbnail',
=======
      'updatedThumbnail',
>>>>>>> develop/1.2
    ]),
  },
  methods: {
    createCustomColumn(){
      return APP.POT.WITH.map(val => {
        if(['user'].includes(val)){
          return null
        }
        const ret = {key: val, label: val, tdClass: 'thumb-rowdata'}
        if(['post', 'tel', 'ruby'].includes(val)){
          ret.key = 'extValue.' + val
        }
        else{
          ret.sortable = true
        }
        if(['category', 'group'].includes(val)){
          ret.key = val + 'Name'
        }
        return ret
      }).filter(val => val)
    },
    getCustomCsvColumns(){
      return [
        APP.TX.BTX_MINOR == 'minor'? 'minor': 'btxId',
        'potCd',
        'potName',
        'potType',
        'displayName',
      ].concat(this.createCustomColumn().map(val => val.key))
        .concat(['userId', 'loginId', 'roleName', 'pass', 'email',])
        .filter(val => val)
    },
    customCsvData(val){ // TODO:
      const id = Util.includesIgnoreCase(APP.TX.WITH, 'txId')? 'txId': APP.TX.BTX_MINOR == 'minor'? 'minor': 'btxId'
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
        {key: 'txIdName', label:'tx', sortable: true },
        {key: 'potCd', sortable: true , tdClass: 'thumb-rowdata'},
        {key: 'displayName', sortable: true, tdClass: 'thumb-rowdata'},
      ].concat(this.createCustomColumn())
        .concat([
          {key: 'actions', thStyle: {width:'130px !important'} , tdClass: 'thumb-rowdata'},
        ]))
    },
    afterCrud(){
      StateHelper.setForceFetch('tx', true)
      StateHelper.setForceFetch('user', true)
    },
    getExtraFilter(){
      return [this.isEnabledMenu('group') && Util.includesIgnoreCase(APP.POT.WITH, 'group')? 'group': null, this.isEnabledMenu('category') && Util.includesIgnoreCase(APP.POT.WITH, 'category')? 'category': null].filter((val) => val)
    },
    async fetchData(payload) {
      try {
        this.showProgress()
        await StateHelper.load('role')
        await StateHelper.load('pot')
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
      let addUrlParam = ''
      if (this.updatedPotThumbnail && this.updatedPotThumbnail === row.potId) {
        addUrlParam = new Date().getTime()
      }
      return row.existThumbnail ? this.thumbnailUrl.replace('{id}', row.potId) + addUrlParam : null
    },
  }
}
</script>

<style scoped lang="scss">

</style>
