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

export function updatePlanStatus (planId, action) {
  return request({
    url: `/api/plans/${planId}/status`,
    method: 'post',
    data: { action }
  })
}

export function getPlan (planId) {
  return request({
    url: `/api/plans/${planId}`,
    method: 'get'
  })
}

export function updatePlan (planId, data) {
  return request({
    url: `/api/plans/${planId}`,
    method: 'put',
    data: data
  })
}
