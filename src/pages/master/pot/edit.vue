<template>
  <div>
    <breadcrumb :items="items" />
    <div class="container">

      <b-alert variant="info" :show="showInfo">{{ message }}</b-alert>
      <b-alert variant="danger" dismissible :show="showAlert"  @dismissed="showAlert=false">{{ message }}</b-alert>

      <b-row>
        <b-col md="8" offset-md="2">
          <b-form @submit="onSubmit" v-if="show">
            <b-form-group v-if="form.potId">
              <label v-t="'label.potId'" />
              <b-form-input type="text" v-model="form.potId" readonly="readonly" />
            </b-form-group>
            <b-form-group>
              <label v-t="'label.tx'" />
              <b-form-select v-model="form.txId" :options="txOptions" class="mb-3 ml-3 col-4" :disabled="!isEditable" :readonly="!isEditable" />
            </b-form-group>
            <b-form-group>
              <label v-t="'label.txId'" />
              <b-form-input type="number" v-model="form.txId" :readonly="!isEditable" />
            </b-form-group>
            <b-form-group>
              <label v-t="'label.categoryType'" />
              <b-form-radio-group v-model="form.personOrThing" :options="category" :disabled="!isEditable" />
            </b-form-group>
            <b-form-group v-if="isShown('POT_WITH_POTCD')">
              <label v-t="'label.potCd'" />
              <b-form-input type="text" v-model="form.potCd" maxlength="20" required :readonly="!isEditable" />
            </b-form-group>
            <b-form-group>
              <label v-t="'label.potName'" />
              <b-form-input type="text" v-model="form.potName" maxlength="20" required :readonly="!isEditable" />
            </b-form-group>
            <b-form-group v-show="isShown('POT_WITH_RUBY')">
              <label v-t="'label.ruby'" />
              <b-form-input type="text" v-model="form.ruby" maxlength="20" :readonly="!isEditable" />
            </b-form-group>
            <b-form-group>
              <label v-t="'label.displayName'" />
              <b-form-input type="text" v-model="form.displayName" maxlength="3" :readonly="!isEditable" />
            </b-form-group>
            <b-form-group v-show="isShown('POT_WITH_GROUP')">
              <label v-t="'label.group'" />
              <b-form-select v-model="form.groupId" :options="groupOptions" class="mb-3 ml-3 col-4" :disabled="!isEditable" :readonly="!isEditable" />
            </b-form-group>
            <b-form-group v-show="isShown('POT_WITH_CATEGORY')">
              <label v-t="'label.category'" />
              <b-form-select v-model="form.categoryId" :options="categoryOptions" class="mb-3 ml-3 col-4" :disabled="!isEditable" :readonly="!isEditable" />
            </b-form-group>
            <b-form-group v-show="isShown('POT_WITH_POST')">
              <label v-t="'label.post'" />
              <b-form-input type="text" v-model="form.post" maxlength="20" :readonly="!isEditable" />
            </b-form-group>
            <b-form-group v-show="isShown('POT_WITH_TEL')">
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
            <b-button v-if="isEditable" type="submit" :variant="theme" @click="beforeSubmit(false)" class="ml-2"  >{{ label }}</b-button>
            <b-button v-if="isEditable && !isUpdate" type="submit" :variant="theme" @click="beforeSubmit(true)" class="ml-2" v-t="'label.registerAgain'"/>
          </b-form>
        </b-col>
      </b-row>

    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import _ from 'lodash'
import * as ViewHelper from '../../../sub/helper/ViewHelper'
import * as StateHelper from '../../../sub/helper/StateHelper'
import editmixinVue from '../../../components/editmixin.vue'
import breadcrumb from '../../../components/breadcrumb.vue'
import { getButtonTheme } from '../../../sub/helper/ThemeHelper'
import * as AppServiceHelper from '../../../sub/helper/AppServiceHelper'
import { CATEGORY } from '../../../sub/constant/Constants'

let that

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
      category: _.slice(CATEGORY.getTypes(), 0, 2),
      form: {personOrThing: CATEGORY.getTypes()[0].value,
          ...ViewHelper.extract(this.$store.state.app_service.pot,
          ["potId", "potCd", "potName", "extValue.ruby",
          "displayName", "potGroupList.0.group.groupId", "potCategoryList.0.category.categoryId", "extValue.tel", "txId",
          "extValue.post", "thumbnail", "description"])},
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
          text: this.$i18n.tnl('label.pot') + this.$i18n.tnl('label.detail'),
          active: true
        }
      ]
    }
  },
  computed: {
    theme () {
      const theme = getButtonTheme(this.$store.state.loginId)
      return 'outline-' + theme
    },
    categoryOptions() {
      let options = this.categories.filter((category) => 
        category.categoryType === this.form.personOrThing
      ).map((category) => {
          return {
            value: category.categoryId,
            text: category.categoryName
          }
        }
      )
      options.unshift({value:null, text:''})
      return options
    },
    groupOptions() {
      let options = this.groups.map((group) => {
          return {
            value: group.groupId,
            text: group.groupName
          }
        }
      )
      options.unshift({value:null, text:''})
      return options
    },
    txOptions() {
      const useTxIds = this.pots.map((val) => val.txId)
      let options = this.txs.filter((tx) => !_.includes(useTxIds, tx.txId) || tx.txId == this.pot.txId )
      options = options.map((tx) => {
          return {
            value: tx.txId,
            text: tx.txName
          }
        }
      )
      options.unshift({value:null, text:''})
      return options
    },
    ...mapState('app_service', [
      'pot',
      'pots',
      'groups',
      'categories',
      'txs',
    ]),
  },
  mounted() {
    that = this
    StateHelper.load('group')
    StateHelper.load('category')
    StateHelper.load('tx')
  },
  // watch: {
  //   'form.personOrThing': {
  //     handler: function(val) {
  //       that.replaceAs()
  //     },
  //     immediate: true,
  //   }
  // },
  methods: {
    beforeSubmit(again){
      if(!this.isShown('POT_WITH_POTCD')){
        this.form.potCd = this.form.potName
      }
      this.register(again)
    },
    async save() {
      const entity = {
        potId: this.form.potId || -1,
        potCd: this.form.potCd,
        potName: this.form.potName,
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
      this.readImageView(e, 'thumbnail')
    }
  },
}
</script>

<style scoped lang="scss">

</style>