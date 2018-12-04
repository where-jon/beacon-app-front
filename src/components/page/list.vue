<template>
  <b-form inline @submit.prevent>
    <b-container :fluid="isFluid">
      <b-alert variant="info" dismissible :show="showMessage">{{ message }}</b-alert>
      <b-alert variant="danger" dismissible :show="showError">{{ error }}</b-alert>
      <!-- searchbox -->
      <template v-if="!params.hideSearchBox">
        <b-form-row class="mb-2">
          <b-form-row class="mr-4 mb-2">
            <!-- 標準絞り込みフィルタ -->
            <label v-t="'label.filter'" class="mr-2"></label>
            <b-input-group>
              <input v-model="filter.reg" class="form-control align-self-center"/>
              <b-input-group-append>
                <b-btn :disabled="!filter.reg" @click="filter.reg = ''" variant="secondary" v-t="'label.clear'"  class="align-self-center"/>
              </b-input-group-append>
            </b-input-group>
          </b-form-row>
          <!-- カスタムフィルタ -->
          <template v-if="params.extraFilter" >
            <b-form-row v-for="item of extraFilterSpec" v-bind:key="item.key" class="mr-4 mb-2">
              <label for="item.key" v-t="'label.' + item.key" class="mr-2"/>
              <b-input-group>
                <b-form-select :id="item.key" :options="item.options" v-model="filter.extra[item.key]"
                    class="extra-filter"/>
              </b-input-group>
            </b-form-row>
          </template>
          <div v-if="params.extraFilter" class="w-100 mb-2 " />
        </b-form-row>
        <b-form-row class="mb-1">
          <!-- ボタン部 -->
          <b-col v-if="!params.disableTableButtons && isEditable" cols="auto" class="ml-auto">
            <b-button :variant='theme' class="mx-1" @click="edit()"
                v-t="'label.createNew'" />
            <b-button :variant='theme' class="mx-1" v-if="params.bulkEditPath && !iosOrAndroid" @click="bulkEdit()" 
                v-t="'label.bulkRegister'" />
            <b-button :variant='theme' class="mx-1" v-if="params.csvOut && !iosOrAndroid" @click="exportCsv"
                v-t="'label.download'" />
          </b-col>
        </b-form-row>
      </template>

      <slot></slot>

      <b-row class="mt-3">
      </b-row>
    
      <!-- table -->
      <b-table show-empty stacked="md" striped hover :items="items" :fields="fields" :current-page="currentPage" :per-page="perPage" outlined
              :filter="filterGrid" @filtered="onFiltered" :bordered="params.bordered" :sort-by.sync="sortBy" :empty-filtered-text="emptyMessage">
        <template slot="style" slot-scope="row">
          <div v-bind:style="style(row.item)">A</div>
        </template>
        <template slot="actions" slot-scope="row">
          <!-- 更新ボタン -->
          <b-button size="sm" @click.stop="edit(row.item, row.index, $event.target)" :variant="theme" class="mr-2 my-1" v-t="'label.' + crud" :style="actionButtonStyle" />
          <!-- 削除ボタン -->
          <b-button v-if="isEditable" size="sm" @click.stop="deleteConfirm(row.item, row.index, $event.target)" variant="outline-danger" class="mr-1 my-1" v-t="'label.delete'" :style="actionButtonStyle" />
          <!-- jump another master page -->
          <div v-if="isEditable && anotherPageParams" :style="{'width': '100px'}">
            <!-- zone button -->
            <!-- <div v-if="getAnotherPageParam('zone', row.item)">
              <b-button size="sm" @click.stop="jumpAnotherPage('zone', row.item)" :variant="theme" class="btn-block mt-1 mb-1" v-t="'label.zone'" :style="anotherActionButtonStyle" />
            </div> -->
            <!-- location button -->
            <div v-if="getAnotherPageParam('location', row.item)">
              <b-button size="sm" @click.stop="jumpAnotherPage('location', row.item)" :variant="theme" class="btn-block my-1" v-t="'label.location'" :style="anotherActionButtonStyle" />
            </div>
          </div>
        </template>
        <template slot="thumbnail" slot-scope="row">
          <img v-if="thumbnail(row.item)" :src="thumbnail(row.item)" height="70" />
        </template>
        <!-- 電池レベル -->
        <template slot="powerLevel" slot-scope="row">
          <span :class="'badge badge-pill badge-' + row.item.powerLevel.class">
            {{row.item.powerLevel.text}}
          </span>
        </template>
        <!-- マップ表示 -->
        <template slot="mapDisplay" slot-scope="row">
          <b-button size="sm" @click.stop="mapDisplay(row.item)" :variant="theme"
              v-t="'label.mapDisplay'" :disabled="row.item.noSelectedTx" class="mx-1" />
        </template>
        <!-- カテゴリ等アイコン横並び表示 -->
        <template slot="icons" slot-scope="row">
          <div class="empty-icon d-inline-flex"></div><!-- 横幅0の「支柱」 -->
          <div class="d-inline-flex flex-wrap">
          <div v-for="position in row.item.positions" :key="position.areaId"
              class="d-inline-flex m-1" v-bind:style="position.display" @click.stop="mapDisplay(position)">
              {{position.label}}
          </div>
          </div>
        </template>
      </b-table>

      <!-- pager -->
      <b-row>
        <b-col md="6" class="my-1">
          <b-pagination :total-rows="totalRows" :per-page="perPage" v-model="currentPage" class="my-0" />
        </b-col>
        <!-- bulk upload button -->
        <b-col v-if="isEditable && params.bulkUploadPath && !iosOrAndroid" md="6" class="my-1">
          <b-button :variant='theme'
            @click="bulkUpload()" v-t="'label.bulkUpload'"  class="float-right" />
        </b-col>
      </b-row>

      <!-- modal -->
      <b-modal id="modalInfo" @hide="resetModal" :title="modalInfo.title" @ok="execDelete(modalInfo.id)">
        <pre>{{ modalInfo.content }}</pre>
      </b-modal>
    </b-container>
  </b-form>
</template>

<script>

import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import * as AppServiceHelper from '../../sub/helper/AppServiceHelper'
import * as StateHelper from '../../sub/helper/StateHelper'
import { addLabelByKey } from '../../sub/helper/ViewHelper'
import { EventBus } from '../../sub/helper/EventHelper'
import * as MenuHelper from '../../sub/helper/MenuHelper'
import * as HtmlUtil from '../../sub/util/HtmlUtil'
import * as Util from '../../sub/util/Util'
import { getButtonTheme, getTheme } from '../../sub/helper/ThemeHelper'
import { getCharSet } from '../../sub/helper/CharSetHelper'
import commonmixinVue from '../mixin/commonmixin.vue';
import { DETECT_STATE, CATEGORY } from '../../sub/constant/Constants'

export default {
  mixin: [commonmixinVue], // not work
  props: ['params', 'list', 'isFluid', 'anotherPageParams'],
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
      },
      emptyMessage: this.$i18n.tnl('message.listEmpty'),
      modalInfo: { title: '', content: '', id:'' },
      totalRows: this.initTotalRows,
      file: null,
      message: null,
      error: null,
      sortBy: null,
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
      let options = this.categories.filter((category) => 
        category.categoryType != CATEGORY.getTypes()[2].value
      ).map((category) => {
          return {
            value: category.categoryId,
            text: category.categoryName
          }
        }
      )
      options.unshift({value:null, text:''})
      return options
    },
    groupOptions() {
      let options = this.groups.map((group) => {
          return {
            value: group.groupId,
            text: group.groupName
          }
        }
      )
      options.unshift({value:null, text:''})
      return options
    },
    areaOptions() {
      let options = this.areas.map((area) => {
          return {
            value: area.areaId,
            text: area.areaName
          }
        }
      )
      options.unshift({value:null, text:''})
      return options
    },
    detectStateOptions() {
      let options = DETECT_STATE.getTypes()
      options.unshift({value:null, text:''})
      return options
    },
    loginId() {
      return this.$store.state.loginId
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
      return HtmlUtil.getLangShort() == "ja"? {}: {width: '110px !important'}
    },
    anotherActionButtonStyle(){
      return HtmlUtil.getLangShort() == "ja"? {width: '100px !important'}: {width: '110px !important'}
    },
  },
  mounted() {
    this.message = this.listMessage
    this.replaceAS({listMessage: null})
    this.$parent.$options.methods.fetchData.apply(this.$parent)
    if (this.params.extraFilter) {
      this.params.extraFilter.filter((str) => !(str === 'detectState'))
        .forEach(str => {
          StateHelper.load(str)
        });
    }
    this.sortBy = this.params.sortBy? this.params.sortBy: null
    const theme = getTheme()
  },
  watch: {
    filter() {
      console.log("filter is")
      console.log(this.filter)
    }
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
    exportCsv() {
      this.setEmptyMessage()
      let headers
      if (this.params.custumCsvColumns) {
        headers = this.params.custumCsvColumns
      } else {
        headers = _(this.params.fields).map((val) => val.key).uniqWith(_.isEqual).value()
      }
      headers = headers.filter((val) => !["style", "thumbnail", "actions", "updateAction"].includes(val))
      HtmlUtil.fileDL(this.params.name + ".csv", Util.converToCsv(this.list, headers), getCharSet(this.loginId))
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
      this.modalInfo.content = this.$i18n.tnl('message.deleteConfirm', this.params.mainColumn? {target: `${this.params.mainColumn.name}:${item[this.params.mainColumn.id]}`}: {target: "ID:" + item[this.id]})
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
          const regExp = new RegExp(".*" + this.filter.reg + ".*", "i")
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
      //console.log("filtering table...")
      return regBool && extBool
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
        this.error = this.$i18n.tnl('message.deleteFailed', {target: this.$i18n.tnl('label.' + this.params.name), code: e.response.status})
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
      this.$router.push("/main/position")
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
