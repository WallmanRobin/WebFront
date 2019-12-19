import request from '@/utils/request'

export function listCartoonPortraits() {
  return request({
    url: '/util/cartoonPortraits',
    method: 'get'
  })
}
