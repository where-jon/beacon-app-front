<template>
  <div class="container-fluid">
    <!-- searchbox -->
    <b-row>
      <b-col md="6" class="my-1">
        <b-form-group horizontal class="mb-0" :label="$t('label.filter') ">
          <b-input-group>
            <b-form-input v-model="filter" />
            <b-input-group-append>
              <b-btn :disabled="!filter" @click="filter=''" variant="secondary" v-t="'label.clear'"></b-btn>
            </b-input-group-append>
          </b-input-group>
        </b-form-group>
      </b-col>
      <b-col class="mb-2 justify-content-end">
        <b-button variant='outline-primary' @click="edit()" v-t="'label.createNew'"  class="float-right"/>
      </b-col>
    </b-row>

    <slot></slot>

    <b-row class="mt-3">
    </b-row>
  
    <!-- table -->
    <b-table show-empty stacked="md" striped hover :items="list" :fields="fields" :current-page="currentPage" :per-page="perPage" outlined
            :filter="filter" @filtered="onFiltered">
      <template slot="actions" slot-scope="row">
        <b-button size="sm" @click.stop="edit(row.item, row.index, $event.target)" variant="outline-primary" class="mr-2 my-1" v-t="'label.' + crud" />
        <b-button v-if="isEditable" size="sm" @click.stop="deleteConfirm(row.item, row.index, $event.target)" variant="outline-danger" class="mr-1" v-t="'label.delete'" />
      </template>
      <template slot="thumbnail" slot-scope="row">
        <img v-if="thumbnail(row.index)" :src="thumbnail(row.index)" width="100" />
      </template>
    </b-table>

    <!-- pager -->
    <b-row>
      <b-col md="6" class="my-1">
        <b-pagination :total-rows="totalRows" :per-page="perPage" v-model="currentPage" class="my-0" />
      </b-col>
    </b-row>

    <!-- modal -->
    <b-modal id="modalInfo" @hide="resetModal" :title="modalInfo.title" @ok="execDelete(modalInfo.id)">
      <pre>{{ modalInfo.content }}</pre>
    </b-modal>
  </div>
</template>

<script>

import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import * as AppServiceHelper from '../sub/helper/AppServiceHelper'
import { addLabelByKey } from '../sub/helper/ViewHelper'
import { EventBus } from '../sub/helper/EventHelper'
import * as MenuHelper from '../sub/helper/MenuHelper'

export default {
  props: ['params', 'list'],
  data() {
    return {
      currentPage: 1,
      perPage: 10,
      filter: null,
      modalInfo: { title: '', content: '', id:'' },
      totalRows: this.initTotalRows,
      ...this.params
    }
  },
  computed: {
    crud() {
      return !this.isEditable? 'refer':  'update'
    },
    isEditable() {
      return MenuHelper.isEditable(this.appServicePath)
    },
    ...mapState([
      'featureList',
    ]),
  },
  mounted() {
    this.$parent.$options.methods.fetchData.apply(this.$parent)
    this.replace({title: this.$i18n.t('label.' + this.name) + this.$i18n.t('label.list')})
  },
  methods: {
    ...mapMutations([
      'replace', 
    ]),
    ...mapMutations('app_service', [
      'replaceAS', 
    ]),
    thumbnail(index) {
      return this.$parent.$options.methods.thumbnail.call(this.$parent, index)
    },
    async edit(item, index, target) {
      console.log({item, index, target})
      let list = item != null? await AppServiceHelper.fetch(this.appServicePath, item[this.id]): {}
      this.replaceAS({[this.name]: list})
      this.$router.push(this.editPath)
    },
    deleteConfirm(item, index, button) {
      this.modalInfo.title = this.$i18n.t('label.confirm')
      this.modalInfo.content = this.$i18n.t('message.deleteConfirm', {target: "ID:" + item[this.id]})
      this.modalInfo.id = item[this.id]
      this.$root.$emit('bv::show::modal', 'modalInfo', button)
    },
    resetModal () {
      this.modalInfo.title = ''
      this.modalInfo.content = ''
      this.modalInfo.id = ''
    },
    onFiltered(filteredItems) {
      this.totalRows = filteredItems.length
      this.currentPage = 1
    },
    async execDelete(id) {
      await AppServiceHelper.deleteEntity(this.appServicePath, id)
      this.$parent.$options.methods.fetchData.apply(this.$parent)
    }
  }
}

</script>

<style>
</style>
