<template>
  <div class="container-fluid">
    <breadcrumb :items="items" />
    <m-list :params="params" :list="groups" />
  </div>
</template>

<script>
import mList from '../../../components/page/list.vue'
import { mapState } from 'vuex'
import * as StateHelper from '../../../sub/helper/StateHelper'
import * as ViewHelper from '../../../sub/helper/ViewHelper'
import * as StyleHelper from '../../../sub/helper/StyleHelper'
import reloadmixin from '../../../components/mixin/reloadmixin.vue'
import breadcrumb from '../../../components/layout/breadcrumb.vue'
import * as ColorUtil from '../../../sub/util/ColorUtil'

export default {
  components: {
    mList, 
    breadcrumb,
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
        custumCsvColumns: ['groupName', 'ruby', 'color', 'bgColor', 'display.shape', 'description'],
        fields: ViewHelper.addLabelByKey(this.$i18n, [ 
          {key: 'groupName', sortable: true },
          {key: 'ruby', sortable: true },
          {key: 'style', label: 'display' } ,
          {key: 'description' },
          {key: 'actions', thStyle: {width:'130px !important'} }
        ]),
        sortBy: 'groupName',
        initTotalRows: this.$store.state.app_service.groups.length
      },
      groupStyles: [],
      items: ViewHelper.createBreadCrumbItems('master', 'group'),
    }
  },
  computed: {
    ...mapState('app_service', [
      'groups',
    ]),
  },
  methods: {
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
      val.color = ColorUtil.colorCd4display(val.display.color)
      val.bgColor = ColorUtil.colorCd4display(val.display.bgColor)
    },
  }
}
</script>

<style scoped lang="scss">

</style>
