import request from '@/utils/request'

export function getUserRoles(code, name) {
  return request({
    url: '/authorization/userRoles',
    method: 'get',
    params: { code, name }
  })
}

export function getUser(user_code, name) {
  return request({
    url: '/authorization/user',
    method: 'get',
    params: { user_code, name }
  })
}

export function listUsers() {
  return request({
    url: '/authorization/listUsers',
    method: 'get'
  })
}

export function updateUser(data) {
  return request({
    url: '/authorization/updateUser',
    method: 'Post',
    data: data
  })
}

export function setPassword(data) {
  return request({
    url: '/authorization/setPassword',
    method: 'Post',
    data: data
  })
}

export function pushUserAvatar(data) {
  return request({
    url: '/authorization/pushUserAvatar',
    method: 'Post',
    data: data
  })
}
