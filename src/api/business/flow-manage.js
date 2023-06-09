import request from '@/utils/request'

export function getBillList(query) {
  return request({
    url: '/api/v1/xa-bill',
    method: 'get',
    params: query
  })
}

// 结算流水
export function addBill(data) {
  return request({
    url: '/api/v1/xa-bill',
    method: 'post',
    data
  })
}

// 通过id获取流水
export function getBillById(data, id) {
  return request({
    url: '/api/v1/xa-bill/' + id,
    method: 'gt',
    data
  })
}

// 修改流水
export function updateBill(data, id) {
  return request({
    url: '/api/v1/xa-bill/' + id,
    method: 'put',
    data
  })
}

// 删除流水
export function delBill(data) {
  return request({
    url: '/api/v1/xa-bill',
    method: 'delete',
    data
  })
}
// 审核流水
// billStatus 审核参数，2审核通过，3审核失败
export function reviewBill(data, id) {
  return request({
    url: '/api/v1/xa-bill/review/' + id,
    method: 'post',
    data
  })
}
