<template>
  <b-container>
    <b-table :items="list" :fields="fields" show-empty thead-class="hidden_header" small>
      <template slot="parentCheck" slot-scope="row">
        <div v-if="row.item.parentShow" class="custom-control custom-checkbox">
          <input :id="getCheckId(row.item)" v-model="row.item.checked" type="checkbox" class="custom-control-input" @change="parentChange(row.item)">
          <label :for="getCheckId(row.item)" class="custom-control-label mb-3" />
        </div>
      </template>
      <template slot="subCheck" slot-scope="row">
        <div v-if="row.item.subShow" class="custom-control custom-checkbox">
          <input :id="getCheckId(row.item)" v-model="row.item.checked" :disabled="row.item.disabled" type="checkbox" class="custom-control-input" @change="itemChange(row.item)">
          <label :for="getCheckId(row.item)" class="custom-control-label mb-3" />
        </div>
      </template>
      <template slot="featureName" slot-scope="row">
        <span>{{ getFeatureName(row.item) }}</span>
      </template>
    </b-table>
  </b-container>
</template>

<script>

import * as StringUtil from '../../sub/util/StringUtil'
import commonmixin from '../mixin/commonmixin.vue'

export default {
  mixins: [commonmixin],
  props: {
    list: {
      type: Array,
      required: true,
    }, 
    fields: {
      type: Array,
      required: true,
    }
  },
  data() {
    return {
    }
  },
  methods: {
    getCheckId(item){
      return `parentCheck-${item.parentId}-${item.subId}`
    },
    getFeatureName(item){
      return this.$i18n.tnl(`label.${StringUtil.toLowerCaseTop(item.featureName.replace(/ /g, ''))}`)
    },
    itemChange(item){
      if (item.featureName == 'masterRole') { // ロールにチェックを入れた際、自動的に機能にチェックを入れる。
        this.list.forEach(item => console.warn(item.featureName))
        const rolefeature = this.list.find(item => item.featureName == 'masterRoleFeature')
        if (rolefeature) {
          rolefeature.checked = item.checked
        }
      }
    },
    parentChange(item){
      this.list.forEach((val) => {
        if(val.parentId == item.parentId){
          val.checked = item.checked
          if(val.subId != 0){
            val.disabled = item.checked
          }
        }
      })
    },
  }
}

</script>

<style>
  .hidden_header {
    display: none;
  }
  td {
    word-break: break-all;
    border: 0px !important;
  }
  @media (min-width: 769px) {
    td {
      max-width: 200px;
    }
  }
</style>
