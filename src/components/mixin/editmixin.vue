
<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import _ from 'lodash'
import * as AppServiceHelper from '../../sub/helper/AppServiceHelper'
import * as ViewHelper from '../../sub/helper/ViewHelper'
import * as MenuHelper from '../../sub/helper/MenuHelper'
import * as StateHelper from '../../sub/helper/StateHelper'
import { sleep } from '../../sub/util/Util'
import { APP } from '../../sub/constant/config.js'
import { ROLE, UPDATE_ONLY_NN, IGNORE } from '../../sub/constant/Constants'
import * as HtmlUtil from '../../sub/util/HtmlUtil'
import * as Util from '../../sub/util/Util'
import commonmixinVue from './commonmixin.vue';

export default {
  mixins: [commonmixinVue],  
  data() {
    return {
      show: true,
      showInfo: false,
      showWarn: false,
      showAlert: false,
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
      return this.bulkRegister? 'bulkRegister': !this.isEditable? 'refer': this.isUpdate? 'update': 'register'
    },
    isUpdate() {
      return this[this.name] && this[this.name][this.id] != null
    },
    isEditable() {
      return MenuHelper.isEditable(this.featurePath? this.featurePath: this.appServicePath)
    },
    isSuperEditable() {
      return this.$store.state.role == ROLE.SUPER_ADMIN
    },
    ...mapState('app_service', [
      'listMessage',
      'showLine',
    ]),
  },
  mounted() {
    this.replace({title: this.$i18n.tnl('label.' + this.name) + this.label})
    this.replaceAS({listMessage: null})
  },
  methods: {
    register(again) {
      this.again = again
    },
    backToList() {
      this.$router.push(this.backPath)
    },
    sensorOptions(entity) {
      return _(this.sensors)
      .filter((sensor) => {
        if (entity == 'exb') {
          return APP.EXB_SENSOR.includes(sensor.sensorId)
        }
        else if (entity == 'tx') {
          return APP.TX_SENSOR.includes(sensor.sensorId)
        }
        return true
      })
      .map((sensor) => {
          return {
            value: sensor.sensorId,
            text: this.$i18n.tnl('label.' + sensor.sensorName)
          }
        }
      )
      .value()
    },
    isShown(conf) {
      return APP[conf]
    },
    async save() {
      return await AppServiceHelper.save(this.appServicePath, this.form, this.updateOnlyNN)
    },
    async onSubmit(evt) {
      this.replace({showProgress: true})
      this.message = ''
      this.warnMessage = ''
      this.showInfo = false
      this.showWarn = false
      this.showAlert = false
      evt.preventDefault()
      try {
        let res = await this.save()
        if(this.afterCrud) {
          this.afterCrud()
        }
        await StateHelper.load(this.name, true)
        this.message = this.$i18n.tnl('message.' + this.crud + 'Completed', {target: this.$i18n.tnl('label.' + this.name)})
        this.showInfo = true
        if (this.again) {
          this.form = {}
          ViewHelper.applyDef(this.form, this.defValue)
          if(this.beforeReload) {
            this.beforeReload()
          }
          let customFileLabel = document.getElementsByClassName("custom-file-label")
          if (customFileLabel && customFileLabel[0]) {
            customFileLabel[0].innerText =''
          }
          window.scrollTo(0, 0)
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
        if (e.key) {
          this.message = this.$i18n.tnl('message.' + e.type, {key: this.$i18n.tnl('label.' + this.modifyColName(Util.snake2camel(e.key))), val: this.modifyVal(Util.snake2camel(e.key), e.val)})
        }
        else if(e.col){
          this.message = this.$i18n.tnl('message.' + e.type, {col: this.$i18n.tnl(`label.${e.col}`), value: e.val})
        }
        else if (e.bulkError) {
          this.message = _.map(e.bulkError, (err) => {
            let col = this.modifyColName(err.col.trim())
            return this.$i18n.tline('message.bulk' + err.type + 'Failed', 
              {line: err.line, col: this.$i18n.tnl(`label.${col}`), value: Util.sanitize(err.value), min: err.min, max: err.max, candidates: err.candidates},
              this.showLine)
          }).join("<br>")
        }
        else {
          this.message = this.$i18n.tnl('message.' + this.crud + 'Failed', {target: this.$i18n.tnl('label.' + this.name), code: e.message})
        }
        this.showAlert = true
        window.scrollTo(0, 0)
      }
      finally{
        this.replaceAS({showLine: false})
      }
      this.replace({showProgress: false})
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
        this.message = this.$i18n.tnl("message.uploadMax", {target: Math.floor(APP.MAX_IMAGE_SIZE/1024/1024)})
        this.showAlert = true
        if (this.clearImage) {
          this.clearImage()
        }
        setTimeout(()=> {
          window.scrollTo(0, 0)
        }, 0)
      })
    },
    formatErrorLine(lines){
      let errorMessage = this.$i18n.tnl("message.csvLineStart")
      lines.forEach((val, idx) => {
        if(idx != 0){
          errorMessage = errorMessage.concat(",")
        }
        errorMessage = errorMessage.concat(`${this.$i18n.tnl("message.csvLine", {line: val})}`)
      })
      errorMessage = errorMessage.concat(this.$i18n.tnl("message.csvLineEnd"))
      return errorMessage
    },
    async bulkSave(mainCol, intTypeList, boolTypeList, callback, idSetCallback) {
      if (!this.form.csvFile) {
        throw new Error(this.$t('message.emptyFile'))
      }

      const reader = new FileReader()
      let readFin = false
      let error = null
      let entities = []
      const sameLine = []
      reader.onload = () => {
        try {
          let csv = Util.csv2Obj(Util.arrayBuffer2str(reader.result))
          if (!csv || !csv.data || csv.errors && csv.errors.length > 0) {
            console.error(csv.errors)
            if (csv.errors && typeof csv.errors[0] == 'string' && csv.errors[0].startsWith("message.")) {
              error = this.$t(csv.errors[0])
            }
            if (csv.errors && typeof csv.errors[0] == 'object' ) {
              const errorLine = csv.errors.filter((val) => val.row)
                .map((val) => val.row)
                .filter((val, idx, arr) => arr.indexOf(val) === idx)
                .sort((a, b) => a < b? -1: a > b? 1: 0)
              error = `${this.$i18n.tnl("message.csvInvalidLine")}${this.formatErrorLine(errorLine)}`
            }
            readFin = true
            return
          }
          console.debug(csv)
          let header
          let dummyKey = -1
          csv.data.forEach((line, lineIdx) => {
            if (lineIdx == 0) {
              header = line
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
            }
            else {
              let entity = {}
              line.forEach((val, idx) => {
                let headerName = header[idx]
                if (!headerName) {
                  return
                }
                if (Util.equalsAny(headerName, boolTypeList)) { // Boolean type
                  val = Util.str2boolean(val)
                }
                else if (Util.equalsAny(headerName, intTypeList)) { // Number type
                  val = Number(val)
                }

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
              if(idSetCallback){
                dummyKey = idSetCallback(entity, dummyKey)
              }
              const sameEntity = Util.isArray(mainCol)?
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
              if(sameEntity){
                sameLine.push(lineIdx)
              }
              entities.push(entity)
            }
          })
          console.debug({entities})
        } catch (e) {
          console.error(e)
          error = e.message
        }

        readFin = true
      }
      
      reader.readAsArrayBuffer(this.form.csvFile)

      if (!readFin) {
        await Util.sleep(100)
      }
      
      if (error || !entities || entities.length == 0) {
        throw new Error(error? error: this.$i18n.tnl('message.csvNotFound'))
      }
      if(Util.hasValue(sameLine)){
        throw new Error(`${this.$i18n.tnl('message.csvSameKey')}${this.formatErrorLine(sameLine)}`)
      }

      this.replaceAS({showLine: true})
      await AppServiceHelper.bulkSave(this.appServicePath, entities, UPDATE_ONLY_NN.NONE, IGNORE.ON)
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
