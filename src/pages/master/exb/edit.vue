<template>
  <div>
    <breadcrumb :items="items" />
    <div class="container">
      <b-alert variant="info" :show="showInfo">{{ message }}</b-alert>
      <b-alert variant="danger" dismissible :show="showAlert"  @dismissed="showAlert=false">{{ message }}</b-alert>
      <b-row>
        <b-col md="8" offset-md="2">
          <b-form @submit="onSubmit" v-if="show">
            <b-form-group v-if="form.exbId">
              <label v-t="'label.exbId'" />
              <b-form-input type="text" v-model="form.exbId" readonly="readonly" />
            </b-form-group>
            <b-form-group>
              <label v-t="'label.deviceId'" />
              <b-form-input type="number" v-model.lazy="deviceId" required :readonly="!isEditable" />
            </b-form-group>
            <b-form-group>
              <label v-t="'label.deviceIdX'" />
              <b-form-input type="text" v-model.lazy="deviceIdX" required :readonly="!isEditable" />
            </b-form-group>
            <b-form-group>
              <label v-t="'label.locationName'" />
              <b-form-input type="text" v-model="form.locationName" maxlength="20" required :readonly="!isEditable" />
            </b-form-group>
            <b-form-group>
              <label v-t="'label.displayName'" />
              <b-form-input type="text" v-model="form.displayName" maxlength="3" :readonly="!isEditable" />
            </b-form-group>
            <b-form-group>
              <label v-t="'label.areaName'" />
              <b-form-select v-model="form.areaId" :options="areaOptions" class="mb-3 ml-3 col-4" :readonly="!isEditable" />
            </b-form-group>
            <b-form-group>
              <label v-t="'label.posId'" />
              <b-form-input type="number" v-model="form.posId" required :readonly="!isEditable" />
            </b-form-group>
            <b-form-group>
              <label v-t="'label.locationX'" />
              <b-form-input type="number" v-model="form.x" :readonly="!isEditable" />
            </b-form-group>
            <b-form-group>
              <label v-t="'label.locationY'" />
              <b-form-input type="number" v-model="form.y" :readonly="!isEditable" />
            </b-form-group>
            <b-form-group>
              <b-form-checkbox v-model="form.enabled" value="true" unchecked-value="false" :readonly="!isEditable">
                {{ $t('label.enabled') }}
              </b-form-checkbox>
            </b-form-group>
            <b-form-group>
              <b-form-checkbox v-model="form.visible" value="true" unchecked-value="false" :readonly="!isEditable">
                {{ $t('label.visible') }}
              </b-form-checkbox>
            </b-form-group>
            <b-form-group>
              <label v-t="'label.txViewType'" />
              <b-form-select v-model="form.txViewType" :options="txViewTypes" class="mb-3 ml-3 col-3" :readonly="!isEditable" />
            </b-form-group>
            <b-form-group>
              <label v-t="'label.type'" />
              <b-form-select v-model="form.sensorId" :options="sensorOptionsExb" class="mb-3 ml-3 col-4" :readonly="!isEditable" />
            </b-form-group>
            <b-button type="button" variant="outline-danger" @click="backToList" v-t="'label.back'"/>
            <b-button v-if="isEditable" type="submit" :variant="theme" @click="register(false)" class="ml-2" >{{ label }}</b-button>
            <b-button v-if="isEditable && !isUpdate" type="submit" :variant="theme" @click="register(true)" class="ml-2" v-t="'label.registerAgain'"/>
          </b-form>
        </b-col>
      </b-row>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import _ from 'lodash'
import * as ViewHelper from '../../../sub/helper/ViewHelper'
import * as AppServiceHelper from '../../../sub/helper/AppServiceHelper'
import * as StateHelper from '../../../sub/helper/StateHelper'
import editmixinVue from '../../../components/editmixin.vue'
import { txViewTypes } from '../../../sub/constant/Constants'
import breadcrumb from '../../../components/breadcrumb.vue'
import { getButtonTheme } from '../../../sub/helper/ThemeHelper'

let that

export default {
  mixins: [editmixinVue],
  components: {
    breadcrumb,
  },
  data() {
    return {
      name: 'exb',
      id: 'exbId',
      backPath: '/master/exb',
      appServicePath: '/core/exb',
      txViewTypes: txViewTypes,
      mutex: false,
      form: ViewHelper.extract(this.$store.state.app_service.exb, [
          "exbId", "deviceId", "enabled",
          "location.locationName", "location.areaId", "location.locationId", "location.displayName", "location.posId",
          "location.x", "location.y", "location.visible", "location.txViewType",
          "exbSensorList.0.sensor.sensorId"
        ]
      ),
      defValue: {
        "enabled": true,
      },
      deviceId: null,
      deviceIdX: null,
      items: [
        {
          text: this.$i18n.t('label.master'),
          active: true
        },
        {
          text: this.$i18n.t('label.exb'),
          href: '/master/exb',
        },
        {
          text: this.$i18n.t('label.exb') + this.$i18n.t('label.detail'),
          active: true
        }
      ]
    }
  },
  computed: {
    theme () {
      const theme = getButtonTheme(this.$store.state.loginId)
      return 'outline-' + theme
    },
    sensorOptionsExb() {
      let options = this.sensorOptions('exb')
      options.unshift({value:null, text:this.$i18n.t('label.normal')})
      return options
    },
    areaOptions() {
      return this.areas.map((area) => {
          return {
            value: area.areaId,
            text: area.areaName
          }
        }
      )
    },
    ...mapState('app_service', [
      'exb',
      'areas',
      'sensorList',
    ]),
  },
  watch: {
    deviceId: function(newVal, oldVal) {
      if (!this.mutex) {
        this.mutex = true
        this.deviceId = newVal 
        this.deviceIdX = newVal? Number(newVal).toString(16).toUpperCase(): null
        this.mutex = false
      }
    },
    deviceIdX: function(newVal, oldVal) {
      if (!this.mutex) {
        this.mutex = true
        if (newVal) {
          if (!newVal.match(/^[a-fA-F\d]{0,4}$/)) {
            that.$nextTick(() => {
              this.deviceIdX = oldVal        
            })
            this.mutex = false
            return
          }
          this.deviceIdX = newVal
          this.deviceId = parseInt(newVal, 16) 
        }
        this.mutex = false
      }
    },
  },
  mounted() {
    that = this
    this.deviceId = this.form.deviceId
    ViewHelper.applyDef(this.form, this.defValue)
    if (!this.sensorList || this.sensorList.length == 0) {
      this.loadSensorList()
    }
    StateHelper.loadAreas()
  },
  methods: {
    async save() {
      let entity = {
        exbId: this.form.exbId? this.form.exbId: -1,
        deviceId: this.deviceId,
        locationId: this.form.locationId,
        enabled: this.form.enabled,
        location: {
          locationId: this.form.locationId? this.form.locationId: -2,
          areaId: this.form.areaId,
          locationName: this.form.locationName,
          displayName: this.form.displayName,
          visible: this.form.visible,
          txViewType: this.form.txViewType,
          posId: this.form.posId,
          x: this.form.x,
          y: this.form.y,
        },
        exbSensorList: this.form.sensorId? [
          {exbSensorPK: {sensorId: this.form.sensorId}}
        ]: null
      }
      let ret = await AppServiceHelper.bulkSave(this.appServicePath, [entity])
      this.deviceId = null
      this.deviceIdX = null
      return ret
   },
  }
}
</script>

<style scoped lang="scss">

</style>