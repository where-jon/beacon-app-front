<template>
  <div>
    <div
    :class="'balloon ' + selectedTx.class"
    :style="{
        left: this.selectedTx.left + 'px',
        top: this.selectedTx.top +'px',
        backgroundColor: this.selectedTx.bgColor,
        color: this.selectedTx.color,
      }"
    v-if="!isShowModal"
    >
      <div class="potBox" @click="$emit('resetDetail')" v-if="selectedSensor.length == 0">
        <div class="clearfix">
          <div class="thumbnail">
            <img :src="selectedTx.thumbnail" width="auto" height="125" v-if="selectedTx.thumbnail.length > 0" />
            <img src="/default.png" width="auto" height="116" v-else />
          </div>
          <div class="description">
            <div v-for="(item, index) in getDispItems()" :key="index">{{ item }}</div>
          </div>
        </div>
      </div>
      <sensor :sensors="selectedSensor" isPopup="true" />
    </div>
    <txdetailmodal :bgColor="this.selectedTx.bgColor" :color="this.selectedTx.color" v-else>
      <div class="clearfix" :style="{backgroundColor: this.selectedTx.bgColor}">
        <div class="thumbnail">
          <img :src="selectedTx.thumbnail" width="auto" height="125" v-if="selectedTx.thumbnail.length > 0" />
          <img src="/default.png" width="auto" height="116" v-else />
        </div>
        <div class="description">
          <div v-for="(item, index) in getDispItems()" :key="index">{{ item }}</div>
        </div>
      </div>
    </txdetailmodal >
  </div>
</template>

<script>
import { DISP } from '../../sub/constant/config'
import { getTxDetailItems } from '../../sub/helper/PositionHelper'
import sensor from './sensor.vue'
import txdetailmodal from './txdetailmodal.vue'

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
      myclass: ['myclass'],
      bodyBgVariant: 'success'
    }
  },
  methods: {
    getDispItems () {
      return Object.keys(DISP.TXDETAIL_ITEMS)
      .filter((key) => DISP.TXDETAIL_ITEMS[key])
      .map((e) => this.selectedTx[e])
    }
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
  font-weight: bold;
  padding-left: 10px;
}

.thumbnail {
  float: left;
  vertical-align: middle;
}
</style>