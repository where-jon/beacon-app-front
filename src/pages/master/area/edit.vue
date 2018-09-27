<template>
  <div class="container">
    <b-alert variant="info" :show="showInfo">{{ message }}</b-alert>
    <b-alert variant="danger" dismissible :show="showAlert"  @dismissed="showAlert=false">{{ message }}</b-alert>

    <breadcrumb :items="items" />

    <b-row>
      <b-col md="8">
        <b-form @submit="onSubmit" v-if="show">
          <b-form-group v-if="form.areaId">
            <label v-t="'label.areaId'" />
            <b-form-input type="text" v-model="form.areaId" readonly="readonly" />
          </b-form-group>
          <b-form-group>
            <label v-t="'label.areaName'" />
            <b-form-input type="text" v-model="form.areaName" required :readonly="!isEditable" />
          </b-form-group>
          <b-form-group>
            <label v-t="'label.map'" />
            <b-form-file v-if="isEditable" @change="readImage" v-model="form.mapImage" accept="image/jpeg, image/png, image/gif" :placeholder="$t('message.selectFile') "></b-form-file>
            <img v-if="form.mapImage" ref="mapImage" :src="form.mapImage" width="100" class="mt-1 ml-3" />
          </b-form-group>
          <b-button type="button" variant="outline-danger" @click="backToList" v-t="'label.back'" />
          <b-button v-if="isEditable" type="submit" :variant="getTheme" @click="register(false)" class="ml-2">{{ label }}</b-button>
          <b-button v-if="isEditable && !isUpdate" type="submit" variant="outline-primary" @click="register(true)" class="ml-2" v-t="'label.registerAgain'"/>
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
import { APP } from '../../../sub/constant/config'
import { getTheme } from '../../../sub/helper/ThemeHelper'

export default {
  components: {
    breadcrumb,
  },
  mixins: [editmixinVue],
  data() {
    return {
      name: 'area',
      id: 'areaId',
      backPath: '/master/area',
      appServicePath: '/core/area',
      form: ViewHelper.extract(this.$store.state.app_service.area, ["areaId", "areaName", "mapImage"]),
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
          text: this.$i18n.t('label.area') + this.$i18n.t('label.detail'),
          active: true
        }
      ]
    }
  },
  computed: {
    getTheme () {
      const theme = getTheme(this.$store.state.loginId)
      return 'outline-' + theme
    },
    ...mapState('app_service', [
      'area',
    ]),
  },
  methods: {
    readImage(e) {
      this.readImageView(e, 'mapImage', 'mapWidth', 'mapHeight', 'thumbnail', APP.AREA_THUMBNAIL_MAX)
    }
  }
}
</script>

<style scoped lang="scss">

</style>