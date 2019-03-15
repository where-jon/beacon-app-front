<template>
  <div>
    <alert :message="message" />

    <!-- table -->
    <div v-if="show">
      <div v-for="categoryId in getCategoryIds(multiList)" :key="categoryId" class="card shadow-sm mb-3">
        <label v-t="getName(categoryId)" class="card-header" />
        <div class="card-body">
          <div v-for="row in multiList[categoryId]" :key="row.id">
            <b-form-group :label="getName(row.key, showKeyName)" :description="getName(row.description)">
              <span v-for="field in fields" :key="field.key">
                <b-form-select v-if="useInputPullDown(row[field.type])" v-model="row[field.key]" :options="getBooleanOptions()" form="updateForm" />
                <input v-else-if="useInputNumberType(row[field.type])" v-model="row[field.key]" :pattern="numberPattern" type="text" class="form-control form-control-sm" maxlength="1000" required :readonly="!isUpdatable" :disabled="!isUpdatable">
                <input v-else-if="useInputNumberListType(row[field.type])" v-model="row[field.key]" :pattern="numberListPattern" type="text" class="form-control form-control-sm" maxlength="1000" required :readonly="!isUpdatable" :disabled="!isUpdatable">
                <input v-else v-model="row[field.key]" :type="getInputType(row[field.type])" maxlength="1000" class="form-control" form="updateForm" required :readonly="!isUpdatable" :disabled="!isUpdatable">
              </span>
              <b-button v-if="isDeleteable" v-t="'label.delete'" size="sm" variant="outline-danger" class="mt-2 float-right" @click.stop="deleteConfirm(row, $event.target)" />
            </b-form-group>
          </div>
        </div>
      </div>

      <b-form v-if="isRegistable" @submit.prevent="onRegistSubmit">
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
              <b-button v-t="'label.add'" :variant="getButtonTheme()" type="submit" @click="register(true)" />
              <b-button v-t="'label.cancel'" type="button" variant="outline-danger" class="ml-2" @click="showForm(false)" />
            </b-form-row>
          </div>
        </div>
        <b-button v-if="!useRegistForm" v-t="'label.addForm'" :variant="getButtonTheme()" type="button" class="float-right" @click="showForm(true)" />
      </b-form>

      <b-form v-if="show" :id="'updateForm'" @submit.prevent="onSubmit">
        <b-button v-if="isUpdatable && !useRegistForm" v-t="'label.update'" :variant="getButtonTheme()" type="submit" class="ml-2" @click="register(true)" />
      </b-form>
    </div>

    <!-- modal -->
    <b-modal id="modalInfo" :title="modalInfo.title" @ok="execDelete(modalInfo.item)">
      {{ modalInfo.content }}
    </b-modal>
  </div>
</template>

<script>

import commonmixinVue from '../mixin/commonmixin.vue'
import editmixinVue from '../mixin/editmixin.vue'
import settingmixinVue from '../mixin/settingmixin.vue'
import alert from '../parts/alert.vue'
import * as HtmlUtil from '../../sub/util/HtmlUtil'

export default {
  components: {
    alert,
  },
  mixins: [ editmixinVue, commonmixinVue, settingmixinVue ],
  props: {
    params: {
      type: Object,
      required: true,
    },
    multiList: {
      type: Object,
      default: () => {}
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
    this.$nextTick(() => HtmlUtil.setCustomValidationMessage())
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
      if(this.$parent.$options.methods.afterCrud){
        await this.$parent.$options.methods.afterCrud.apply(this.$parent)
      }
      await this.$parent.$options.methods.fetchData.call(this.$parent, true)
    },
    async showForm(isShow){
      this.useRegistForm = isShow
      await this.$parent.$options.methods.resetNewForm.call(this.$parent, isShow)
      this.$nextTick(() => HtmlUtil.setCustomValidationMessage())
    },
    onRegistSubmit(evt){
      this.onSubmit(evt)
    },
    async afterCrud() {
      if(this.$parent.$options.methods.afterCrud){
        await this.$parent.$options.methods.afterCrud.apply(this.$parent)
      }
    },
    async save() {
      return await this.$parent.$options.methods.save.apply(this.$parent)
    },
  }
}

</script>

<style scoped lang="scss">

</style>
