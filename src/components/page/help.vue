<template>
  <div class="container-fluid">
    <div class="container">
      <a id="linkTest" :href="fromPage"></a>
      <div id="position-list">
        <p class="helpLabelHeader">{{ $i18n.tnl('label.positionList') }}</p>
        <p class="helpTitle">状態</p>
        <p class="helpDetail">状態については次の定義となります。検知：未検知：消失：なし：</p>
      </div>

      <div id="bulkedit">
        <p class="helpLabelHeader">{{ $i18n.tnl('label.bulkRegister') }}</p>
        
        <p class="helpTitle">{{ $i18n.tnl('label.register') }}</p>
        <p class="helpDetail">{{ $i18n.tnl('helpDescription.bulkRegister') }}</p>
        <p class="helpTitle">{{ $i18n.tnl('message.bulkUniqueFailed', {col: linage, value: keyName}) }}</p>
        <p class="helpDetail">{{ $i18n.tnl('helpDescription.bulkUniqueFailed') }}</p>
        <p class="helpTitle">{{ $i18n.tnl('message.bulkOneOfFailed', {col: linage, value: keyName, candidates: candidates}) }}</p>
        <p class="helpDetail">{{ $i18n.tnl('helpDescription.bulkOneOfFailed') }}</p>
        <p class="helpTitle">{{ $i18n.tnl('message.bulkRangeFailed', {col: linage, value: keyName, min: min, max: max}) }}</p>
        <p class="helpDetail">{{ $i18n.tnl('helpDescription.bulkRangeFailed') }}</p>
        <p class="helpTitle">{{ $i18n.tnl('message.bulkSizeFailed', {col: linage, value: keyName, min: min, max: max}) }}</p>
        <p class="helpDetail">{{ $i18n.tnl('helpDescription.bulkSizeFailed') }}</p>
        <p class="helpTitle">{{ $i18n.tnl('message.bulkSizeSameFailed', {col: linage, value: keyName, min: number}) }}</p>
        <p class="helpDetail">{{ $i18n.tnl('helpDescription.bulkSizeSameFailed') }}</p>
        <p class="helpTitle">{{ $i18n.tnl('message.bulkNotNullFailed', {col: linage}) }}</p>
        <p class="helpDetail">{{ $i18n.tnl('helpDescription.bulkNotNullFailed') }}</p>
        <p class="helpTitle">{{ $i18n.tnl('message.bulkExistFailed', {col: linage, value: keyName}) }}</p>
        <p class="helpDetail">{{ $i18n.tnl('helpDescription.bulkExistFailed') }}</p>
        <p class="helpTitle">{{ $i18n.tnl('message.bulkInvalidFailed', {col: linage, value: keyName}) }}</p>
        <p class="helpDetail">{{ $i18n.tnl('helpDescription.bulkInvalidFailed') }}</p>
        <p class="helpTitle">{{ $i18n.tnl('message.bulkAuthFailed', {col: linage, value: keyName}) }}</p>
        <p class="helpDetail">{{ $i18n.tnl('helpDescription.bulkAuthFailed') }}</p>
        <p class="helpTitle">{{ $i18n.tnl('message.bulkUseFailed', {col: linage, value: keyName, num: max, unit: unit, target: target}) }}</p>
        <p class="helpDetail">{{ $i18n.tnl('helpDescription.bulkUseFailed') }}</p>
        <p class="helpTitle">{{ $i18n.tnl('message.bulkSystemUseFailed', {col: linage, value: keyName}) }}</p>
        <p class="helpDetail">{{ $i18n.tnl('helpDescription.bulkSystemUseFailed') }}</p>
        <p class="helpTitle">{{ $i18n.tnl('message.bulkSystemUseNameFailed', {col: linage, value: keyName}) }}</p>
        <p class="helpDetail">{{ $i18n.tnl('helpDescription.bulkSystemUseNameFailed') }}</p>
        <p class="helpTitle">{{ $i18n.tnl('message.bulkInvalidUpdateLineFailed', {col: linage, value: keyName}) }}</p>
        <p class="helpDetail">{{ $i18n.tnl('helpDescription.bulkInvalidUpdateLineFailed') }}</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    fromPage: {
      type: String,
      default: '',
    },
  },
  data () {
    return {
      linage: this.$i18n.tnl('label.linage'),
      keyName: this.$i18n.tnl('label.keyName'),
      candidates: this.$i18n.tnl('label.value'),
      min: this.$i18n.tnl('label.min'),
      max: this.$i18n.tnl('label.max'),
      number: this.$i18n.tnl('label.number'),
      unit: this.$i18n.tnl('label.keyName'),
      target: this.$i18n.tnl('label.keyName'),
    }
  },
}

</script>

<style lang="scss">
@import "../../sub/constant/config.scss";

.helpLabelHeader {
  font-weight: bold;
  font-size: 16px;
}
.helpTitle {
  font-weight: bold;
  font-size: 14px;
}
.helpDetail {
  font-size: 14px;
}

</style>
