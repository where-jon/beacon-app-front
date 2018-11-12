<template>
  <div>
    <div class="container">

      <b-alert variant="info" dismissible :show="showInfo">{{ message }}</b-alert>
      <b-alert variant="danger" dismissible :show="showAlert"  @dismissed="showAlert=false">
        <div v-html="message" />
      </b-alert>

      <b-form @submit="onSubmit" v-if="show">
        <b-form-group>
          <label v-t="'label.csvFile'" />
          <b-form-file :key="formKey" v-model="form.csvFile" accept=".csv" :placeholder="$t('message.selectFile') "></b-form-file>
        </b-form-group>
        <b-button type="submit" :variant="theme" @click="register(true)" >{{ label }}</b-button>
        <b-button type="button" variant="outline-danger" @click="backToList" class="ml-2" v-t="'label.back'"/>
      </b-form>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import _ from 'lodash'
import editmixinVue from './editmixin.vue'
import { getButtonTheme } from '../sub/helper/ThemeHelper'
import { getTheme } from '../sub/helper/ThemeHelper'
import * as StateHelper from '../sub/helper/StateHelper'

export default {
  props: ["name", "id", "backPath", "appServicePath"],
  mixins: [editmixinVue],
  data() {
    return {
      mutex: false,
      bulkRegister: true,
      formKey: 0,
      form: {
        csvFile: null,
      },
    }
  },
  mounted() {
    StateHelper.load('sensor')
  },
  computed: {
    theme () {
      const theme = getTheme(this.$store.state.loginId)
      return 'outline-' + theme
    },
    ...mapState('app_service', [
      'sensors',
    ]),
  },
  methods: {
    beforeReload(){
      this.formKey++
      this.form.csvFile = null
    },
    async afterCrud() {
      if(this.$parent.$options.methods.afterCrud){
        this.$parent.$options.methods.afterCrud.call(this.$parent, this.bulkSave)
      }
    },
    async save() {
      return this.$parent.$options.methods.save.call(this.$parent, this.bulkSave)
    },
  }
}
</script>

<style scoped lang="scss">

</style>