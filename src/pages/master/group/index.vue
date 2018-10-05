<template>
  <div>
    <breadcrumb :items="items" />
    <m-list :params="params" :list="groups" />
  </div>
</template>

<script>
import mList from '../../../components/list.vue'
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import * as AppServiceHelper from '../../../sub/helper/AppServiceHelper'
import { addLabelByKey } from '../../../sub/helper/ViewHelper'
import listmixinVue from '../../../components/listmixin.vue'
import breadcrumb from '../../../components/breadcrumb.vue'
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
        editPath: '/master/group/edit',
        bulkEditPath: '/master/group/bulkedit',
        appServicePath: '/basic/group',
        csvOut: true,
        fields: addLabelByKey(this.$i18n, [ 
          {key: "groupId", sortable: true },
          {key: "groupName", sortable: true },
          {key: "ruby", sortable: true },
          {key: "style", label: "displayColor" } ,
          {key: "description" },
          {key: "actions", thStyle: {width:'130px !important'} }
        ]),
        initTotalRows: this.$store.state.app_service.groups.length
      },
      items: [
        {
          text: this.$i18n.t('label.master'),
          active: true
        },
        {
          text: this.$i18n.t('label.group'),
          active: true
        }
      ]
    }
  },
  computed: {
    ...mapState('app_service', [
      'groups', 'groupStyles',
    ]),
  },
  methods: {
    async fetchData(payload) {
      try {
        this.replace({showProgress: true})
        let groups = await AppServiceHelper.fetchList("/basic/group/", 'groupId')
        let groupStyles = groups.map((val) => ({
          "color": Util.colorCd4display(val.color),
          "background-color": Util.colorCd4display(val.bgColor),
          "text-align": "center",
        }))
        groups = groups.map((val) => ({
          ...val,
          color: "",
          bgColor: "",
        }))
        if (payload && payload.done) {
          payload.done()
        }
        this.replaceAS({groups, groupStyles})
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
