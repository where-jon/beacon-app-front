<template>
  <div class="container-fluid">
    <breadcrumb :items="items" :reload="reload" :autoPager="autoPager" :autoPagerPlay="autoPagerPlay" :short-name="shortName" />
    <div class="countDisplay">
      <div class="smallBox enter">
        <span><img src="~/assets/icon/person.svg" width="32" height="32"><span style="margin-left: 5px;" v-t="'label.enter'" /></span>
        <div class="numval">{{ currentEnterCount | number_format }}<span v-t="'label.personCount'"></span></div>
      </div>
      <div class="smallBox todayEnter" style="min-width: 84px;">
        <span><img src="~/assets/icon/person3.svg" width="32" height="32"><span style="margin-left: 5px;" v-t="'label.today_enter'" /></span>
        <div class="numval">{{ todaysEnterCount | number_format }}<span v-t="'label.personCount'"></span></div>
      </div>
      <div class="smallBox totalEnter">
        <span><img src="~/assets/icon/personMany.svg" width="32" height="32"><span style="margin-left: 5px;" v-t="'label.total_enter'" /></span>
        <div class="numval">{{ totalEnterCount | number_format }}<span v-t="'label.personCount'"></span></div>
      </div>
      <div class="smallBox elapsedTime">
        <span><img src="~/assets/icon/clock.svg" width="32" height="32"><span style="margin-left: 5px;" v-t="'label.elapsed_time'" /></span>
        <div class="numval">{{ elapsedTime | number_format }}<span v-t="'label.hour'"></span></div>
      </div>
    </div>
    <div style="clear:both;">
      <table>
        <tr v-for="(row, rindex) in personGroupList[currentPage - 1]" :key="rindex">
          <td v-for="(col, cindex) in row" :key="cindex" class="td nowrap" :style="{backgroundColor: col.bgColor, color: col.color, textAlign: col.textAlign}" @click.stop="exitConfirm(rindex, cindex, $event.target)">{{ col.label }}</td>
        </tr>
      </table>
    </div>
    <p></p>
    <b-row>
      <b-col md="6" class="mt-1 mb-3" v-if="Math.floor(totalPages/perPage) > 1">
        <b-pagination v-model="currentPage" :total-rows="totalPages" :per-page="perPage" class="my-0" />
      </b-col>
    </b-row>
    <!-- modal -->
    <b-modal id="modalInfo" :title="modalInfo.title" @ok="execExit(modalInfo.id)">
      {{ modalInfo.content }}
    </b-modal>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { APP, DISP } from '../../sub/constant/config'
import * as Util from '../../sub/util/Util'
import * as StringUtil from '../../sub/util/StringUtil'
import * as PositionHelper from '../../sub/helper/domain/PositionHelper'
import * as AppServiceHelper from '../../sub/helper/dataproc/AppServiceHelper'
import * as StateHelper from '../../sub/helper/dataproc/StateHelper'
import * as ViewHelper from '../../sub/helper/ui/ViewHelper'
import breadcrumb from '../../components/layout/breadcrumb.vue'
import reloadmixin from '../../components/mixin/reloadmixin.vue'
import { EventBus } from '../../sub/helper/base/EventHelper'

export default {
  components: {
    breadcrumb,
  },
  mixins: [reloadmixin],
  data() {
    return {
      totalPages: 1,
      perPage: 1,
      personGroupList: [],
      currentPage: 1,
      currentEnterCount: 0, // 不在ゾーンにいない人の数
      todaysEnterCount: 0, // 今日入場した数
      totalEnterCount: 0, // 述べ入場人数
      elapsedTime: 0, // APP.ENTER.START_TIME以降の時間
      items: ViewHelper.createBreadCrumbItems('main', 'enterTable'),
      shortName: this.$i18n.t('label.enterTable'),
      reload: true,
      timer: null,
      autoPager: false,
      autoPagerPlay: false,
      modalInfo: { title: this.$i18n.tnl('label.confirm'), content: '', id:'' },
    }
  },
  computed: {
    // ...mapState('app_service', [
    //   'categories',
    //   'zones',
    //   'txs',
    //   'pots',
    //   'locations',
    // ]),
  },
  created() {
    this.autoPagerPlay = APP.ENTER.AUTO_PAGE == 2
    EventBus.$off('toggleAutoPager')
    EventBus.$on('toggleAutoPager', (param)=>{
      this.toggleAutoPager(param)
    })
  },
  methods: {
    async fetchData(payload) {
      try {
        this.replace({showAlert: false})
        this.showProgress()
        await PositionHelper.loadPosition(0, true)
        let positions = PositionHelper.filterPositions(undefined, true)
        Util.debug(positions)

        this.populateTableData(positions)
        this.elapsedTime = Math.floor((new Date().getTime() - Number(APP.ENTER.START_TIME || 0)) / (1000 * 60 * 60))

        let detectCount = await AppServiceHelper.fetch('/core/positionHistory/detectCount', '')
        this.todaysEnterCount = detectCount.todaysEnterCount
        this.totalEnterCount = detectCount.totalEnterCount

        if (payload && payload.done) {
          payload.done()
        }

        if (this.totalPages > 1 && APP.ENTER.AUTO_PAGE > 0) {
          this.autoPager = true
          if (this.autoPagerPlay) {
            this.startAutoPager()
          }
        }
      }
      catch(e) {
        console.error(e)
      }
      this.hideProgress()
    },
    populateTableData(positions) { // TODO: コメント追加
      const groupPotList = []
      var curGroupId = ''
      this.currentEnterCount = 0

      const absentCategory = this.categories.find(e => e.systemUse == 1 && e.categoryCd == 'ABSENT')
      const absentZoneList = this.zones.filter(e => absentCategory && e.categoryId == absentCategory.categoryId)
      _(this.pots).map(pot => {
        let pos = positions.find(pos => pos.txId == pot.txId)
        const location = pos && pos.location? this.locationIdMap[pos.location.locationId]: {}
        return {
          potId: pot.potId,
          potName: pot.potName,
          locationId: location.locationId,
          isAbsentZone: !pos || _.some(absentZoneList, e => _.some(e.locationList, loc => loc.locationId == location.locationId)), // TODO: 要動作確認
          groupCd: pot.group && pot.group.groupCd,
          groupName: pot.group && pot.group.groupName || this.$i18n.tnl('label.other'),
          color: pot.group? '#' + Util.getValue(pot, 'group.display.color'): DISP.TX.COLOR,
          bgColor: pot.group? '#' + Util.getValue(pot, 'group.display.bgColor'): DISP.TX.BGCOLOR,
          isLost: !pos || pos.isLost,
          timestamp: pos && pos.timestamp
        }
      }).sortBy(['groupCd', 'potCd']
      ).forEach(pot => {
        if (pot.groupCd !== curGroupId) {
          curGroupId = pot.groupCd
          groupPotList.push({isGroup:true, label: pot.groupName, color: pot.color, bgColor: pot.bgColor, textAlign: 'left'})
        }
        if (!pot.isAbsentZone) {
          this.currentEnterCount++
        }
        groupPotList.push({isGroup:false, label: StringUtil.cutOnLong(pot.potName, 10), textAlign: 'center',
          groupName: pot.groupName, color: pot.isLost? DISP.ENTER.LOST_COLOR: 'black', 
          potId: pot.potId, isAbsentZone: pot.isAbsentZone,
          bgColor: pot.isAbsentZone? DISP.ENTER.ABSENT_BGCOLOR: DISP.ENTER.ENTER_BGCOLOR})
      })
      Util.debug(groupPotList, APP.ENTER, DISP.ENTER)

      const ROW_CNT = Math.max(Math.floor((window.innerHeight - 320) / 42), 3)
      const COL_CNT = DISP.ENTER.COL_CNT
      const personGroupList = []
      let lastGroup
      let page = 0
      let idx = -1
      let col = 0

      groupPotList.forEach((groupPot) => {
        idx++
        if (idx == ROW_CNT * COL_CNT * (page + 1)) {
          page++
        }
        if (groupPot.isGroup) {
          lastGroup = groupPot
        }
        
        let offset = ROW_CNT * COL_CNT * page
        let row = (idx - offset) % ROW_CNT
        col = Math.floor((idx - offset) / ROW_CNT)

        if (row == ROW_CNT - 1 && groupPot.isGroup) {
          this.setList(personGroupList, page, row, col, {label:'', bgColor: 'rgb(242,242,242)'})
          return
        }
        if (row == 0 && !groupPot.isGroup) {
          this.setList(personGroupList, page, row, col, lastGroup)
          idx++
          row++            
        }
        this.setList(personGroupList, page, row, col, groupPot)
      })

      for (col++;col<COL_CNT;col++) {
        this.setList(personGroupList, page, 0, col, {})
      }

      this.totalPages = page + 1
      this.personGroupList = personGroupList
    },
    toggleAutoPager(isAutoPagerPlaying) {
      if (isAutoPagerPlaying) {
        this.startAutoPager()
      }
      else {
        if (this.timer) {
          clearTimeout(this.timer)
        }
      }
    },
    startAutoPager() {
      this.timer = setTimeout(async () =>{
        if (this.currentPage == this.totalPages) {
          this.currentPage = 0
        }
        else {
          this.currentPage++
        }
        this.startAutoPager()
      }, APP.ENTER.AUTO_PAGER_MSEC)
    },
    setList(list, page, row, col, val) {
      Util.debug(page, row, col, val.label)
      if (!list[page]) {
        list[page] = []
      }
      if (!list[page][row]) {
        list[page][row] = {}
      }
      list[page][row][col] = val
    },
    exitConfirm(rindex, cindex, button) {
      const personGroup = this.personGroupList[this.currentPage - 1][rindex][cindex]
      if (personGroup && personGroup.potId && !personGroup.isGroup && !personGroup.isAbsentZone) {
        this.modalInfo.content = this.$i18n.tnl('message.exitConfirm', {target: personGroup.label})
        this.modalInfo.id = personGroup.potId
        this.$root.$emit('bv::show::modal', 'modalInfo', button)
      }
    },
    async execExit(potId) {
      await AppServiceHelper.update('/core/positionHistory/saveAtAbsentZone/' + potId)
      this.fetchData()
    }
  }
}
</script>

<style scoped lang="scss">

.td {
  border: 2px solid white;
  padding: .5rem;
  @media screen and (min-width: 1350px) {
    min-width: 150px;
  }
}

table {
  border-collapse: collapse;
  table-layout: auto;
  width: 100%;
}

.nowrap {
  white-space: nowrap;
}

.countDisplay {
  float: right;
  flex-direction: row;
  grid-template-columns: 1.1fr 1.3fr 1.1fr 1.1fr;
  -ms-grid-columns: 1.1fr 1.3fr 1.1fr 1.1fr;
  display: grid;
  display: -ms-grid;
  margin-bottom: 10px;
}

.smallBox {
  float: left;
  border: 0;
  padding: 6px;
  margin: 4px;
  span{
    img {
      margin-left: auto;
      margin-right: auto;
    }
  }
  &.enter {
    -ms-grid-column: 1;
    background-color: rgb(242,242,242);
  }
  &.todayEnter {
    -ms-grid-column: 2;
    background-color: rgb(242,242,242);
  }
  &.totalEnter {
    -ms-grid-column: 3;
    background-color: rgb(222,235,247);
  }
  &.elapsedTime {
    -ms-grid-column: 4;
    background-color: rgb(217,217,217);
  }
  .numval {
    font-size: 1.6em;
    @media (max-width: 769px) {
      font-size: 1.2em;
    }
    text-align: center;
    padding: 1px 1px;
  }
}


</style>
