<template>
  <transition-group tag="div">
    <div v-for="val in sensors" :key="val.btx_id" class="personBox" :style="{'background-color': val.bg, 'border': border, 'border-color': (new Date().getTime() - val.downLatest < DOWN_RED_TIME)?'red':'white'}">
      <div class="personBoxRow">
        <div class="numberBox">{{ val.label }}</div>
        <div class="presBox personBoxRow">
          <div class="pres"><div v-t="'label.h_blood_pressure'"></div><div class="numval">{{val.high}}</div></div>
          <div class="pres"><div v-t="'label.l_blood_pressure'"></div><div class="numval">{{val.low}}</div></div>
        </div>
      </div>
      <div class="personBoxRow">
        <div class="smallBox"><div><img src="~/assets/icon/beat.svg" width="32" height="32"></div><div class="numval">{{val.beat}}</div><div v-t="'label.heart_rate'"></div></div>
        <div class="smallBox" style="min-width: 84px;"><div><img src="~/assets/icon/step.svg" width="32" height="32"></div><div class="numval" :style="{'font-size': val.step > 999999? '1.3em': val.step > 9999? '1.5em': '1.8em'}">{{val.step}}</div><div v-t="'label.step'"></div></div>
        <div class="smallBox"><div><img src="~/assets/icon/down.svg" width="32" height="32"></div><div class="numval">{{val.down}}</div><div v-t="'label.down_count'"></div></div>
      </div>
    </div>
  </transition-group>
</template>

<script>
import { DISP } from '../sub/constant/config'

export default {
  props: ['sensors', 'isPopup'],
  data() {
    return {
      DOWN_RED_TIME: DISP.DOWN_RED_TIME,
    }
  },
  computed: {
    border() {
      return this.isPopup? '0px': '3px solid #ffffff'
    }
  }
}
</script>

<style scoped lang="scss">

.personBox {
  padding: 3px 3px 3px 15px;
  overflow: hidden;
  border: 3px solid #ffffff;
  border-radius: 3px;
  font-size: 0.9em;
  color: #000;
  display: flex;
  flex-direction: column;
  .personBoxRow {
    display: flex;
    flex-direction: row;
  }
  // margin-bottom: 15px;
}

@media screen\0 {	
  .personBox {
    padding: 3px;
	}	
}

.numberBox {
  float: left;
  border: solid 1px #3612d4;
  background-color: #ffffff;
  border-radius: 5.0vmin;
  text-align: center;
  line-height: 30px;
  font-size: 2.5vmin;
  font-weight: bolder;
  padding: 3px;
  width: 40px;
  height: 40px;
  margin: 8px;
}

.presBox {
  float: left;
  border: solid 1px #3612d4;
  background-color: #ffffff;
  border-radius: 7px;
  padding: 5px 5px 0px 5px;
  margin: 5px 5px 5px 30px;
}

.pres {
  float: left;
  background-color: #ffffff;
  text-align: center;
  padding: 3px;
  margin: 3px;
}

.numval {
  font-size: 1.8em;
  padding: 1px 1px;
}

.smallBox {
  float: left;
  border: solid 1px #3612d4;
  background-color: #ffffff;
  border-radius: 7px;
  padding: 3px 8px;
  margin: 7px;
  div {
    text-align: center;
  }
}

.v-move {
  transition: transform 1.5s;
}
</style>