<template>
  <div>
    <position :is-installation="true" />
  </div>
</template>

<script>
// import breadcrumb from '../../components/layout/breadcrumb.vue'
import position from '../main/position.vue'
import showmapmixin from '../../components/mixin/showmapmixin.vue'

export default {
  components: {
    position,
    // breadcrumb,
  },
  mixins: [showmapmixin],
  data () {
    return {
      items: [
        {
          text: this.$i18n.tnl('label.develop'),
          active: true
        },
        {
          text: this.$i18n.tnl('label.installation'),
          active: true
        },
      ],
    }
  },
  computed: {
  },
  methods: {
  },
}
</script>