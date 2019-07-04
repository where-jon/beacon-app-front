<template>
  <div class="container-fluid">
    <breadcrumb :items="items" :reload="true" @reload="fetchData" />
    <div v-for="(env, index) in envs" :key="index">
      <div>{{ env.key }}</div>
      <table>
        <tr v-for="(cenv, cindex) in env.val" :key="cindex">
          <td>{{ cenv.key }}</td>
          <td v-if="!isArray(cenv.val)">
            {{ cenv.val }}
          </td>
          <td v-else>
            <div v-for="(val, key) in cenv.val" :key="key" :style="getStyle(val)">
              {{ getLine(val) }}
            </div>
          </td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script>
import * as ArrayUtil from '../../sub/util/ArrayUtil'
import * as HttpHelper from '../../sub/helper/HttpHelper'
import * as ViewHelper from '../../sub/helper/ViewHelper'
import breadcrumb from '../../components/layout/breadcrumb.vue'

export default {
  components: {
    breadcrumb,
  },
  data () {
    return {
      items: ViewHelper.createBreadCrumbItems('develop', 'env'),
      envs: [],
    }
  },
  mounted() {
    this.fetchData()
  },
  methods: {
    async fetchData(payload) {
      try {
        let data = await HttpHelper.getAppService('/meta/tenant/env?_=' + new Date().getTime())
        this.envs = Object.keys(data).sort().map((key) => {
          return {
            key,
            val: Object.keys(data[key]).sort().map((ckey) => {
              let cval = data[key][ckey]
              return {
                key: ckey,
                val: this.isJson(cval)? JSON.stringify(cval, null, 2).split('\\"').join('"').split('\\n'): cval,
              }
            })
          }
        })
        if (payload && payload.done) {
          payload.done()
        }
      }
      catch(e) {
        console.error(e)
      }
    },
    isJson(str) {
      try {
        return (typeof JSON.parse(str) === 'object')
      } catch (e) {
        return false
      }
    },
    isArray(val) {
      return ArrayUtil.isArray(val)
    },
    getLine(line){
      return line.trim()
    },
    getStyle(line){
      const match = line.match(/ /g)
      return {'padding-left': `${match? Math.floor(match.length / 2): 0}em`}
    },
  }
}
</script>

<style scoped lang="scss">

table {
  border: 1px solid black;
  border-collapse: collapse;
  width: 100%;
  word-wrap:break-word;
  table-layout: fixed;
}

td {
  border: solid 1px black
}

</style>