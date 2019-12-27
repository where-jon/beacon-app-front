<template>
  <div class="container-fluid">
    <breadcrumb :items="items" />
    <div class="container">
      <alert :message="message" />

      <b-row>
        <b-col md="8" offset-md="2">
          <b-form v-if="show" @submit.prevent="save">
            <b-form-group>
              <label v-t="'label.deviceId'" />
              <input v-model.lazy="deviceId" :max="maxDeviceId" :readonly="!isEditable" type="number" class="form-control" min="0">
            </b-form-group>
            <b-form-group>
              <label v-t="'label.meshId'" />
              <input v-model.lazy="meshId" :readonly="!isEditable" type="number" class="form-control" min="0">
            </b-form-group>
            <b-button v-t="'label.back'" type="button" variant="outline-danger" class="mr-2 my-1" @click="backToList" />
            <b-button v-if="isEditable" :variant="theme" type="submit" class="mr-2 my-1" @click="doBeforeSubmit(false)">
              {{ $i18n.tnl(`label.${isUpdate? 'update': 'register'}`) }}
            </b-button>
            <b-button v-if="isRegistable && !isUpdate" v-t="'label.registerAgain'" :variant="theme" type="submit" class="my-1" @click="doBeforeSubmit(true)" />
          </b-form>
        </b-col>
      </b-row>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { APP } from '../../../sub/constant/config'
import * as ArrayUtil from '../../../sub/util/ArrayUtil'
import * as NumberUtil from '../../../sub/util/NumberUtil'
import * as Util from '../../../sub/util/Util'
import * as AppServiceHelper from '../../../sub/helper/dataproc/AppServiceHelper'
import * as ConfigHelper from '../../../sub/helper/dataproc/ConfigHelper'
import * as MenuHelper from '../../../sub/helper/dataproc/MenuHelper'
import * as OptionHelper from '../../../sub/helper/dataproc/OptionHelper'
import * as StateHelper from '../../../sub/helper/dataproc/StateHelper'
import * as ValidateHelper from '../../../sub/helper/dataproc/ValidateHelper'
import * as ViewHelper from '../../../sub/helper/ui/ViewHelper'
import * as VueSelectHelper from '../../../sub/helper/ui/VueSelectHelper'
import breadcrumb from '../../../components/layout/breadcrumb.vue'
import commonmixin from '../../../components/mixin/commonmixin.vue'
import editmixin from '../../../components/mixin/editmixin.vue'
import alert from '../../../components/parts/alert.vue'
import autoAlert from '../../../components/parts/autoAlert.vue'

export default {
  components: {
    breadcrumb,
    alert,
    autoAlert,
  },
  mixins: [commonmixin, editmixin],
  data() {
    return {
      name: 'gateway',
      id: 'deviceid',
      backPath: '/master/gateway',
      appServicePath: '/core/excloud/gwlist',
      items: ViewHelper.createBreadCrumbItems('master', {text: 'masterGateway', href: '/master/gateway'}, ViewHelper.getDetailCaptionKey(this.$store.state.app_service.exb.exbId)),
      form: {'deviceId':null, 'meshId':null},
      mutex: false,
      deviceId: null,
      meshId: null,
      maxDeviceId: 65535,
    }
  },
  computed: {
    ...mapState('app_service', [
    ]),
  },
  watch: {
    deviceId: function(newVal, oldVal) {
      if (!this.mutex) {
        this.mutex = true
        this.deviceId = newVal 
        this.mutex = false
      }
    },
  },
  async created() {
    this.$nextTick(() => {
      ValidateHelper.setCustomValidationMessage()
      VueSelectHelper.disabledAllSubmit()
    })
  },
  async mounted() {
    this.deviceId = this.form.deviceId
  },
  methods: {
    onBeforeReload(){
    },
    async onSaving() {
      const entity = {
        deviceid: this.deviceId,
        meshid: this.meshId
      }
      let ret = await AppServiceHelper.bulkSave(this.appServicePath, [entity])
      this.deviceId = null
      return ret
    },
  }
}
</script>

<style scoped lang="scss">
@import "../../../sub/constant/vue.scss";

label.txicons-num {
  margin-left: 20px;
}
</style>
