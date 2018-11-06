<template>
  <!-- 吹き出し部分 -->
  <div>
    <div :class="selectedTx.class" :style="{
      padding: '5px',
      top: selectedTx.top +'px',
      left: (selectedTx.left + (selectedTx.class === 'balloon' ? 0 : radiusIcon)) + 'px',
      color: selectedTx.color,
      backgroundColor: selectedTx.bgColor,
      boxShadow: '0px 0px 10px 0px ' + selectedTx.bgColor,
    }" id="popup">
      <div class="potBox" @click="$emit('resetDetail')">
        <div class="clearfix">
          <div class="thumbnail">
            <img :src="selectedTx.thumbnail" width="auto" height="125" v-if="selectedTx.thumbnail.length > 0" />
            <img src="/default.png" width="auto" height="125" v-else />
          </div>
          <div class="description">
            <div v-for="(item, index) in getDispItems()" :key="index">{{ item }}</div>
          </div>
        </div>
      </div>
    </div>
    <!-- アイコン上側に吹き出し表示時の三角(▼) -->
    <div
    v-if="selectedTx.class === 'balloon'"
    :style="{
      position: 'absolute',
      top: (selectedTx.top - 30) +'px',
      left: (selectedTx.left + 10) + 'px',
      width: '15px',
      height: '15px',
      borderTop: '15px solid transparent',
      borderRight: '15px solid transparent',
      borderBottom: '15px solid ' + selectedTx.bgColor,
      borderLeft: '15px solid transparent'
    }"></div>
    <!-- アイコン下側に吹き出し表示時の三角(▲) -->
    <div
    v-else
    :style="{
      position: 'absolute',
      top: (selectedTx.top + 141) +'px',
      left: (selectedTx.left + radiusIcon * 2) + 'px',
      width: '15px',
      height: '15px',
      borderTop: '15px solid ' + selectedTx.bgColor,
      borderRight: '15px solid transparent',
      borderBottom: '15px solid transparent',
      borderLeft: '15px solid transparent'
    }"></div>
  </div>
</template>

<script>
import { DISP, TXDETAIL_ITEMS } from '../sub/constant/config'

export default {
  props: ['selectedTx'],
  data() {
    return {
      radiusIcon: DISP.TX_R / 2,
    }
  },
  methods: {
    getDispItems () {
      return TXDETAIL_ITEMS
      .filter((e) => e.disp)
      .map((e) => this.selectedTx[e.name])
    }
  }
}
</script>

<style scoped lang="scss">
@import "../sub/constant/config.scss";

.potBox {
  padding: 5px;
  overflow: hidden;
  border-radius: 3px;
  font-size: 0.9em;
  display: flex;
  flex-direction: column;
}

/* 吹き出し本体 */
.balloon, .balloon-u {
  position: absolute;
  top: 100px;
  left: 100px;
}

.balloon-before {
  content: '';
  position: absolute;
  display: block;
  width: 0;
  height: 0;
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