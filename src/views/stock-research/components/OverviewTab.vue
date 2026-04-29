<template>
  <div class="overview-tab">
    <a-spin :spinning="isLoading" tip="Loading Overview Data...">
      <div v-if="hasData" class="overview-grid">

        <!-- Left Column: Trading, Valuation, Share Stats -->
        <div class="column left-col">
          <a-card size="small" title="TODAY'S TRADING" class="fin-card amber-header">
            <div class="data-row"><span>OPEN</span><strong class="cyan">{{ formatPrice(quote.open) }}</strong></div>
            <div class="data-row"><span>HIGH</span><strong class="positive">{{ formatPrice(quote.high) }}</strong></div>
            <div class="data-row"><span>LOW</span><strong class="negative">{{ formatPrice(quote.low) }}</strong></div>
            <div class="data-row"><span>PREV CLOSE</span><strong class="text-primary">{{ formatPrice(quote.prev_close) }}</strong></div>
            <div class="data-row"><span>VOLUME</span><strong class="yellow">{{ formatLarge(quote.volume) }}</strong></div>
          </a-card>

          <a-card size="small" title="VALUATION" class="fin-card cyan-header">
            <div class="data-row"><span>MARKET CAP</span><strong class="cyan">{{ formatLarge(info.market_cap) }}</strong></div>
            <div class="data-row"><span>P/E RATIO</span><strong class="yellow">{{ formatNumber(info.pe_ratio) }}</strong></div>
            <div class="data-row"><span>FWD P/E</span><strong class="yellow">{{ formatNumber(info.forward_pe) }}</strong></div>
            <div class="data-row"><span>PEG RATIO</span><strong class="yellow">{{ formatNumber(info.peg_ratio) }}</strong></div>
            <div class="data-row"><span>P/B RATIO</span><strong class="cyan">{{ formatNumber(info.price_to_book) }}</strong></div>
            <div class="data-row"><span>DIV YIELD</span><strong class="positive">{{ formatPercent(info.dividend_yield) }}</strong></div>
            <div class="data-row"><span>BETA</span><strong class="text-primary">{{ formatNumber(info.beta) }}</strong></div>
          </a-card>

          <a-card size="small" title="SHARE STATS" class="fin-card purple-header">
            <div class="data-row"><span>SHARES OUT</span><strong class="cyan">{{ formatLarge(info.shares_outstanding) }}</strong></div>
            <div class="data-row"><span>FLOAT</span><strong class="cyan">{{ formatLarge(info.float_shares) }}</strong></div>
            <div class="data-row"><span>INSIDERS</span><strong class="yellow">{{ formatPercent(info.held_insiders_pct) }}</strong></div>
            <div class="data-row"><span>INSTITUTIONS</span><strong class="yellow">{{ formatPercent(info.held_institutions_pct) }}</strong></div>
            <div class="data-row"><span>SHORT %</span><strong class="negative">{{ formatPercent(info.short_pct_of_float) }}</strong></div>
          </a-card>
        </div>

        <!-- Center Column: Interactive Chart -->
        <div class="column center-col">
          <div class="chart-panel">
            <div class="chart-header">
              <span class="period-label">PERIOD</span>
              <div class="period-buttons">
                <button
                  v-for="p in periods"
                  :key="p.value"
                  :class="['period-btn', { active: currentPeriod === p.value }]"
                  @click="changePeriod(p.value)"
                >
                  {{ p.label }}
                </button>
              </div>
            </div>
            <div class="chart-body">
              <stock-kline-chart :history="history" :loading="historyLoading" />
            </div>
          </div>

          <!-- Bottom Info section moved under chart for flow -->
          <div class="company-desc-panel">
            <h3 class="panel-title cyan-text">COMPANY OVERVIEW</h3>
            <p class="desc-text">{{ info.description || '—' }}</p>
          </div>
        </div>

        <!-- Right Column: Context & Health -->
        <div class="column right-col">
          <a-card size="small" title="ANALYST TARGETS" class="fin-card magenta-header">
            <div class="data-row"><span>HIGH</span><strong class="positive">{{ formatPrice(info.target_high_price) }}</strong></div>
            <div class="data-row"><span>MEAN</span><strong class="yellow">{{ formatPrice(info.target_mean_price) }}</strong></div>
            <div class="data-row"><span>LOW</span><strong class="negative">{{ formatPrice(info.target_low_price) }}</strong></div>
            <div class="data-row"><span>ANALYSTS</span><strong class="cyan">{{ info.number_of_analyst_opinions || 'N/A' }}</strong></div>
            <div class="rec-badge" v-if="info.recommendation_key">
              {{ formatRecommendation(info.recommendation_key) }}
            </div>
          </a-card>

          <a-card size="small" title="52 WEEK RANGE" class="fin-card yellow-header">
            <div class="data-row"><span>HIGH</span><strong class="positive">{{ formatPrice(info.fifty_two_week_high) }}</strong></div>
            <div class="data-row"><span>LOW</span><strong class="negative">{{ formatPrice(info.fifty_two_week_low) }}</strong></div>
            <div class="data-row"><span>AVG VOL</span><strong class="cyan">{{ formatLarge(info.average_volume) }}</strong></div>
          </a-card>

          <a-card size="small" title="PROFITABILITY" class="fin-card green-header">
            <div class="data-row"><span>GROSS MARGIN</span><strong class="positive">{{ formatPercent(info.gross_margins) }}</strong></div>
            <div class="data-row"><span>OPER. MARGIN</span><strong class="positive">{{ formatPercent(info.operating_margins) }}</strong></div>
            <div class="data-row"><span>PROFIT MARGIN</span><strong class="positive">{{ formatPercent(info.profit_margins) }}</strong></div>
            <div class="data-row"><span>ROA</span><strong class="cyan">{{ formatPercent(info.return_on_assets) }}</strong></div>
            <div class="data-row"><span>ROE</span><strong class="cyan">{{ formatPercent(info.return_on_equity) }}</strong></div>
          </a-card>

          <a-card size="small" title="FINANCIAL HEALTH" class="fin-card amber-header">
            <div class="data-row"><span>CASH</span><strong class="positive">{{ formatLarge(info.total_cash) }}</strong></div>
            <div class="data-row"><span>DEBT</span><strong class="negative">{{ formatLarge(info.total_debt) }}</strong></div>
            <div class="data-row"><span>FREE CF</span><strong class="cyan">{{ formatLarge(info.free_cashflow) }}</strong></div>
          </a-card>
        </div>

      </div>
      <div v-else-if="!isLoading" class="empty-state">
        <a-empty description="Search for a symbol to load research data" />
      </div>
    </a-spin>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import StockKlineChart from './StockKlineChart.vue'

export default {
  name: 'OverviewTab',
  components: {
    StockKlineChart
  },
  data () {
    return {
      periods: [
        { label: '1M', value: '1mo' },
        { label: '3M', value: '3mo' },
        { label: '6M', value: '6mo' },
        { label: '1Y', value: '1y' },
        { label: '5Y', value: '5y' }
      ]
    }
  },
  computed: {
    ...mapState('equity', ['currentSymbol', 'currentPeriod', 'info', 'quote', 'history', 'coreLoading', 'historyLoading']),
    isLoading () {
      return this.coreLoading
    },
    hasData () {
      return this.currentSymbol && !this.coreLoading && Object.keys(this.info).length > 0
    }
  },
  methods: {
    changePeriod (period) {
      this.currentPeriod = period
      // Dispatch loadCoreSymbolData with period
      if (this.currentSymbol) {
        this.$store.dispatch('equity/loadCoreSymbolData', { symbol: this.currentSymbol, period })
      }
    },

    // Formatters
    formatPrice (val) {
      if (!val) return '—'
      const num = parseFloat(val)
      if (isNaN(num)) return '—'
      return '$' + num.toFixed(2)
    },
    formatNumber (val) {
      if (!val) return 'N/A'
      return parseFloat(val).toFixed(2)
    },
    formatPercent (val) {
      if (val === null || val === undefined) return 'N/A'
      const num = parseFloat(val)
      if (isNaN(num)) return 'N/A'
      return (num * 100).toFixed(2) + '%'
    },
    formatLarge (val) {
      if (!val) return '—'
      const num = parseFloat(val)
      const absNum = Math.abs(num)
      if (isNaN(num)) return '—'
      let formatted = ''
      if (absNum >= 1e12) formatted = (num / 1e12).toFixed(2) + 'T'
      else if (absNum >= 1e9) formatted = (num / 1e9).toFixed(2) + 'B'
      else if (absNum >= 1e6) formatted = (num / 1e6).toFixed(2) + 'M'
      else formatted = new Intl.NumberFormat().format(num)
      return '$' + formatted
    },
    formatRecommendation (key) {
      if (!key) return ''
      return key.toUpperCase().replace(/_/g, ' ')
    }
  }
}
</script>

<style scoped lang="less">
.overview-tab {
  padding: 16px;
}

.overview-grid {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.column {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.left-col { flex: 0 0 260px; }
.right-col { flex: 0 0 260px; }
.center-col { flex: 1; min-width: 0; }

.fin-card {
  background: #ffffff;
  border-radius: 4px;
  border: 1px solid #e8e8e8;

  :deep(.ant-card-head) {
    min-height: 36px;
    padding: 0 12px;
    border-bottom: 1px solid #f0f0f0;
  }

  :deep(.ant-card-head-title) {
    padding: 8px 0;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 1px;
  }

  :deep(.ant-card-body) {
    padding: 12px;
  }

  &.amber-header :deep(.ant-card-head-title) { color: #faad14; }
  &.cyan-header :deep(.ant-card-head-title) { color: #13c2c2; }
  &.purple-header :deep(.ant-card-head-title) { color: #722ed1; }
  &.magenta-header :deep(.ant-card-head-title) { color: #eb2f96; }
  &.yellow-header :deep(.ant-card-head-title) { color: #fadb14; }
  &.green-header :deep(.ant-card-head-title) { color: #52c41a; }
}

.data-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;

  span {
    font-size: 11px;
    color: #8c8c8c;
    font-weight: 600;
  }

  strong {
    font-size: 13px;
    font-weight: 600;
    font-family: 'Consolas', monospace;
  }
}

.chart-panel {
  background: #ffffff;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  padding: 12px;
}

.chart-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;

  .period-label {
    font-size: 12px;
    font-weight: 600;
    color: #8c8c8c;
  }

  .period-buttons {
    display: flex;
    gap: 8px;
  }

  .period-btn {
    background: transparent;
    border: 1px solid #d9d9d9;
    color: #8c8c8c;
    border-radius: 4px;
    padding: 4px 12px;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      border-color: #faad14;
      color: #faad14;
    }

    &.active {
      background: #faad14;
      border-color: #faad14;
      color: #ffffff;
    }
  }
}

.chart-body {
  height: 400px;
  width: 100%;
}

.company-desc-panel {
  background: #ffffff;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  padding: 16px;

  .panel-title {
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 1px;
    margin-bottom: 8px;
    color: #13c2c2;
  }

  .desc-text {
    font-size: 13px;
    line-height: 1.6;
    color: #595959;
    margin: 0;
  }
}

.rec-badge {
  background: #f5f5f5;
  color: #595959;
  border-radius: 4px;
  padding: 6px;
  text-align: center;
  font-size: 12px;
  font-weight: 700;
  margin-top: 12px;
}

/* Colors */
.cyan { color: #13c2c2 !important; }
.positive { color: #52c41a !important; }
.negative { color: #f5222d !important; }
.text-primary { color: #262626 !important; }
.yellow { color: #d4b106 !important; }

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}
</style>
