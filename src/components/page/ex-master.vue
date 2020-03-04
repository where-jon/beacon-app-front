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
    createListParams(){
      if(this.$parent.$options.methods && this.$parent.$options.methods.createListParams){
        return this.$parent.$options.methods.createListParams.call(this.$parent)
      }
      return {}
    },
    editResponse(data) {
      if(this.$parent.$options.methods && this.$parent.$options.methods.editResponse){
        this.$parent.$options.methods.editResponse.call(this.$parent, data)
      }
    },
    onSaved(val){
      if(this.$parent.$options.methods && this.$parent.$options.methods.onSaved){
        this.$parent.$options.methods.onSaved.call(this.$parent, val)
      }
    },
    thumbnail(row) {
      if(this.$parent.$options.methods && this.$parent.$options.methods.thumbnail){
        return this.$parent.$options.methods.thumbnail.call(this.$parent, row)
      }
    },
    style(row) {
      if(this.$parent.$options.methods && this.$parent.$options.methods.style){
        return this.$parent.$options.methods.style.call(this.$parent, row)
      }
    },
  }
}
</script>

<style scoped lang="scss">

</style>
