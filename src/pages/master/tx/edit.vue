<template>
  <div class="container">

    <b-alert variant="info" :show="showInfo">{{ message }}</b-alert>
    <b-alert variant="danger" dismissible :show="showAlert"  @dismissed="showAlert=false">{{ message }}</b-alert>

    <breadcrumb :items="items" />

    <b-form @submit="onSubmit" v-if="show">
      <b-form-group v-if="form.txId">
        <label v-t="'label.txId'" />
        <b-form-input type="text" v-model="form.txId" readonly="readonly" />
      </b-form-group>
      <b-form-group>
        <label v-t="'label.btxId'" />
        <b-form-input type="number" v-model="form.btxId" required :readonly="!isEditable" />
      </b-form-group>
      <b-form-group>
        <label v-t="'label.minor'" />
        <b-form-input type="number" v-model="form.minor" required :readonly="!isEditable" />
      </b-form-group>
      <b-form-group>
        <label v-t="'label.txName'" />
        <b-form-input type="text" v-model="form.txName" maxlength="20" :readonly="!isEditable" />
      </b-form-group>
      <b-form-group>
        <label v-t="'label.displayName'" />
        <b-form-input type="text" v-model="form.displayName" maxlength="3" :readonly="!isEditable" />
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
import breadcrumb from '../../../components/breadcrumb.vue'

export default {
  components: {
    breadcrumb,
  },
  mixins: [editmixinVue],
  data() {
    const labelTx = this.$i18n.t('label.tx')
    return {
      name: 'tx',
      id: 'txId',
      backPath: '/master/tx',
      appServicePath: '/core/tx',
      form: ViewHelper.extract(this.$store.state.app_service.tx, ["txId", "btxId", "minor", "txName", "displayName",  "mapImage"]),
      items: [
        {
          text: this.$i18n.t('label.master'),
          active: true
        },
        {
          text: labelTx,
          href: '/master/tx'
        },
        {
          text: labelTx + this.$i18n.t('label.detail'),
          active: true
        },
      ]
    }
  },
  computed: {
    ...mapState('app_service', [
      'tx',
    ]),
  },
  methods: {
  }
}
</script>

<style scoped lang="scss">

</style>