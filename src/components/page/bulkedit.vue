<template>
  <div>
    <div class="container">
      <alert :message="message" />

      <b-form v-if="show" @submit.prevent="onSubmit">
        <b-form-group>
          <label v-t="'label.csvFile'" />
          <b-form-file :key="formKey" v-model="form.csvFile" :placeholder="$t('message.selectFile') " accept=".csv" />
        </b-form-group>
        <b-form-group>
          <label v-t="'label.charSet'" />
          <b-form-select v-model="csvCharSet" :options="charSets" @change="charSetSelected" />
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
import * as CharSetHelper from '../../sub/helper/CharSetHelper'
import * as StateHelper from '../../sub/helper/StateHelper'
import { CHAR_SET } from '../../sub/constant/Constants'
import alert from '../parts/alert.vue'

export default {
  components: {
    alert,
  },
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
      csvCharSet: this.getInitCharSets(),
    }
  },
  computed: {
    ...mapState('app_service', [
      'sensors',
    ]),
    charSets(){
      return CHAR_SET.map(e => ({ value: e.id, text: this.$i18n.tnl('label.' + e.name) }))
    }
  },
  mounted() {
    StateHelper.load('sensor')
  },
  methods: {
    getInitCharSets(){
      const initSelect = CharSetHelper.detectBulkCharSet(this.$store.state.loginId)
      const selected = CHAR_SET.find(item => item.name === initSelect)
      return selected != null ? selected.id : CHAR_SET[0].id
    },
    charSetSelected (selected) {
      CharSetHelper.setBulkCharSet(this.$store.state.loginId, selected)
    },
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