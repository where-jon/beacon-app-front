<template>
  <div>
    <div
    id="txDetail"
    :class="'balloon ' + getClass()"
    :style="{
        left: getLeft(),
        top: getTop(),
        backgroundColor: this.selectedSensor.length == 0 ? this.selectedTx.bgColor : this.selectedSensor[0].bg,
        color: this.selectedTx.color,
      }"
    v-if="!isShowModal"
    >
      <div class="potBox" @click="$emit('resetDetail')" v-if="selectedSensor.length == 0">
        <div class="clearfix">
          <div class="thumbnail">
            <img id="img" :src="selectedTx.thumbnail" width="auto" :height="imageHeight" v-if="selectedTx.thumbnail.length > 0" />
            <img src="/default.png" width="auto" height="116" v-else />
          </div>
          <div class="description">
            <div v-for="(item, index) in getDispItems()" :key="index">{{ item }}</div>
          </div>
        </div>
      </div>
      <sensor :sensors="selectedSensor" isPopup="true" />
    </div>
    <txdetailmodal
    :bgColor="selectedSensor.length == 0 ? this.selectedTx.bgColor : this.selectedSensor[0].bg"
    :color="this.selectedTx.color"
    v-else>
      <div class="clearfix" :style="{backgroundColor: this.selectedTx.bgColor}" v-if="selectedSensor.length == 0">
        <div class="thumbnail">
          <img :src="selectedTx.thumbnail" width="auto" height="125" v-if="selectedTx.thumbnail.length > 0" />
          <img src="/default.png" width="auto" height="116" v-else />
        </div>
        <div class="description">
          <div v-for="(item, index) in getDispItems()" :key="index">{{ item }}</div>
        </div>
      </div>
      <sensor :sensors="selectedSensor" isPopup="true" v-else />
    </txdetailmodal >
  </div>
</template>

<script>
import { DISP } from '../../sub/constant/config'
import { getTxDetailItems } from '../../sub/helper/PositionHelper'
import * as HtmlUtil from '../../sub/util/HtmlUtil'
import sensor from './sensor.vue'
import txdetailmodal from './txdetailmodal.vue'

const loadImage = (src, fixHeight) => {
  return new Promise((resolve, reject) => {
    let img = new Image()
    img.src = src
    img.onload = () => resolve(img.width * (fixHeight / img.height))
  })
}

export default {
  props: {
    selectedTx: {
      type: Object,
    },
    selectedSensor: {
      type: Array,
    },
    isShowModal: {
      type: Boolean,
      default: false
    }
  },
  components: {
    'sensor': sensor,
    txdetailmodal,
  },
  data() {
    return {
      imageHeight: 125,
      popupHeight: this.getPopupHeight(),
      tipHeight: 15,
      imageWidth: 0,
      descriptionWidth: 143,
      left: 0,
      meditagWidth: 266,
    }
  },
  updated() {
    this.popupHeight = this.getPopupHeight()
    this.left = this.getLeft()
  },
  methods: {
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
      return Object.keys(DISP.TXDETAIL_ITEMS)
      .filter((key) => DISP.TXDETAIL_ITEMS[key])
      .map((e) => this.selectedTx[e])
    },
    getLeft() {
      this.setImageWidth()
      const isOut = this.isOutOfFrame()
      const left = !isOut ? this.selectedTx.orgLeft - DISP.TX_R : (this.selectedTx.orgLeft - (this.descriptionWidth + this.imageWidth))
      return left + 'px'
    },
    getTop() {
      const top = !this.isAbove ? (this.selectedTx.orgTop - this.popupHeight - DISP.TX_R - this.tipHeight) :
      this.selectedTx.orgTop + DISP.TX_R + this.tipHeight
      return top + 'px'
    },
    getClass() {
      const isOut = this.isOutOfFrame()
      if (this.isAbove) {
        return !isOut ? 'balloon-b' : 'balloon-br'
      }
      return !isOut ? 'balloon-u' : 'balloon-ur'
    },
    getPopupHeight() {
      return this.selectedSensor.length == 0 ? 135 : 211
    },
  },
}
</script>

<style scoped lang="scss">
@import "../../sub/constant/config.scss";

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
  width: 160px;
  font-weight: bold;
  padding-left: 10px;
}

.thumbnail {
  float: left;
  vertical-align: middle;
}
</style>