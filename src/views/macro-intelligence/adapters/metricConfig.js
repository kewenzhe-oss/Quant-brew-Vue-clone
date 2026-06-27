export const STALE_AFTER_DAYS = {
  daily: 3,
  weekly: 10,
  monthly: 45,
  quarterly: 120,
  irregular: 30
}

export const MACRO_METRIC_ALIASES = {
  fgi: 'fear_greed',
  cpi_yoy: 'cpi',
  dollar_index: 'dxy',
  us10y_yield: 'us10y',
  rrp_balance: 'rrp',
  financial_conditions_index: 'nfci',
  gdp_growth: 'gdp'
}

export const MACRO_METRIC_DISPLAY_SPEC = {
  fear_greed: { decimals: 0, unit: '/ 100', inlineUnit: '/100' },
  vix: { decimals: 2, unit: '' },
  dxy: { decimals: 2, unit: '' },
  us10y: { decimals: 2, unit: '%', inlineUnit: '%' },
  us2y: { decimals: 2, unit: '%', inlineUnit: '%' },
  '10y_2y_spread': { decimals: 2, unit: '%', inlineUnit: '%', showSign: true },
  rrp: { decimals: 1, unit: 'B USD', inlineUnit: 'B USD' },
  nfci: { decimals: 2, unit: '' },
  gdp: { decimals: 2, unit: '%', inlineUnit: '%', showSign: true },
  cpi: { decimals: 2, unit: '%', inlineUnit: '%' },
  pce_yoy: { decimals: 2, unit: '%', inlineUnit: '%' },
  core_pce_yoy: { decimals: 2, unit: '%', inlineUnit: '%' },
  breakeven_10y: { decimals: 2, unit: '%', inlineUnit: '%' },
  fed_balance_sheet: { decimals: 2, unit: 'T USD', inlineUnit: 'T USD' },
  us_net_liquidity: { decimals: 2, unit: 'T USD', inlineUnit: 'T USD' }
}

export const MACRO_OVERVIEW_TOP_METRICS = ['fear_greed', 'vix', 'dxy', 'us10y']

export const MACRO_OVERVIEW_DIMENSION_METRICS = {
  liquidity: ['dxy', 'rrp', 'nfci'],
  economy: ['gdp', 'us10y'],
  inflationRates: ['cpi', 'pce_yoy', 'core_pce_yoy', 'breakeven_10y'],
  sentiment: ['fear_greed', 'vix']
}

export const MACRO_OVERVIEW_BRANCH_METRICS = {
  liquidity: MACRO_OVERVIEW_DIMENSION_METRICS.liquidity,
  fundamentals: MACRO_OVERVIEW_DIMENSION_METRICS.economy,
  inflation: MACRO_OVERVIEW_DIMENSION_METRICS.inflationRates,
  sentiment: MACRO_OVERVIEW_DIMENSION_METRICS.sentiment
}

export function normalizeMacroMetricId (metricId) {
  return MACRO_METRIC_ALIASES[metricId] || metricId
}

export function isMacroMetricMissingValue (value) {
  return value === null || value === undefined || Number.isNaN(Number(value)) || value === '—' || value === '--'
}

export function getMacroMetricDisplaySpec (metricId) {
  const normalizedId = normalizeMacroMetricId(metricId)
  return MACRO_METRIC_DISPLAY_SPEC[metricId] || MACRO_METRIC_DISPLAY_SPEC[normalizedId] || {
    decimals: 2,
    unit: ''
  }
}

function formatFixedNumber (value, decimals, showSign = false) {
  const numericValue = Number(value)
  if (Number.isNaN(numericValue)) return '—'
  const formatted = numericValue.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })
  return showSign && numericValue > 0 ? `+${formatted}` : formatted
}

export function formatMacroMetricValue (metricId, value) {
  if (isMacroMetricMissingValue(value)) return '—'
  const spec = getMacroMetricDisplaySpec(metricId)
  return formatFixedNumber(value, spec.decimals, spec.showSign)
}

export function formatMacroMetricDisplayValue (metricId, value) {
  if (isMacroMetricMissingValue(value)) return '—'
  const spec = getMacroMetricDisplaySpec(metricId)
  const formattedValue = formatMacroMetricValue(metricId, value)
  if (!spec.inlineUnit) return formattedValue
  if (spec.inlineUnit === '%' || spec.inlineUnit.startsWith('/')) return `${formattedValue}${spec.inlineUnit}`
  return `${formattedValue} ${spec.inlineUnit}`
}

export function pickMacroMetrics (metricsMap, metricIds) {
  return metricIds.map(id => metricsMap[id]).filter(Boolean)
}

export const MACRO_METRIC_CONFIG = {
  fear_greed: {
    id: 'fear_greed',
    label: 'FGI',
    unit: '/ 100',
    source: 'CNN Business',
    frequency: 'daily',
    formatFn: (val) => formatMacroMetricValue('fear_greed', val),
    meaning: 'CNN Fear & Greed Index measures market emotion.',
    risingMeans: 'Market is becoming more greedy.',
    fallingMeans: 'Market is becoming more fearful.',
    riskAssetImplication: 'Extreme greed often precedes corrections; extreme fear may offer contrarian opportunities.'
  },
  vix: {
    id: 'vix',
    label: 'VIX',
    unit: '',
    source: 'CBOE / Yahoo Finance',
    frequency: 'daily',
    formatFn: (val) => formatMacroMetricValue('vix', val),
    meaning: 'CBOE Volatility Index representing market expectation of 30-day volatility.',
    risingMeans: 'Expected volatility and uncertainty are increasing.',
    fallingMeans: 'Market uncertainty is decreasing.',
    riskAssetImplication: 'High VIX usually correlates with market corrections; low VIX with steady rallies.'
  },
  dxy: {
    id: 'dxy',
    label: 'DXY',
    unit: '',
    source: 'Yahoo Finance',
    frequency: 'daily',
    formatFn: (val) => formatMacroMetricValue('dxy', val),
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
    formatFn: (val) => formatMacroMetricValue('us10y', val),
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
    formatFn: (val) => formatMacroMetricValue('us2y', val),
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
    formatFn: (val) => isMacroMetricMissingValue(val) ? '—' : formatFixedNumber(val, 2, true),
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
    formatFn: (val) => formatMacroMetricValue('rrp', val),
    meaning: 'Overnight Reverse Repurchase Agreements, acting as a liquidity drain/buffer.',
    risingMeans: 'Excess liquidity is being parked at the Fed.',
    fallingMeans: 'Liquidity is leaving the Fed, potentially entering the financial system.',
    riskAssetImplication: 'Depleting RRP acts as a liquidity tailwind for risk assets until it runs dry.'
  },
  nfci: {
    id: 'nfci',
    label: 'NFCI',
    unit: '',
    source: 'Chicago Fed / FRED',
    frequency: 'weekly',
    formatFn: (val) => formatMacroMetricValue('nfci', val),
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
    formatFn: (val) => formatMacroMetricValue('gdp', val),
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
    formatFn: (val) => formatMacroMetricValue('cpi', val),
    meaning: 'Consumer Price Index year-over-year change.',
    risingMeans: 'Inflation is accelerating.',
    fallingMeans: 'Inflation is decelerating.',
    riskAssetImplication: 'Rising inflation pressures the Fed to raise rates, which is generally negative for risk assets.'
  },
  pce_yoy: {
    id: 'pce_yoy',
    label: 'PCE YoY',
    unit: '%',
    source: 'BEA / FRED',
    frequency: 'monthly',
    formatFn: (val) => formatMacroMetricValue('pce_yoy', val),
    meaning: 'Personal Consumption Expenditures Price Index year-over-year.',
    risingMeans: 'Inflation as measured by PCE is accelerating.',
    fallingMeans: 'PCE inflation is decelerating toward the Fed target.',
    riskAssetImplication: "The Fed's preferred inflation gauge; above 2% limits rate-cut prospects."
  },
  core_pce_yoy: {
    id: 'core_pce_yoy',
    label: 'Core PCE YoY',
    unit: '%',
    source: 'BEA / FRED',
    frequency: 'monthly',
    formatFn: (val) => formatMacroMetricValue('core_pce_yoy', val),
    meaning: 'Core PCE (excl. food & energy) year-over-year, the Fed\'s most-watched inflation measure.',
    risingMeans: 'Underlying inflation trend is rising.',
    fallingMeans: 'Underlying inflation is easing toward the 2% target.',
    riskAssetImplication: 'Persistent core PCE above 2% keeps rate-cut expectations suppressed.'
  },
  breakeven_10y: {
    id: 'breakeven_10y',
    label: 'Breakeven 10Y',
    unit: '%',
    source: 'FRED (T10YIE)',
    frequency: 'daily',
    formatFn: (val) => formatMacroMetricValue('breakeven_10y', val),
    meaning: '10-Year Breakeven Inflation Rate — the bond market\'s consensus inflation expectation.',
    risingMeans: 'Bond traders expect higher long-run inflation.',
    fallingMeans: 'Inflation expectations are anchoring down.',
    riskAssetImplication: 'High breakeven rates can push nominal yields up and compress equity valuations.'
  },
  fed_balance_sheet: {
    id: 'fed_balance_sheet',
    label: 'Fed Balance Sheet',
    unit: 'T USD',
    source: 'FRED',
    frequency: 'weekly',
    formatFn: (val) => formatMacroMetricValue('fed_balance_sheet', val),
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
    formatFn: (val) => formatMacroMetricValue('us_net_liquidity', val),
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
export function formatMacroMetric (metricId, value, observationDateStr = null, sourceType = null, fetchedAtStr = null) {
  const normalizedMetricId = normalizeMacroMetricId(metricId)
  const displaySpec = getMacroMetricDisplaySpec(metricId)
  const config = MACRO_METRIC_CONFIG[metricId] || MACRO_METRIC_CONFIG[normalizedMetricId] || {
    id: metricId,
    label: metricId,
    unit: displaySpec.unit,
    source: 'Unknown',
    frequency: 'irregular',
    formatFn: (val) => formatMacroMetricValue(metricId, val),
    meaning: '',
    risingMeans: '',
    fallingMeans: '',
    riskAssetImplication: ''
  }

  const today = new Date()
  const latestDataDate = observationDateStr
  let isStale = false
  const staleAfterDays = STALE_AFTER_DAYS[config.frequency] || 30

  // 1. Determine staleness using fetched_at (backend refresh timestamp) if provided
  if (fetchedAtStr) {
    const fetchedAt = new Date(fetchedAtStr)
    const diffTime = Math.abs(today - fetchedAt)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    // Fallback/cached means we degraded, so always mark as stale
    if (sourceType === 'fallback' || sourceType === 'cached') {
      isStale = true
    } else {
      // Normal primary source sync: safe sync threshold is 5 days of no sync activity
      isStale = diffDays > 5
    }
  } else if (observationDateStr) {
    // 2. Fallback to legacy observation date difference if fetched_at is not provided
    const obsDate = new Date(observationDateStr)
    const diffTime = Math.abs(today - obsDate)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    isStale = diffDays > staleAfterDays
  }

  const isNull = isMacroMetricMissingValue(value)

  let formattedValue = '—'
  let primary = '—'
  let displayValue = '—'
  if (!isNull) {
    formattedValue = formatMacroMetricValue(metricId, Number(value))
    primary = formattedValue
    displayValue = formatMacroMetricDisplayValue(metricId, Number(value))
  }

  let status = 'missing'
  if (!isNull) {
    status = isStale ? 'stale' : 'available'
  }

  const dateDisplay = latestDataDate ? latestDataDate.split('T')[0] : 'Unknown Date'

  let freshnessLabel = ''
  if (status === 'missing') {
    freshnessLabel = 'Data unavailable'
  } else {
    // Capitalize frequency
    const freqCapitalized = config.frequency.charAt(0).toUpperCase() + config.frequency.slice(1)
    let sourcePrefix = config.source
    if (sourceType === 'fallback') {
      sourcePrefix += ' (Fallback Source)'
    } else if (sourceType === 'cached') {
      sourcePrefix += ' (Cached Snapshot)'
    }
    freshnessLabel = `${sourcePrefix} · ${freqCapitalized} · Data as of ${dateDisplay}`
    if (isStale) {
      freshnessLabel += ' · Stale'
    }
  }

  const statusLabel = isStale ? '数据滞后' : (status === 'missing' ? '数据暂不可用' : '正常')

  return {
    ...config,
    id: metricId,
    canonicalId: normalizedMetricId,
    unit: displaySpec.unit,
    value: isNull ? null : Number(value),
    formattedValue,
    primary,
    displayValue,
    displayUnit: isNull ? '' : displaySpec.unit,
    meta: freshnessLabel,
    latestDataDate,
    fetchedAt: fetchedAtStr,
    updatedAt: fetchedAtStr,
    status,
    staleAfterDays,
    isStale,
    freshnessLabel,
    statusLabel,
    sourceType: sourceType || 'primary'
  }
}

// Keep formatMacroValue for backwards compatibility while migrating
export function formatMacroValue (metricId, value, lastUpdated = null, sourceType = null, fetchedAt = null) {
  return formatMacroMetric(metricId, value, lastUpdated, sourceType, fetchedAt)
}
