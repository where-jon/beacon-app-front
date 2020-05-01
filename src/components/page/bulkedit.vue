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
import { CHAR_SET, UPDATE_ONLY_NN, IGNORE } from '../../sub/constant/Constants'
import * as Util from '../../sub/util/Util'
import * as AppServiceHelper from '../../sub/helper/dataproc/AppServiceHelper'
import * as BulkHelper from '../../sub/helper/dataproc/BulkHelper'
import * as MasterHelper from '../../sub/helper/domain/MasterHelper'
import * as CharSetHelper from '../../sub/helper/base/CharSetHelper'
import * as LocalStorageHelper from '../../sub/helper/base/LocalStorageHelper'
import * as StateHelper from '../../sub/helper/dataproc/StateHelper'
import * as ViewHelper from '../../sub/helper/ui/ViewHelper'
import commonmixin from '../mixin/commonmixin.vue'
import alert from '../parts/alert.vue'

export default {
  components: {
    alert,
  },
  mixins: [commonmixin],
  props: {
    name: {
      type: String,
      required: true,
    },
    pName: {
      type: String,
      default: null,
    },
    bulkName: {
      type: String,
      default: null,
    },
    bulkDispName: {
      type: String,
      default: null,
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
      form: {
        csvFile: null,
      },
      message: '',
      mutex: false,
      bulkRegister: true,
      formKey: 0,
      csvCharSet: BulkHelper.getInitCharSets(this.$store.state.loginId),
    }
  },
  computed: {
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
      ViewHelper.disabledButtons(true)
      this.message = ''
      StateHelper.initShowMessage()
      evt.preventDefault()
      this.$nextTick(async () => {
        this.showProgress()
        const name = Util.getValue(this, 'bulkName', this.name)
        const dispName = Util.getValue(this, 'bulkDispName', name)
        try {
          if(this.$parent.$options.methods && this.$parent.$options.methods.onSaving){
            await this.$parent.$options.methods.onSaving.call(this.$parent)
          }
          else{
            await this.bulkSave()
          }
          this.message = this.$i18n.tnl('message.bulkRegisterCompleted', {target: this.$i18n.tnl('label.' + dispName)})
          this.replace({showInfo: true})
          if(this.$parent.$options.methods && this.$parent.$options.methods.onSaved) {
            this.$parent.$options.methods.onSaved.call(this.$parent)
          }
          this.editAgain()
        }
        catch(e) {
          console.error(e)
          if (e.message == 'Network Error') {
            this.message = this.$i18n.tnl('message.errUploadFileChanged')
          } else {
            this.message = BulkHelper.getBulkErrorMessage(e, dispName, this.showLine)
          }
          this.replace({showAlert: true})
          window.scrollTo(0, 0)
        }
        finally{
          this.replaceAS({showLine: false})
        }
        this.hideProgress()
        ViewHelper.disabledButtons(false)
      })
    },
    editAgain(){
      this.$refs.csvFile.reset()
      this.form.csvFile = null
      window.scrollTo(0, 0)
    },
    async bulkSaveByCsvFile() {
      if (!this.form.csvFile) {
        throw new Error(this.$t('message.emptyFile'))
      }
      const getConf = this.$parent.$options.methods.getConf
      let formData = new FormData()
      formData.append('csvFile', this.form.csvFile)
      if (getConf) {
        const conf = getConf.call(this.$parent)
        formData.append('conf', JSON.stringify(conf))
      }
      const charSet = CHAR_SET.find(e => e.id == this.csvCharSet)
      let result = await AppServiceHelper.bulkSaveByCsvFile(this.appServicePath, formData, charSet.name, UPDATE_ONLY_NN.NONE, IGNORE.ON)
      if(this.$parent.$options.methods && this.$parent.$options.methods.onSaved) {
        this.$parent.$options.methods.onSaved.call(this.$parent)
      }
    },
  }
}
</script>

<style scoped lang="scss">

</style>