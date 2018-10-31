<template>
  <div>
    <b-row class="mt-3">
      <b-alert variant="info" :show="showInfo">{{ message }}</b-alert>
      <b-alert variant="danger" dismissible :show="showAlert"  @dismissed="showAlert=false">{{ message }}</b-alert>
    </b-row>

    <!-- table -->
    <div v-if="show">
      <div v-for="categoryId in categoryIds" :key="categoryId" class="card shadow-sm mb-3">
        <label class="card-header" v-t="getName(categoryId)" />
        <div class="card-body">
          <div v-for="row in multiList[categoryId]" :key="row.id">
            <b-form-group :label="getName(row.key)" :description="getName(row.description)">
              <span v-for="field in fields" :key="field.key">
                <span v-if="useValueTypeRow(row, field)">
                  <span v-if="usePullDownRow(row, field)">
                    <b-form-select v-model="row[field.key]" :options="getBooleanOptions()" form="updateForm"/>
                  </span>
                  <span v-else>
                    <b-form-input v-model="row[field.key]" :type="getInputTypeRow(row, field)" maxlength="1000" form="updateForm"/>
                  </span>
                </span>
              </span>
              <b-button v-if="isSuperEditable" size="sm" @click.stop="deleteConfirm(row, $event.target)" variant="outline-danger" v-t="'label.delete'" class="mt-1 float-right" />
            </b-form-group>
          </div>
        </div>
      </div>

      <b-form @submit="onRegistSubmit" v-if="isSuperEditable">
        <div v-if="useRegistForm" class="card shadow-sm mt-5 mb-3">
          <label class="card-header" v-t="'label.addSetting'" />
          <div class="card-body">
            <b-form-group>
              <b-form-row>
                <b-col sm="2">
                  <label v-t="'label.key'" />
                </b-col>
                <b-col sm="5">
                  <b-form-input v-model="newForm.key" :type="'text'" class="form-control-sm" maxlength="20" required />
                </b-col>
              </b-form-row>
            </b-form-group>
            <b-form-group>
              <b-form-row>
                <b-col sm="2">
                  <label v-t="'label.valType'" />
                </b-col>
                <b-col sm="5">
                  <b-form-select v-model="newForm.type" :options="getTypeOptions()" @change="clearValue()" class="form-control-sm" required />
                </b-col>
              </b-form-row>
            </b-form-group>
            <b-form-group>
              <b-form-row>
                <b-col sm="2">
                  <label v-t="'label.value'" />
                </b-col>
                <b-col sm="5">
                  <b-form-select v-if="usePullDown(newForm.type)" v-model="newForm.value" :options="getBooleanOptions()" required/>
                  <b-form-input v-if="!usePullDown(newForm.type)" v-model="newForm.value" :type="getInputType(newForm.type)" class="form-control-sm" maxlength="1000" required/>
                </b-col>
                <b-col>
                  <div class="float-right">
                    <b-button v-if="isEditable" type="submit" :variant="theme" @click="register(true)" v-t="'label.add'" />
                    <b-button type="button" variant="outline-danger" @click="showForm(false)" v-t="'label.cancel'" class="ml-2" />
                  </div>
                </b-col>
              </b-form-row>
            </b-form-group>
          </div>
        </div>
        <b-button v-if="!useRegistForm" type="button" :variant="theme" @click="showForm(true)" v-t="'label.addForm'" class="float-right"/>
      </b-form>

      <b-form @submit="onSubmit" v-if="show" :id="'updateForm'">
        <b-button v-if="isEditable && !useRegistForm" type="submit" :variant="theme" @click="register(true)" class="ml-2" v-t="'label.update'" />
      </b-form>
    </div>

    <!-- modal -->
    <b-modal id="modalInfo" :title="modalInfo.title" @ok="execDelete(modalInfo.id)">
      {{ modalInfo.content }}
    </b-modal>
  </div>
</template>

<script>

import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import _ from 'lodash'
import editmixinVue from './editmixin.vue'
import * as MenuHelper from '../sub/helper/MenuHelper'
import * as HtmlUtil from '../sub/util/HtmlUtil'
import * as Util from '../sub/util/Util'
import { getButtonTheme, getTheme, themeColors } from '../sub/helper/ThemeHelper'

export default {
  mixins: [editmixinVue],
  props: ['params', 'multiList', 'newForm'],
  data() {
    return {
      ...this.params,
      useRegistForm: false,
      modalInfo: { title: '', content: '', id:'' },
    }
  },
  computed: {
    crud() {
      return 'update'
    },
    theme () {
      const theme = getButtonTheme(this.$store.state.loginId)
      return 'outline-' + theme
    },
    categoryIds() {
      return Object.keys(this.multiList)
    },
  },
  mounted() {
    this.$parent.$options.methods.fetchData.apply(this.$parent)
    const theme = getTheme(this.loginId)
    return 'outline-' + theme
  },
  methods: {
    getName(id) {
      if (!Util.hasValue(id)) {
        return null
      }
      let name = this.$i18n.tnl(`label["${id}"]`)
      if (name.startsWith("label[")) {
        return id
      }
      return name
    },
    useValueTypeRow(row, field) {
      return field.type && row[field.type]
    },
    usePullDownRow(row, field) {
      return this.usePullDown(row[field.type])
    },
    usePullDown(type) {
      return new RegExp(`^${type}$`, "i").test("boolean")
    },
    getBooleanOptions() {
      return [{text: "true", value: "true"}, {text: "false", value: "false"}]
    },
    getInputTypeRow(row, field) {
      return this.getInputType(row[field.type])
    },
    getInputType(type) {
      const regExp = new RegExp(`^${type}$`, "i")
      if(regExp.test("int") || regExp.test("number")){
        return "number"
      }
      if(regExp.test("email")){
        return "email"
      }
      if(regExp.test("url")){
        return "url"
      }
      return "text"
    },
    getTypeOptions() {
      return [
        {text: "文字列", value: "string"},
        {text: "数値", value: "number"},
        {text: "真偽値", value: "boolean"},
      ]
    },
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
      this.$root.$emit('bv::show::modal', 'modalInfo', button)
    },
    async execDelete(id) {
      await this.$parent.$options.methods.deleteEntity.call(this.$parent, id)
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
      if(!_.includes(this.categoryIds, "")){
        this.multiList[""] = []
      }
      this.multiList[""].push(entity)
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
