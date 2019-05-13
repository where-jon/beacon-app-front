<template>
  <div>
    <breadcrumb :items="items" />
    <div class="container">
      <alert :message="message" />

      <b-form v-if="show" @submit.prevent="onSubmit">
        <b-form-group>
          <label v-t="'label.newsDt'" />
          <date-picker v-model="form.newsDate" :clearable="false" type="datetime" class="ml-2" required />
        </b-form-group>
        <b-form-group>
          <label v-t="'label.newsContent'" />
          <b-form-textarea v-model="form.content" :rows="3" :max-rows="6" :readonly="!isEditable" maxlength="200" required />
        </b-form-group>
        <b-form-group>
          <b-form-checkbox v-model="form.dispFlg" :disabled="!isEditable" :readonly="!isEditable" :value="1" :unchecked-value="0">
            <span v-text="$i18n.tnl('label.dispFlg')" />
          </b-form-checkbox>
        </b-form-group>

        <b-button v-t="'label.back'" type="button" variant="outline-danger" class="mr-2 my-1" @click="backToList" />
        <b-button v-if="isEditable" :variant="theme" type="submit" class="mr-2 my-1" @click="register(false)">
          {{ $i18n.tnl(`label.${isUpdate? 'update': 'register'}`) }}
        </b-button>
        <b-button v-if="isRegistable && !isUpdate" v-t="'label.registerAgain'" :variant="theme" type="submit" class="my-1" @click="register(true)" />
      </b-form>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { DatePicker } from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import * as AppServiceHelper from '../../../sub/helper/AppServiceHelper'
import * as ViewHelper from '../../../sub/helper/ViewHelper'
import editmixinVue from '../../../components/mixin/editmixin.vue'
import * as HtmlUtil from '../../../sub/util/HtmlUtil'
import * as Util from '../../../sub/util/Util'
import breadcrumb from '../../../components/layout/breadcrumb.vue'
import alert from '../../../components/parts/alert.vue'
import { getButtonTheme } from '../../../sub/helper/ThemeHelper'

export default {
  components: {
    breadcrumb,
    alert,
    DatePicker,
  },
  mixins: [editmixinVue],
  data() {
    return {
      name: 'news',
      id: 'newsId',
      backPath: '/provider/news',
      appServicePath: '/news',
      form: ViewHelper.extract(this.$store.state.app_service.news,
        ['newsId', 'newsDate', 'content', 'dispFlg']),
      items: ViewHelper.createBreadCrumbItems('provider', {text: 'news', href: '/provider/news'}, Util.getDetailCaptionKey(this.$store.state.app_service.news.newsId)),
    }
  },
  computed: {
    theme () {
      const theme = getButtonTheme()
      return 'outline-' + theme
    },
    ...mapState('app_service', [
      'news',
    ]),
  },
  async mounted() {
    HtmlUtil.importElementUI()
    if(this.form.newsDate == null){
      this.form.newsDate = (new Date()).getTime()
    }
  },
  methods: {
    beforeReload(){
      this.form.newsDate = (new Date()).getTime()
    },
    async save() {
      let dummyKey = -1
      const entity = {
        newsId: Util.hasValue(this.form.newsId)? this.form.newsId: dummyKey--,
        newsDate: this.form.newsDate,
        content: this.form.content,
        dispFlg: this.form.dispFlg,
      }
      return await AppServiceHelper.bulkSave(this.appServicePath, [entity])
    },
  }
}
</script>

<style scoped lang="scss">

</style>