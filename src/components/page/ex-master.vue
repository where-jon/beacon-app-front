<template>
  <div class="container-fluid">
    <breadcrumb :items="items" />
    <m-list :params="pParams" compact-mode />
  </div>
</template>

<script>
import * as StringUtil from '../../sub/util/StringUtil'
import * as ViewHelper from '../../sub/helper/ui/ViewHelper'
import breadcrumb from '../layout/breadcrumb.vue'
import commonmixin from '../mixin/commonmixin.vue'
import mList from './list.vue'

export default {
  components: {
    breadcrumb,
    mList,
  },
  mixins: [commonmixin],
  props: {
    pMasterName: {
      type: String,
      required: true,
    },
    pCategoryName: {
      type: String,
      required: true,
    },
    pTypeList: {
      type: Array,
      required: true,
    },
    pParams: {
      type: Object,
      required: true,
    },
  },
  computed: {
    items() {
      return ViewHelper.createBreadCrumbItems('master', StringUtil.concatCamel(this.pMasterName, this.pCategoryName))
    },
  },
  methods: {
    createListParams(word){
      return this.callParentMethodOrDef('createListParams', {}, word)
    },
    editResponse(data) {
      this.callParentMethod('editResponse', data)
    },
    onSaved(val){
      this.callParentMethod('onSaved', val)
    },
    thumbnail(row) {
      return this.callParentMethod('thumbnail', row)
    },
    style(row) {
      return this.callParentMethod('style', row)
    },
  }
}
</script>

<style scoped lang="scss">

</style>
