<template>
  <b-container>
    <input type="text" tabIndex="-1" class="chromeAutoInput">
    <input type="password" tabIndex="-1" class="chromeAutoInput">
  </b-container>
</template>

<script>
</script>

<style>
  .chromeAutoInput{
    position: fixed;
    width: 0px;
    height: 0px;
    top: -999px;
  }
</style>
