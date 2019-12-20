<template>
  <div class="container-fluid">
    <breadcrumb :items="items" />
    <m-list :params="params" :list="groups" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { APP } from '../../../sub/constant/config'
import { SHAPE } from '../../../sub/constant/Constants'
import * as ColorUtil from '../../../sub/util/ColorUtil'
import * as Util from '../../../sub/util/Util'
import * as ExtValueHelper from '../../../sub/helper/domain/ExtValueHelper'
import * as StateHelper from '../../../sub/helper/dataproc/StateHelper'
import * as StyleHelper from '../../../sub/helper/ui/StyleHelper'
import * as ViewHelper from '../../../sub/helper/ui/ViewHelper'
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
        name: 'group',
        id: 'groupId',
        indexPath: '/master/group',
        editPath: '/master/group/edit',
        bulkEditPath: '/master/group/bulkedit',
        appServicePath: '/basic/group',
        csvOut: true,
        custumCsvColumns: this.getCustumCsvColumns(),
        fields: this.getFields(),
        sortBy: 'groupCd',
        initTotalRows: this.$store.state.app_service.groups.length
      },
      items: ViewHelper.createBreadCrumbItems('master', 'group'),
      groupStyles: [],
    }
  },
  computed: {
    ...mapState('app_service', [
      'groups',
    ]),
  },
  methods: {
    getFields(){
      return ViewHelper.addLabelByKey(this.$i18n, [ 
        {key: 'groupCd', label: 'id', sortable: true },
        {key: 'groupName', sortable: true }
      ].concat(this.createCustomColumn())
        .concat([
          {key: 'style', label: 'display' } ,
          {key: 'description' },
          {key: 'actions', thStyle: {width:'130px !important'} }
        ])
        .filter(val => val))
    },
    createCustomColumn(isDownload){
      const ret = []
      APP.GROUP.WITH.forEach(val => {
        if(!isDownload && !ExtValueHelper.isShowList(APP.GROUP, val)) {
          return
        }
        ret.push({key: val, label: val, sortable: true})
      })
      return ret
    },
    getCustumCsvColumns(){
      return ['ID', 'groupName']
        .concat(this.createCustomColumn(true).map(val => val.key))
        .concat(['color', 'bgColor', 'shape', 'description'])
        .filter(val => val)
    },
    onSaved(){
      StateHelper.setForceFetch('pot', true)
      StateHelper.setForceFetch('tx', true)
    },
    async fetchData(payload) {
      try {
        this.showProgress()
        await StateHelper.load('group')
        this.groupStyles = StyleHelper.getStyleDisplay(this.groups)
        if (payload && payload.done) {
          payload.done()
        }
      }
      catch(e) {
        console.error(e)
      }
      this.hideProgress()
    },
    style(row) {
      const groupStyle = this.groupStyles.find((val) => val.entity.groupId == row.groupId)
      return groupStyle? groupStyle.style: null
    },
    customCsvData(val){
      val.ID = val.groupCd
      val.color = ColorUtil.colorCd4display(Util.getValue(val, 'display.color', '000000'))
      val.bgColor = ColorUtil.colorCd4display(Util.getValue(val, 'display.bgColor', 'FFFFFF'))
      val.shape = Util.getValue(val, 'display.shape', SHAPE.SQUARE)
    },
  }
}
</script>

<style scoped lang="scss">

</style>
