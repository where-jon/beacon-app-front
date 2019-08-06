<template>
  <div class="container-fluid">
    <breadcrumb :items="items" />
    <div class="container">
      <alert :message="message" />

      <b-form v-if="show" @submit.prevent="save">
        <!--種別-->
        <b-form-group :disabled="!bNotifyTemplateKey">
          <b-form-row>
            <label v-t="'label.notifyTemplateKey'" class="control-label" />
          </b-form-row>
          <b-form-row>
            <b-col sm="5">
              <b-form-select v-model="form.notifyTemplateKey" :options="notifyStateOptions" class="mr-2" @change="signalChange" required />
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
          <b-form-textarea v-model="form.notifyTo" :rows="3" :max-rows="6" maxlength="2000" :state="errorMessages.email.length > 0 ? false : null" required />
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
import { APP } from '../../../sub/constant/config'
import { NOTIFY_STATE, NOTIFY_MIDIUM } from '../../../sub/constant/Constants'
import * as Util from '../../../sub/util/Util'
import * as AppServiceHelper from '../../../sub/helper/dataproc/AppServiceHelper'
import * as ValidateHelper from '../../../sub/helper/dataproc/ValidateHelper'
import * as ViewHelper from '../../../sub/helper/ui/ViewHelper'
import breadcrumb from '../../../components/layout/breadcrumb.vue'
import commonmixin from '../../../components/mixin/commonmixin.vue'
import editmixin from '../../../components/mixin/editmixin.vue'
import alert from '../../../components/parts/alert.vue'

export default {
  components: {
    breadcrumb,
    alert,
  },
  mixins: [commonmixin, editmixin],
  data() {
    return {
      name: 'template',
      id: 'notifyTemplateId',
      backPath: '/master/notifyTemplate',
      appServicePath: '/core/rcvexcloud',
      form: Util.extract(this.$store.state.app_service.template,
        ['notifyTemplateId', 'notifyTemplateKey' , 'notifyMedium', 'notifyTo', 'subject', 'mailFrom', 'template' ]),
      errorMessages: {
        email: [],
      },
      areaNames: [],
      categoryNames: [],
      items: ViewHelper.createBreadCrumbItems('master', {text: 'notifyTemplate', href: '/master/notifyTemplate'}, ViewHelper.getDetailCaptionKey(this.$store.state.app_service.template.notifyTemplateId)),
      radioSelect:-1,
      fromType:'email',
      deliveryState:NOTIFY_STATE.getOptions().filter((val) => val.value == 'TX_DELIVERY_NOTIFY')[0].value,
      userMailState:NOTIFY_STATE.getOptions().filter((val) => val.value == 'USER_REG_NOTIFY')[0].value,
      prohibitState:NOTIFY_STATE.getOptions().filter((val) => val.value == 'PROHIBIT_NOTIFY')[0].value,
      lostState:NOTIFY_STATE.getOptions().filter((val) => val.value == 'LOST_NOTIFY')[0].value,
      notify: _.slice(NOTIFY_MIDIUM.getTypes()).filter((val) => APP.NOTIFY.MIDIUM_TYPES.includes(val.value)),
      isEnableNameText: true,
      isRegist: false,
      bNotifyTo:true,
      bSubject:true,
      bNotifyTemplateKey:true,
    }
  },
  computed: {
    ...mapState( [
      'showAlert',
    ]),
    notifOptions() {
      return _.slice(NOTIFY_STATE.getOptions()).filter((val) => APP.NOTIFY.STATE_TYPES.includes(val.index))
    },
    notifyStateOptions() {
      return _.slice(NOTIFY_STATE.getOptions()).filter((val) => APP.NOTIFY.STATE_TYPES.includes(val.index))
    },
    ...mapState('app_service', [
      'template',
    ]),
  },
  created() {
    this.form.notifyMedium == 1 ?this.bSubject = false: this.bSubject = true
    if(this.form.notifyTemplateKey == this.userMailState || this.form.notifyTemplateKey == this.deliveryState) {
      this.bNotifyTo = false
    }
    let labelUpdate = ViewHelper.getDetailCaptionKey(this.$store.state.app_service.template.notifyTemplateId)
    labelUpdate == 'label.update' ? this.bNotifyTemplateKey = false: this.bNotifyTemplateKey = true
  },
  mounted(){
    ValidateHelper.setCustomValidationMessage()
  },
  methods: {
    reset () {
    },
    async signalChange(evt) {
      if (evt == this.deliveryState || evt == this.userMailState || evt == this.prohibitState || evt == this.lostState) {
        this.notify = _.slice(NOTIFY_MIDIUM.getTypes()).filter((val) => [0].includes(val.value))
        this.bNotifyTo = evt == this.prohibitState || evt == this.lostState ? true : false
        this.form.notifyMedium = 0
        this.bSubject = true
        this.form.notifyTo = ''
      }else{
        this.bNotifyTo = true
        this.notify = _.slice(NOTIFY_MIDIUM.getTypes()).filter((val) => APP.NOTIFY.MIDIUM_TYPES.includes(val.value))
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
          && ( this.form.notifyTemplateKey != this.deliveryState && this.form.notifyTemplateKey != this.userMailState && this.form.notifyTemplateKey != this.prohibitState && this.form.notifyTemplateKey != this.lostState )){
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
      this.doBeforeSubmit(again)
    },
    async onSaving() {
      const notifyTemplateId = Util.hasValue(this.form.notifyTemplateId)? this.form.notifyTemplateId: -1
      const aNotifyState = (this.form.notifyTemplateKey != null)?this.form.notifyTemplateKey:""
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
@import "../../../sub/constant/label.scss";
</style>