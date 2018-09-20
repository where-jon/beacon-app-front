<template>
  <div class="container">

    <b-alert variant="info" :show="showInfo">{{ message }}</b-alert>
    <b-alert variant="danger" dismissible :show="showAlert"  @dismissed="showAlert=false">{{ message }}</b-alert>

    <b-form @submit="onSubmit" v-if="show">
      <b-form-group v-if="form.regionId !== undefined">
        <label v-t="'label.regionId'" />
        <b-form-input type="text" v-model="form.regionId" readonly="readonly" />
      </b-form-group>
      <b-form-group>
        <label v-t="'label.regionName'" />
        <b-form-input type="text" v-model="form.regionName" maxlength="20" required :readonly="!isEditable" />
      </b-form-group>
      <b-form-group>
        <label v-t="'label.meshId'" />
        <b-form-input type="number" v-model="form.meshId" maxlength="20" :readonly="!isEditable" />
      </b-form-group>
      <b-form-group>
        <label v-t="'label.description'" />
        <b-form-textarea v-model="form.description" :rows="3" :max-rows="6" :readonly="!isEditable" ></b-form-textarea>
      </b-form-group>

      <b-button v-if="isEditable" type="submit" variant="outline-primary" @click="register(false)" >{{ label }}</b-button>
      <b-button v-if="isEditable && !isUpdate" type="submit" variant="outline-primary" @click="register(true)" class="ml-2" v-t="'label.registerAgain'"/>
      <b-button type="button" variant="outline-danger" @click="backToList" class="ml-2" v-t="'label.back'"/>
    </b-form>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import _ from 'lodash'
import * as ViewHelper from '../../../sub/helper/ViewHelper'
import editmixinVue from '../../../components/editmixin.vue';

export default {
  mixins: [editmixinVue],
  data() {
    return {
      name: 'region',
      id: 'regionId',
      backPath: '/master/region',
      appServicePath: '/core/region',
      form: ViewHelper.extract(this.$store.state.app_service.region, ["regionId", "regionName", "meshId", "description"])
    }
  },
  computed: {
    ...mapState('app_service', [
      'region',
    ]),
  },
}
</script>

<style scoped lang="scss">

</style>