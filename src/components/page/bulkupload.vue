<template>
  <div>
    <div class="container">
      <alert :message="message" :warn-message="warnMessage" :warn-thumbnails="form.warnThumbnails" />

      <b-form v-if="show" @submit.prevent="save">
        <b-form-group>
          <label v-t="'label.zipFile'" />
          <b-form-file :key="formKey" v-model="form.zipFile" :placeholder="$t('message.selectFile') " :disabled="loading" accept=".zip" @change="loadThumbnail" />
        </b-form-group>
        <b-button :variant="theme" :disabled="!submittable" type="submit" @click="doBeforeSubmit(true)">
          {{ label }}
        </b-button>
        <b-button v-t="'label.back'" type="button" variant="outline-danger" class="ml-2" @click="backToList" />
      </b-form>
    </div>
  </div>
</template>

<script>
import JsZip from 'jszip'
import { APP } from '../../sub/constant/config'
import { ERROR_STATE } from '../../sub/constant/Constants'
import * as NumberUtil from '../../sub/util/NumberUtil'
import * as Util from '../../sub/util/Util'
import * as StateHelper from '../../sub/helper/dataproc/StateHelper'
import * as MasterHelper from '../../sub/helper/domain/MasterHelper'
import commonmixin from '../mixin/commonmixin.vue'
import editmixin from '../mixin/editmixin.vue'
import alert from '../parts/alert.vue'

let fileReader

export default {
  components: {
    alert,
  },
  mixins: [commonmixin, editmixin],
  props: {
    name: {
      type: String,
      required: true,
    },
    id: {
      type: String,
      required: true,
    },
    backPath: {
      type: String,
      required: true,
    },
    appServicePath: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      form: {
        zipFile: null,
        thumbnails: [],
        warnThumbnails: [],
      },
      mutex: false,
      bulkUpload: true,
      formKey: 0,
      fileCount: 0,
      loading: false,
      submittable: false,
    }
  },
  async mounted() {
    this.loading = false
    this.submittable = false
    fileReader = new FileReader()
    fileReader.onload = () =>{
      JsZip.loadAsync(fileReader.result, {base64: true}).then(zip => {
        this.countFile(zip)
        this.uploadMessage()
        Object.keys(zip.files).forEach(key => {
          zip.file(key).internalStream('arraybuffer').accumulate(() => {}).then(val => {
            if(!this.isImageFile(key)){
              return
            }

            const id = this.getFileName(key)
            if (val.length > APP.MAX_IMAGE_SIZE) {
              this.form.warnThumbnails.push({
                id: id,
                type: ERROR_STATE.OVER_SIZE,
                target: NumberUtil.trim(NumberUtil.floorVal(APP.MAX_IMAGE_SIZE / 1024 / 1024, 1))
              })
              this.afterLoadFile()
              return
            }

            const target = this.$parent.$options.methods.search.call(this.$parent, id)
            if(target){
              zip.file(key).async('base64').then(bVal =>{
                const imgInfo = {
                  ...target,
                  type: key.slice(key.lastIndexOf('.') + 1),
                  thumbnail: `data:image/${key.slice(key.lastIndexOf('.') + 1)};base64,${bVal}`,
                  size: bVal.length,
                }
                if(this.$parent.$options.methods && this.$parent.$options.methods.addLoadImage){
                  this.$parent.$options.methods.addLoadImage.call(this.$parent, imgInfo)
                }
                this.form.thumbnails.push(imgInfo)
                this.afterLoadFile()
              })
            }else{
              this.form.warnThumbnails.push({ id: id, type: ERROR_STATE.NOT_REGIST })
              this.afterLoadFile()
            }
          })
        })
      })
    }
  },
  beforeDestroy() {
    this.form.thumbnails = []
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
    getFileName(key){
      return key.slice(key.lastIndexOf('/') + 1, key.lastIndexOf('.'))
    },
    isImageFile(key){
      return Util.hasValue(key) && /^.*\.(png)|(jpg)|(jpeg)|(gif)$/.test(key) &&
        !/^.*(__MACOSX\/).*$/.test(key) && !/^\..*/.test(this.getFileName(key))
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
        this.message = `${this.$i18n.tnl('message.loadingFile', {now: this.form.thumbnails.length, all: this.fileCount})}`
        this.replace({showWarn: false})
        this.replace({showAlert: false})
        this.replace({showInfo: false})
        return
      }
      const hasUploadThumbnails = this.form && Util.hasValue(this.form.thumbnails)
      this.message = hasUploadThumbnails?
        `${this.$i18n.tnl('message.uploadData', {val: this.form.thumbnails.length})}`:
        `${this.$i18n.tnl('message.uploadNoData')}`
      const hasUploadWarnThumbnails = this.form && Util.hasValue(this.form.warnThumbnails)
      this.warnMessage = hasUploadWarnThumbnails? `${this.$i18n.tnl('message.uploadWarnData', {val: this.form.warnThumbnails.length})}`: ''
      this.replace({showWarn: hasUploadWarnThumbnails})
      this.replace({showAlert: !hasUploadThumbnails || Util.hasValue(this.errorThumbnails)})
      this.replace({showInfo: hasUploadThumbnails})
    },
    onBeforeReload(){
      this.formKey++
      this.form.zipFile = null
      this.form.thumbnails = []
      this.form.warnThumbnails = []
      this.loading = false
      this.submittable = false
    },
    async loadThumbnail(e) {
      StateHelper.initShowMessage()
      this.form.thumbnails = []
      this.form.warnThumbnails = []
      this.submittable = false
      if(Util.hasValue(e.target.files)){
        const file = e.target.files[0]
        if (file.size > APP.MAX_IMAGE_ZIP_SIZE) {
          this.message = this.$i18n.tnl('message.uploadMax', {
            target: NumberUtil.trim(NumberUtil.floorVal(APP.MAX_IMAGE_ZIP_SIZE / 1024 / 1024, 1))
          })
          this.replace({showAlert: true})
          window.scrollTo(0, 0)
          return
        }

        this.loading = true
        this.uploadMessage()
        fileReader.readAsArrayBuffer(file)
      }
      else{
        this.loading = false
        this.uploadMessage()
      }
    },
    async onSaving() {
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