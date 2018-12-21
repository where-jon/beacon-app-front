<template>
  <h3 v-t="title" class="loginuser-profile" />
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      required: true,
    }
  }
}
</script>

<style scoped lang="scss">
  h3.loginuser-profile {
    font-size: 1rem;
    font-weight: bold;
    color: #999;
    margin-bottom: 20px;
  }
</style>