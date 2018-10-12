
<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import _ from 'lodash'
import * as AppServiceHelper from '../sub/helper/AppServiceHelper'
import * as ViewHelper from '../sub/helper/ViewHelper'
import * as MenuHelper from '../sub/helper/MenuHelper'
import { sleep } from '../sub/util/Util'
import * as HtmlUtil from '../sub/util/HtmlUtil'
import * as Util from '../sub/util/Util'
let that
export default {
  data() {
    return {
      show: true,
      showInfo: false,
      showAlert: false,
      message: '',
      again: true,
    }
  },
  computed: {
    label() {
      return this.$i18n.t('label.' + this.crud)
    },
    crud() {
      return this.bulkRegister? 'bulkRegister': !this.isEditable? 'refer': this.isUpdate? 'update': 'register'
    },
    isUpdate() {
      return this[this.name][this.id] != null
    },
    isEditable() {
      return MenuHelper.isEditable(this.appServicePath)
    }
  },
  mounted() {
    that = this
    this.replace({title: this.$i18n.t('label.' + this.name) + this.label})
  },
  methods: {
    ...mapMutations('app_service', [
      'replaceAS', 
      'clear', 
    ]),
    ...mapMutations([
      'replace', 
    ]),
    register(again) {
      this.again = again
    },
    backToList() {
      this.$router.push(this.backPath)
    },
    async save() {
      return await AppServiceHelper.save(this.appServicePath, this.form)
    },
    async onSubmit(evt) {
      this.replace({showProgress: true})
      this.message = ''
      this.showInfo = false
      this.showAlert = false
      evt.preventDefault()
      try {
        let res = await this.save()
        this.message = this.$i18n.t('message.' + this.crud + 'Completed', {target: this.$i18n.t('label.' + this.name)})
        this.showInfo = true
        if (this.again) {
          _.forEach(this.form, (value, key) => {
            this.form[key] = ''
          })
          if(typeof this.beforeReload === "function"){
            this.beforeReload()
          }
          let customFileLabel = document.getElementsByClassName("custom-file-label")
          if (customFileLabel && customFileLabel[0]) {
            customFileLabel[0].innerText =''
          }
          window.scrollTo(0, 0)
        }
        else {
          this.backToList()
        }
      }
      catch(e) {
        console.error(e)
        if (e.key) {
          this.message = this.$i18n.t('message.' + e.type, {key: this.$i18n.t('label.' + Util.snake2camel(e.key)), val: e.val})
        }
        else if (e.bulkError) {
          this.message = _.map(e.bulkError, (err) => {
            return this.$i18n.t('message.bulk' + err.type + 'Failed', 
              {line: err.line, col: err.col, value: err.value, min: err.min, max: err.max, candidates: err.candidates})
          }).join("<br>")
        }
        else {
          this.message = this.$i18n.t('message.' + this.crud + 'Failed', {target: this.$i18n.t('label.' + this.name), code: e.message})
        }
        this.showAlert = true
        window.scrollTo(0, 0)
      }
      this.replace({showProgress: false})
    },
    readImageView(e, imgViewName, imgWidthName, imgHeightName, thumbnailName, resize) {
      let that = this
      HtmlUtil.readImage(e, (evt, width, height, thumbnail) => {
          that.$refs[imgViewName].src = evt.target.result
          that.form[imgViewName] = evt.target.result
          if (imgWidthName) that.form[imgWidthName] = width
          if (imgHeightName) that.form[imgHeightName] = height
          if (thumbnailName) that.form[thumbnailName] = thumbnail
      }, resize)
    },
    async bulkSave(mainCol, intTypeList, boolTypeList, callback) {
      if (!this.form.csvFile) {
        throw new Error(this.$t('message.emptyFile'))
      }

      const reader = new FileReader()
      let readFin = false
      let error = null
      let entities = []
      reader.addEventListener('load', (e) => {
        try {
          let csv = Util.csv2Obj(e.target.result)
          if (!csv || !csv.data || csv.errors && csv.errors.length > 0) {
            console.error(csv.errors)
            if (csv.errors && typeof csv.errors[0] == 'string' && csv.errors[0].startsWith("message.")) {
              error = this.$t(csv.errors[0])
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
                  throw Error(that.$i18n.t('message.csvHeaderRequired'))
                }
              }
              else if (!header.includes(mainCol)) {
                throw Error(that.$i18n.t('message.csvHeaderRequired'))
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
                  val = Boolean(val)
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
              entities.push(entity)
            }
          })
          console.debug({entities})
        } catch (e) {
          console.error(e)
          error = e.message
        }

        readFin = true
      })
      
      reader.readAsBinaryString(this.form.csvFile)

      if (!readFin) {
        await Util.sleep(100)
      }
      
      if (error || !entities || entities.length == 0) {
        throw new Error(error)
      }

      await AppServiceHelper.bulkSave(this.appServicePath, entities)          
   },
  }
}
</script>
