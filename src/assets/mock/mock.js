let now = new Date().getTime()

export const position = []

export const positions_conf = {start: 1536318071987, interval: 6000}
export const positions = [] // TODO: To be modified
positions[0] = [{'btxId':1,'minor':1,'pos_id':3,'deviceId':3,'updatetime':'2018-09-07T11:01:02.114Z','nearest':[{'deviceId':3,'timestamp':1536318062114,'rssi':-61.95289495278382,'place_id':3},{'deviceId':1,'timestamp':1536318063248,'rssi':-68.4930477665437,'place_id':1},{'deviceId':2,'timestamp':1536318063248,'rssi':-70.28672955448882,'place_id':2}],'power_level':100},{'btxId':2,'minor':2,'pos_id':1,'deviceId':1,'updatetime':'2018-09-07T11:01:04.399Z','nearest':[{'deviceId':1,'timestamp':1536318064399,'rssi':-72.6579287696201,'place_id':1},{'deviceId':2,'timestamp':1536318058685,'rssi':-74.77349655378839,'place_id':2},{'deviceId':3,'timestamp':1536318060058,'rssi':-79.28689716924704,'place_id':3}],'power_level':100},{'btxId':3,'minor':3,'pos_id':2,'deviceId':2,'updatetime':'2018-09-07T11:01:03.248Z','nearest':[{'deviceId':2,'timestamp':1536318063248,'rssi':-39.28495023861946,'place_id':2},{'deviceId':1,'timestamp':1536318061365,'rssi':-67.26560049842656,'place_id':1},{'deviceId':3,'timestamp':1536318064399,'rssi':-72.74744968597842,'place_id':3}],'power_level':100},{'btxId':4,'minor':4,'pos_id':3,'deviceId':3,'updatetime':'2018-09-07T11:01:04.399Z','nearest':[{'deviceId':3,'timestamp':1536318064399,'rssi':-45.54802228176176,'place_id':3},{'deviceId':1,'timestamp':1536318064399,'rssi':-73.28311215642759,'place_id':1},{'deviceId':2,'timestamp':1536318063248,'rssi':-74.97000520215018,'place_id':2}],'power_level':100},{'btxId':5,'minor':5,'pos_id':1,'deviceId':1,'updatetime':'2018-09-07T11:01:04.399Z','nearest':[{'deviceId':1,'timestamp':1536318064399,'rssi':-71.92023572660051,'place_id':1},{'deviceId':2,'timestamp':1536318063248,'rssi':-75.86665495653499,'place_id':2},{'deviceId':3,'timestamp':1536318064399,'rssi':-80.04061839683315,'place_id':3}],'power_level':100}]

export const sensor = []

now = new Date().getTime()
sensor[1] = [
  {'deviceId':22017,'timestamp':now,'temperature':15.69,'humidity':52},
  {'deviceId':22018,'timestamp':now,'temperature':26.03,'humidity':90},
  {'deviceId':22019,'timestamp':now,'temperature':25.72,'humidity':51},
  {'deviceId':22020,'timestamp':now,'temperature':35.5,'humidity':51},
  {'deviceId':22021,'timestamp':now,'temperature':26.28,'humidity':11},
  {'deviceId':11,'timestamp':now,'temperature':25.13,'humidity':60},
  {'deviceId':12,'timestamp':now,'temperature':25.08,'humidity':61},
  {'deviceId':13,'timestamp':now,'temperature':24.94,'humidity':61},
  {'deviceId':14,'timestamp':now,'temperature':25,'humidity':61}
]

sensor[2] = [
  {'deviceId':22017,'count':3,'timestamp':now},
  {'deviceId':22018,'count':0,'timestamp':now},
  {'deviceId':22019,'count':2,'timestamp':now},
  {'deviceId':22020,'count':1,'timestamp':now},
  {'deviceId':22021,'count':5,'timestamp':now},
]

sensor[3] = [
  {'deviceId':11,'count':16,'timestamp':now},
  {'deviceId':12,'count':0,'timestamp':now},
  {'deviceId':13,'count':10,'timestamp':now},
  {'deviceId':14,'count':1,'timestamp':now},
  {'deviceId':15,'count':5,'timestamp':now},
]

sensor[5] = [
  {
    'battery_level':97,
    'timestamp':now,
    'step':84,
    'beat':75,
    'stress':4,
    'meshid_major_minor':'00000_2_924',
    'low':80,
    'pressure':1149234187,
    'rssi':-70,
    'measuredPower':-60,
    'high':119,
    'downLatest':now,
    'down':1,
    'type':'meditag',
    'btxId':601
  },
  {
    'battery_level':88,
    'timestamp':now,
    'step':226,
    'beat':0,
    'stress':0,
    'meshid_major_minor':'00000_2_923',
    'low':0,
    'pressure':1149213729,
    'rssi':-48,
    'measuredPower':-60,
    'high':0,
    'downLatest':1542763347060,
    'down':0,
    'type':'meditag',
    'btxId':602
  }
]

export const basic_sensorHistory_1_1_today_hour = {
  month: 10,
  day: 14,
  data:[
    {key:5, temperature:12.2, humidity:30},
    {key:6, temperature:15.2, humidity:40},
    {key:7, temperature:16.2, humidity:50},
    {key:8, temperature:17.2, humidity:60},
    {key:9, temperature:null, humidity:null},
    {key:10, temperature:23.2, humidity:80},
    {key:11, temperature:24.2, humidity:90},
    {key:14, temperature:28.2, humidity:30},
    {key:15, temperature:31.2, humidity:50},
    {key:16, temperature:27.2, humidity:60},
    {key:17, temperature:22.2, humidity:70},
    {key:18, temperature:18.2, humidity:40},
    {key:20, temperature:12.2, humidity:20},
    {key:21, temperature:4.2, humidity:10},
    {key:22, temperature:4.2, humidity:10},
  ]}

export const sensorGraph = () => {
  return {
    minute: sensorGraphMinute(),
    hour: sensorGraphHour(),
    day: sensorGraphDay(),
  }
}

export const sensorGraphMinute = () => {
  return [
    {sensorHistoryId: 1, sensorKey:'2019/1/1 00:10', sensorDt: (new Date('2019/01/01 00:10')).getTime(), temperature:29.0, humidity:48, count: 49, step: 50, beat: 51, stress: 52, low: 53, high: 54, pressure: 55, downLatest: 56, down: 57, magnet: 0},
    {sensorHistoryId: 2, sensorKey:'2019/1/1 00:20', sensorDt: (new Date('2019/01/01 00:20')).getTime(), temperature:29.5, humidity:49, count: 50, step: 51, beat: 52, stress: 53, low: 54, high: 55, pressure: 56, downLatest: 57, down: 58, magnet: 0},
    {sensorHistoryId: 3, sensorKey:'2019/1/1 00:30', sensorDt: (new Date('2019/01/01 00:30')).getTime(), temperature:30.0, humidity:50, count: 51, step: 52, beat: 53, stress: 54, low: 55, high: 56, pressure: 57, downLatest: 58, down: 59, magnet: 4},
    {sensorHistoryId: 4, sensorKey:'2019/1/1 00:40', sensorDt: (new Date('2019/01/01 00:40')).getTime(), temperature:30.5, humidity:51, count: 52, step: 53, beat: 54, stress: 55, low: 56, high: 57, pressure: 58, downLatest: 59, down: 60, magnet: 4},
    {sensorHistoryId: 5, sensorKey:'2019/1/1 00:50', sensorDt: (new Date('2019/01/01 00:50')).getTime(), temperature:31.0, humidity:52, count: 53, step: 54, beat: 55, stress: 56, low: 57, high: 58, pressure: 59, downLatest: 60, down: 61, magnet: 0},

    {sensorHistoryId: 6, sensorKey:'2019/1/1 01:00', sensorDt: (new Date('2019/01/01 01:00')).getTime(), temperature:31.5, humidity:53, count: 54, step: 55, beat: 56, stress: 57, low: 58, high: 59, pressure: 60, downLatest: 61, down: 62, magnet: 4},
    {sensorHistoryId: 7, sensorKey:'2019/1/1 01:10', sensorDt: (new Date('2019/01/01 01:10')).getTime(), temperature:32.0, humidity:54, count: 55, step: 56, beat: 57, stress: 58, low: 59, high: 60, pressure: 61, downLatest: 62, down: 63, magnet: 0},
    {sensorHistoryId: 8, sensorKey:'2019/1/1 01:20', sensorDt: (new Date('2019/01/01 01:20')).getTime(), temperature:32.5, humidity:55, count: 56, step: 57, beat: 58, stress: 59, low: 60, high: 61, pressure: 62, downLatest: 63, down: 64, magnet: 4},
    {sensorHistoryId: 9, sensorKey:'2019/1/1 01:30', sensorDt: (new Date('2019/01/01 01:30')).getTime(), temperature:33.0, humidity:56, count: 57, step: 58, beat: 59, stress: 60, low: 61, high: 62, pressure: 63, downLatest: 64, down: 65, magnet: 0},
    {sensorHistoryId: 10, sensorKey:'2019/1/1 01:40', sensorDt: (new Date('2019/01/01 01:40')).getTime(), temperature:33.5, humidity:57, count: 58, step: 59, beat: 60, stress: 61, low: 62, high: 63, pressure: 64, downLatest: 65, down: 66, magnet: 4},
    {sensorHistoryId: 11, sensorKey:'2019/1/1 01:50', sensorDt: (new Date('2019/01/01 01:50')).getTime(), temperature:10.0, humidity:10, count: 11, step: 12, beat: 13, stress: 14, low: 15, high: 16, pressure: 17, downLatest: 18, down: 19, magnet: 0},

    {sensorHistoryId: 12, sensorKey:'2019/1/1 02:00', sensorDt: (new Date('2019/01/01 02:00')).getTime(), temperature:10.5, humidity:11, count: 12, step: 13, beat: 14, stress: 15, low: 16, high: 17, pressure: 18, downLatest: 19, down: 20, magnet: 0},
    {sensorHistoryId: 13, sensorKey:'2019/1/1 02:10', sensorDt: (new Date('2019/01/01 02:10')).getTime(), temperature:11.0, humidity:12, count: 13, step: 14, beat: 15, stress: 16, low: 17, high: 18, pressure: 19, downLatest: 20, down: 21, magnet: 4},
    {sensorHistoryId: 14, sensorKey:'2019/1/1 02:20', sensorDt: (new Date('2019/01/01 02:20')).getTime(), temperature:11.5, humidity:13, count: 14, step: 15, beat: 16, stress: 17, low: 18, high: 19, pressure: 20, downLatest: 21, down: 22, magnet: 4},
    {sensorHistoryId: 15, sensorKey:'2019/1/1 02:30', sensorDt: (new Date('2019/01/01 02:30')).getTime(), temperature:12.0, humidity:14, count: 15, step: 16, beat: 17, stress: 18, low: 19, high: 20, pressure: 21, downLatest: 22, down: 23, magnet: 0},
    {sensorHistoryId: 16, sensorKey:'2019/1/1 02:40', sensorDt: (new Date('2019/01/01 02:40')).getTime(), temperature:12.5, humidity:15, count: 16, step: 17, beat: 18, stress: 19, low: 20, high: 21, pressure: 22, downLatest: 23, down: 24, magnet: 4},
    {sensorHistoryId: 17, sensorKey:'2019/1/1 02:50', sensorDt: (new Date('2019/01/01 02:50')).getTime(), temperature:13.0, humidity:16, count: 17, step: 18, beat: 19, stress: 20, low: 21, high: 22, pressure: 23, downLatest: 24, down: 25, magnet: 0},
  ]
}

export const sensorGraphHour = () => {
  return [
    {sensorHistoryId: 1, sensorKey:'2019/1/1 19:00', sensorDt: (new Date('2019/01/01 19:00')).getTime(), temperature:29.0, humidity:48, count: 49, step: 50, beat: 51, stress: 52, low: 53, high: 54, pressure: 55, downLatest: 56, down: 57, magnet: 0},
    {sensorHistoryId: 2, sensorKey:'2019/1/1 19:00', sensorDt: (new Date('2019/01/01 19:30')).getTime(), temperature:29.5, humidity:49, count: 50, step: 51, beat: 52, stress: 53, low: 54, high: 55, pressure: 56, downLatest: 57, down: 58, magnet: 0},
    {sensorHistoryId: 3, sensorKey:'2019/1/1 20:00', sensorDt: (new Date('2019/01/01 20:00')).getTime(), temperature:30.0, humidity:50, count: 51, step: 52, beat: 53, stress: 54, low: 55, high: 56, pressure: 57, downLatest: 58, down: 59, magnet: 4},
    {sensorHistoryId: 4, sensorKey:'2019/1/1 20:00', sensorDt: (new Date('2019/01/01 20:30')).getTime(), temperature:30.5, humidity:51, count: 52, step: 53, beat: 54, stress: 55, low: 56, high: 57, pressure: 58, downLatest: 59, down: 60, magnet: 4},
    {sensorHistoryId: 5, sensorKey:'2019/1/1 21:00', sensorDt: (new Date('2019/01/01 21:00')).getTime(), temperature:31.0, humidity:52, count: 53, step: 54, beat: 55, stress: 56, low: 57, high: 58, pressure: 59, downLatest: 60, down: 61, magnet: 0},
    {sensorHistoryId: 6, sensorKey:'2019/1/1 21:00', sensorDt: (new Date('2019/01/01 21:30')).getTime(), temperature:31.5, humidity:53, count: 54, step: 55, beat: 56, stress: 57, low: 58, high: 59, pressure: 60, downLatest: 61, down: 62, magnet: 4},
    {sensorHistoryId: 7, sensorKey:'2019/1/1 22:00', sensorDt: (new Date('2019/01/01 22:00')).getTime(), temperature:32.0, humidity:54, count: 55, step: 56, beat: 57, stress: 58, low: 59, high: 60, pressure: 61, downLatest: 62, down: 63, magnet: 0},
    {sensorHistoryId: 8, sensorKey:'2019/1/1 22:00', sensorDt: (new Date('2019/01/01 22:30')).getTime(), temperature:32.5, humidity:55, count: 56, step: 57, beat: 58, stress: 59, low: 60, high: 61, pressure: 62, downLatest: 63, down: 64, magnet: 4},
    {sensorHistoryId: 9, sensorKey:'2019/1/1 23:00', sensorDt: (new Date('2019/01/01 23:00')).getTime(), temperature:33.0, humidity:56, count: 57, step: 58, beat: 59, stress: 60, low: 61, high: 62, pressure: 63, downLatest: 64, down: 65, magnet: 0},
    {sensorHistoryId: 10, sensorKey:'2019/1/1 23:00', sensorDt: (new Date('2019/01/01 23:30')).getTime(), temperature:33.5, humidity:57, count: 58, step: 59, beat: 60, stress: 61, low: 62, high: 63, pressure: 64, downLatest: 65, down: 66, magnet: 4},

    {sensorHistoryId: 11, sensorKey:'2019/1/2 00:00', sensorDt: (new Date('2019/01/02 00:00')).getTime(), temperature:10.0, humidity:10, count: 11, step: 12, beat: 13, stress: 14, low: 15, high: 16, pressure: 17, downLatest: 18, down: 19, magnet: 0},
    {sensorHistoryId: 12, sensorKey:'2019/1/2 00:00', sensorDt: (new Date('2019/01/02 00:30')).getTime(), temperature:10.5, humidity:11, count: 12, step: 13, beat: 14, stress: 15, low: 16, high: 17, pressure: 18, downLatest: 19, down: 20, magnet: 0},
    {sensorHistoryId: 13, sensorKey:'2019/1/2 01:00', sensorDt: (new Date('2019/01/02 01:00')).getTime(), temperature:11.0, humidity:12, count: 13, step: 14, beat: 15, stress: 16, low: 17, high: 18, pressure: 19, downLatest: 20, down: 21, magnet: 4},
    {sensorHistoryId: 14, sensorKey:'2019/1/2 01:00', sensorDt: (new Date('2019/01/02 01:30')).getTime(), temperature:11.5, humidity:13, count: 14, step: 15, beat: 16, stress: 17, low: 18, high: 19, pressure: 20, downLatest: 21, down: 22, magnet: 4},
    {sensorHistoryId: 15, sensorKey:'2019/1/2 02:00', sensorDt: (new Date('2019/01/02 02:00')).getTime(), temperature:12.0, humidity:14, count: 15, step: 16, beat: 17, stress: 18, low: 19, high: 20, pressure: 21, downLatest: 22, down: 23, magnet: 0},
    {sensorHistoryId: 16, sensorKey:'2019/1/2 02:00', sensorDt: (new Date('2019/01/02 02:30')).getTime(), temperature:12.5, humidity:15, count: 16, step: 17, beat: 18, stress: 19, low: 20, high: 21, pressure: 22, downLatest: 23, down: 24, magnet: 4},
    {sensorHistoryId: 17, sensorKey:'2019/1/2 03:00', sensorDt: (new Date('2019/01/02 03:00')).getTime(), temperature:13.0, humidity:16, count: 17, step: 18, beat: 19, stress: 20, low: 21, high: 22, pressure: 23, downLatest: 24, down: 25, magnet: 0},
  ]
}

export const sensorGraphDay = () => {
  return [
    {sensorHistoryId: 1, sensorKey:'2019/1/1 00:00', sensorDt: (new Date('2019/01/01 00:00')).getTime(), temperature:10.0, humidity:10, count: 11, step: 12, beat: 13, stress: 14, low: 15, high: 16, pressure: 17, downLatest: 18, down: 19, magnet: 0},
    {sensorHistoryId: 2, sensorKey:'2019/1/1 00:00', sensorDt: (new Date('2019/01/01 00:30')).getTime(), temperature:10.5, humidity:11, count: 12, step: 13, beat: 14, stress: 15, low: 16, high: 17, pressure: 18, downLatest: 19, down: 20, magnet: 0},
    {sensorHistoryId: 3, sensorKey:'2019/1/1 00:00', sensorDt: (new Date('2019/01/01 01:00')).getTime(), temperature:11.0, humidity:12, count: 13, step: 14, beat: 15, stress: 16, low: 17, high: 18, pressure: 19, downLatest: 20, down: 21, magnet: 0},
    {sensorHistoryId: 4, sensorKey:'2019/1/1 00:00', sensorDt: (new Date('2019/01/01 01:30')).getTime(), temperature:11.5, humidity:13, count: 14, step: 15, beat: 16, stress: 17, low: 18, high: 19, pressure: 20, downLatest: 21, down: 22, magnet: 0},

    {sensorHistoryId: 5, sensorKey:'2019/1/2 00:00', sensorDt: (new Date('2019/01/02 00:00')).getTime(), temperature:10.0, humidity:10, count: 11, step: 12, beat: 13, stress: 14, low: 15, high: 16, pressure: 17, downLatest: 18, down: 19, magnet: 0},
    {sensorHistoryId: 6, sensorKey:'2019/1/2 00:00', sensorDt: (new Date('2019/01/02 00:30')).getTime(), temperature:10.5, humidity:11, count: 12, step: 13, beat: 14, stress: 15, low: 16, high: 17, pressure: 18, downLatest: 19, down: 20, magnet: 4},
    {sensorHistoryId: 7, sensorKey:'2019/1/2 00:00', sensorDt: (new Date('2019/01/02 01:00')).getTime(), temperature:11.0, humidity:12, count: 13, step: 14, beat: 15, stress: 16, low: 17, high: 18, pressure: 19, downLatest: 20, down: 21, magnet: 0},
    {sensorHistoryId: 8, sensorKey:'2019/1/2 00:00', sensorDt: (new Date('2019/01/02 01:30')).getTime(), temperature:11.5, humidity:13, count: 14, step: 15, beat: 16, stress: 17, low: 18, high: 19, pressure: 20, downLatest: 21, down: 22, magnet: 4},

    {sensorHistoryId: 9, sensorKey:'2019/1/3 00:00', sensorDt: (new Date('2019/01/03 00:00')).getTime(), temperature:20.0, humidity:10, count: 11, step: 12, beat: 13, stress: 14, low: 15, high: 16, pressure: 17, downLatest: 18, down: 19, magnet: 0},
    {sensorHistoryId: 10, sensorKey:'2019/1/3 00:00', sensorDt: (new Date('2019/01/03 00:30')).getTime(), temperature:10.5, humidity:11, count: 12, step: 13, beat: 14, stress: 15, low: 16, high: 17, pressure: 18, downLatest: 19, down: 20, magnet: 4},
    {sensorHistoryId: 11, sensorKey:'2019/1/3 00:00', sensorDt: (new Date('2019/01/03 01:00')).getTime(), temperature:11.0, humidity:12, count: 13, step: 14, beat: 15, stress: 16, low: 17, high: 18, pressure: 19, downLatest: 20, down: 21, magnet: 4},
    {sensorHistoryId: 12, sensorKey:'2019/1/3 00:00', sensorDt: (new Date('2019/01/03 01:30')).getTime(), temperature:11.5, humidity:13, count: 14, step: 15, beat: 16, stress: 17, low: 18, high: 19, pressure: 20, downLatest: 21, down: 22, magnet: 4},
  ]
}

export const processSum = () => {
  const ary = new Array(...window.crypto.getRandomValues(new Uint8Array(4))).map((val, index) => val > 250 - index * 20? 0: Math.round(val * 1.5))
  return JSON.stringify({
    'zoneIds': [1,2,3,4],
    'zoneNames': ['g1-1(在席)', 'g1-2(不在)', 'g1-3(禁止区域)', 'g2-1(在席)'],
    'processSumList': [
      {'dt': '2019-12-31 23:59:59.5', 'period': ary.reduce((prev, cur) => prev + cur), 'stayTimeSumId': 9999, 'minor': 9999, 'processPeriods': ary, 'txId': 9999, 'potName': 'Tx9999', 'potId':  9999},
      {'dt': '2019-05-28 21:28:27.0', 'period': 345047, 'stayTimeSumId': 13, 'minor': 601, 'processPeriods': [  6389,   0,   0, 338658], 'txId':  1, 'potName': 'Tx601', 'potId':  1},
      {'dt': '2019-05-28 21:28:01.0', 'period': 313650, 'stayTimeSumId':  1, 'minor': 605, 'processPeriods': [111385,   0,   0, 202265], 'txId':  5, 'potName': 'Tx605', 'potId':  5},
      {'dt': '2019-05-28 21:27:50.0', 'period': 307538, 'stayTimeSumId': 10, 'minor': 604, 'processPeriods': [ 49081,   0,   0, 258457], 'txId':  4, 'potName': 'Tx604', 'potId':  4},
      {'dt': '2019-05-28 21:27:13.0', 'period': 332378, 'stayTimeSumId':  7, 'minor': 602, 'processPeriods': [ 20770,   0,   0, 311608], 'txId':  2, 'potName': 'Tx602', 'potId':  2},
      {'dt': '2019-05-28 19:34:06.0', 'period': 255197, 'stayTimeSumId':  9, 'minor': 603, 'processPeriods': [153751,   0,   0, 101446], 'txId':  3, 'potName': 'Tx603', 'potId':  3},
      {'dt': '2019-05-26 01:13:48.0', 'period': 100742, 'stayTimeSumId': 12, 'minor': 615, 'processPeriods': [    99,   0,   0, 100643], 'txId': 15, 'potName': 'Tx615', 'potId': 15},
      {'dt': '2019-05-25 09:00:08.0', 'period':  42386, 'stayTimeSumId':  8, 'minor': 610, 'processPeriods': [    63,   0,   0,  42323], 'txId': 10, 'potName': 'Tx610', 'potId': 10},
      {'dt': '2019-05-24 09:00:08.0', 'period':    330, 'stayTimeSumId': 80, 'minor': 800, 'processPeriods': [   100, 100, 100,     30], 'txId': 80, 'potName': 'Tx800', 'potId': 80},
      {'dt': '2019-05-24 08:00:08.0', 'period':    310, 'stayTimeSumId': 81, 'minor': 801, 'processPeriods': [   100, 100, 100,     10], 'txId': 81, 'potName': 'Tx801', 'potId': 81},
      {'dt': '2019-05-24 07:00:08.0', 'period':    280, 'stayTimeSumId': 82, 'minor': 802, 'processPeriods': [   100, 100,  80,      0], 'txId': 82, 'potName': 'Tx802', 'potId': 82},
      {'dt': '2019-05-24 06:00:08.0', 'period':    180, 'stayTimeSumId': 83, 'minor': 803, 'processPeriods': [   100,  80,   0,      0], 'txId': 83, 'potName': 'Tx803', 'potId': 83},
      {'dt': '2019-05-24 05:00:08.0', 'period':     80, 'stayTimeSumId': 84, 'minor': 804, 'processPeriods': [    80,   0,   0,      0], 'txId': 84, 'potName': 'Tx804', 'potId': 84},
      {'dt': '2019-05-24 04:00:08.0', 'period':    230, 'stayTimeSumId': 85, 'minor': 805, 'processPeriods': [     0, 100, 100,     30], 'txId': 85, 'potName': 'Tx805', 'potId': 85},
      {'dt': '2019-05-24 03:00:08.0', 'period':    210, 'stayTimeSumId': 86, 'minor': 806, 'processPeriods': [   100,   0, 100,     10], 'txId': 86, 'potName': 'Tx806', 'potId': 86},
      {'dt': '2019-05-24 02:00:08.0', 'period':    280, 'stayTimeSumId': 87, 'minor': 807, 'processPeriods': [   100, 100,   0,     80], 'txId': 87, 'potName': 'Tx807', 'potId': 87},
      {'dt': '2019-05-24 01:00:08.0', 'period':    190, 'stayTimeSumId': 88, 'minor': 808, 'processPeriods': [   100,   0,   0,     90], 'txId': 88, 'potName': 'Tx808', 'potId': 88},
      {'dt': '2019-05-24 00:00:08.0', 'period':    210, 'stayTimeSumId': 89, 'minor': 809, 'processPeriods': [     0, 100,   0,     10], 'txId': 89, 'potName': 'Tx809', 'potId': 89},
      {'dt': '2019-05-23 23:00:08.0', 'period':    910, 'stayTimeSumId': 90, 'minor': 900, 'processPeriods': [   300, 300, 300,     10], 'txId': 90, 'potName': 'Tx900', 'potId': 90},
      {'dt': '2019-05-23 22:00:08.0', 'period':   1200, 'stayTimeSumId': 91, 'minor': 901, 'processPeriods': [   300, 300, 300,    300], 'txId': 91, 'potName': 'Tx901', 'potId': 91},
      {'dt': '2019-05-23 21:00:08.0', 'period':   1203, 'stayTimeSumId': 92, 'minor': 902, 'processPeriods': [   301, 301, 301,    300], 'txId': 92, 'potName': 'Tx902', 'potId': 92},
      {'dt': '2019-05-23 20:00:08.0', 'period':   1204, 'stayTimeSumId': 93, 'minor': 903, 'processPeriods': [   301, 301, 301,    301], 'txId': 93, 'potName': 'Tx903', 'potId': 93},
      {'dt': '2019-05-23 19:00:08.0', 'period':   1200, 'stayTimeSumId': 94, 'minor': 904, 'processPeriods': [   400,   0, 400,    400], 'txId': 94, 'potName': 'Tx904', 'potId': 94},
    ]
  })
}
