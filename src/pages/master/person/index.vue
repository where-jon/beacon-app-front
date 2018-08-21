<template>
  <m-list :params="params" :list="persons" >
  </m-list>
</template>

<script>
import mList from '../../../components/list.vue'
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import * as AppServiceHelper from '../../../sub/helper/AppServiceHelper'
import { addLabelByKey } from '../../../sub/helper/ViewHelper'
import listmixinVue from '../../../components/listmixin.vue';

export default {
  components: {
    mList, 
  },
  mixins: [listmixinVue],
  data() {
    return {
      params: {
        name: 'person',
        id: 'personId',
        editPath: '/master/person/edit',
        appServicePath: '/basic/person',
        fields: addLabelByKey(this.$i18n, [ 
          {key: "personId", sortable: true },
          {key: "thumbnail" },
          {key: "personCd", sortable: true },
          {key: "personName", sortable: true },
          {key: "ruby", sortable: true},
          {key: "txId", sortable: true, 'class': 'text-center' },
          {key: "post" },
          {key: "actions", thStyle: {width:'130px !important'} }
        ]),
        initTotalRows: this.$store.state.app_service.persons.length
      }
    }
  },
  computed: {
    ...mapState('app_service', [
      'persons',
      'personImages',
    ]),
  },
  methods: {
    async fetchData(payload) {
      try {
        this.replace({showProgress: true})
        let persons = await AppServiceHelper.fetchList("/basic/person/withThumbnail")
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
      return this.$store.state.app_service.personImages[index]
    },
  }
}
</script>

<style scoped lang="scss">

</style>
