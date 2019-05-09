<template>
  <div class="container-fluid">
    <div class="container">
      <a id="helpAutoLink" :href="fromPage" />
      
      <div id="indexList">
        <p class="helpLabelHeader">
          {{ $i18n.tnl('helpDescription.indexName') }}
        </p>
        <a href="#position-list">
          {{ $i18n.tnl('label.positionList') }}
        </a><br>
        <a href="#bulkedit">
          {{ $i18n.tnl('label.bulkRegister') }}
        </a><br>
        <a href="#category">
          {{ $i18n.tnl('label.category') }}
        </a><br>
        <a href="#zoneClass">
          {{ $i18n.tnl('label.zoneClass') }}
        </a><br>
        <a href="#zoneBlock">
          {{ $i18n.tnl('label.zoneBlock') }}
        </a><br>
      </div>
      <div id="position-list">
        <hr>
        <p class="helpLabelHeader">
          {{ $i18n.tnl('label.positionList') }}
        </p>
        <p class="helpTitle">
          {{ $i18n.tnl('label.state') }}
        </p>
        <p class="helpDetail">
          {{ $i18n.tnl('helpDescription.state', {detected: detected, temporaryUndetect: temporaryUndetect, undetect: undetect, none: none}) }}
        </p>
      </div>
      <div id="bulkedit">
        <hr>
        <p class="helpLabelHeader">
          {{ $i18n.tnl('label.bulkRegister') }}
        </p>
        
        <p class="helpTitle">
          {{ $i18n.tnl('label.notes') }}
        </p>
        <p class="helpDetail">
          {{ $i18n.tnl('helpDescription.bulkNotes', {personal: personal, charSet: charSet, SJIS: SJIS}) }}
        </p>
        <p class="helpTitle">
          {{ $i18n.tnl('label.register') }}
        </p>
        <p class="helpDetail">
          {{ $i18n.tnl('helpDescription.bulkRegister') }}
        </p>
        <p class="helpTitle">
          {{ $i18n.tnl('message.bulkUniqueFailed', {col: linage, value: keyName}) }}
        </p>
        <p class="helpDetail">
          {{ $i18n.tnl('helpDescription.bulkUniqueFailed') }}
        </p>
        <p class="helpTitle">
          {{ $i18n.tnl('message.bulkExistFailed', {col: linage, value: keyName}) }}
        </p>
        <p class="helpDetail">
          {{ $i18n.tnl('helpDescription.bulkExistFailed') }}
        </p>
        <p class="helpTitle">
          {{ $i18n.tnl('message.bulkAuthFailed', {col: linage, value: keyName}) }}
        </p>
        <p class="helpDetail">
          {{ $i18n.tnl('helpDescription.bulkAuthFailed') }}
        </p>
        <p class="helpTitle">
          {{ $i18n.tnl('message.bulkSystemUseFailed', {col: linage, value: keyName}) }}
        </p>
        <p class="helpDetail">
          {{ $i18n.tnl('helpDescription.bulkSystemUseFailed') }}
        </p>
        <p class="helpTitle">
          {{ $i18n.tnl('message.bulkSystemUseNameFailed', {col: linage, value: keyName}) }}
        </p>
        <p class="helpDetail">
          {{ $i18n.tnl('helpDescription.bulkSystemUseNameFailed') }}
        </p>
      </div>
      <div id="category">
        <hr>
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
        <hr>
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
        <hr>
        <p class="helpLabelHeader">
          {{ $i18n.tnl('label.zoneBlock') }}
        </p>

        <p class="helpTitle">
          {{ $i18n.tnl('label.setting') }}
        </p>
        <p class="helpDetail">
          {{ $i18n.tnl('helpDescription.zoneBlock', {zoneBlock: zoneBlock}) }}
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
  data () {
    return {
      linage: this.$i18n.tnl('label.linage'),
      keyName: this.$i18n.tnl('label.keyName'),
      detected: this.$i18n.tnl('label.detected'),
      temporaryUndetect: this.$i18n.tnl('label.temporaryUndetect'),
      undetect: this.$i18n.tnl('label.undetect'),
      none: this.$i18n.tnl('label.none'),
      personal: this.$i18n.tnl('label.personal'),
      charSet: this.$i18n.tnl('label.charSet'),
      SJIS: this.$i18n.tnl('label.SJIS'),
      zoneBlock: this.$i18n.tnl('label.zoneBlock'),
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

hr {
  border-color: black;
  border-top: double;
}

</style>
