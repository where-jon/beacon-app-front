<script>
import * as Util from '../../sub/util/Util'

export default {
  methods: {
    isVueSelectCutOn(selected){
      return this.vueSelectCutOn(selected) != Util.getValue(selected, 'label', null)
    },
    vueSelectCutOn(selected){
      return selected? Util.cutOnLongWidth(selected.label, 100, true, {padding: '0.25em'}): null
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
