<template>
  <div class="container-fluid">
    <breadcrumb :items="items" />
    <div class="container">
      <alert :message="message" />

      <b-form v-if="show" @submit.prevent="onSubmit">
        <b-form-group v-if="form.notifyTemplateId">
          <label v-t="'label.notifyTemplateId'" />
          <b-form-input v-model="form.notifyTemplateId" type="text" readonly="readonly" />
        </b-form-group>

        <!--種別-->
        <b-form-group :disabled="!bNotifyTemplateKey">
          <b-form-row>
            <label v-t="'label.notifyTemplateKey'" class="control-label" />
          </b-form-row>
          <b-form-row>
            <b-col sm="5">
              <b-form-select v-model="form.notifyTemplateKey" :options="notifyStateOptions" class="mr-2" @change="signalChange" />
            </b-col>
          </b-form-row>
        </b-form-group>

        <!--通知媒体-->
        <b-form-group v-show="notify.length > 0">
          <label v-t="'label.notifyMedium'" />
          <b-form-radio-group v-model="form.notifyMedium" :options="notify" :disabled="!bNotifyTo" @change="radioChange" />
        </b-form-group>

        <!--通知先-->
        <b-form-group v-if="bNotifyTo && form.notifyTemplateKey!='TX_DELIVERY_NOTIFY'">
          <label v-t="'label.notifyTo'" />
          <b-form-textarea v-model="form.notifyTo" :rows="3" :max-rows="6" maxlength="2000" :state="errorMessages.email.length > 0 ? false : null" />
          <p v-for="(val, key) in errorMessages.email" :key="key" v-t="val" class="error" />
        </b-form-group>

        <!--件名-->
        <b-form-group v-if="bSubject">
          <label v-t="'label.subject'" />
          <input v-model="form.subject" type="text" maxlength="255" class="form-control" required>
        </b-form-group>

        <!--From-->
        <b-form-group>
          <label v-t="'label.mailFrom'" />
          <input v-model="form.mailFrom" :type="fromType" maxlength="255" class="form-control" required>
        </b-form-group>

        <!--テンプレート-->
        <b-form-group>
          <label v-t="'label.template'" />
          <b-form-textarea v-model="form.template" :rows="3" :max-rows="6" required />
        </b-form-group>

        <b-button v-t="'label.back'" type="button" variant="outline-danger" class="mr-2 my-1" @click="backToList" />
        <b-button v-if="isEditable" :variant="theme" type="submit" class="mr-2 my-1" @click="beforeSubmit($event, false)">
          {{ $i18n.tnl(`label.${isUpdate? 'update': 'register'}`) }}
        </b-button>
        <b-button v-if="isRegistable && !isUpdate" v-t="'label.registerAgain'" :variant="theme" type="submit" class="my-1" @click="beforeSubmit($event, false)" />
      </b-form>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import * as ViewHelper from '../../../sub/helper/ViewHelper'
import * as AppServiceHelper from '../../../sub/helper/AppServiceHelper'
import editmixinVue from '../../../components/mixin/editmixin.vue'
import * as HtmlUtil from '../../../sub/util/HtmlUtil'
import * as Util from '../../../sub/util/Util'
import breadcrumb from '../../../components/layout/breadcrumb.vue'
import alert from '../../../components/parts/alert.vue'
import { getButtonTheme } from '../../../sub/helper/ThemeHelper'
import { NOTIFY_STATE,NOTIFY_MIDIUM } from '../../../sub/constant/Constants'
import showmapmixin from '../../../components/mixin/showmapmixin.vue'
import { APP } from '../../../sub/constant/config.js'

export default {
  components: {
    breadcrumb,
    alert,
  },
  mixins: [editmixinVue, showmapmixin],
  data() {
    return {
      name: 'template',
      id: 'notifyTemplateId',
      radioSelect:-1,
      fromType:'email',
      deliveryState:NOTIFY_STATE.getOptions()[0].value,
      userMailState:NOTIFY_STATE.getOptions()[4].value,
      notify: _.slice(NOTIFY_MIDIUM.getTypes()).filter((val) => APP.NOTIFY_MIDIUM_TYPES.includes(val.value)),
      backPath: '/master/notifyTemplate',
      appServicePath: '/core/rcvexcloud',
      form: ViewHelper.extract(this.$store.state.app_service.template,
        ['notifyTemplateId', 'notifyTemplateKey' , 'notifyMedium', 'notifyTo', 'subject', 'mailFrom', 'template' ]),
      areaNames: [],
      categoryNames: [],
      isEnableNameText: true,
      isRegist: false,
      bNotifyTo:true,
      bSubject:true,
      bNotifyTemplateKey:true,
      errorMessages: {
        email: [],
      },
      items: [
        {
          text: this.$i18n.tnl('label.master'),
          active: true
        },
        {
          text: this.$i18n.tnl('label.notifyTemplate'),
          href: '/master/notifyTemplate',
        },
        {
          text: this.$i18n.tnl(Util.getDetailCaptionKey(this.$store.state.app_service.template.notifyTemplateId)),
          active: true
        }
      ]
    }
  },
  computed: {
    ...mapState( [
      'showAlert',
    ]),
    notifOptions() {
      return _.slice(NOTIFY_STATE.getOptions()).filter((val) => APP.NOTIFY_STATE_TYPES.includes(val.index))
    },
    notifyStateOptions() {
      return _.slice(NOTIFY_STATE.getOptions()).filter((val) => APP.NOTIFY_STATE_TYPES.includes(val.index))
    },
    hasId (){
      return Util.hasValue(this.form.notifyTemplateId)
    },
    theme () {
      const theme = getButtonTheme()
      return 'outline-' + theme
    },
    ...mapState('app_service', [
      'template',
    ]),
  },
  created() {
    this.form.notifyMedium == 1 ?this.bSubject = false: this.bSubject = true
    this.form.notifyTemplateKey== this.deliveryState? this.bNotifyTo=false : this.bNotifyTo=true
    this.form.notifyTemplateKey== this.userMailState? this.bNotifyTo=false : this.bNotifyTo=true
    this.form.notifyTemplateKey== this.deliveryState || this.form.notifyTemplateKey==this.userMailState? this.notify = _.slice(NOTIFY_MIDIUM.getTypes()).filter((val) => [0].includes(val.value)) : this.notify
    let labelUpdate = Util.getDetailCaptionKey(this.$store.state.app_service.template.notifyTemplateId)
    labelUpdate == 'label.update' ? this.bNotifyTemplateKey = false: this.bNotifyTemplateKey = true
  },
  mounted(){
    HtmlUtil.setCustomValidationMessage()
  },
  methods: {
    reset () {
    },
    async signalChange(evt) {
      if (evt == this.deliveryState || evt == this.userMailState ) {
        this.notify = _.slice(NOTIFY_MIDIUM.getTypes()).filter((val) => [0].includes(val.value))
        this.bNotifyTo = false
        this.form.notifyMedium = 0
        this.bSubject = true
        this.form.notifyTo = ''
      }else{
        this.bNotifyTo = true
        this.notify = _.slice(NOTIFY_MIDIUM.getTypes()).filter((val) => APP.NOTIFY_MIDIUM_TYPES.includes(val.value))
      }
      if(this.radioSelect== 0){
        this.bSubject = true
      }
    },
    async radioChange(evt) {
      this.radioSelect = evt
      if (evt == 1) {
        this.bSubject = false
        this.form.subject = ''
        this.fromType = 'text'
      }else{
        this.bSubject = true
      }
    },
    notifyToValidationCheck(){
      let result = false
      if(this.form.notifyMedium == 0
          && ( this.form.notifyTemplateKey != this.deliveryState && this.form.notifyTemplateKey != this.userMailState )){
        let re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i
        let emailList = this.form.notifyTo.split(',')
        if(emailList.length > 1){
          emailList.some((email) => {
            result = re.test(email) ? true:false
            if(!result) return true
          })
        }else{
          result = re.test(this.form.notifyTo)
        }
      }else{ // slackやTXボタン押下とユーザ登録通知場合
        result = true
      }
      return  result
    },
    beforeSubmit(event, again){
      if(!this.notifyToValidationCheck()){
        this.errorMessages.email = []
        this.replace({showAlert: false})
        this.errorMessages.email.push(this.$i18n.tnl('message.notMatchedEmail'))
        this.message = this.$i18n.tnl('message.error')
        this.replace({showAlert: true})
        if(this.showAlert){
          window.scrollTo(0, 0)
          event.preventDefault()
          return false
        }
      }
      this.register(again)
    },
    async save() {
      const notifyTemplateId = Util.hasValue(this.form.notifyTemplateId)? this.form.notifyTemplateId: -1
      const aNotifyState = (this.form.notifyTemplateKey != null)?this.form.notifyTemplateKey:0
      const entity = {
        notifyTemplateId: notifyTemplateId,
        notifyTemplateKey: aNotifyState,
        notifyMedium: this.form.notifyMedium ? this.form.notifyMedium : '' ,
        notifyTo: this.form.notifyTo? this.form.notifyTo:'',
        subject: this.form.subject? this.form.subject:'',
        mailFrom: this.form.mailFrom? this.form.mailFrom:'',
        template: this.form.template? this.form.template:'',
      }
      this.errorMessages.email = []
      this.replace({showAlert: false})
      return await AppServiceHelper.bulkSave(this.appServicePath, [entity])
    },
  }
}
</script>

<style scoped lang="scss">
  label.control-label {
    padding-top: 7px;
  }
   p.error {
    color: #dc3545;
  }
</style>