<template>
  <div>
    <div
      v-if="!isShowModal"
      id="txDetail"
      class="balloon"
      :style="txDetailStyle"
    >
      <div v-if="selectedSensor.length == 0" class="potBox" @click="$emit('resetDetail')">
        <div class="clearfix">
          <div v-if="enableThumbnail" class="thumbnail">
            <img v-if="selectedTx.thumbnail.length > 0" id="img" :src="selectedTx.thumbnail" :height="imageHeight" width="auto">
            <img v-else src="/default.png" width="auto" :height="imageHeight">
          </div>
          <div class="description" :style="descriptionStyle">
            <div v-for="item in getDispItems()" :key="item.key">
              <div v-if="item.key !== 'name' || !inMsTeams">
                {{ item.val }}
              </div>
              <div v-else>
                <a href="#" @click="moveToChat">{{ item.val }}</a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <meditag :sensors="selectedSensor" :is-popup="true" />
      <div id="popup-arrow" :style="arrowStyle"></div>
    </div>
    <txdetailmodal
      v-else
      :bg-color="selectedSensor.length == 0 ? selectedTx.bgColor : selectedSensor[0].bg"
      :color="selectedSensor.length == 0? selectedTx.color: blackColor"
    >
      <div v-if="selectedSensor.length == 0" :style="{backgroundColor: selectedTx.bgColor}" class="clearfix">
        <div v-if="enableThumbnail" class="thumbnail-modal">
          <img v-if="selectedTx.thumbnail.length > 0" :src="selectedTx.thumbnail" width="100%" height="auto">
          <img v-else src="/default.png" width="auto" height="116">
        </div>
        <div :class="descriptionSP">
          <div v-for="item in getDispItems()" :key="item.key">
            <div v-if="item.key !== 'name'">
              {{ item.val }}
            </div>
            <div v-else>
              <a v-if="inMsTeams" href="#" @click="moveToChat">{{ item.val }}</a>
            </div>
          </div>
        </div>
      </div>
      <meditag v-else :sensors="selectedSensor" :is-popup="true" />
    </txdetailmodal>
  </div>
</template>

<script>
import { APP, DISP } from '../../sub/constant/config'
import { FONT } from '../../sub/constant/Constants'
import * as ColorUtil from '../../sub/util/ColorUtil'
import * as NumberUtil from '../../sub/util/NumberUtil'
import * as StringUtil from '../../sub/util/StringUtil'
import * as BrowserUtil from '../../sub/util/BrowserUtil'
import meditag from './meditag.vue'
import txdetailmodal from './txdetailmodal.vue'
import * as microsoftTeams from '@microsoft/teams-js'

const loadImage = (src, fixHeight) => {
  if(!src){
    return fixHeight
  }
  return new Promise((resolve, reject) => {
    let img = new Image()
    img.src = src
    img.onload = () => resolve(img.width * (fixHeight / img.height))
  })
}

export default {
  components: {
    meditag,
    txdetailmodal,
  },
  props: {
    selectedTx: {
      type: Object,
      required: true,
    },
    selectedSensor: {
      type: Array,
      default: () => [],
    },
    isShowModal: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      imageHeight: 125,
      popupHeight: this.getPopupHeight(),
      tipHeight: 15,
      imageWidth: 0,
      descriptionWidth: 147,
      meditagWidth: 266,
      blackColor: FONT.COLOR.BLACK,
      inMsTeams: APP.AUTH.USE_AD && BrowserUtil.inIframe(),
      descWidth: 0,
      txDetailLeft: 0,
    }
  },
  computed: {
    enableThumbnail () {
      return !this.isDisableThumbnail()
    },
    descriptionSP() {
      return APP.TXDETAIL.NO_UNREGIST_THUMB ? "descriptionSPNoThumbnail" : "descriptionSP"
    },
    descriptionStyle() {
      const imageWidth = this.selectedSensor.length == 0 ? this.imageWidth : this.meditagWidt
      const width = this.getDescWidth(imageWidth)
      this.descWidth = width
      const obj = {
        width: width + 'px',
        minWidth: this.descriptionWidth,
      }
      return obj
    },
    txDetailStyle() {
      const imageWidth = this.selectedSensor.length == 0 ? this.imageWidth : this.meditagWidt
      const top = this.getTxDetailTop()
      const left = this.getTxDetailLeft(imageWidth, this.descWidth)
      this.txDetailLeft = left
      const obj = {
        top: top + 'px',
        left: left + 'px',
        backgroundColor: this.selectedSensor.length == 0 ? this.selectedTx.bgColor : this.selectedSensor[0].bg,
        color: this.selectedSensor.length == 0? this.selectedTx.color: this.blackColor,
      }
      return obj
    },
    arrowStyle() {
      const left = this.selectedTx.orgLeft - this.txDetailLeft - 8
      const borderColor = this.selectedSensor.length == 0 ? this.selectedTx.bgColor : this.selectedSensor[0].bg
      let obj = {
          left: left + 'px',
          width: '0px',
          height: '0px',
          borderStyle: 'solid',
      }
      if (this.selectedTx.isAbove) {
        obj.borderTop = '16px solid transparent'
        obj.borderRight = '10px solid transparent'
        obj.borderBottom = '16px solid ' + borderColor
        obj.borderLeft = '10px solid transparent'
      } else {
        obj.borderTop = '16px solid ' + borderColor
        obj.borderRight = '10px solid transparent'
        obj.borderBottom = '16px solid transparent'
        obj.borderLeft = '10px solid transparent'
      }
      return obj
    }
  },
  created() {
    this.setImageWidth()
  },
  mounted() {
    microsoftTeams.initialize()
  },
  methods: {
    getDescWidth(imageWidth) {
      const containerWidth = this.selectedTx.containerWidth
      const items = this.getDispItems()
      const dataLength = items.reduce((accum, e) => {
        return Math.max(accum, e.val.length)
      }, 0)
      const dataWidth = dataLength * 10 // 実際のフォントは13xだが半角も考慮して小さめに設定
      const maxWidth = containerWidth - (imageWidth + 20)
      const width = dataWidth < maxWidth ? dataWidth : maxWidth
      return width
    },
    getTxDetailLeft(imageWidth, descWidth) {
      const containerWidth = this.selectedTx.containerWidth
      let left = this.selectedTx.orgLeft - DISP.TXDETAIL_DIFF
      if (this.selectedSensor.length == 0) {
        const txDetailWidth = imageWidth + this.getDescWidth(imageWidth) + 20
        const over = (left + txDetailWidth) - containerWidth
        if (0 < over) {
          if (containerWidth <= txDetailWidth) {
            left = 0
          } else {
            left = left - over
          }
        }
      } else {
        const over = (left + imageWidth) - containerWidth
        if (0 < over) {
          left = left - over
        }
      }
      return left
    },
    isDisableThumbnail() {
      return APP.TXDETAIL.NO_UNREGIST_THUMB ? !(this.selectedTx.thumbnail.length > 0) : false
    },
    async setImageWidth() {
      this.imageWidth = await loadImage(this.selectedTx.thumbnail, this.imageHeight)
    },
    getDispItems () {
      return APP.TXDETAIL.ITEMS.map(key => {
        return {
          key,
          val: StringUtil.cutOnLong(this.selectedTx[key], APP.TXDETAIL.TEXT_MAX)
        }
      })
    },
    getProhibitAlertHeight () {
      const prohibitMessageElement= document.getElementsByClassName('alert-dismissible')[0]
      const resultHeight = prohibitMessageElement? prohibitMessageElement.offsetHeight : 0
      return resultHeight
    },
    getTxDetailTop() {
      const txR = DISP.TX.R * this.selectedTx.scale
      const height = this.getPopupHeight() // ポップアップの高さ
      let top = this.selectedTx.orgTop - height - txR
      //top += this.getProhibitAlertHeight()
      return top
    },
    getPopupHeight() {
      return this.selectedSensor.length == 0 ? DISP.TXDETAIL_POPUP_SIZE : DISP.TXMEDITAG_POPUP_SIZE
    },
    drawShadow(color){
      return NumberUtil.luminance(ColorUtil.colorCd4db(color)) > 240
    },
    moveToChat(evt) {
      evt.stopPropagation()
      if (!this.selectedTx.potCd) {
        return
      }
      microsoftTeams.executeDeepLink(`https://teams.microsoft.com/l/chat/0/0?users=${this.selectedTx.potCd}`)
    },
  },
}
</script>

<style scoped lang="scss">
@import "../../sub/constant/config.scss";
@import "../../sub/constant/browser.scss";

.balloon {
  position: absolute;
  padding: 0px;
  z-index: 5;
  max-height: 135px;
}
.balloon::before {
  content: '';
  position: absolute;
  z-index: 6;
  width: 20px;
  height: 20px;
}
.balloon::after {
  content: '';
  position: absolute;
  z-index: 7;
  top: 0; left: 0;
  width: 100%;
  height: 100%;
}
.balloon>* {
  position: relative;
  z-index: 8;
}
.balloon,
.balloon::after {
  border-radius: 5px;
}
.balloon,
.balloon::before {
  box-shadow: 0 0 20px 0 rgba(0,0,0,0.8);
}
.balloon,
.balloon::before,
.balloon::after {
  background-color: inherit;
}

.potBox {
  padding: 5px;
  overflow: hidden;
  border-radius: 3px;
  font-size: 13px;
  display: flex;
  flex-direction: column;
}

@media screen\0 {	
  .potBox {
    padding: 3px;
	}	
}

.clearfix:after {
  content: "";
  display: block;
  clear: both;
}

.description {
  float: left;
  height: 125px;
  font-weight: bold;
  padding-left: 10px;
  overflow-y: scroll;
  word-wrap: break-word;
  word-break: break-all;
  -ms-overflow-style: none;
}
.descriptionSP {
  float: left;
  width: 50%;
  height: 150px;
  font-weight: bold;
  padding-left: 10px;
  overflow-y: scroll;
}

.descriptionSPNoThumnail {
  float: left;
  height: 150px;
  font-weight: bold;
  overflow-y: scroll;
}

.thumbnail {
  float: left;
  vertical-align: middle;
}

.thumbnail-modal {
  width: 50%;
  margin: auto;
}
</style>