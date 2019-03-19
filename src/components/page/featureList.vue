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
          <input :id="getCheckId(row.item)" v-model="row.item.checked" :disabled="row.item.disabled" type="checkbox" class="custom-control-input">
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

import commonmixinVue from '../mixin/commonmixin.vue'
import * as Util from '../../sub/util/Util'

export default {
  mixins: [commonmixinVue], 
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
      return this.$i18n.tnl(`label.${Util.toLowerCaseTop(item.featureName.replace(/ /g, ''))}`)
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
