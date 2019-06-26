<template>
  <transition-group tag="div">
    <div v-for="val in sensors" :key="val.btx_id" :style="{'background-color': val.bg, 'border': border, 'border-color': (new Date().getTime() - val.downLatest < DOWN_RED_TIME)?'red':'white'}" class="personBox">
      <div class="personUpperBox">
        <div class="titleBox">
          <div :style="{'font-size': val.label.length > 2? '0.8em': '1.2em'}" class="numberBox">
            {{ val.label }}
          </div>
        </div>
        <div class="presBox">
          <div class="pres high">
            <div v-t="'label.h_blood_pressure'" /><div class="numval">
              {{ val.high }}
            </div>
          </div>
          <div class="pres low">
            <div v-t="'label.l_blood_pressure'" /><div class="numval">
              {{ val.low }}
            </div>
          </div>
        </div>
      </div>
      <div class="personUnderBox">
        <div class="smallBox beat">
          <div><img src="~/assets/icon/beat.svg" width="32" height="32"></div><div class="numval">
            {{ val.beat }}
          </div><div v-t="'label.heart_rate'" class="title" />
        </div>
        <div class="smallBox step" style="min-width: 84px;">
          <div><img src="~/assets/icon/step.svg" width="32" height="32"></div><div :style="{'font-size': val.step > 999999? '1.5em': '1.8em'}" class="numval">
            {{ val.step }}
          </div><div v-t="'label.step'" class="title" />
        </div>
        <div class="smallBox down">
          <div><img src="~/assets/icon/down.svg" width="32" height="32"></div><div class="numval">
            {{ val.down }}
          </div><div v-t="'label.down_count'" class="title" />
        </div>
      </div>
    </div>
  </transition-group>
</template>

<script>
import { APP } from '../../sub/constant/config'

export default {
  props: {
    sensors: {
      type: Array,
      required: true,
    },
    isPopup: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      DOWN_RED_TIME: APP.SENSOR.MEDITAG.DOWN_RED_TIME,
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
  display: -ms-flexbox;
  .personUpperBox {
    flex-direction: row;
    grid-template-columns: 1.1fr 2.4fr;
    display: grid;
    display: -ms-grid;
    -ms-grid-columns: 1.1fr 2.4fr;
  }
  .personUnderBox {
    flex-direction: row;
    grid-template-columns: 1.1fr 1.3fr 1.1fr;
    -ms-grid-columns: 1.1fr 1.3fr 1.1fr;
    display: grid;
    display: -ms-grid;
  }
}

@media screen\0 {	
  .personUpperBox {
    margin: 2px;
    margin-bottom: 0px;
	}
  .personUnderBox {
    margin: 2px;
    margin-top: 0px;
	}	
}

.titleBox {
  float: left;
  display: -ms-grid;
  -ms-grid-columns: 1fr;
  flex-direction: row;
  -ms-grid-column: 1;
  -ms-grid-column-align: start;
  .numberBox {
    align-self: center;
    -ms-grid-column-align: center;
    background-color: #ffffff;
    border-radius: 20px;
    text-align: center;
    line-height: 30px;
    font-weight: bolder;
    width: 40px;
    height: 40px;
    margin: 5px;
    display: table-cell;
    vertical-align: middle;
  }
}

.presBox {
  grid-template-columns: 1fr 1fr;
  -ms-grid-columns: 1fr 1fr;
  float: left;
  display: -ms-grid;
  display: grid;
  border: solid 1px #646464;
  background-color: #ffffff;
  border-radius: 7px;
  padding: 5px 1px 0px 1px;
  margin: 4px;
  flex-direction: row;
  -ms-grid-column: 2;
  .pres {
    float: left;
    grid-template-rows: 1fr 1fr;
    -ms-grid-rows: 1fr 1fr;
    -ms-grid-column-align: center;
    text-align: center;
    padding: 3px;
    div {
      display: grid;
      text-align: center;
    }
  }
  .pres.high {
    -ms-grid-column: 1;
  }
  .pres.low {
    -ms-grid-column: 2;
  }
}

.numval {
  font-size: 1.8em;
  padding: 1px 1px;
}

.smallBox {
  float: left;
  grid-template-columns: 1fr 1fr 1fr;
  -ms-grid-columns: 1fr 1fr 1fr;
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

.smallBox.beat {
  -ms-grid-column: 1;
}

.smallBox.step {
  -ms-grid-column: 2;
}

.smallBox.down {
  -ms-grid-column: 3;
}


.v-move {
  transition: transform 1.5s;
}
</style>