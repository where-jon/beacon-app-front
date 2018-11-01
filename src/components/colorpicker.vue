<template>
  <div>
    <b-form-group>
      <label v-t="caption" />
      <div :style="detailButtonStyle()" @click="switchEditMode()" >
        <label :style="detailButtonStyle()">{{ colorValue }}</label>
        <label :style="detailButtonStyle(true)" class="float-left"/>
      </div>
      <div v-if="editMode">
        <chrome-picker v-model="$parent.form[name]" :disableAlpha="true" :style="{'width': '256px'}" class="mt-1" @input="changeColor" />
      </div>
    </b-form-group>
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
      }
      if(colorArea){
        style.width = '64px'
        style.height = '32px'
        style['background-color'] = this.colorValue
      }
      return style
    },
    colorCd4db(color){
      return `#${Util.colorCd4db(color)}`
    },
    changeColor(color){
      this.colorValue = this.colorCd4db(color)
    },
    switchEditMode(){
      if(this.$parent.isEditable){
        this.editMode = !this.editMode
      }
    },
  },
}
</script>

<style scoped lang="scss">

</style>