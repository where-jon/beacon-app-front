<template>
  <span>
    <b-form-select v-if="inputSelect" v-model="inputModel[inputKey]" :options="selectOptions" :form="formId" :required="inputSelect && req" @change="callChangeEvent($event)" />
    <input v-else-if="inputNumber" v-model="inputModel[inputKey]" :pattern="numberPattern" type="text" :maxlength="inputLength" class="form-control form-control-sm" :form="formId" :required="inputNumber && req">
    <input v-else-if="inputNumberList" v-model="inputModel[inputKey]" :pattern="numberListPattern" type="text" :maxlength="inputLength" class="form-control form-control-sm" :form="formId" :required="inputNumberList && req">
    <input v-else v-model="inputModel[inputKey]" type="text" :maxlength="inputLength" class="form-control form-control-sm" :form="formId" :required="inputText && req">
  </span>
</template>

<script>
import { PATTERN, SETTING, BOOLEAN } from '../../sub/constant/Constants'

export default {
  props: {
    inputModel: {
      type: Object,
      default: () => {},
    },
    inputKey: {
      type: String,
      default: 'dummy',
    },
    formId: {
      type: String,
      default: 'form',
    },
    options: {
      type: Array,
      default: null,
    },
    inputType: {
      type: String,
      default: 'text',
    },
    inputLength: {
      type: Number,
      default: 1000,
    },
    req: {
      type: Boolean,
      default: false,
    },
    changeEvent: {
      type: Function,
      default: () => {},
    },
  },
  data () {
    return {
      typeSelect: [ SETTING.BOOLEAN.toLowerCase(), SETTING.SELECT.toLowerCase() ],
      typeNumber: [ SETTING.NUMBER.toLowerCase(), 'int' ],
      typeNumberList: [ SETTING.NUMBER_LIST.toLowerCase(), 'numlist' ],
    }
  },
  computed: {
    numberPattern(){
      return PATTERN.NUMBER
    },
    numberListPattern(){
      return PATTERN.NUMBER_LIST
    },
    inputTypeLowerCase() {
      return this.inputType && this.inputType.toLowerCase? this.inputType.toLowerCase(): this.inputType
    },
    selectOptions() {
      return this.options? this.options: BOOLEAN.getOptions(true)
    },
    inputSelect() {
      return this.typeSelect.includes(this.inputTypeLowerCase)
    },
    inputNumber() {
      return this.typeNumber.includes(this.inputTypeLowerCase)
    },
    inputNumberList() {
      return this.typeNumberList.includes(this.inputTypeLowerCase)
    },
    inputText() {
      return !this.inputSelect && !this.inputNumber && !this.inputNumberList
    },
  },
  methods: {
    callChangeEvent(event) {
      this.changeEvent(event)
    },
  },
}

</script>

<style>
</style>
