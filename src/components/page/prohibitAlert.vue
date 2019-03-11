<template>
  <b-alert v-if="messagelist" class="mt-2" show variant="danger" dismissible>
    {{ $t('label.detectedProhibitZone') + ' : ' }}{{ messagelist }}
  </b-alert>
</template>

<script>

export default {
  components: {
  },
  props: {
    messagelist: {
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
