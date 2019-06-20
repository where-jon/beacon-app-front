<script>
import * as Util from '../../sub/util/Util'
import * as StringUtil from '../../sub/util/StringUtil'
import { DISP } from '../../sub/constant/config.js'

export default {
  methods: {
    getVueSelectStyle(){
      return { width: DISP.CONTROL.COMBO_BOX.W + 'px !important' }
    },
    isVueSelectCutOn(selected){
      return this.vueSelectCutOn(selected) != Util.getValue(selected, 'label', null)
    },
    vueSelectCutOn(selected, required = false){
      const style = {padding: required? '1.4em': '2em'}
      return selected? StringUtil.cutOnLongWidth(selected.label, DISP.CONTROL.COMBO_BOX.W * 0.9, true, style): null
    },
    vueSelectTitle(selected){
      if(this.isVueSelectCutOn(selected)){
        return Util.getValue(selected, 'label', null)
      }
      return null
    },
    closeVueSelect(){
      const elements = document.getElementsByClassName('vs__search')
      if(elements){
        for(let idx = 0; idx < elements.length; idx++){
          elements[idx].blur()
        }
      }
    },
  }
}
</script>

<style scoped lang="scss">
</style>
