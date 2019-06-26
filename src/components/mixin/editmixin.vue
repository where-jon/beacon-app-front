
<script>
import { mapState } from 'vuex'
import _ from 'lodash'
import * as AppServiceHelper from '../../sub/helper/AppServiceHelper'
import * as ViewHelper from '../../sub/helper/ViewHelper'
import * as MenuHelper from '../../sub/helper/MenuHelper'
import * as StateHelper from '../../sub/helper/StateHelper'
import * as LocalStorageHelper from '../../sub/helper/LocalStorageHelper'
import { APP } from '../../sub/constant/config.js'
import { USER } from '../../sub/constant/Constants'
import * as HtmlUtil from '../../sub/util/HtmlUtil'
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
    register(again) {
      this.again = again
    },
    backToList(event, path) {
      this.$router.push(path? path: this.backPath)
    },
    sensorOptions(entity, isBlank) {
      let ids
      if (entity == 'exb') {
        ids = APP.EXB.SENSOR
      } else if (entity == 'tx') {
        ids = APP.SENSOR.TX_SENSOR
      }

      return StateHelper.getOptionsFromState('sensor',
        sensor => this.$i18n.tnl('label.' + sensor.sensorName),
        {value:null, text:isBlank? this.$i18n.tnl('label.null'): this.$i18n.tnl('label.normal')},
        sensor => ids.includes(sensor.sensorId)
      )
    },
    isShown(conf, column) {
      const keys = conf.split('.')
      const setting = keys.reduce((prev, cur) => prev[cur], APP)
      if(ArrayUtil.isArray(setting)){
        return ArrayUtil.includesIgnoreCase(setting, column)
      }
      return setting
    },
    createDummyLoginId(ids) {
      return `d${ids.join('_')}`
    },
    async createDummyUser(dummyLoginId, noEncrypt = USER.ENCRYPT.ON) {
      await StateHelper.load('role')
      return {
        userId: -1,
        loginId: dummyLoginId,
        pass: USER.DUMMY.PASS,
        name: null,
        roleId: this.roles.reduce((a, b) => a.roleId > b.roleId? a: b).roleId,
        email: null,
        noEncrypt: noEncrypt,
      }
    },
    async save() {
      return await AppServiceHelper.save(this.appServicePath, this.form, this.updateOnlyNN)
    },
    async loadImageArea(){
      if (this.form.areaId) {
        await StateHelper.loadAreaImage(this.form.areaId, true)
      }
      else {
        await StateHelper.loadAreaImages()
      }
    },
    editAgain(){
      this.form = {}
      ViewHelper.applyDef(this.form, this.defValue)
      if(this.beforeReload) {
        if(this.vueSelected && typeof this.vueSelected == 'object'){
          Object.keys(this.vueSelected).forEach(key => {
            this.vueSelected[key] = ArrayUtil.isArray(this.vueSelected[key])? []: null
          })
        }
        this.beforeReload()
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
    async onSubmit(evt) {
      this.message = ''
      this.warnMessage = ''
      this.replace({showWarn: false})
      this.replace({showAlert: false})
      this.replace({showInfo: false})
      evt.preventDefault()
      this.$nextTick(async () => {
        this.showProgress()
        try {
          await this.save()
          await StateHelper.load(this.name, true)
          if (this.name == 'area') {
            await this.loadImageArea()
          }
          this.message = this.$i18n.tnl('message.' + this.crud + 'Completed', {target: this.$i18n.tnl('label.' + this.name)})
          this.replace({showInfo: true})
          if(this.afterCrud) {
            this.afterCrud()
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
    readImageView(e, imgViewName, imgWidthName, imgHeightName, thumbnailName, resize) {
      HtmlUtil.readImage(e, (evt, width, height, thumbnail) => {
        this.$refs[imgViewName].src = evt.target.result
        this.form[imgViewName] = evt.target.result
        if (imgWidthName) this.form[imgWidthName] = width
        if (imgHeightName) this.form[imgHeightName] = height
        if (thumbnailName) this.form[thumbnailName] = thumbnail
      }, resize, (size) => {
        this.message = this.$i18n.tnl('message.uploadMax', {target: Math.floor(APP.MAX_IMAGE_SIZE/1024/1024)})
        this.replace({showAlert: true})
        if (this.clearImage) {
          this.clearImage()
        }
        setTimeout(()=> {
          window.scrollTo(0, 0)
        }, 0)
      })
    },
  }
}
</script>
