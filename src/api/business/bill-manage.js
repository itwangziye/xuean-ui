import request from '@/utils/request'

export function getInvoiceList(query) {
  return request({
    url: '/api/v1/xa-invoice',
    method: 'get',
    params: query
  })
}

// 开票
export function addInvoice(data) {
  return request({
    url: '/api/v1/xa-invoice',
    method: 'post',
    data
  })
}



// 审核发票
export function reviewInvoice(data, id) {
  return request({
    url: '/api/v1/xa-invoice/review/' + id,
    method: 'post',  
    data
  })
}



// 删除发票
export function delInvoice(data) {
  return request({
    url: '/api/v1/xa-invoice',
    method: 'delete',
    data
  })
}
