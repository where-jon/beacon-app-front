import { PLAN_TARGET_TYPE } from '../constant/Constants'
import {DISP} from '../constant/config'

export function loadTimeLine(data, currentUser, dupMessage, basicColorMap) {
  const planMap = {}
  const timeLineMap = {}
  data.forEach(plansOfPot => {
    const potId = plansOfPot.potId
    plansOfPot.plans.filter(plan => plan.details.map(pd => pd.categoryCd).includes('MEETING_ROOM'))
    .forEach(plan => {
      const id = potId ? `${potId}_${plan.planId}` : plan.planId
      let location = null
      let zoneId = null
      let hasDup = false
      const attendees = []
      plan.details.forEach(pd => {
        if (!hasDup) {
          hasDup = pd.isDuplicate
        } 
        location = pd.zoneName ? pd.zoneName : pd.locationName 
        switch (pd.targetType) {
          case PLAN_TARGET_TYPE.POT_PERSON:
            attendees.push(pd.potName)
            break
          case PLAN_TARGET_TYPE.ZONE:
            zoneId = pd.zoneId
            break
        }
      })
      if (!timeLineMap.hasOwnProperty(zoneId)) {
        timeLineMap[zoneId] = []
      }

      const basicColor = basicColorMap[potId]
      const basicColorAlpha = basicColor.alpha(0.25)
      const color = basicColor.darken()

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
        isReadOnly: currentUser.userId != plan.userId,
        location: location,
        attendees: attendees,
        body: `[${dupMessage}] ${plan.description}`,
        data: plan
      }
      planMap[card.id] = card
      timeLineMap[zoneId].push(card)
    })
  })
  return [planMap, timeLineMap]
}
