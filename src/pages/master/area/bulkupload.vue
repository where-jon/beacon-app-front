<template>
  <div class="container-fluid">
    <breadcrumb :items="items" />
    <bulkupload :id="id" :name="name" :back-path="backPath" :app-service-path="appServicePath" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { APP } from '../../../sub/constant/config'
import * as BrowserUtil from '../../../sub/util/BrowserUtil'
import * as Util from '../../../sub/util/Util'
import * as AppServiceHelper from '../../../sub/helper/dataproc/AppServiceHelper'
import * as ImageHelper from '../../../sub/helper/base/ImageHelper'
import * as StateHelper from '../../../sub/helper/dataproc/StateHelper'
import * as MasterHelper from '../../../sub/helper/domain/MasterHelper'
import * as ViewHelper from '../../../sub/helper/ui/ViewHelper'
import breadcrumb from '../../../components/layout/breadcrumb.vue'
import bulkupload from '../../../components/page/bulkupload.vue'

export default {
  components: {
    breadcrumb,
    bulkupload,
  },
  data() {
    return {
      name: 'area',
      id: 'areaId',
      backPath: '/master/area',
      appServicePath: '/core/area',
      items: ViewHelper.createBreadCrumbItems('master', {text: 'area', href: '/master/area'}, 'bulkUpload'),
    }
  },
  computed: {
    ...mapState('app_service', [
      'area', 'areas'
    ]),
  },
  methods: {
    async onSaved(){
    },
    search(key) {
      const target = this.areas.find(val => val.areaCd == key)
      return target? {id: target.areaId, name: target.areaName, ...target}: null
    },
    addLoadImage(imgInfo) {
      const blob = ImageHelper.base64ToBlob(imgInfo.thumbnail)
      BrowserUtil.readImage({target: {files: [blob]}}, (evt, width, height, thumbnail) => {
        imgInfo.mapImage = imgInfo.thumbnail
        imgInfo.mapWidth = width
        imgInfo.mapHeight = height
        imgInfo.thumbnail = thumbnail
      }, APP.AREA_THUMBNAIL_MAX)
    },
    packThumbnail(areas, per = APP.SPLIT_UPLOAD_SIZE) {
      if(!Util.hasValue(areas)){
        return []
      }
      const ret = [[]]
      let size = 0
      areas.forEach(area => {
        const thumbnailSize = area.size
        if(per < size + thumbnailSize){
          size = 0
          ret.push([])
        }
        ret[ret.length - 1].push(area)
        size += thumbnailSize
      })
      return ret
    },
    async getSavePromise(areas){
      await AppServiceHelper.bulkSave(this.appServicePath, areas)
      areas.forEach(area => area.thumbnail = area.mapImage = null)
    },
    async saveForIe(thumbnails) {
      const packAreas = this.packThumbnail(thumbnails, APP.SPLIT_UPLOAD_SIZE_IE)
      const length = packAreas.length
      for(let idx = 0; idx < length; idx++){
        await this.getSavePromise(packAreas[idx])
      }
    },
    async save(thumbnails) {
      if(BrowserUtil.isIe()){
        await this.saveForIe(thumbnails)
      }
      else{
        await Promise.all(this.packThumbnail(thumbnails).map(this.getSavePromise))
      }
      thumbnails.forEach(thumbnail => {
        StateHelper.loadAreaImage(thumbnail.id, true)
      })
    },
  }
}
</script>

<style scoped lang="scss">

</style>