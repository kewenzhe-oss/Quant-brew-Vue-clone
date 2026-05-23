import i18n from '@/locales'
import { getAllAnalysisHistory } from '@/api/fast-analysis'
import { getMarketOverview, getMarketSentiment, getEconomicCalendar, getTradingOpportunities } from '@/api/global-market'

export async function getBriefingViewModel () {
  const model = {
    headline: i18n.t('dailyBriefing.waitingForUpdate'),
    summary: i18n.t('dailyBriefing.noSummary'),
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
        model.headline = records[0].symbol ? i18n.t('dailyBriefing.symbolBriefing', { symbol: records[0].symbol }) : i18n.t('dailyBriefing.latestBriefing')
        model.summary = records[0].conclusion || records[0].summary || i18n.t('dailyBriefing.fetchedLatestAnalysis')
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
        model.highlights.push(i18n.t('dailyBriefing.sentimentIndex', { value: fgi }))
      }
      hasData = true
    }

    if (calendarRes.status === 'fulfilled' && calendarRes.value?.data) {
      const events = Array.isArray(calendarRes.value.data) ? calendarRes.value.data : (calendarRes.value.data.events || [])
      model.upcomingEvents = events.slice(0, 3)
      hasData = true
    }

    if (oppsRes.status === 'fulfilled' && oppsRes.value?.data) {
      const payload = oppsRes.value.data
      const list = Array.isArray(payload) ? payload : (payload && (payload.items || payload.opportunities)) || []
      model.rawOpportunities = list.slice(0, 20)
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
