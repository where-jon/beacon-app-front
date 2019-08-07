<template>
  <div class="container-fluid">
    <breadcrumb :items="items" />
    <m-list :params="params" :list="pots" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { APP, EXCLOUD, APP_SERVICE } from '../../../sub/constant/config'
import * as ArrayUtil from '../../../sub/util/ArrayUtil'
import * as Util from '../../../sub/util/Util'
import * as MenuHelper from '../../../sub/helper/dataproc/MenuHelper'
import * as StateHelper from '../../../sub/helper/dataproc/StateHelper'
import * as ViewHelper from '../../../sub/helper/ui/ViewHelper'
import * as PotHelper from '../../../sub/helper/domain/PotHelper'
import breadcrumb from '../../../components/layout/breadcrumb.vue'
import reloadmixin from '../../../components/mixin/reloadmixin.vue'
import mList from '../../../components/page/list.vue'

export default {
  components: {
    breadcrumb,
    mList,
  },
  mixins: [reloadmixin],
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
        custumCsvColumns: this.getCustomCsvColumns(),
        fields: this.getFields(),
        extraFilter: this.getExtraFilter(),
        sortBy: 'potCd',
        initTotalRows: this.$store.state.app_service.pots.length,
      },
      name: 'pot',
      items: ViewHelper.createBreadCrumbItems('master', 'pot'),
      extValueDefault: {},
      thumbnailUrl: APP_SERVICE.BASE_URL + EXCLOUD.POT_THUMBNAIL_URL,
    }
  },
  computed: {
    ...mapState('app_service', [
      'pots',
      'roles',
      'forceFetchPot',
      'updatedPotThumbnail',
    ]),
  },
  methods: {
    getCustomCsvColumns(){
      return [
        'potCd',
        APP.TX.BTX_MINOR == 'minor'? 'minor': 'btxId',
        'potName',
        'potType',
        'displayName',
      ].concat(PotHelper.createCustomColumn(true).map(val => val.key))
        .concat(['userId', 'loginId', 'roleName', 'pass', 'email',])
        .filter(val => val)
    },
    customCsvData(val){
      const id = ArrayUtil.includesIgnoreCase(APP.TX.WITH, 'txId')? 'txId': APP.TX.BTX_MINOR == 'minor'? 'minor': 'btxId'
      if(Util.hasValue(val.txList)){
        val[id] = val.txList.map(tx => tx[id]).join(';')
      }
      if(Util.hasValue(val.potUserList)){
        val.loginId = val.potUserList[0].user.loginId
        val.email = val.potUserList[0].user.email
        const targetRole = this.roles.find(role => role.roleId == val.potUserList[0].user.roleId)
        val.roleName = targetRole? targetRole.roleName: ''
      }
      Object.keys(val).filter(key => /^extValue.+$/.test(key)).forEach(key => {
        val[key.replace(/^extValue/, '')] = val[key]
      })
    },
    getFields(){
      return ViewHelper.addLabelByKey(this.$i18n, [ 
        {key: 'potCd', sortable: true , tdClass: 'thumb-rowdata'},
        {key: 'potName', sortable: true , tdClass: 'thumb-rowdata'},
        {key: 'thumbnail', tdClass: 'thumb-rowdata' },
        {key: 'txIdName', label:'tx', sortable: true, tdClass: 'thumb-rowdata' },
        {key: 'displayName', sortable: true, tdClass: 'thumb-rowdata'},
      ].concat(PotHelper.createCustomColumn())
        .concat([
          {key: 'actions', thStyle: {'min-width':'130px !important'} , tdClass: 'thumb-rowdata'},
        ]))
    },
    onSaved(){
      StateHelper.setForceFetch('tx', true)
      StateHelper.setForceFetch('user', true)
    },
    getExtraFilter(){
      return [MenuHelper.isEnabledMenu('group') && ArrayUtil.includesIgnoreCase(APP.POT.WITH, 'group')? 'group': null, MenuHelper.isEnabledMenu('category') && ArrayUtil.includesIgnoreCase(APP.POT.WITH, 'category')? 'category': null].filter((val) => val)
    },
    async fetchData(payload) {
      try {
        this.showProgress()
        await Promise.all(['role', 'pot'].map(StateHelper.load))
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
