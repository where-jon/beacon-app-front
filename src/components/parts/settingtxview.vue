<template>
  <b-form-group v-if="!isModal">
    <label v-t="'label.txViewType'" />
    <b-form-select v-model="txDispFormat" :options="txViewTypes" :disabled="!isEditable" :readonly="!isEditable" class="mb-3 ml-3 col-3" @change="onChangeDispFormat" />
    <label v-if="isIconsDispFormatTile" v-t="'label.txIconColumns'" :disabled="!isIconsDispFormatTile" class="txicons-num" />
    <b-form-select v-if="isIconsDispFormatTile" v-model="layoutHorizon" :options="getSelectElements('column')" :disabled="!isEditable" :readonly="!isEditable" class="mb-3 ml-3 col-2" @change="onChangeHorizon" />
    <label v-if="isIconsDispFormatTile" v-t="'label.txIconLines'" :disabled="!isIconsDispFormatTile" class="txicons-num" />
    <b-form-select v-if="isIconsDispFormatTile" v-model="layoutVertical" :options="getSelectElements('line')" :disabled="!isEditable" :readonly="!isEditable" class="mb-3 ml-3 col-2" @change="onChangeVertical" />
  </b-form-group>
  <div v-else>
    <b-alert :show="isDelete" variant="danger">
      <font-awesome-icon icon="exclamation-circle" />&nbsp;&nbsp;{{ $t('message.deleteConfirm',{target: deviceId}) }}
    </b-alert>
    <b-form>
      <b-form-group>
        <b-form-checkbox v-model="isDelete" @change="onCheckDelete">
          {{ $t('label.delete') }}
        </b-form-checkbox>
      </b-form-group>
      <div v-if="!isDelete">
        <b-form-group>
          <label v-t="'label.txViewType'" />
          <b-form-select v-model="txDispFormat " :options="txViewTypes" :disabled="!isEditable" :readonly="!isEditable" @change="onChangeDispFormat" />
        </b-form-group>
        <b-form-group v-if="isIconsDispFormatTile">
          <label v-t="'label.txIconColumns'" :disabled="!isIconsDispFormatTile" />
          <b-form-select v-model="layoutHorizon " :options="getSelectElements('column')" :disabled="!isEditable" :readonly="!isEditable" @change="onChangeHorizon" />
        </b-form-group>
        <b-form-group v-if="isIconsDispFormatTile">
          <label v-t="'label.txIconLines'" :disabled="!isIconsDispFormatTile" />
          <b-form-select v-model="layoutVertical " :options="getSelectElements('line')" :disabled="!isEditable" :readonly="!isEditable" @change="onChangeVertical" />
        </b-form-group>
      </div>
    </b-form>
  </div>
</template>

<script>
import { TX_VIEW_TYPES } from '../../sub/constant/Constants'
import { DISP } from '../../sub/constant/config'

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
      isDelete: false,
    }
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
  created() {
    if (!this.isModal) {
      return
    }
    this.$root.$on('bv::show::modal', (target, param) => {
      if (target !== 'modalSettingExb') {
        return
      }
      this.isDelete = false
      this.deviceId = param.deviceId
      this.txDispFormat = param.format
      this.layoutHorizon = param.horizon
      this.layoutVertical = param.vertical
    })
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
      this.$emit('change', {
        deviceId: this.deviceId,
        format: value,
        horizon: this.layoutHorizon,
        vertical: this.layoutVertical,
        isDelete: false,
      })
    },
    onChangeHorizon(value) {
      this.$emit('change', {
        deviceId: this.deviceId,
        format: this.TXICONS_DISPFORMAT_TILE,
        horizon: value,
        vertical: this.layoutVertical,
        isDelete: false,
      })
    },
    onChangeVertical(value) {
      this.$emit('change', {
        deviceId: this.deviceId,
        format: this.TXICONS_DISPFORMAT_TILE,
        horizon: this.layoutHorizon,
        vertical: value,
        isDelete: false,
      })
    },
    onCheckDelete(value) {
      if (!value) {
        return
      }
      this.$emit('change', {
        deviceId: this.deviceId,
        format: this.txDispFormat,
        horizon: this.layoutHorizon,
        vertical: this.layoutVertical,
        isDelete: true,
      })
    }
  },
}
</script>

<style scoped lang="scss">
div.confirm-delete {
  margin-bottom: 17px;
}
label.txicons-num {
  margin-left: 20px;
}
</style>