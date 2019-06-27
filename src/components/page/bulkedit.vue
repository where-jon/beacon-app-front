<template>
  <div>
    <div class="container">
      <alert :message="message" />

      <b-form @submit.prevent="save">
        <b-form-group>
          <label v-t="'label.csvFile'" />
          <b-form-file :key="formKey" ref="csvFile" v-model="form.csvFile" :placeholder="$t('message.selectFile') " accept=".csv" />
        </b-form-group>
        <b-form-group>
          <label v-t="'label.charSet'" />
          <b-form-select v-model="csvCharSet" :options="charSets" @change="charSetSelected" />
        </b-form-group>
        <b-button :variant="theme" type="submit">
          {{ $i18n.tnl('label.bulkRegister') }}
        </b-button>
        <b-button v-t="'label.back'" type="button" variant="outline-danger" class="ml-2" @click="backToList" />
      </b-form>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import commonmixinVue from '../mixin/commonmixin.vue'
import * as Util from '../../sub/util/Util'
import * as AppServiceHelper from '../../sub/helper/AppServiceHelper'
import * as CharSetHelper from '../../sub/helper/CharSetHelper'
import * as StateHelper from '../../sub/helper/StateHelper'
import * as BulkHelper from '../../sub/helper/BulkHelper'
import * as LocalStorageHelper from '../../sub/helper/LocalStorageHelper'
import { getButtonTheme } from '../../sub/helper/ThemeHelper'
import { CHAR_SET, UPDATE_ONLY_NN, IGNORE } from '../../sub/constant/Constants'
import alert from '../parts/alert.vue'

export default {
  components: {
    alert,
  },
  mixins: [ commonmixinVue ],
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
      csvCharSet: BulkHelper.getInitCharSets(this.$store.state.loginId),
      message: '',
    }
  },
  computed: {
    ...mapState('app_service', [
      'sensors',
    ]),
    theme () {
      return getButtonTheme()
    },
    charSets(){
      return CHAR_SET.map(e => ({ value: e.id, text: this.$i18n.tnl('label.' + e.name) }))
    }
  },
  mounted() {
    const message = LocalStorageHelper.popLocalStorage('bulkMessage')
    if(message){
      this.message = message
      this.replace({showInfo: true})
    }
    StateHelper.load('sensor')
  },
  methods: {
    backToList(event, path) {
      this.$router.push(path? path: this.backPath)
    },
    charSetSelected (selected) {
      CharSetHelper.setBulkCharSet(this.$store.state.loginId, selected)
    },
    onBeforeReload(){
      this.formKey++
      this.form.csvFile = null
    },
    async save(evt) {
      this.message = ''
      StateHelper.initShowMessage()
      evt.preventDefault()
      this.$nextTick(async () => {
        this.showProgress()
        try {
          await this.$parent.$options.methods.onSaving.call(this.$parent)
          await StateHelper.load(this.name, true)
          this.message = this.$i18n.tnl('message.bulkRegisterCompleted', {target: this.$i18n.tnl('label.' + this.name)})
          this.replace({showInfo: true})
          if(this.$parent.$options.methods.onSaved) {
            this.$parent.$options.methods.onSaved.call(this.$parent)
          }
          this.editAgain()
        }
        catch(e) {
          console.error(e)
          this.message = BulkHelper.getBulkErrorMessage(e, this.name, this.showLine)
          this.replace({showAlert: true})
          window.scrollTo(0, 0)
        }
        finally{
          this.replaceAS({showLine: false})
        }
        this.hideProgress()
      })
    },
    editAgain(){
      this.$refs.csvFile.reset()
      this.form.csvFile = null
      window.scrollTo(0, 0)
    },
    async bulkSave(option) {
      if (!this.form.csvFile) {
        throw new Error(this.$t('message.emptyFile'))
      }
      const reader = new FileReader()
      const readerParam = {readFin: false, error: null, entities: [], sameLine: []}
      this.setReaderOnload(reader, readerParam, option)
      reader.readAsArrayBuffer(this.form.csvFile)
      if (!readerParam.readFin) {
        await Util.sleep(100)
      }
      
      if (readerParam.error || !readerParam.entities || readerParam.entities.length == 0) {
        throw new Error(readerParam.error? readerParam.error: this.$i18n.tnl('message.csvNotFound'))
      }
      if(Util.hasValue(readerParam.sameLine)){
        throw new Error(`${this.$i18n.tnl('message.csvSameKey')}${BulkHelper.formatBulkErrorLine(readerParam.sameLine)}`)
      }

      this.replaceAS({showLine: true})
      BulkHelper.entityKeyCheck(this.name, readerParam.entities)
      await AppServiceHelper.bulkSave(this.appServicePath, readerParam.entities, UPDATE_ONLY_NN.NONE, IGNORE.ON)
      if(this.$parent.$options.methods.onSaved) {
        this.$parent.$options.methods.onSaved.call(this.$parent)
      }
    },
    setReaderOnload(reader, readerParam, option){
      reader.onload = () => {
        try {
          const csv = BulkHelper.convertBulkCsvObj(this.$store.state.loginId, reader.result)
          if (!csv || !csv.data || csv.errors && csv.errors.length > 0) {
            console.error(csv.errors)
            readerParam.error = BulkHelper.createCsvErrorMessage(csv.errors)
            readerParam.readFin = true
            return
          }
          console.debug(csv)
          BulkHelper.setCsvParamList(this, this.id, readerParam, csv.data, option)
          console.debug(readerParam.entities)
        } catch (e) {
          console.error(e)
          readerParam.error = e.message
        }
        readerParam.readFin = true
      }
    },
  }
}
</script>

<style scoped lang="scss">

</style>