<template>
  <div class="container-fluid">
    <breadcrumb :items="breadCrumbs" />
    <bulkupload :id="id" :name="name" :back-path="backPath" :app-service-path="pAppServicePath" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { APP } from '../../../sub/constant/config'
import { POT_TYPE, CATEGORY, BULK } from '../../../sub/constant/Constants'
import * as BrowserUtil from '../../../sub/util/BrowserUtil'
import * as StringUtil from '../../../sub/util/StringUtil'
import * as AppServiceHelper from '../../../sub/helper/dataproc/AppServiceHelper'
import * as ImageHelper from '../../../sub/helper/base/ImageHelper'
import * as ViewHelper from '../../../sub/helper/ui/ViewHelper'
import * as PotHelper from '../../../sub/helper/domain/PotHelper'
import breadcrumb from '../../../components/layout/breadcrumb.vue'
import bulkupload from '../../../components/page/bulkupload.vue'
import commonmixin from '../../../components/mixin/commonmixin.vue'

export default {
  components: {
    breadcrumb,
    bulkupload,
  },
  mixins: [commonmixin],
  props: {
    pName: {
      type: String,
      default: '',
    },
    pPath: {
      type: String,
      default: '/master/pot',
    },
    pAppServicePath: {
      type: String,
      default: '/basic/pot',
    },
    pTypeList: {
      type: Array,
      default: () => [CATEGORY.PERSON, CATEGORY.THING],
    },
  },
  data() {
    return {
      name: 'pot',
      id: 'potId',
      potTypeOptions: POT_TYPE.getTypes().filter(val => APP.POT.TYPES.includes(val.value) && this.pTypeList.includes(val.value)),
    }
  },
  computed: {
    ...mapState('app_service', [
      'pot'
      // , 'pots'
    ]),
    backPath() {
      return this.pPath
    },
    breadCrumbs() {
      return ViewHelper.createBreadCrumbItems('master', {text: StringUtil.concatCamel('pot', this.pName), href: this.backPath}, 'bulkUpload')
    },
  },
  async mounted() {
  },
  async created() {
  },
  methods: {
    async onSaved(){
    },
    search(key) {
      const target = this.pots.find(val => val.potCd == key && this.pTypeList.includes(val.potType))
      let obj = null
      if (target) {
        obj = {
          potId: target.potId,
          potType: target.potType,
          potCd: target.potCd,
          potName: target.potName,
          thumbnail: target.thumbnail,
        }
      }
      return obj
    },
    addLoadImage(imgInfo) {
      const blob = ImageHelper.base64ToBlob(imgInfo.thumbnail)
      BrowserUtil.readImage({target: {files: [blob]}}, (evt, width, height, thumbnail) => {
        imgInfo.thumbnail = thumbnail
      }, APP.POT_THUMBNAIL_MAX)
    },
    async save(thumbnails) {
      const entities = thumbnails.map(e => {
        delete e.size
        delete e.type
        return PotHelper.createEntity(e, [], this.potTypeOptions)
      })
      return await AppServiceHelper.save2(this.pAppServicePath, entities)
    },
  }
}
</script>

<style scoped lang="scss">

</style>