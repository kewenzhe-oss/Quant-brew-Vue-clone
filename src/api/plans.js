import request from '@/utils/request'

export function generatePlan (parameter) {
  return request({
    url: '/api/plans/generate',
    method: 'post',
    data: parameter
  })
}

export function savePlan (parameter) {
  return request({
    url: '/api/plans',
    method: 'post',
    data: parameter
  })
}

export function getPlans (params) {
  return request({
    url: '/api/plans',
    method: 'get',
    params
  })
}
