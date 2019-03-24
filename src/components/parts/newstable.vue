<template>
  <div v-if="datas.length > 0">
    <b-row>
      <b-col md="8" offset-md="2">
        <h5 v-t="'label.topNews'" class="font-weight-bold" />
      </b-col>
    </b-row>
    <b-row>
      <b-col md="8" offset-md="2">
        <div class="table-area">
          <table v-if="!vueTableMode" class="table table-hover">
            <thead>
              <th v-for="(header, index) in headers" :key="index" scope="col">{{ header.label }}</th>
            </thead>
            <tbody>
              <tr v-for="(data, dataIndex) in datas" :key="dataIndex" :class="trClass(data, dataIndex)">
                <td v-for="(header, headerIndex) in headers" :key="headerIndex" :class="tdClass(header.key)">
                  {{ data[header.key] }}
                </td>
              </tr>
            </tbody>
          </table>
          <vue-scrolling-table v-else>
            <template slot="thead">
              <th v-for="(header, index) in headers" :key="index" scope="col">
                {{ header.label }}
              </th>
            </template>
            <template slot="tbody">
              <tr v-for="(data, index) in datas" :key="index">
                <td v-for="(header, headerIndex) in headers" :key="headerIndex" scope="row">
                  <span v-if="header.key.includes('nearest') && type == 'position'">
                    <div v-for="(value, key) in data[header.key]" :key="key">
                      {{ key }}:{{ value }}
                    </div>
                  </span>
                  <span v-else>
                    {{ data[header.key] }}
                  </span>
                </td>
              </tr>
            </template>
          </vue-scrolling-table>
        </div>
      </b-col>
    </b-row>




  </div>
</template>

<script>
import VueScrollingTable from 'vue-scrolling-table'
import reloadmixinVue from '../mixin/reloadmixin.vue'
import commonmixinVue from '../mixin/commonmixin.vue'
import statusmixinVue from '../mixin/statusmixin.vue'

export default {
  components: {
    VueScrollingTable,
  },
  mixins: [reloadmixinVue, commonmixinVue, statusmixinVue],
  props: {
    isDev: {
      type: Boolean,
      default: false
    },
    vueTableMode: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      default: ''
    },
    headers: {
      type: Array,
      default: () => []
    },
    datas: {
      type: Array,
      default: () => []
    },
    trClass: {
      type: Function,
      default: () => ''
    },
    tdClass: {
      type: Function,
      default: () => ''
    },
  },
  data () {
    return {
    }
  },
}
</script>

<style scoped lang="scss">
@import "../../sub/constant/scrolltable.scss";

div.table-area {
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
}

tbody {
  display:block;
  height:400px;
  overflow:auto;
  min-width: 530px;
}

thead, tbody tr {
  display:table;
  width:100%;
  table-layout:fixed;
}

td {
  word-break: break-all;
}

td.news-date {
  word-break: break-all;
  width: 28%;
}

span.badge {
  margin-right: 0px;
}

thead {
  width: calc( 100% - 1em )
}

</style>
