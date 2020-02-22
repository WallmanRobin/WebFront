import request from '@/utils/request'

export function listTables() {
  return request({
    url: '/datatool/tables',
    method: 'get'
  })
}

export function getTable(name, descr) {
  return request({
    url: '/datatool/table',
    method: 'get',
    params: { name, descr }
  })
}

export function updateTable(data) {
  return request({
    url: '/datatool/updateTable',
    method: 'post',
    data: data
  })
}

export function getRefTable(name, descr) {
  return request({
    url: '/datatool/refTable',
    method: 'get'
  })
}

export function createTable(data) {
  return request({
    url: '/datatool/createTable',
    method: 'post',
    data: data
  })
}

export function dumpTable(data) {
  return request({
    url: '/datatool/dumpTable',
    method: 'post',
    data: data
  })
}
