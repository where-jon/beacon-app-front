<template>
  <div>
    <breadcrumb :items="items" />
    <m-list :params="params" :list="groups" />
  </div>
</template>

<script>
import mList from '../../../components/list.vue'
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import * as StateHelper from '../../../sub/helper/StateHelper'
import * as AppServiceHelper from '../../../sub/helper/AppServiceHelper'
import { addLabelByKey } from '../../../sub/helper/ViewHelper'
import listmixinVue from '../../../components/listmixin.vue'
import * as Util from '../../../sub/util/Util'
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
        name: 'group',
        id: 'groupId',
        editPath: '/master/group/edit',
        bulkEditPath: '/master/group/bulkedit',
        appServicePath: '/basic/group',
        csvOut: true,
        fields: addLabelByKey(this.$i18n, [ 
          {key: "groupId", sortable: true },
          {key: "groupName", sortable: true },
          {key: "ruby", sortable: true },
          {key: "style", label: "display" } ,
          {key: "description" },
          {key: "actions", thStyle: {width:'130px !important'} }
        ]),
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
    async fetchData(payload) {
      try {
        this.replace({showProgress: true})
        await StateHelper.load('group')
        this.groupStyles = this.getStyleDisplay(this.groups)
        if (payload && payload.done) {
          payload.done()
        }
      }
      catch(e) {
        console.error(e)
      }
      this.replace({showProgress: false})
    },
    style(index) {
      return this.groupStyles[index]
    },
  }
}
</script>

<style scoped lang="scss">

</style>
