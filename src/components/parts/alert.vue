<template>
  <b-container>
    <b-alert :show="showInfo && !forceHide" variant="info" :dismissible="!fixAlert" :style="getAlertStyle()">
      {{ message }}
    </b-alert>
    <b-alert :show="showWarn && !forceHide" variant="warning" :dismissible="!fixAlert" :style="getAlertStyle()">
      {{ warnMessage }}
      <div v-for="warnThumbnail in warnThumbnails" :key="warnThumbnail.id">
        {{ $i18n.tnl('message.' + warnThumbnail.type, {key: 'ID', val: warnThumbnail.id, target: warnThumbnail.target}) }}
      </div>
    </b-alert>
    <b-alert :show="showAlert && !forceHide" variant="danger" :dismissible="prohibitAlert ? true: !fixAlert" :style="getAlertStyle()">
      <template v-if="Array.isArray(message)">
        <span v-for="line in message" :key="line">
          {{ line }} <br>
        </span>
      </template>
      <span v-else>
        {{ message }}
      </span>
    </b-alert>
    <b-alert :show="fixAlert && !showInfo && !showWarn && !showAlert && !prohibitView " variant="light" :style="getAlertBlankStyle()" />
  </b-container>
</template>

<script>

import { mapState, mapMutations } from 'vuex'

export default {
  props: {
    message: {
      type: [String, Array],
      default: '',
    },
    warnMessage: {
      type: String,
      default: '',
    },
    warnThumbnails: {
      type: Array,
      default: () => [],
    },
    forceHide: {
      type: Boolean,
      default: false,
    },
    fix: {
      type: Number,
      default: 0,
    },
    prohibit: {
      type: Boolean,
      default: false,
    },
    prohibitView: {
      type: Boolean,
      default: false,
    },
    alertStyle: {
      type: Object,
      default: () => {},
    },
  },
  computed: {
    ...mapState([
      'showInfo',
      'showAlert',
      'showWarn',
    ]),
    tempFor(){
      return 0 < this.fixAlert? new Array(this.fix): []
    },
    prohibitAlert(){
      return this.prohibit
    },
    fixAlert(){
      return this.fix > 0
    },
  },
  mounted() {
    this.replace({showWarn: false})
    this.replace({showAlert: false})
    this.replace({showInfo: false})
  },
  methods: {
    ...mapMutations([
      'replace', 
    ]),
    getAlertStyle(){
      return Object.assign(this.fixAlert? {height: `${25 * (this.fix + 1)}px`, 'overflow-y': 'auto'}: {}, this.alertStyle)
    },
    getAlertBlankStyle(){
      return this.fixAlert? {height: `${25 * (this.fix + 1)}px`, visibility: 'hidden'}: {}
    },
  }
}

</script>

<style>
</style>
