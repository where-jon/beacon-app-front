<template>
  <div>
    <div class="container">

      <b-alert variant="info" :show="showInfo">{{ message }}</b-alert>
      <b-alert variant="danger" dismissible :show="showAlert"  @dismissed="showAlert=false" v-html="message"></b-alert>

      <b-form @submit="onSubmit" v-if="show">
        <b-form-group>
          <label v-t="'label.csvFile'" />
          <b-form-file v-model="form.csvFile" accept=".csv" :placeholder="$t('message.selectFile') "></b-form-file>
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

let that

export default {
  props: ["name", "id", "backPath", "appServicePath", "form"],
  mixins: [editmixinVue],
  data() {
    return {
      mutex: false,
      bulkRegister: true,
    }
  },
  mounted() {
    that = this
  },
  computed: {
    theme () {
      const theme = getTheme(this.$store.state.loginId)
      return 'outline-' + theme
    },
  },
  methods: {
    async save() {
      return this.$parent.$options.methods.save.call(this.$parent)
    },
  }
}
</script>

<style scoped lang="scss">

</style>