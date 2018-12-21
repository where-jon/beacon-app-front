<template>
  <div>
    <div class="container">
      <b-alert variant="info" dismissible :show="showInfo">
        {{ message }}
      </b-alert>
      <b-alert variant="danger" dismissible :show="showAlert" @dismissed="showAlert=false">
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
          <b-form-file :key="formKey" v-model="form.csvFile" accept=".csv" :placeholder="$t('message.selectFile') " />
        </b-form-group>
        <b-button type="submit" :variant="getButtonTheme()" @click="register(true)">
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
  props: ['name', 'id', 'backPath', 'appServicePath'],
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