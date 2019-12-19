import request from '@/utils/request'

export function getRole(code, name) {
  return request({
    url: '/authorization/role',
    method: 'get',
    params: { code, name }
  })
}

export function getRoleRoutes(roles) {
  return request({
    url: '/basicAuth/roleRoutes',
    method: 'post',
    data: roles
  })
}

export function listEndpoints() {
  return request({
    url: '/authorization/endpoints',
    method: 'get'
  })
}

export function listRoles() {
  return request({
    url: '/authorization/roles',
    method: 'get'
  })
}

export function listMethods(endpoint) {
  return request({
    url: `/authorization/methods/${endpoint}`,
    method: 'get'
  })
}

export function updateRole(data) {
  return request({
    url: '/authorization/updateRole',
    method: 'post',
    data: data
  })
}

export function getRoleTreeData(role_code) {
  return request({
    url: `/authorization/roleTreeData/${role_code}`,
    method: 'get'
  })
}
