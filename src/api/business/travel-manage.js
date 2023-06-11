import request from '@/utils/request'

export function getTripList(query) {
  return request({
    url: '/api/v1/xa-trip',
    method: 'get',
    params: query
  })
}

// 新增行程
export function addTrip(data) {
  return request({
    url: '/api/v1/xa-trip/add',
    method: 'post',
    data: data
  })
}

// 修改行程
export function updateTrip(data, id) {
  return request({
    url: '/api/v1/xa-trip/' + id,
    method: 'put',
    data
  })
}

// 删除行程
export function delTrip(data) {
  return request({
    url: '/api/v1/xa-trip',
    method: 'delete',
    data: data
  })
}

// 审核行程
// tripStatus 审核参数，2审核通过，3审核失败
export function reviewTrip(data, id) {
  return request({
    url: '/api/v1/xa-trip/review/' + id,
    method: 'post',
    data
  })
}
