<template>
  <div>
    <div class="container">

      <b-alert variant="info" :show="showInfo">
        {{ message }}
        <div v-for="thumbnail in form.thumbnails" :key="thumbnail.id">ID:{{thumbnail.id}}({{thumbnail.name}})</div>
      </b-alert>
      <b-alert variant="warning" :show="showWarn">
        {{ warnMessage }}
        <div v-for="warnThumbnail in form.warnThumbnails" :key="warnThumbnail.id">ID:{{warnThumbnail.id}}</div>
      </b-alert>
      <b-alert variant="danger" dismissible :show="showAlert"  @dismissed="showAlert=false" v-html="message" />

      <b-form @submit="onSubmit" v-if="show">
        <b-form-group>
          <label v-t="'label.zipFile'" />
          <b-form-file :key="formKey" v-model="form.zipFile" @change="loadThumbnail" accept=".zip" :placeholder="$t('message.selectFile') "></b-form-file>
        </b-form-group>
        <b-button type="submit" :variant="theme" @click="register(true)" >{{ label }}</b-button>
        <b-button type="button" variant="outline-danger" @click="backToList" class="ml-2" v-t="'label.back'"/>
      </b-form>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import _ from 'lodash'
import editmixinVue from './editmixin.vue'
import { getButtonTheme } from '../sub/helper/ThemeHelper'
import { getTheme } from '../sub/helper/ThemeHelper'
import Encoding from 'encoding-japanese'
import * as Util from '../sub/util/Util'
import JsZip from 'jszip'

let that
let fileReader

export default {
  props: ["name", "id", "backPath", "appServicePath"],
  mixins: [editmixinVue],
  data() {
    return {
      mutex: false,
      bulkUpload: true,
      formKey: 0,
      fileCount: 0,
      form: {
        zipFile: null,
        thumbnails: [],
        warnThumbnails: [],
      },
    }
  },
  mounted() {
    that = this
    fileReader = new FileReader()
    fileReader.onload = () =>{
      const contents = JsZip.loadAsync(fileReader.result, {base64: true}).then((zip) => {
        this.fileCount = Object.keys(zip.files).length
        for(let key in zip.files){
          if(Util.hasValue(key) && key.match(/.*\.(png)|(jpg)|(jpeg)|(gif)$/)){
            const id = key.slice(key.lastIndexOf("/") + 1, key.lastIndexOf("."))
            const target = that.$parent.$options.methods.search.call(that.$parent, id)
            if(target){
              zip.file(key).async("base64").then((val) =>{
                that.form.thumbnails.push({
                  ...target,
                  type: key.slice(key.lastIndexOf(".") + 1),
                  thumbnail: `data:image/${key.slice(key.lastIndexOf(".") + 1)};base64,${val}`
                })
                that.afterLoadFile()
              })
            }else{
              that.form.warnThumbnails.push({
                id: id,
              })
              that.afterLoadFile()
            }
          }
        }
      })
    }
  },
  computed: {
    theme () {
      const theme = getTheme(this.$store.state.loginId)
      return 'outline-' + theme
    },
  },
  methods: {
    afterLoadFile(){
      this.fileCount--
      if(this.fileCount <= 0){
        that.uploadMessage()
      }
    },
    uploadMessage(){
      const hasUploadThumbnails = this.form && Util.hasValue(this.form.thumbnails)
      this.showInfo = hasUploadThumbnails
      this.showAlert = !hasUploadThumbnails || Util.hasValue(this.errorThumbnails)
      this.message = hasUploadThumbnails?
        `${this.$i18n.t("message.uploadData", {val: this.form.thumbnails.length})}`:
        `${this.$i18n.t("message.uploadNoData")}`
      const hasUploadWarnThumbnails = this.form && Util.hasValue(this.form.warnThumbnails)
      this.showWarn = hasUploadWarnThumbnails
      this.warnMessage = hasUploadWarnThumbnails? `${this.$i18n.t("message.uploadWarnData", {val: this.form.warnThumbnails.length})}`: ""
    },
    beforeReload(){
      this.formKey++
      this.form.zipFile = null
      this.form.thumbnails = []
      this.form.warnThumbnails = []
    },
    async loadThumbnail(e) {
      this.form.thumbnails = []
      this.form.warnThumbnails = []
      if(Util.hasValue(e.target.files)){
        fileReader.readAsArrayBuffer(e.target.files[0])
      }
      else{
        this.uploadMessage()
      }
    },
    async save() {
      if (!Util.hasValue(this.form.thumbnails)) {
        throw new Error(this.$t('message.uploadNoData'))
      }
      return await this.$parent.$options.methods.save.call(this.$parent, this.form.thumbnails)
    }
  }
}
</script>

<style scoped lang="scss">

</style>