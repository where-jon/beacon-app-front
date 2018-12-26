
<script>
import * as Util from '../../sub/util/Util'

export default {
  methods: {
    getCategoryIds(list) {
      return Object.keys(list)
    },
    getName(id, showKeyName = false) {
      if (!Util.hasValue(id)) {
        return null
      }
      let name = this.$i18n.tnl(`label["${id}"]`)
      if (name.startsWith('label[')) {
        return id
      }
      if(showKeyName){
        return `${id}(${name})`
      }
      return name
    },
    useInputPullDown(type) {
      return /^boolean$/.test(type? type.toLowerCase(): type)
    },
    useInputNumberType(type) {
      return /^(number|int|float|double)$/.test(type? type.toLowerCase(): type)
    },
    useInputNumberListType(type) {
      return /^(number|int|float|double)(list|array)$/.test(type? type.toLowerCase(): type)
    },
    getBooleanOptions() {
      return [{text: 'true', value: 'true'}, {text: 'false', value: 'false'}]
    },
    getInputType(type) {
      if(this.useInputNumberType(type)){
        return 'number'
      }
      return 'text'
    },
    getTypeOptions() {
      return [
        {text: this.$i18n.tnl('label.string'), value: 'string'},
        {text: this.$i18n.tnl('label.stringList'), value: 'stringList'},
        {text: this.$i18n.tnl('label.number'), value: 'number'},
        {text: this.$i18n.tnl('label.numberList'), value: 'numberList'},
        {text: this.$i18n.tnl('label.boolean'), value: 'boolean'},
      ]
    },
    formatNumberList(str, type){
      return str.split(',').filter((val) => val.trim().length != 0).map((val) => {
        val.trim()
        if(/^number.*$/.test(type)){
          val = Number(val)
        }
        return val
      }).join(',')
    },
    format(str, type){
      const typeLow = type.toLowerCase()
      if(this.useInputNumberType(typeLow)){
        return Number(str)
      }
      if(/^.*(list|array)$/.test(typeLow)){
        return this.formatNumberList(str, typeLow)
      }
      return str
    },
  }
}
</script>
