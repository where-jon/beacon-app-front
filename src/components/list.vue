<template>
  <b-form inline>
    <b-container>
      <!-- searchbox -->
      <template v-if="!params.hideSearchBox">
        <b-row class="mb-1">
          <!-- 標準絞り込みフィルタ -->
          <b-col class="col-auto row mb-1">
            <label v-t="'label.filter'" class="col-auto text-left"></label>
            <b-input-group class="col-auto">
              <b-form-input v-model="filter.reg"  class="align-self-center"/>
              <b-input-group-append>
                <b-btn :disabled="!filter.reg" @click="filter.reg = ''" variant="secondary" v-t="'label.clear'"  class="align-self-center"/>
              </b-input-group-append>
            </b-input-group>
          </b-col>
          <!-- カスタムフィルタ -->
          <template v-if="params.extraFilter" >
            <b-col v-for="item of extraFilterSpec" v-bind:key="item.key" class="row col-auto">
              <label for="item.key" v-t="'label.' + item.key" class="col-auto text-sm-right mx-2 align-self-center" />
              <b-form-select :id="item.key" :options="item.options" v-model="filter.extra[item.key]"
                  class="col-auto align-self-center extra-filter"/>
            </b-col>
          </template>
          <div v-if="params.extraFilter" class="w-100 mb-2 " />
          <!-- ボタン部 -->
          <b-col v-if="!params.disableTableButtons" cols="auto" class="ml-auto">
            <b-button :variant='theme' class="mx-1" @click="edit()"
                v-t="'label.createNew'" />
            <b-button :variant='theme' class="mx-1" v-if="params.bulkEditPath" @click="bulkEdit()" 
                v-t="'label.bulkRegister'" />
            <b-button :variant='theme' class="mx-1" v-if="params.csvOut" @click="exportCsv"
                v-t="'label.download'" />
          </b-col>
        </b-row>
      </template>

      <slot></slot>

      <b-row class="mt-3">
      </b-row>
    
      <!-- table -->
      <b-table show-empty stacked="md" striped hover :items="list" :fields="fields" :current-page="currentPage" :per-page="perPage" outlined
              :filter="filterGrid" @filtered="onFiltered">
        <template slot="style" slot-scope="row">
          <div v-bind:style="style(row.index)">A</div>
        </template>
        <template slot="actions" slot-scope="row">
          <!-- 更新ボタン -->
          <b-button size="sm" @click.stop="edit(row.item, row.index, $event.target)" :variant="theme" class="mr-2 my-1" v-t="'label.' + crud" />
          <!-- 削除ボタン -->
          <b-button v-if="isEditable" size="sm" @click.stop="deleteConfirm(row.item, row.index, $event.target)" variant="outline-danger" class="mr-1" v-t="'label.delete'" />
        </template>
        <template slot="thumbnail" slot-scope="row">
          <img v-if="thumbnail(row.index)" :src="thumbnail(row.index)" height="70" />
        </template>
      </b-table>

      <!-- pager -->
      <b-row>
        <b-col md="6" class="my-1">
          <b-pagination :total-rows="totalRows" :per-page="perPage" v-model="currentPage" class="my-0" />
        </b-col>
        <!-- bulk upload button -->
        <b-col v-if="isEditable" md="6" class="my-1">
          <b-button v-if="params.bulkUploadPath" :variant='theme'
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
import * as AppServiceHelper from '../sub/helper/AppServiceHelper'
import * as StateHelper from '../sub/helper/StateHelper'
import { addLabelByKey } from '../sub/helper/ViewHelper'
import { EventBus } from '../sub/helper/EventHelper'
import * as MenuHelper from '../sub/helper/MenuHelper'
import * as HtmlUtil from '../sub/util/HtmlUtil'
import * as Util from '../sub/util/Util'
import { getButtonTheme, getTheme, themeColors } from '../sub/helper/ThemeHelper'
import { getCharSet } from '../sub/helper/CharSetHelper'
import commonmixinVue from './commonmixin.vue';
import { DETECT_STATE } from '../sub/constant/Constants'

let that

export default {
  mixin: [commonmixinVue], // not work
  props: ['params', 'list'],
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
          detectState: '',
        },
      },
      extraFilterMaxWidth: 9, // em
      extraFilterFactor: 1.3,
      modalInfo: { title: '', content: '', id:'' },
      totalRows: this.initTotalRows,
      file: null,
      detectState: DETECT_STATE,
      ...this.params
    }
  },
  computed: {
    crud() {
      return !this.isEditable? 'refer':  'update'
    },
    isEditable() {
      return MenuHelper.isEditable(this.appServicePath)
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
      'areas'
    ]),
    categoryOptions() {
      let options = this.categories.map((category) => {
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
      let options = this.detectState.getTypes()
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
  },
  mounted() {
    that = this
    this.$parent.$options.methods.fetchData.apply(this.$parent)
    StateHelper.load('group')
    StateHelper.load('category')
    StateHelper.load('area')
    const theme = getTheme(this.loginId)
    // const color = themeColors[theme]
    // const pageLinks = document.getElementsByClassName('.page-link')
    // for (let i = pageLinks.length ; i--;) {
    //   pageLinks[0].style.color = color
    // }
    // const pageActive = document.querySelector('a.page-link.btn-primary')
    // pageActive.style.backgroundColor = color
    // pageActive.style.color = '#ffffff'
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
    thumbnail(index) {
      return this.$parent.$options.methods.thumbnail.call(this.$parent, this.perPage * (this.currentPage - 1) + index)
    },
    exportCsv() {
      let headers
      if (this.params.custumCsvColumns) {
        headers = this.params.custumCsvColumns
      } else {
        headers = this.params.fields.map((val) => val.key)
      }
      headers = headers.filter((val) => !["style", "thumbnail", "actions", "updateAction"].includes(val))
      HtmlUtil.fileDL(this.params.name + ".csv", Util.converToCsv(this.list, headers), getCharSet(this.loginId))
    },
    style(index) {
      return this.$parent.$options.methods.style.call(this.$parent, index)
    },
    async edit(item, index, target) {
      let entity = item != null? await AppServiceHelper.fetch(this.appServicePath, item[this.id]): {}
      if (this.$parent.$options.methods.convBeforeEdit) {
        entity = this.$parent.$options.methods.convBeforeEdit.call(this.$parent, entity)
      }
      this.replaceAS({[this.name]: entity})
      this.$router.push(this.editPath)
    },
    async bulkEdit(item, index, target) {
      this.$router.push(this.params.bulkEditPath)
    },
    async bulkUpload(item, index, target) {
      this.$router.push(this.params.bulkUploadPath)
    },
    deleteConfirm(item, index, button) {
      this.modalInfo.title = this.$i18n.tnl('label.confirm')
      this.modalInfo.content = this.$i18n.tnl('message.deleteConfirm', {target: "ID:" + item[this.id]})
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
          const param = this.params.fields.map((val) => {
            let itemValue = originItem
            const keys = val.key.split("\.")
            keys.forEach(key => itemValue = itemValue[key])
            return itemValue
          })
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
      await AppServiceHelper.deleteEntity(this.appServicePath, id)
      await StateHelper.load(this.params.name, true)
      this.$parent.$options.methods.fetchData.apply(this.$parent)
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
</style>
