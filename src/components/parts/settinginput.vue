<template>
  <span>
    <b-form-select v-if="inputSelect" v-model="inputModel[inputKey]" :options="selectOptions" :form="formId" :required="inputSelect && req" @change="callChangeEvent($event)" />
    <input v-else-if="inputNumber" v-model="inputModel[inputKey]" :pattern="numberPattern" type="text" :maxlength="inputLength" class="form-control form-control-sm" :form="formId" :required="inputNumber && req">
    <input v-else-if="inputNumberList" v-model="inputModel[inputKey]" :pattern="numberListPattern" type="text" :maxlength="inputLength" class="form-control form-control-sm" :form="formId" :required="inputNumberList && req">
    <div v-else-if="inputPassword">
      <input type="id" name="name" style="display:none">
      <input type="password" name="password" style="display:none">
      <input v-model="inputModel[inputKey]" type="password" :maxlength="inputLength" class="form-control form-control-sm" :form="formId" :required="inputNumberList && req" autocomplete="off" readonly onfocus="this.removeAttribute('readonly');">
    </div>
    <date-picker v-else-if="inputDate" v-model="inputModel[inputKey]" :clearable="false" type="date" :value-format="pattern.date" class="inputform-sm" :required="inputDate && req" />
    <date-picker v-else-if="inputDatetime" v-model="inputModel[inputKey]" :clearable="false" type="datetime" :value-format="pattern.datetime" class="inputform-sm" :required="inputDatetime && req" />
    <time-picker v-else-if="inputTime" v-model="inputModel[inputKey]" :clearable="false" :picker-options="timeOptionInfo" :value-format="pattern.time" class="inputform-sm" :required="inputTime && req" />
    <input v-else v-model="inputModel[inputKey]" type="text" :maxlength="inputLength" class="form-control form-control-sm" :form="formId" :required="inputText && req" autocomplete="off">
  </span>
</template>

<script>
import { DatePicker, TimePicker } from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import { PATTERN, SETTING, BOOLEAN } from '../../sub/constant/Constants'
import * as ViewHelper from '../../sub/helper/ui/ViewHelper'

export default {
  components: {
    DatePicker,
    TimePicker,
  },
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
    inputDate() {
      return SETTING.DATE == this.inputTypeLowerCase
    },
    inputDatetime() {
      return SETTING.DATETIME == this.inputTypeLowerCase
    },
    inputTime() {
      return SETTING.TIME == this.inputTypeLowerCase
    },
    inputPassword() {
      return SETTING.PASSWORD == this.inputTypeLowerCase
    },
    pattern() {
      return {
        time: 'HH:mm:ss',
        date: 'yyyy-MM-dd',
        datetime: 'timestamp',
      }
    },
    timeOptionInfo() {
      return {
        selectableRange: '00:00:00 - 23:59:59'
      }
    },
  },
  mounted() {
    ViewHelper.importElementUI()
  },
  methods: {
    callChangeEvent(event) {
      this.changeEvent(event)
    },
  },
}

</script>

<style>
@import "../../sub/constant/input.scss";
</style>
