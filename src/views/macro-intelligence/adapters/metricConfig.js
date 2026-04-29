export const STALE_AFTER_DAYS = {
  daily: 3,
  weekly: 10,
  monthly: 45,
  quarterly: 120,
  irregular: 30
}

export const MACRO_METRIC_CONFIG = {
  fear_greed: {
    id: 'fear_greed',
    label: 'FGI',
    unit: '/ 100',
    source: 'CNN Business',
    frequency: 'daily',
    formatFn: (val) => val === null ? '—' : Math.round(val).toString(),
    meaning: 'CNN Fear & Greed Index measures market emotion.',
    risingMeans: 'Market is becoming more greedy.',
    fallingMeans: 'Market is becoming more fearful.',
    riskAssetImplication: 'Extreme greed often precedes corrections; extreme fear may offer contrarian opportunities.'
  },
  vix: {
    id: 'vix',
    label: 'VIX',
    unit: 'Index',
    source: 'CBOE / Yahoo Finance',
    frequency: 'daily',
    formatFn: (val) => val === null ? '—' : Number(val).toFixed(2),
    meaning: 'CBOE Volatility Index representing market expectation of 30-day volatility.',
    risingMeans: 'Expected volatility and uncertainty are increasing.',
    fallingMeans: 'Market uncertainty is decreasing.',
    riskAssetImplication: 'High VIX usually correlates with market corrections; low VIX with steady rallies.'
  },
  dxy: {
    id: 'dxy',
    label: 'DXY',
    unit: 'Index',
    source: 'Yahoo Finance',
    frequency: 'daily',
    formatFn: (val) => val === null ? '—' : Number(val).toFixed(2),
    meaning: 'US Dollar Index, measuring the value of USD relative to a basket of foreign currencies.',
    risingMeans: 'The US Dollar is strengthening.',
    fallingMeans: 'The US Dollar is weakening.',
    riskAssetImplication: 'A strong dollar typically pressures risk assets and emerging markets.'
  },
  us10y: {
    id: 'us10y',
    label: 'US10Y',
    unit: '%',
    source: 'FRED',
    frequency: 'daily',
    formatFn: (val) => val === null ? '—' : Number(val).toFixed(2),
    meaning: '10-Year US Treasury yield, a benchmark for borrowing costs.',
    risingMeans: 'Long-term borrowing costs are increasing.',
    fallingMeans: 'Long-term borrowing costs are decreasing.',
    riskAssetImplication: 'Rising yields often pressure growth stock valuations.'
  },
  us2y: {
    id: 'us2y',
    label: 'US2Y',
    unit: '%',
    source: 'FRED',
    frequency: 'daily',
    formatFn: (val) => val === null ? '—' : Number(val).toFixed(2),
    meaning: '2-Year US Treasury yield, highly sensitive to Fed policy.',
    risingMeans: 'Short-term rates and Fed expectations are rising.',
    fallingMeans: 'Short-term rates and Fed expectations are falling.',
    riskAssetImplication: 'Rising 2-year yields typically pressure risk assets.'
  },
  '10y_2y_spread': {
    id: '10y_2y_spread',
    label: '10Y-2Y Spread',
    unit: '%',
    source: 'Calculated from FRED US10Y and US2Y',
    frequency: 'daily',
    formatFn: (val) => val === null ? '—' : (val > 0 ? '+' : '') + Number(val).toFixed(2),
    meaning: 'Yield curve spread between 10-Year and 2-Year Treasuries.',
    risingMeans: 'Yield curve is steepening.',
    fallingMeans: 'Yield curve is flattening or inverting.',
    riskAssetImplication: 'Inversion (negative spread) historically precedes recessions.'
  },
  rrp: {
    id: 'rrp',
    label: 'RRP',
    unit: 'B USD',
    source: 'FRED',
    frequency: 'daily',
    formatFn: (val) => val === null ? '—' : Number(val).toFixed(1),
    meaning: 'Overnight Reverse Repurchase Agreements, acting as a liquidity drain/buffer.',
    risingMeans: 'Excess liquidity is being parked at the Fed.',
    fallingMeans: 'Liquidity is leaving the Fed, potentially entering the financial system.',
    riskAssetImplication: 'Depleting RRP acts as a liquidity tailwind for risk assets until it runs dry.'
  },
  nfci: {
    id: 'nfci',
    label: 'NFCI',
    unit: 'Index',
    source: 'Chicago Fed / FRED',
    frequency: 'weekly',
    formatFn: (val) => val === null ? '—' : Number(val).toFixed(2),
    meaning: 'National Financial Conditions Index.',
    risingMeans: 'Financial conditions are tightening.',
    fallingMeans: 'Financial conditions are loosening.',
    riskAssetImplication: 'Negative (loose) conditions support risk assets; positive (tight) conditions suppress them.'
  },
  gdp: {
    id: 'gdp',
    label: 'GDP Growth',
    unit: '%',
    source: 'BEA / FRED',
    frequency: 'quarterly',
    formatFn: (val) => val === null ? '—' : (val > 0 ? '+' : '') + Number(val).toFixed(2),
    meaning: 'US Gross Domestic Product annualized growth rate.',
    risingMeans: 'Economic output is expanding faster.',
    fallingMeans: 'Economic expansion is slowing or contracting.',
    riskAssetImplication: 'Strong growth supports corporate earnings but may trigger tighter monetary policy if too hot.'
  },
  cpi: {
    id: 'cpi',
    label: 'CPI YoY',
    unit: '%',
    source: 'BLS / FRED',
    frequency: 'monthly',
    formatFn: (val) => val === null ? '—' : Number(val).toFixed(2),
    meaning: 'Consumer Price Index year-over-year change.',
    risingMeans: 'Inflation is accelerating.',
    fallingMeans: 'Inflation is decelerating.',
    riskAssetImplication: 'Rising inflation pressures the Fed to raise rates, which is generally negative for risk assets.'
  },
  fed_balance_sheet: {
    id: 'fed_balance_sheet',
    label: 'Fed Balance Sheet',
    unit: 'T USD',
    source: 'FRED',
    frequency: 'weekly',
    formatFn: (val) => val === null ? '—' : Number(val).toFixed(2),
    meaning: 'Total assets held by the Federal Reserve.',
    risingMeans: 'The Fed is injecting liquidity (QE).',
    fallingMeans: 'The Fed is draining liquidity (QT).',
    riskAssetImplication: 'Balance sheet expansion is highly supportive for risk assets.'
  },
  us_net_liquidity: {
    id: 'us_net_liquidity',
    label: 'US Net Liquidity',
    unit: 'T USD',
    source: 'Calculated (FRED)',
    frequency: 'weekly',
    formatFn: (val) => val === null ? '—' : Number(val).toFixed(2),
    meaning: 'Fed Balance Sheet minus TGA minus RRP.',
    risingMeans: 'Net liquidity available to financial markets is increasing.',
    fallingMeans: 'Net liquidity is decreasing.',
    riskAssetImplication: 'Strong positive correlation with risk asset performance (e.g., S&P 500, Bitcoin).'
  }
}

/**
 * Normalizes raw macro data into a strict schema
 * @param {string} metricId 
 * @param {number|null} value 
 * @param {string|null} fetchedAtStr - ISO string date
 * @returns {MacroMetric}
 */
export function formatMacroMetric(metricId, value, fetchedAtStr = null) {
  const config = MACRO_METRIC_CONFIG[metricId] || {
    id: metricId,
    label: metricId,
    unit: '',
    source: 'Unknown',
    frequency: 'irregular',
    formatFn: (val) => val === null ? '—' : String(val),
    meaning: '',
    risingMeans: '',
    fallingMeans: '',
    riskAssetImplication: ''
  }

  const today = new Date()
  let latestDataDate = null
  let fetchedAt = null
  let isStale = false
  let staleAfterDays = STALE_AFTER_DAYS[config.frequency] || 30

  if (fetchedAtStr) {
    fetchedAt = new Date(fetchedAtStr)
    latestDataDate = fetchedAtStr
  }

  if (fetchedAt) {
    const diffTime = Math.abs(today - fetchedAt)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    isStale = diffDays > staleAfterDays
  }

  const isNull = value === null || value === undefined || Number.isNaN(Number(value)) || value === '—' || value === '--'
  
  let formattedValue = '—'
  let primary = '—'
  if (!isNull) {
     formattedValue = config.formatFn(Number(value))
     primary = formattedValue
  }

  let status = 'missing'
  if (!isNull) {
    status = isStale ? 'stale' : 'available'
  }

  let dateDisplay = latestDataDate ? latestDataDate.split('T')[0] : 'Unknown Date'
  
  let freshnessLabel = ''
  if (status === 'missing') {
    freshnessLabel = 'Data unavailable'
  } else {
    // Capitalize frequency
    const freqCapitalized = config.frequency.charAt(0).toUpperCase() + config.frequency.slice(1)
    freshnessLabel = `${config.source} · ${freqCapitalized} · Data as of ${dateDisplay}`
    if (isStale) {
      freshnessLabel += ' · Stale'
    }
  }

  let statusLabel = isStale ? '数据滞后' : (status === 'missing' ? '数据暂不可用' : '正常')

  return {
    ...config,
    value: isNull ? null : Number(value),
    formattedValue,
    primary,
    displayUnit: isNull ? '' : config.unit,
    meta: freshnessLabel,
    latestDataDate,
    fetchedAt: fetchedAtStr,
    updatedAt: fetchedAtStr,
    status,
    staleAfterDays,
    isStale,
    freshnessLabel,
    statusLabel
  }
}

// Keep formatMacroValue for backwards compatibility while migrating
export function formatMacroValue(metricId, value, lastUpdated = null) {
  return formatMacroMetric(metricId, value, lastUpdated)
}
