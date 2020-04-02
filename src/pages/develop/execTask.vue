<template>
  <div class="container-fluid">
    <breadcrumb :items="items" />
    <b-form @submit.prevent="publishTask">
      <b-form-group>
        <label v-t="'label.batchTarget'" />
        <b-form-select v-model="batchTarget" :options="batchTargetOptions" />
      </b-form-group>
      <b-form-group>
        <label v-t="'Param'" />
        <b-form-input v-model="param" type="text" />
      </b-form-group>
      <b-button v-t="'label.Execute'" type="submit" />
    </b-form>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import * as ArrayUtil from '../../sub/util/ArrayUtil'
import * as DateUtil from '../../sub/util/DateUtil'
import * as HttpHelper from '../../sub/helper/base/HttpHelper'
import * as ViewHelper from '../../sub/helper/ui/ViewHelper'
import breadcrumb from '../../components/layout/breadcrumb.vue'
import commonmixin from '../../components/mixin/commonmixin'

export default {
  components: {
    breadcrumb,
  },
  mixins: [commonmixin],
  data () {
    return {
      items: ViewHelper.createBreadCrumbItems('develop', 'execTask'),
      param: DateUtil.formatDatetime(new Date(), 'yyyy/MM/dd'),
      batchTarget: 'SENSOR_1',
    }
  },
  computed: {
    ...mapState([
      'currentRegion',
      'currentTenant',
    ]),
    batchTargetOptions() {
      const arr = ['POSITION','PROHIBIT_ZONE','LOST_ZONE','SENSOR_1','SENSOR_2','SENSOR_3','SENSOR_5','SENSOR_6','SENSOR_8','SENSOR_9','SENSOR_10','SENSOR_11','MONITOR','UTILIZATION','STAY_SUM','PROXIMITY','AD_SYNC','ENTER_COUNT']
      return arr.map(e => ({value: e, text: e + '(' + this.$i18n.tnl('label.' + e) + ')', label: this.$i18n.tnl('label.' + e)}))
    }
  },
  mounted() {
  },
  methods: {
    async publishTask() {
      this.showProgress()
      try {
        const task = {
          tenantId: this.currentTenant.tenantId,
          regionId: this.currentRegion.regionId,
          meshId: this.currentRegion.meshId,
          batchTarget: this.batchTarget,
          param: this.param,
          expired: new Date().getTime() + 60000
        }
        const queueName = ArrayUtil.equalsAny(this.batchTarget, 'UTILIZATION','STAY_SUM','PROXIMITY','AD_SYNC','ENTER_COUNT')? 'CRON': 'INTERVAL'
        await HttpHelper.putAppService('/meta/tenant/publishTask?stopAfter=10&queueName=' + queueName, task)
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