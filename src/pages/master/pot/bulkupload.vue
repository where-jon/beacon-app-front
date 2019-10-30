<template>
  <div class="container-fluid">
    <breadcrumb :items="items" />
    <bulkupload :id="id" :name="name" :back-path="backPath" :app-service-path="appServicePath" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { APP } from '../../../sub/constant/config'
import { LOCAL_STORAGE } from '../../../sub/constant/Constants'
import * as BrowserUtil from '../../../sub/util/BrowserUtil'
import * as AppServiceHelper from '../../../sub/helper/dataproc/AppServiceHelper'
import * as ImageHelper from '../../../sub/helper/base/ImageHelper'
import * as LocalStorageHelper from '../../../sub/helper/base/LocalStorageHelper'
import * as StateHelper from '../../../sub/helper/dataproc/StateHelper'
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
      name: 'pot',
      id: 'potId',
      appServicePath: '/basic/pot',
    }
  },
  computed: {
    ...mapState('app_service', [
      'pot', 'pots'
    ]),
    indexProp() {
      return LocalStorageHelper.getLocalStorage(LOCAL_STORAGE.KEY.MASTER_INDEX)
    },
    backPath() {
      return this.indexProp.path
    },
    items() {
      return ViewHelper.createBreadCrumbItems('master', {text: 'pot', href: this.backPath}, 'bulkUpload')
    },
  },
  methods: {
    onSaved(){
      StateHelper.setForceFetch('tx', true)
      StateHelper.setForceFetch('user', true)
    },
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
      const blob = ImageHelper.base64ToBlob(imgInfo.thumbnail)
      BrowserUtil.readImage({target: {files: [blob]}}, (evt, width, height, thumbnail) => {
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