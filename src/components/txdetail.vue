<template>
  <div :class="selectedTx.class" :style="{left: selectedTx.left+'px', top: selectedTx.top+'px'}">
    <div class="potBox" @click="$emit('resetDetail')">
      <div class="clearfix">
        <div class="thumbnail">
          <img :src="selectedTx.thumbnail" width="auto" height="125" v-if="selectedTx.thumbnail.length > 0" />
          <img src="/default.png" width="auto" height="116" v-else />
        </div>
        <div class="description">
          <div v-for="(item, index) in getDispItems()" :key="index">{{ item }}</div>
          <!--
          No.{{ selectedTx.no }} <br />
          {{ selectedTx.name }}<br />
          {{ selectedTx.category }}<br />
          {{ selectedTx.group }}<br />
          {{ getFinalReceiveTime(selectedTx.timestamp) }}<br />
          -->
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
  methods: {
    getDispItems () {
      const that = this
      return TXDETAIL_ITEMS
      .filter((e) => {
        return e.disp
      })
      .map((e) => {return that.selectedTx[e.name]})
    }
  }
}
</script>

<style scoped lang="scss">
@import "../sub/constant/config.scss";

.potBox {
  padding: 5px;
  overflow: hidden;
  border: 3px solid $txdetail-bg;
  background-color: $txdetail-bg;
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
  box-shadow: 0px 0px 10px 0px $txdetail-bg; 
}

.balloon-before {
  content: '';
  position: absolute;
  display: block;
  width: 0;
  height: 0;
}

.balloon::before {
  @extend .balloon-before;
  left: 20px;
  top: -15px;
  border-right: 15px solid transparent;
  border-bottom: 15px solid $txdetail-bg;
  border-left: 15px solid transparent;
}

.balloon-u::before {
  @extend .balloon-before;
  left: 27px;
  bottom: -15px;
  border-top: 15px solid $txdetail-bg;
  border-right: 15px solid transparent;
  border-left: 15px solid transparent;
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
  color: #444;
  font-weight: bold;
  padding-left: 10px;
}

.thumbnail {
  float: left;
  vertical-align: middle;
}


</style>