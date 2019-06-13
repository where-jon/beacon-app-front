<template>
  <div class="container-fluid">
    <div class="container">
      <a id="linkTest" :href="fromPage" />
      <div id="position-list">
        <p class="helpLabelHeader">
          {{ getLabel('positionList') }}
        </p>
        <p class="helpTitle">
          {{ getLabel('state') }}
        </p>
        <p class="helpDetail">
          {{ getHelpDescription('state', {detected: getLabel('detected'), temporaryUndetect: getLabel('temporaryUndetect'), undetect: getLabel('undetect'), none: getLabel('none')}) }}
        </p>
      </div>
      <div id="bulkedit">
        <p class="helpLabelHeader">
          {{ getLabel('bulkRegister') }}
        </p>
        
        <p class="helpTitle">
          {{ getLabel('notes') }}
        </p>
        <p class="helpDetail">
          {{ getHelpDescription('bulkNotes', {personal: getLabel('personal'), charSet: getLabel('charSet'), SJIS: getLabel('SJIS')}) }}
        </p>
        <p class="helpTitle">
          {{ getLabel('register') }}
        </p>
        <p class="helpDetail">
          {{ getHelpDescription('bulkRegister') }}
        </p>
        <p class="helpTitle">
          {{ getMessage('bulkUniqueFailed', {col: getLabel('linage'), value: getLabel('keyName')}) }}
        </p>
        <p class="helpDetail">
          {{ getHelpDescription('bulkUniqueFailed') }}
        </p>
        <p class="helpTitle">
          {{ getMessage('bulkOneOfFailed', {col: getLabel('linage'), value: getLabel('keyName'), candidates: getLabel('value')}) }}
        </p>
        <p class="helpDetail">
          {{ getHelpDescription('bulkOneOfFailed') }}
        </p>
        <p class="helpTitle">
          {{ getMessage('bulkRangeFailed', {col: getLabel('linage'), value: getLabel('keyName'), min: getLabel('min'), max: getLabel('max')}) }}
        </p>
        <p class="helpDetail">
          {{ getHelpDescription('bulkRangeFailed') }}
        </p>
        <p class="helpTitle">
          {{ getMessage('bulkSizeFailed', {col: getLabel('linage'), value: getLabel('keyName'), min: getLabel('min'), max: getLabel('max')}) }}
        </p>
        <p class="helpDetail">
          {{ getHelpDescription('bulkSizeFailed') }}
        </p>
        <p class="helpTitle">
          {{ getMessage('bulkSizeSameFailed', {col: getLabel('linage'), value: getLabel('keyName'), min: getLabel('number')}) }}
        </p>
        <p class="helpDetail">
          {{ getHelpDescription('bulkSizeSameFailed') }}
        </p>
        <p class="helpTitle">
          {{ getMessage('bulkNotNullFailed', {col: getLabel('keyName')}) }}
        </p>
        <p class="helpDetail">
          {{ getHelpDescription('bulkNotNullFailed') }}
        </p>
        <p class="helpTitle">
          {{ getMessage('bulkExistFailed', {col: getLabel('linage'), value: getLabel('keyName')}) }}
        </p>
        <p class="helpDetail">
          {{ getHelpDescription('bulkExistFailed') }}
        </p>
        <p class="helpTitle">
          {{ getMessage('bulkInvalidFailed', {col: getLabel('linage'), value: getLabel('keyName')}) }}
        </p>
        <p class="helpDetail">
          {{ getHelpDescription('bulkInvalidFailed') }}
        </p>
        <p class="helpTitle">
          {{ getMessage('bulkAuthFailed', {col: getLabel('linage'), value: getLabel('keyName')}) }}
        </p>
        <p class="helpDetail">
          {{ getHelpDescription('bulkAuthFailed') }}
        </p>
        <p class="helpTitle">
          {{ getMessage('bulkUseFailed', {col: getLabel('linage'), value: getLabel('keyName'), num: getLabel('max'), unit: getLabel('keyName'), target: getLabel('keyName')}) }}
        </p>
        <p class="helpDetail">
          {{ getHelpDescription('bulkUseFailed') }}
        </p>
        <p class="helpTitle">
          {{ getMessage('bulkSystemUseFailed', {col: getLabel('linage'), value: getLabel('keyName')}) }}
        </p>
        <p class="helpDetail">
          {{ getHelpDescription('bulkSystemUseFailed') }}
        </p>
        <p class="helpTitle">
          {{ getMessage('bulkSystemUseNameFailed', {col: getLabel('linage'), value: getLabel('keyName')}) }}
        </p>
        <p class="helpDetail">
          {{ getHelpDescription('bulkSystemUseNameFailed') }}
        </p>
        <p class="helpTitle">
          {{ getMessage('bulkInvalidUpdateLineFailed', {col: getLabel('linage'), value: getLabel('keyName')}) }}
        </p>
        <p class="helpDetail">
          {{ getHelpDescription('bulkInvalidUpdateLineFailed') }}
        </p>
      </div>
      <div id="category">
        <p class="helpLabelHeader">
          {{ getLabel('category') }}
        </p>

        <p class="helpTitle">
          {{ getLabel('system') + getLabel('category') }}
        </p>
        <p class="helpDetail">
          {{ getHelpDescription('systemCategory') }}
        </p>
        <p class="helpTitle">
          {{ getLabel('absent') }}
        </p>
        <p class="helpDetail">
          {{ getHelpDescription('absent') }}
        </p>
        <p class="helpTitle">
          {{ getLabel('prohibit') }}
        </p>
        <p class="helpDetail">
          {{ getHelpDescription('prohibit') }}
        </p>
      </div>
      <div id="zoneClass">
        <p class="helpLabelHeader">
          {{ getLabel('zoneClass') }}
        </p>

        <p class="helpTitle">
          {{ getLabel('zone') }}
        </p>
        <p class="helpDetail">
          {{ getHelpDescription('zoneClass') }}
        </p>
      </div>
      <div id="zoneBlock">
        <p class="helpLabelHeader">
          {{ getLabel('zoneBlock') }}
        </p>

        <p class="helpTitle">
          {{ getLabel('setting') }}
        </p>
        <p class="helpDetail">
          {{ getHelpDescription('zoneBlock', {zoneBlock: getLabel('zoneBlock')}) }}
        </p>
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
  methods: {
    getLabel(key, option){
      return this.$i18n.tnl('label.' + key, option)
    },
    getMessage(key, option){
      return this.$i18n.tnl('message.' + key, option)
    },
    getHelpDescription(key, option){
      return this.$i18n.tnl('helpDescription.' + key, option)
    },
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
