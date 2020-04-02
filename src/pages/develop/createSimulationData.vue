<template>
  <div class="container-fluid">
    <breadcrumb :items="items" />
    <b-form @submit.prevent="createData">
      <b-form-group>
        <label v-t="'label.keyCategory'" />
        <b-form-select v-model="kind" :options="kindOptions" />
      </b-form-group>
      <b-form-group>
        <b-form-row class="mr-3">
          <label v-t="'label.date'" class="mr-2 mb-2 d-flex align-items-center" />
          <date-picker v-model="startDate" type="datetime" class="mr-2 mb-2 inputdatefrom" />
        </b-form-row>
      </b-form-group>
      <b-form-group>
        <label v-t="'label.periodSec'" />
        <b-form-input v-model="periodSec" type="number" />
      </b-form-group>
      <b-form-group>
        <label v-t="'label.stepSec'" />
        <b-form-input v-model="stepSec" type="number" step="30" />
      </b-form-group>
      <b-button v-t="'label.Execute'" type="submit" />
    </b-form>
  </div>
</template>

<script>
import { DatePicker } from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import * as HttpHelper from '../../sub/helper/base/HttpHelper'
import * as ViewHelper from '../../sub/helper/ui/ViewHelper'
import breadcrumb from '../../components/layout/breadcrumb.vue'
import commonmixin from '../../components/mixin/commonmixin'

export default {
  components: {
    breadcrumb,
    DatePicker,
  },
  mixins: [commonmixin],
  data () {
    return {
      items: ViewHelper.createBreadCrumbItems('develop', 'createSimulationData'),
      kind: 'POSITION',
      startDate: new Date(new Date().getTime() - 3600 * 1000),
      periodSec: 3600,
      stepSec: 30,
    }
  },
  computed: {
    kindOptions() {
      const arr = ['POSITION','SENSOR_1','SENSOR_2','SENSOR_3','SENSOR_5','SENSOR_6','SENSOR_8','SENSOR_9','SENSOR_10','SENSOR_11']
      return arr.map(e => ({value: e, text: this.$i18n.tnl('label.' + e), label: this.$i18n.tnl('label.' + e)}))
    }
  },
  mounted() {
  },
  methods: {
    async createData() {
      this.showProgress()
      try {
        const apiName = this.kind == 'POSITION'? '/core/positionHistory/createByDate': '/basic/sensorHistory/createByDate'
        const sensorId = this.kind.startsWith('SENSOR_')? this.kind.split('SENSOR_')[1]: null
        const param = {
          startDate: this.startDate.getTime(),
          periodSec: this.periodSec,
          stepSec: this.stepSec,
          sensorId,
        }
        await HttpHelper.putAppService(apiName + '?' + HttpHelper.toParam(param, true))
      }
      catch(e) {
        console.error(e)
      }
      finally {
        this.hideProgress()
      }
    },
  }
}
</script>

<style scoped lang="scss">
</style>