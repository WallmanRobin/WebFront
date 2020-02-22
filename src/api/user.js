import request from '@/utils/request'
import md5 from 'js-md5'

const secret_key = 'Flask_Backend'

export function login(data) {
  var base64 = require('js-base64').Base64
  const { username, password } = data
  var loginKey = base64.encode(secret_key + ':' + username + ':' + md5(secret_key + ':' + username + ':' + password))
  return request({
    url: '/authorize/login',
    method: 'post',
    data: { 'login_key': loginKey }
  })
}

export function getInfo() {
  return request({
    url: '/basicAuth/userInfo',
    method: 'get'
  })
}

export function logout() {
  return request({
    url: '/authorize/logout',
    method: 'post'
  })
}
