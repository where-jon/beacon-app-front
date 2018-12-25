<template>
  <b-container>
    <b-table show-empty stacked="md" striped bordered outlined hover :items="list" :fields="fields">
      <template slot="parentCheck" slot-scope="row">
        <div v-if="row.item.parentShow" class="custom-control custom-checkbox">
          <input :id="getCheckId(row.item)" v-model="row.item.checked" type="checkbox" class="custom-control-input" @change="parentChange(row.item)">
          <label class="custom-control-label mb-3" :for="getCheckId(row.item)" />
        </div>
      </template>
      <template slot="subCheck" slot-scope="row">
        <div class="custom-control custom-checkbox" v-if="row.item.subShow" >
          <input type="checkbox" class="custom-control-input" :id="getCheckId(row.item)" v-model="row.item.checked" :disabled="row.item.disabled">
          <label class="custom-control-label mb-3" :for="getCheckId(row.item)" />
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

export default {
  mixin: [commonmixinVue], 
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
      return this.$i18n.tnl(`label.${item.featureName.replace(/ /g, '')}`)
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
  td {
    word-break: break-all;
  }
  @media (min-width: 769px) {
    td {
      max-width: 200px;
    }
  }
</style>
