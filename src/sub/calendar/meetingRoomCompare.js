import moment from 'moment'
import {DISP} from '../constant/config'

export function loadTimeLine(data) {
  const planMap = {}
  const timeLineMap = {}
  const timeFormat = 'HH:mm'
  data.forEach(zone => {
    if (!timeLineMap.hasOwnProperty(zone.zoneId)) {
      timeLineMap[zone.zoneId] = []
    }
    zone.plans.forEach(plan => {
      let ipId = 1
      let npId = 1
      let preIpEnd = plan.startDt
      const inPlanPersons = []
      let inPlanThing = null
      plan.inPlans.forEach(ip => {
        if (ip.potCategoryType == 2) {
          const obj = {
            id: `ip-${ipId}`,
            start: ip.startDt,
            end: ip.endDt,
            color: DISP.PLAN.ACTUAL_IN_PLAN_BG_COLOR,
            potId: ip.potId,
            potName: ip.potName,
            potCategoryType: ip.potCategoryType
          }
          obj.range = `${moment(obj.start).format(timeFormat)} - ${moment(obj.end).format(timeFormat)}`
          inPlanThing = obj
          return
        }
        if (preIpEnd < ip.startDt) {
          const obj = {
            id: `np-${npId}`,
            start: preIpEnd,
            end: moment(ip.startDt).add(-1, 's').valueOf(),
            color: DISP.PLAN.NO_ACTUAL_IN_PLAN_BG_COLOR,
            potName: '-'
          }
          obj.range = `${moment(obj.start).format(timeFormat)} - ${moment(obj.end).format(timeFormat)}`
          obj.title = `[${plan.planName}] ${obj.range}`
          inPlanPersons.push(obj)
          ++npId
        }
        const obj = {
          id: `ip-${ipId}`,
          start: ip.startDt,
          end: ip.endDt,
          color: DISP.PLAN.ACTUAL_IN_PLAN_BG_COLOR,
          potId: ip.potId,
          potName: ip.potName,
          potCategoryType: ip.potCategoryType
        }
        obj.range = `${moment(obj.start).format(timeFormat)} - ${moment(obj.end).format(timeFormat)}`
        obj.title = `[${plan.planName}] ${obj.range}`
        inPlanPersons.push(obj)
        ++ipId
        preIpEnd = moment(ip.endDt).add(1, 's').valueOf()
      })
      const potPersons = plan.pots.filter(e => e.third == 1).map(e => e.second).join(',')
      const potThing = plan.pots.filter(e => e.third == 2).map(e => e.second).join(',')
      const card =  {
        id: `p-${plan.planId}`,
        title: plan.planName,
        start: new Date(plan.startDt),
        end: new Date(plan.endDt),
        color: DISP.PLAN.PLAN_COLOR,
        bgColor: DISP.PLAN.NO_ACTUAL_IN_PLAN_BG_COLOR,
        dragBgColor: DISP.PLAN.NO_ACTUAL_IN_PLAN_BG_COLOR,
        location: '',
        potPersons: potPersons,
        potThing: potThing ? potThing : '-',
        body: '',
        inPlanPersons: inPlanPersons,
        inPlanThing: inPlanThing,
        data: plan
      }
      planMap[card.id] = card
      timeLineMap[zone.zoneId].push(card)
    })
    let opId = 1
    zone.outOfPlans.forEach(out => {
      const outOfPlanPersons = []
      const outOfPlanThings = []
      out.actuals.forEach(actual => {
        const obj = {
          start: actual.startDt,
          end: actual.endDt,
          potId: actual.potId,
          potName: actual.potName,
          potCategoryType: actual.potCategoryType
        }
        obj.range = `${moment(obj.start).format(timeFormat)} - ${moment(obj.end).format(timeFormat)}`
        obj.title = `[${zone.zoneName}] ${obj.range}`

        if (obj.potCategoryType == 1) {
          outOfPlanPersons.push(obj)
        } else {
          outOfPlanThings.push(obj)
        }
      })
      const card =  {
        id: `op-${opId}`,
        title: zone.zoneName,
        start: new Date(out.startDt),
        end: new Date(out.endDt),
        color: DISP.PLAN.PLAN_COLOR,
        bgColor: DISP.PLAN.ACTUAL_OUT_OF_PLAN_BG_COLOR,
        dragBgColor: DISP.PLAN.ACTUAL_OUT_OF_PLAN_BG_COLOR,
        location: '',
        attendees: [],
        body: '',
        outOfPlanPersons: outOfPlanPersons,
        outOfPlanThings: outOfPlanThings,
      }
      card.title = `${moment(card.start).format(timeFormat)} - ${moment(card.end).format(timeFormat)}`
      planMap[card.id] = card
      timeLineMap[zone.zoneId].push(card)
      ++opId
    })
  })
  return [planMap, timeLineMap]
}