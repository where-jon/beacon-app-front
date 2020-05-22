<template>
  <div class="container-fluid">
    <breadcrumb :items="breadCrumbs" />
    <div class="container">
      <alert :message="message" />

      <b-row>
        <b-col md="8" offset-md="2">
          <b-form v-if="show" @submit.prevent="doSubmit">
            <chrome-input />
            <span v-for="(potTx, index) in form.potTxList" :key="index">
              <b-form inline @submit.prevent>
                <!--
                <b-form-group>
                  <b-form-row class="mb-3 mr-5">
                    <label>
                      {{ $i18n.tnl('label.tx') + getTxIndex(index) }}
                    </label>
                    <v-select v-model="vueSelected.txs[index]" :options="getTxOptions(index)" :disabled="!isEditable" :readonly="!isEditable" class="ml-3 vue-options">
                      <template slot="no-options">
                        {{ vueSelectNoMatchingOptions }}
                      </template>
                    </v-select>
                  </b-form-row>
                </b-form-group>
                -->
              </b-form>
            </span>
            <!--
            <b-form-group v-show="potTypeOptions.length > 1 && !useAd">
              <label v-t="'label.categoryType'" />
              <b-form-radio-group v-model="form.potType" :options="potTypeOptions" :disabled="!isEditable" :required="potTypeOptions.length > 1" />
            </b-form-group>
            <b-form-group>
              <label v-t="'label.potCd'" />
              <input v-model="form.potCd" :readonly="!isEditable || useAd" type="text" maxlength="20" class="form-control">
            </b-form-group>
            -->
            <b-form-group>
              <label v-t="'label.potName'" />
              <input v-model="form.potName" :readonly="!isEditable || useAd" type="text" maxlength="100" class="form-control" required>
            </b-form-group>
            <b-form-group v-show="isShownWith('ruby')">
              <label v-t="'label.ruby'" />
              <input v-model="form.ruby" :readonly="!isEditable" type="text" maxlength="20" class="form-control">
            </b-form-group>
            <b-form-group>
              <label v-t="'label.displayName'" />
              <input v-model="form.displayName" :readonly="!isEditable" type="text" maxlength="3" class="form-control">
            </b-form-group>
            <b-form-group v-show="isShownWith('auth')">
              <label v-t="'label.auth'" />
              <v-select v-model="vueSelected.authCategories" :options="getAuthCategoryOptions()" :disabled="!isEditable" multiple :close-on-select="false" class="vue-options-multi">
                <template slot="no-options">
                  {{ vueSelectNoMatchingOptions }}
                </template>
              </v-select>
            </b-form-group>
            <!--
            <b-form-group v-show="isShownWith('category')">
              <label v-t="'label.category'" />
              <v-select v-model="vueSelected.category" :options="categoryOptions" :disabled="!isEditable" :readonly="!isEditable" class="mb-3 vue-options-lg">
                <template slot="no-options">
                  {{ vueSelectNoMatchingOptions }}
                </template>
              </v-select>
            </b-form-group>
            -->
            <b-form-group v-show="isShownWith('group')">
              <label v-t="'label.group'" />
              <v-select v-model="vueSelected.group" :options="groupOptions" :disabled="!isEditable" :readonly="!isEditable" class="mb-3 vue-options-lg">
                <template slot="no-options">
                  {{ vueSelectNoMatchingOptions }}
                </template>
              </v-select>
            </b-form-group>
            <extform :is-editable="isEditable" :form="form" :p-ext-value="extValue" :p-exclude-keys="excludeExtKeys"/>
            <b-form-group v-if="isShownWith('thumbnail')">
              <label v-t="'label.thumbnail'" />
              <b-form-file v-if="isEditable" ref="inputThumbnail" v-model="form.thumbnailTemp" :placeholder="$t('message.selectFile') " accept="image/jpeg, image/png, image/gif" @change="readImage" />
              <b-button v-if="isEditable && form.existThumbnail" :variant="theme" type="button" class="float-right mt-3" @click="clearImage">
                {{ $i18n.tnl('label.clear') }}
              </b-button>
              <img v-show="form.existThumbnail" ref="thumbnail" :src="thumbnailSrc" width="100" class="mt-1 ml-3">
            </b-form-group>
            <b-form-group v-if="isShownWith('description')">
              <label v-t="'label.description'" />
              <b-form-textarea v-model="form.description" :rows="3" :max-rows="6" :readonly="!isEditable" maxlength="1000" />
            </b-form-group>

            <b-form-group v-if="isShownWith('user')">
              <label v-t="'label.loginId'" />
              <input v-model="form.loginId" :title="$i18n.tnl('message.validationList', {validate: $i18n.tnl('message.loginValidationList')})" type="text" minlength="3" maxlength="16" pattern="^[a-zA-Z0-9][a-zA-Z0-9_\-@\.]*$" class="form-control" readonly>
            </b-form-group>

            <b-button v-t="'label.back'" type="button" variant="outline-danger" class="mr-2 my-1" @click="backToList" />
            <b-button v-if="isEditable" :variant="theme" type="submit" class="mr-2 my-1" @click="doBeforeSubmit(false)">
              {{ $i18n.tnl(`label.${isUpdate? 'update': 'register'}`) }}
            </b-button>
            <b-button v-if="isRegistable && !isUpdate" v-t="'label.registerAgain'" :variant="theme" type="submit" class="my-1" @click="doBeforeSubmit(true)" />
          </b-form>
        </b-col>
      </b-row>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import _ from 'lodash'
import { APP, EXCLOUD, APP_SERVICE } from '../../../sub/constant/config'
import { POT_TYPE, TYPE_RELATION, CATEGORY } from '../../../sub/constant/Constants'
import * as StringUtil from '../../../sub/util/StringUtil'
import * as Util from '../../../sub/util/Util'
import * as AppServiceHelper from '../../../sub/helper/dataproc/AppServiceHelper'
import * as ImageHelper from '../../../sub/helper/base/ImageHelper'
import * as PotHelper from '../../../sub/helper/domain/PotHelper'
import * as MasterHelper from '../../../sub/helper/domain/MasterHelper'
import * as ValidateHelper from '../../../sub/helper/dataproc/ValidateHelper'
import * as ViewHelper from '../../../sub/helper/ui/ViewHelper'
import * as VueSelectHelper from '../../../sub/helper/ui/VueSelectHelper'
import breadcrumb from '../../../components/layout/breadcrumb.vue'
import commonmixin from '../../../components/mixin/commonmixin.vue'
import editmixin from '../../../components/mixin/editmixin.vue'
import alert from '../../../components/parts/alert.vue'
import chromeInput from '../../../components/parts/chromeinput.vue'
import extform from '../../../components/parts/extform.vue'

export default {
  components: {
    breadcrumb,
    alert,
    chromeInput,
    extform,
  },
  mixins: [commonmixin, editmixin],
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
      // POT_TYPEは人一択
      default: () => [POT_TYPE.PERSON],
    },
  },
  data() {
    return {
      name: 'pot',
      id: 'potId',
      form: {
        ...Util.extract(this.$store.state.app_service.pot,
          ['potId', 'potCd', 'potName', 'potType', 'extValue.ruby',
            'displayName', 'potGroupList.0.group.groupId',
            ...PotHelper.getPotExtKeys(this.pName, true)])
      },
      vueSelected: {
        group: null,
        category: null,
        txs: [],
        authCategories: [],
      },
      potTypeOptions: POT_TYPE.getTypes().filter(val => APP.POT.TYPES.includes(val.value) && this.pTypeList.includes(val.value)),
      txIds: Array(PotHelper.getSetting(this.pName).TX_MAX),
      btxIds: Array(PotHelper.getSetting(this.pName).TX_MAX),
      minors: Array(PotHelper.getSetting(this.pName).TX_MAX),
      thumbnailUrl: APP_SERVICE.BASE_URL + EXCLOUD.POT_THUMBNAIL_URL,
      potCdOld: null,
      useAd: APP.AUTH.USE_AD,
      excludeExtKeys: ['ruby', 'auth', 'category', 'group', 'thumbnail', 'description', 'user']
    }
  },
  computed: {
    hasId(){
      return Util.hasValue(this.form.potId)
    },
    backPath() {
      return this.pPath
    },
    defValue() {
      return { 'potType': this.pTypeList[0] }
    },
    breadCrumbs() {
      return ViewHelper.createBreadCrumbItems('master', {text: StringUtil.concatCamel('pot', this.pName), href: this.backPath}, ViewHelper.getDetailCaptionKey(this.$store.state.app_service.pot.potId))
    },
    categoryOptions() {
      return MasterHelper.getOptionsFromState('category', false, true,
        category => category.categoryType === TYPE_RELATION.getPotCategory()[this.form.potType]
      )
    },
    ...mapState('app_service', [
      'pot',
      'updatedThumbnail',
    ]),
    thumbnailSrc () {
      return this.form.existThumbnail && this.form.potId && (!this.form.thumbnail) ?
        // 登録済みのサムネイルを表示する場合(画像取得APIのURLを指定)
        this.thumbnailUrl.replace('{id}', this.form.potId) + new Date().getTime() :
        // サムネイル欄から画像ファイル選択で表示する場合(base64を指定)
        (this.form.thumbnail ? this.form.thumbnail : '')
    },
    extValue() {
      return PotHelper.getPotExt(this.pName)
    },
  },
  watch: {
    'form.potType': function(newVal, oldVal){
      if(newVal != oldVal){
        this.form.selectedCategoryId = null
        this.vueSelected.category = null
      }
    },
    'vueSelected.txs': {
      handler: function(newVal, oldVal){
        this.vueSelected.txs.forEach((selectedTx, idx) => {
          this.changeTx(Util.getValue(selectedTx, 'value'), idx)
        })
      },
      deep: true,
    },
    'vueSelected.category': {
      handler: function(newVal, oldVal){
        this.form.categoryId = Util.getValue(newVal, 'value')
      },
      deep: true,
    },
    'vueSelected.group': {
      handler: function(newVal, oldVal){
        this.form.groupId = Util.getValue(newVal, 'value')
      },
      deep: true,
    },
    'vueSelected.authCategories': {
      handler: function(newVal, oldVal){
        this.form.authCategoryIdList = newVal.map(val => val.value)
      },
      deep: true,
    },
    txIds: function(newVal, oldVal) {
      this.watchIds(newVal, 'txId')
    },
    btxIds: function(newVal, oldVal) {
      this.watchIds(newVal, 'btxId')
    },
    minors: function(newVal, oldVal) {
      this.watchIds(newVal, 'minor')
    },
  },
  async created(){
    this.initForm()

    const potUser = Util.hasValue(this.pot.potUserList)? this.pot.potUserList[0]: null
    if(potUser && potUser.user){
      this.form.loginId = potUser.user.loginId
    }
  },
  async mounted() {
    Util.applyDef(this.form, this.defValue)
    if(this.form.potType == null){
      this.form.potType = this.defValue.potType
    }
    if(!Util.hasValue(this.form.potCd)){
      this.form.potCd = MasterHelper.createMasterCd('pot', this.pots, this.pot)
    }
    this.initPotTxList()
    this.form.potTxList.forEach((potTx, idx) => {
      this.changeTx(this.form.potTxList[idx].txId, idx)
    })
    this.vueSelected.group = VueSelectHelper.getVueSelectData(this.groupOptions, this.form.groupId)
    ValidateHelper.setCustomValidationMessage()
    VueSelectHelper.disabledAllSubmit()
  },
  methods: {
    getAuthCategoryOptions() {
      const ret =  _.sortBy(this.categories.filter(e => e.categoryType == CATEGORY.AUTH), 'categoryCd')
      return ret.map( e => {
        return { text: e.categoryName, label: e.categoryName, value: e.categoryId }
      })
    },
    isShownWith(column) {
      const settingName = PotHelper.getSettingName(this.pName)
      return this.isShown(settingName + '.WITH', column)
    },
    initForm() {
      if(!Util.hasValue(this.form.potCategoryList)){
        return
      }

      const targetPotCategory = this.form.potCategoryList.find(potCategory => {
        return this.categoryOptions.some(option => option.value == Util.getValue(potCategory, 'category.categoryId'))
      })
      if(Util.hasValue(targetPotCategory)){
        this.vueSelected.category = VueSelectHelper.getVueSelectData(this.categoryOptions, Util.getValue(targetPotCategory, 'category.categoryId'))
      }

      const targetAuthPotCategories = this.form.potCategoryList.filter(potCategory => {
        return this.authCategoryOptions.some(option => option.value == Util.getValue(potCategory, 'category.categoryId'))
      })
      if(Util.hasValue(targetAuthPotCategories)){
        this.vueSelected.authCategories = targetAuthPotCategories.map(potCategory => VueSelectHelper.getVueSelectData(this.authCategoryOptions, Util.getValue(potCategory, 'category.categoryId'))).sort((a, b) => a.label < b.label? -1: 1)
      }
    },
    initPotTxList(){
      this.vueSelected.txs = []
      this.form.potTxList = this.pot.potTxList? this.pot.potTxList.map((val, idx) => {
        this.vueSelected.txs.push(VueSelectHelper.getVueSelectData(this.getTxOptions(idx), val.potTxPK.txId))
        return {
          potId: val.potTxPK.potId,
          txId: val.potTxPK.txId,
        }
      }): []

      const settings = PotHelper.getSetting(this.pName)
      const maxTx = settings.MULTI_TX? settings.TX_MAX: 1
      for(let cnt = this.form.potTxList.length; cnt < maxTx; cnt++){
        this.vueSelected.txs.push(VueSelectHelper.getVueSelectData(this.getTxOptions(cnt)))
        this.form.potTxList.push({
          potId: null,
          txId: null
        })
      }
    },
    getTxIndex(index){
      const settings = PotHelper.getSetting(this.pName)
      return settings.MULTI_TX? 1 < settings.TX_MAX? `${index + 1}`: '': ''
    },
    watchIds(newVal, idName){
      this.form.potTxList.forEach((potTx, idx) => {
        const tx = this.txs.find((tx) => idx < this[`${idName}s`].length && this[`${idName}s`][idx] && this[`${idName}s`][idx] == tx[idName])
        const txOptions = this.getTxOptions(idx).map((val) => val.value)
        const newTxId = tx? tx.txId: null
        this.form.potTxList[idx].txId = txOptions.includes(newTxId)? newTxId: null
      })
    },
    getTxOptions(index) {
      const nowTxIds = this.form.potTxList? this.form.potTxList.filter((val, idx, ary) => {
        if(!val.txId){
          return false
        }
        if(idx == index){
          return false
        }
        if(ary.length <= index){
          return false
        }
        if(this.form.potTxList[idx].txId != this.form.potTxList[index].txId){
          return true
        }
        return idx < index
      }).map(val => val.txId): []
      const selfUseTxIds = this.pot.potTxList? this.pot.potTxList.filter(val => val.potTxPK).map(val => val.potTxPK.txId): []
      let useTxIds = []
      this.pots.forEach(pot => {
        useTxIds.push(pot.txIds? pot.txIds.filter(val => val): [])
      })
      if(useTxIds.length != 0){
        useTxIds = useTxIds.reduce((a, b) => a.concat(b)).filter(val => !selfUseTxIds.includes(val))
      }
      return MasterHelper.getOptionsFromState('tx',
        tx => MasterHelper.getTxIdName(tx),
        true,
        tx => !useTxIds.includes(tx.txId) && !nowTxIds.includes(tx.txId)
      )
    },
    changeTx(newVal, index){
      this.$nextTick(() => {
        const tx = this.txIdMap[newVal]
        this.txIds[index] = tx? tx.txId: null
        this.btxIds[index] = tx? tx.btxId: null
        this.minors[index] = tx? tx.minor: null
        if(this.isShown('TX.BTX_MINOR') != 'minor'){
          this.watchIds(this.btxIds, 'btxId')
        }
        else{
          this.watchIds(this.minors, 'minor')
        }
        this.$forceUpdate()
      })
    },
    beforeSubmit(again){
      this.doBeforeSubmit(again)
    },
    onBeforeReload(){
      this.txIds = this.txIds.map(() => null)
      this.btxIds = this.btxIds.map(() => null)
      this.minors = this.minors.map(() => null)

      this.vueSelected.category = VueSelectHelper.getVueSelectData(this.categoryOptions)
      this.vueSelected.group = VueSelectHelper.getVueSelectData(this.groupOptions)

      this.initPotTxList()
      this.$set(this.form, 'potCd', MasterHelper.nextCd(this.potCdOld))
    },
    async onSaved(){
    },
    async onSaving() {
      const entity = PotHelper.createEntity(this.form, this.minors, this.potTypeOptions, this.groups, this.categories)
      // POT種別は"人"一択
      entity.potType = [POT_TYPE.getTypes().filter(t => t.value === POT_TYPE.PERSON)[0].text]
      // potCdは"worker"  + potId
      entity.potCd = `worker${entity.potId}`
      this.potCdOld = this.form.potCd
      delete entity.potTxList
      delete entity.groupCd
      return await AppServiceHelper.bulkSaveByCsvStr(this.pAppServicePath, [entity])
    },
    getNameByteLangth(){
      const fileElement = Util.getValue(document.getElementsByClassName('custom-file'), '0')
      return fileElement? (fileElement.clientWidth - 80) / 12: 0
    },
    setFileName(name){
      const file = Util.getValue(document.getElementsByClassName('custom-file-label'), '0')
      const param = file.textContent? 'textContent': 'innerText'
      file[param] = name? name: this.$refs.inputThumbnail.placeholder
    },
    readImage(e) {
      this.$nextTick(() => {
        this.form.thumbnail = this.form.thumbnailTemp
        this.form.thumbnailTemp = null
        this.$nextTick(() => {
          ImageHelper.readImageView(this, e, 'thumbnail', null, null, 'thumbnail', APP.POT_THUMBNAIL_MAX)
          this.form.thumbnailTemp = this.form.thumbnail

          const inputFileName = Util.getValue(e, 'target.files.0.name')
          this.setFileName(inputFileName? StringUtil.cutOnLongByte(inputFileName, this.getNameByteLangth()): null)
          if(!inputFileName){
            this.clearImage(e)
          }else{
            this.form.existThumbnail = true
            this.form.deleteThumbnail = false
          }
        })
      })
    },
    clearImage(e) {
      this.$nextTick(() => {
        this.form.thumbnailTemp = null
        this.form.existThumbnail = false
        this.form.deleteThumbnail = true
        this.$refs.inputThumbnail.reset()
        this.setFileName()
      })
    },
    doSubmit(evt) {
      if (this.form.thumbnail) {
        this.replaceAS({updatedPotThumbnailList: [this.form.potId]})
      }
      this.save(evt)
    }
  },
}
</script>

<style scoped lang="scss">
@import "../../../sub/constant/vue.scss";
.tx-select{
  width: 160px;
}
</style>