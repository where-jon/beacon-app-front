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
          <b-form-file :key="formKey" v-model="form.zipFile" @change="loadThumbnail" accept=".zip" :placeholder="$t('message.selectFile') " :disabled="loading" ></b-form-file>
        </b-form-group>
        <b-button type="submit" :variant="theme" @click="register(true)" :disabled="!submittable" >{{ label }}</b-button>
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
      loading: false,
      submittable: false,
      form: {
        zipFile: null,
        thumbnails: [],
        warnThumbnails: [],
      },
    }
  },
  mounted() {
    that = this
    this.loading = false
    this.submittable = false
    fileReader = new FileReader()
    fileReader.onload = () =>{
      const contents = JsZip.loadAsync(fileReader.result, {base64: true}).then((zip) => {
        that.countFile(zip)
        that.uploadMessage()
        for(let key in zip.files){
          if(that.isImageFile(key)){
            const id = key.slice(key.lastIndexOf("/") + 1, key.lastIndexOf("."))
            const target = that.$parent.$options.methods.search.call(that.$parent, id)
            if(target){
              zip.file(key).async("base64").then((val) =>{
                let imgInfo = {
                  ...target,
                  type: key.slice(key.lastIndexOf(".") + 1),
                  thumbnail: `data:image/${key.slice(key.lastIndexOf(".") + 1)};base64,${val}`
                }
                if(that.$parent.$options.methods.addLoadImage){
                  that.$parent.$options.methods.addLoadImage.call(that.$parent, imgInfo)
                }
                that.form.thumbnails.push(imgInfo)
                that.afterLoadFile()
              })
            }else{
              that.form.warnThumbnails.push({ id: id })
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
    countFile(zipObject){
      this.fileCount = 0
      for(let key in zipObject.files){
        if(this.isImageFile(key)){
          this.fileCount++
        }
      }
    },
    isImageFile(key){
      return Util.hasValue(key) && key.match(/.*\.(png)|(jpg)|(jpeg)|(gif)$/)
    },
    afterLoadFile(){
      if(this.fileCount <= this.form.thumbnails.length + this.form.warnThumbnails.length){
        this.loading = false
        if(0 < this.form.thumbnails.length){
          this.submittable = true
        }
      }
      this.uploadMessage()
    },
    uploadMessage(){
      if(this.loading){
        this.message = `${this.$i18n.tnl("message.loadingFile", {now: this.form.thumbnails.length, all: this.fileCount})}`
        this.showInfo = true
        this.showWarn = false
        this.showAlert = false
        return
      }
      const hasUploadThumbnails = this.form && Util.hasValue(this.form.thumbnails)
      this.message = hasUploadThumbnails?
        `${this.$i18n.tnl("message.uploadData", {val: this.form.thumbnails.length})}`:
        `${this.$i18n.tnl("message.uploadNoData")}`
      const hasUploadWarnThumbnails = this.form && Util.hasValue(this.form.warnThumbnails)
      this.warnMessage = hasUploadWarnThumbnails? `${this.$i18n.tnl("message.uploadWarnData", {val: this.form.warnThumbnails.length})}`: ""
      this.showInfo = hasUploadThumbnails
      this.showAlert = !hasUploadThumbnails || Util.hasValue(this.errorThumbnails)
      this.showWarn = hasUploadWarnThumbnails
    },
    beforeReload(){
      this.formKey++
      this.form.zipFile = null
      this.form.thumbnails = []
      this.form.warnThumbnails = []
      this.loading = false
      this.submittable = false
    },
    async loadThumbnail(e) {
      this.form.thumbnails = []
      this.form.warnThumbnails = []
      this.submittable = false
      if(Util.hasValue(e.target.files)){
        this.loading = true
        this.uploadMessage()
        fileReader.readAsArrayBuffer(e.target.files[0])
      }
      else{
        this.loading = false
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