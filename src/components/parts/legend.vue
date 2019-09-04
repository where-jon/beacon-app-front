<template>
  <div style="background-color: #FFFFFF;">
    <fieldset class="border border-primary px-3">
      <legend v-t="'label.legend'" class="text-center px-3 legend-font" style="width: auto;" />
      <table class="my-2" style="width: auto;">
        <tr v-for="legendItem in legendItems" :key="legendItem.id">
          <td v-for="item in legendItem.items" :key="item.id" class="pr-2 py-1">
            <div :style="item.style">
              {{ item.text }}
            </div>
          </td>
        </tr>
      </table>
    </fieldset>
  </div>
</template>

<script>
export default {
  props: {
    legendItems: {
      type: Array,
      required: true,
    },
  },
}
</script>

<style scoped lang="scss">
.legend-font {
  font-size: 1rem;
}
</style>
