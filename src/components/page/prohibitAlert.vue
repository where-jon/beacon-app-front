<template>
  <b-alert v-if="messageList" show variant="danger" dismissible>
    {{ $t('label.detectedProhibitZone') + ' : ' }}{{ messageList }}
  </b-alert>
</template>

<script>

export default {
  components: {
  },
  props: {
    messageList: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
    }
  },
  computed: {
  },
}

</script>

<style>
</style>
