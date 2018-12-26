<template>
  <div>
    <!-- table -->
    <div v-if="show">
      <div v-for="categoryId in getCategoryIds(multiList)" :key="categoryId" class="card shadow-sm mb-3">
        <label v-t="getName(categoryId)" class="card-header" />
        <div class="card-body">
          <div v-for="row in multiList[categoryId]" :key="row.id">
            <b-form-group :label="getName(row.key, showKeyName)" :description="getName(row.description)">
              <span v-for="field in fields" :key="field.key">
                <b-form-select v-if="useInputPullDown(row[field.type])" v-model="row[field.key]" :options="getBooleanOptions()" form="updateForm"/>
                <input v-else-if="useInputNumberType(row[field.type])" v-model="row[field.key]" :pattern="numberPattern" type="text" class="form-control form-control-sm" maxlength="1000" required>
                <input v-else-if="useInputNumberListType(row[field.type])" v-model="row[field.key]" :pattern="numberListPattern" type="text" class="form-control form-control-sm" maxlength="1000" required>
                <input v-else v-model="row[field.key]" :type="getInputType(row[field.type])" maxlength="1000" class="form-control" form="updateForm" required>
              </span>
              <b-button v-t="'label.delete'" v-if="isSuperEditable" size="sm" variant="outline-danger" class="mt-2 float-right" @click.stop="deleteConfirm(row, $event.target)" />
            </b-form-group>
          </div>
        </div>
      </div>

      <b-form v-if="isSuperEditable" @submit.prevent="onRegistSubmit">
        <div v-if="useRegistForm" class="card shadow-sm mt-5 mb-3">
          <label v-t="'label.addSetting'" class="card-header" />
          <div class="card-body">
            <b-form-row class="mb-2">
              <label v-t="'label.key'" class="mr-2" />
              <input v-model="newForm.key" :type="'text'" class="form-control form-control-sm" maxlength="200" required >
            </b-form-row>
            <b-form-row class="mb-2">
              <label v-t="'label.valType'" class="mr-2" />
              <b-form-select v-model="newForm.type" :options="getTypeOptions()" class="form-control-sm" required @change="clearValue()" />
            </b-form-row>
            <b-form-row class="mb-2">
              <label v-t="'label.value'" class="mr-2" />
              <b-form-select v-if="useInputPullDown(newForm.type)" v-model="newForm.value" :options="getBooleanOptions()" required/>
              <input v-else-if="useInputNumberType(newForm.type)" v-model="newForm.value" :pattern="numberPattern" type="text" class="form-control form-control-sm" maxlength="1000" required>
              <input v-else-if="useInputNumberListType(newForm.type)" v-model="newForm.value" :pattern="numberListPattern" type="text" class="form-control form-control-sm" maxlength="1000" required>
              <input v-else v-model="newForm.value" :type="getInputType(newForm.type)" class="form-control form-control-sm" maxlength="1000" required>
            </b-form-row>
            <b-form-row class="float-right mt-3">
              <b-button v-t="'label.add'" v-if="isEditable" :variant="getButtonTheme()" type="submit" @click="register(true)" />
              <b-button v-t="'label.cancel'" type="button" variant="outline-danger" class="ml-2" @click="showForm(false)" />
            </b-form-row>
          </div>
        </div>
        <b-button v-t="'label.addForm'" v-if="!useRegistForm" :variant="getButtonTheme()" type="button" class="float-right" @click="showForm(true)"/>
      </b-form>
    </div>
  </div>
</template>

<script>

import _ from 'lodash'
import commonmixinVue from '../mixin/commonmixin.vue'
import editmixinVue from '../mixin/editmixin.vue'
import settingmixinVue from '../mixin/settingmixin.vue'

export default {
  mixins: [ editmixinVue, commonmixinVue, settingmixinVue ],
  props: {
    params: {
      type: Object,
      required: true,
    },
    multiList: {
      type: Object,
      default: () => []
    },
    showKeyName: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      ...this.params,
      useRegistForm: false,
      numberPattern: '^-?[0-9]+[.]?[0-9]*$',
      numberListPattern: '^(-?[0-9]+[.]?[0-9]*)+(,-?[0-9]+[.]?[0-9]*)*$',
      newForm: {},
      dummyKey: -1,
      column: 'null',
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
