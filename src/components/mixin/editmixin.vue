
<script>
import { mapState } from 'vuex'
import _ from 'lodash'
import * as AppServiceHelper from '../../sub/helper/AppServiceHelper'
import * as ViewHelper from '../../sub/helper/ViewHelper'
import * as MenuHelper from '../../sub/helper/MenuHelper'
import * as StateHelper from '../../sub/helper/StateHelper'
import { APP } from '../../sub/constant/config.js'
import { UPDATE_ONLY_NN, IGNORE, USER } from '../../sub/constant/Constants'
import * as HtmlUtil from '../../sub/util/HtmlUtil'
import * as Util from '../../sub/util/Util'
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
      const loginInfo = JSON.parse(window.localStorage.getItem('login'))
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
    sensorOptions(entity) {
      let ids
      if (entity == 'exb') {
        ids = APP.EXB_SENSOR
      } else if (entity == 'tx') {
        ids = APP.TX_SENSOR
      }

      return StateHelper.getOptionsFromState('sensor',
        sensor => this.$i18n.tnl('label.' + sensor.sensorName),
        {value:null, text:this.$i18n.tnl('label.normal')},
        sensor => ids.includes(sensor.sensorId)
      )
    },
    isShown(conf) {
      return APP[conf]
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
        return this.$i18n.tnl('message.' + e.type, {key: this.$i18n.tnl('label.' + this.modifyColName(Util.snake2camel(e.key))), val: this.modifyVal(Util.snake2camel(e.key), e.val)})
      }
      if(e.col){
        return this.$i18n.tnl('message.' + e.type, {col: this.$i18n.tnl(`label.${e.col}`), value: e.val})
      }
      if(e.bulkError) {
        return _.map(e.bulkError, (err) => {
          let col = this.modifyColName(err.col.trim())
          return this.$i18n.tline('message.bulk' + err.type + 'Failed', 
            {line: err.line, col: this.$i18n.tnl(`label.${col}`), value: Util.sanitize(err.value), min: err.min, max: err.max, candidates: err.candidates, num: err.num, unit: err.unit? this.$i18n.tnl(`label.${err.unit}Unit`): '', target: err.target? this.$i18n.tnl(`label.${err.target}`): ''},
            this.showLine)
        })
      }
      return this.message = this.$i18n.terror('message.' + this.crud + 'Failed', {target: this.$i18n.tnl('label.' + this.name), code: e.message})
    },
    async onSubmit(evt) {
      this.showProgress()
      this.message = ''
      this.warnMessage = ''
      this.replace({showWarn: false})
      this.replace({showAlert: false})
      this.replace({showInfo: false})
      evt.preventDefault()
      try {
        await this.save()
        if(this.afterCrud) {
          this.afterCrud()
        }
        await StateHelper.load(this.name, true)
        if (this.name == 'area') {
          await this.loadImageArea()
        }
        this.message = this.$i18n.tnl('message.' + this.crud + 'Completed', {target: this.$i18n.tnl('label.' + this.name)})
        this.replace({showInfo: true})
        if (this.again) {
          this.editAgain()
        }
        else {
          if(this.createMessage){
            this.replaceAS({listMessage: this.message})
          }
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
    },
    modifyColName(col) {
      if (col == 'TXID' && !APP.TX_WITH_TXID){
        return APP.TX_BTX_MINOR == 'minor'? 'minor': 'btxId'
      }
      if (col == 'btxId' && APP.TX_BTX_MINOR == 'minor') {
        return 'minor'
      }
      return col
    },
    modifyVal(col, val) {
      if (col == 'TXID' && !APP.TX_WITH_TXID){
        if(APP.TX_BTX_MINOR == 'minor' && this.minor){
          return this.minor
        }
        if(APP.TX_BTX_MINOR != 'minor' && this.btxId){
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
    formatErrorLine(lines){
      let errorMessage = this.$i18n.tnl('message.csvLineStart')
      lines.forEach((val, idx) => {
        if(idx != 0){
          errorMessage = errorMessage.concat(',')
        }
        errorMessage = errorMessage.concat(`${this.$i18n.tnl('message.csvLine', {line: val})}`)
      })
      errorMessage = errorMessage.concat(this.$i18n.tnl('message.csvLineEnd'))
      return errorMessage
    },
    createCsvErrorMessage(csvErrors){
      if (csvErrors && typeof csvErrors[0] == 'string' && csvErrors[0].startsWith('message.')) {
        return this.$t(csvErrors[0])
      }
      if (csvErrors && typeof csvErrors[0] == 'object' ) {
        const errorLine = csvErrors.filter((val) => val.row)
          .map((val) => val.row)
          .filter((val, idx, arr) => arr.indexOf(val) === idx)
          .sort((a, b) => a < b? -1: a > b? 1: 0)
        return `${this.$i18n.tnl('message.csvInvalidLine')}${this.formatErrorLine(errorLine)}`
      }
      return null
    },
    csvHeaderCheck(mainCol, header){
      if(Util.isArray(mainCol)){
        let hasHeader = true
        mainCol.forEach((val) => hasHeader = header.includes(val)? hasHeader: false)
        if (!hasHeader) {
          throw Error(this.$i18n.tnl('message.csvHeaderRequired'))
        }
      }
      else if (!header.includes(mainCol)) {
        throw Error(this.$i18n.tnl('message.csvHeaderRequired'))
      }
    },
    convertCsvParamType(headerName, val, intTypeList, boolTypeList){
      if (Util.equalsAny(headerName, boolTypeList)) { // Boolean type
        return Util.str2boolean(val)
      }
      else if (Util.equalsAny(headerName, intTypeList)) { // Number type
        return Number(val)
      }
      return val
    },
    createSameEntity(entities, entity, mainCol){
      return Util.isArray(mainCol)?
        entities.find((val) => {
          for(let idx = 0; idx < mainCol.length; idx++){
            const col = mainCol[idx]
            if(val[col] != entity[col]){
              return false
            }
          }
          return true
        }):
        entities.find((val) => val[mainCol] == entity[mainCol])
    },
    sameDataCheck(sameLine, lineIdx, entities, entity, mainCol){
      if(this.createSameEntity(entities, entity, mainCol)){
        sameLine.push(lineIdx)
      }
    },
    setCsvParam(entity, line, header, mainCol, intTypeList, boolTypeList, dummyKey, callback){
      line.forEach((val, idx) => {
        const headerName = header[idx]
        if (!headerName) {
          return
        }
        val = this.convertCsvParamType(headerName, val, intTypeList, boolTypeList)

        if (callback) {
          dummyKey = callback(entity, headerName, val, dummyKey)
        }
        else {
          if (headerName == mainCol && !val) {
            val = dummyKey--
          }
          entity[headerName] = val
        }
      })
      return dummyKey
    },
    setReaderOnload(reader, readerParam, mainCol, intTypeList, boolTypeList, callback, idSetCallback){
      reader.onload = () => {
        try {
          const csv = Util.csv2Obj(Util.arrayBuffer2str(reader.result))
          if (!csv || !csv.data || csv.errors && csv.errors.length > 0) {
            console.error(csv.errors)
            readerParam.error = this.createCsvErrorMessage(csv.errors)
            readerParam.readFin = true
            return
          }
          console.debug(csv)
          let header
          let dummyKey = -1
          csv.data.forEach((line, lineIdx) => {
            if (lineIdx == 0) {
              header = line
              this.csvHeaderCheck(mainCol, header)
            }
            else {
              const entity = {}
              dummyKey = this.setCsvParam(entity, line, header, mainCol, intTypeList, boolTypeList, dummyKey, callback)
              if(idSetCallback){
                dummyKey = idSetCallback(entity, dummyKey)
              }
              this.sameDataCheck(readerParam.sameLine, lineIdx, readerParam.entities, entity, mainCol)
              readerParam.entities.push(entity)
            }
          })
          console.debug(readerParam.entities)
        } catch (e) {
          console.error(e)
          readerParam.error = e.message
        }
        readerParam.readFin = true
      }
    },
    async bulkSave(mainCol, intTypeList, boolTypeList, callback, idSetCallback) {
      if (!this.form.csvFile) {
        throw new Error(this.$t('message.emptyFile'))
      }

      const reader = new FileReader()
      const readerParam = {readFin: false, error: null, entities: [], sameLine: []}
      this.setReaderOnload(reader, readerParam, mainCol, intTypeList, boolTypeList, callback, idSetCallback)
      reader.readAsArrayBuffer(this.form.csvFile)

      if (!readerParam.readFin) {
        await Util.sleep(100)
      }
      
      if (readerParam.error || !readerParam.entities || readerParam.entities.length == 0) {
        throw new Error(readerParam.error? readerParam.error: this.$i18n.tnl('message.csvNotFound'))
      }
      if(Util.hasValue(readerParam.sameLine)){
        throw new Error(`${this.$i18n.tnl('message.csvSameKey')}${this.formatErrorLine(readerParam.sameLine)}`)
      }

      this.replaceAS({showLine: true})
      await AppServiceHelper.bulkSave(this.appServicePath, readerParam.entities, UPDATE_ONLY_NN.NONE, IGNORE.ON)
      if(this.afterCrud) {
        this.afterCrud()
      }
      if(Util.isArray(mainCol)){
        let col = null
        mainCol.forEach((val, idx) => {
          col = idx == 0? val.slice(0, -2): `${col}${val.charAt(0).toUpperCase()}${val.slice(1, -2)}`
        })
        mainCol = `${col}Id`
      }
      await StateHelper.load(mainCol.slice(0, -2), true)
    },
  }
}
</script>
