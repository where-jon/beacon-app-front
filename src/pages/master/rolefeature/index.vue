<template slot="feature">
  <div class="container-fluid">
    <m-list ref="ref" :params="params" :alert-force-hide="true" compact-mode />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { BULK } from '../../../sub/constant/Constants'
import * as Util from '../../../sub/util/Util'
import * as MenuHelper from '../../../sub/helper/dataproc/MenuHelper'
import * as ViewHelper from '../../../sub/helper/ui/ViewHelper'
import commonmixin from '../../../components/mixin/commonmixin.vue'
import mList from '../../../components/page/list.vue'

export default {
  components: {
    mList, 
  },
  mixins: [commonmixin],
  props: {
    messageParams: {
      type: [Object],
      required: true,
    },
  },
  data() {
    return {
      params: {
        name: 'roleFeature',
        id: 'key',
        confirmName: 'featureName',
        authIndexPath: '/master/rolefeature',
        indexPath: '/master/role',
        editPath: '/master/rolefeature/edit',
        bulkEditPath: '/master/rolefeature/bulkedit',
        appServicePath: '/meta/roleFeature',
        csvOut: true,
        fields: ViewHelper.addLabelByKey(this.$i18n, [ 
          {key: 'featureName', sortable: true },
          {key: 'path', sortable: true },
          {key: 'mode', label: 'mode', sortable: true },
          {key: 'featureType', label: 'featureType', sortable: true },
          {key: 'version', sortable: true },
          {key: 'actions', thStyle: {width:'130x !important'} }
        ]),
        hideSearchBox: !Util.hasValue(this.$store.state.app_service.role.roleId),
        sortBy: 'featureName',
      },
    }
  },
  computed: {
    ...mapState('app_service', [
      'role', 'features',
    ]),
    hasTenantFeature(){
      return MenuHelper.useMaster('rolefeature')
    },
    isDetailReferenceable() {
      return this.hasTenantFeature && MenuHelper.isDetailReferenceable(this.params.authIndexPath)
    },
    isUpdatable() {
      return this.hasTenantFeature && MenuHelper.isUpdatable(this.params.authIndexPath)
    },
    isDeleteable() {
      return this.hasTenantFeature && MenuHelper.isDeleteable(this.params.authIndexPath)
    },
    isRegistable() {
      return this.hasTenantFeature && MenuHelper.isRegistable(this.params.authIndexPath)
    },
    isBulkRegistable() {
      return this.hasTenantFeature && MenuHelper.isBulkRegistable(this.params.authIndexPath)
    },
    isBulkReferenceable() {
      return this.hasTenantFeature && MenuHelper.isBulkReferenceable(this.params.authIndexPath)
    },
    isEditable() {
      return this.hasTenantFeature && MenuHelper.isEditable(this.params.authIndexPath)
    },
  },
  methods: {
    createListParams(word) {
      return {
        roleId: this.role.roleId,
      }
    },
    getEditKey(item) {
      return item.updateKey.split(BULK.SPLITTER).join('/')
    },
    async onSaved(){
      if(this.$refs.ref.message){
        this.messageParams.message = this.$refs.ref.message
      }
    },
  }
}
</script>

<style scoped lang="scss">

</style>
