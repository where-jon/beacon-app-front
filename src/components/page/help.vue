<template>
  <div class="container-fluid">
    <div class="container">
      <a id="helpAutoLink" :href="fromPage" />
      <a id="initialize" href="#" v-on:click="initialize" />
      
      <div id="indexList">
        <p v-if="isEnableHelp" class="helpLabelHeader">
          {{ $i18n.tnl('helpDescription.indexName') }}
        </p>
        <p v-else class="helpLabelHeader">
          {{ $i18n.tnl('helpDescription.helpNone') }}
        </p>
        <div v-if="enablePositionList">
          <a href="#position-list">
            {{ $i18n.tnl('label.positionList') }}
          </a><br>
        </div>
        <div v-if="enableBulkRegister">
          <a href="#bulkedit">
            {{ $i18n.tnl('label.bulkRegister') }}
          </a><br>
        </div>
        <div v-if="isDisplayCategory">
          <a href="#category">
            {{ $i18n.tnl('label.category') }}
          </a><br>
        </div>
        <div v-if="isDisplayZoneClass">
          <a href="#zoneClass">
            {{ $i18n.tnl('label.zoneClass') }}
          </a><br>
        </div>
        <div v-if="isDisplayZoneBlock">
          <a href="#zoneBlock">
            {{ $i18n.tnl('label.zoneBlock') }}
          </a><br>
        </div>
      </div>
      <div v-if="enablePositionList" id="position-list">
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
      <div v-if="enableBulkRegister" id="bulkedit">
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
        <b-table striped hover small :items="bulkItems" :fields="bulkFields" />
      </div>
      <div v-if="isDisplayCategory" id="category">
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
      <div v-if="isDisplayZoneClass" id="zoneClass">
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
      <div v-if="isDisplayZoneBlock" id="zoneBlock">
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
import Vue from 'vue'
import { mapState } from 'vuex'
import * as ViewHelper from '../../sub/helper/ViewHelper'

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
      bulkFields: ViewHelper.addLabelByKey(this.$i18n, [
        {key: 'error_name', sortable: true, label: 'error', thClass: 'fields', tdClass: 'items'},
        {key: 'description', sortable: false, label: 'detail', thClass: 'fields', tdClass: 'items'},
      ]),
      bulkItems: [
        { isActive: true, description: this.$i18n.tnl('helpDescription.bulkUniqueFailed'), error_name: this.$i18n.tnl('message.bulkUniqueFailed', {col: this.$i18n.tnl('label.linage'), value: this.$i18n.tnl('label.keyName')}) },
        { isActive: true, description: this.$i18n.tnl('helpDescription.bulkExistFailed'), error_name: this.$i18n.tnl('message.bulkExistFailed', {col: this.$i18n.tnl('label.linage'), value: this.$i18n.tnl('label.keyName')}) },
        { isActive: true, description: this.$i18n.tnl('helpDescription.bulkAuthFailed'), error_name: this.$i18n.tnl('message.bulkAuthFailed', {col: this.$i18n.tnl('label.linage'), value: this.$i18n.tnl('label.keyName')}) },
        { isActive: true, description: this.$i18n.tnl('helpDescription.bulkSystemUseFailed'), error_name: this.$i18n.tnl('message.bulkSystemUseFailed', {col: this.$i18n.tnl('label.linage'), value: this.$i18n.tnl('label.keyName')}) },
        { isActive: true, description: this.$i18n.tnl('helpDescription.bulkSystemUseNameFailed'), error_name: this.$i18n.tnl('message.bulkSystemUseNameFailed', {col: this.$i18n.tnl('label.linage'), value: this.$i18n.tnl('label.keyName')}) },
      ],
      isEnableHelp: false,
      isDisplayPositionList: false,
      isDisplayBulkRegister: false,
      isDisplayCategory: false,
      isDisplayZoneClass: false,
      isDisplayZoneBlock: false,
    }
  },
  computed: {
    ...mapState([
      'menu',
    ]),
    enablePositionList() {
      return this.isDisplayPositionList
    },
    enableBulkRegister() {
      return this.isDisplayBulkRegister
    },
    enableCategory() {
      return this.isDisplayCategory
    },
    enablePZoneClass() {
      return this.isDisplayZoneClass
    },
    enableZoneBlock() {
      return this.isDisplayZoneBlock
    },
  },
  methods: {
    initialize() {
      this.checkMenu()
      Vue.nextTick(function () {
        // if反映された後の描画を待ってリンクさせる
        document.getElementById('helpAutoLink').click()
      })
    },
    checkMenu() {
      this.menu.forEach(function(parent) {
        if (!this.isDisplayPositionList) {
          this.isDisplayPositionList = parent.pages.find((val) => val.path == 'position-list')? true: false
        }
        if (parent.key == 'main' && !this.isDisplayBulkRegister) {
          this.isDisplayBulkRegister = parent.pages.length > 0? true: false
        }
        if (!this.isDisplayCategory) {
          this.isDisplayCategory = parent.pages.find((val) => val.path == 'category')? true: false
        }
        if (!this.isDisplayZoneClass) {
          this.isDisplayZoneClass = parent.pages.find((val) => val.path == 'zoneClass')? true: false
        }
        if (!this.isDisplayZoneBlock) {
          this.isDisplayZoneBlock = parent.pages.find((val) => val.path == 'zoneBlock')? true: false
        }
      }.bind(this))

      this.isEnableHelp = this.isDisplayPositionList || this.isDisplayBulkRegister || this.isDisplayCategory || this.isDisplayZoneClass || this.isDisplayZoneBlock
    }
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
hr {
  border-color: black;
  border-top: double;
}
.fields {
  font-size: 14px !important;
}
.items {
  font-size: 14px !important;
}

</style>
