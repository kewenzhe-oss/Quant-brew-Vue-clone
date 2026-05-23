// Deprecated: use src/api/auth.js instead.
import request from '@/utils/request'
export { login, logout, getUserInfo, getInfo } from './auth'

export function getCurrentUserNav () {
  return request({
    url: '/user/nav',
    method: 'get'
  })
}
