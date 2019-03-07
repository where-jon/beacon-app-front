<template>
    <b-row v-if="messageList" class="mt-3 mb-3 text-danger ">
       {{ $t('label.detectedProhibitZone') + ' : ' }}{{ messageList }}
    </b-row>
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
