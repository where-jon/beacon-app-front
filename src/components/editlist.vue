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
                <span v-if="useValueType(row, field)">
                  <span v-if="usePullDown(row, field)">
                    <b-form-select v-model="row[field.key]" :options="getBooleanOptions()" form="updateForm"/>
                  </span>
                  <span v-else>
                    <b-form-input v-model="row[field.key]" :type="getInputType(row, field)" maxlength="1000" form="updateForm"/>
                  </span>
                </span>
              </span>
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
                  <b-form-select v-model="newForm.type" :options="getTypeOptions()" class="form-control-sm" required />
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
      return Util.hasValue(id)? this.$i18n.tnl(`label.${id.replace("\.", "_")}`): null
    },
    useValueType(row, field) {
      return field.type && row[field.type]
    },
    usePullDown(row, field) {
      return new RegExp(`^${row[field.type]}$`, "i").test("boolean")
    },
    getBooleanOptions() {
      return [{text: "True", value: 1}, {text: "False", value: 0}]
    },
    getInputType(row, field) {
      const regExp = new RegExp(`^${row[field.type]}$`, "i")
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
    beforeReload(){
      this.useRegistForm = false
      this.$parent.$options.methods.beforeReload.apply(this.$parent)
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
