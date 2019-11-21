<template>
  <div class="container-fluid">
    <ex-master p-master-name="pot" :p-category-name="pName" :p-type-list="pTypeList" :p-params="params" :p-list="pots" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { APP, EXCLOUD, APP_SERVICE } from '../../../sub/constant/config'
import { CATEGORY } from '../../../sub/constant/Constants'
import * as ArrayUtil from '../../../sub/util/ArrayUtil'
import * as Util from '../../../sub/util/Util'
import * as MenuHelper from '../../../sub/helper/dataproc/MenuHelper'
import * as StateHelper from '../../../sub/helper/dataproc/StateHelper'
import * as ViewHelper from '../../../sub/helper/ui/ViewHelper'
import * as PotHelper from '../../../sub/helper/domain/PotHelper'
import reloadmixin from '../../../components/mixin/reloadmixin.vue'
import exMaster from '../../../components/page/ex-master.vue'

export default {
  props: {
    pName: {
      type: String,
      default: '',
    },
    pPath: {
      type: String,
      default: '/master/pot',
    },
    pAppServicePath: {
      type: String,
      default: '/basic/pot',
    },
    pTypeList: {
      type: Array,
      default: () => [CATEGORY.PERSON, CATEGORY.THING],
    },
  },
  components: {
    exMaster,
  },
  mixins: [reloadmixin],
  data() {
    return {
      params: {
        name: 'pot',
        id: 'potId',
        indexPath: this.pPath,
        editPath: this.pPath + '/edit',
        appServicePath: this.pAppServicePath,
        bulkEditPath: this.pPath + '/bulkEdit',
        bulkUploadPath: this.pPath + '/bulkUpload',
        csvOut: true,
        custumCsvColumns: this.getCustomCsvColumns(),
        fields: this.getFields(),
        extraFilter: this.getExtraFilter(),
        extraFilterFunc: this.getExtraFilterFunc(),
        sortBy: 'ID',
        initTotalRows: this.$store.state.app_service.pots.length,
      },
      name: 'pot',
      extValueDefault: {},
      thumbnailUrl: APP_SERVICE.BASE_URL + EXCLOUD.POT_THUMBNAIL_URL,
      thumbnailUrlMap: {}
    }
  },
  computed: {
    ...mapState('app_service', [
      'pots',
      'roles',
      'categories',
      'forceFetchPot',
      'updatedPotThumbnailList',
      'thumbnailUrls',
    ]),
  },
  async created() {
      await Promise.all(['pot', 'category'].map(state => StateHelper.load(state)))

      const urls = this.pots.map( pot => {
        let url = ""
        if (this.updatedPotThumbnailList && this.updatedPotThumbnailList.some(t => t === pot.potId)) {
          const addUrlParam = new Date().getTime()
          url = pot.existThumbnail ? this.thumbnailUrl.replace('{id}', pot.potId) + addUrlParam : null
        }else{
          url =  this.thumbnailUrls[pot.potId]
          if(!url){
            url = pot.existThumbnail ? this.thumbnailUrl.replace('{id}', pot.potId) : null
          }
        }
        return { potId : pot.potId, url }
      })
      this.replaceAS({updatedPotThumbnailList: []})
      this.thumbnailUrlMap = {}
      urls.forEach(url => this.thumbnailUrlMap[url.potId] = url.url)
      this.replaceAS({thumbnailUrls: this.thumbnailUrlMap})

},
  methods: {
    getCustomCsvColumns(){
      return [
        'ID',
        APP.TX.BTX_MINOR == 'minor'? 'minor': 'btxId',
        'potName',
        'potType',
        'displayName',
      ].concat(PotHelper.createCustomColumn(this.pName, true).map(val => val.key))
        .concat(['userId', 'loginId', 'roleName', 'pass', 'email',])
        .filter(val => val)
    },
    customCsvData(val){
      val.ID = val.potCd
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
      ].concat(PotHelper.createCustomColumn(this.pName))
        .concat([
          {key: 'actions', thStyle: {'min-width':'130px !important'} , tdClass: 'thumb-rowdata'},
        ]))
    },
    onSaved(){
      StateHelper.setForceFetch('tx', true)
      StateHelper.setForceFetch('user', true)
    },
    getExtraFilter(){
      return [MenuHelper.isEnabledMenu('group') && ArrayUtil.includesIgnoreCase(APP.POT.WITH, 'group')? 'group': null, MenuHelper.isEnabledMenu('category') && ArrayUtil.includesIgnoreCase(APP.POT.WITH, 'category')? 'category': null].filter(val => val)
    },
    getExtraFilterFunc(){
      return {
        category: options => options.filter(option => this.categories.find(category => category.categoryId == option.value && this.pTypeList.includes(category.categoryType)))
      }
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
      return this.thumbnailUrlMap[row.potId]
    },
  }
}
</script>

<style scoped lang="scss">

</style>
