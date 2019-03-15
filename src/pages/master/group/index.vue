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
import { addLabelByKey } from '../../../sub/helper/ViewHelper'
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
        name: 'group',
        id: 'groupId',
        indexPath: '/master/group',
        editPath: '/master/group/edit',
        bulkEditPath: '/master/group/bulkedit',
        appServicePath: '/basic/group',
        csvOut: true,
        custumCsvColumns: ['groupId', 'groupName', 'ruby', 'color', 'bgColor', 'display.shape', 'description'],
        fields: addLabelByKey(this.$i18n, [ 
          {key: 'groupName', sortable: true },
          {key: 'ruby', sortable: true },
          {key: 'style', label: 'display' } ,
          {key: 'description' },
          {key: 'groupId', sortable: true },
          {key: 'actions', thStyle: {width:'130px !important'} }
        ]),
        sortBy: 'groupName',
        initTotalRows: this.$store.state.app_service.groups.length
      },
      groupStyles: [],
      items: [
        {
          text: this.$i18n.tnl('label.master'),
          active: true
        },
        {
          text: this.$i18n.tnl('label.group'),
          active: true
        }
      ]
    }
  },
  computed: {
    ...mapState('app_service', [
      'groups',
    ]),
  },
  methods: {
    afterCrud(){
      StateHelper.setForceFetch('pot', true)
    },
    async fetchData(payload) {
      try {
        this.showProgress()
        await StateHelper.load('group')
        this.groupStyles = this.getStyleDisplay(this.groups)
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
      val.color = Util.colorCd4display(val.display.color)
      val.bgColor = Util.colorCd4display(val.display.bgColor)
    },
  }
}
</script>

<style scoped lang="scss">

</style>
