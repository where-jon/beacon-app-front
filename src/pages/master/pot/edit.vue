<template>
  <div>
    <breadcrumb :items="items" />
    <div class="container">
      <alert :message="message" />

      <b-row>
        <b-col md="8" offset-md="2">
          <b-form v-if="show" @submit.prevent="onSubmit">
            <b-form-group v-if="form.potId">
              <label v-t="'label.potId'" />
              <b-form-input v-model="form.potId" type="text" readonly="readonly" />
            </b-form-group>
            <span v-for="(potTx, index) in form.potTxList" :key="index">
              <b-form inline @submit.prevent>
                <b-form-group>
                  <b-form-row>
                    <b-form-row class="mb-3 mr-5">
                      <label>
                        {{ $i18n.tnl('label.tx') + getTxIndex(index) }}
                      </label>
                      <b-form-select v-model="potTx.txId" :options="getTxOptions(index)" :disabled="!isEditable" :readonly="!isEditable" class="ml-3 tx-select" @change="changeTx($event, index)" />
                    </b-form-row>
                    <b-form-row v-show="isShown('TX_WITH_TXID')" class="mb-3 mr-3">
                      <b-form-row>
                        <label>
                          {{ $i18n.tnl('label.txId') + getTxIndex(index) }}
                        </label>
                        <input v-model="txIds[index]" :readonly="!isEditable" type="number" min="0" max="65535" class="form-control ml-3 tx-select">
                      </b-form-row>
                    </b-form-row>
                    <b-form-row v-show="!isShown('TX_WITH_TXID') && isShown('TX_BTX_MINOR') != 'minor'" class="mb-3 mr-3">
                      <label>
                        {{ $i18n.tnl('label.btxId') + getTxIndex(index) }}
                      </label>
                      <input v-model="btxIds[index]" :readonly="!isEditable" type="number" min="0" max="65535" class="form-control ml-3 tx-select">
                    </b-form-row>
                    <b-form-row v-show="!isShown('TX_WITH_TXID') && isShown('TX_BTX_MINOR') == 'minor'" class="mb-3 mr-3">
                      <label>
                        {{ `Tx(${$i18n.tnl('label.minor')}${getTxIndex(index)})` }}
                      </label>
                      <input v-model="minors[index]" :readonly="!isEditable" type="number" min="0" max="65535" class="form-control ml-3 tx-select">
                    </b-form-row>
                  </b-form-row>
                </b-form-group>
              </b-form>
            </span>
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

            <b-form-group v-if="isShown('POT_WITH_USER')">
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
              <b-form-select v-model="userForm.roleId" :options="roleOptions" :required="editShowUser" />
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
import * as Util from '../../../sub/util/Util'
import breadcrumb from '../../../components/layout/breadcrumb.vue'
import alert from '../../../components/parts/alert.vue'
import { getButtonTheme } from '../../../sub/helper/ThemeHelper'
import * as AppServiceHelper from '../../../sub/helper/AppServiceHelper'
import { CATEGORY, SENSOR, USER } from '../../../sub/constant/Constants'
import { APP } from '../../../sub/constant/config.js'

export default {
  components: {
    breadcrumb,
    alert,
  },
  mixins: [editmixinVue],
  data() {
    return {
      name: 'pot',
      id: 'potId',
      backPath: '/master/pot',
      appServicePath: '/basic/pot',
      category: _.slice(CATEGORY.getTypes(), 0, 2).filter((val) => APP.CATEGORY_TYPES.includes(val.value)),
      txIds: Array(APP.POT_TX_MAX),
      btxIds: Array(APP.POT_TX_MAX),
      minors: Array(APP.POT_TX_MAX),
      showEmail: false,
      editShowUser: false,
      roleOptions: [],
      form: {
        ...ViewHelper.extract(this.$store.state.app_service.pot,
          ['potId', 'potCd', 'potName', 'potType', 'extValue.ruby',
            'displayName', 'potGroupList.0.group.groupId', 'potCategoryList.0.category.categoryId', 'extValue.tel',
            'extValue.post', 'thumbnail', 'description'])
      },
      userForm: {
        userId: null, loginId: null, pass: null, roleId: null, email: null,
      },
      oldUserForm: {
        userId: null, loginId: null, pass: null, roleId: null, email: null,
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
    }
    else{
      const maxRole = this.roleOptions.reduce((a, b) => a.value > b.value? a: b)
      this.userForm.roleId = maxRole? maxRole.value: null
    }
  },
  async mounted() {
    ViewHelper.applyDef(this.form, this.defValue)
    StateHelper.load('group')
    StateHelper.load('category')
    await StateHelper.load('tx')
    this.form.potTxList.forEach((potTx, idx) => {
      this.changeTx(this.form.potTxList[idx].txId, idx)
    })
  },
  methods: {
    initPotTxList(){
      this.form.potTxList = this.pot.potTxList? this.pot.potTxList.map((val) => {
        return {
          potId: val.potTxPK.potId,
          txId: val.potTxPK.txId,
        }
      }): []
      const maxTx = APP.POT_MULTI_TX? APP.POT_TX_MAX: 1
      for(let cnt = this.form.potTxList.length; cnt < maxTx; cnt++){
        this.form.potTxList.push({
          potId: null,
          txId: null
        })
      }
    },
    getTxIndex(index){
      return APP.POT_MULTI_TX? 1 < APP.POT_TX_MAX? `${index + 1}`: '': ''
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
      }).map((val) => val.txId): []
      const selfUseTxIds = this.pot.potTxList? this.pot.potTxList.filter((val) => val.potTxPK).map((val) => val.potTxPK.txId): []
      let useTxIds = []
      this.pots.forEach((pot) => {
        useTxIds.push(pot.txIds? pot.txIds.filter((val) => val): [])
      })
      if(useTxIds.length != 0){
        useTxIds = useTxIds.reduce((a, b) => a.concat(b)).filter((val) => !selfUseTxIds.includes(val))
      }
      return StateHelper.getOptionsFromState('tx',
        tx => StateHelper.getTxIdName(tx),
        false,
        tx => !useTxIds.includes(tx.txId) && !nowTxIds.includes(tx.txId)
      )
    },
    changeTx(newVal, index){
      this.$nextTick(() => {
        const tx = this.txs.find((tx) => newVal == tx.txId)
        this.txIds[index] = tx? tx.txId: null
        this.btxIds[index] = tx? tx.btxId: null
        this.minors[index] = tx? tx.minor: null
        if(this.isShown('TX_WITH_TXID')){
          this.watchIds(this.txIds, 'txId')
        }
        if(!this.isShown('TX_WITH_TXID') && this.isShown('TX_BTX_MINOR') != 'minor'){
          this.watchIds(this.btxIds, 'btxId')
        }
        if(!this.isShown('TX_WITH_TXID') && this.isShown('TX_BTX_MINOR') == 'minor'){
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
.tx-select{
  width: 160px;
}
</style>