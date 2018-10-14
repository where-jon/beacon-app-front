
<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'

export default {
  methods: {
    ...mapMutations('app_service', [
      'replaceAS', 
      'clear', 
    ]),
    ...mapMutations([
      'replace', 
    ]),
    ...mapMutations('main', [
      'replaceMain', 
    ]),
    ...mapMutations('monitor', [
      'replaceMonitor', 
    ]),
    ...mapMutations('setting', [
      'replaceSetting', 
    ]),
  }
}
</script>
