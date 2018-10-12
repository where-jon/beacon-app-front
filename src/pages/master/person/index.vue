<template>
  <div>
    <breadcrumb :items="items" />
    <m-list :params="params" :list="persons" />
  </div>
</template>

<script>
import mList from '../../../components/list.vue'
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import * as AppServiceHelper from '../../../sub/helper/AppServiceHelper'
import { addLabelByKey } from '../../../sub/helper/ViewHelper'
import listmixinVue from '../../../components/listmixin.vue'
import breadcrumb from '../../../components/breadcrumb.vue'

export default {
  components: {
    mList,
    breadcrumb,
  },
  mixins: [listmixinVue],
  data() {
    return {
      params: {
        name: 'person',
        id: 'personId',
        editPath: '/master/person/edit',
        appServicePath: '/basic/person',
        bulkEditPath: '/master/person/bulkEdit',
        csvOut: true,
        fields: addLabelByKey(this.$i18n, [ 
          {key: "personId", sortable: true, tdClass: "thumb-rowdata"},
          {key: "thumbnail", tdClass: "thumb-rowdata" },
          {key: "personCd", sortable: true , tdClass: "thumb-rowdata"},
          {key: "personName", sortable: true , tdClass: "thumb-rowdata"},
          {key: "extValue.ruby", label: "ruby", sortable: true, tdClass: "thumb-rowdata"},
          {key: "displayName", sortable: true, tdClass: "thumb-rowdata"},
          {key: "group.groupName", label: "group", sortable: true, tdClass: "thumb-rowdata"},
          {key: "category.categoryName", label: "category", sortable: true, tdClass: "thumb-rowdata"},
          {key: "extValue.post", label: "post", tdClass: "thumb-rowdata"},
          {key: "txId", sortable: true, 'class': 'text-center' , tdClass: "thumb-rowdata"},
          {key: "actions", thStyle: {width:'130px !important'} , tdClass: "thumb-rowdata"}
        ]),
        initTotalRows: this.$store.state.app_service.persons.length,
      },
      items: [
        {
          text: this.$i18n.t('label.master'),
          active: true
        },
        {
          text: this.$i18n.t('label.person'),
          active: true
        }
      ]
    }
  },
  computed: {
    ...mapState('app_service', [
      'persons',
      'personImages',
      'groups',
      'categories',
    ]),
  },
  methods: {
    async fetchData(payload) {
      try {
        this.replace({showProgress: true})
        let persons = await AppServiceHelper.fetchList("/basic/person/withThumbnail", 'personId')
        let personImages = persons.map((val) => val.thumbnail)
        persons = persons.map((val) => ({...val, thumbnail: ""})) // omit images to avoid being filtering target
        if (payload && payload.done) {
          payload.done()
        }
        this.replaceAS({persons, personImages})
      }
      catch(e) {
        console.error(e)
      }
      this.replace({showProgress: false})
    },
    thumbnail(index) {
      return this.personImages[index]
    },
  }
}
</script>

<style scoped lang="scss">

</style>
