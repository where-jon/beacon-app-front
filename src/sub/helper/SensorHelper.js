import { DISCOMFORT } from '../constant/Constants'
import { DISP } from '../constant/config'

export const getDiscomfortColor = (temparature, humidity) => {
  let discomfort = getDiscomfort(temparature, humidity)
  switch (discomfort) {
    case DISCOMFORT.COLD:
      return DISP.DISCOMFORT_COLD
    case DISCOMFORT.COMFORT:
      return DISP.DISCOMFORT_COMFORT
    case DISCOMFORT.HOT:
      return DISP.DISCOMFORT_HOT
  }
}

export const getDiscomfort = (temparature, humidity) => {
  let di = calcDiscomfortIndex(temparature, humidity)
  console.debug({di})
  if (di <= 60) {
    return DISCOMFORT.COLD
  }
  else if (di < 75) {
    return DISCOMFORT.COMFORT
  }
  else {
    return DISCOMFORT.HOT
  }
}

export const calcDiscomfortIndex = (temparature, humidity) => 0.81 * temparature + 0.01 * humidity * (0.99 * temparature - 14.3) + 46.3


