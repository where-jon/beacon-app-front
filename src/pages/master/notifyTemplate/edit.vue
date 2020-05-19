<template>
  <div class="container-fluid">
    <breadcrumb :items="breadCrumbs" />
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
          <b-form-radio-group v-model="form.notifyMedium" :options="notify" :disabled="!bNotifyTo" @change="radioChange" required/>
        </b-form-group>

        <!--通知先-->
        <b-form-group v-if="bNotifyTo">
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
        <b-button v-if="isEditable" :variant="theme" type="submit" class="mr-2 my-1" @click="doBeforeSubmit(false)">
          {{ $i18n.tnl(`label.${isUpdate? 'update': 'register'}`) }}
        </b-button>
        <b-button v-if="isRegistable && !isUpdate" v-t="'label.registerAgain'" :variant="theme" type="submit" class="my-1" @click="doBeforeSubmit(true)" />
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
      breadCrumbs: ViewHelper.createBreadCrumbItems('master', {text: 'notifyTemplate', href: '/master/notifyTemplate'}, ViewHelper.getDetailCaptionKey(this.$store.state.app_service.template.notifyTemplateId)),
      radioSelect: -1,
      fromType: 'email',
      deliveryState: NOTIFY_STATE.getOptions().filter(val => val.value == 'TX_DELIVERY_NOTIFY')[0].value,
      userMailState: NOTIFY_STATE.getOptions().filter(val => val.value == 'USER_REG_NOTIFY')[0].value,
      prohibitState: NOTIFY_STATE.getOptions().filter(val => val.value == 'PROHIBIT_NOTIFY')[0].value,
      lostState: NOTIFY_STATE.getOptions().filter(val => val.value == 'LOST_NOTIFY')[0].value,
      txUndetectedState: NOTIFY_STATE.getOptions().filter(val => val.value == 'TX_UNDETECTED_NOTIFY')[0].value,
      txNeglectState: NOTIFY_STATE.getOptions().filter(val => val.value == 'TX_NEGLECT_NOTIFY')[0].value,
      txHaveMultipleState: NOTIFY_STATE.getOptions().filter(val => val.value == 'TX_HAVE_MULTIPLE_NOTIFY')[0].value,
      notify: _.slice(NOTIFY_MIDIUM.getTypes()).filter(val => APP.NOTIFY.MIDIUM_TYPES.includes(val.value)),
      isEnableNameText: true,
      isRegist: false,
      bNotifyTo: true,
      bSubject: true,
      bNotifyTemplateKey: true,
    }
  },
  computed: {
    ...mapState( [
      'showAlert',
    ]),
    notifOptions() {
      return _.slice(NOTIFY_STATE.getOptions()).filter(val => APP.NOTIFY.STATE_TYPES.includes(val.index))
    },
    notifyStateOptions() {
      return _.slice(NOTIFY_STATE.getOptions()).filter(val => APP.NOTIFY.STATE_TYPES.includes(val.index))
    },
    ...mapState('app_service', [
      'template',
    ]),
  },
  created() {
    this.form.notifyMedium == 1? this.bSubject = false: this.bSubject = true
    if(this.form.notifyTemplateKey == this.userMailState || this.form.notifyTemplateKey == this.deliveryState) {
      this.bNotifyTo = false
    }
    let labelUpdate = ViewHelper.getDetailCaptionKey(this.$store.state.app_service.template.notifyTemplateId)
    labelUpdate == 'label.update'? this.bNotifyTemplateKey = false: this.bNotifyTemplateKey = true
    this.signalChange()
  },
  mounted(){
    ValidateHelper.setCustomValidationMessage()
  },
  methods: {
    reset () {
    },
    signalChange(evt = this.form.notifyTemplateKey) {
      this.form.notifyMedium == undefined ? this.form.notifyMedium = 0:null
      if (evt == this.txUndetectedState || evt == this.txNeglectState || evt == this.txHaveMultipleState
           || evt == this.deliveryState || evt == this.userMailState || evt == this.prohibitState || evt == this.lostState) {
        this.notify = _.slice(NOTIFY_MIDIUM.getTypes()).filter(val => [0].includes(val.value))
        this.bNotifyTo = evt == this.userMailState || evt == this.deliveryState ?  false: true
        if(this.txUndetectedState || this.txNeglectState || this.txHaveMultipleState){
          this.bNotifyTo = true
          this.form.notifyMedium = 0
        }
        this.bSubject = true
        if(evt != this.form.notifyTemplateKey){
          this.form.notifyMedium = 0
          this.form.notifyTo = ''
        }
      }else{
        this.bNotifyTo = true
        this.notify = _.slice(NOTIFY_MIDIUM.getTypes()).filter(val => APP.NOTIFY.MIDIUM_TYPES.includes(val.value))
      }
      if(this.radioSelect == 0){
        this.bSubject = true
      }
    },
    radioChange(evt) {
      this.radioSelect = evt
      if (evt == 1) {
        this.bSubject = false
        this.form.subject = ''
        this.fromType = 'text'
      }else{
        this.bSubject = true
      }
    },
    async onSaving() {
      const entity = {
        updateKey: Util.hasValue(this.form.notifyTemplateId) ? this.form.notifyTemplateId: null,
        notifyTemplateKey: this.form.notifyTemplateKey ? this.form.notifyTemplateKey : null,
        notifyMedium: this.form.notifyMedium,
        notifyTo: this.form.notifyTo ? this.form.notifyTo : null,
        subject: this.form.subject ? this.form.subject : null,
        mailFrom: this.form.mailFrom ? this.form.mailFrom : null,
        template: this.form.template ? this.form.template : null,
      }
      this.errorMessages.email = []
      this.replace({showAlert: false})
      return await AppServiceHelper.bulkSaveByCsvStr(this.appServicePath, [entity])
    },
  }
}
</script>

<style scoped lang="scss">
@import "../../../sub/constant/label.scss";
</style>
