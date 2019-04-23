<template>
  <b-container>
    <span v-if="toolTipShow" id="toolTipComponent" :style="toolTipStyle">
      <div v-if="typeof toolTipLabel == 'string'">
        <span>
          {{ toolTipLabel }}
        </span>
      </div>
      <div v-else>
        <div v-for="(item, index) in toolTipLabel" :key="index">
          <span v-if="showBlankRow || (item != null && item.length != 0)">
            {{ item }}
          </span>
        </div>
      </div>
    </span>
  </b-container>
</template>

<script>
export default {
  props: {
    toolTipShow: {
      type: Boolean,
      default: false,
    },
    toolTipLabel: {
      type: [Array, String],
      default: '',
    },
    toolTipStyle: {
      type: Object,
      default: () => {},
    },
    showBlankRow: {
      type: Boolean,
      default: false,
    },
  },
}
</script>

<style>
#toolTipComponent {
  position: absolute;
  z-index: 999;

  border-style: solid;
  border-width: 1px;
  line-height: 0px;
  display: block;
  padding: 8px;
  left: -1000px;
  top: -1000px;
}
</style>
