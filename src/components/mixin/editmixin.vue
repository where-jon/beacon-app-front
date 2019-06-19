
<script>
import { mapState } from 'vuex'
import * as AppServiceHelper from '../../sub/helper/AppServiceHelper'
import * as MenuHelper from '../../sub/helper/MenuHelper'
import * as StateHelper from '../../sub/helper/StateHelper'
import * as LocalStorageHelper from '../../sub/helper/LocalStorageHelper'
import * as ImageHelper from '../../sub/helper/ImageHelper'
import * as ViewHelper from '../../sub/helper/ViewHelper'
import * as VueSelectHelper from '../../sub/helper/VueSelectHelper'
import { APP } from '../../sub/constant/config'
import * as Util from '../../sub/util/Util'
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
    async save(evt) {
      this.message = this.warnMessage = ''
      StateHelper.initShowMessage()
      evt.preventDefault()
      this.$nextTick(async () => {
        this.showProgress()
        try {
          await this.onSaving()
          await StateHelper.load(this.name, true)
          if (this.name == 'area' && this.form.mapImage) {
            await this.loadImageArea()
          }
          this.message = this.$i18n.tnl('message.' + this.crud + 'Completed', {target: this.$i18n.tnl('label.' + this.name)})
          this.replace({showInfo: true})
          if(this.onSaved) {
            this.onSaved()
          }
          if (this.again) {
            this.form = {}
            Util.applyDef(this.form, this.defValue)
            if(this.onBeforeReload) {
              VueSelectHelper.clearVueSelect(this.vueSelected)
              this.onBeforeReload()
            }
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
        }
        finally{
          this.replaceAS({showLine: false})
        }
        this.hideProgress()
      })
    },
  }
}
</script>
