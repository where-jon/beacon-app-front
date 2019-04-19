<template>
  <div class="container-fluid">
    <div class="container">
      <div id="bulkRegister">
        <p class="labelHeader">{{ $i18n.tnl('label.bulkRegister') }}</p>
        <p class="errorTitle">{{ $i18n.tnl('message.bulkUniqueFailed', {col: linage, value: keyName}) }}</p>
        <p class="errorDetail">対象の項目名は、重複できない項目です。既に他の行で使用されています。</p>
        <p class="errorTitle">{{ $i18n.tnl('message.bulkOneOfFailed', {col: linage, value: keyName, candidates: candidates}) }}</p>
        <p class="errorDetail">対象の項目名は、複数ある設定値のうちのいずれかで指定する必要があります。</p>
        <p class="errorTitle">{{ $i18n.tnl('message.bulkRangeFailed', {col: linage, value: keyName, min: min, max: max}) }}</p>
        <p class="errorDetail">対象の項目名は、指定されている範囲で指定する必要があります。</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      linage: this.$i18n.tnl('label.linage'),
      keyName: this.$i18n.tnl('label.keyName'),
      candidates: this.$i18n.tnl('label.value'),
      min: this.$i18n.tnl('label.min'),
      max: this.$i18n.tnl('label.max'),
    }
  },
}

</script>

<style lang="scss">
@import "../../sub/constant/config.scss";

.labelHeader {
  font-weight: bold;
  font-size: 16px;
}
.errorTitle {
  font-weight: bold;
  font-size: 14px;
}
.errorDetail {
  font-size: 14px;
}

</style>
