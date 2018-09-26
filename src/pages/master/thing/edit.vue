<template>
  <div class="container">

    <b-alert variant="info" :show="showInfo">{{ message }}</b-alert>
    <b-alert variant="danger" dismissible :show="showAlert"  @dismissed="showAlert=false">{{ message }}</b-alert>

    <b-form @submit="onSubmit" v-if="show">
      <b-form-group v-if="form.thingId !== undefined">
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
        <b-form-file v-if="isEditable" @change="readImage" v-model="form.thumbnail" accept="image/jpeg, image/png, image/gif" :placeholder="$t('message.selectFile') "></b-form-file>
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

      <b-button v-if="isEditable" type="submit" variant="outline-primary" @click="beforeSubmit($event, false)" >{{ label }}</b-button>
      <b-button v-if="isEditable && !isUpdate" type="submit" variant="outline-primary" @click="beforeSubmit($event, true)" class="ml-2" v-t="'label.registerAgain'"/>
      <b-button type="button" variant="outline-danger" @click="backToList" class="ml-2" v-t="'label.back'"/>
    </b-form>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import _ from 'lodash'
import * as ViewHelper from '../../../sub/helper/ViewHelper'
import * as AppServiceHelper from '../../../sub/helper/AppServiceHelper'
import editmixinVue from '../../../components/editmixin.vue';
import * as Util from '../../../sub/util/Util'

export default {
  mixins: [editmixinVue],
  data() {
    console.log(this.$store.state.app_service.thing)
    return {
      name: 'thing',
      id: 'thingId',
      backPath: '/master/thing',
      appServicePath: '/basic/thing',
      form: ViewHelper.extract(this.$store.state.app_service.thing, ["thingId", "thingCd", "thingName", "displayName", "thumbnail", "description", "exbId", "txId", "thingCategoryList.0"]),
      categories: [],
    }
  },
  async created(){
      let categoriesOption = await AppServiceHelper.fetchList("/basic/category/", 'categoryId')
      categoriesOption = categoriesOption.map((val) => ({value: val.categoryId, text: val.categoryName}))
      this.categories = categoriesOption
      Util.addNoSelect(this.categories)
      this.form.categoryId = this.form._0.category.categoryId
  },
  computed: {
    ...mapState('app_service', [
      'thing',
    ]),
  },
  methods: {
    readImage(e) {
      this.readImageView(e, 'thumbnail')
    },
    async save(ev) {
      let entity = {
        thingId: this.form.thingId? this.form.thingId: -1,
        thingCd: this.form.thingCd,
        thingName: this.form.thingName,
        displayName: this.form.displayName,
        thumbnail: this.form.thumbnail,
        description: this.form.description,
        exbId: this.form.exbId,
        txId: this.form.txId,
        thingCategoryList: this.form.categoryId !== undefined? [{
          thingCategoryPK: {
            thingId: this.form.thingId,
            categoryId: this.form.categoryId,
          }
        }]: undefined
      }
      return await AppServiceHelper.bulkSave(this.appServicePath, [entity])
    },
    beforeSubmit(event, again){
      this.showAlert = false
      if(Util.getByteLength(this.form.displayName) > 3){
        this.message = this.$i18n.t('message.overLength', {target: this.$i18n.t('label.displayName')})
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