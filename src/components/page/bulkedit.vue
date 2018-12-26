<template>
  <div>
    <div class="container">
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

      <b-form v-if="show" @submit.prevent="onSubmit">
        <b-form-group>
          <label v-t="'label.csvFile'" />
          <b-form-file :key="formKey" v-model="form.csvFile" :placeholder="$t('message.selectFile') " accept=".csv" />
        </b-form-group>
        <b-button :variant="getButtonTheme()" type="submit" @click="register(true)">
          {{ label }}
        </b-button>
        <b-button v-t="'label.back'" type="button" variant="outline-danger" class="ml-2" @click="backToList" />
      </b-form>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import commonmixinVue from '../mixin/commonmixin.vue'
import editmixinVue from '../mixin/editmixin.vue'
import * as StateHelper from '../../sub/helper/StateHelper'

export default {
  mixins: [ editmixinVue, commonmixinVue ],
  props: {
    name: {
      type: String,
      required: true,
    },
    id: {
      type: String,
      required: true,
    },
    backPath: {
      type: String,
      required: true,
    },
    appServicePath: {
      type: String,
      required: true,
    },
  },
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
  computed: {
    ...mapState('app_service', [
      'sensors',
    ]),
  },
  mounted() {
    StateHelper.load('sensor')
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