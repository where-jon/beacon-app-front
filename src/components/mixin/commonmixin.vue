
<script>
import { mapMutations, mapActions } from 'vuex'
import { CATEGORY } from '../../sub/constant/Constants'
import * as HtmlUtil from '../../sub/util/HtmlUtil'
import * as OptionHelper from '../../sub/helper/OptionHelper'

export default {
  computed: {
    iosOrAndroid() {
      return HtmlUtil.isAndroidOrIOS()
    },
    groupOptions() {
      return OptionHelper.getGroupOptions()
    },
    categoryOptions() {
      return OptionHelper.getCategoryOptions(CATEGORY.POT_AVAILABLE)
    },
  },
  methods: {
    ...mapMutations('app_service', [
      'replaceAS', 
      'clear', 
    ]),
    ...mapMutations([
      'replace', 
    ]),
    ...mapActions([
      'showErrorModal'
    ]),
    ...mapMutations('main', [
      'replaceMain', 
    ]),
    ...mapMutations('setting', [
      'replaceSetting', 
    ]),
    ...mapActions([
      'showProgress',
      'hideProgress',
    ]),
  }
}
</script>
