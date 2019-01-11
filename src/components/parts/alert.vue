<template>
  <b-container>
    <b-alert :show="showInfo && !forceHide" variant="info" dismissible>
      {{ message }}
    </b-alert>
    <b-alert :show="showWarn && !forceHide" variant="warning" dismissible>
      {{ warnMessage }}
      <div v-for="warnThumbnail in warnThumbnails" :key="warnThumbnail.id">
        ID:{{ warnThumbnail.id }}
      </div>
    </b-alert>
    <b-alert :show="showAlert && !forceHide" variant="danger" dismissible>
      <template v-if="Array.isArray(message)">
        <span v-for="line in message" :key="line">
          {{ line }} <br>
        </span>
      </template>
      <span v-else>
        {{ message }}
      </span>
    </b-alert>
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
  },
  computed: {
    ...mapState([
      'showInfo',
      'showAlert',
      'showWarn',
    ]),
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
  }
}

</script>

<style>
</style>
