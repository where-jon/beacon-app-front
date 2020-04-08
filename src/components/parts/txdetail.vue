<template>
  <div>
    <div
      v-if="!isShowModal"
      id="txDetail"
      :class="'balloon ' + getClass()"
      :style="{
        left: getLeft(),
        top: getTop(),
        backgroundColor: selectedSensor.length == 0 ? selectedTx.bgColor : selectedSensor[0].bg,
        color: selectedSensor.length == 0? selectedTx.color: blackColor,
      }"
    >
      <div v-if="selectedSensor.length == 0" class="potBox" @click="$emit('resetDetail')">
        <div class="clearfix">
          <div v-if="enableThumbnail" class="thumbnail">
            <img v-if="selectedTx.thumbnail.length > 0" id="img" :src="selectedTx.thumbnail" :height="imageHeight" width="auto">
            <img v-else src="/default.png" width="auto" :height="imageHeight">
          </div>
          <div class="description">
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
    </div>
    <txdetailmodal
      v-else
      :bg-color="selectedSensor.length == 0 ? selectedTx.bgColor : selectedSensor[0].bg"
      :color="selectedSensor.length == 0? selectedTx.color: blackColor"
    >
      <div v-if="selectedSensor.length == 0" :style="{backgroundColor: selectedTx.bgColor}" class="clearfix">
        <div v-if="enableThumbnail" class="thumbnail thumbnail-modal">
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
      left: 0,
      meditagWidth: 266,
      blackColor: FONT.COLOR.BLACK,
      inMsTeams: APP.AUTH.USE_AD && BrowserUtil.inIframe()
    }
  },
  computed: {
    enableThumbnail () {
      return !this.isDisableThumbnail()
    },
    descriptionSP() {
      return APP.TXDETAIL.NO_UNREGIST_THUMB ? "descriptionSPNoThumbnail" : "descriptionSP"
    }
  },
  mounted() {
    microsoftTeams.initialize()
  },
  updated() {
    this.popupHeight = this.getPopupHeight()
    this.left = this.getLeft()
  },
  methods: {
    isDisableThumbnail() {
      return APP.TXDETAIL.NO_UNREGIST_THUMB ? !(this.selectedTx.thumbnail.length > 0) : false
    },
    async setImageWidth() {
      this.imageWidth = await loadImage(this.selectedTx.thumbnail, this.imageHeight)
    },
    isOutOfFrame() {
      const containerWidth = this.selectedTx.containerWidth - 45
      if (this.selectedSensor.length == 0) {
        this.setImageWidth()
        return containerWidth <= this.selectedTx.orgLeft + this.descriptionWidth + this.imageWidth
      }
      // Meditagの場合
      return containerWidth <= this.selectedTx.orgLeft + this.meditagWidth
    },
    getDispItems () {
      return APP.TXDETAIL.ITEMS.map(key => {
        return {
          key,
          val: StringUtil.cutOnLongByte(this.selectedTx[key], 38)
        }
      })
    },
    getProhibitAlertHeight () {
      const prohibitMessageElement= document.getElementsByClassName('alert-dismissible')[0]
      const resultHeight = prohibitMessageElement? prohibitMessageElement.offsetHeight : 0
      return resultHeight
    },
    getLeft() {
      this.setImageWidth()
      const isOut = this.isOutOfFrame()
      const imageWidth = this.isDisableThumbnail()? 0 : this.imageWidth
      const left = !isOut ? this.selectedTx.orgLeft - DISP.TXDETAIL_DIFF : 
        this.selectedSensor.length == 0? (this.selectedTx.orgLeft - (this.descriptionWidth + imageWidth)): this.selectedTx.orgLeft + DISP.TX.R - this.meditagWidth
      return left + 'px'
    },
    getTop() {
      const txR = DISP.TX.R * this.selectedTx.scale
      const height = this.getPopupHeight() // ポップアップの高さ
      let top = this.selectedTx.orgTop - height - txR
      //top += this.getProhibitAlertHeight()
      return top + 'px'
    },
    getClass() {
      const isOut = this.isOutOfFrame()
      if (this.selectedTx.isAbove) {
        return !isOut ? 'balloon-b' : 'balloon-br'
      }
      return !isOut ? 'balloon-u' : 'balloon-ur'
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
}
.balloon::before {
  content: '';
  position: absolute;
  z-index: 1;
  width: 20px;
  height: 20px;
}
.balloon::after {
  content: '';
  position: absolute;
  z-index: 2;
  top: 0; left: 0;
  width: 100%;
  height: 100%;
}
.balloon>* {
  position: relative;
  z-index: 3;
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

/* 吹き出し・上辺左側 */
.balloon-b::before {
  top: -8px;
  /* 位置 */
  left: 15px;
  /* 傾斜角(skew) */
  transform: rotate(45deg) skew(10deg,10deg);
}

/* 吹き出し・下辺左側 */
.balloon-u::before {
  bottom: -8px;
  /* 位置 */
  left: 15px;
  /* 傾斜角(skew) */
  transform: rotate(45deg) skew(10deg,10deg);
}

/* 下辺右側 */
.balloon-ur::before {
  bottom: -8px;
  right: 15px;
  transform: rotate(45deg) skew(10deg,10deg);
}

/* 上辺右側 */
.balloon-br::before {
  top: -8px;
  right: 15px;
  transform: rotate(45deg) skew(10deg,10deg) translateZ(-1px);
}

.potBox {
  padding: 5px;
  overflow: hidden;
  border-radius: 3px;
  font-size: 0.9em;
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
  width: 170px;
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
}
</style>