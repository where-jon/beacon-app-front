<template>
  <!-- <div :class="selectedTx.class" :style="{left: selectedTx.left+'px', top: selectedTx.top+'px'}"> -->
  <div
  :class="'balloon ' + selectedTx.class"
  :style="{
    left: this.selectedTx.left + 'px',
    top: this.selectedTx.top +'px',
    backgroundColor: this.selectedTx.bgColor,
    color: this.selectedTx.color,
  }">
    <div class="potBox" @click="$emit('resetDetail')">
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
  </div>
</template>

<script>
import { DISP, TXDETAIL_ITEMS } from '../sub/constant/config'

export default {
  props: ['selectedTx'],
  data() {
    return {
    }
  },
  computed: {
    styles () {
      return {
        left: this.selectedTx.left + 'px',
        top: this.selectedTx.top +'px',
        '--border': '3px solid ' + this.selectedTx.bgColor,
        '--borderBottom': '15px solid ' + this.selectedTx.bgColor,
        '--bgColor': this.selectedTx.bgColor,
        '--boxShadow': '0px 0px 10px 0px black',
        '--color': this.selectedTx.color,
      }
    }
  },
  methods: {
    getDispItems () {
      const that = this
      return TXDETAIL_ITEMS
      .filter((e) => {
        return e.disp
      })
      .map((e) => {return that.selectedTx[e.name]})
    }
  },
  mounted () {
    console.log('@@@@ ' + this.selectedTx.class)
  }
}
</script>

<style scoped lang="scss">
@import "../sub/constant/config.scss";

/* 吹き出し・全共通 */
.balloon {
  position: absolute;
  padding: 5px;
}
.balloon::before {
  content: '';
  position: absolute;
  z-index: 1;
  width: 20px;
  height: 20px; /* 吹き出しサイズ */
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
  border-radius: 5px; /* 角の丸め方 */
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
  left: 15px; /* 位置 */
  transform: rotate(45deg) skew(10deg,10deg); /* 傾斜角(skew) */
}

/* 吹き出し・下辺左側 */
.balloon-u::before {
  bottom: -8px;
  left: 15px; /* 位置 */
  transform: rotate(45deg) skew(10deg,10deg); /* 傾斜角(skew) */
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