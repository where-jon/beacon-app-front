<template>
  <div class="container-fluid">
    <breadcrumb :items="breadCrumbs" />
    <bulkedit :id="id" ref="bulkEdit" :name="name" :bulk-disp-name="dispName" :back-path="backPath" :app-service-path="pAppServicePath" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { APP } from '../../../sub/constant/config'
import { CATEGORY, BULK, ZONE } from '../../../sub/constant/Constants'
import * as StringUtil from '../../../sub/util/StringUtil'
import * as Util from '../../../sub/util/Util'
import * as ExtValueHelper from '../../../sub/helper/domain/ExtValueHelper'
import * as StateHelper from '../../../sub/helper/dataproc/StateHelper'
import * as MasterHelper from '../../../sub/helper/domain/MasterHelper'
import * as ViewHelper from '../../../sub/helper/ui/ViewHelper'
import breadcrumb from '../../../components/layout/breadcrumb.vue'
import bulkedit from '../../../components/page/bulkedit.vue'

export default {
  props: {
    pName: {
      type: String,
      default: '',
    },
    pPath: {
      type: String,
      default: '/master/category',
    },
    pAppServicePath: {
      type: String,
      default: '/basic/category',
    },
    pTypeList: {
      type: Array,
      default: () => [CATEGORY.PERSON, CATEGORY.THING, CATEGORY.ZONE],
    },
  },
  components: {
    breadcrumb,
    bulkedit,
  },
  data() {
    return {
      name: 'category',
      id: 'categoryId',
    }
  },
  computed: {
    ...mapState('app_service', [
      'category',
    ]),
    backPath() {
      return this.pPath
    },
    breadCrumbs() {
      return ViewHelper.createBreadCrumbItems('master', {text: StringUtil.concatCamel('category', this.pName), href: this.backPath}, 'bulkRegister')
    },
    categoryTypes(){
      return CATEGORY.getTypes(true).filter(c => this.pTypeList.includes(c.value))
    },
    dispName() {
      return StringUtil.concatCamel('category', this.pName)
    }
  },
  async created() {
  },
  methods: {
    async onSaving() {
      await this.$refs.bulkEdit.bulkSaveByCsvFile()
    },
  }
}
</script>

<style scoped lang="scss">

</style>