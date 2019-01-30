<template>
  <div>
    <breadcrumb :items="items" :reload="true" @reload="fetchData" />
    <div v-for="(env, index) in envs" :key="index">
      <div>{{ env.key }}</div>
      <table>
        <tr v-for="(cenv, cindex) in env.val" :key="cindex">
          <td>{{ cenv.key }}</td>
          <td v-html="cenv.val"></td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script>
import * as HttpHelper from '../../sub/helper/HttpHelper'
import breadcrumb from '../../components/layout/breadcrumb.vue'

export default {
  components: {
    breadcrumb,
  },
  data () {
    return {
      envs: [],
      items: [
        {
          text: this.$i18n.t('label.develop'),
          active: true
        },
        {
          text: this.$i18n.t('label.env'),
          active: true
        }
      ],
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
                val: this.isJson(cval)?
                  JSON.stringify(cval, null, 2).split('\\n').join('<br>').split('  ').join('&nbsp;&nbsp;').split('\\"').join('&quot;')
                  : cval
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
    }
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