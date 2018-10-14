<template>
  <div>
    <breadcrumb :items="items" />
    <m-list :params="params" :list="txs" />
  </div>
</template>

<script>
import mList from '../../../components/list.vue'
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import * as AppServiceHelper from '../../../sub/helper/AppServiceHelper'
import { addLabelByKey } from '../../../sub/helper/ViewHelper'
import listmixinVue from '../../../components/listmixin.vue'
import breadcrumb from '../../../components/breadcrumb.vue'
import * as Util from '../../../sub/util/Util'
import { APP } from '../../../sub/constant/config.js'

let that

export default {
  mixins: [listmixinVue],
  components: {
    mList, 
    breadcrumb,
  },
  data() {
    return {
      params: {
        name: 'tx',
        id: 'txId',
        editPath: '/master/tx/edit',
        appServicePath: '/core/tx',
        fields: addLabelByKey(this.$i18n, [ 
          {key: "txId", sortable: true, tdClass: "action-rowdata" },
          APP.TX_BTX_MINOR != 'minor'? {key: "btxId", sortable: true, tdClass: "action-rowdata" }: null,
          {key: "txName", sortable: true, tdClass: "action-rowdata" },
          APP.TX_WITH_DISPLAY_NAME? {key: "displayName", sortable: true, tdClass: "action-rowdata" }: null,
          APP.TX_WITH_MAJOR? {key: "major", sortable: true, tdClass: "action-rowdata" }: null,
          APP.TX_BTX_MINOR != 'btxId'? {key: "minor", sortable: true, tdClass: "action-rowdata" }: null,
          APP.TX_WITH_CATEGORY? {key: "category", sortable: true, tdClass: "action-rowdata" }: null,,
          APP.TX_WITH_DESCRIPTION? {key: "description", sortable: true, tdClass: "action-rowdata" }: null,
          {key: "sensor", label:'type', sortable: true,},
          {key: "actions", thStyle: {width: '130px !important'}, tdClass: "action-rowdata" }
        ]),
        initTotalRows: this.$store.state.app_service.txs.length
      },
      items: [
        {
          text: this.$i18n.t('label.master'),
          active: true
        },
        {
          text: this.$i18n.t('label.tx'),
          active: true
        }
      ]
    }
  },
  computed: {
    ...mapState('app_service', [
      'txs',
      'txImages',
    ]),
  },
  mounted() {
    that = this
  },
  methods: {
    async fetchData(payload) {
      try {
        this.replace({showProgress: true})
        let txs = await AppServiceHelper.fetchList('/core/tx/withPot', 'txId')
        txs = txs.map((tx) => {
          return {
            ...tx,
            displayName: Util.getValue(tx, 'pot.displayName', null),
            description: Util.getValue(tx, 'pot.description', null),
            category: Util.getValue(tx, 'pot.potCategoryList.0.category.categoryName', null),
            sensor: that.$i18n.t('label.' + Util.getValue(tx, 'txSensorList.0.sensor.sensorName', 'normal'))
          }
        })
        if (payload && payload.done) {
          payload.done()
        }
        this.replaceAS({txs})
      }
      catch(e) {
        console.error(e)
      }
      this.replace({showProgress: false})
    }
  }
}
</script>

<style scoped lang="scss">

</style>