<template>
  <div class="container-fluid">
    <breadcrumb :items="breadCrumbs" />
    <div class="container">
      <alert :message="message" />

      <b-form @submit.prevent="save">
        <chrome-input />
        <b-form-group>
          <label v-t="'label.key'" />
          <v-select v-model="vueSelected.key" :options="keyOptions" :clearable="false" class="mb-3" :style="{'width':'300px'}">
            <template slot="no-options">
              {{ vueSelectNoMatchingOptions }}
            </template>
          </v-select>
        </b-form-group>
        <b-form-group v-if="showGroupZoneType">
          <div v-for="(groupZone, index) in groupZoneList" :key="index">
            <b-form-group>
              <label>
                {{ $i18n.tnl('label.group') + (index + 1) }}
              </label>
              <b-form-select v-model="groupZone.groupCd" :options="getGroupOptions(groupZone.groupCd)" class="ml-3 col-4" />
              <b-button v-t="'label.delete'" variant="outline-danger" type="button" @click="deleteGroup(index)" />
            </b-form-group>
            <b-form-group>
              <label>
                {{ $i18n.tnl('label.targetZone') + (index + 1) }}
              </label>
              <v-select v-model="groupZone.zoneCdList" :options="zoneOptions" multiple :close-on-select="false" class="vue-options-multi" :style="{'width':'300px'}">
                <template slot="no-options">
                  {{ vueSelectNoMatchingOptions }}
                </template>
              </v-select>
            </b-form-group>
          </div>
        </b-form-group>

        <b-button v-if="key" v-t="'label.add'" :variant="theme" type="button" @click="addEmptyGroup()" />
        <b-button v-if="key" :variant="theme" type="submit" class="mr-2 my-1" @click="beforeSubmit($event)">
          {{ $i18n.tnl(`label.update`) }}
        </b-button>
      </b-form>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { APP } from '../../sub/constant/config'
import * as Util from '../../sub/util/Util'
import * as AppServiceHelper from '../../sub/helper/dataproc/AppServiceHelper'
import * as StateHelper from '../../sub/helper/dataproc/StateHelper'
import * as ConfigHelper from '../../sub/helper/dataproc/ConfigHelper'
import * as ViewHelper from '../../sub/helper/ui/ViewHelper'
import * as VueSelectHelper from '../../sub/helper/ui/VueSelectHelper'
import breadcrumb from '../../components/layout/breadcrumb.vue'
import commonmixin from '../../components/mixin/commonmixin.vue'
import editmixin from '../../components/mixin/editmixin.vue'
import alert from '../../components/parts/alert.vue'
import chromeInput from '../../components/parts/chromeinput.vue'

/**
 * JSON型の設定をプルダウンから選択することで行うことができるページ
 * 現状、進入禁止、持出禁止の設定のみに特化しているので、汎用化するには改造が必要。
 * EXT_DEFなども対象となるが、仕様に直結するため当面やらない。
 */
export default {
  components: {
    breadcrumb,
    alert,
    chromeInput,
  },
  mixins: [commonmixin, editmixin],
  data() {
    return {
      appServicePath: '/meta/setting',
      name: 'setting',
      breadCrumbs: ViewHelper.createBreadCrumbItems('setting', 'systemJson'),
      vueSelected: {
        key: null, // 設定キー
      },
      key: null,
      keyList: ['APP.POS.PROHIBIT_GROUP_ZONE', 'APP.POS.LOST_GROUP_ZONE'],  // 設定項目選択肢
      keyOptions: [], // 設定キー
      showGroupZoneType: false, // Group-Zone形式の設定内容を表示するか否か
      groupZoneList: [], // Group-Zoneの設定値
    }
  },
  computed: {
    ...mapState('app_service', [
      'zones', 'zoneIdMap', 'groups', 'settings'
    ]),
    ...mapState([
      'showAlert'
    ]),
  },
  watch: {
    'vueSelected.key': {
      handler: function(newVal, oldVal){
        this.key = Util.getValue(newVal, 'value')
        this.onKeyChange()
      },
      deep: true,
    },
  },
  created(){
    this.keyOptions = this.keyList.map(key => ({value: key, text: key, label: this.$i18n.tnl('config.' + key).split('::')[0]}))
  },
  mounted(){
    StateHelper.load('settings')
    VueSelectHelper.disabledAllSubmit()
  },
  methods: {
    getGroupOptions(groupCd) { // グループの選択肢を返す（すでにほかで設定済みのものは表示しない）
      const options = this.groups.map(group => {
        if (!this.groupZoneList.some(groupZone => groupZone.groupCd == group.groupCd) || groupCd && group.groupCd == groupCd) {
          return {text:group.groupName, label:group.groupCd, value:group.groupCd}
        }
      }).filter(e => e)
      options.unshift({label:'', text:'', value:null})
      return options
    },
    onKeyChange() { // 設定項目選択
      this.groupZoneList = []
      this.showGroupZoneType = !!this.key
      if (!this.showGroupZoneType) return

      const groupZoneList = _.cloneDeep(this.key.startsWith('APP')? Util.v(APP, this.key.substring(4)): null) // とりあえずAPPのみ
      if (!groupZoneList) return
      groupZoneList.forEach(groupZone => {
        groupZone.zoneCdList = []
        groupZone.zoneCd.forEach(zoneCd => {
          const zone = this.zones.find(zone => zone.zoneCd == zoneCd)
          groupZone.zoneCdList.push({label:zone.zoneName, text: zone.zoneCd, value: zone.zoneId})
        })
      })
      this.groupZoneList = groupZoneList
    },  
    deleteGroup(index) { // グループの削除
      this.groupZoneList = this.groupZoneList.filter((e, idx) => idx != index)
    },
    addEmptyGroup() { // グループの追加
      this.groupZoneList.push({
        groupCd: null,
        zoneCd: []
      })
    },
    async onSaved() { // 保存後設定をクリア
      ConfigHelper.reloadConfig()
      this.vueSelected.key = null
      this.key = null
      this.groupZoneList = []
    },
    async onSaving() { // 保存処理
      const json = JSON.stringify(this.groupZoneList.map((groupZone) => { // groupCdとzoneCdでJSON文字列化
        return {groupCd: groupZone.groupCd, zoneCd: groupZone.zoneCdList.map(e => this.zoneIdMap[e.value].zoneCd)}
      }))
      const settingId = Util.v(this.settings.find(e => e.key == this.key), 'settingId', -1)
      const entity = {
        settingId,
        key: this.key,
        valType: 'json',
        value: json
      }
      return await AppServiceHelper.save(this.appServicePath, entity)
    },
    beforeSubmit(event) { // ヴァリデーション実行 
      this.replace({showAlert: false})
      this.replace({showInfo: false})

      this.groupZoneList.forEach((groupZone) => {
        if (!groupZone.groupCd || !Util.hasValue(groupZone.zoneCdList)) {
          this.message = this.$i18n.tnl('message.valueMissingSelect')
          this.replace({showAlert: true})
        }
      })

      if (this.showAlert) {
        window.scrollTo(0, 0)
        event.preventDefault()
        return false
      }
    },
  },
}
</script>

<style scoped lang="scss">
@import "../../sub/constant/vue.scss";
</style>