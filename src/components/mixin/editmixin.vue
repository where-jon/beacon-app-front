
<script>
import { mapState } from 'vuex'
import _ from 'lodash'
import * as AppServiceHelper from '../../sub/helper/AppServiceHelper'
import * as ViewHelper from '../../sub/helper/ViewHelper'
import * as MenuHelper from '../../sub/helper/MenuHelper'
import * as StateHelper from '../../sub/helper/StateHelper'
import * as LocalStorageHelper from '../../sub/helper/LocalStorageHelper'
import * as ImageHelper from '../../sub/helper/ImageHelper'
import { APP } from '../../sub/constant/config'
import * as StringUtil from '../../sub/util/StringUtil'
import * as ArrayUtil from '../../sub/util/ArrayUtil'
import commonmixinVue from './commonmixin.vue'

export default {
  mixins: [commonmixinVue],  
  data() {
    return {
      show: true,
      message: '',
      warnMessage: '',
      again: true,
      createMessage: true,
    }
  },
  computed: {
    label() {
      return this.$i18n.tnl('label.' + this.crud)
    },
    crud() {
      return this.bulkRegister? 'bulkRegister': this.isUpdate? 'update': 'register'
    },
    isUpdate() {
      return this[this.name] && this[this.name][this.id] != null
    },
    isUpdatable() {
      return MenuHelper.isUpdatable(this.backPath)
    },
    isRegistable() {
      return MenuHelper.isRegistable(this.backPath)
    },
    isDeleteable() {
      return MenuHelper.isDeleteable(this.backPath)
    },
    isEditable() {
      return this.isRegistable || this.isUpdatable
    },
    isProvider(){
      const loginInfo = LocalStorageHelper.getLogin()
      return loginInfo.isProvider
    },
    ...mapState('app_service', [
      'roles',
      'listMessage',
      'showLine',
    ]),
  },
  mounted() {
    this.replaceAS({listMessage: null})
    this.replace({showWarn: false})
    this.replace({showAlert: false})
    this.replace({showInfo: false})
  },
  methods: {
    doBeforeSubmit(again) {
      this.again = again
      return true
    },
    backToList(event, path) {
      this.$router.push(path? path: this.backPath)
    },
    isShown(conf, column) {
      const keys = conf.split('.')
      const setting = keys.reduce((prev, cur) => prev[cur], APP)
      if(ArrayUtil.isArray(setting)){
        return ArrayUtil.includesIgnoreCase(setting, column)
      }
      return setting
    },
    async onSaving() {
      return await AppServiceHelper.save(this.appServicePath, this.form, this.updateOnlyNN)
    },
    editAgain(){
      this.form = {}
      ViewHelper.applyDef(this.form, this.defValue)
      if(this.onBeforeReload) {
        if(this.vueSelected && typeof this.vueSelected == 'object'){
          Object.keys(this.vueSelected).forEach(key => {
            this.vueSelected[key] = ArrayUtil.isArray(this.vueSelected[key])? []: null
          })
        }
        this.onBeforeReload()
      }
      let customFileLabel = document.getElementsByClassName('custom-file-label')
      if (customFileLabel && customFileLabel[0]) {
        customFileLabel[0].innerText =''
      }
      window.scrollTo(0, 0)
    },
    getSubmitErrorMessage(e){
      if (e.key) {
        return this.$i18n.tnl('message.' + e.type, {key: this.$i18n.tnl('label.' + this.modifyColName(StringUtil.snake2camel(e.key))), val: this.modifyVal(StringUtil.snake2camel(e.key), e.val)})
      }
      if(e.col){
        return this.$i18n.tnl('message.' + e.type, {col: this.$i18n.tnl(`label.${e.col}`), value: e.val})
      }
      if(e.bulkError) {
        return _.map(_.orderBy(e.bulkError, ['line'], ['asc']), (err) => {
          let col = this.modifyColName(err.col.trim())
          return this.$i18n.tline('message.bulk' + err.type + 'Failed', 
            {line: err.line, col: this.$i18n.tnl(`label.${col}`), value: StringUtil.sanitize(err.value), min: err.min, max: err.max, candidates: err.candidates, num: err.num, unit: err.unit? this.$i18n.tnl(`label.${err.unit}Unit`): '', target: err.target? this.$i18n.tnl(`label.${err.target}`): ''},
            this.showLine)
        }).filter((val, idx, arr) => arr.indexOf(val) == idx)
      }
      return this.message = this.$i18n.terror('message.' + this.crud + 'Failed', {target: this.$i18n.tnl('label.' + this.name), code: e.message})
    },
    async save(evt) {
      this.message = ''
      this.warnMessage = ''
      this.replace({showWarn: false})
      this.replace({showAlert: false})
      this.replace({showInfo: false})
      evt.preventDefault()
      this.$nextTick(async () => {
        this.showProgress()
        try {
          await this.onSaving()
          await StateHelper.load(this.name, true)
          if (this.name == 'area') {
            await ImageHelper.loadImageArea(this.form.areaId)
          }
          this.message = this.$i18n.tnl('message.' + this.crud + 'Completed', {target: this.$i18n.tnl('label.' + this.name)})
          this.replace({showInfo: true})
          if(this.onSaved) {
            this.onSaved()
          }
          if (this.again) {
            this.editAgain()
          }
          else {
            if(this.createMessage){
              this.replaceAS({listMessage: this.message})
            }
            this.replaceAS({moveEditPage: this.isUpdate})
            this.backToList()
          }
        }
        catch(e) {
          console.error(e)
          this.message = this.getSubmitErrorMessage(e)
          this.replace({showAlert: true})
          window.scrollTo(0, 0)
        }
        finally{
          this.replaceAS({showLine: false})
        }
        this.hideProgress()
      })
    },
    modifyColName(col) {
      if (col == 'TXID'){
        return APP.TX.BTX_MINOR == 'minor'? 'minor': 'btxId'
      }
      if (col == 'btxId' && APP.TX.BTX_MINOR == 'minor') {
        return 'minor'
      }
      return col
    },
    modifyVal(col, val) {
      if (col == 'TXID'){
        if(APP.TX.BTX_MINOR == 'minor' && this.minor){
          return this.minor
        }
        if(APP.TX.BTX_MINOR != 'minor' && this.btxId){
          return this.btxId
        }
      }
      return val
    },
  }
}
</script>
