
<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import _ from 'lodash'
import * as AppServiceHelper from '../sub/helper/AppServiceHelper'
import * as ViewHelper from '../sub/helper/ViewHelper'
import * as MenuHelper from '../sub/helper/MenuHelper'
import { sleep } from '../sub/util/Util'
import * as HtmlUtil from '../sub/util/HtmlUtil'
import * as Util from '../sub/util/Util'

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
      return !this.isEditable? 'refer': this.isUpdate? 'update': 'register'
    },
    isUpdate() {
      return this[this.name][this.id] != null
    },
    isEditable() {
      return MenuHelper.isEditable(this.appServicePath)
    }
  },
  mounted() {
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
          let customFileLabel = document.getElementsByClassName("custom-file-label")
          if (customFileLabel && customFileLabel[0]) {
            customFileLabel[0].innerText =''
          }
        }
        else {
          this.backToList()
        }
      }
      catch(e) {
        if (e.key) {
          this.message = this.$i18n.t('message.' + e.type, {key: this.$i18n.t('label.' + Util.snake2camel(e.key)), val: e.val})
        }
        else {
          this.message = this.$i18n.t('message.' + this.crud + 'Failed', {target: this.$i18n.t('label.' + this.name), code: e.message})
        }
        this.showAlert = true
        window.scrollTo(0, 0)
      }
      this.replace({showProgress: false})
    },
    readImageView(e, imgViewName, imgWidthName, imgHeightName) {
      let that = this
      HtmlUtil.readImage(e, (evt, width, height) => {
          that.$refs[imgViewName].src = evt.target.result
          that.form[imgViewName] = evt.target.result
          that.form[imgWidthName] = width
          that.form[imgHeightName] = height
      })
    }
  }
}

</script>
