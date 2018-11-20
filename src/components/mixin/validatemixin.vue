
<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'

export default {
  methods: {
    concatNames(names){
      let allNames = ""
      for(let idx = 0; idx < names.length; idx++) {
        if(idx != 0){
          allNames = `${allNames}, `
        }
        allNames = `${allNames}${this.$i18n.tnl(`label.${names[idx]}`)}`
      }
      return allNames
    },
    validateRequire(param){
      if(!param.values.find((value) => value != null)){
        param.message = this.$i18n.tnl((1 < param.names.length? "message.requiredMore": "message.required"), {target: this.concatNames(param.names)})
        return param
      }
      return null
    },
    validateAsc(param){
      for(let idx = 0; idx < param.values.length - 1; idx++){
        if(param.values[idx] > param.values[idx + 1] ||
          (!param.equal && param.values[idx] == param.values[idx + 1])){
          param.message = this.$i18n.tnl("message.invalid", {target: this.concatNames(param.names)})
          return param
        }
      }
      return null
    },
    validateLess(param){
      let total = 0
      for(let idx = 0; idx < param.values.length; idx++){
        total += param.values[idx]
      }
      if(total > param.base || (!param.equal && total == param.base)){
        param.message = this.$i18n.tnl("message.invalidLessHours", {target: this.concatNames(param.names), max: param.displayBase? param.displayBase: param.base})
        return param
      }
      return null
    },
    validateCheck(params){
      const errors = []
      params.forEach((param) => {
        let result = null
        if(param.type == "require"){
          result = this.validateRequire(param)
        }
        else if(param.type == "asc"){
          result = this.validateAsc(param)
        }
        else if(param.type == "less"){
          result = this.validateLess(param)
        }
        if(result){
          errors.push(param)
        }
      })
      return errors
    },
    formatValidateMessage(errors){
      const errorMessages = errors.map((error) => error.message)
      return errorMessages.filter((errorMessage, index) => errorMessages.indexOf(errorMessage) == index).map((errorMessage) => errorMessage).join("<br>")
    },
  }
}
</script>
