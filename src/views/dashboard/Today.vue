<template>
  <div class="today-page">

    <!-- Section A: Market Temperature -->
    <section class="today-section market-temp-section">
      <div class="section-header">
        <div class="section-title-group">
          <a-icon type="global" class="section-icon" />
          <h2 class="section-title">市场温度</h2>
          <span class="section-badge">Market Temperature</span>
        </div>
        <router-link to="/macro" class="section-link">
          查看宏观详情 <a-icon type="arrow-right" />
        </router-link>
      </div>

      <div v-if="macroLoading" class="macro-loading">
        <a-spin size="default" />
        <span class="loading-text">正在同步宏观指标…</span>
      </div>

      <a-alert
        v-else-if="macroError"
        type="warning"
        :message="macroError"
        show-icon
        class="macro-error-alert"
      />

      <template v-else>
        <!-- Metrics strip -->
        <div class="metrics-strip" v-if="safeTopMetrics.length">
          <div v-for="(m, idx) in safeTopMetrics" :key="idx" class="metric-tile">
            <span class="metric-label">{{ m.label }}</span>
            <span class="metric-value" :class="{ unavailable: m.value === '--' }">
              {{ m.value === '--' ? '暂无' : m.value }}
            </span>
            <span class="metric-name">{{ metricConfig(m.label).name }}</span>
            <span class="metric-explain">{{ metricConfig(m.label).explain }}</span>
          </div>
        </div>
        <div v-else class="metric-empty">指标数据同步中，请稍候。</div>

        <!-- Dimension pills -->
        <div class="dimensions-row" v-if="safeDimensions.length">
          <div v-for="dim in safeDimensions" :key="dim.key" class="dim-pill">
            <span class="dim-name">{{ dim.title }}</span>
            <span class="verdict-tag" :class="verdictClass(dim.verdict)">
              {{ verdictLabel(dim.verdict) }}
            </span>
            <div class="dim-kv" v-if="dim.key_metrics && dim.key_metrics.length">
              <span v-for="(km, ki) in dim.key_metrics" :key="ki" class="kv-item">
                <span class="kv-label">{{ km.label }}</span>
                <span class="kv-val" :class="{ unavailable: km.value === '--' }">
                  {{ km.value === '--' ? '--' : km.value }}
                </span>
              </span>
            </div>
          </div>
        </div>

        <!-- Educational summary block -->
        <div class="env-summary">
          <div class="env-summary-header">
            <a-icon type="info-circle" class="env-icon" />
            <span class="env-label">长期投资者提示</span>
          </div>
          <p class="env-body">
            以上指标反映当前市场情绪与宏观环境的客观状态，供参考了解背景。这些数据不用于预测短线涨跌，也不代表任何买卖建议。
          </p>
          <p class="env-body">
            对长期投资者而言，更重要的是维持既定的分批买入计划，避免因为短期波动而追高或提前退出。
          </p>
        </div>

        <div class="macro-footer" v-if="macroCompleteness < 1">
          <a-icon type="info-circle" />
          <span>部分宏观指标暂不可用（{{ Math.round(macroCompleteness * 100) }}% 已加载）。数据来自第三方行情源，不代表任何投资建议。</span>
        </div>
      </template>
    </section>

    <!-- Section B: Watchlist -->
    <section class="today-section">
      <div class="section-header">
        <div class="section-title-group">
          <a-icon type="star" class="section-icon" />
          <h2 class="section-title">我的关注</h2>
          <span class="section-badge">Watchlist</span>
        </div>
      </div>

      <div v-if="watchlistLoading" class="macro-loading">
        <a-spin size="default" />
        <span class="loading-text">正在同步关注列表…</span>
      </div>

      <div v-else-if="watchlistError" class="empty-card">
        <a-alert type="warning" :message="watchlistError" show-icon style="text-align: left; margin-bottom: 16px;" />
        <router-link to="/ai-asset-analysis">
          <a-button type="primary" size="small" class="empty-action-btn">去资产速览</a-button>
        </router-link>
      </div>

      <div v-else-if="watchlist.length === 0" class="empty-card">
        <a-empty :image="emptyImage" :image-style="{ height: '64px' }">
          <template #description>
            <p class="empty-title">还没有关注的资产</p>
            <p class="empty-hint">
              从 Asset Snapshot 搜索你关心的股票、ETF 或 Crypto，并加入关注。之后你每天打开 Today，就能快速看到它们的价格变化和状态提醒。
            </p>
            <router-link to="/ai-asset-analysis">
              <a-button type="primary" size="small" class="empty-action-btn">去资产速览</a-button>
            </router-link>
          </template>
        </a-empty>
      </div>

      <div v-else class="watchlist-grid">
        <router-link
          v-for="(item, idx) in watchlist"
          :key="idx"
          :to="'/ai-asset-analysis?symbol=' + encodeURIComponent(item.symbol)"
          class="wl-card"
        >
          <div class="wl-card-main">
            <div class="wl-symbol-row">
              <span class="wl-symbol">{{ item.symbol }}</span>
              <span class="wl-market-tag" :class="'wl-mkt-' + (item.market || '').toLowerCase()">{{ item.market }}</span>
            </div>
            <div class="wl-name">{{ item.name }}</div>
          </div>
          <div class="wl-card-price" v-if="item.priceAvailable">
            <div class="wl-price">{{ formatPrice(item.price) }}</div>
            <div class="wl-change" :class="changeClass(item.changePercent)">
              {{ formatChange(item.changePercent) }}
            </div>
          </div>
          <div class="wl-card-price wl-price-unavail" v-else>
            --
          </div>
        </router-link>
      </div>
    </section>

      <!-- Section C: Active Plans -->
      <section class="today-section">
        <div class="section-header">
          <div class="section-title-group">
            <a-icon type="book" class="section-icon" />
            <h2 class="section-title">我的计划</h2>
            <span class="section-badge">Active Plans</span>
          </div>
          <router-link to="/my-plan" class="section-link">
            查看全部 <a-icon type="arrow-right" />
          </router-link>
        </div>

        <!-- Loading -->
        <div v-if="plansLoading" class="empty-card" style="padding: 32px; text-align: center;">
          <a-spin />
        </div>

        <!-- Has plans -->
        <div v-else-if="plans.length > 0" class="plans-list">
          <router-link
            v-for="plan in plans.slice(0, 3)"
            :key="plan.id"
            to="/my-plan"
            class="plan-row"
          >
            <div class="plan-row-main">
              <span class="plan-row-symbol">{{ plan.symbol }}</span>
              <span class="plan-row-badge">{{ plan.asset_type }}</span>
              <span class="plan-row-type">{{ plan.plan_type }}</span>
            </div>
            <div class="plan-row-meta">
              <span v-if="plan.total_budget">${{ formatMoney(plan.total_budget) }}</span>
              <span v-if="plan.frequency"> · {{ plan.frequency }}</span>
              <span v-if="plan.duration"> · {{ plan.duration }}</span>
            </div>
            <a-tag :color="planStatusColor(plan.status)" class="plan-row-status">
              {{ planStatusLabel(plan.status) }}
            </a-tag>
          </router-link>
          <div v-if="plans.length > 3" class="plans-more">
            <router-link to="/my-plan">查看全部 {{ plans.length }} 个计划 →</router-link>
          </div>
        </div>

        <!-- Empty state -->
        <div v-else class="empty-card">
          <a-empty :image="emptyImage" :image-style="{ height: '64px' }">
            <template #description>
              <p class="empty-title">还没有保存的计划</p>
              <p class="empty-hint">
                你可以创建长期 DCA 计划或分批买入计划，记录入场逻辑、失效条件和风险控制。计划的目的不是预测市场，而是帮助你在波动中保持纪律。
              </p>
              <router-link to="/indicator-ide">
                <a-button type="primary" size="small" class="empty-action-btn">创建计划</a-button>
              </router-link>
            </template>
          </a-empty>
        </div>
      </section>

  </div>
</template>

<script>
import { Empty } from 'ant-design-vue'
import { getMacroViewModel } from '@/views/macro-intelligence/adapters'
import { getWatchlist, getWatchlistPrices } from '@/api/market'
import { getPlans } from '@/api/plans'
import request from '@/utils/request'

// ONLY reads: top_metrics, dimensions[*].{title, verdict, key_metrics}, data_completeness
// NEVER reads: headline, core_judgment, risk_asset_implication, tailwinds, headwinds

const METRIC_CONFIG = {
  FGI: { name: '恐贪指数', explain: '衡量市场情绪。数值越高代表越贪婪，追高风险也越大。' },
  VIX: { name: '波动率指数', explain: '衡量市场预期波动。低位不代表没有风险，只代表当前市场不太害怕。' },
  DXY: { name: '美元指数', explain: '反映美元强弱。美元走弱通常会减轻全球流动性压力。' },
  US10Y: { name: '十年期美债收益率', explain: '代表长期无风险利率。利率越高，高估值资产承受的估值压力越大。' }
}

const VERDICT_LABELS = {
  Loose: '宽松',
  Tight: '收紧',
  Expanding: '扩张',
  Slowing: '放缓',
  Contracting: '萎缩',
  Easing: '宽松',
  'High Yield': '高利率',
  Greed: '情绪偏热',
  Fear: '情绪偏冷',
  Neutral: '中性'
}

const VERDICT_CLASSES = {
  Loose: 'verdict-positive',
  Easing: 'verdict-positive',
  Expanding: 'verdict-positive',
  Greed: 'verdict-warn',
  Neutral: 'verdict-neutral',
  Slowing: 'verdict-neutral',
  'High Yield': 'verdict-negative',
  Tight: 'verdict-negative',
  Contracting: 'verdict-negative',
  Fear: 'verdict-negative'
}

export default {
  name: 'TodayPage',
  data () {
    return {
      emptyImage: Empty.PRESENTED_IMAGE_SIMPLE,
      macroLoading: true,
      macroError: null,
      safeTopMetrics: [],
      safeDimensions: [],
      macroCompleteness: 0,
      watchlist: [],
      watchlistLoading: true,
      watchlistError: null,
      plans: [],
      plansLoading: false
    }
  },
  mounted () {
    this.fetchMacroData()
    this.loadWatchlist()
    this.loadPlans()
  },
  methods: {
    async fetchMacroData () {
      this.macroLoading = true
      this.macroError = null
      try {
        const model = await getMacroViewModel()
        this.safeTopMetrics = Array.isArray(model.top_metrics)
          ? model.top_metrics.filter(m => m && m.label)
          : []
        const dims = model.dimensions || {}
        this.safeDimensions = Object.keys(dims).map(key => ({
          key,
          title: dims[key].title || key,
          verdict: dims[key].verdict || 'Neutral',
          key_metrics: Array.isArray(dims[key].key_metrics) ? dims[key].key_metrics : []
        }))
        this.macroCompleteness = typeof model.data_completeness === 'number'
          ? model.data_completeness : 0
      } catch (e) {
        console.error('[Today] Macro data fetch failed:', e)
        this.macroError = '宏观数据暂时无法加载，请稍后刷新。'
      } finally {
        this.macroLoading = false
      }
    },
    metricConfig (label) { return METRIC_CONFIG[label] || { name: '', explain: '' } },
    verdictLabel (verdict) { return VERDICT_LABELS[verdict] || verdict },
    verdictClass (verdict) { return VERDICT_CLASSES[verdict] || 'verdict-neutral' },
    
    // ==== Watchlist ====
    async loadUserId () {
      try {
        const res = await request({ url: '/api/users/me', method: 'get' })
        if (res && res.data) return res.data.id || res.data.user_id || 1
      } catch (e) {
        return 1
      }
      return 1
    },
    loadUserId () {
      return request({ url: '/api/users/me', method: 'get' })
        .then(res => (res && res.data) ? (res.data.id || res.data.user_id || 1) : 1)
        .catch(() => 1)
    },
    async loadPlans () {
      this.plansLoading = true
      try {
        const res = await getPlans()
        if (res && res.code === 1) {
          this.plans = Array.isArray(res.data) ? res.data.slice(0, 5) : []
        } else {
          this.plans = []
        }
      } catch (e) {
        console.error('[Today] loadPlans failed:', e)
        this.plans = []
      } finally {
        this.plansLoading = false
      }
    },
    formatMoney (val) {
      if (!val) return '0'
      return Number(val).toLocaleString('en-US')
    },
    planStatusColor (status) {
      const map = { active: 'green', paused: 'orange', draft: 'blue', completed: 'purple', cancelled: 'red', archived: 'default' }
      return map[status] || 'default'
    },
    planStatusLabel (status) {
      const map = { active: '执行中', paused: '已暂停', draft: '草稿', completed: '已完成', cancelled: '已取消', archived: '已归档' }
      return map[status] || status
    },
    async loadWatchlist () {
      this.watchlistLoading = true
      this.watchlistError = null
      try {
        const userId = await this.loadUserId()
        const res = await getWatchlist({ userid: userId })
        let items = []
        if (res && res.code === 1 && res.data) {
          items = Array.isArray(res.data) ? res.data : []
        } else if (Array.isArray(res)) {
          items = res
        }
        
        // Take up to 6
        const displayItems = items.slice(0, 6).map(w => ({
          market: w.market || '',
          symbol: w.symbol,
          name: w.name || w.symbol,
          price: null,
          changePercent: null,
          priceAvailable: false
        }))
        
        this.watchlist = displayItems
        
        if (displayItems.length > 0) {
          this.fetchWatchlistPrices(displayItems)
        }
      } catch (e) {
        console.error('[Today] Watchlist fetch failed:', e)
        this.watchlistError = '暂时无法加载关注列表，请稍后重试。'
      } finally {
        this.watchlistLoading = false
      }
    },
    async fetchWatchlistPrices (items) {
      try {
        const reqList = items.map(i => ({ market: i.market, symbol: i.symbol }))
        const res = await getWatchlistPrices({ watchlist: reqList })
        let priceData = []
        if (res && res.code === 1 && res.data) {
          priceData = res.data
        }
        
        if (Array.isArray(priceData)) {
          const newWatchlist = [...this.watchlist]
          priceData.forEach(p => {
            const match = newWatchlist.find(w => w.market === p.market && w.symbol === p.symbol)
            if (match) {
              match.price = p.price
              match.changePercent = p.changePercent
              match.priceAvailable = p.price !== undefined && p.price !== null && !p.error
            }
          })
          this.watchlist = newWatchlist
        }
      } catch (e) {
        console.error('[Today] Watchlist prices fetch failed:', e)
      }
    },
    formatPrice (val) {
      if (val === undefined || val === null) return '--'
      const num = Number(val)
      if (num < 0.01) return num.toFixed(6)
      if (num < 1) return num.toFixed(4)
      return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    },
    formatChange (val) {
      if (val === undefined || val === null) return ''
      const num = Number(val)
      const prefix = num > 0 ? '+' : ''
      return prefix + num.toFixed(2) + '%'
    },
    changeClass (val) {
      if (val === undefined || val === null) return 'is-neutral'
      const num = Number(val)
      return num > 0 ? 'is-up' : (num < 0 ? 'is-down' : 'is-neutral')
    }
  }
}
</script>

<style scoped lang="less">
.today-page {
  padding: 24px 32px 48px;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.today-section {
  background: #ffffff;
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  padding: 24px 28px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-title-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-icon { font-size: 18px; color: #1890ff; }

.section-title { font-size: 18px; font-weight: 600; color: #111827; margin: 0; }

.section-badge { font-size: 12px; color: #9ca3af; font-weight: 400; letter-spacing: 0.3px; }

.section-link {
  font-size: 13px;
  color: #1890ff;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: opacity 0.15s;
  &:hover { opacity: 0.75; }
}

.market-temp-section { background: linear-gradient(135deg, #fafbff 0%, #ffffff 100%); }

.macro-loading { display: flex; align-items: center; gap: 12px; padding: 32px 0; }

.loading-text { font-size: 14px; color: #9ca3af; }

.macro-error-alert { border-radius: 8px; }

.metrics-strip {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.metric-tile {
  flex: 1;
  min-width: 140px;
  background: #f8fafc;
  border: 1px solid #e8e8e8;
  border-radius: 10px;
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 3px;
  transition: border-color 0.15s;
  &:hover { border-color: #d0e4ff; }
}

.metric-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: #6b7280;
  font-weight: 600;
}

.metric-value {
  font-size: 26px;
  font-weight: 700;
  color: #111827;
  font-family: 'SFMono-Regular', Consolas, monospace;
  line-height: 1.2;
  margin: 2px 0 1px;
  &.unavailable { font-size: 14px; font-weight: 400; color: #9ca3af; font-family: inherit; }
}

.metric-name { font-size: 11px; color: #6b7280; font-weight: 500; }

.metric-explain { font-size: 11px; color: #9ca3af; line-height: 1.5; margin-top: 4px; }

.metric-empty { font-size: 14px; color: #9ca3af; padding: 16px 0; }

.dimensions-row { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 20px; }

.dim-pill {
  flex: 1;
  min-width: 160px;
  background: #ffffff;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dim-name { font-size: 13px; font-weight: 600; color: #374151; }

.verdict-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.3px;
  width: fit-content;
  &.verdict-positive { background: rgba(16, 185, 129, 0.1); color: #059669; }
  &.verdict-warn { background: rgba(245, 158, 11, 0.1); color: #d97706; }
  &.verdict-negative { background: rgba(239, 68, 68, 0.1); color: #dc2626; }
  &.verdict-neutral { background: rgba(107, 114, 128, 0.1); color: #4b5563; }
}

.dim-kv { display: flex; flex-direction: column; gap: 4px; }

.kv-item { display: flex; justify-content: space-between; align-items: baseline; }

.kv-label { font-size: 11px; color: #9ca3af; }

.kv-val {
  font-size: 13px;
  font-weight: 600;
  color: #111827;
  font-family: 'SFMono-Regular', Consolas, monospace;
  &.unavailable { color: #9ca3af; font-weight: 400; font-family: inherit; }
}

.env-summary {
  background: #f8fafc;
  border: 1px solid #e8f0fe;
  border-radius: 8px;
  padding: 16px 20px;
  margin-bottom: 16px;
}

.env-summary-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.env-icon { color: #1890ff; font-size: 14px; }

.env-label {
  font-size: 12px;
  font-weight: 600;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.env-body {
  font-size: 13px;
  color: #4b5563;
  line-height: 1.7;
  margin: 0 0 8px;
  &:last-child { margin-bottom: 0; }
}

.macro-footer {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 12px;
  color: #9ca3af;
  line-height: 1.6;
  padding-top: 12px;
  border-top: 1px dashed #f0f0f0;
  margin-top: 4px;
  .anticon { margin-top: 2px; flex-shrink: 0; }
}

.empty-card { padding: 24px 0 16px; text-align: center; }

.empty-title { font-size: 15px; font-weight: 500; color: #374151; margin: 8px 0 4px; }

.empty-hint {
  font-size: 13px;
  color: #9ca3af;
  line-height: 1.7;
  max-width: 420px;
  margin: 0 auto 16px;
  a { color: #1890ff; &:hover { text-decoration: underline; } }
}

.empty-action-btn { border-radius: 6px; }


@media (max-width: 900px) {
  .today-page { padding: 16px 16px 40px; }
  .metrics-strip .metric-tile { min-width: calc(50% - 8px); }
  .dimensions-row .dim-pill { min-width: calc(50% - 6px); }
}

@media (max-width: 600px) {
  .section-header { flex-direction: column; align-items: flex-start; gap: 8px; }
  .metrics-strip .metric-tile { min-width: 100%; }
  .dimensions-row .dim-pill { min-width: 100%; }
}

/* Watchlist Grid Styles */
.watchlist-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}

.wl-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border: 1px solid #f0f0f0;
  border-radius: 10px;
  background: #fafafa;
  color: inherit;
  text-decoration: none;
  transition: all 0.15s ease;
  &:hover {
    border-color: #d0e4ff;
    background: #f0f7ff;
    box-shadow: 0 2px 8px rgba(24, 144, 255, 0.06);
  }
}

.wl-symbol-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.wl-symbol {
  font-size: 15px;
  font-weight: 600;
  color: #111827;
}

.wl-market-tag {
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 4px;
  background: #e5e7eb;
  color: #4b5563;
  font-weight: 500;
  text-transform: uppercase;
}
.wl-mkt-crypto { background: #fef3c7; color: #d97706; }
.wl-mkt-usstock { background: #dbeafe; color: #2563eb; }

.wl-name {
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 140px;
}

.wl-card-price {
  text-align: right;
}

.wl-price {
  font-size: 15px;
  font-weight: 600;
  color: #111827;
  font-family: 'SFMono-Regular', Consolas, monospace;
}

.wl-change {
  font-size: 12px;
  font-weight: 500;
  margin-top: 2px;
  font-family: 'SFMono-Regular', Consolas, monospace;
}

.wl-change.is-up { color: #059669; }
.wl-change.is-down { color: #dc2626; }
.wl-change.is-neutral { color: #6b7280; }

.wl-price-unavail {
  font-size: 14px;
  color: #9ca3af;
}

// Active Plans list in Today
.plans-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.plan-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #ffffff;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  text-decoration: none;
  transition: box-shadow 0.15s, border-color 0.15s;

  &:hover {
    border-color: #c7d2fe;
    box-shadow: 0 2px 8px rgba(99, 102, 241, 0.08);
  }
}

.plan-row-main {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
  min-width: 0;
}

.plan-row-symbol {
  font-size: 15px;
  font-weight: 700;
  color: #111827;
}

.plan-row-badge, .plan-row-type {
  font-size: 11px;
  font-weight: 500;
  padding: 1px 6px;
  border-radius: 4px;
  background: #f3f4f6;
  color: #6b7280;
  white-space: nowrap;
}

.plan-row-type { background: #eff6ff; color: #3b82f6; }

.plan-row-meta {
  font-size: 12px;
  color: #9ca3af;
  white-space: nowrap;
}

.plan-row-status { font-size: 11px; border-radius: 4px; flex-shrink: 0; }

.plans-more {
  text-align: center;
  padding: 8px 0 0;
  font-size: 13px;
  a { color: #6366f1; &:hover { text-decoration: underline; } }
}
</style>
