<template>
  <div>
    <breadcrumb :items="items" />
    <div class="container">

      <b-alert variant="info" :show="showInfo">{{ message }}</b-alert>
      <b-alert variant="danger" dismissible :show="showAlert"  @dismissed="showAlert=false" v-html="message"></b-alert>

      <b-form @submit="onSubmit" v-if="show">
        <b-form-group>
          <label v-t="'label.csvFile'" />
          <b-form-file v-model="form.csvFile" accept="text/csv" :placeholder="$t('message.selectFile') "></b-form-file>
        </b-form-group>
        <b-button type="submit" :variant="theme" @click="register(true)" >{{ label }}</b-button>
        <b-button type="button" variant="outline-danger" @click="backToList" class="ml-2" v-t="'label.back'"/>
      </b-form>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import _ from 'lodash'
import * as Util from '../../../sub/util/Util'
import editmixinVue from '../../../components/editmixin.vue'
import breadcrumb from '../../../components/breadcrumb.vue'
import { getButtonTheme } from '../../../sub/helper/ThemeHelper'
import { getTheme } from '../../../sub/helper/ThemeHelper'

let that

export default {
  components: {
    breadcrumb,
  },
  mixins: [editmixinVue],
  data() {
    return {
      name: 'thing',
      id: 'thingId',
      backPath: '/master/thing',
      appServicePath: '/basic/thing',
      mutex: false,
      bulkRegister: true,
      form: {},
      items: [
        {
          text: this.$i18n.t('label.master'),
          active: true
        },
        {
          text: this.$i18n.t('label.thing'),
          href: '/master/thing',
        },
        {
          text: this.$i18n.t('label.thing') + this.$i18n.t('label.bulkRegister'),
          active: true
        }
      ]
    }
  },
  watch: {
  },
  mounted() {
    that = this
  },
  computed: {
    theme () {
      const theme = getTheme(this.$store.state.loginId)
      return 'outline-' + theme
    },
    ...mapState('app_service', [
      'thing',
    ]),
  },
  methods: {
    async save() {
      await this.bulkSave((csv) => {
        if (!csv || !csv.data) return
        let entities = []
        let header
        let dummyKey = -1
        
        let MAIN_COL = "thingId"
        let THING_CATEGORY = ["categoryId"]
        let INT_TYPE_LIST = ["exbId", "txId", "categoryId"]

        csv.data.forEach((line, lineIdx) => {
          if (lineIdx == 0) {
            header = line
            if (!header.includes(MAIN_COL)) {
              throw Error(that.$i18n.t('message.csvHeaderRequired'))
            }
          }
          else {
            let entity = {thingId:dummyKey--}
            line.forEach((val, idx) => {
              if (Util.equalsAny(header[idx], INT_TYPE_LIST)) { // Number type
                val = String(val)
              }

              if (Util.equalsAny(header[idx], THING_CATEGORY)) {
                if (header[idx] == "categoryId" && val.length != 0) {
                  entity.thingCategoryList = [{thingCategoryPK: {categoryId: val}}]
                }
              }
              else {
                if (header[idx] == "thingId" && val.length != 0) {
                  val = dummyKey--
                }
                entity[header[idx]] = val
              }
            })
            entities.push(entity)
          }
        })
        return entities
      })
    },
  }
}
</script>

<style scoped lang="scss">

</style>