<template>
  <b-form-group v-if="!isModal">
    <label v-t="'label.txViewType'" />
    <b-form-select v-model="txDispFormat" :options="txViewTypes" class="mb-3 ml-3 col-3" :disabled="!isEditable" :readonly="!isEditable" @change="onChangeDispFormat" />
    <label v-t="'label.txIconColumns'" class="txicons-num"  v-if="isIconsDispFormatTile" :disabled="!isIconsDispFormatTile"/>
    <b-form-select v-model="layoutHorizon" :options="getSelectElements('column')" class="mb-3 ml-3 col-2" :disabled="!isEditable" v-if="isIconsDispFormatTile" :readonly="!isEditable" @change="onChangeHorizon" />
    <label v-t="'label.txIconLines'" class="txicons-num"  v-if="isIconsDispFormatTile" :disabled="!isIconsDispFormatTile"/>
    <b-form-select v-model="layoutVertical" :options="getSelectElements('line')" class="mb-3 ml-3 col-2" :disabled="!isEditable" v-if="isIconsDispFormatTile" :readonly="!isEditable" @change="onChangeVertical" />
  </b-form-group>
  <div v-else>
    <b-form>
      <b-form-group>
        <label v-t="'label.txViewType'" />
        <b-form-select v-model="txDispFormat " :options="txViewTypes" :disabled="!isEditable" :readonly="!isEditable" @change="onChangeDispFormat" />
      </b-form-group>
      <b-form-group v-if="isIconsDispFormatTile">
        <label v-t="'label.txIconColumns'" :disabled="!isIconsDispFormatTile"/>
        <b-form-select v-model="layoutHorizon " :options="getSelectElements('column')" :disabled="!isEditable" :readonly="!isEditable" @change="onChangeHorizon" />
      </b-form-group>
      <b-form-group v-if="isIconsDispFormatTile">
        <label v-t="'label.txIconLines'" :disabled="!isIconsDispFormatTile"/>
        <b-form-select v-model="layoutVertical " :options="getSelectElements('line')" :disabled="!isEditable" :readonly="!isEditable" @change="onChangeVertical" />
      </b-form-group>
    </b-form>
  </div>
</template>

<script>
import { TX_VIEW_TYPES, txViewTypes } from '../../sub/constant/Constants'
import { DISP } from '../../sub/constant/config'
import * as ViewHelper from '../../sub/helper/ViewHelper'
import * as AppServiceHelper from '../../sub/helper/AppServiceHelper'

export default {
  props: {
    isEditable: {
      type: Boolean,
      default: true,
    },
    isModal: {
      type: Boolean,
      default: false,
    },
    dispFormat: {
      type: Number,
      default: 1,
    },
    horizon: {
      type: Number,
      default: DISP.TX_HORIZON,
    },
    vertical: {
      type: Number,
      default: DISP.TX_VERTICAL,
    },
  },
  data() {
    return {
      TXICONS_DISPFORMAT_TILE: 5,
      deviceId: null,
      txDispFormat: this.isModal ? null : this.dispFormat,
      layoutHorizon: this.isModal ? DISP.TX_HORIZON : this.horizon,
      layoutVertical: this.isModal ? DISP.TX_VERTICAL: this.vertical,
    }
  },
  created() {
    if (!this.isModal) {
      return
    }
    this.$root.$on('bv::show::modal', (target, param) => {
      this.deviceId = param.deviceId
      this.txDispFormat = param.format
      this.layoutHorizon = param.horizon
      this.layoutVertical = param.vertical
    })
  },
  computed: {
    txViewTypes() {
      return Object.keys(TX_VIEW_TYPES).map(key => {
        const label = `label.txViewType${key.charAt(0).toUpperCase()}${key.slice(1).toLowerCase()}`
        return {value: TX_VIEW_TYPES[key], text: this.$i18n.tnl(label)}
      })
    },
    isIconsDispFormatTile() {
      return this.txDispFormat === this.TXICONS_DISPFORMAT_TILE
    },
  },
  methods: {
    getSelectElements(columnOrLine) {
      const num = columnOrLine === 'column' ? DISP.TX_HORIZON : DISP.TX_VERTICAL
      const label = 'label.' + columnOrLine
      return [...Array(num).keys()].map((e) => {
        const i = e + 1
        return {value: i, text: `${this.$i18n.tnl(label, {[columnOrLine]: i})}`}
      })
    },
    onChangeDispFormat(value) {
      if (value !== this.TXICONS_DISPFORMAT_TILE) {
        this.layoutHorizon = DISP.TX_HORIZON
        this.layoutVertical = DISP.TX_VERTICAL
      }
      this.$emit('change', this.deviceId, value, this.layoutHorizon, this.layoutVertical)
    },
    onChangeHorizon(value) {
      this.$emit('change', this.deviceId, this.TXICONS_DISPFORMAT_TILE, value, this.layoutVertical)
    },
    onChangeVertical(value) {
      this.$emit('change', this.deviceId, this.TXICONS_DISPFORMAT_TILE, this.layoutHorizon, value)
    },
  },
}
</script>

<style scoped lang="scss">
label.txicons-num {
  margin-left: 20px;
}
</style>