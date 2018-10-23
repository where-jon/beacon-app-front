<template>
  <div>
    <breadcrumb :items="items" />
    <bulkupload :name="name" :id="id" :backPath="backPath" :app-service-path="appServicePath" />
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import _ from 'lodash'
import * as Util from '../../../sub/util/Util'
import breadcrumb from '../../../components/breadcrumb.vue'
import bulkupload from '../../../components/bulkupload.vue'
import * as AppServiceHelper from '../../../sub/helper/AppServiceHelper'
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
      items: [
        {
          text: this.$i18n.t('label.master'),
          active: true
        },
        {
          text: this.$i18n.t('label.area'),
          href: '/master/area',
        },
        {
          text: this.$i18n.t('label.area') + this.$i18n.t('label.bulkUpload'),
          active: true
        }
      ]
    }
  },
  computed: {
    ...mapState('app_service', [
      'area', 'areas'
    ]),
  },
  methods: {
    search(key) {
      const target = this.areas.find((val) => val.areaId == key)
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
      return await AppServiceHelper.bulkSave(this.appServicePath, thumbnails)
    },
  }
}
</script>

<style scoped lang="scss">

</style>