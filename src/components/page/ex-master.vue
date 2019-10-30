<template>
  <div class="container-fluid">
    <breadcrumb :items="items" />
    <m-list :params="pParams" :list="filteredList" />
  </div>
</template>

<script>
import { LOCAL_STORAGE } from '../../sub/constant/Constants'
import * as LocalStorageHelper from '../../sub/helper/base/LocalStorageHelper'
import * as ViewHelper from '../../sub/helper/ui/ViewHelper'
import breadcrumb from '../layout/breadcrumb.vue'
import reloadmixin from '../mixin/reloadmixin.vue'
import mList from './list.vue'

export default {
  props: {
    pName: {
      type: String,
      required: true,
    },
    pType: {
      type: Number,
      required: true,
    },
    pParams: {
      type: Object,
      required: true,
    },
    pList: {
      type: Array,
      required: true,
    },
  },
  components: {
    breadcrumb,
    mList,
  },
  mixins: [reloadmixin],
  computed: {
    items() {
      return ViewHelper.createBreadCrumbItems('master', this.pName)
    },
    filteredList() {
      return this.pList.filter(element => element[this.pName + 'Type'] == this.pType)
    },
  },
  created() {
    this.pParams.initTotalRows = this.filteredList.length
    LocalStorageHelper.setLocalStorage(LOCAL_STORAGE.KEY.MASTER_INDEX, JSON.stringify({path: this.pParams.indexPath, type: this.pType}))
  },
  methods: {
    customCsvData(val){
      if(this.$parent.$options.methods.customCsvData){
        this.$parent.$options.methods.customCsvData.call(this.$parent, val)
      }
    },
    onSaved(){
      if(this.$parent.$options.methods.onSaved){
        this.$parent.$options.methods.onSaved.call(this.$parent, val)
      }
    },
    async fetchData(payload) {
      if(this.$parent.$options.methods.fetchData){
        await this.$parent.$options.methods.fetchData.call(this.$parent, payload)
      }
    },
    thumbnail(row) {
      if(this.$parent.$options.methods.thumbnail){
        return this.$parent.$options.methods.thumbnail.call(this.$parent, row)
      }
    },
    style(row) {
      if(this.$parent.$options.methods.style){
        return this.$parent.$options.methods.style.call(this.$parent, row)
      }
    },
  }
}
</script>

<style scoped lang="scss">

</style>
