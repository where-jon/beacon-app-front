
<script>
import { mapState } from 'vuex'
import { APP } from '../../sub/constant/config'
import * as ArrayUtil from '../../sub/util/ArrayUtil'
import * as Util from '../../sub/util/Util'
import * as AppServiceHelper from '../../sub/helper/dataproc/AppServiceHelper'
import * as ImageHelper from '../../sub/helper/base/ImageHelper'
import * as LocalStorageHelper from '../../sub/helper/base/LocalStorageHelper'
import * as MenuHelper from '../../sub/helper/dataproc/MenuHelper'
import * as StateHelper from '../../sub/helper/dataproc/StateHelper'
import * as ViewHelper from '../../sub/helper/ui/ViewHelper'
import * as VueSelectHelper from '../../sub/helper/ui/VueSelectHelper'
import commonmixin from './commonmixin.vue'

export default {
  mixins: [commonmixin],
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
    isButtonShow() {
      return this.isUpdate && this.isUpdatable || !this.isUpdate && this.isRegistable
    },
    isUpdatable() {
      return MenuHelper.isUpdatable(this.authPath? this.authPath: this.backPath)
    },
    isRegistable() {
      return MenuHelper.isRegistable(this.authPath? this.authPath: this.backPath)
    },
    isDeleteable() {
      return MenuHelper.isDeleteable(this.authPath? this.authPath: this.backPath)
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
    async save(evt) {
      ViewHelper.disabledButtons(true)
      this.message = this.warnMessage = ''
      StateHelper.initShowMessage()
      evt.preventDefault()
      this.$nextTick(async () => {
        this.showProgress()
        try {
          await this.onSaving()
          StateHelper.setForceFetch(this.name, true)
          if (this.name == 'area' && this.form.mapImage) {
            await ImageHelper.loadImageArea(this.form.areaId)
          }
          if(this.bulkUpload && this.name == 'pot') {
            this.replaceAS({updatedPotThumbnailList: this.form.thumbnails.map(t => t.id)})
          }
          this.message = this.$i18n.tnl('message.' + this.crud + 'Completed', {target: this.$i18n.tnl('label.' + (this.dispName? this.dispName: this.name))})
          this.replace({showInfo: true})
          if(this.onSaved) {
            this.onSaved()
          }
          if (this.again) {
            this.form = {}
            Util.applyDef(this.form, this.defValue, this)
            if(this.onBeforeReload) {
              VueSelectHelper.clearVueSelect(this.vueSelected)
              this.onBeforeReload()
            }
            ViewHelper.disabledButtons(false)
            ViewHelper.clearFileComponentAll()
            window.scrollTo(0, 0)
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
          this.message = ViewHelper.getSubmitErrorMessage(e, this.showLine, this.crud, this.name)
          this.replace({showAlert: true})
          window.scrollTo(0, 0)
          ViewHelper.disabledButtons(false)
        }
        finally{
          this.replaceAS({showLine: false})
          this.hideProgress()
        }
        this.hideProgress()
      })
    },
  }
}
</script>
