<template>
    <div class="personBox" :style="{'background-color': 'white'}" @click="$emit('resetDetail')">
      <div>詳細情報＝{{ txInfo }} これから実装
      </div>
    </div>
</template>

<script>
import { DISP } from '../sub/constant/config'

export default {
  props: ['txInfo'],
  data() {
    return {
    }
  }
}
</script>

<style scoped lang="scss">
@import "../sub/constant/config.scss";

.personBox {
  padding: 3px 3px 3px 15px;
  overflow: hidden;
  border: 3px solid $txdetail-bg;
  background-color: $txdetail-bg;
  border-radius: 3px;
  font-size: 0.9em;
  width: 150px;
  height: 150px;
  display: flex;
  flex-direction: column;
}

@media screen\0 {	
  .personBox {
    padding: 3px;
	}	
}


</style>