<template>
  <div>
    <div class="container">
      <b-form-group>
        <fieldset class="border border-primary px-3">
          <legend v-t="'label.legend'" class="text-center px-3" style="width: auto;"/>
          <table v-for="item in items" :key="item.name" class="my-4">
            <tr>
              <td rowspan="2" class="pr-2">
                <img v-bind:src="`${item.dispIcon}`">
              </td>
            </tr>
            <tr>
              <td>
                {{item.dispText}}
              </td>
            </tr>
          </table>
        </fieldset>
      </b-form-group>
    </div>
  </div>
</template>

<script>

export default {
  props: ['legendItems'],
  data() {
    return {
      items: [],
    }
  },
  created() {
    this.items = this.legendItems.map((val) => ({
      ...val,
      dispText: val.text? `: ${val.text}`: null,
      dispIcon: val.iconName? require(`../assets/icon/${val.iconName}`): null,
    }))
  },
}
</script>

<style scoped lang="scss">
</style>