import request from '@/utils/request'

export function listTrees() {
  return request({
    url: '/tree/listTrees',
    method: 'get'
  })
}

export function listNodes(ref_table, ref_code, ref_descr) {
  return request({
    url: '/tree/listNodes',
    method: 'get',
    params: { ref_table, ref_code, ref_descr }
  })
}

export function getTree(tree_code, name) {
  return request({
    url: '/tree/getTree',
    method: 'get',
    params: { tree_code, name }
  })
}

export function updateTree(data) {
  return request({
    url: '/tree/updateTree',
    method: 'post',
    data: data
  })
}
