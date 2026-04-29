import { getAllAnalysisHistory } from '@/api/fast-analysis'
import { getMarketOverview, getMarketSentiment, getEconomicCalendar, getTradingOpportunities } from '@/api/global-market'

export async function getBriefingViewModel () {
  const model = {
    headline: '今日市场等待更新',
    summary: '暂无摘要',
    highlights: [],
    sentiment: null,
    marketContext: [],
    rawIndices: [],
    rawOpportunities: [],
    upcomingEvents: [],
    lastUpdated: new Date().toISOString(),
    isEmpty: true,
    loading: true
  }

  try {
    const [historyRes, overviewRes, sentimentRes, calendarRes, oppsRes] = await Promise.allSettled([
      getAllAnalysisHistory({ page: 1, pagesize: 5 }),
      getMarketOverview(),
      getMarketSentiment(),
      getEconomicCalendar(),
      getTradingOpportunities()
    ])

    let hasData = false

    if (historyRes.status === 'fulfilled' && historyRes.value?.data) {
      const records = historyRes.value.data.list || historyRes.value.data || []
      if (records.length > 0) {
        model.headline = records[0].symbol ? `${records[0].symbol} 分析简报` : '最新市场简报'
        model.summary = records[0].conclusion || records[0].summary || '已获取最新AI分析'
        hasData = true
      }
    }

    if (overviewRes.status === 'fulfilled' && overviewRes.value?.data) {
      const data = overviewRes.value.data
      model.rawIndices = Array.isArray(data) ? data : (data.indices || [])
      model.marketContext = Array.isArray(data) ? data.slice(0, 4) : Object.values(data).slice(0, 4)
      hasData = true
    }

    if (sentimentRes.status === 'fulfilled' && sentimentRes.value?.data) {
      model.sentiment = sentimentRes.value.data
      const fgi = model.sentiment?.fear_greed_index || model.sentiment?.value
      if (fgi) {
        model.highlights.push(`情绪指数: ${fgi}`)
      }
      hasData = true
    }

    if (calendarRes.status === 'fulfilled' && calendarRes.value?.data) {
      const events = Array.isArray(calendarRes.value.data) ? calendarRes.value.data : (calendarRes.value.data.events || [])
      model.upcomingEvents = events.slice(0, 3)
      hasData = true
    }

    if (oppsRes.status === 'fulfilled' && oppsRes.value?.data) {
      model.rawOpportunities = Array.isArray(oppsRes.value.data) ? oppsRes.value.data.slice(0, 20) : []
      if (model.rawOpportunities.length > 0) hasData = true
    }

    model.isEmpty = !hasData
  } catch (error) {
    console.error('Failed to fetch briefing adapter data', error)
  } finally {
    model.loading = false
  }

  return model
}
