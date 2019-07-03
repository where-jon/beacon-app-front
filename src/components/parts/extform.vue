<template>
  <div>
    <b-form-group v-for="(ext, index) in extList" :key="'ext' + index">
      <label v-t="'label.' + ext.key" />
      <b-form-select v-if="ext.type=='list'" v-model="form[ext.key]" :options="ext.options" :disabled="!isEditable" :readonly="!isEditable" :required="ext.required" class="mb-3 vue-options-lg" />
      <b-form-checkbox v-else-if="ext.type=='boolean'" v-model="form[ext.key]" :value="ext.checked" :unchecked-value="ext.unchecked" class="ml-3 pt-2" />
      <b-form-input v-else v-model="form[ext.key]" :readonly="!isEditable" :type="ext.itype" :maxlength="ext.length" :min="ext.min" :max="ext.max" :pattern="ext.format" :required="ext.required" />
    </b-form-group>
  </div>
</template>

<script>
import Vue from 'vue'
import * as PotHelper from '../../sub/helper/domain/PotHelper'

export default {
  props: {
    form: {
      type: Object,
      required: true,
    },
    isEditable: {
      type: Boolean,
      required: true,
    },
  },
  data () {
    return {
      firstShow: true,
    }
  },
  computed: {
    extList() {
      const ret = PotHelper.getPotExt()
      ret.forEach(e => {
        if (!e.format) {
          if (e.type == 'int') {
            e.format = '[-]?[0-9]*'
          }
          else if (e.type == 'float') {
            e.format = '[-]?([0-9]+(\\.[0-9]*)?|\\.[0-9]+)'
          }
          else if (e.type == 'tel') {
            e.format = '[-\\d]*'
          }
        }
        if (e.type == 'list') {
          e.options = e.format.split('|').map(e => ({label: e, text: e, value: e}))
        }
        if (e.default && !this.form[e.key] && !this.isUpdate && this.firstShow) {
          Vue.set(this.form, e.key, e.default)
        }

        switch (e.type) {
        case 'string':
          e.itype = 'text'
          break
        case 'int':
        case 'float':
          e.itype = 'number'
          break
        default:
          e.itype = e.type
        }

        if (!e.length) {
          e.length = 20
        }
      })
      Vue.set(this, 'firstShow', false)
      return ret
    }, 
  }
}
</script>

<style scoped lang="scss">
</style>
