<template>
  <div>
    <b-row class="mt-3">
      <b-alert variant="info" :show="showInfo">{{ message }}</b-alert>
      <b-alert variant="danger" dismissible :show="showAlert"  @dismissed="showAlert=false">{{ message }}</b-alert>
    </b-row>

    <!-- table -->
    <b-form @submit="onSubmit" v-if="show">
      <div v-for="categoryId in categoryIds" :key="categoryId" class="card shadow-sm mb-3">
        <label class="card-header" v-t="getName(categoryId)" />
        <div class="card-body">
          <div v-for="row in multiList[categoryId]" :key="row.id">
            <b-form-group :label="getName(row.key)" :description="getName(row.description)">
              <span v-for="field in fields" :key="field.key">
                <span v-if="useValueType(row, field)">
                  <span v-if="usePullDown(row, field)">
                    <b-form-select v-model="row[field.key]" :options="getBooleanOptions()" />
                  </span>
                  <span v-else>
                    <b-form-input v-model="row[field.key]" :type="getInputType(row, field)" />
                  </span>
                </span>
              </span>
            </b-form-group>
          </div>
        </div>
      </div>

      <b-button v-if="isEditable" type="submit" :variant="theme" @click="register(true)" class="ml-2" v-t="'label.update'" />
    </b-form>
  </div>
</template>

<script>

import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import _ from 'lodash'
import * as AppServiceHelper from '../sub/helper/AppServiceHelper'
import editmixinVue from './editmixin.vue'
import * as MenuHelper from '../sub/helper/MenuHelper'
import * as HtmlUtil from '../sub/util/HtmlUtil'
import * as Util from '../sub/util/Util'
import { getButtonTheme, getTheme, themeColors } from '../sub/helper/ThemeHelper'

export default {
  mixins: [editmixinVue],
  props: ['params', 'multiList'],
  data() {
    return {
      ...this.params
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
      return Util.hasValue(id)? this.$i18n.t(`label.${id.replace("\.", "_")}`): undefined
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
    async save() {
      return this.$parent.$options.methods.save.apply(this.$parent)
   },
  }
}

</script>

<style scoped lang="scss">

</style>
