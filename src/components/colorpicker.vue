<template>
  <div>
    <label v-t="caption" />
    <div ref="colorpickerButton" style="width: 1px">
      <label :style="detailButtonStyle()" @click="switchEditMode()" class="align-middle text-center">{{ colorValue }}</label>
    </div>
    <div ref="colorpicker" style="width: 1px">
      <span v-if="editMode" >
        <chrome-picker v-model="$parent.form[name]" :disableAlpha="true" :style="{'width': '256px'}" class="mt-1" @input="changeColor" />
      </span>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import _ from 'lodash'
import { Chrome } from 'vue-color'
import * as Util from '../sub/util/Util'
import { getButtonTheme } from '../sub/helper/ThemeHelper'

export default {
  props: ["caption", "name"],
  components: {
    'chrome-picker': Chrome,
  },
  data() {
    return {
      ...this.model,
      editMode: false,
      colorValue: null,
      colorText: null,
      touchColorPicker: false,
    }
  },
  created(){
    this.changeColor(this.$parent.form[this.name])
  },
  computed: {
    theme(){
      const theme = getButtonTheme(this.$store.state.loginId)
      return 'outline-' + theme
    },
  },
  methods: {
    detailButtonStyle(colorArea = false){
      const style = {
        'cursor': this.$parent.isEditable? 'pointer': 'default',
        'width': '72px',
        'height': '32px',
        'background-color': this.colorValue,
        'color': this.colorText,
        'border': '1px solid #000000'
      }
      return style
    },
    changeColor(color){
      this.colorValue = Util.colorCd4display(color)
      this.colorText = Util.luminance(Util.colorCd4db(color)) <= 128? "#FFFFFF": "#000000"
    },
    switchEditMode(){
      if(this.$parent.isEditable){
        this.editMode = !this.editMode
      }
      if(this.editMode){
        document.addEventListener('mousedown', this.touchStart);
        document.addEventListener('mouseup', this.touchEnd);
        document.addEventListener('touchstart', this.touchStart);
        document.addEventListener('touchmove', this.touchMove);
        document.addEventListener('touchend', this.touchEnd);
      }
      else{
        document.removeEventListener('mousedown', this.touchStart);
        document.removeEventListener('mouseup', this.touchEnd);
        document.removeEventListener('touchstart', this.touchStart);
        document.removeEventListener('touchmove', this.touchMove);
        document.removeEventListener('touchend', this.touchEnd);
      }
    },
    outColorPicker(e){
      const target = e.target
      return this.$refs.colorpicker !== target && !this.$refs.colorpicker.contains(target) &&
          this.$refs.colorpickerButton !== target && !this.$refs.colorpickerButton.contains(target)
    },
    touchStart(e) {
      if(!this.outColorPicker(e)) {
        this.touchColorPicker = true
      }
    },
    touchMove(e) {
      this.touchColorPicker = true
    },
    touchEnd(e) {
      if(e.touches.length == 0){
        if(!this.touchColorPicker) {
          this.documentClick(e)
        }
        this.touchColorPicker = false
      }
    },
    documentClick(e) {
      if(this.outColorPicker(e)) {
        this.switchEditMode()
      }
    }
  },
}
</script>

<style scoped lang="scss">

</style>