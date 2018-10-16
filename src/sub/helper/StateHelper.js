import _ from 'lodash'
import * as AppServiceHelper from './AppServiceHelper'


// TODO: 全体的にState管理を共通化する

let store

export const setApp = (pStore) => {
    store = pStore
}

const loadAppState = async (target, path, sort, force) => {
  let arr = store.state.app_service[target]
  if (arr.length == 0 || force) {
    arr = await AppServiceHelper.fetchList(path, sort)
    store.commit('app_service/replaceAS', {[target]:arr})
  }
}

export const loadSensors = async (force) => {
  await loadAppState('sensors', '/core/sensor', 'sensorId', force)
}

export const loadRegions = async (force) => {
  await loadAppState('regions', '/meta/region', 'regionId', force)
}

export const loadAreas = async (force) => {
  await loadAppState('areas', '/core/area/withImage', 'areaId', force)
}

export const loadExbs = async (force) => {
  await loadAppState('exbs', '/core/exb', 'exbId', force)
}

export const loadTxs = async (force) => {
  await loadAppState('txs', '/core/tx', 'txId', force)
}

export const loadPots = async (force) => {
  await loadAppState('pots', '/basic/pot', 'potId', force)
}

export const loadCategorys = async (force) => {
  await loadAppState('categories', '/basic/category', 'categoryId', force)
}

export const loadGroups = async (force) => {
  await loadAppState('groups', '/basic/group', 'groupId', force)
}

export const loadUsers = async (force) => {
  await loadAppState('users', '/basic/user', 'userId', force)
}

export const loadRoles = async (force) => {
  await loadAppState('roles', '/basic/role', 'roleId', force)
}

