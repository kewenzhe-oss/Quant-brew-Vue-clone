import request from '@/utils/request'

const equityApi = {
  Info: '/api/equity/info',
  Quote: '/api/equity/quote',
  History: '/api/equity/history',
  Financials: '/api/equity/financials',
  Technicals: '/api/equity/technicals'
}

/**
 * Fetch company info and metadata
 * @param {string} symbol
 */
export function getEquityInfo (symbol) {
  return request({
    url: equityApi.Info,
    method: 'get',
    params: { symbol }
  })
}

/**
 * Fetch real-time or latest daily quote
 * @param {string} symbol
 */
export function getEquityQuote (symbol) {
  return request({
    url: equityApi.Quote,
    method: 'get',
    params: { symbol }
  })
}

/**
 * Fetch historical OHLCV data
 * @param {string} symbol
 * @param {string} period e.g. '6mo', '1y'
 * @param {string} interval e.g. '1d'
 */
export function getEquityHistory (symbol, period = '6mo', interval = '1d') {
  return request({
    url: equityApi.History,
    method: 'get',
    params: { symbol, period, interval }
  })
}

/**
 * Fetch financials (lazy load)
 * @param {string} symbol
 */
export function getEquityFinancials (symbol) {
  return request({
    url: equityApi.Financials,
    method: 'get',
    params: { symbol }
  })
}

/**
 * Fetch technical indicators (lazy load)
 * @param {string} symbol
 * @param {string} period
 */
export function getEquityTechnicals (symbol, period = '1y') {
  return request({
    url: equityApi.Technicals,
    method: 'get',
    params: { symbol, period }
  })
}
