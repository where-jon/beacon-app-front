<template>
  <div>
    Waiting...
  </div>
</template>

<script>

export default {
  async mounted() {
    this.$router.push('/azlogin/' + location.search)
  }
}

</script>

<style>
</style>
