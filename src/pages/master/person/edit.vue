<template>
  <div class="container">

    <b-alert variant="info" :show="showInfo">{{ message }}</b-alert>
    <b-alert variant="danger" dismissible :show="showAlert"  @dismissed="showAlert=false">{{ message }}</b-alert>

    <breadcrumb :items="items" />
    <b-row>
      <b-col md="8">
        <b-form @submit="onSubmit" v-if="show">
          <b-form-group v-if="form.personId">
            <label v-t="'label.personId'" />
            <b-form-input type="text" v-model="form.personId" readonly="readonly" />
          </b-form-group>
          <b-form-group>
            <label v-t="'label.personCd'" />
            <b-form-input type="text" v-model="form.personCd" maxlength="20" required :readonly="!isEditable" />
          </b-form-group>
          <b-form-group>
            <label v-t="'label.txId'" />
            <b-form-input type="number" v-model="form.txId" :readonly="!isEditable" />
          </b-form-group>
          <b-form-group>
            <label v-t="'label.personName'" />
            <b-form-input type="text" v-model="form.personName" maxlength="20" required :readonly="!isEditable" />
          </b-form-group>
          <b-form-group>
            <label v-t="'label.ruby'" />
            <b-form-input type="text" v-model="form.ruby" maxlength="20" :readonly="!isEditable" />
          </b-form-group>
          <b-form-group>
            <label v-t="'label.post'" />
            <b-form-input type="text" v-model="form.post" maxlength="20" :readonly="!isEditable" />
          </b-form-group>
          <b-form-group>
            <label v-t="'label.tel'" />
            <b-form-input type="tel" v-model="form.tel" :readonly="!isEditable" pattern="[-\d]*" />
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

          <b-button type="button" variant="outline-danger" @click="backToList" v-t="'label.back'"/>
          <b-button v-if="isEditable" type="submit" :variant="getTheme" @click="register(false)" class="ml-2"  >{{ label }}</b-button>
          <b-button v-if="isEditable && !isUpdate" type="submit" :variant="getTheme" @click="register(true)" class="ml-2" v-t="'label.registerAgain'"/>
        </b-form>
      </b-col>
    </b-row>


  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import _ from 'lodash'
import * as ViewHelper from '../../../sub/helper/ViewHelper'
import editmixinVue from '../../../components/editmixin.vue';
import breadcrumb from '../../../components/breadcrumb.vue'
import { getButtonTheme } from '../../../sub/helper/ThemeHelper'

export default {
  components: {
    breadcrumb,
  },
  mixins: [editmixinVue],
  data() {
    return {
      name: 'person',
      id: 'personId',
      backPath: '/master/person',
      appServicePath: '/basic/person',
      form: ViewHelper.extract(this.$store.state.app_service.person, ["personId", "personCd", "personName", "ruby", "txId", "post", "thumbnail", "description"]),
      items: [
        {
          text: this.$i18n.t('label.master'),
          active: true
        },
        {
          text: this.$i18n.t('label.person'),
          href: '/master/person',
        },
        {
          text: this.$i18n.t('label.person') + this.$i18n.t('label.detail'),
          active: true
        }
      ]
    }
  },
  computed: {
    getTheme () {
      const theme = getButtonTheme(this.$store.state.loginId)
      return 'outline-' + theme
    },
    ...mapState('app_service', [
      'person',
    ]),
  },
  methods: {
    readImage(e) {
      this.readImageView(e, 'thumbnail')
    }
  },
}
</script>

<style scoped lang="scss">

</style>