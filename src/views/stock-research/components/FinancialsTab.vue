<template>
  <div class="financials-tab">
    <a-spin :spinning="isLoading" :tip="$t('stockResearch.financials.loading')">
      <div v-if="hasData" class="financials-container">

        <div class="financials-header">
          <a-radio-group v-model="activeView" button-style="solid">
            <a-radio-button value="income">{{ $t('stockResearch.financials.incomeStatement') }}</a-radio-button>
            <a-radio-button value="balance">{{ $t('stockResearch.financials.balanceSheet') }}</a-radio-button>
            <a-radio-button value="cash">{{ $t('stockResearch.financials.cashFlow') }}</a-radio-button>
          </a-radio-group>
          <div v-if="currentSymbol" class="external-link-container">
            <a
              :href="roicUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="external-roic-link"
              id="roic-external-research-link"
            >
              {{ $t('stockResearch.financials.externalAnalysisPrompt') }}
            </a>
          </div>
        </div>

        <!-- Statement helper copy -->
        <div class="statement-helper">
          <span v-if="activeView === 'income'">
            {{ $t('stockResearch.financials.incomeHelper') }}
          </span>
          <span v-else-if="activeView === 'balance'">
            {{ $t('stockResearch.financials.balanceHelper') }}
          </span>
          <span v-else-if="activeView === 'cash'">
            {{ $t('stockResearch.financials.cashHelper') }}
          </span>
        </div>

        <div class="financials-content">
          <a-table
            :columns="tableColumns"
            :data-source="tableData"
            :pagination="false"
            :scroll="{ x: 'max-content' }"
            size="small"
            rowKey="metricKey"
            class="financials-table"
          >
            <template slot="metric" slot-scope="text">
              <span class="metric-name">{{ text }}</span>
            </template>
            <!-- Dynamic columns for dates -->
            <template v-for="col in dateColumns" :slot="col.dataIndex" slot-scope="text, record">
              <span :key="col.dataIndex" :class="getValueClass(text)">
                {{ formatValue(record.metricKey, text) }}
              </span>
            </template>
          </a-table>
        </div>

      </div>
      <div v-else-if="!isLoading" class="empty-state">
        <a-empty :description="$t('stockResearch.financials.noData')" />
      </div>
    </a-spin>
  </div>
</template>

<script>
import { mapState } from 'vuex'

// ─────────────────────────────────────────────────────────────────────────────
// Label map: snake_key → display label
// ─────────────────────────────────────────────────────────────────────────────
const LABEL_MAP = {
  revenue: 'Revenue',
  cost_of_revenue: 'Cost of Revenue',
  gross_profit: 'Gross Profit',
  operating_income: 'Operating Income',
  net_income: 'Net Income',
  ebitda: 'EBITDA',
  ebit: 'EBIT',
  interest_expense: 'Interest Expense',
  eps_diluted: 'Diluted EPS',
  gross_margin: 'Gross Margin',
  operating_margin: 'Operating Margin',
  net_margin: 'Net Margin',
  operating_cash_flow: 'Operating Cash Flow',
  capex: 'CapEx',
  free_cash_flow: 'Free Cash Flow',
  dividends_paid: 'Dividends Paid',
  share_buybacks: 'Share Buybacks',
  fcf_margin: 'FCF Margin',
  capex_to_revenue: 'CapEx / Revenue',
  total_assets: 'Total Assets',
  current_assets: 'Current Assets',
  cash: 'Cash & Equivalents',
  receivables: 'Receivables',
  inventory: 'Inventory',
  net_ppe: 'Net PPE',
  total_liabilities: 'Total Liabilities',
  total_debt: 'Total Debt',
  long_term_debt: 'Long-Term Debt',
  short_term_debt: 'Short-Term Debt',
  net_debt: 'Net Debt',
  total_equity: 'Total Equity',
  working_capital: 'Working Capital',
  current_ratio: 'Current Ratio',
  quick_ratio: 'Quick Ratio',
  debt_to_equity: 'Debt / Equity',
  debt_to_assets: 'Debt / Assets',
  roe: 'ROE',
  roa: 'ROA',
  roic: 'ROIC',
  asset_turnover: 'Asset Turnover',
  equity_multiplier: 'Equity Multiplier',
  dupont_roe: 'DuPont ROE'
}

// ─────────────────────────────────────────────────────────────────────────────
// Field type classification
// ─────────────────────────────────────────────────────────────────────────────
const PERCENT_FIELDS = new Set([
  'gross_margin', 'operating_margin', 'net_margin',
  'fcf_margin', 'capex_to_revenue',
  'roe', 'roa', 'roic', 'dupont_roe'
])

const RATIO_FIELDS = new Set([
  'current_ratio', 'quick_ratio',
  'debt_to_equity', 'debt_to_assets',
  'asset_turnover', 'equity_multiplier'
])

const EPS_FIELDS = new Set(['eps_diluted'])

// Everything else is treated as money (B/M/K)
const MONEY_FIELDS = new Set([
  'revenue', 'cost_of_revenue', 'gross_profit', 'operating_income', 'net_income',
  'ebitda', 'ebit', 'interest_expense',
  'operating_cash_flow', 'capex', 'free_cash_flow', 'dividends_paid', 'share_buybacks',
  'total_assets', 'current_assets', 'cash', 'receivables', 'inventory', 'net_ppe',
  'total_liabilities', 'total_debt', 'long_term_debt', 'short_term_debt',
  'net_debt', 'total_equity', 'working_capital'
])

export default {
  name: 'FinancialsTab',
  data () {
    return {
      activeView: 'income'
    }
  },
  computed: {
    ...mapState('equity', ['financials', 'financialsLoading', 'currentSymbol']),
    roicUrl () {
      if (!this.currentSymbol) return ''
      return `https://www.roic.ai/quote/${encodeURIComponent(this.currentSymbol.trim().toUpperCase())}`
    },
    isLoading () {
      return this.financialsLoading
    },
    hasData () {
      return this.financials && this.financials.success && this.financials.data
    },
    activeStatement () {
      if (!this.hasData) return []
      const norm = this.financials.data.normalized
      switch (this.activeView) {
        case 'income': return norm.income || []
        case 'balance': return norm.balance_sheet || []
        case 'cash': return norm.cash_flow || []
        default: return []
      }
    },
    dateColumns () {
      if (!this.activeStatement || this.activeStatement.length === 0) return []
      return this.activeStatement.map(row => ({
        title: row.date,
        dataIndex: row.date,
        scopedSlots: { customRender: row.date },
        align: 'right',
        width: 130
      }))
    },
    tableColumns () {
      return [
        {
          title: this.$t('stockResearch.financials.metricColumn'),
          dataIndex: 'metric',
          fixed: 'left',
          width: 220,
          scopedSlots: { customRender: 'metric' }
        },
        ...this.dateColumns
      ]
    },
    tableData () {
      if (!this.activeStatement || this.activeStatement.length === 0) return []

      const firstRow = this.activeStatement[0]
      const metrics = Object.keys(firstRow).filter(k => k !== 'date')

      return metrics.map(metric => {
        const transKey = 'stockResearch.metrics.' + metric
        const row = {
          metricKey: metric,
          metric: this.$te(transKey) ? this.$t(transKey) : (LABEL_MAP[metric] || this.toTitleCase(metric))
        }
        this.activeStatement.forEach(dateData => {
          row[dateData.date] = dateData[metric]
        })
        return row
      })
    }
  },
  methods: {
    toTitleCase (key) {
      if (!key) return ''
      return key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    },

    // ─── Field-aware formatter ───────────────────────────────────────────────
    formatValue (metricKey, val) {
      if (val === null || val === undefined) return '—'
      const num = parseFloat(val)
      if (isNaN(num)) return '—'

      // Percent fields: backend stores 0.469 → display 46.9%
      if (PERCENT_FIELDS.has(metricKey)) {
        return (num * 100).toFixed(1) + '%'
      }

      // Pure ratio fields: show 2 decimal places
      if (RATIO_FIELDS.has(metricKey)) {
        return num.toFixed(2)
      }

      // EPS: show 2 decimal, dollar-signed
      if (EPS_FIELDS.has(metricKey)) {
        return '$' + num.toFixed(2)
      }

      // Money fields: B / M scale
      if (MONEY_FIELDS.has(metricKey)) {
        return this.formatMoney(num)
      }

      // Fallback: if large, treat as money; if small treat as ratio
      const absNum = Math.abs(num)
      if (absNum >= 1e6) return this.formatMoney(num)
      return num.toFixed(2)
    },

    formatMoney (num) {
      const absNum = Math.abs(num)
      const sign = num < 0 ? '-' : ''
      if (absNum >= 1e12) return sign + '$' + (absNum / 1e12).toFixed(2) + 'T'
      if (absNum >= 1e9) return sign + '$' + (absNum / 1e9).toFixed(2) + 'B'
      if (absNum >= 1e6) return sign + '$' + (absNum / 1e6).toFixed(2) + 'M'
      if (absNum >= 1e3) return sign + '$' + (absNum / 1e3).toFixed(1) + 'K'
      return sign + '$' + absNum.toFixed(2)
    },

    getValueClass (val) {
      if (val === null || val === undefined) return 'neutral'
      const num = parseFloat(val)
      if (isNaN(num)) return 'neutral'
      if (num < 0) return 'negative'
      return 'value-default'
    }
  }
}
</script>

<style scoped lang="less">
.financials-tab {
  padding: 16px;
}

.financials-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: #ffffff;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  padding: 16px;
}

.financials-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;

  :deep(.ant-radio-button-wrapper) {
    font-weight: 600;
    font-size: 12px;
    letter-spacing: 1px;
  }

  :deep(.ant-radio-button-wrapper-checked) {
    background: #faad14;
    border-color: #faad14;
    color: #ffffff;
  }
}

.external-link-container {
  display: flex;
  align-items: center;
}

.external-roic-link {
  font-size: 12px;
  color: #8c8c8c;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s ease-in-out;
  padding: 4px 8px;
  border-radius: 4px;
  background: #f5f5f5;
  border: 1px solid #e8e8e8;
  display: inline-flex;
  align-items: center;

  &:hover {
    color: #faad14;
    background: #fffbe6;
    border-color: #ffe58f;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
}

.statement-helper {
  font-size: 13px;
  color: #8c8c8c;
  line-height: 1.5;
  padding: 6px 2px;
  border-left: 3px solid #faad14;
  padding-left: 12px;
  background: #fffbe6;
  border-radius: 0 4px 4px 0;
}

.financials-content {
  overflow-x: auto;
}

.financials-table {
  :deep(.ant-table-thead > tr > th) {
    background: #fafafa;
    font-size: 12px;
    font-weight: 700;
    color: #595959;
    white-space: nowrap;
  }

  :deep(.ant-table-tbody > tr > td) {
    padding: 6px 12px;
    font-size: 13px;
  }
}

.metric-name {
  font-weight: 600;
  color: #262626;
  font-size: 13px;
}

.value-default {
  font-family: 'Consolas', monospace;
  color: #262626;
}

.negative {
  font-family: 'Consolas', monospace;
  color: #f5222d;
}

.neutral {
  color: #bfbfbf;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}
</style>
