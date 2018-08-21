<template>
  <b-container fluid>
    <!-- User Interface controls -->
    <b-row>
      <b-col md="6" class="my-1">
        <b-form-group horizontal label="Filter" class="mb-0">
          <b-input-group>
            <b-form-input v-model="filter" />
            <b-input-group-append>
              <b-btn :disabled="!filter" @click="filter = ''">Clear</b-btn>
            </b-input-group-append>
          </b-input-group>
        </b-form-group>
      </b-col>
    </b-row>
    <p></p>

    <!-- Main table element -->
    <b-table show-empty stacked="md" :items="items" :fields="fields"
             :current-page="currentPage" :per-page="perPage"
             :filter="filter" @filtered="onFiltered" >
      <template slot="actions" slot-scope="row">
        <b-button size="sm" @click.stop="info(row.item, row.index, $event.target)" class="mr-1">Edit</b-button>
        <b-button size="sm" @click.stop="info(row.item, row.index, $event.target)" class="mr-1">Delete</b-button>
      </template>
    </b-table>

    <b-row>
      <b-col md="6" class="my-1">
        <b-pagination :total-rows="totalRows" :per-page="perPage" v-model="currentPage" class="my-0" />
      </b-col>
    </b-row>

    <!-- Info modal -->
    <b-modal id="modalInfo" @hide="resetModal" :title="modalInfo.title" @ok="handleOk">
      <pre>{{ modalInfo.content }}</pre>
    </b-modal>

  </b-container>
</template>

<script>
const items = [
  { Hoge: true, age: 40, name: 'Dickerson Macdonald' },
  { Hoge: false, age: 21, name: 'Larsen Shaw' },
  {
    Hoge: false,
    age: 9,
    name: 'Mini Navarro',
    _rowVariant: 'success'
  },
  { Hoge: false, age: 89, name: 'Geneva Wilson' },
  { Hoge: true, age: 38, name: 'Jami Carney' },
  { Hoge: false, age: 27, name: 'Essie Dunlap' },
  { Hoge: true, age: 40, name: 'Thor Macdonald' },
  {
    Hoge: true,
    age: 87,
    name: 'Larsen Shaw',
    _cellVariants: { age: 'danger', Hoge: 'warning' }
  },
  { Hoge: false, age: 26, name: 'Mitzi Navarro' },
  { Hoge: false, age: 22, name: 'Genevieve Wilson' },
  { Hoge: true, age: 38, name: 'John Carney' },
  { Hoge: false, age: 29, name: 'Dick Dunlap' }
]

export default {
  data () {
    return {
      items: items,
      fields: [
        { key: 'name', label: 'Person Full name', sortable: true, sortDirection: 'asc' },
        { key: 'age', label: 'Person age', sortable: true, 'class': 'text-center' },
        { key: 'Hoge', label: 'is Active' },
        { key: 'actions', label: 'Actions' }
      ],
      currentPage: 1,
      perPage: 10,
      totalRows: items.length,
      sortBy: null,
      sortDesc: false,
      sortDirection: 'asc',
      filter: null,
      modalInfo: { title: '', content: '' }
    }
  },
  methods: {
    info (item, index, button) {
      this.modalInfo.title = `Row index: ${index}`
      this.modalInfo.content = JSON.stringify(item, null, 2)
      this.$root.$emit('bv::show::modal', 'modalInfo', button)
    },
    resetModal () {
      this.modalInfo.title = ''
      this.modalInfo.content = ''
    },
    onFiltered (filteredItems) {
      // Trigger pagination to update the number of buttons/pages due to filtering
      this.totalRows = filteredItems.length
      this.currentPage = 1
    },
    handleOk() {
        alert()
    }
  }
}
</script>

<!-- table-complete-1.vue -->