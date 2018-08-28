<template>
  <div class="container">

    <b-alert variant="info" :show="showInfo">{{ message }}</b-alert>
    <b-alert variant="danger" dismissible :show="showAlert"  @dismissed="showAlert=false">{{ message }}</b-alert>

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
        <label v-t="'label.areaId'" />
        <b-form-input type="number" v-model="form.areaId" required :readonly="!isEditable" />
      </b-form-group>
      <b-form-group>
        <label v-t="'label.posId'" />
        <b-form-input type="number" v-model="form.posId" required :readonly="!isEditable" />
      </b-form-group>
      <b-form-group>
        <label v-t="'label.locationX'" />
        <b-form-input type="number" v-model="form.x" required :readonly="!isEditable" />
      </b-form-group>
      <b-form-group>
        <label v-t="'label.locationY'" />
        <b-form-input type="number" v-model="form.y" required :readonly="!isEditable" />
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
      <b-button v-if="isEditable" type="submit" variant="outline-primary" @click="register(false)" >{{ label }}</b-button>
      <b-button v-if="isEditable && !isUpdate" type="submit" variant="outline-primary" @click="register(true)" class="ml-2" v-t="'label.registerAgain'"/>
      <b-button type="button" variant="outline-danger" @click="backToList" class="ml-2" v-t="'label.back'"/>
    </b-form>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import _ from 'lodash'
import * as ViewHelper from '../../../sub/helper/ViewHelper'
import * as AppServiceHelper from '../../../sub/helper/AppServiceHelper'
import editmixinVue from '../../../components/editmixin.vue';
import { txViewTypes } from '../../../sub/constant/Constants'

let that

export default {
  mixins: [editmixinVue],
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
        "location.x", "location.y", "location.visible", "location.txViewType"
      ]),
      deviceId: null,
      deviceIdX: null,
    }
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
    if (this.form.enabled == null) {
      this.form.enabled = true
    }
  },
  computed: {
    ...mapState('app_service', [
      'exb',
    ]),
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
          areaId: this.form.areaId,
          x: this.form.x,
          y: this.form.y,
        }
      }
      this.deviceId = null
      this.deviceIdX = null
      return await AppServiceHelper.bulkSave(this.appServicePath, [entity])
   },
  }
}
</script>

<style scoped lang="scss">

</style>