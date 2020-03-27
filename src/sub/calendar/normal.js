import moment from 'moment'
import { PLAN_TARGET_TYPE } from '../constant/Constants'

export function loadTimeLine(data, currentUser, dupMessage, basicColorMap) {
  const planMap = {}
  const timeLineMap = {}
  data.forEach(plansOfPot => {
    const potId = plansOfPot.potId
    plansOfPot.plans.forEach(plan => {
      const id = potId ? `${potId}_${plan.planId}` : plan.planId
      let location = null
      const attendees = []
      let thing = null
      let hasDup = false
      const mDt = moment(plan.startDt).format('YYYYMMDD')
      plan.details.forEach(pd => {
        if (pd.isDuplicate) {
          hasDup = true
        }
        switch (pd.targetType) {
          case PLAN_TARGET_TYPE.ZONE:
            location = pd.isDuplicate ? `${pd.zoneName}(${dupMessage})` : pd.zoneName
            break
          case PLAN_TARGET_TYPE.LOCATION:
            location = pd.isDuplicate ? `${pd.locationName}(${dupMessage})` : pd.locationName
            break
          case PLAN_TARGET_TYPE.POT_PERSON:
            const potName = pd.isDuplicate ? `${pd.potName}(${dupMessage})` : pd.potName
            attendees.push(potName)
            break
          default:
            thing = pd.isDuplicate ? `${pd.potName}(${dupMessage})` : pd.potName
        }
      })
      if (!timeLineMap.hasOwnProperty(mDt)) {
        timeLineMap[mDt] = []
      }

      const basicColor = basicColorMap[potId]
      const basicColorAlpha = basicColor.alpha(0.25)
      const color = basicColor.darken()

      const isReadOnly = currentUser.isAd
        ? currentUser.adPot.potId != plan.userPotId
        : currentUser.userId != plan.userId

      // from [tui-calendar] src/js/model/schedule.js
      const card =  {
        id: id,
        calendarId: potId,
        title: plan.planName,
        start: new Date(plan.startDt),
        end: new Date(plan.endDt),
        basicColor: basicColor,
        color: color,
        bgColor: basicColorAlpha,
        dragBgColor: basicColorAlpha,
        isReadOnly: isReadOnly,
        location: location,
        attendees: attendees,
        thing: thing,
        body: plan.description,
        hasDup: hasDup,
        data: plan
      } 
      planMap[id] = card
      timeLineMap[mDt].push(card)
    })
  })
  return [planMap, timeLineMap]
}