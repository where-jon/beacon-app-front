<template>
  <b-form-group>
    <label v-t="'label.txViewType'" />
    <b-form-select v-model="txDispFormat" :options="txViewTypes" class="mb-3 ml-3 col-3" :disabled="!isEditable" :readonly="!isEditable" @change="onChangeDispFormat" />
    <label v-t="'label.txIconColumns'" class="txicons-num" v-show="isIconsDispFormatTile"/>
    <b-form-select v-model="layoutHorizon" :options="txIconsNumHorizon" class="mb-3 ml-3 col-1" :disabled="!isEditable" :readonly="!isEditable" @change="onChangeHorizon" v-show="isIconsDispFormatTile"/>
    <label v-t="'label.txIconColumnsUnit'"  v-show="isIconsDispFormatTile"/>
    <label v-t="'label.txIconLines'" class="txicons-num" v-show="isIconsDispFormatTile"/>
    <b-form-select v-model="layoutVertical" :options="txIconsNumVertical" class="mb-3 ml-3 col-1" :disabled="!isEditable" :readonly="!isEditable" @change="onChangeVertical" v-show="isIconsDispFormatTile"/>
    <label v-t="'label.txIconLinesUnit'" v-show="isIconsDispFormatTile"/>
  </b-form-group>
</template>

<script>
import { TX_VIEW_TYPES, txViewTypes } from '../../sub/constant/Constants'
import * as ViewHelper from '../../sub/helper/ViewHelper'
import * as AppServiceHelper from '../../sub/helper/AppServiceHelper'

export default {
  props: {
    isEditable: {
      type: Boolean,
      default: true
    },
    dispFormat: {
      type: Number,
      default: 1,
    },
    horizon: {
      type: Number,
      default: 5,
    },
    vertical: {
      type: Number,
      default: 5,
    }
  },
  data() {
    return {
      TXICONS_DISPFORMAT_TILE: 5,
      txDispFormat: null,
      layoutHorizon: 5,
      layoutVertical: 5,
    }
  },
  computed: {
    txViewTypes() {
      return Object.keys(TX_VIEW_TYPES).map(key => {
        const label = `label.txViewType${key.charAt(0).toUpperCase()}${key.slice(1).toLowerCase()}`
        return {value: TX_VIEW_TYPES[key], text: this.$i18n.tnl(label)}
      })
    },
    txIconsNumHorizon() {
      return [
        {value: 1, text: 1},
        {value: 2, text: 2},
        {value: 3, text: 3},
        {value: 4, text: 4},
        {value: 5, text: 5},
      ]
    },
    txIconsNumVertical() {
      return [
        {value: 1, text: 1},
        {value: 2, text: 2},
        {value: 3, text: 3},
        {value: 4, text: 4},
        {value: 5, text: 5},
      ]
    },
    isIconsDispFormatTile() {
      return this.txDispFormat === this.TXICONS_DISPFORMAT_TILE
    },
  },
  methods: {
    onChangeDispFormat(value) {
      this.$emit('changeFormat', value)
    },
    onChangeHorizon(value) {
      this.$emit('changeHorizon', value)
    },
    onChangeVertical(value) {
      this.$emit('changeVertical', value)
    },
  },
  mounted() {
    this.txDispFormat = this.dispFormat
    this.layoutHorizon = this.horizon
    this.layoutVertical = this.vertical
  },
}
</script>

<style scoped lang="scss">
label.txicons-num {
  margin-left: 20px;
}
</style>