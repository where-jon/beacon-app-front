<template>
  <div>
    <!-- table -->
    <div v-if="show">
      <div v-for="categoryId in getCategoryIds(multiList)" :key="categoryId" class="card shadow-sm mb-3">
        <label class="card-header" v-t="getName(categoryId)" />
        <div class="card-body">
          <div v-for="row in multiList[categoryId]" :key="row.id">
            <b-form-group :label="getName(row.key, showKeyName)" :description="getName(row.description)">
              <span v-for="field in fields" :key="field.key">
                <b-form-select v-if="useInputPullDown(row[field.type])" v-model="row[field.key]" :options="getBooleanOptions()" form="updateForm"/>
                <input v-else-if="useInputNumberType(row[field.type])" v-model="row[field.key]" type="text" class="form-control form-control-sm" :pattern="numberPattern" maxlength="1000" required/>
                <input v-else-if="useInputNumberListType(row[field.type])" v-model="row[field.key]" type="text" class="form-control form-control-sm" :pattern="numberListPattern" maxlength="1000" required/>
                <input v-else v-model="row[field.key]" :type="getInputType(row[field.type])" maxlength="1000" class="form-control" form="updateForm" required/>
              </span>
              <b-button v-if="isSuperEditable" size="sm" @click.stop="deleteConfirm(row, $event.target)" variant="outline-danger" v-t="'label.delete'" class="mt-2 float-right" />
            </b-form-group>
          </div>
        </div>
      </div>

      <b-form @submit.prevent="onRegistSubmit" v-if="isSuperEditable">
        <div v-if="useRegistForm" class="card shadow-sm mt-5 mb-3">
          <label class="card-header" v-t="'label.addSetting'" />
          <div class="card-body">
            <b-form-row class="mb-2">
              <label v-t="'label.key'" class="mr-2" />
              <input v-model="newForm.key" :type="'text'" class="form-control form-control-sm" maxlength="200" required />
            </b-form-row>
            <b-form-row class="mb-2">
              <label v-t="'label.valType'" class="mr-2" />
              <b-form-select v-model="newForm.type" :options="getTypeOptions()" @change="clearValue()" class="form-control-sm" required />
            </b-form-row>
            <b-form-row class="mb-2">
              <label v-t="'label.value'" class="mr-2" />
              <b-form-select v-if="useInputPullDown(newForm.type)" v-model="newForm.value" :options="getBooleanOptions()" required/>
              <input v-else-if="useInputNumberType(newForm.type)" v-model="newForm.value" type="text" class="form-control form-control-sm" :pattern="numberPattern" maxlength="1000" required/>
              <input v-else-if="useInputNumberListType(newForm.type)" v-model="newForm.value" type="text" class="form-control form-control-sm" :pattern="numberListPattern" maxlength="1000" required/>
              <input v-else v-model="newForm.value" :type="getInputType(newForm.type)" class="form-control form-control-sm" maxlength="1000" required/>
            </b-form-row>
            <b-form-row class="float-right mt-3">
              <b-button v-if="isEditable" type="submit" :variant="getButtonTheme()" @click="register(true)" v-t="'label.add'" />
              <b-button type="button" variant="outline-danger" @click="showForm(false)" v-t="'label.cancel'" class="ml-2" />
            </b-form-row>
          </div>
        </div>
        <b-button v-if="!useRegistForm" type="button" :variant="getButtonTheme()" @click="showForm(true)" v-t="'label.addForm'" class="float-right"/>
      </b-form>
    </div>
  </div>
</template>

<script>

import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import _ from 'lodash'
import commonmixinVue from '../mixin/commonmixin.vue';
import editmixinVue from '../mixin/editmixin.vue'
import settingmixinVue from '../mixin/settingmixin.vue'
import * as MenuHelper from '../../sub/helper/MenuHelper'
import * as HtmlUtil from '../../sub/util/HtmlUtil'
import * as Util from '../../sub/util/Util'

export default {
  mixins: [ editmixinVue, commonmixinVue, settingmixinVue ],
  props: ['params', 'multiList', 'showKeyName'],
  data() {
    return {
      ...this.params,
      useRegistForm: false,
      numberPattern: "^-?[0-9]+[\.]?[0-9]*$",
      numberListPattern: "^(-?[0-9]+[\.]?[0-9]*)+(,-?[0-9]+[\.]?[0-9]*)*$",
      newForm: {},
      dummyKey: -1,
      column: "null",
    }
  },
  methods: {
    clearValue(){
      this.newForm.value = null
    },
    deleteConfirm(item, button) {
      this.multiList[this.column] = this.multiList[this.column].filter((val) => val.settingId != item.settingId)
      if(this.multiList[this.column].length == 0){
        delete this.multiList[this.column]
      }
      this.$forceUpdate()
    },
    showForm(isShow){
      this.useRegistForm = isShow
    },
    onRegistSubmit(evt){
      const entity = {
        settingId: this.dummyKey--,
        key: this.newForm.key,
        valType: this.newForm.type,
        value: this.format(this.newForm.value, this.newForm.type),
      }
      if(!this.multiList){
        this.multiList = []
      }
      if(!_.includes(this.getCategoryIds(this.multiList), this.column)){
        this.multiList[this.column] = []
      }
      this.multiList[this.column].push(entity)
      this.showForm(false)
      this.newForm = {}
    },
  }
}

</script>

<style scoped lang="scss">

</style>
