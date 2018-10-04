<template>
  <div>
    <breadcrumb :items="items" />
    <div class="container">

      <b-alert variant="info" :show="showInfo">{{ message }}</b-alert>
      <b-alert variant="danger" dismissible :show="showAlert"  @dismissed="showAlert=false">{{ message }}</b-alert>

      <b-form @submit="onSubmit" v-if="show">
        <b-form-group v-if="hasId">
          <label v-t="'label.thingId'" />
          <b-form-input type="text" v-model="form.thingId" readonly="readonly" />
        </b-form-group>
        <b-form-group>
          <label v-t="'label.thingCd'" />
          <b-form-input type="text" v-model="form.thingCd" pattern="^[0-9a-zA-Z\-]+$" maxlength="20" required :readonly="!isEditable" />
        </b-form-group>
        <b-form-group>
          <label v-t="'label.thingName'" />
          <b-form-input type="text" v-model="form.thingName" maxlength="20" required :readonly="!isEditable" />
        </b-form-group>
        <b-form-group>
          <label v-t="'label.displayName'" />
          <b-form-input type="text" v-model="form.displayName" maxlength="3" required :readonly="!isEditable" />
        </b-form-group>
        <b-form-group>
          <label v-t="'label.thumbnail'" />
          <b-form-file v-if="isEditable" @change="readImage" v-model="form.thumbnail" ref="inputThumbnail" accept="image/jpeg, image/png, image/gif" :placeholder="$t('message.selectFile') "></b-form-file>
          <b-button v-if="isEditable" type="button" :variant="theme" @click="clearImage" class="float-right mt-3">{{ deleteThumbnail }}</b-button>
          <img v-if="form.thumbnail" ref="thumbnail" :src="form.thumbnail" width="100" class="mt-1 ml-3" />
        </b-form-group>
        <b-form-group>
          <label v-t="'label.description'" />
          <b-form-textarea v-model="form.description" :rows="3" :max-rows="6" :readonly="!isEditable" ></b-form-textarea>
        </b-form-group>
        <b-form-group>
          <label v-t="'label.exbId'" />
          <b-form-input type="number" v-model="form.exbId" :readonly="!isEditable" />
        </b-form-group>
        <b-form-group>
          <label v-t="'label.txId'" />
          <b-form-input type="number" v-model="form.txId" :readonly="!isEditable" />
        </b-form-group>
        <b-form-group>
          <label v-t="'label.category'" />
          <b-form-select v-model="form.categoryId" :options="categories" class="mb-3 ml-3 col-3" :readonly="!isEditable" />
        </b-form-group>

        <b-button type="button" variant="outline-danger" @click="backToList" v-t="'label.back'"/>
        <b-button v-if="isEditable" type="submit" :variant="theme" @click="beforeSubmit($event, false)" class="ml-2" >{{ label }}</b-button>
        <b-button v-if="isEditable && !isUpdate" type="submit" :variant="theme" @click="beforeSubmit($event, true)" class="ml-2" v-t="'label.registerAgain'"/>
      </b-form>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import _ from 'lodash'
import * as ViewHelper from '../../../sub/helper/ViewHelper'
import * as AppServiceHelper from '../../../sub/helper/AppServiceHelper'
import editmixinVue from '../../../components/editmixin.vue';
import * as Util from '../../../sub/util/Util'
import breadcrumb from '../../../components/breadcrumb.vue'
import { getButtonTheme } from '../../../sub/helper/ThemeHelper'
import { getTheme } from '../../../sub/helper/ThemeHelper'

export default {
  components: {
    breadcrumb,
  },
  mixins: [editmixinVue],
  data() {
    return {
      name: 'thing',
      id: 'thingId',
      backPath: '/master/thing',
      appServicePath: '/basic/thing',
      form: ViewHelper.extract(this.$store.state.app_service.thing, ["thingId", "thingCd", "thingName", "displayName", "thumbnail", "description", "exbId", "txId"]),
      categoryId: Util.hasValue(this.$store.state.app_service.thing.thingCategoryList)? this.$store.state.app_service.thing.thingCategoryList[0].thingCategoryPK.categoryId: undefined,
      categories: [],
      deleteThumbnail: this.$i18n.t('label.deleteThumbnail'),
      displayNameLength: "3バイト",
      items: [
        {
          text: this.$i18n.t('label.master'),
          active: true
        },
        {
          text: this.$i18n.t('label.thing'),
          href: '/master/thing',
        },
        {
          text: this.$i18n.t('label.thing') + this.$i18n.t('label.detail'),
          active: true
        }
      ]
    }
  },
  async created(){
    let categoriesOption = await AppServiceHelper.fetchList("/basic/category/", 'categoryId')
    categoriesOption = categoriesOption.map((val) => ({value: val.categoryId, text: val.categoryName}))
    this.categories = categoriesOption
    Util.addNoSelect(this.categories)
    this.form.categoryId = this.categoryId
  },
  computed: {
    hasId(){
      return Util.hasValue(this.form.thingId)
    },
    theme () {
      const theme = getTheme(this.$store.state.loginId)
      return 'outline-' + theme
    },
    ...mapState('app_service', [
      'thing',
    ]),
  },
  methods: {
    beforeReload(){
      this.clearImage()
    },
    readImage(e) {
      this.readImageView(e, 'thumbnail')
    },
    clearImage(e) {
      this.form.thumbnail = undefined
      this.$refs.inputThumbnail.reset()
    },
    async save(ev) {
      let entity = {
        thingId: Util.hasValue(this.form.thingId)? this.form.thingId: -1,
        thingCd: this.form.thingCd,
        thingName: this.form.thingName,
        displayName: this.form.displayName,
        thumbnail: this.form.thumbnail,
        description: this.form.description,
        exbId: Util.hasValue(this.form.exbId)? String(this.form.exbId): undefined,
        txId: this.form.txId,
        thingCategoryList: Util.hasValue(this.form.categoryId)? [{
          thingCategoryPK: {
            thingId: Util.hasValue(this.form.thingId)? this.form.thingId: -1,
            categoryId: this.form.categoryId,
          }
        }]: undefined
      }
      const ret = await AppServiceHelper.bulkSave(this.appServicePath, [entity])
      return ret;
    },
    beforeSubmit(event, again){
      this.showInfo = false
      this.showAlert = false
      if(Util.getByteLength(this.form.displayName) > 3){
        this.message = this.$i18n.t('message.overLength', {target: this.$i18n.t('label.displayName'), length: this.displayNameLength})
        this.showAlert = true
        window.scrollTo(0, 0)
        event.preventDefault()
        return false
      }
      this.register(again)
    }
  },
}
</script>

<style scoped lang="scss">

</style>