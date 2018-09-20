<template>
  <m-list :params="params" :list="groups" >
  </m-list>
</template>

<script>
import mList from '../../../components/list.vue'
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import * as AppServiceHelper from '../../../sub/helper/AppServiceHelper'
import { addLabelByKey } from '../../../sub/helper/ViewHelper'
import listmixinVue from '../../../components/listmixin.vue';
import * as Util from '../../../sub/util/Util'

export default {
  components: {
    mList, 
  },
  mixins: [listmixinVue],
  data() {
    return {
      params: {
        name: 'group',
        id: 'groupId',
        editPath: '/master/group/edit',
        appServicePath: '/basic/group',
        fields: addLabelByKey(this.$i18n, [ 
          {key: "groupId", sortable: true },
          {key: "groupName", sortable: true },
          {key: "ruby", sortable: true },
          {key: "style", label: "displayColor" } ,
          {key: "description" },
          {key: "actions", thStyle: {width:'130px !important'} }
        ]),
        initTotalRows: this.$store.state.app_service.groups.length
      }
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
        let groups = await AppServiceHelper.fetchList("/basic/group/", 'groupId')
        groups = groups.map((val) => ({
          ...val,
          color: "",
          bgColor: "",
          style: {
            "color": Util.colorCd4display(val.color),
            "background-color": Util.colorCd4display(val.bgColor),
            "text-align": "center",
          },
        }))
        if (payload && payload.done) {
          payload.done()
        }
        this.replaceAS({groups})
      }
      catch(e) {
        console.error(e)
      }
      this.replace({showProgress: false})
    },
  }
}
</script>

<style scoped lang="scss">

</style>
