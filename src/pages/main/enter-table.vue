<template>
  <div class="container-fluid">
    <breadcrumb :items="breadCrumbs" :reload="reload" :auto-pager="autoPager" :auto-pager-play="autoPagerPlay" :short-name="shortName" />
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
        <div class="numval">{{ elapsedTime | number_format }}<span v-t="'label.hours'"></span></div>
      </div>
    </div>
    <div style="clear:both;">
      <table>
        <tr v-for="(row, rindex) in personGroupList[currentPage - 1]" :key="rindex">
          <td v-for="(col, cindex) in row" :key="cindex" class="td nowrap" :style="{backgroundColor: col.bgColor, color: col.color, textAlign: col.textAlign}" @click.stop="exitConfirm(rindex, cindex, $event.target)">{{ col.label }}</td>
        </tr>
      </table>
    </div>
    <p/>
    <b-row>
      <b-col v-if="totalPages > 1" md="6" class="mt-1 mb-3">
        <b-pagination v-model="currentPage" :total-rows="totalPages" :per-page="1" class="my-0" />
      </b-col>
    </b-row>
    <!-- modal -->
    <b-modal id="modalInfo" :title="modalInfo.title" @ok="execExit(modalInfo.id)">
      {{ modalInfo.content }}
    </b-modal>
  </div>
</template>

<script>
import { APP, DISP } from '../../sub/constant/config'
import * as Util from '../../sub/util/Util'
import * as StringUtil from '../../sub/util/StringUtil'
import * as PositionHelper from '../../sub/helper/domain/PositionHelper'
import * as AppServiceHelper from '../../sub/helper/dataproc/AppServiceHelper'
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
      currentPage: 1,
      personGroupList: [], // （表示用）グループ＆人リスト
      currentEnterCount: 0, // 不在ゾーンにいない人の数
      todaysEnterCount: 0, // 今日入場した数
      totalEnterCount: 0, // 述べ入場人数
      elapsedTime: 0, // APP.ENTER.START_TIME以降の時間
      breadCrumbs: ViewHelper.createBreadCrumbItems('main', 'enterTable'),
      shortName: this.$i18n.t('label.enterTable'),
      reload: true,
      timer: null,
      autoPager: false, // 自動ページ遷移機能有無
      autoPagerPlay: false, // 自動ページ遷移実行有無
      modalInfo: { title: this.$i18n.tnl('label.confirm'), content: '', id:'' },
    }
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
        await PositionHelper.loadPosition(0, true) // 測位情報取得
        let positions = PositionHelper.filterPositions(undefined, true)
        Util.debug(positions)

        const absentCategory = this.categories.find(e => e.systemUse == 1 && e.categoryCd == 'ABSENT')
        const absentLocationList = this.zones.filter(e => absentCategory && e.categoryId == absentCategory.categoryId).map(zone => zone.locationList).flat().filter(e => e)
        this.populateTableData(this.pots, positions, absentLocationList) // 入退場表データ作成
        this.elapsedTime = Math.floor((new Date().getTime() - Number(APP.ENTER.START_TIME || 0)) / (1000 * 60 * 60))

        let detectCount = await AppServiceHelper.fetch('/core/positionHistory/detectCount', '') // 本日入場、累積入場者数取得
        this.todaysEnterCount = detectCount.todaysEnterCount
        this.totalEnterCount = detectCount.totalEnterCount

        if (payload && payload.done) {
          payload.done()
        }

        if (this.totalPages > 1 && APP.ENTER.AUTO_PAGE > 0) { // 自動ページ遷移設定
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
    populateTableData(pots, positions, absentLocationList) { // 入退場表データ作成（全ページ分一度に作成する）
      const groupPotList = [] // グループとPOTを順に並べたリスト
      let curGroupId = ''
      this.currentEnterCount = 0

      // for unit test
      // absentLocationList = [{locationId:2}]
      // positions = [
      //   {txId: 603, exb:{location:{locationId: 1}}, timestamp: new Date().getTime()},
      //   {txId: 601, exb:{location:{locationId: 2}}, timestamp: new Date().getTime()},
      //   {txId: 605, exb:{location:{locationId: 2}}, isLost:true}
      // ]
      // const group1 = {groupCd: 1, groupName: 'ぐるぷ1', display:{color:'00FF00', bgColor: 'FFcc00'}}
      // const group2 = {groupCd: 2, groupName: 'ぐるぷ2', display:{color:'FFccFF', bgColor: '00FF00'}}
      // pots = [
      //   {potId: 1, potName: 'なまえ1', txIds:[603, 1], group:group1},
      //   {potId: 2, potName: 'なまえ2', txIds:[], group:group1},
      //   {potId: 3, potName: 'なまえ3', txIds:[3], group:group1},
      //   {potId: 4, potName: 'なまえ4', txIds:[605], group:group2},
      // ]
      // for(let i=5;i<1000;i++) {
      //   pots.push({potId: i, potName: 'なまえ' + i, txIds:[], group:{groupCd: 3, groupName: 'ぐるぷ3', display:{color:'000', bgColor: '0ff'}}})
      // }

      _(pots).map(pot => {
        let pos = positions.find(pos => pot.txIds.includes(pos.txId)) // potの現在の場所を取得
        const locationId = Util.v(pos, 'exb.location.locationId')
        const isAbsentZone = _.some(absentLocationList, loc => loc.locationId == locationId)
        return { // potの名前、場所、不在ゾーンかどうか、グループ情報、色等をオブジェクトにして返す
          potId: pot.potId,
          potName: pot.potName,
          hasTx: pot.txIds.length > 0,
          locationId,
          isAbsentZone: !pos || isAbsentZone,
          isLost: !pos || pos.isLost,
          timestamp: pos && pos.timestamp,
          groupCd: Util.v(pot, 'group.groupCd'),
          groupName: Util.v(pot, 'group.groupName', this.$i18n.tnl('label.other')),
          color: pot.group? '#' + Util.getValue(pot, 'group.display.color'): DISP.TX.COLOR,
          bgColor: pot.group? '#' + Util.getValue(pot, 'group.display.bgColor'): DISP.TX.BGCOLOR,
        }
      }).sortBy(['groupCd', 'potCd'] // グループコード、POTコードでソート
      ).forEach(e => { // グループとPOTのリストを生成
        if (e.groupCd !== curGroupId) { // グループが切り替わったら先頭にグループを挿入
          curGroupId = e.groupCd
          groupPotList.push({isGroup:true, label: e.groupName, color: e.color, bgColor: e.bgColor, textAlign: 'left'})
        }
        if (!e.isAbsentZone) { // 不在ゾーンではない場合現在入場者数をインクリメント
          this.currentEnterCount++
        }
        groupPotList.push({isGroup:false, label: StringUtil.cutOnLong(e.potName, 10), textAlign: 'center',
          groupName: e.groupName, potId: e.potId, isAbsentZone: e.isAbsentZone,
          color: e.isLost? DISP.ENTER.LOST_COLOR: 'black', // 消失の場合は文字色を変える
          bgColor: !e.hasTx? '#dc3545': e.isAbsentZone? DISP.ENTER.ABSENT_BGCOLOR: DISP.ENTER.ENTER_BGCOLOR}) // POTがTXに関連していない場合赤表示
      })
      Util.debug(groupPotList, APP.ENTER, DISP.ENTER)

      const ROW_CNT = Math.max(Math.floor((window.innerHeight - 320) / 42), 3) // 表の行数：ウインドウ高さに応じて変更。高さが低くても最低3行。
      const COL_CNT = DISP.ENTER.COL_CNT // 表の列数（設定値を使用）
      const personGroupList = [] // グループとPOTの表表示用のリスト（ページ、行、列の3次元配列になる）
      let lastGroup
      let page = 0
      let idx = -1
      let col = 0

      groupPotList.forEach((groupPot) => { // グループとPOTの入ったリストを順にループ
        idx++
        if (idx == ROW_CNT * COL_CNT * (page + 1)) { // 次のページに移る
          page++
        }
        if (groupPot.isGroup) {
          lastGroup = groupPot
        }
        
        let offset = ROW_CNT * COL_CNT * page // そのページにおける基点となるインデックス
        let row = (idx - offset) % ROW_CNT // 行
        col = Math.floor((idx - offset) / ROW_CNT) // 列

        if (row == ROW_CNT - 1 && groupPot.isGroup) { // 最後の行がグループだった場合
          this.setList(personGroupList, page, row, col, {label:'', bgColor: 'rgb(242,242,242)'}) // 空のセルを追加し、スキップする（次の回に行の先頭にグループが入る）
          return
        }
        if (row == 0 && !groupPot.isGroup) { // 行の先頭で、自身がグループではない場合
          this.setList(personGroupList, page, row, col, lastGroup) // グループを挿入し、インデックスと行を進める
          idx++
          row++            
        }
        this.setList(personGroupList, page, row, col, groupPot) // グループもしくはPOTを追加
      })

      for (col++;col<COL_CNT;col++) { // 最終ページで列が余っている場合、空（空白）の列を追加
        this.setList(personGroupList, page, 0, col, {})
      }

      this.totalPages = page + 1
      this.personGroupList = personGroupList
    },
    toggleAutoPager(isAutoPagerPlaying) { // 自動ページ遷移のオン・オフを切り替える
      if (isAutoPagerPlaying) {
        this.startAutoPager()
      }
      else {
        if (this.timer) {
          clearTimeout(this.timer)
        }
      }
    },
    startAutoPager() { // 自動ページ遷移を開始する
      if (this.timer) {
        clearTimeout(this.timer)
      }
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
      list[page][row][col] = val // ページ・行・列の３次元配列に値をセット
    },
    exitConfirm(rindex, cindex, button) { // 強制退場確認
      const personGroup = this.personGroupList[this.currentPage - 1][rindex][cindex]
      if (personGroup && personGroup.potId && !personGroup.isGroup && !personGroup.isAbsentZone) { // グループではなく、不在ゾーンにいないことをチェック
        this.modalInfo.content = this.$i18n.tnl('message.exitConfirm', {target: personGroup.label})
        this.modalInfo.id = personGroup.potId
        this.$root.$emit('bv::show::modal', 'modalInfo', button)
      }
    },
    async execExit(potId) { // 強制退場処理実行
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
