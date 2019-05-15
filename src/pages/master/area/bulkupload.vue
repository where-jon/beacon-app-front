<template>
  <div class="container-fluid">
    <breadcrumb :items="items" />
    <bulkupload :id="id" :name="name" :back-path="backPath" :app-service-path="appServicePath" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import * as Util from '../../../sub/util/Util'
import breadcrumb from '../../../components/layout/breadcrumb.vue'
import bulkupload from '../../../components/page/bulkupload.vue'
import * as AppServiceHelper from '../../../sub/helper/AppServiceHelper'
import * as StateHelper from '../../../sub/helper/StateHelper'
import * as ViewHelper from '../../../sub/helper/ViewHelper'
import * as HtmlUtil from '../../../sub/util/HtmlUtil'
import { APP } from '../../../sub/constant/config.js'

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
    search(key) {
      const target = this.areas.find(val => val.areaCd == key)
      return target? {id: target.areaId, name: target.areaName, ...target}: null
    },
    addLoadImage(imgInfo) {
      const blob = Util.base64ToBlob(imgInfo.thumbnail)
      HtmlUtil.readImage({target: {files: [blob]}}, (evt, width, height, thumbnail) => {
        imgInfo.mapImage = imgInfo.thumbnail
        imgInfo.mapWidth = width
        imgInfo.mapHeight = height
        imgInfo.thumbnail = thumbnail
      }, APP.AREA_THUMBNAIL_MAX)
    },
    async save(thumbnails) {
      await Util.sleep(100)
      await AppServiceHelper.bulkSave(this.appServicePath, thumbnails)
      thumbnails.forEach(thumbnail => {
        StateHelper.loadAreaImage(thumbnail.id, true)
      })
    },
  }
}
</script>

<style scoped lang="scss">

</style>