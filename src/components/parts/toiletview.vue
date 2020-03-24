<template>
  <div>
    <b-table :items="dataList" :fields="dataFieldList" stacked="md" striped hover :bordered="false" :small="small" :class="addClass">
      <template slot="HEAD_male">
        <div style="float:left">
          <label v-t="'label.male'" /><img src="~/assets/icon/male.svg" :class="iconHeader">
        </div>
      </template>
      <template slot="HEAD_female">
        <div style="float:left">
          <label v-t="'label.female'" /><img src="~/assets/icon/female.svg" :class="iconHeader">
        </div>
      </template>
      <template slot="HEAD_multip">
        <div style="float:left">
          <label v-t="'label.multip'" /><img src="~/assets/icon/multip.svg" :class="iconHeader">
        </div>
      </template>
      <template slot="male" slot-scope="row">
        <div><span v-t="row.item.male.iconLabel" class="availBox" :class="row.item.male.iconClass" /><span class="count">{{ row.item.male.count }}</span></div>
      </template>
      <template slot="female" slot-scope="row">
        <div><span v-t="row.item.female.iconLabel" class="availBox" :class="row.item.female.iconClass" /><span class="count">{{ row.item.female.count }}</span></div>
      </template>
      <template slot="multip" slot-scope="row">
        <div><span v-t="row.item.multip.iconLabel" class="availBox" :class="row.item.multip.iconClass" /><span class="count">{{ row.item.multip.count }}</span></div>
      </template>
    </b-table>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import * as ViewHelper from '../../sub/helper/ui/ViewHelper'
import commonmixin from '../mixin/commonmixin.vue'

export default {
  mixins: [commonmixin],
  props: {
    dataList: {
      type: Array,
      required: true,
    },
    showArea: {
      type: Boolean,
      required: true,
    },
    addClass: {
      type: String,
      default: '',
    },
    iconHeader: {
      type: String,
      default: 'iconHeaderSmall',
    },
    small: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
    }
  },
  computed: {
    ...mapState('app_service', [
      'positions',
    ]),
    defaultDataFieldList() {
      return ViewHelper.addLabelByKey(this.$i18n, [
        { key: 'areaName', thStyle: 'vertical-align: middle' },
        { key: 'zoneName', label: 'toilet', thStyle: 'vertical-align: middle' },
        { key: 'male', thClass: 'text-center', tdClass: 'text-center' },
        { key: 'female', thClass: 'text-center', tdClass: 'text-center' },
        { key: 'multip', thClass: 'text-center', tdClass: 'text-center' },
      ])
    },
    dataFieldList() {
      // 男女は常に表示し、ほかはデータが有れば表示。エリア列はareaIdが0の場合のみ表示
      const hasMultip = this.dataList.some(e => e.multip.allCount > 0)
      return this.defaultDataFieldList.filter(e => e.key != 'areaName' || this.showArea).filter(e => e.key != 'multip' || hasMultip)
    }
  },
}
</script>

<style scoped lang="scss">
table {
  white-space: nowrap !important;
}

.iconHeaderSmall {
  width: 20px;
  height: 20px;
  margin-left: 10px;
}

.iconHeaderLarge {
  width: 40px;
  height: 40px;
  margin-left: 10px;
}

.availBox {
  float: left;
  grid-template-columns: 1fr 1fr 1fr;
  -ms-grid-columns: 1fr 1fr 1fr;
  color: #ffffff;
  border-radius: 7px;
  padding: 3px;
  width: 32px;
  height: 32px;
  font-weight: bold;
  &.empty {
    background-color: rgb(68,114,196);
  }
  &.occupy {
    background-color: rgb(192,0,0);
  }
}

.count {
  float: left;
  margin-left: 10px;
  padding-top: 3px;
}

</style>
