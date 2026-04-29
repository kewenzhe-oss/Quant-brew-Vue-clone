import { getMacroSection } from '@/api/global-market'
import { formatMacroMetric } from './metricConfig'
import axios from 'axios'

export async function getMacroViewModel () {
  const briefing = {
    generated_at: new Date().toISOString(),
    confidence_level: 'Insufficient Data',
    data_completeness: 0,
    headline: '数据校验中...',
    core_judgment: '正在同步底层宏观指标，请稍后。',
    risk_asset_implication: '数据盲区期，暂无可靠的资产配置建议。',
    top_metrics: [],
    dimensions: {
      liquidity: { title: '流动性', verdict: 'Neutral', summary: '数据暂不可用。', key_metrics: [],
        provenance: { statusSource: 'static', summarySource: 'static', basedOnMetricIds: ['nfci', 'rrp'], updatedAt: null, confidence: 'Unknown' },
        posture: { section: 'liquidity', posture: 'neutral', reason: '底层指标载入中，暂无法评估流动性姿态。', watchPoint: '关注 NFCI 是否维持负值区间。', basedOnMetricIds: ['nfci', 'rrp'], source: 'rule_based' }
      },
      economy: { title: '经济', verdict: 'Neutral', summary: '数据暂不可用。', key_metrics: [],
        provenance: { statusSource: 'static', summarySource: 'static', basedOnMetricIds: ['gdp'], updatedAt: null, confidence: 'Unknown' },
        posture: { section: 'economy', posture: 'neutral', reason: '底层指标载入中，暂无法评估经济姿态。', watchPoint: '关注 GDP 增速是否维持正值。', basedOnMetricIds: ['gdp'], source: 'rule_based' }
      },
      inflationRates: { title: '通胀与利率', verdict: 'Neutral', summary: '数据暂不可用。', key_metrics: [],
        provenance: { statusSource: 'static', summarySource: 'static', basedOnMetricIds: ['cpi', 'us10y'], updatedAt: null, confidence: 'Unknown' },
        posture: { section: 'inflation_rates', posture: 'neutral', reason: '底层指标载入中，暂无法评估利率姿态。', watchPoint: '关注 US10Y 是否突破 4.5% 关键位。', basedOnMetricIds: ['cpi', 'us10y'], source: 'rule_based' }
      },
      sentiment: { title: '市场情绪', verdict: 'Neutral', summary: '数据暂不可用。', key_metrics: [],
        provenance: { statusSource: 'static', summarySource: 'static', basedOnMetricIds: ['fear_greed', 'vix'], updatedAt: null, confidence: 'Unknown' },
        posture: { section: 'sentiment', posture: 'neutral', reason: '底层指标载入中，暂无法评估情绪姿态。', watchPoint: '关注 FGI 是否进入极端贪婪区间（>70）。', basedOnMetricIds: ['fear_greed', 'vix'], source: 'rule_based' }
      }
    },
    tailwinds: [],
    headwinds: [],
    what_changed: [],
    what_to_watch: [],
    missing_data: [],
    warnings: [],
    loading: true,
    isEmpty: true,
    health: {
      status: 'healthy',
      missingMetrics: [],
      staleMetrics: [],
      fallbackMetrics: [],
      latestGeneratedAt: null,
      aiSummaryStatus: 'fresh'
    },
    provenance: {
      isAIGenerated: false
    },
    riskPostureSummary: {
      overallPosture: '数据载入中',
      mainSupports: [],
      mainPressures: [],
      todayWatchPoint: ''
    },
    genericAssetImpact: []
  }

  let aiData = null

  // Attempt to fetch AI Briefing First
  try {
    const aiRes = await axios.get('/api/global-market/briefing/latest')
    if (aiRes.data && aiRes.data.code === 1 && aiRes.data.data) {
      aiData = aiRes.data.data
      
      // Determine True AI Provenance
      if (aiData.model && aiData.generatedAt) {
        briefing.provenance.isAIGenerated = true
        briefing.health.aiSummaryStatus = 'fresh'
      } else {
        briefing.provenance.isAIGenerated = false
        briefing.health.aiSummaryStatus = 'degraded' // Mock or fallback
      }
      
      const sourceKey = briefing.provenance.isAIGenerated ? 'ai_generated' : 'mock_ai'

      briefing.generated_at = aiData.generatedAt || briefing.generated_at
      briefing.health.latestGeneratedAt = briefing.generated_at
      briefing.confidence_level = aiData.overall?.confidence || 'Unknown'
      briefing.headline = aiData.overall?.tone || '规则摘要 · AI 暂不可用'
      briefing.core_judgment = aiData.overall?.summary || ''
      briefing.risk_asset_implication = aiData.overall?.riskAssetImplication || ''
      
      if (aiData.sections) {
        if (aiData.sections.liquidity) {
          briefing.dimensions.liquidity.verdict = aiData.sections.liquidity.statusLabel
          briefing.dimensions.liquidity.summary = aiData.sections.liquidity.summary
          briefing.dimensions.liquidity.provenance.summarySource = sourceKey
        }
        if (aiData.sections.economy) {
          briefing.dimensions.economy.verdict = aiData.sections.economy.statusLabel
          briefing.dimensions.economy.summary = aiData.sections.economy.summary
          briefing.dimensions.economy.provenance.summarySource = sourceKey
        }
        if (aiData.sections.inflationRates) {
          briefing.dimensions.inflationRates.verdict = aiData.sections.inflationRates.statusLabel
          briefing.dimensions.inflationRates.summary = aiData.sections.inflationRates.summary
          briefing.dimensions.inflationRates.provenance.summarySource = sourceKey
        }
        if (aiData.sections.sentiment) {
          briefing.dimensions.sentiment.verdict = aiData.sections.sentiment.statusLabel
          briefing.dimensions.sentiment.summary = aiData.sections.sentiment.summary
          briefing.dimensions.sentiment.provenance.summarySource = sourceKey
        }
      }
      
      briefing.isEmpty = false
    }
  } catch (err) {
    console.warn('AI Briefing not available, falling back to rule-based logic:', err.message)
    briefing.health.aiSummaryStatus = 'failed'
    briefing.warnings.push('规则摘要 · AI 暂不可用不可用，已回退至本地规则引擎。')
  }

  try {
    const [liqRes, ecoRes, infRes, sentRes] = await Promise.allSettled([
      getMacroSection('liquidity'),
      getMacroSection('economy'),
      getMacroSection('inflation_rates'),
      getMacroSection('sentiment')
    ])

    const liqData = liqRes.status === 'fulfilled' ? (liqRes.value?.data || {}) : {}
    const ecoData = ecoRes.status === 'fulfilled' ? (ecoRes.value?.data || {}) : {}
    const infData = infRes.status === 'fulfilled' ? (infRes.value?.data || {}) : {}
    const sentData = sentRes.status === 'fulfilled' ? (sentRes.value?.data || {}) : {}

    // 1. Raw Data Extraction & Formatting using formatMacroMetric
    const metricsMap = {
      fear_greed: formatMacroMetric('fear_greed', sentData.fear_greed?.value, sentData.fear_greed?.date),
      vix: formatMacroMetric('vix', sentData.vix?.value, sentData.vix?.date),
      dxy: formatMacroMetric('dxy', sentData.dxy?.value, sentData.dxy?.date),
      us10y: formatMacroMetric('us10y', infData.us10y_yield?.value, infData.us10y_yield?.date),
      rrp: formatMacroMetric('rrp', liqData.rrp_balance?.value, liqData.rrp_balance?.date),
      nfci: formatMacroMetric('nfci', liqData.nfci?.value, liqData.nfci?.date),
      gdp: formatMacroMetric('gdp', ecoData.gdp_growth?.value, ecoData.gdp_growth?.date),
      cpi: formatMacroMetric('cpi', infData.cpi_yoy?.value, infData.cpi_yoy?.date)
    }

    const expectedMetrics = Object.keys(metricsMap)
    
    // Check Health
    for (const key of expectedMetrics) {
      const m = metricsMap[key]
      if (m.status === 'missing') {
        briefing.health.missingMetrics.push(key)
      } else if (m.status === 'stale') {
        briefing.health.staleMetrics.push(key)
      }
    }

    briefing.missing_data = briefing.health.missingMetrics
    briefing.data_completeness = (expectedMetrics.length - briefing.missing_data.length) / expectedMetrics.length

    if (briefing.health.missingMetrics.length > 0) {
      briefing.health.status = 'degraded'
    } else if (briefing.health.staleMetrics.length > 0) {
      briefing.health.status = 'stale'
    }

    if (briefing.data_completeness > 0) {
      briefing.isEmpty = false
    }

    // AI Validation Logic
    const validateAIItems = (items) => {
      if (!items) return []
      return items.filter(item => {
        if (!item.metricIds || item.metricIds.length === 0) return true // Allow general statements
        // Check if any referenced metric is missing
        const hasMissing = item.metricIds.some(id => metricsMap[id] && metricsMap[id].status === 'missing')
        return !hasMissing // Filter out if it relies on completely missing data
      })
    }

    if (aiData) {
      if (aiData.whatChanged) {
        briefing.what_changed = validateAIItems(aiData.whatChanged).map(item => ({
          label: item.title,
          desc: item.description,
          evidence_metric_ids: item.metricIds || []
        }))
      }
      if (aiData.whatToWatch) {
        briefing.what_to_watch = validateAIItems(aiData.whatToWatch).map(item => ({
          label: item.title,
          desc: item.description,
          evidence_metric_ids: item.metricIds || []
        }))
      }
      if (aiData.drivers) {
        briefing.tailwinds = validateAIItems(aiData.drivers.supportive).map(item => ({
          desc: item.text,
          evidence_metric_ids: item.metricIds || []
        }))
        briefing.headwinds = validateAIItems(aiData.drivers.suppressive).map(item => ({
          desc: item.text,
          evidence_metric_ids: item.metricIds || []
        }))
      }
    }

    // 2. Confidence Level Fallback
    if (briefing.data_completeness >= 0.8) {
      if (briefing.confidence_level === 'Unknown' || briefing.confidence_level === 'Insufficient Data') {
        briefing.confidence_level = 'High'
      }
    } else if (briefing.data_completeness >= 0.5) {
      if (briefing.confidence_level === 'Unknown' || briefing.confidence_level === 'Insufficient Data') {
        briefing.confidence_level = 'Medium'
      }
      briefing.warnings.push('部分底层宏观指标缺失，研判置信度有所下降。')
    } else {
      if (briefing.confidence_level === 'Unknown' || briefing.confidence_level === 'Insufficient Data') {
        briefing.confidence_level = 'Low'
      }
      briefing.warnings.push('核心指标缺失严重，当前的宏观判断仅供参考。')
    }

    // 3. Deterministic Stance Rules (Fallback only if AI didn't set headline)
    if (briefing.headline === '数据校验中...' || briefing.headline === 'AI Briefing Active') {
      const fgiRaw = metricsMap.fear_greed.value
      const vixRaw = metricsMap.vix.value
      
      if (fgiRaw !== null) {
        if (fgiRaw >= 75) {
          briefing.headline = '防守反击 / 极度贪婪'
          briefing.core_judgment = '市场情绪极度亢奋，追高风险极大，需警惕动能衰竭后的均值回归。'
          briefing.risk_asset_implication = '当前情绪偏熱，不宜追高建立新仓位，可逐步确认既有计划的執行節奏。'
        } else if (fgiRaw > 55) {
          briefing.headline = '偏向进攻 / 顺势而为'
          briefing.core_judgment = '风险资产动能维持强势，流动性环境与市场情绪均支持估值进一步扩张。'
          briefing.risk_asset_implication = '当前宏观條件支持维持既定风险敞口，不宜因短期噪音频繁改变计划。'
        } else if (fgiRaw <= 25) {
          briefing.headline = '左侧吸筹 / 极度恐慌'
          briefing.core_judgment = '系统性避险需求激增，资产遭到无差别抛售，市场陷入左侧出清阶段。'
          briefing.risk_asset_implication = '当前环境下，高Beta资产短期波动容错率较低；长期资金可依计划分批執行，但需确认资金缓冲充足。'
        } else if (fgiRaw < 45) {
          briefing.headline = '动态防御 / 情绪降温'
          briefing.core_judgment = '市场动能趋缓，避险资金开始回流美元和短债等安全资产。'
          briefing.risk_asset_implication = '当前动能轉弱，应确认既定计划是否仍在可容忍的執行節奏內，不宜情绪化加速或縮減。'
        } else {
          briefing.headline = '中性博弈 / 震荡市'
          briefing.core_judgment = '宏观多空因素互相交织，市场缺乏明确方向指引，处于区间震荡格局。'
          briefing.risk_asset_implication = '宏观多空讯号交織，维持计划既定配置比例，減少无主线的频繁调仓。'
        }
      } else if (vixRaw !== null) {
        briefing.warnings.push('FGI 数据缺失，已降级使用 VIX 进行单一维度情绪评估。')
        if (vixRaw > 30) {
          briefing.headline = '情绪高度恐慌 / 风险规避'
          briefing.core_judgment = '波动率飙升，市场正为不可预知的尾部风险定价。'
          briefing.risk_asset_implication = '波动率显着上升，应确认既定计划是否仍在容忍範圍內，优先保障流动性安全。'
        } else if (vixRaw > 20) {
          briefing.headline = '中性偏谨慎 / 波动抬升'
          briefing.core_judgment = '隐含波动率小幅走高，市场防守意愿增强。'
          briefing.risk_asset_implication = '隐含波动率走高，高波动资产的短期容错率下降，可依计划调整執行節奏。'
        } else {
          briefing.headline = '正常波动区间 / 情绪平稳'
          briefing.core_judgment = 'VIX 处于低位，市场对软着陆或流动性宽松抱有确定性预期。'
          briefing.risk_asset_implication = '当前宏观條件支持维持正常敞口，不宜使用杠杆放大风险。'
        }
      } else {
        briefing.headline = '数据不足，判断降级'
        briefing.core_judgment = '核心情绪与波动率指标双重缺失，无法进行有效的系统性风险评估。'
        briefing.risk_asset_implication = '在盲区期内，在数据盲区期，应依既定计划维持謹慎執行節奏，不宜擴大敞口。'
      }
    }

    // 4. Top Metrics
    briefing.top_metrics = [
      metricsMap.fear_greed,
      metricsMap.vix,
      metricsMap.dxy,
      metricsMap.us10y
    ]

    // 5. Dimensions Deterministic Summaries
    briefing.dimensions.liquidity.key_metrics = [
      metricsMap.nfci,
      metricsMap.rrp
    ]
    if (briefing.dimensions.liquidity.summary === '数据暂不可用。') {
      const nfciRaw = metricsMap.nfci.value
      if (nfciRaw !== null) {
        briefing.dimensions.liquidity.verdict = nfciRaw < 0 ? 'Loose' : 'Tight'
        briefing.dimensions.liquidity.summary = nfciRaw < 0
          ? `当前 NFCI 为 ${nfciRaw.toFixed(2)}，整体金融条件保持相对宽松。`
          : `当前 NFCI 为 ${nfciRaw.toFixed(2)}，信用与融资环境正在实质性收紧。`
      } else {
        briefing.dimensions.liquidity.summary = '金融条件指数缺失，无法评估底层流动性水位。'
      }
    }

    briefing.dimensions.economy.key_metrics = [
      metricsMap.gdp
    ]
    if (briefing.dimensions.economy.summary === '数据暂不可用。') {
      const gdpRaw = metricsMap.gdp.value
      if (gdpRaw !== null) {
        briefing.dimensions.economy.verdict = gdpRaw > 2 ? 'Expanding' : gdpRaw > 0 ? 'Slowing' : 'Contracting'
        briefing.dimensions.economy.summary = gdpRaw > 2
          ? `GDP 增速达 ${gdpRaw.toFixed(1)}%，宏观经济动能强劲。`
          : gdpRaw > 0 ? `经济保持 ${gdpRaw.toFixed(1)}% 的温和扩张，未见断崖式衰退。` : '产出萎缩，经济衰退风险兑现。'
      } else {
        briefing.dimensions.economy.summary = '产出数据缺失，无法确认经济周期位置。'
      }
    }

    briefing.dimensions.inflationRates.key_metrics = [
      metricsMap.cpi,
      metricsMap.us10y
    ]
    if (briefing.dimensions.inflationRates.summary === '数据暂不可用。') {
      const us10yRaw = metricsMap.us10y.value
      if (us10yRaw !== null) {
        briefing.dimensions.inflationRates.verdict = us10yRaw > 4 ? 'High Yield' : 'Easing'
        briefing.dimensions.inflationRates.summary = us10yRaw > 4
          ? `十年期美债高企于 ${us10yRaw.toFixed(2)}%，无风险利率高位运行压制估值。`
          : `长端利率回落至 ${us10yRaw.toFixed(2)}%，流动性宽松预期开始主导定价。`
      } else {
        briefing.dimensions.inflationRates.summary = '长端收益率缺失，无风险定价锚失效。'
      }
    }

    briefing.dimensions.sentiment.key_metrics = [
      metricsMap.fear_greed,
      metricsMap.vix
    ]
    if (briefing.dimensions.sentiment.summary === '数据暂不可用。') {
      const vixRaw = metricsMap.vix.value
      if (vixRaw !== null) {
        briefing.dimensions.sentiment.verdict = vixRaw < 15 ? 'Greed' : vixRaw > 25 ? 'Fear' : 'Neutral'
        briefing.dimensions.sentiment.summary = vixRaw < 15
          ? `VIX 下探至 ${vixRaw.toFixed(2)}，市场处于防备极度空虚的温室期。`
          : vixRaw > 25 ? `恐慌指数飙升至 ${vixRaw.toFixed(2)}，系统性避险情绪主导市场。` : '隐含波动率处于正常均值区间。'
      } else {
        briefing.dimensions.sentiment.summary = '情绪量化指标缺失。'
      }
    }

    // 5b. Section Provenance & Risk Posture (always rule-based, data-driven)
    const _confFromCompleteness = (pct) => pct >= 0.8 ? 'High' : pct >= 0.5 ? 'Medium' : 'Low'
    const _latestUpdatedAt = (metricIds) => {
      const dates = metricIds.map(id => metricsMap[id] && metricsMap[id].updatedAt).filter(Boolean)
      return dates.length ? dates.sort().reverse()[0] : null
    }

    // Liquidity posture
    {
      const nfciRaw = metricsMap.nfci.value
      const rrpRaw = metricsMap.rrp.value
      const ids = ['nfci', 'rrp']
      const avail = ids.filter(id => metricsMap[id].status === 'available').length
      const conf = _confFromCompleteness(avail / ids.length)
      briefing.dimensions.liquidity.provenance.basedOnMetricIds = ids
      briefing.dimensions.liquidity.provenance.updatedAt = briefing.dimensions.liquidity.provenance.updatedAt || _latestUpdatedAt(ids)
      briefing.dimensions.liquidity.provenance.confidence = conf
      if (briefing.dimensions.liquidity.provenance.summarySource !== 'ai_generated') {
        briefing.dimensions.liquidity.provenance.summarySource = nfciRaw !== null ? 'rule_based' : 'static'
      }
      briefing.dimensions.liquidity.provenance.statusSource = nfciRaw !== null ? 'rule_based' : 'static'
      let liqPosture = 'neutral', liqReason = '金融條件處于歷史平均区间，对风险资产无明显幫助或阻力。', liqWatch = '观察 NFCI 是否跌破 -0.1，确认宽松趋势延續。'
      if (nfciRaw === null) {
        liqPosture = 'mixed'; liqReason = '流动性核心指标数据不足，判断降級，請以保守姿态评估。'; liqWatch = '等待 NFCI 与 RRP 数据更新后重新评估。'
      } else if (nfciRaw < -0.1) {
        liqPosture = 'supports_risk'; liqReason = `NFCI 處于 ${nfciRaw.toFixed(2)} 宽松区间，信用管道暢通，整體金融环境有利于风险资产。`
        liqWatch = `若 NFCI 回升至 0 附近，宽松环境邊际收窄，应留意信用利差变化。`
      } else if (nfciRaw > 0.3) {
        liqPosture = 'pressures_risk'; liqReason = `NFCI 升至 ${nfciRaw.toFixed(2)}，金融條件显着收紧，信用成本上升压制风险资产估值。`
        liqWatch = `持續观察 NFCI 是否回落至 0 以下，信用利差收窄是环境改善的先行讯号。`
      } else if (rrpRaw !== null && rrpRaw < 200) {
        liqPosture = 'mixed'; liqReason = `逆回購余额降至 ${rrpRaw.toFixed(0)}B，流动性缓冲墊趋薄，对整體流动性的支撐正在邊际減弱。`
        liqWatch = `若 RRP 繼續下降趋近于零，需留意缺乏缓冲后缩表对市场的直接冲击。`
      }
      briefing.dimensions.liquidity.posture = { section: 'liquidity', posture: liqPosture, reason: liqReason, watchPoint: liqWatch, basedOnMetricIds: ids, source: 'rule_based' }
    }

    // Economy posture
    {
      const gdpRaw = metricsMap.gdp.value
      const ids = ['gdp']
      const conf = gdpRaw !== null ? 'Medium' : 'Low'
      briefing.dimensions.economy.provenance.basedOnMetricIds = ids
      briefing.dimensions.economy.provenance.updatedAt = briefing.dimensions.economy.provenance.updatedAt || _latestUpdatedAt(ids)
      briefing.dimensions.economy.provenance.confidence = conf
      if (briefing.dimensions.economy.provenance.summarySource !== 'ai_generated') {
        briefing.dimensions.economy.provenance.summarySource = gdpRaw !== null ? 'rule_based' : 'static'
      }
      briefing.dimensions.economy.provenance.statusSource = gdpRaw !== null ? 'rule_based' : 'static'
      let ecoPosture = 'neutral', ecoReason = '经济增速维持温和，当前宏观基本面对风险资产无明显加分或減分。', ecoWatch = '关注下一季度 GDP 修正值与非農就业数据的方向。'
      if (gdpRaw === null) {
        ecoPosture = 'mixed'; ecoReason = '产出数据缺失，无法确认当前经济周期位置，判断降級。'; ecoWatch = '等待 GDP 数据更新。'
      } else if (gdpRaw > 2.5) {
        ecoPosture = 'supports_risk'; ecoReason = `GDP 增速 ${gdpRaw.toFixed(1)}% 显示经济动能強勁，企业盈利环境有支撐。`
        ecoWatch = `若 GDP 超预期強勁，留意美联储是否重新评估降息路徑。`
      } else if (gdpRaw < 0) {
        ecoPosture = 'pressures_risk'; ecoReason = `GDP 轉负（${gdpRaw.toFixed(1)}%），经济衰退风险已兌现，企业盈利面臨下行压力。`
        ecoWatch = `观察初請失业金人數与高收益债信用利差，确认衰退深度。`
      }
      briefing.dimensions.economy.posture = { section: 'economy', posture: ecoPosture, reason: ecoReason, watchPoint: ecoWatch, basedOnMetricIds: ids, source: 'rule_based' }
    }

    // Inflation & Rates posture
    {
      const us10yRaw = metricsMap.us10y.value
      const cpiRaw = metricsMap.cpi.value
      const ids = ['cpi', 'us10y']
      const avail = ids.filter(id => metricsMap[id].status === 'available').length
      const conf = _confFromCompleteness(avail / ids.length)
      briefing.dimensions.inflationRates.provenance.basedOnMetricIds = ids
      briefing.dimensions.inflationRates.provenance.updatedAt = briefing.dimensions.inflationRates.provenance.updatedAt || _latestUpdatedAt(ids)
      briefing.dimensions.inflationRates.provenance.confidence = conf
      if (briefing.dimensions.inflationRates.provenance.summarySource !== 'ai_generated') {
        briefing.dimensions.inflationRates.provenance.summarySource = us10yRaw !== null ? 'rule_based' : 'static'
      }
      briefing.dimensions.inflationRates.provenance.statusSource = us10yRaw !== null ? 'rule_based' : 'static'
      let infPosture = 'neutral', infReason = '长端利率處于中性区间，对风险资产估值无显着压制。', infWatch = '关注 US10Y 是否突破 4.5% 压力位，或跌破 4.0% 支撐位。'
      if (us10yRaw === null) {
        infPosture = 'mixed'; infReason = '长端利率数据缺失，无风险定价錨失效，判断降級。'; infWatch = '等待 US10Y 数据更新。'
      } else if (us10yRaw < 4.0) {
        infPosture = 'supports_risk'; infReason = `US10Y 回落至 ${us10yRaw.toFixed(2)}%，貼现率下行利好长久期资产估值，流动性宽松预期升温。`
        infWatch = `观察 US10Y 是否能持續低于 4.0%；若 CPI 数据超预期，利率或再度反彈。`
      } else if (us10yRaw > 4.5) {
        infPosture = 'pressures_risk'; infReason = `US10Y 高企于 ${us10yRaw.toFixed(2)}%，无风险利率高位運行持續压制成长股与长久期资产估值。`
        infWatch = `关注 CPI 下行趋势是否明确，若通胀黏性持續，利率难有实质性回落空间。`
      } else if (cpiRaw !== null && cpiRaw > 3.5) {
        infPosture = 'mixed'; infReason = `CPI 年率仍高于 ${cpiRaw.toFixed(1)}%，通胀黏性制約美联储宽松空间，利率环境保持中性偏紧。`
        infWatch = `持續追蹤 CPI 月率环比趋势；若連續兩月超预期，降息時间表将进一步推后。`
      }
      briefing.dimensions.inflationRates.posture = { section: 'inflation_rates', posture: infPosture, reason: infReason, watchPoint: infWatch, basedOnMetricIds: ids, source: 'rule_based' }
    }

    // Sentiment posture
    {
      const fgiRaw = metricsMap.fear_greed.value
      const vixRaw = metricsMap.vix.value
      const ids = ['fear_greed', 'vix']
      const avail = ids.filter(id => metricsMap[id].status === 'available').length
      const conf = _confFromCompleteness(avail / ids.length)
      briefing.dimensions.sentiment.provenance.basedOnMetricIds = ids
      briefing.dimensions.sentiment.provenance.updatedAt = briefing.dimensions.sentiment.provenance.updatedAt || _latestUpdatedAt(ids)
      briefing.dimensions.sentiment.provenance.confidence = conf
      if (briefing.dimensions.sentiment.provenance.summarySource !== 'ai_generated') {
        briefing.dimensions.sentiment.provenance.summarySource = (fgiRaw !== null || vixRaw !== null) ? 'rule_based' : 'static'
      }
      briefing.dimensions.sentiment.provenance.statusSource = (fgiRaw !== null || vixRaw !== null) ? 'rule_based' : 'static'
      let senPosture = 'neutral', senReason = '市场情绪處于中性区间，对风险资产无明显方向性偏向。', senWatch = '持續观察 FGI 是否进入极端区间（>75 或 <25）。'
      if (fgiRaw === null && vixRaw === null) {
        senPosture = 'mixed'; senReason = '情绪量化指标缺失，无法评估当前市场风险偏好，判断降級。'; senWatch = '等待 FGI 与 VIX 数据更新。'
      } else if (fgiRaw !== null && fgiRaw < 25) {
        senPosture = 'supports_risk'; senReason = `FGI 降至 ${Math.round(fgiRaw)}，市场进入恐慌区，从逆向視角看具备中长期支撐條件。`
        senWatch = `若 VIX 同步高企，恐慌情绪尚未到极值；观察 FGI 是否二次探底确认底部。`
      } else if (fgiRaw !== null && fgiRaw > 75) {
        senPosture = 'mixed'; senReason = `FGI 升至 ${Math.round(fgiRaw)}，市场情绪极度亢奮，短期容错率下降，不宜追高建立新仓位。`
        senWatch = `若 VIX 同步低迷，动能尚存但尾部风险上升；持續观察 FGI 是否出现頂背離。`
      } else if (vixRaw !== null && vixRaw < 13) {
        senPosture = 'mixed'; senReason = `VIX 跌至 ${vixRaw.toFixed(1)}，市场对下行风险的防备极度空虛，需警惕突发事件的放大效应。`
        senWatch = `若 VIX 在低位出现突然跳升，通常伴隨快速修正；不宜在 VIX 极低時大幅加碼。`
      } else if (vixRaw !== null && vixRaw > 25) {
        senPosture = 'pressures_risk'; senReason = `VIX 升至 ${vixRaw.toFixed(1)}，系統性避險情绪主导市场，风险溢价显着上升。`
        senWatch = `观察 VIX 是否在 20 以下企稳，波动率回落是情绪修復的先行讯号。`
      }
      briefing.dimensions.sentiment.posture = { section: 'sentiment', posture: senPosture, reason: senReason, watchPoint: senWatch, basedOnMetricIds: ids, source: 'rule_based' }
    }

    // 5c. Build top-level riskPostureSummary from section postures
    {
      const dims = briefing.dimensions
      const postures = [dims.liquidity.posture.posture, dims.economy.posture.posture, dims.inflationRates.posture.posture, dims.sentiment.posture.posture]
      const supports = postures.filter(p => p === 'supports_risk').length
      const pressures = postures.filter(p => p === 'pressures_risk').length
      const mixed = postures.filter(p => p === 'mixed').length
      let overallPosture = '多空因素交織，维持计划既定節奏'
      if (supports >= 3) overallPosture = '宏观环境整體支持风险敞口，可维持既定配置'
      else if (pressures >= 3) overallPosture = '多维宏观因素同步压制，应确认计划執行節奏是否需调整'
      else if (supports >= 2 && pressures <= 1) overallPosture = '宏观條件偏支持，但仍有局部压力，不宜激进追高'
      else if (pressures >= 2 && supports <= 1) overallPosture = '宏观压力因素偏多，新增投入应保留现金缓冲'
      else if (mixed >= 2) overallPosture = '关键指标信号分歧，维持计划節奏，多观察少调整'

      const mainSupports = []
      const mainPressures = []
      if (dims.liquidity.posture.posture === 'supports_risk') mainSupports.push('流动性宽松')
      if (dims.liquidity.posture.posture === 'pressures_risk') mainPressures.push('金融條件收紧')
      if (dims.economy.posture.posture === 'supports_risk') mainSupports.push('经济动能強勁')
      if (dims.economy.posture.posture === 'pressures_risk') mainPressures.push('经济下行压力')
      if (dims.inflationRates.posture.posture === 'supports_risk') mainSupports.push('利率环境宽松')
      if (dims.inflationRates.posture.posture === 'pressures_risk') mainPressures.push('高利率压制估值')
      if (dims.sentiment.posture.posture === 'supports_risk') mainSupports.push('情绪處恐慌区（逆向支撐）')
      if (dims.sentiment.posture.posture === 'pressures_risk') mainPressures.push('情绪极端恐慌')
      if (dims.sentiment.posture.posture === 'mixed') mainPressures.push('情绪偏熱或波动率異常')

      const fgiRaw2 = metricsMap.fear_greed.value
      const vixRaw2 = metricsMap.vix.value
      const us10yRaw2 = metricsMap.us10y.value
      let todayWatchPoint = '持續观察核心指标邊际变化，若出现惡化应降低计划執行速度而非情绪化操作。'
      if (fgiRaw2 !== null && fgiRaw2 > 70 && vixRaw2 !== null && vixRaw2 < 15) {
        todayWatchPoint = `FGI（${Math.round(fgiRaw2)}）偏高且 VIX（${vixRaw2.toFixed(1)}）极低，市场防备空虛；若兩者同步反轉，短期容错率将快速下降。`
      } else if (us10yRaw2 !== null && us10yRaw2 > 4.5) {
        todayWatchPoint = `US10Y（${us10yRaw2.toFixed(2)}%）仍在高位，貼现率压力持續；观察是否有降温跡象，否则成长资产估值擴张空间有限。`
      } else if (fgiRaw2 !== null && fgiRaw2 < 30) {
        todayWatchPoint = `FGI（${Math.round(fgiRaw2)}）處于恐慌区，观察 VIX 是否同步企稳回落；若同時出现，中期入場條件逐步成熟。`
      }

      briefing.riskPostureSummary = { overallPosture, mainSupports, mainPressures, todayWatchPoint }
    }

    // 5d. Generic Asset Impact
    {
      const liqP = briefing.dimensions.liquidity.posture.posture
      const infP = briefing.dimensions.inflationRates.posture.posture
      const senP = briefing.dimensions.sentiment.posture.posture
      const ecoP = briefing.dimensions.economy.posture.posture
      const us10yRaw3 = metricsMap.us10y.value
      const fgiRaw3 = metricsMap.fear_greed.value

      const techPosture = (liqP === 'supports_risk' && infP !== 'pressures_risk') ? 'supports_risk'
        : (infP === 'pressures_risk' || us10yRaw3 > 4.5) ? 'pressures_risk' : 'neutral'
      const techImpact = techPosture === 'supports_risk'
        ? '流动性宽松且利率压力有限，成长股估值倍數擴张有空间；维持计划既定配置。'
        : techPosture === 'pressures_risk'
        ? `高利率（US10Y ${us10yRaw3 ? us10yRaw3.toFixed(2) + '%' : '偏高'}）持續压制长久期成长股估值，新增投入应審慎控制仓位集中度。`
        : '利率与流动性环境中性，成长股表现将更依賴個股盈利，選股重于擇時。'

      const cryptoPosture = (liqP === 'supports_risk' && senP !== 'pressures_risk') ? 'supports_risk'
        : (senP === 'pressures_risk' || liqP === 'pressures_risk') ? 'pressures_risk' : 'neutral'
      const cryptoImpact = cryptoPosture === 'supports_risk'
        ? '流动性环境宽松，加密资产作为高Beta风险资产受益；若情绪同步乐观，动能可能持續。'
        : cryptoPosture === 'pressures_risk'
        ? '金融條件收紧或情绪惡化，加密资产波动率高且流动性薄，容错率较低，不宜过度集中。'
        : '加密资产走势主要受個別市场催化劑驱动，宏观环境当前无明确方向性加持。'

      const goldPosture = (infP === 'pressures_risk' || liqP === 'pressures_risk' || senP === 'pressures_risk') ? 'supports_risk'
        : (liqP === 'supports_risk' && infP === 'supports_risk') ? 'pressures_risk' : 'neutral'
      const goldImpact = goldPosture === 'supports_risk'
        ? '通胀黏性、金融條件收紧或避險情绪等因素之一存在，黃金作为防禦资产有配置价值。'
        : goldPosture === 'pressures_risk'
        ? '流动性宽松且实际利率回落，黃金短期缺乏避險需求驱动，更多跟隨美元走弱逻辑。'
        : '黃金当前宏观驱动力中性，可作为組合波动缓冲，但不宜过度增配。'

      const cashPosture = (infP === 'pressures_risk' || liqP === 'pressures_risk') ? 'supports_risk'
        : (liqP === 'supports_risk' && ecoP === 'supports_risk') ? 'pressures_risk' : 'neutral'
      const cashImpact = cashPosture === 'supports_risk'
        ? '高利率环境下现金与短债提供有吸引力的实际回报，保留现金缓冲符合当前宏观逻辑。'
        : cashPosture === 'pressures_risk'
        ? '流动性宽松与经济擴张环境下，持有过多现金存在机会成本，应依计划逐步部署。'
        : '现金与短债提供稳定流动性，在当前环境下作为組合缓冲仍具合理配置比例。'

      briefing.genericAssetImpact = [
        { assetType: '科技成长股', impact: techImpact, posture: techPosture },
        { assetType: '加密资产', impact: cryptoImpact, posture: cryptoPosture },
        { assetType: '黃金／防禦资产', impact: goldImpact, posture: goldPosture },
        { assetType: '现金／短债', impact: cashImpact, posture: cashPosture }
      ]
    }

    // 6. Drivers & Catalysts (Fallback only if empty)
    if (briefing.tailwinds.length === 0 && briefing.headwinds.length === 0) {
      const dxyRaw = metricsMap.dxy.value
      const nfciRaw = metricsMap.nfci.value
      const us10yRaw = metricsMap.us10y.value
      
      if (dxyRaw !== null && dxyRaw < 100) {
        briefing.tailwinds.push({
          desc: `弱美元环境 (DXY = ${dxyRaw.toFixed(2)}) 显着降低全球融资成本，支持非美风险资产。`,
          evidence_metric_ids: ['dxy']
        })
      }
      if (nfciRaw !== null && nfciRaw < 0) {
        briefing.tailwinds.push({
          desc: '金融条件维持宽松（NFCI 处于负值区间），信用利差未见系统性恶化。',
          evidence_metric_ids: ['nfci']
        })
      }

      if (us10yRaw !== null && us10yRaw > 4.3) {
        briefing.headwinds.push({
          desc: `长端利率 (US10Y = ${us10yRaw.toFixed(2)}%) 处于极高水平，持续压制长久期成长股估值。`,
          evidence_metric_ids: ['us10y']
        })
      }
      if (dxyRaw !== null && dxyRaw > 105) {
        briefing.headwinds.push({
          desc: `强势美元周期 (DXY = ${dxyRaw.toFixed(2)}) 形成流动性虹吸效应，压制离岸资产定价。`,
          evidence_metric_ids: ['dxy']
        })
      }
    }

    if (briefing.what_changed.length === 0) {
      const vixRaw = metricsMap.vix.value
      if (vixRaw !== null && vixRaw < 13) {
        briefing.what_changed.push({
          label: '极端钝化',
          desc: '波动率（VIX）跌破长线极值，市场可能对潜在的宏观利空产生了严重钝化。',
          evidence_metric_ids: ['vix']
        })
      }
    }

    if (briefing.what_to_watch.length === 0) {
      const rrpRaw = metricsMap.rrp.value
      const us10yRaw = metricsMap.us10y.value
      if (rrpRaw !== null && rrpRaw < 500) {
        briefing.what_to_watch.push({
          label: '流动性枯竭点',
          desc: `逆回购余额（RRP）已降至 ${rrpRaw}B 低位，若缓冲垫耗尽，基础流动性将直面缩表冲击。`,
          evidence_metric_ids: ['rrp']
        })
      }
      if (us10yRaw !== null) {
        briefing.what_to_watch.push({
          label: '长端利率博弈',
          desc: '十年期美债收益率能否在当前区间构筑双顶或突破，直接决定下一季度的资产配置中枢。',
          evidence_metric_ids: ['us10y']
        })
      }
    }
  } catch (error) {
    console.error('Failed to resolve MacroHomeBriefing', error)
    briefing.warnings.push(`底层适配器发生崩溃: ${error.message}`)
  } finally {
    briefing.loading = false
  }

  return briefing
}
