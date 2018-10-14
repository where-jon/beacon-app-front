<template>
  <div :class="selectedTx.class" :style="{left: selectedTx.left+'px', top: selectedTx.top+'px'}">
    <div class="potBox" @click="$emit('resetDetail')">
      <div>詳細情報＝これから実装 {{ selectedTx }} 
      </div>
    </div>
  </div>
</template>

<script>
import { DISP } from '../sub/constant/config'

export default {
  props: ['selectedTx'],
  data() {
    return {
    }
  }
}
</script>

<style scoped lang="scss">
@import "../sub/constant/config.scss";

.potBox {
  padding: 3px 3px 3px 15px;
  overflow: hidden;
  border: 3px solid $txdetail-bg;
  background-color: $txdetail-bg;
  border-radius: 3px;
  font-size: 0.9em;
  width: 150px;
  height: 160px;
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


</style>