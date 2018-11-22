<template>
  <b-col md="2"  class="mb-3 mr-3 all-count">
    <span class="label">{{ $i18n.tnl('label.totalRecordsCount') + ':' }}</span>
    <span class="count">{{ count }}</span>
  </b-col>
</template>

<script>
export default {
  props: ['count'],
}
</script>

<style scoped lang="scss">
  div.all-count {
    line-height: 38px;
    color: #333;
  }

  div.all-count span.label {
    font-weight: bold;
  }

  div.all-count span.count {
    margin-left: 5px;
  }
</style>
