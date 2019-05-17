<template>
  <div class="container-fluid">
    <breadcrumb :items="items" />
    <div class="container">
      <alert :message="message" />

      <b-row>
        <b-col md="8" offset-md="2">
          <b-form v-if="show" @submit.prevent="onSubmit">
            <chrome-input />
            <span v-for="(potTx, index) in form.potTxList" :key="index">
              <b-form inline @submit.prevent>
                <b-form-group>
                  <b-form-row class="mb-3 mr-5">
                    <label>
                      {{ $i18n.tnl('label.tx') + getTxIndex(index) }}
                    </label>
                    <v-select v-model="vueSelected.txs[index]" :options="getTxOptions(index)" :disabled="!isEditable" :readonly="!isEditable" class="ml-3 vue-options" />
                  </b-form-row>
                </b-form-group>
              </b-form>
            </span>
            <b-form-group v-show="category.length > 1">
              <label v-t="'label.categoryType'" />
              <b-form-radio-group v-model="form.potType" :options="category" :disabled="!isEditable" :required="category.length > 1" />
            </b-form-group>
            <b-form-group>
              <label v-t="'label.potCd'" />
              <input v-model="form.potCd" :readonly="!isEditable" type="text" maxlength="20" class="form-control">
            </b-form-group>
            <b-form-group>
              <label v-t="'label.potName'" />
              <input v-model="form.potName" :readonly="!isEditable" type="text" maxlength="20" class="form-control" required>
            </b-form-group>
            <b-form-group v-show="isShown('POT.WITH', 'ruby')">
              <label v-t="'label.ruby'" />
              <input v-model="form.ruby" :readonly="!isEditable" type="text" maxlength="20" class="form-control">
            </b-form-group>
            <b-form-group>
              <label v-t="'label.displayName'" />
              <input v-model="form.displayName" :readonly="!isEditable" type="text" maxlength="3" class="form-control">
            </b-form-group>
            <b-form-group v-show="isShown('POT.WITH', 'group')">
              <label v-t="'label.group'" />
              <v-select v-model="vueSelected.group" :options="groupOptions" :disabled="!isEditable" :readonly="!isEditable" class="mb-3 vue-options" />
            </b-form-group>
            <b-form-group v-show="isShown('POT.WITH', 'category')">
              <label v-t="'label.category'" />
              <v-select v-model="vueSelected.category" :options="categoryOptions" :disabled="!isEditable" :readonly="!isEditable" class="mb-3 vue-options" />
            </b-form-group>
            <b-form-group v-show="isShown('POT.WITH', 'post')">
              <label v-t="'label.post'" />
              <input v-model="form.post" :readonly="!isEditable" type="text" maxlength="20" class="form-control">
            </b-form-group>
            <b-form-group v-show="isShown('POT.WITH', 'tel')">
              <label v-t="'label.tel'" />
              <b-form-input v-model="form.tel" :readonly="!isEditable" type="tel" maxlength="20" pattern="[-\d]*" />
            </b-form-group>
            <b-form-group>
              <label v-t="'label.thumbnail'" />
              <b-form-file v-if="isEditable" ref="inputThumbnail" v-model="form.thumbnailTemp" :placeholder="$t('message.selectFile') " accept="image/jpeg, image/png, image/gif" @change="readImage" />
              <b-button v-if="isEditable && form.thumbnail" :variant="theme" type="button" class="float-right mt-3" @click="clearImage">
                {{ $i18n.tnl('label.clear') }}
              </b-button>
              <img v-show="form.thumbnail" ref="thumbnail" :src="form.thumbnail" width="100" class="mt-1 ml-3">
            </b-form-group>
            <b-form-group v-if="isShown('POT.WITH', 'description')">
              <label v-t="'label.description'" />
              <b-form-textarea v-model="form.description" :rows="3" :max-rows="6" :readonly="!isEditable" maxlength="1000" />
            </b-form-group>

            <b-form-group v-if="isShown('POT.WITH', 'user')">
              <b-form-checkbox v-model="editShowUser" :value="true" :unchecked-value="false" @change="nextShowEmailCheck()">
                <span v-text="$i18n.tnl('label.editUserInfo')" />
              </b-form-checkbox>
            </b-form-group>
            <b-form-group v-show="showEmail">
              <label v-t="'label.email'" />
              <b-form-input v-model="userForm.email" type="email" maxlength="255" />
            </b-form-group>
            <b-form-group v-show="editShowUser">
              <label v-t="'label.loginId'" />
              <input v-model="userForm.loginId" :title="$i18n.tnl('message.validationList', {validate: $i18n.tnl('message.loginValidationList')})" type="text" minlength="3" maxlength="16" pattern="^[a-zA-Z][a-zA-Z0-9_\-@\.]*$" class="form-control" :required="editShowUser">
            </b-form-group>
            <b-form-group v-show="editShowUser">
              <label v-t="'label.role'" />
              <v-select v-model="vueSelected.role" :options="roleOptions" :clearable="false" :required="editShowUser" class="vue-options" />
            </b-form-group>
            <b-form-group v-show="editShowUser">
              <label v-if="hasUserId" v-t="'label.passwordUpdate'" />
              <label v-else v-t="'label.password'" />
              <input v-model="userForm.pass" type="password" :minlength="userForm.pass? 3: 0" maxlength="16" pattern="^[a-zA-Z0-9_\-\/!#\$%&@]*$" class="form-control" :required="editShowUser && !hasUserId">
            </b-form-group>

            <b-button v-t="'label.back'" type="button" variant="outline-danger" class="mr-2 my-1" @click="backToList" />
            <b-button v-if="isEditable" :variant="theme" type="submit" class="mr-2 my-1" @click="register(false)">
              {{ $i18n.tnl(`label.${isUpdate? 'update': 'register'}`) }}
            </b-button>
            <b-button v-if="isRegistable && !isUpdate" v-t="'label.registerAgain'" :variant="theme" type="submit" class="my-1" @click="register(true)" />
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
import * as HtmlUtil from '../../../sub/util/HtmlUtil'
import * as Util from '../../../sub/util/Util'
import breadcrumb from '../../../components/layout/breadcrumb.vue'
import alert from '../../../components/parts/alert.vue'
import chromeInput from '../../../components/parts/chromeinput.vue'
import { getButtonTheme } from '../../../sub/helper/ThemeHelper'
import * as AppServiceHelper from '../../../sub/helper/AppServiceHelper'
import { CATEGORY, SENSOR, USER } from '../../../sub/constant/Constants'
import { APP } from '../../../sub/constant/config.js'

export default {
  components: {
    breadcrumb,
    alert,
    chromeInput,
  },
  mixins: [editmixinVue],
  data() {
    return {
      name: 'pot',
      id: 'potId',
      backPath: '/master/pot',
      appServicePath: '/basic/pot',
      category: _.slice(CATEGORY.getTypes(), 0, 2).filter((val) => APP.CATEGORY.TYPES.includes(val.value)),
      txIds: Array(APP.POT.TX_MAX),
      btxIds: Array(APP.POT.TX_MAX),
      minors: Array(APP.POT.TX_MAX),
      showEmail: false,
      editShowUser: false,
      roleOptions: [],
      form: {
        ...ViewHelper.extract(this.$store.state.app_service.pot,
          ['potId', 'potCd', 'potName', 'potType', 'extValue.ruby',
            'displayName', 'potGroupList.0.group.groupId', 'potCategoryList.0.category.categoryId', 'extValue.tel',
            'extValue.post', 'thumbnail', 'description'])
      },
      vueSelected: {
        group: null,
        category: null,
        role: null,
        txs: []
      },
      userForm: {
        userId: null, loginId: null, pass: null, roleId: null, email: null,
      },
      oldUserForm: {
        userId: null, loginId: null, pass: null, roleId: null, email: null,
      },
      defValue: {
        'potType': APP.CATEGORY.TYPES[0] != 3? APP.CATEGORY.TYPES[0]: null,
      },
      items: ViewHelper.createBreadCrumbItems('master', {text: 'pot', href: '/master/pot'}, Util.getDetailCaptionKey(this.$store.state.app_service.pot.potId)),
    }
  },
  computed: {
    hasId(){
      return Util.hasValue(this.form.potId)
    },
    theme () {
      const theme = getButtonTheme()
      return 'outline-' + theme
    },
    categoryOptions() {
      return StateHelper.getOptionsFromState('category', false, true,
        category => category.categoryType === this.form.potType
      )
    },
    ...mapState('app_service', [
      'pot',
      'pots',
      'groups',
      'categories',
      'txs',
    ]),
    hasUserId(){
      return Util.hasValue(this.userForm.userId)
    },
  },
  watch: {
    'form.potType': function(newVal, oldVal){
      if(newVal != oldVal){
        this.form.selectedCategory = null
        this.form.categoryId = null
      }
    },
    'vueSelected.txs': {
      handler: function(newVal, oldVal){
        this.vueSelected.txs.forEach((selectedTx, idx) => {
          if(selectedTx){
            this.changeTx(selectedTx.value, idx)
          }
        })
      },
      deep: true,
    },
    'vueSelected.categpry': {
      handler: function(newVal, oldVal){
        this.form.categoryId = Util.getValue(newVal, 'value', null)
      },
      deep: true,
    },
    'vueSelected.group': {
      handler: function(newVal, oldVal){
        this.form.groupId = Util.getValue(newVal, 'value', null)
      },
      deep: true,
    },
    'vueSelected.role': {
      handler: function(newVal, oldVal){
        this.userForm.roleId = Util.getValue(newVal, 'value', null)
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
    }
  },
  async created(){
    this.initPotTxList()
    await StateHelper.load('role')
    this.roleOptions = StateHelper.getOptionsFromState('role', false, true)

    const potUser = Util.hasValue(this.pot.potUserList)? this.pot.potUserList[0]: null
    if(potUser && potUser.user){
      this.userForm.userId = potUser.user.userId
      this.userForm.loginId = potUser.user.loginId
      this.userForm.roleId = potUser.user.roleId
      this.userForm.email = potUser.user.email
      this.oldUserForm.userId = potUser.user.userId
      this.oldUserForm.loginId = potUser.user.loginId
      this.oldUserForm.roleId = potUser.user.roleId
      this.oldUserForm.email = potUser.user.email
      this.editShowUser = true
      this.vueSelected.role = StateHelper.getVueSelectData(this.roleOptions, potUser.user.roleId)
    }
    else{
      this.editShowUser = false
      const maxRole = this.roleOptions.reduce((a, b) => a.value > b.value? a: b)
      this.userForm.roleId = maxRole? maxRole.value: null
      this.vueSelected.role = StateHelper.getVueSelectData(this.roleOptions, maxRole? maxRole.value: null)
    }
  },
  async mounted() {
    ViewHelper.applyDef(this.form, this.defValue)
    if(this.form.potType == null){
      this.form.potType = this.defValue.potType
    }
    if(!Util.hasValue(this.form.potCd)){
      this.form.potCd = StateHelper.createMasterCd('pot', this.pots, this.pot)
    }
    StateHelper.load('group')
    StateHelper.load('category')
    await StateHelper.load('tx')
    this.form.potTxList.forEach((potTx, idx) => {
      this.changeTx(this.form.potTxList[idx].txId, idx)
    })
    this.vueSelected.category = StateHelper.getVueSelectData(this.categoryOptions, this.form.categoryId)
    this.vueSelected.group = StateHelper.getVueSelectData(this.groupOptions, this.form.groupId)
    HtmlUtil.setCustomValidationMessage()
  },
  methods: {
    initPotTxList(){
      this.vueSelected.txs = []
      this.form.potTxList = this.pot.potTxList? this.pot.potTxList.map((val, idx) => {
        this.vueSelected.txs.push(StateHelper.getVueSelectData(this.getTxOptions(idx), val.potTxPK.txId))
        return {
          potId: val.potTxPK.potId,
          txId: val.potTxPK.txId,
        }
      }): []
      const maxTx = APP.POT.MULTI_TX? APP.POT.TX_MAX: 1
      for(let cnt = this.form.potTxList.length; cnt < maxTx; cnt++){
        this.vueSelected.txs.push(StateHelper.getVueSelectData(this.getTxOptions(cnt), null))
        this.form.potTxList.push({
          potId: null,
          txId: null
        })
      }
    },
    getTxIndex(index){
      return APP.POT.MULTI_TX? 1 < APP.POT.TX_MAX? `${index + 1}`: '': ''
    },
    watchIds(newVal, idName){
      this.form.potTxList.forEach((potTx, idx) => {
        const tx = this.txs.find((tx) => idx < this[`${idName}s`].length && this[`${idName}s`][idx] && this[`${idName}s`][idx] == tx[idName])
        const txOptions = this.getTxOptions(idx).map((val) => val.value)
        const newTxId = tx? tx.txId: null
        this.form.potTxList[idx].txId = txOptions.includes(newTxId)? newTxId: null
      })
    },
    nextShowEmailCheck(){
      this.$nextTick(() => {
        this.showEmailCheck()
      })
    },
    showEmailCheck(){
      if(this.editShowUser){
        this.showEmail = true
        return this.showEmail
      }
      if(!Util.hasValue(this.form.potTxList)){
        this.showEmail = false
        return this.showEmail
      }
      for(let cnt = 0; cnt < this.form.potTxList.length; cnt++){
        const tx = this.txs.find((tx) => this.form.potTxList[cnt].txId == tx.txId)
        if(tx && Util.hasValue(tx.txSensorList) && tx.txSensorList[0].txSensorPK.sensorId == SENSOR.BUTTON){
          this.showEmail = true
          return this.showEmail
        }
      }
      this.showEmail = false
      return this.showEmail
    },
    getTxOptions(index) {
      const nowTxIds = this.form.potTxList? this.form.potTxList.filter((val, idx) => {
        if(!val.txId){
          return false
        }
        if(idx == index){
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
      return StateHelper.getOptionsFromState('tx',
        tx => StateHelper.getTxIdName(tx),
        true,
        tx => !useTxIds.includes(tx.txId) && !nowTxIds.includes(tx.txId)
      )
    },
    changeTx(newVal, index){
      this.$nextTick(() => {
        const tx = this.txs.find((tx) => newVal == tx.txId)
        this.txIds[index] = tx? tx.txId: null
        this.btxIds[index] = tx? tx.btxId: null
        this.minors[index] = tx? tx.minor: null
        if(this.isShown('TX.BTX_MINOR') != 'minor'){
          this.watchIds(this.btxIds, 'btxId')
        }
        else{
          this.watchIds(this.minors, 'minor')
        }
        this.showEmailCheck()
        this.$forceUpdate()
      })
    },
    beforeSubmit(again){
      this.register(again)
    },
    beforeReload(){
      this.txIds = this.txIds.map(() => null)
      this.btxIds = this.btxIds.map(() => null)
      this.minors = this.minors.map(() => null)

      this.vueSelected.category = StateHelper.getVueSelectData(this.categoryOptions, null)
      this.vueSelected.group = StateHelper.getVueSelectData(this.groupOptions, null)

      const maxRole = this.roleOptions.reduce((a, b) => a.value > b.value? a: b)
      this.userForm.roleId = maxRole? maxRole.value: null
      this.vueSelected.role = StateHelper.getVueSelectData(this.roleOptions, maxRole? maxRole.value: null)

      this.form.potCd = StateHelper.createMasterCd('pot', this.pots, this.pot)
      this.initPotTxList()
    },
    afterCrud(){
      StateHelper.setForceFetch('tx', true)
      StateHelper.setForceFetch('user', true)
    },
    setDummyParam(dummyUser, paramName, showForm){
      dummyUser[paramName] = showForm? this.userForm[paramName]: this.hasUserId? this.oldUserForm[paramName]: dummyUser[paramName]
    },
    async getUserEntity(dummyParam) {
      if(!this.hasId && !this.editShowUser && !this.showEmail){
        return null
      }

      const login = JSON.parse(window.localStorage.getItem('login'))
      const dummyLoginId = this.createDummyLoginId([
        login.currentRegion.regionId,
        ...this.form.potTxList.map((potTx) => potTx.txId? potTx.txId: 0)
      ])
      const dummyUser = await this.createDummyUser(dummyLoginId)

      dummyUser.userId = this.userForm.userId? this.userForm.userId: dummyParam.dummyKey--
      dummyUser.name = this.form.potName
      this.setDummyParam(dummyUser, 'loginId', this.editShowUser)
      this.setDummyParam(dummyUser, 'pass', this.editShowUser)
      this.setDummyParam(dummyUser, 'roleId', this.editShowUser)
      this.setDummyParam(dummyUser, 'email', this.showEmail)
      if(!this.editShowUser && this.showEmail){
        dummyUser.encrypt = USER.ENCRYPT.OFF
      }
      return dummyUser
    },
    async save() {
      let dummyParam = {dummyKey: -1}
      const entity = {
        potId: this.form.potId || dummyParam.dummyKey--,
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
        potUserList: this.hasUserId || this.editShowUser || this.showEmail ? [{
          potUserPK: {
            potId: this.form.potId || dummyParam.dummyKey--,
            userId: this.userForm.userId? this.userForm.userId: dummyParam.dummyKey--
          },
          user: await this.getUserEntity(dummyParam)
        }] : [],
        txId: this.form.txId,
        thumbnail: this.form.thumbnail,
        description: this.form.description,
      }
      const potTxList = []
      this.form.potTxList.forEach((potTx) => {
        if(potTx.txId){
          potTxList.push({
            potTxPK: {
              potId: this.form.potId || dummyParam.dummyKey--,
              txId: potTx.txId
            }
          })
        }
      })
      entity.potTxList = potTxList
      return await AppServiceHelper.bulkSave(this.appServicePath, [entity])
    },
    getNameByteLangth(){
      const fileElement = Util.getValue(document.getElementsByClassName('custom-file'), '0', null)
      return fileElement? (fileElement.clientWidth - 80) / 12: 0
    },
    setFileName(name){
      const file = Util.getValue(document.getElementsByClassName('custom-file-label'), '0', null)
      const param = file.textContent? 'textContent': 'innerText'
      file[param] = name? name: this.$refs.inputThumbnail.placeholder
    },
    readImage(e) {
      this.form.thumbnail = this.form.thumbnailTemp
      this.form.thumbnailTemp = null
      this.$nextTick(() => {
        this.readImageView(e, 'thumbnail', null, null, 'thumbnail', APP.POT_THUMBNAIL_MAX)
        this.form.thumbnailTemp = this.form.thumbnail

        const inputFileName = Util.getValue(e, 'target.files.0.name', null)
        this.setFileName(inputFileName? Util.cutOnLongByte(inputFileName, this.getNameByteLangth()): null)
        if(!inputFileName){
          this.clearImage(e)
        }
      })
    },
    clearImage(e) {
      this.$nextTick(() => {
        this.form.thumbnailTemp = null
        this.form.thumbnail = null
        this.$refs.inputThumbnail.reset()
        this.setFileName()
      })
    },
  },
}
</script>

<style scoped lang="scss">
@import "../../../sub/constant/vue.scss";
.tx-select{
  width: 160px;
}
</style>