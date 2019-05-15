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
import * as ViewHelper from '../../../sub/helper/ViewHelper'
import * as HtmlUtil from '../../../sub/util/HtmlUtil'
import { APP } from '../../../sub/constant/config'

export default {
  components: {
    breadcrumb,
    bulkupload,
  },
  data() {
    return {
      name: 'pot',
      id: 'potId',
      backPath: '/master/pot',
      appServicePath: '/basic/pot',
      items: ViewHelper.createBreadCrumbItems('master', {text: 'pot', href: '/master/pot'}, 'bulkUpload'),
    }
  },
  computed: {
    ...mapState('app_service', [
      'pot', 'pots'
    ]),
  },
  methods: {
    search(key) {
      const target = this.pots.find(val => val.potCd == key)
      return target? {
        id: target.potId,
        name: target.potName,
        potId: target.potId,
        potCd: target.potCd,
        potName: target.potName,
        potType: target.potType,
        extValue: target.extValue,
        displayName: target.displayName,
        potGroupList: target.groupId? [{ potGroupPK: {groupId: target.groupId} }]: [],
        potCategoryList: target.categoryId? [{ potCategoryPK: {categoryId: target.categoryId} }]: [],
        potTxList: target.txList? target.txList.map(e => ({ potTxPK: {txId: e.txId} })): [],
        thumbnail: target.thumbnail,
        description: target.description,
      }: null
    },
    addLoadImage(imgInfo) {
      const blob = Util.base64ToBlob(imgInfo.thumbnail)
      HtmlUtil.readImage({target: {files: [blob]}}, (evt, width, height, thumbnail) => {
        imgInfo.thumbnail = thumbnail
      }, APP.POT_THUMBNAIL_MAX)
    },
    async save(thumbnails) {
      return await AppServiceHelper.bulkSave(this.appServicePath, thumbnails)
    },
  }
}
</script>

<style scoped lang="scss">

</style>