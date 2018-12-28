<template>
  <div>
    <breadcrumb :items="items" />
    <div class="container">
      <b-alert :show="showInfo" variant="info" dismissible>
        {{ message }}
      </b-alert>
      <b-alert :show="showAlert" variant="danger" dismissible @dismissed="showAlert=false">
        <template v-if="Array.isArray(message)">
          <span v-for="line in message" :key="line">
            {{ line }} <br>
          </span>
        </template>
        <span v-else>
          {{ message }}
        </span>
      </b-alert>

      <b-row>
        <b-col md="8" offset-md="2">
          <b-form v-if="show" @submit.prevent="onSubmit">
            <b-form-group v-if="form.potId">
              <label v-t="'label.potId'" />
              <b-form-input v-model="form.potId" type="text" readonly="readonly" />
            </b-form-group>
            <b-form-group>
              <label v-t="'label.tx'" />
              <b-form-select v-model="form.txId" :options="txOptions" :disabled="!isEditable" :readonly="!isEditable" class="mb-3 ml-3 col-4" @change="changeTx" />
            </b-form-group>
            <b-form-group v-show="isShown('TX_WITH_TXID')">
              <label v-t="'label.txId'" />
              <input v-model="txId" :readonly="!isEditable" type="number" min="0" max="65535" class="form-control">
            </b-form-group>
            <b-form-group v-show="!isShown('TX_WITH_TXID') && isShown('TX_BTX_MINOR') != 'minor'">
              <label v-t="'label.btxId'" />
              <input v-model="btxId" :readonly="!isEditable" type="number" min="0" max="65535" class="form-control">
            </b-form-group>
            <b-form-group v-show="!isShown('TX_WITH_TXID') && isShown('TX_BTX_MINOR') == 'minor'">
              Tx(<label v-t="'label.minor'" />)
              <input v-model="minor" :readonly="!isEditable" type="number" min="0" max="65535" class="form-control">
            </b-form-group>
            <b-form-group v-show="category.length > 1">
              <label v-t="'label.categoryType'" />
              <b-form-radio-group v-model="form.potType" :options="category" :disabled="!isEditable" />
            </b-form-group>
            <b-form-group v-if="isShown('POT_WITH_POTCD')">
              <label v-t="'label.potCd'" />
              <input v-model="form.potCd" :readonly="!isEditable" type="text" maxlength="20" class="form-control" required>
            </b-form-group>
            <b-form-group>
              <label v-t="'label.potName'" />
              <input v-model="form.potName" :readonly="!isEditable" type="text" maxlength="20" class="form-control" required>
            </b-form-group>
            <b-form-group v-show="isShown('POT_WITH_RUBY')">
              <label v-t="'label.ruby'" />
              <input v-model="form.ruby" :readonly="!isEditable" type="text" maxlength="20" class="form-control">
            </b-form-group>
            <b-form-group>
              <label v-t="'label.displayName'" />
              <input v-model="form.displayName" :readonly="!isEditable" type="text" maxlength="3" class="form-control">
            </b-form-group>
            <b-form-group v-show="isShown('POT_WITH_GROUP')">
              <label v-t="'label.group'" />
              <b-form-select v-model="form.groupId" :options="groupOptions" :disabled="!isEditable" :readonly="!isEditable" class="mb-3 ml-3 col-4" />
            </b-form-group>
            <b-form-group v-show="isShown('POT_WITH_CATEGORY')">
              <label v-t="'label.category'" />
              <b-form-select v-model="form.categoryId" :options="categoryOptions" :disabled="!isEditable" :readonly="!isEditable" class="mb-3 ml-3 col-4" />
            </b-form-group>
            <b-form-group v-show="isShown('POT_WITH_POST')">
              <label v-t="'label.post'" />
              <input v-model="form.post" :readonly="!isEditable" type="text" maxlength="20" class="form-control">
            </b-form-group>
            <b-form-group v-show="isShown('POT_WITH_TEL')">
              <label v-t="'label.tel'" />
              <b-form-input v-model="form.tel" :readonly="!isEditable" type="tel" maxlength="20" pattern="[-\d]*" />
            </b-form-group>
            <b-form-group>
              <label v-t="'label.thumbnail'" />
              <b-form-file v-if="isEditable" ref="inputThumbnail" v-model="form.thumbnail" :placeholder="$t('message.selectFile') " accept="image/jpeg, image/png, image/gif" @change="readImage" />
              <b-button v-if="isEditable && form.thumbnail" :variant="theme" type="button" class="float-right mt-3" @click="clearImage">
                {{ $i18n.tnl('label.clear') }}
              </b-button>
              <img v-if="form.thumbnail" ref="thumbnail" :src="form.thumbnail" width="100" class="mt-1 ml-3">
            </b-form-group>
            <b-form-group>
              <label v-t="'label.description'" />
              <b-form-textarea v-model="form.description" :rows="3" :max-rows="6" :readonly="!isEditable" maxlength="1000" />
            </b-form-group>

            <b-button v-t="'label.back'" type="button" variant="outline-danger" class="mr-2 my-1" @click="backToList" />
            <b-button v-if="isEditable" :variant="theme" type="submit" class="mr-2 my-1" @click="beforeSubmit(false)">
              {{ label }}
            </b-button>
            <b-button v-if="isEditable && !isUpdate" v-t="'label.registerAgain'" :variant="theme" type="submit" class="my-1" @click="beforeSubmit(true)" />
          </b-form>
        </b-col>
      </b-row>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import _ from 'lodash'
import * as ViewHelper from '../../../sub/helper/ViewHelper'
import * as StateHelper from '../../../sub/helper/StateHelper'
import editmixinVue from '../../../components/mixin/editmixin.vue'
import * as Util from '../../../sub/util/Util'
import breadcrumb from '../../../components/layout/breadcrumb.vue'
import { getButtonTheme } from '../../../sub/helper/ThemeHelper'
import * as AppServiceHelper from '../../../sub/helper/AppServiceHelper'
import { CATEGORY } from '../../../sub/constant/Constants'
import { APP } from '../../../sub/constant/config.js'

export default {
  components: {
    breadcrumb,
  },
  mixins: [editmixinVue],
  data() {
    return {
      name: 'pot',
      id: 'potId',
      backPath: '/master/pot',
      appServicePath: '/basic/pot',
      category: _.slice(CATEGORY.getTypes(), 0, 2).filter((val) => APP.CATEGORY_TYPES.includes(val.value)),
      txId: null,
      btxId: null,
      minor: null,
      form: {
        ...ViewHelper.extract(this.$store.state.app_service.pot,
          ['potId', 'potCd', 'potName', 'potType', 'extValue.ruby',
            'displayName', 'potGroupList.0.group.groupId', 'potCategoryList.0.category.categoryId', 'extValue.tel', 'txId',
            'extValue.post', 'thumbnail', 'description'])
      },
      defValue: {
        'potType': APP.CATEGORY_TYPES[0] != 3? APP.CATEGORY_TYPES[0]: null,
      },
      items: [
        {
          text: this.$i18n.tnl('label.master'),
          active: true
        },
        {
          text: this.$i18n.tnl('label.pot'),
          href: '/master/pot',
        },
        {
          text: this.$i18n.tnl(Util.getDetailCaptionKey(this.$store.state.app_service.pot.potId)),
          active: true
        }
      ]
    }
  },
  computed: {
    theme () {
      const theme = getButtonTheme()
      return 'outline-' + theme
    },
    categoryOptions() {
      return StateHelper.getOptionsFromState('category', false, false,
        category => category.categoryType === this.form.potType
      )
    },
    groupOptions() {
      return StateHelper.getOptionsFromState('group')
    },
    txOptions() {
      const useTxIds = this.pots.map((val) => val.txId)
      return StateHelper.getOptionsFromState('tx',
        tx => StateHelper.getTxIdName(tx),
        false,
        tx => !useTxIds.includes(tx.txId) || tx.txId == this.pot.txId
      )
    },
    ...mapState('app_service', [
      'pot',
      'pots',
      'groups',
      'categories',
      'txs',
    ]),
  },
  watch: {
    txId: function(newVal, oldVal) {
      if(newVal == oldVal){
        return
      }
      this.form.txId = newVal
    },
    btxId: function(newVal, oldVal) {
      if(newVal == oldVal){
        return
      }
      const tx = this.txs.find((tx) => this.btxId && this.btxId == tx.btxId)
      this.form.txId = tx? tx.txId: null
    },
    minor: function(newVal, oldVal) {
      if(newVal == oldVal){
        return
      }
      const tx = this.txs.find((tx) => this.minor && this.minor == tx.minor)
      this.form.txId = tx? tx.txId: null
    },
  },
  async mounted() {
    ViewHelper.applyDef(this.form, this.defValue)
    StateHelper.load('group')
    StateHelper.load('category')
    await StateHelper.load('tx')
    this.changeTx(this.form.txId)
  },
  methods: {
    changeTx(newVal){
      const tx = this.txs.find((tx) => newVal == tx.txId)
      this.txId = tx? tx.txId: null
      this.btxId = tx? tx.btxId: null
      this.minor = tx? tx.minor: null
    },
    beforeSubmit(again){
      this.register(again)
    },
    afterCrud(){
      StateHelper.setForceFetch('tx', true)
    },
    async save() {
      const entity = {
        potId: this.form.potId || -1,
        potCd: this.form.potCd,
        potName: this.form.potName,
        potType: this.form.potType,
        extValue: {
          ruby: this.form.ruby,
          tel: this.form.tel,
          post: this.form.post,
        },
        displayName: this.form.displayName,
        potGroupList: this.form.groupId ? [{
          potGroupPK: {groupId: this.form.groupId}
        }] : [],
        potCategoryList: this.form.categoryId ? [{
          potCategoryPK: {categoryId: this.form.categoryId}
        }] : [],
        txId: this.form.txId,
        thumbnail: this.form.thumbnail,
        description: this.form.description,
      }
      return await AppServiceHelper.bulkSave(this.appServicePath, [entity])
    },
    readImage(e) {
      this.readImageView(e, 'thumbnail', null, null, 'thumbnail', APP.POT_THUMBNAIL_MAX)
    },
    clearImage(e) {
      this.form.thumbnail = undefined
      this.$refs.inputThumbnail.reset()
    },
  },
}
</script>

<style scoped lang="scss">

</style>