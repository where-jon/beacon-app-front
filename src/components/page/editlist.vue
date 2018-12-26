<template>
  <div>
    <b-alert :show="showInfo" variant="info" dismissible>
      {{ message }}
    </b-alert>
    <b-alert :show="showAlert" variant="danger" dismissible @dismissed="showAlert=false">
      <template v-if="Array.isArray(message)">
        <span v-for="line in message" :key="line">
          {{ line }} <br>
        </span>
      </template>
      <span v-else>
        {{ message }}
      </span>
    </b-alert>

    <!-- table -->
    <div v-if="show">
      <div v-for="categoryId in getCategoryIds(multiList)" :key="categoryId" class="card shadow-sm mb-3">
        <label v-t="getName(categoryId)" class="card-header" />
        <div class="card-body">
          <div v-for="row in multiList[categoryId]" :key="row.id">
            <b-form-group :label="getName(row.key, showKeyName)" :description="getName(row.description)">
              <span v-for="field in fields" :key="field.key">
                <b-form-select v-if="useInputPullDown(row[field.type])" v-model="row[field.key]" :options="getBooleanOptions()" form="updateForm" />
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
              <input v-model="newForm.key" :type="'text'" class="form-control form-control-sm" maxlength="200" required>
            </b-form-row>
            <b-form-row class="mb-2">
              <label v-t="'label.valType'" class="mr-2" />
              <b-form-select v-model="newForm.type" :options="getTypeOptions()" class="form-control-sm" required @change="clearValue()" />
            </b-form-row>
            <b-form-row class="mb-2">
              <label v-t="'label.value'" class="mr-2" />
              <b-form-select v-if="useInputPullDown(newForm.type)" v-model="newForm.value" :options="getBooleanOptions()" required />
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
        <b-button v-t="'label.addForm'" v-if="!useRegistForm" :variant="getButtonTheme()" type="button" class="float-right" @click="showForm(true)" />
      </b-form>

      <b-form v-if="show" :id="'updateForm'" @submit.prevent="onSubmit">
        <b-button v-t="'label.update'" v-if="isEditable && !useRegistForm" :variant="getButtonTheme()" type="submit" class="ml-2" @click="register(true)" />
      </b-form>
    </div>

    <!-- modal -->
    <b-modal id="modalInfo" :title="modalInfo.title" @ok="execDelete(modalInfo.item)">
      {{ modalInfo.content }}
    </b-modal>
  </div>
</template>

<script>

import _ from 'lodash'
import commonmixinVue from '../mixin/commonmixin.vue'
import editmixinVue from '../mixin/editmixin.vue'

export default {
  mixins: [ editmixinVue, commonmixinVue ],
  props: {
    params: {
      type: Object,
      required: true,
    },
    multiList: {
      type: Object,
      default: () => []
    },
    newForm: {
      type: Object,
      default: () => {}
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
      modalInfo: { title: '', content: '', id:'' },
      numberPattern: '^-?[0-9]+[.]?[0-9]*$',
      numberListPattern: '^(-?[0-9]+[.]?[0-9]*)+(,-?[0-9]+[.]?[0-9]*)*$',
    }
  },
  computed: {
    crud() {
      return 'update'
    },
  },
  mounted() {
    this.$parent.$options.methods.fetchData.apply(this.$parent)
  },
  methods: {
    clearValue(){
      this.newForm.value = null
    },
    beforeReload(){
      this.useRegistForm = false
      this.$parent.$options.methods.beforeReload.apply(this.$parent)
    },
    deleteConfirm(item, button) {
      this.modalInfo.title = this.$i18n.tnl('label.confirm')
      this.modalInfo.content = this.$i18n.tnl('message.deleteConfirm', {target: this.getName(item.key)})
      this.modalInfo.id = item.id
      this.modalInfo.item = item
      this.$root.$emit('bv::show::modal', 'modalInfo', button)
    },
    async execDelete(entity) {
      entity.value = null
      await this.$parent.$options.methods.deleteEntity.call(this.$parent, entity)
      await this.$parent.$options.methods.fetchData.call(this.$parent, true)
    },
    showForm(isShow){
      this.useRegistForm = isShow
    },
    onRegistSubmit(evt){
      const entity = this.$parent.$options.methods.addNewEntity.apply(this.$parent)
      if(!this.multiList){
        this.multiList = []
      }
      if(!_.includes(this.getCategoryIds(this.multiList), '')){
        this.multiList[''] = []
      }
      this.multiList[''].push(entity)
      this.onSubmit(evt)
    },
    async save() {
      return this.$parent.$options.methods.save.apply(this.$parent)
    },
  }
}

</script>

<style scoped lang="scss">

</style>
