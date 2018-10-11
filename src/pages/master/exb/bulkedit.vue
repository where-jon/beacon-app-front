<template>
  <div class="container">

    <b-alert variant="info" :show="showInfo">{{ message }}</b-alert>
    <b-alert variant="danger" dismissible :show="showAlert"  @dismissed="showAlert=false" v-html="message"></b-alert>

    <b-form @submit="onSubmit" v-if="show">
      <b-form-group>
        <label v-t="'label.csvFile'" />
        <b-form-file v-model="form.csvFile" accept="text/csv" :placeholder="$t('message.selectFile') "></b-form-file>
      </b-form-group>
      <b-button type="submit" variant="outline-primary" @click="register(true)" >{{ label }}</b-button>
      <b-button type="button" variant="outline-danger" @click="backToList" class="ml-2" v-t="'label.back'"/>
    </b-form>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import _ from 'lodash'
import * as ViewHelper from '../../../sub/helper/ViewHelper'
import * as AppServiceHelper from '../../../sub/helper/AppServiceHelper'
import * as Util from '../../../sub/util/Util'
import editmixinVue from '../../../components/editmixin.vue'
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
      mutex: false,
      bulkRegister: true,
      form: {},
    }
  },
  watch: {
  },
  mounted() {
    that = this
  },
  computed: {
    ...mapState('app_service', [
      'exb',
    ]),
  },
  methods: {
    async save() {
      const MAIN_COL = "exbId"
      const LOCATION = ["locationId","areaName","locationName","visible","txViewType","posId","x","y"]
      const NUMBER_TYPE_LIST = ["deviceId", "exbId", "areaId", "locationId", "posId", "x", "y", "z", "txViewType", "zoneName"]
      const BOOL_TYPE_LIST = ["visible", "enabled"]

      await this.bulkSave(MAIN_COL, NUMBER_TYPE_LIST, BOOL_TYPE_LIST, (entity, headerName, val, dummyKey) => {
        if (Util.equalsAny(headerName, LOCATION)) {
          if (headerName == "locationId" && !val) {
            val = dummyKey--          
          }
          if (!entity.location) {
            entity.location = {locationId: dummyKey--}
          }
          entity.location[headerName] = val
        }
        else {
          if (headerName == MAIN_COL && !val) {
            val = dummyKey--
          }
          entity[headerName] = val
        }
        return dummyKey
      })
    },
  }
}
</script>

<style scoped lang="scss">

</style>