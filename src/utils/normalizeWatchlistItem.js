/**
 * @typedef {Object} WatchlistDisplayItem
 * @property {string} symbol
 * @property {string} displayName
 * @property {string} assetType
 * @property {number} price
 * @property {number} changePercent
 * @property {number[]} sparklineData
 * @property {string} [folder]
 * @property {string[]} [riskTags]
 */

/**
 * Normalize crypto item raw data to WatchlistDisplayItem format.
 * @param {any} raw
 * @returns {WatchlistDisplayItem}
 */
export function normalizeCryptoItem(raw) {
  return {
    symbol: raw.symbol ?? raw.trading_pair ?? '',
    displayName: raw.displayName ?? raw.name ?? raw.baseAsset ?? '',
    assetType: 'Cryptocurrency',
    price: Number(raw.lastPrice ?? raw.price ?? raw.current_price ?? 0),
    changePercent: Number(
      raw.changePercent ??
      raw.priceChangePercent ??
      raw.percent_change_24h ??
      raw.change ??
      raw.pct_change ??
      0
    ),
    sparklineData: raw.sparklineData ?? raw.sparkline_in_7d?.price ?? [],
    folder: raw.folder ?? 'crypto',
    riskTags: raw.riskTags ?? [],
  }
}

/**
 * Normalize stock item raw data to WatchlistDisplayItem format.
 * @param {any} raw
 * @returns {WatchlistDisplayItem}
 */
export function normalizeStockItem(raw) {
  return {
    symbol: raw.symbol ?? raw.ticker ?? '',
    displayName: raw.displayName ?? raw.name ?? raw.companyName ?? '',
    assetType: 'US Stock',
    price: Number(raw.price ?? raw.latestPrice ?? raw.close ?? 0),
    changePercent: Number(
      raw.changePercent ??
      raw.changesPercentage ??
      raw.regularMarketChangePercent ??
      0
    ),
    sparklineData: raw.sparklineData ?? [],
    folder: raw.folder ?? 'stocks',
    riskTags: [],
  }
}
