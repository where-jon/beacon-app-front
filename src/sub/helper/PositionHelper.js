import { EXB, DISP } from '../constant/config'
import styles from '../constant/config.scss'

export const adjustPosition = (positions, ratio, exbs = []) => {
  const ret = []
  exbs.forEach((exb) => {
    let samePos = positions.filter((pos) => pos.pos_id == exb.location.posId)
    if (!samePos || samePos.length == 0) {
      return
    }
    let baseX = exb.location.x * ratio
    let baseY = exb.location.y * ratio
    switch (samePos.length) {
      case 1:
        ret.push({...samePos[0], x: baseX, y: baseY})
        break
      case 2:
        ret.push({...samePos[0], x: baseX - DISP.TX_R / DISP.TX_DIV_2, y: baseY})
        ret.push({...samePos[1], x: baseX + DISP.TX_R / DISP.TX_DIV_2, y: baseY})
        break
      case 3:
        ret.push({...samePos[0], x: baseX - DISP.TX_R / DISP.TX_DIV_3, y: baseY})
        ret.push({...samePos[1], x: baseX, y: baseY})
        ret.push({...samePos[2], x: baseX + DISP.TX_R / DISP.TX_DIV_3, y: baseY})
        break
      case 4:
        ret.push({...samePos[0], x: baseX - DISP.TX_R / DISP.TX_DIV_2, y: baseY - DISP.TX_R / DISP.TX_DIV_2})
        ret.push({...samePos[1], x: baseX + DISP.TX_R / DISP.TX_DIV_2, y: baseY - DISP.TX_R / DISP.TX_DIV_2})
        ret.push({...samePos[2], x: baseX - DISP.TX_R / DISP.TX_DIV_2, y: baseY + DISP.TX_R / DISP.TX_DIV_2})
        ret.push({...samePos[3], x: baseX + DISP.TX_R / DISP.TX_DIV_2, y: baseY + DISP.TX_R / DISP.TX_DIV_2})
        break
      default:
        ret.push({...samePos[0], x: baseX - DISP.TX_R / DISP.TX_DIV_3, y: baseY - DISP.TX_R / DISP.TX_DIV_2})
        ret.push({...samePos[1], x: baseX, y: baseY - DISP.TX_R / DISP.TX_DIV_2})
        ret.push({...samePos[2], x: baseX + DISP.TX_R / DISP.TX_DIV_3, y: baseY - DISP.TX_R / DISP.TX_DIV_2})
        ret.push({...samePos[3], x: baseX - DISP.TX_R / DISP.TX_DIV_3, y: baseY + DISP.TX_R / DISP.TX_DIV_2})
        if (samePos.length <= 6) {
          ret.push({...samePos[4], x: baseX, y: baseY + DISP.TX_R / DISP.TX_DIV_2})
        }
        if (samePos.length == 6) {
          ret.push({...samePos[5], x: baseX + DISP.TX_R / DISP.TX_DIV_3, y: baseY + DISP.TX_R / DISP.TX_DIV_2})
        }
        if (samePos.length > 6) { // 6超の場合、2段目を分割して重ねて表示
          for (let i=4; i < samePos.length; i++) {
            ret.push({...samePos[i], x: baseX - DISP.TX_R / DISP.TX_DIV_3 + DISP.TX_R * 5 / (samePos.length - 3) * (i - 3), y: baseY + DISP.TX_R / DISP.TX_DIV_2})
          }
        }
        break
      }
    })

    return ret
}

