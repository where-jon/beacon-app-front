<template>
  <div>
    Close this popup window.
  </div>
</template>

<script>

export default {
  async mounted() {
    if (window.opener) {
      window.opener.location.reload()
    }
  }
}

</script>

<style>
</style>
