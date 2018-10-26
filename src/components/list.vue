<template>
  <div>
    <!-- searchbox -->
    <b-row v-if="!params.hideSearchBox && !params.extraFilter">
      <b-col md="6" class="my-1">
        <b-form-group horizontal class="mb-0" :label="$t('label.filter') ">
          <b-input-group>
            <b-form-input v-model="filter.reg" />
            <b-input-group-append>
              <b-btn :disabled="!filter" @click="filter.reg = ''" variant="secondary" v-t="'label.clear'"></b-btn>
            </b-input-group-append>
          </b-input-group>
        </b-form-group>
      </b-col>
      <b-col v-if="isEditable" class="mb-2 justify-content-end">
        <!-- 新規作成ボタン -->
        <b-button :variant='theme' @click="edit()" v-t="'label.createNew'"  class="float-right"/>
        <b-button v-if="params.bulkEditPath" :variant='theme'
          @click="bulkEdit()" v-t="'label.bulkRegister'"  class="float-right" :style="{ marginRight: '10px'}"/>
        <b-button v-if="params.csvOut" :variant='theme' @click="exportCsv" v-t="'label.download'"  class="float-right" :style="{ marginRight: '10px'}"/>
      </b-col>
    </b-row>
    <template v-if="!params.hideSearchBox && params.extraFilter">
      <!-- 追加フィルタがある場合 -->
      <b-form>
        <b-form-row class="mb-1">
            <b-col>
              <b-form-group :label="$t('label.filter')" horizontal>
                <b-input-group>
                  <b-form-input v-model="filter.reg" />
                  <b-input-group-append>
                    <b-btn :disabled="!filter" @click="filter. reg = ''" variant="secondary" v-t="'label.clear'" />
                  </b-input-group-append>
                </b-input-group>
              </b-form-group>
          </b-col>
          <b-col v-for="item of params.extraFilter" :key="item" class="customFilter">
            <b-form-group v-if="item === 'category'" :label="$t('label.category')" label-class="text-sm-right" horizontal>
              <b-form-select :options="categoryOptions" v-model="filter.extra.category" :style="{width: categorySelectWidth}"/>
            </b-form-group>
            <b-form-group v-if="item === 'group'" :label="$t('label.group')" label-class="text-sm-right" horizontal>
              <b-form-select :options="groupOptions" v-model="filter.extra.group" :style="{width: groupSelectWidth}"/>
            </b-form-group>
          </b-col>
        </b-form-row>
      </b-form>
      <b-form-row v-if="isEditable" class="mb-1">
        <b-col class="mb-6 justify-content-end">
        <!-- 新規作成ボタン -->
        <b-button :variant='theme' @click="edit()" v-t="'label.createNew'"  class="float-right"/>
        <b-button v-if="params.bulkEditPath" :variant='theme'
          @click="bulkEdit()" v-t="'label.bulkRegister'"  class="float-right" :style="{ marginRight: '10px'}"/>
        <b-button v-if="params.csvOut" :variant='theme' @click="exportCsv" v-t="'label.download'"  class="float-right" :style="{ marginRight: '10px'}"/>
      </b-col>
      </b-form-row>
      
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
        <img v-if="thumbnail(row.item)" :src="thumbnail(row.item)" height="70" />
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
  </div>
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

export default {
  mixin: [commonmixinVue], // not work
  props: ['params', 'list'],
  data() {
    return {
      currentPage: 1,
      perPage: 10,
      filter: {
        reg: null,
        extra: {
          category: null,
          group: null
        },
      },
      extraFilterMaxWidth: 9, // em
      extraFilterFactor: 1.3,
      modalInfo: { title: '', content: '', id:'' },
      totalRows: this.initTotalRows,
      file: null,
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
    ...mapState([
      'featureList',
    ]),
    ...mapState('app_service', [
      'categories',
      'groups',
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
    categorySelectWidth() {
      const list = this.categoryOptions.map((obj) => obj.text)
      let width = Util.getMaxTextLength(list, this.extraFilterMaxWidth)
      width *= this.extraFilterFactor
      return width + 'em'
    },
    groupSelectWidth() {
      const list = this.groupOptions.map((obj) => obj.text)
      let width = Util.getMaxTextLength(list, this.extraFilterMaxWidth)
      width *= this.extraFilterFactor
      return width + 'em'
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
    this.$parent.$options.methods.fetchData.apply(this.$parent)
    StateHelper.load('group')
    StateHelper.load('category')
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
  methods: {
    ...mapMutations('app_service', [
      'replaceAS', 
    ]),
    thumbnail(row) {
      return this.$parent.$options.methods.thumbnail.call(this.$parent, row)
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
  
</style>
