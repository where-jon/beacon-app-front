<template>
  <div />
</template>

<script>
import * as BrowserUtil from '../../sub/util/BrowserUtil'
import * as HttpHelper from '../../sub/helper/base/HttpHelper'
import { APP } from '../../sub/constant/config'

export default {
  async mounted() {
    // パラメータからcodeを取得し、サーバ側に登録する。そしてトップページへ遷移する（エラーの場合もトップページに進める）。
    const code = BrowserUtil.getParam('code')
    HttpHelper.getAppService(`/meta/tenant/aquireToken?code=${code}`)
    this.$router.push(APP.MENU.TOP_PAGE)
  }
}
</script>

<style>
</style>
