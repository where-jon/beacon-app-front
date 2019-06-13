<template>
  <div class="container-fluid">
    <div class="container">
      <a id="linkTest" :href="fromPage" />
      <div id="position-list">
        <p class="helpLabelHeader">
          {{ $i18n.tnl('label.positionList') }}
        </p>
        <p class="helpTitle">
          {{ $i18n.tnl('label.state') }}
        </p>
        <p class="helpDetail">
          {{ $i18n.tnl('helpDescription.state', {detected: getDetected(), temporaryUndetect: getTemporaryUndetect(), undetect: getUndetect(), none: getNone()}) }}
        </p>
      </div>
      <div id="bulkedit">
        <p class="helpLabelHeader">
          {{ $i18n.tnl('label.bulkRegister') }}
        </p>
        
        <p class="helpTitle">
          {{ $i18n.tnl('label.notes') }}
        </p>
        <p class="helpDetail">
          {{ $i18n.tnl('helpDescription.bulkNotes', {personal: getPersonal(), charSet: getCharSet(), SJIS: getSJIS()}) }}
        </p>
        <p class="helpTitle">
          {{ $i18n.tnl('label.register') }}
        </p>
        <p class="helpDetail">
          {{ $i18n.tnl('helpDescription.bulkRegister') }}
        </p>
        <p class="helpTitle">
          {{ $i18n.tnl('message.bulkUniqueFailed', {col: getLinage(), value: getKeyName()}) }}
        </p>
        <p class="helpDetail">
          {{ $i18n.tnl('helpDescription.bulkUniqueFailed') }}
        </p>
        <p class="helpTitle">
          {{ $i18n.tnl('message.bulkOneOfFailed', {col: getLinage(), value: getKeyName(), candidates: getCandidates()}) }}
        </p>
        <p class="helpDetail">
          {{ $i18n.tnl('helpDescription.bulkOneOfFailed') }}
        </p>
        <p class="helpTitle">
          {{ $i18n.tnl('message.bulkRangeFailed', {col: getLinage(), value: getKeyName(), min: getMin(), max: getMax()}) }}
        </p>
        <p class="helpDetail">
          {{ $i18n.tnl('helpDescription.bulkRangeFailed') }}
        </p>
        <p class="helpTitle">
          {{ $i18n.tnl('message.bulkSizeFailed', {col: getLinage(), value: getKeyName(), min: getMin(), max: getMax()}) }}
        </p>
        <p class="helpDetail">
          {{ $i18n.tnl('helpDescription.bulkSizeFailed') }}
        </p>
        <p class="helpTitle">
          {{ $i18n.tnl('message.bulkSizeSameFailed', {col: getLinage(), value: getKeyName(), min: getNumber()}) }}
        </p>
        <p class="helpDetail">
          {{ $i18n.tnl('helpDescription.bulkSizeSameFailed') }}
        </p>
        <p class="helpTitle">
          {{ $i18n.tnl('message.bulkNotNullFailed', {col: getKeyName()}) }}
        </p>
        <p class="helpDetail">
          {{ $i18n.tnl('helpDescription.bulkNotNullFailed') }}
        </p>
        <p class="helpTitle">
          {{ $i18n.tnl('message.bulkExistFailed', {col: getLinage(), value: getKeyName()}) }}
        </p>
        <p class="helpDetail">
          {{ $i18n.tnl('helpDescription.bulkExistFailed') }}
        </p>
        <p class="helpTitle">
          {{ $i18n.tnl('message.bulkInvalidFailed', {col: getLinage(), value: getKeyName()}) }}
        </p>
        <p class="helpDetail">
          {{ $i18n.tnl('helpDescription.bulkInvalidFailed') }}
        </p>
        <p class="helpTitle">
          {{ $i18n.tnl('message.bulkAuthFailed', {col: getLinage(), value: getKeyName()}) }}
        </p>
        <p class="helpDetail">
          {{ $i18n.tnl('helpDescription.bulkAuthFailed') }}
        </p>
        <p class="helpTitle">
          {{ $i18n.tnl('message.bulkUseFailed', {col: getLinage(), value: getKeyName(), num: getMax(), unit: getUnit(), target: getTarget()}) }}
        </p>
        <p class="helpDetail">
          {{ $i18n.tnl('helpDescription.bulkUseFailed') }}
        </p>
        <p class="helpTitle">
          {{ $i18n.tnl('message.bulkSystemUseFailed', {col: getLinage(), value: getKeyName()}) }}
        </p>
        <p class="helpDetail">
          {{ $i18n.tnl('helpDescription.bulkSystemUseFailed') }}
        </p>
        <p class="helpTitle">
          {{ $i18n.tnl('message.bulkSystemUseNameFailed', {col: getLinage(), value: getKeyName()}) }}
        </p>
        <p class="helpDetail">
          {{ $i18n.tnl('helpDescription.bulkSystemUseNameFailed') }}
        </p>
        <p class="helpTitle">
          {{ $i18n.tnl('message.bulkInvalidUpdateLineFailed', {col: getLinage(), value: getKeyName()}) }}
        </p>
        <p class="helpDetail">
          {{ $i18n.tnl('helpDescription.bulkInvalidUpdateLineFailed') }}
        </p>
      </div>
      <div id="category">
        <p class="helpLabelHeader">
          {{ $i18n.tnl('label.category') }}
        </p>

        <p class="helpTitle">
          {{ $i18n.tnl('label.system') + $i18n.tnl('label.category') }}
        </p>
        <p class="helpDetail">
          {{ $i18n.tnl('helpDescription.systemCategory') }}
        </p>
        <p class="helpTitle">
          {{ $i18n.tnl('label.absent') }}
        </p>
        <p class="helpDetail">
          {{ $i18n.tnl('helpDescription.absent') }}
        </p>
        <p class="helpTitle">
          {{ $i18n.tnl('label.prohibit') }}
        </p>
        <p class="helpDetail">
          {{ $i18n.tnl('helpDescription.prohibit') }}
        </p>
      </div>
      <div id="zoneClass">
        <p class="helpLabelHeader">
          {{ $i18n.tnl('label.zoneClass') }}
        </p>

        <p class="helpTitle">
          {{ $i18n.tnl('label.zone') }}
        </p>
        <p class="helpDetail">
          {{ $i18n.tnl('helpDescription.zoneClass') }}
        </p>
      </div>
      <div id="zoneBlock">
        <p class="helpLabelHeader">
          {{ $i18n.tnl('label.zoneBlock') }}
        </p>

        <p class="helpTitle">
          {{ $i18n.tnl('label.setting') }}
        </p>
        <p class="helpDetail">
          {{ $i18n.tnl('helpDescription.zoneBlock', {zoneBlock: getZoneBlock()}) }}
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
    getLinage(){
      return this.$i18n.tnl('label.linage')
    },
    getKeyName(){
      return this.$i18n.tnl('label.keyName')
    },
    getCandidates(){
      return this.$i18n.tnl('label.value')
    },
    getMin(){
      return this.$i18n.tnl('label.min')
    },
    getMax(){
      return this.$i18n.tnl('label.max')
    },
    getNumber(){
      return this.$i18n.tnl('label.number')
    },
    getUnit(){
      return this.$i18n.tnl('label.keyName')
    },
    getTarget(){
      return this.$i18n.tnl('label.keyName')
    },
    getDetected(){
      return this.$i18n.tnl('label.detected')
    },
    getTemporaryUndetect(){
      return this.$i18n.tnl('label.temporaryUndetect')
    },
    getUndetect(){
      return this.$i18n.tnl('label.undetect')
    },
    getNone(){
      return this.$i18n.tnl('label.none')
    },
    getPersonal(){
      return this.$i18n.tnl('label.personal')
    },
    getCharSet(){
      return this.$i18n.tnl('label.charSet')
    },
    getSJIS(){
      return this.$i18n.tnl('label.SJIS')
    },
    getZoneBlock(){
      return this.$i18n.tnl('label.zoneBlock')
    },
  }
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
