<template>
  <transition-group tag="div">
    <div v-for="val in sensors" :key="val.btx_id" class="personBox" :style="{'background-color': val.bg, 'border': border, 'border-color': (new Date().getTime() - val.downLatest < DOWN_RED_TIME)?'red':'white'}">
      <div class="personUpperBox">
        <div class="titleBox">
          <div class="numberBox">{{ val.label }}</div>
        </div>
        <div class="presBox">
          <div class="pres"><div v-t="'label.h_blood_pressure'"></div><div class="numval">{{val.high}}</div></div>
          <div class="pres"><div v-t="'label.l_blood_pressure'"></div><div class="numval">{{val.low}}</div></div>
        </div>
      </div>
      <div class="personUnderBox">
        <div class="smallBox"><div><img src="~/assets/icon/beat.svg" width="32" height="32"></div><div class="numval">{{val.beat}}</div><div class="title" v-t="'label.heart_rate'"></div></div>
        <div class="smallBox" style="min-width: 84px;"><div><img src="~/assets/icon/step.svg" width="32" height="32"></div><div class="numval" :style="{'font-size': val.step > 999999? '1.5em': '1.8em'}">{{val.step}}</div><div class="title" v-t="'label.step'"></div></div>
        <div class="smallBox"><div><img src="~/assets/icon/down.svg" width="32" height="32"></div><div class="numval">{{val.down}}</div><div class="title" v-t="'label.down_count'"></div></div>
      </div>
    </div>
  </transition-group>
</template>

<script>
import { APP } from '../../sub/constant/config'

export default {
  props: ['sensors', 'isPopup'],
  data() {
    return {
      DOWN_RED_TIME: APP.DOWN_RED_TIME,
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
  box-sizing: border-box;
  padding: 10px 10px 10px 10px;
  overflow: hidden;
  border: 3px solid #ffffff;
  border-radius: 3px;
  font-size: 0.9em;
  flex-direction: column;
  display: flex;
  .personUpperBox {
    flex-direction: row;
    grid-template-columns: 1.1fr 2.4fr;
    display: grid;
  }
  .personUnderBox {
    flex-direction: row;
    grid-template-columns: 1.1fr 1.3fr 1.1fr;
    display: grid;
  }
}

@media screen\0 {	
  .personBox {
    padding: 3px;
	}	
}

.titleBox {
  .numberBox {
    align-self: center;
    background-color: #ffffff;
    border-radius: 5.0vmin;
    text-align: center;
    line-height: 30px;
    font-size: 3vmin;
    font-weight: bolder;
    padding: 3px;
    width: 40px;
    height: 40px;
    margin: 5px;
  }
}

.presBox {
  grid-template-columns: 1fr 1fr;
  float: left;
  display: grid;
  border: solid 1px #646464;
  background-color: #ffffff;
  border-radius: 7px;
  padding: 5px 5px 0px 5px;
  margin: 4px;
  flex-direction: row;
  .pres {
    float: left;
    grid-template-rows: 1fr 1fr;
    background-color: #ffffff;
    text-align: center;
    padding: 3px;
    div {
      display: grid;
      text-align: center;
    }
  }
}

.numval {
  font-size: 1.8em;
  padding: 1px 1px;
}

.smallBox {
  float: left;
  grid-template-columns: 1fr 1fr 1fr;
  border: solid 1px #646464;
  background-color: #ffffff;
  border-radius: 7px;
  padding: 6px;
  margin: 4px;
  div{
    display: grid;
    text-align: center;
    img {
      display: block;
      margin-left: auto;
      margin-right: auto;
    }
  }
  div.title {
    line-height: 1.3;
  }
}


.v-move {
  transition: transform 1.5s;
}
</style>