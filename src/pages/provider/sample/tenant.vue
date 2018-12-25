<template>
  <div>
    てなんとかんりサンプル<br>
    <button @click="switchTenant(1)">
      テナント切換
    </button>
    <br>
    <button @click="switchRegion(3)">
      リージョン切換
    </button>
  </div>
</template>

<script>
import * as HttpHelper from '../../../sub/helper/HttpHelper'

export default {
  methods: {
    async switchTenant(tenantId) {
      await HttpHelper.putAppService('/meta/tenant/current/' + tenantId)
      location.reload()
    },
    async switchRegion(regionId) {
      await HttpHelper.putAppService('/core/region/current/' + regionId)
      location.reload()
    },
  }
}

</script>

<style>
</style>
