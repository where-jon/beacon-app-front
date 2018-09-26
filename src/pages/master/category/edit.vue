<template>
  <div class="container">

    <b-alert variant="info" :show="showInfo">{{ message }}</b-alert>
    <b-alert variant="danger" dismissible :show="showAlert"  @dismissed="showAlert=false">{{ message }}</b-alert>

    <b-form @submit="onSubmit" v-if="show">
      <b-form-group v-if="form.categoryId">
        <label v-t="'label.categoryId'" />
        <b-form-input type="text" v-model="form.categoryId" readonly="readonly" />
      </b-form-group>
      <b-form-group>
        <label v-t="'label.categoryName'" />
        <b-form-input type="text" v-model="form.categoryName" maxlength="20" required :readonly="!isEditable" />
      </b-form-group>
      <b-form-group>
        <label v-t="'label.categoryType'" />
        <b-form-select v-model="form.categoryType" :options="categoryTypes"  required :readonly="!isEditable" />
      </b-form-group>
      <b-form-group>
        <label v-t="'label.color'" />
        <b-form-input type="color" v-model="form.color" required :readonly="!isEditable" />
      </b-form-group>
      <b-form-group>
        <label v-t="'label.bgColor'" />
        <b-form-input type="color" v-model="form.bgColor" required :readonly="!isEditable" />
      </b-form-group>
      <b-form-group>
        <label v-t="'label.description'" />
        <b-form-textarea v-model="form.description" :rows="3" :max-rows="6" :readonly="!isEditable" ></b-form-textarea>
      </b-form-group>

      <b-button v-if="isEditable" type="submit" variant="outline-primary" @click="beforeSubmit(false)" >{{ label }}</b-button>
      <b-button v-if="isEditable && !isUpdate" type="submit" variant="outline-primary" @click="beforeSubmit(true)" class="ml-2" v-t="'label.registerAgain'"/>
      <b-button type="button" variant="outline-danger" @click="backToList" class="ml-2" v-t="'label.back'"/>
    </b-form>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import _ from 'lodash'
import * as ViewHelper from '../../../sub/helper/ViewHelper'
import editmixinVue from '../../../components/editmixin.vue';
import * as Util from '../../../sub/util/Util'
import { CATEGORY } from '../../../sub/constant/Constants'

export default {
  mixins: [editmixinVue],
  data() {
    return {
      name: 'category',
      id: 'categoryId',
      backPath: '/master/category',
      appServicePath: '/basic/category',
      form: ViewHelper.extract(this.$store.state.app_service.category, ["categoryId", "categoryName", "categoryType", "color", "bgColor", "description"])
    }
  },
  created() {
    this.form.color = Util.colorCd4display(this.form.color)
    this.form.bgColor = Util.colorCd4display(this.form.bgColor)
  },
  computed: {
    ...mapState('app_service', [
      'category',
    ]),
    categoryTypes(){
      return CATEGORY.TYPES
    }
  },
  methods: {
    beforeSubmit(again){
      if(this.form.groupId !== undefined){
        this.form.groupId = String(this.form.groupId)
      }
      this.form.categoryType = String(this.form.categoryType)
      this.form.color = Util.colorCd4db(this.form.color)
      this.form.bgColor = Util.colorCd4db(this.form.bgColor)
      this.register(again)
    }
  },
}
</script>

<style scoped lang="scss">

</style>