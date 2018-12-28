<template>
  <b-form inline @submit.prevent>
    <b-container :fluid="isFluid">
      <b-alert :show="showMessage" variant="info" dismissible>
        {{ message }}
      </b-alert>
      <b-alert :show="showError" variant="danger" dismissible>
        {{ error }}
      </b-alert>
      <!-- searchbox -->
      <template v-if="!params.hideSearchBox">
        <b-form-row class="mb-2">
          <b-form-row class="mr-4 mb-2">
            <!-- 標準絞り込みフィルタ -->
            <label v-t="'label.filter'" class="mr-2" />
            <b-input-group>
              <input v-model="filter.reg" class="form-control align-self-center">
              <b-input-group-append>
                <b-btn v-t="'label.clear'" :disabled="!filter.reg" variant="secondary" class="align-self-center" @click="filter.reg = ''" />
              </b-input-group-append>
            </b-input-group>
          </b-form-row>
          <!-- カスタムフィルタ -->
          <template v-if="params.extraFilter">
            <b-form-row v-for="item of extraFilterSpec" :key="item.key" class="mr-4 mb-2">
              <label v-t="'label.' + item.key" for="item.key" class="mr-2" />
              <b-input-group>
                <b-form-select :id="item.key" v-model="filter.extra[item.key]" :options="item.options"
                               class="extra-filter"
                />
              </b-input-group>
            </b-form-row>
          </template>
          <div v-if="params.extraFilter" class="w-100 mb-2 " />
        </b-form-row>
        <b-form-row v-if="params.delFilter" class="mb-2">
          <b-form-row>
            <!-- 削除済みフィルタ -->
            <b-form-checkbox id="delFilter" v-model="filter.del" :value="true" :unchecked-value="false">
              <span v-text="$i18n.tnl('label.delFilter')" />
            </b-form-checkbox>
          </b-form-row>
        </b-form-row>
        <b-form-row class="mb-1">
          <!-- ボタン部 -->
          <b-col v-if="!params.disableTableButtons && isEditable" cols="auto" class="ml-auto">
            <b-button v-t="'label.createNew'" :variant="theme" class="mx-1"
                      @click="edit()"
            />
            <b-button v-if="params.bulkEditPath && !iosOrAndroid" v-t="'label.bulkRegister'" :variant="theme" class="mx-1" 
                      @click="bulkEdit()"
            />
            <b-button v-if="params.csvOut && !iosOrAndroid" v-t="'label.download'" :variant="theme" class="mx-1"
                      @click="exportCsv"
            />
          </b-col>
        </b-form-row>
      </template>

      <slot />

      <b-row class="mt-3" />
    
      <!-- table -->
      <b-table :items="items" :fields="fields" :current-page="currentPage" :per-page="perPage" :filter="filterGrid" :bordered="params.bordered" :sort-by.sync="sortBy" :empty-filtered-text="emptyMessage" show-empty
               stacked="md" striped hover outlined @filtered="onFiltered"
      >
        <template slot="style" slot-scope="row">
          <div :style="style(row.item)">
            A
          </div>
        </template>
        <template slot="actions" slot-scope="row">
          <!-- 更新ボタン -->
          <b-button v-t="'label.' + crud" :variant="theme" :style="actionButtonStyle" size="sm" class="mr-2 my-1" @click.stop="edit(row.item, row.index, $event.target)" />
          <!-- 削除ボタン -->
          <b-button v-if="isEditable" v-t="'label.delete'" :style="actionButtonStyle" size="sm" variant="outline-danger" class="mr-1 my-1" @click.stop="deleteConfirm(row.item, row.index, $event.target)" />
          <!-- jump another master page -->
          <div v-if="isEditable && anotherPageParams" :style="{'width': '100px'}">
            <!-- zone button -->
            <!-- <div v-if="getAnotherPageParam('zone', row.item)">
              <b-button size="sm" @click.stop="jumpAnotherPage('zone', row.item)" :variant="theme" class="btn-block mt-1 mb-1" v-t="'label.zone'" :style="anotherActionButtonStyle" />
            </div> -->
            <!-- location button -->
            <div v-if="getAnotherPageParam('location', row.item)">
              <b-button v-t="'label.location'" :variant="theme" :style="anotherActionButtonStyle" size="sm" class="btn-block my-1" @click.stop="jumpAnotherPage('location', row.item)" />
            </div>
          </div>
          <!-- for tenant -->
          <div v-if="isTenantAdmin && params.tenantAction" :style="{'width': '100px'}">
            <!-- switch button -->
            <div>
              <b-button v-if="isCurrentTenant(row.item)" v-t="'label.now'" :variant="theme" :style="anotherActionButtonStyle" :disabled="true" size="sm" class="btn-block my-1" style="opacity: 1.0 !important; border-radius: 0px;" />
              <b-button v-else v-t="'label.switch'" :variant="theme" :style="anotherActionButtonStyle" size="sm" class="btn-block my-1" @click.stop="switchTenant(row.item)" />
            </div>
          </div>
        </template>
        <template slot="thumbnail" slot-scope="row">
          <img v-if="thumbnail(row.item)" :src="thumbnail(row.item)" height="70">
        </template>
        <!-- 電池レベル -->
        <template slot="powerLevel" slot-scope="row">
          <span :class="'badge badge-pill badge-' + row.item.powerLevel.class">
            {{ row.item.powerLevel.text }}
          </span>
        </template>
        <!-- マップ表示 -->
        <template slot="mapDisplay" slot-scope="row">
          <b-button v-t="'label.mapDisplay'" :variant="theme" :disabled="row.item.noSelectedTx"
                    size="sm" class="mx-1" @click.stop="mapDisplay(row.item)"
          />
        </template>
        <!-- カテゴリ等アイコン横並び表示 -->
        <template slot="icons" slot-scope="row">
          <div class="empty-icon d-inline-flex" /><!-- 横幅0の「支柱」 -->
          <div class="d-inline-flex flex-wrap">
            <div v-for="position in row.item.positions" :key="position.areaId"
                 :style="position.display" class="d-inline-flex m-1" @click.stop="mapDisplay(position)"
            >
              {{ position.label }}
            </div>
          </div>
        </template>
      </b-table>

      <!-- pager -->
      <b-row>
        <b-col md="6" class="my-1">
          <b-pagination v-model="currentPage" :total-rows="totalRows" :per-page="perPage" class="my-0" />
        </b-col>
        <!-- bulk upload button -->
        <b-col v-if="isEditable && params.bulkUploadPath && !iosOrAndroid" md="6" class="my-1">
          <b-button v-t="'label.bulkUpload'"
                    :variant="theme" class="float-right" @click="bulkUpload()"
          />
        </b-col>
      </b-row>

      <!-- modal -->
      <b-modal id="modalInfo" :title="modalInfo.title" @hide="resetModal" @ok="execDelete(modalInfo.id)">
        {{ modalInfo.content }}
      </b-modal>
    </b-container>
  </b-form>
</template>

<script>

import { mapState, mapMutations } from 'vuex'
import * as AppServiceHelper from '../../sub/helper/AppServiceHelper'
import * as StateHelper from '../../sub/helper/StateHelper'
import * as MenuHelper from '../../sub/helper/MenuHelper'
import * as DetectStateHelper from '../../sub/helper/DetectStateHelper'
import * as HtmlUtil from '../../sub/util/HtmlUtil'
import * as Util from '../../sub/util/Util'
import { getButtonTheme } from '../../sub/helper/ThemeHelper'
import { getCharSet } from '../../sub/helper/CharSetHelper'
import commonmixinVue from '../mixin/commonmixin.vue'
import { CATEGORY } from '../../sub/constant/Constants'
import * as AuthHelper from '../../sub/helper/AuthHelper'

export default {
  mixin: [commonmixinVue], // not work
  props: {
    params: {
      type: Object,
      required: true,
    },
    list: {
      type: Array,
      required: true,
    },
    isFluid: {
      type: Boolean,
      default: false,
    },
    anotherPageParams: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      currentPage: 1,
      perPage: 10,
      filter: {
        reg: '',
        extra: {
          category: '',
          group: '',
          area: '',
          detectState: null,
        },
        del: false,
      },
      emptyMessage: this.$i18n.tnl('message.listEmpty'),
      modalInfo: { title: '', content: '', id:'' },
      totalRows: this.params.initTotalRows,
      file: null,
      message: null,
      error: null,
      sortBy: null,
      login: JSON.parse(window.localStorage.getItem('login')),
      switchReload: false,
      ...this.params
    }
  },
  computed: {
    items() {
      return this.list.map((item) => {
        return _.reduce(item, (result, val, key) => {
          result[key] = Util.cutOnLong(val, 50)
          return result
        }, {})
      })
    },
    crud() {
      return !this.isEditable? 'refer':  'update'
    },
    isEditable() {
      return MenuHelper.isEditable(this.appServicePath)
    },
    iosOrAndroid() {
      return Util.isAndroidOrIOS()
    },
    extraFilterSpec() {
      if (!this.params.extraFilter) {
        return {}
      }
      return this.params.extraFilter.map((key) => {
        return {
          key: key,
          options: this[key + 'Options'],
        }
      })
    },
    ...mapState([
      'featureList',
    ]),
    ...mapState('app_service', [
      'categories',
      'groups',
      'areas',
      'listMessage',
    ]),
    ...mapState('main', [
      'selectedTx',
      'selectedarea',
    ]),
    categoryOptions() {
      return StateHelper.getOptionsFromState('category', false, false, 
        category => CATEGORY.POT_AVAILABLE.includes(category.categoryType)
      )
    },
    groupOptions() {
      return StateHelper.getOptionsFromState('group')
    },
    areaOptions() {
      return StateHelper.getOptionsFromState('area')
    },
    detectStateOptions() {
      let options = DetectStateHelper.getTypes()
      options.unshift({value:null, text:''})
      return options
    },
    loginId() {
      return this.$store.state.loginId
    },
    isTenantAdmin() {
      return this.login.tenantAdmin
    },
    theme () {
      const theme = getButtonTheme(this.loginId)
      return 'outline-' + theme
    },
    showMessage(){
      return Util.hasValue(this.message)
    },
    showError(){
      return Util.hasValue(this.error)
    },
    actionButtonStyle(){
      return HtmlUtil.getLangShort() == 'ja'? {}: {width: '110px !important'}
    },
    anotherActionButtonStyle(){
      return HtmlUtil.getLangShort() == 'ja'? {width: '100px !important'}: {width: '110px !important'}
    },
  },
  async created() {
    this.switchReload = this.params.tenantAction? this.params.tenantAction: false
    if(this.switchReload){
      this.switchReload = false
      await StateHelper.load('region')
    }
  },
  mounted() {
    this.message = this.listMessage
    this.replaceAS({listMessage: null})
    this.$parent.$options.methods.fetchData.apply(this.$parent)
    if (this.params.extraFilter) {
      this.params.extraFilter.filter((str) => !(str === 'detectState'))
        .forEach(str => {
          StateHelper.load(str)
        })
    }
    this.sortBy = this.params.sortBy? this.params.sortBy: null
  },
  methods: {
    ...mapMutations('app_service', [
      'replaceAS', 
    ]),
    ...mapMutations('main', [
      'replaceMain', 
    ]),
    thumbnail(row) {
      return this.$parent.$options.methods.thumbnail.call(this.$parent, row)
    },
    setEmptyMessage(){
      this.message = null
      this.error = null
    },
    isCurrentTenant(item){
      return item.tenantId == this.login.currentTenant.tenantId
    },
    async switchTenant(item){
      await AuthHelper.switchTenant(item.tenantId)
      this.switchReload = true
      location.reload()
    },
    exportCsv() {
      this.setEmptyMessage()
      let headers
      if (this.params.custumCsvColumns) {
        headers = this.params.custumCsvColumns
      } else {
        headers = _(this.params.fields).map((val) => val.key).uniqWith(_.isEqual).value()
      }
      headers = headers.filter((val) => !['style', 'thumbnail', 'actions', 'updateAction'].includes(val))
      HtmlUtil.fileDL(this.params.name + '.csv', Util.converToCsv(this.list, headers), getCharSet(this.loginId))
    },
    style(index) {
      return this.$parent.$options.methods.style.call(this.$parent, index)
    },
    async edit(item, index, target) {
      this.setEmptyMessage()
      let entity = item != null? await AppServiceHelper.fetch(this.appServicePath, item[this.id]): {}
      if (this.$parent.$options.methods.convBeforeEdit) {
        entity = this.$parent.$options.methods.convBeforeEdit.call(this.$parent, entity)
      }
      this.replaceAS({[this.name]: entity})
      this.$router.push(this.editPath)
    },
    getAnotherPageParam(name, item) {
      const pageParam = this.anotherPageParams.find((val) => val.name == name)
      return pageParam && item[pageParam.id]? pageParam: null
    },
    async jumpAnotherPage(name, item) {
      const pageParam = this.getAnotherPageParam(name, item)
      const pageSendParam = {}
      pageParam.sendParamNames.forEach((val) => pageSendParam[val] = item[val])
      this.replaceAS({pageSendParam: pageSendParam})
      this.$router.push(pageParam.jumpPath)
    },
    async bulkEdit(item, index, target) {
      this.setEmptyMessage()
      this.$router.push(this.params.bulkEditPath)
    },
    async bulkUpload(item, index, target) {
      this.setEmptyMessage()
      this.$router.push(this.params.bulkUploadPath)
    },
    deleteConfirm(item, index, button) {
      this.setEmptyMessage()
      this.modalInfo.title = this.$i18n.tnl('label.confirm')
      this.modalInfo.content = this.$i18n.tnl(this.params.delFilter && item.delFlg != 0? 'message.completeDeleteConfirm': 'message.deleteConfirm', this.params.mainColumn? {target: `${this.params.mainColumn.name}:${item[this.params.mainColumn.id]}`}: {target: 'ID:' + item[this.id]})
      this.modalInfo.id = item[this.id]
      this.$root.$emit('bv::show::modal', 'modalInfo', button)
    },
    resetModal () {
      this.modalInfo.title = ''
      this.modalInfo.content = ''
      this.modalInfo.id = ''
    },
    filterGrid(originItem) {
      let regBool
      if(!this.filter.reg){
        regBool = true
      } else {
        try{
          const regExp = new RegExp('.*' + this.filter.reg + '.*', 'i')
          const param = this.params.fields.map((val) => Util.getValue(originItem, val.key, ''))
          regBool = regExp.test(JSON.stringify(param))
        }
        catch(e){
          regBool = false
        }
      }
      // 追加フィルタ
      let extBool = true
      if (!this.params.extraFilter) {
        extBool = true
      } else {
        const extra = this.filter.extra
        for (let item of this.params.extraFilter) {
          switch (item) {
          case 'category':
            if (extra.category && 
                  !(extra.category === originItem.categoryId)) {
              extBool = false
            }
            break
          case 'group':
            if  (extra.group && 
                  !(extra.group === originItem.groupId)) {
              extBool = false
            }
            break
          case 'area':
            if (extra.area &&
                !(extra.area === originItem.areaId)) {
              extBool = false
            }
            break
          case 'detectState':
            if (extra.detectState != null &&
                !(extra.detectState === originItem.detectState)) {
              extBool = false
            }
            break
          }
        }
      }
      let delBool = true
      if(!this.params.delFilter){
        delBool = true
      }
      else if(this.filter.del){
        delBool = true
      }
      else{
        delBool = originItem.delFlg == 0
      }
      //console.log("filtering table...")
      return regBool && extBool && delBool
    },
    onFiltered(filteredItems) {
      this.totalRows = filteredItems.length
      this.currentPage = 1
    },
    async execDelete(id) {
      try {
        await AppServiceHelper.deleteEntity(this.appServicePath, id)
        await StateHelper.load(this.params.name, true)
        if(this.$parent.$options.methods.afterCrud){
          this.$parent.$options.methods.afterCrud.apply(this.$parent)
        }
        this.message = this.$i18n.tnl('message.deleteCompleted', {target: this.$i18n.tnl('label.' + this.params.name)})
        this.$parent.$options.methods.fetchData.apply(this.$parent)        
      } catch (e) {
        this.error = this.$i18n.terror('message.deleteFailed', {target: this.$i18n.tnl('label.' + this.params.name), code: e.response.status})
      }
    },
    // 位置把握(一覧)から在席表示に遷移する
    async mapDisplay(item) {
      console.log('mapDisplay called with:')
      console.log(item)
      const tx = item.tx
      const selectedTx = {
        btxId: tx.btxId,
        thumbnail: Util.getValue(tx, 'pot.thumbnail', null) ? tx.pot.thumbnail : '',
      }
      const selectedArea = Util.getValue(item, 'exb.location.areaId', null)
      const txOk = await this.$parent.$options.methods.checkDetectedTx.call(this.$parent, tx)
      if (txOk) {
        this.replaceMain({selectedTx})
      }
      this.replaceMain({selectedArea})
      this.$router.push('/main/position')
    }
  }
}

</script>

<style>
  td.thumb-rowdata {
    padding: 5px;
    line-height: 70px;
  }

  td.action-rowdata {
    padding: 5px;
    line-height: 35px;
  }
  
  select.extra-filter {
    max-width: 10em;
  }

  td {
    word-break: break-all;
  }
  @media (min-width: 769px) {
    td {
      max-width: 200px;
    }
  }

  div.empty-icon {
    width: 0px;
    height: 60px;
    vertical-align: top;
  }

  .page-link {
    color: #376495;
  }
  .page-item.active .page-link {
    background-color: #376495;
    border-color: #265384;
  }

</style>
