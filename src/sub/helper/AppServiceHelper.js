import _ from 'lodash'
import { DEV, APP_SERVICE } from '../constant/config'
import * as mock from '../../assets/mock/mock'
import { sleep } from '../util/Util'
import * as HttpHelper from './HttpHelper'

export const fetchList = async (target) => {
    let data = DEV.USE_MOCK_POS? mock[target]:
        await HttpHelper.getAppService(target + "?_=" + new Date().getTime())
        return _(data)
    .compact().value()
}

export const fetch = async (target, id) => {
    const path = target + "/"
    let data = DEV.USE_MOCK_POS? mock[path + id]:
        await HttpHelper.getAppService(path + id + "?_=" + new Date().getTime())
    return data
}

export const save = async (target, entity) => {
    const path = target + "/save/"
    var params = new URLSearchParams()
    _.forEach(entity, (value, key) => {
        params.append(key, value || '')
    })

    let data = DEV.USE_MOCK_POS? mock[target]:
        await HttpHelper.postAppService(path + "?_=" + new Date().getTime(), params)

    return data
}

export const bulkSave = async (target, entities, updateOnlyNN = 0) => {
    const path = target + "/bulkSave/?updateOnlyNN=" + updateOnlyNN + "&_=" + new Date().getTime()
    let data = DEV.USE_MOCK_POS? mock[target]:
        await HttpHelper.postAppService(path, entities)

    return data
}

export const deleteEntity = async (target, id) => {
    const path = target + "/delete/"
    let data = DEV.USE_MOCK_POS? mock[path + id]:
        await HttpHelper.getAppService(path + id + "?_=" + new Date().getTime())
    return data
}
