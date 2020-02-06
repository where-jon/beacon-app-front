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
      let hasDup = false
      const attendees = []
      const mDt = moment(plan.startDt).format('YYYYMMDD')
      plan.details.forEach(pd => {
        if (!hasDup) {
          hasDup = pd.isDuplicate
        } 
        location = pd.zoneName ? pd.zoneName : pd.locationName 
        switch (pd.targetType) {
          case PLAN_TARGET_TYPE.POT_PERSON:
            attendees.push(pd.potName)
            break
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
        body: plan.description,
        dupMessage: dupMessage,
        data: plan
      } 
      planMap[id] = card
      timeLineMap[mDt].push(card)
    })
  })
  return [planMap, timeLineMap]
}