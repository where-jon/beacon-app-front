<template>
  <div class="container">

    <b-alert variant="info" :show="showInfo">{{ message }}</b-alert>
    <b-alert variant="danger" dismissible :show="showAlert"  @dismissed="showAlert=false">{{ message }}</b-alert>

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
      await this.bulkSave((csv) => {
        let entities = []
        let header
        let dummyKey = -1
        let location = ["locationId","areaId","locationName","displayName","visible","txViewType","posId","x","y"]
        csv.data.forEach((line, lineIdx) => {
          if (lineIdx == 0) {
            header = line
          }
          else {
            let entity = {location:{}}
            line.forEach((val, idx) => {
              if (Util.equalsAny(header[idx], ["visible", "enabled"])) { // Boolean type
                val = Boolean(val)
              }
              else if (Util.equalsAny(header[idx], ["deviceId", "exbId", "locationId", "posId", "areaId", "x", "y", "z", "txViewType", "zoneId"])) { // Number type
                val = Number(val)
              }

              if (Util.equalsAny(header[idx], location)) {
                if (header[idx] == "locationId" && !val) {
                  val = dummyKey--
                }
                entity.location[header[idx]] = val
              }
              else {
                if (header[idx] == "exbId" && !val) {
                  val = dummyKey--
                }
                entity[header[idx]] = val
              }
            })
            entities.push(entity)
          }
        })
        return entities
      })
    },
  }
}
</script>

<style scoped lang="scss">

</style>