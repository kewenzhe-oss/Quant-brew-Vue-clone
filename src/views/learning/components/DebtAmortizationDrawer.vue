<template>
  <a-drawer
    :title="$t('learning.debt.drawerTitle')"
    width="720"
    :visible="visible"
    :body-style="{ paddingBottom: '80px', background: 'var(--color-bg)', color: 'var(--color-text)' }"
    @close="onClose"
    :destroyOnClose="false"
  >
    <a-tabs v-model="activeTab" @change="handleTabChange" class="sandbox-tabs">
      <!-- Tab 1: Single Loan Amortization -->
      <a-tab-pane key="amortization" :tab="$t('learning.debt.tabAmortization')">
        <a-form-model layout="vertical" :model="loanForm" class="sandbox-form">
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-model-item :label="$t('learning.debt.amount')">
                <a-input-number
                  v-model="loanForm.amount"
                  :min="1"
                  :formatter="value => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                  :parser="value => value.replace(/¥\s?|(,*)/g, '')"
                  style="width: 100%"
                />
              </a-form-model-item>
            </a-col>
            <a-col :span="12">
              <a-form-model-item :label="$t('learning.debt.rate')">
                <a-input-number
                  v-model="loanForm.rate"
                  :min="0"
                  :step="0.01"
                  style="width: 100%"
                />
              </a-form-model-item>
            </a-col>
          </a-row>

          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-model-item :label="$t('learning.debt.years')">
                <a-input-number
                  v-model="loanForm.years"
                  :min="1"
                  :max="100"
                  style="width: 100%"
                />
              </a-form-model-item>
            </a-col>
            <a-col :span="12">
              <a-form-model-item :label="$t('learning.debt.repayMode')">
                <a-select v-model="loanForm.repayMode" style="width: 100%">
                  <a-select-option value="annuity">{{ $t('learning.debt.mode.annuity') }}</a-select-option>
                  <a-select-option value="principal">{{ $t('learning.debt.mode.principal') }}</a-select-option>
                </a-select>
              </a-form-model-item>
            </a-col>
          </a-row>

          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-model-item :label="$t('learning.debt.paymentsPerYear')">
                <a-select v-model="loanForm.paymentsPerYear" style="width: 100%">
                  <a-select-option :value="12">{{ $t('learning.debt.freq.12') }}</a-select-option>
                  <a-select-option :value="6">{{ $t('learning.debt.freq.6') }}</a-select-option>
                  <a-select-option :value="4">{{ $t('learning.debt.freq.4') }}</a-select-option>
                </a-select>
              </a-form-model-item>
            </a-col>
          </a-row>

          <a-row :gutter="16" style="margin-top: -8px; margin-bottom: 16px;">
            <a-col :span="24">
              <div class="mode-desc" style="font-size: 12px; color: var(--color-text-secondary); line-height: 1.4; padding: 8px 12px; background: var(--color-surface-3); border-radius: 4px;">
                {{ loanForm.repayMode === 'annuity' ? $t('learning.debt.mode.annuity.desc') : $t('learning.debt.mode.principal.desc') }}
              </div>
            </a-col>
          </a-row>

          <div class="actions-panel">
            <a-button type="primary" @click="runLoanCalc" class="btn-primary-custom">
              {{ $t('learning.asset.btnCalculate') }}
            </a-button>
            <a-button @click="resetLoanForm" style="margin-left: 8px">
              {{ $t('learning.asset.btnReset') }}
            </a-button>
          </div>
        </a-form-model>

        <!-- Result Summary -->
        <div v-if="loanResult" class="result-summary">
          <h3>{{ $t('learning.debt.result.title') }}</h3>
          <div class="summary-grid">
            <div class="summary-item summary-item-wide" v-if="loanForm.repayMode === 'annuity'">
              <span class="label">{{ $t('learning.debt.result.monthlyPayFixed') }}</span>
              <span class="value highlight">¥ {{ formatMoney(loanResult.firstPayment) }}</span>
            </div>
            <div class="summary-item summary-item-wide" v-else>
              <span class="label">{{ $t('learning.debt.result.title') }}</span>
              <span class="value font-semibold" style="font-size: 13px">
                {{ $t('learning.debt.result.monthlyPay', { first: formatMoney(loanResult.firstPayment), last: formatMoney(loanResult.lastPayment), avg: formatMoney(loanResult.totalPayment / loanResult.totalPeriods) }) }}
              </span>
            </div>
            <div class="summary-item">
              <span class="label">{{ $t('learning.debt.result.totalInterest') }}</span>
              <span class="value text-warning">¥ {{ formatMoney(loanResult.totalInterest) }}</span>
            </div>
            <div class="summary-item">
              <span class="label">{{ $t('learning.debt.result.totalPayment') }}</span>
              <span class="value">¥ {{ formatMoney(loanResult.totalPayment) }}</span>
            </div>
          </div>
          <div class="insights-block" v-if="comparisonData" style="margin-top: 16px; padding: 12px; background: var(--color-surface-3); border-left: 4px solid var(--color-warning); border-radius: 4px;">
            <div class="insights-title" style="font-weight: 600; display: flex; align-items: center; gap: 6px; margin-bottom: 4px; color: var(--color-text);">
              <a-icon type="dashboard" style="color: var(--color-warning);" />
              <span>{{ $t('learning.debt.result.comparison') }}</span>
            </div>
            <p class="insights-content" style="margin: 0; font-size: 13px; color: var(--color-text-secondary); line-height: 1.5;">
              {{ $t('learning.debt.result.comparisonText', {
                savings: formatMoney(comparisonData.savings),
                premium: comparisonData.premium
              }) }}
            </p>
          </div>
        </div>

        <!-- Amortization Chart -->
        <div class="chart-wrapper">
          <h4 class="chart-title">{{ $t('learning.debt.chart.balanceTitle') }}</h4>
          <div ref="balanceChartDom" class="chart-container"></div>
          <p class="chart-note">{{ $t('learning.debt.chart.balanceDesc') }}</p>
        </div>

        <!-- Expandable Table -->
        <div v-if="loanResult" class="table-wrapper">
          <div class="table-toggle-btn" @click="showTable = !showTable">
            <span>{{ showTable ? $t('learning.debt.table.hide') : $t('learning.debt.table.show') }}</span>
            <a-icon :type="showTable ? 'up' : 'down'" />
          </div>

          <div v-show="showTable" class="table-container">
            <table class="grid-table">
              <thead>
                <tr>
                  <th>{{ $t('learning.debt.table.period') }}</th>
                  <th>{{ $t('learning.debt.table.startBal') }}</th>
                  <th>{{ $t('learning.debt.table.pay') }}</th>
                  <th>{{ $t('learning.debt.table.principal') }}</th>
                  <th>{{ $t('learning.debt.table.interest') }}</th>
                  <th>{{ $t('learning.debt.table.endBal') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in loanResult.schedule" :key="row.period">
                  <td>{{ row.period }}</td>
                  <td>¥ {{ formatMoney(row.startBalance) }}</td>
                  <td class="font-semibold">¥ {{ formatMoney(row.payment) }}</td>
                  <td>¥ {{ formatMoney(row.principal) }}</td>
                  <td class="text-warning">¥ {{ formatMoney(row.interest) }}</td>
                  <td>¥ {{ formatMoney(row.endBalance) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="disclaimer-text">
          {{ $t('learning.debt.warning.footer') }}
        </div>
      </a-tab-pane>

      <!-- Tab 2: Multi-Debt Compare -->
      <a-tab-pane key="portfolio" :tab="$t('learning.debt.tabPortfolio')">
        <div class="portfolio-panel">
          <div class="panel-header">
            <h4>{{ $t('learning.debt.portfolio.title') }}</h4>
            <div class="header-buttons">
              <a-button size="small" @click="addPortfolioItem">
                {{ $t('learning.debt.portfolio.addBtn') }}
              </a-button>
              <a-button size="small" type="danger" ghost @click="clearPortfolio" style="margin-left: 8px">
                {{ $t('learning.debt.portfolio.clearBtn') }}
              </a-button>
            </div>
          </div>

          <!-- Dynamic Debt Cards -->
          <div class="loans-list">
            <div v-for="(item, index) in portfolioLoans" :key="item.key" class="loan-item-card">
              <div class="loan-card-top">
                <span class="title">
                  {{ $t('learning.debt.portfolio.loanName', { index: index + 1 }) }}
                </span>
                <a-button size="small" type="link" class="text-danger" @click="removePortfolioItem(item.key)">
                  {{ $t('learning.debt.portfolio.remove') }}
                </a-button>
              </div>

              <a-row :gutter="12">
                <a-col :span="12">
                  <a-form-model-item :label="$t('learning.debt.amount')">
                    <a-input-number
                      v-model="item.amount"
                      :min="1"
                      :formatter="value => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                      :parser="value => value.replace(/¥\s?|(,*)/g, '')"
                      style="width: 100%"
                    />
                  </a-form-model-item>
                </a-col>
                <a-col :span="12">
                  <a-form-model-item :label="$t('learning.debt.rate')">
                    <a-input-number
                      v-model="item.rate"
                      :min="0"
                      :step="0.01"
                      style="width: 100%"
                    />
                  </a-form-model-item>
                </a-col>
              </a-row>

              <a-row :gutter="12">
                <a-col :span="12">
                  <a-form-model-item :label="$t('learning.debt.years')">
                    <a-input-number
                      v-model="item.years"
                      :min="1"
                      style="width: 100%"
                    />
                  </a-form-model-item>
                </a-col>
                <a-col :span="12">
                  <a-form-model-item :label="$t('learning.debt.repayMode')">
                    <a-select v-model="item.repayMode" style="width: 100%">
                      <a-select-option value="annuity">{{ $t('learning.debt.mode.annuity') }}</a-select-option>
                      <a-select-option value="principal">{{ $t('learning.debt.mode.principal') }}</a-select-option>
                    </a-select>
                  </a-form-model-item>
                </a-col>
              </a-row>
            </div>
          </div>

          <div style="text-align: center; margin-top: 16px;">
            <a-button type="primary" @click="runPortfolioCalc" class="btn-primary-custom" style="width: 200px">
              {{ $t('learning.debt.portfolio.calcBtn') }}
            </a-button>
          </div>
        </div>

        <!-- Portfolio Result Summary -->
        <div v-if="portfolioResult" class="result-summary" style="margin-top: 24px">
          <h3>{{ $t('learning.debt.portfolio.summaryTitle') }}</h3>
          <div class="summary-grid">
            <div class="summary-item">
              <span class="label">{{ $t('learning.debt.portfolio.totalLoans') }}</span>
              <span class="value font-semibold">{{ portfolioResult.totalLoans }}</span>
            </div>
            <div class="summary-item">
              <span class="label">{{ $t('learning.debt.portfolio.totalPrincipal') }}</span>
              <span class="value">¥ {{ formatMoney(portfolioResult.totalPrincipal) }}</span>
            </div>
            <div class="summary-item">
              <span class="label">{{ $t('learning.debt.portfolio.totalPay') }}</span>
              <span class="value">¥ {{ formatMoney(portfolioResult.totalPayment) }}</span>
            </div>
            <div class="summary-item">
              <span class="label">{{ $t('learning.debt.portfolio.totalInterest') }}</span>
              <span class="value text-warning">¥ {{ formatMoney(portfolioResult.totalInterest) }}</span>
            </div>
            <div class="summary-item summary-item-wide">
              <span class="label">{{ $t('learning.debt.portfolio.totalMonthly') }}</span>
              <span class="value highlight">¥ {{ formatMoney(portfolioResult.monthlyCashoutFlow) }}</span>
            </div>
          </div>
          <div class="portfolio-notes">
            {{ $t('learning.debt.portfolio.totalMonthlyDesc') }}
          </div>
        </div>

        <div class="disclaimer-text">
          {{ $t('learning.debt.warning.footer') }}
        </div>
      </a-tab-pane>
    </a-tabs>
  </a-drawer>
</template>

<script>
import * as echarts from 'echarts'
import { calculateAmortizationSchedule } from '@/utils/finance'
import { sandboxMixin } from '../sandboxMixin'

export default {
  name: 'DebtAmortizationDrawer',
  mixins: [sandboxMixin],
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      activeTab: 'amortization',
      showTable: false,
      loanForm: {
        amount: 1000000,
        rate: 2.25,
        years: 30,
        paymentsPerYear: 12,
        repayMode: 'annuity'
      },
      loanResult: null,
      portfolioLoans: [
        { key: 1, amount: 1000000, rate: 2.25, years: 30, repayMode: 'annuity' }
      ],
      portfolioResult: null,
      balanceChart: null,
      showAdvancedLoan: false,
      comparisonData: null
    }
  },
  computed: {},
  watch: {
    visible (newVal) {
      if (newVal) {
        this.$nextTick(() => {
          this.initAllCalculations()
        })
      }
    },
    isDark () {
      this.$nextTick(() => {
        this.recreateCharts()
      })
    }
  },
  mounted () {
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy () {
    window.removeEventListener('resize', this.handleResize)
    this.disposeCharts()
  },
  methods: {
    onClose () {
      this.$emit('close')
    },
    handleTabChange () {
      this.$nextTick(() => {
        this.recreateCharts()
      })
    },
    initAllCalculations () {
      this.runLoanCalc()
      this.runPortfolioCalc()
    },

    runLoanCalc () {
      const { repayMode, amount, rate, years, paymentsPerYear } = this.loanForm
      this.loanResult = calculateAmortizationSchedule(repayMode, amount, rate, years, paymentsPerYear)

      // Comparative calculation for EMI vs EPR
      const scheduleAnnuity = calculateAmortizationSchedule('annuity', amount, rate, years, paymentsPerYear)
      const schedulePrincipal = calculateAmortizationSchedule('principal', amount, rate, years, paymentsPerYear)

      const interestSavings = Math.abs(scheduleAnnuity.totalInterest - schedulePrincipal.totalInterest)
      const firstPaymentAnnuity = scheduleAnnuity.firstPayment
      const firstPaymentPrincipal = schedulePrincipal.firstPayment
      const paymentPremiumPercent = firstPaymentAnnuity > 0
        ? ((firstPaymentPrincipal - firstPaymentAnnuity) / firstPaymentAnnuity) * 100
        : 0

      this.comparisonData = {
        savings: interestSavings,
        premium: paymentPremiumPercent.toFixed(1)
      }

      this.$nextTick(() => {
        this.renderBalanceChart()
      })
    },
    resetLoanForm () {
      this.loanForm = {
        amount: 1000000,
        rate: 2.25,
        years: 30,
        paymentsPerYear: 12,
        repayMode: 'annuity'
      }
      this.showTable = false
      this.runLoanCalc()
    },
    addPortfolioItem () {
      this.portfolioLoans.push({
        key: Date.now(),
        amount: 500000,
        rate: 2.5,
        years: 20,
        repayMode: 'annuity'
      })
    },
    removePortfolioItem (key) {
      this.portfolioLoans = this.portfolioLoans.filter(item => item.key !== key)
      if (this.portfolioLoans.length === 0) {
        this.addPortfolioItem()
      }
    },
    clearPortfolio () {
      this.portfolioLoans = [
        { key: Date.now(), amount: 1000000, rate: 2.25, years: 30, repayMode: 'annuity' }
      ]
      this.portfolioResult = null
    },
    runPortfolioCalc () {
      let totalLoans = 0
      let totalPrincipal = 0
      let totalPayment = 0
      let totalInterest = 0
      let monthlyCashoutFlow = 0

      this.portfolioLoans.forEach(loan => {
        const scheduleData = calculateAmortizationSchedule(
          loan.repayMode,
          loan.amount,
          loan.rate,
          loan.years,
          12 // Fixed to monthly for portfolio calculations
        )
        totalLoans++
        totalPrincipal += loan.amount
        totalPayment += scheduleData.totalPayment
        totalInterest += scheduleData.totalInterest

        // Calculate periodic monthly payment sum
        const avgMonthly = scheduleData.totalPayment / scheduleData.totalPeriods
        monthlyCashoutFlow += avgMonthly
      })

      this.portfolioResult = {
        totalLoans,
        totalPrincipal,
        totalPayment,
        totalInterest,
        monthlyCashoutFlow
      }
    },
    renderBalanceChart () {
      if (!this.$refs.balanceChartDom) return

      if (!this.balanceChart) {
        this.balanceChart = echarts.init(this.$refs.balanceChartDom)
      }

      const isDark = this.isDark
      const themeColors = isDark
        ? { text: 'rgba(255,255,255,0.6)', border: '#333', line: '#7bc59a' }
        : { text: '#6b7280', border: '#e6e2dc', line: '#1d6f4f' }

      const scheduleData = this.loanResult.schedule
      const xLabels = scheduleData.map(row => row.period)
      const balances = scheduleData.map(row => row.endBalance)

      const option = {
        backgroundColor: 'transparent',
        grid: { top: 20, right: 10, bottom: 25, left: 60 },
        tooltip: {
          trigger: 'axis',
          backgroundColor: isDark ? '#252525' : '#ffffff',
          borderColor: isDark ? '#3a3a3a' : '#ece9e4',
          textStyle: { color: isDark ? '#fff' : '#000', fontSize: 12 },
          formatter: (params) => {
            return `<div style="font-size:11px; margin-bottom:4px; font-weight:600">Period ${params[0].name}</div>
              <div style="display:flex; justify-content:space-between; gap:20px; font-size:11px">
                <span style="color:var(--color-text-muted)">Remaining Principal:</span>
                <span style="font-weight:600">¥ ${Math.round(params[0].value).toLocaleString('zh-CN')}</span>
              </div>`
          }
        },
        xAxis: {
          type: 'category',
          data: xLabels,
          axisLine: { lineStyle: { color: themeColors.border } },
          axisLabel: { color: themeColors.text, fontSize: 10, interval: Math.floor(xLabels.length / 6) }
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            color: themeColors.text,
            fontSize: 10,
            formatter: value => `¥${(value / 10000).toFixed(0)}w`
          },
          splitLine: { lineStyle: { color: themeColors.border, type: 'dashed' } }
        },
        series: [
          {
            name: 'Remaining Balance',
            type: 'line',
            data: balances,
            smooth: true,
            lineStyle: { width: 2, color: themeColors.line },
            itemStyle: { color: themeColors.line },
            showSymbol: false,
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: isDark ? 'rgba(123, 197, 154, 0.15)' : 'rgba(29, 111, 79, 0.08)' },
                { offset: 1, color: 'rgba(0,0,0,0)' }
              ])
            }
          }
        ]
      }

      this.balanceChart.setOption(option, true)
    },
    recreateCharts () {
      this.disposeCharts()
      if (this.activeTab === 'amortization' && this.loanResult) {
        this.renderBalanceChart()
      }
    },
    disposeCharts () {
      if (this.balanceChart) {
        this.balanceChart.dispose()
        this.balanceChart = null
      }
    },
    handleResize () {
      if (this.balanceChart) this.balanceChart.resize()
    }
  }
}
</script>

<style scoped>
.sandbox-tabs >>> .ant-tabs-bar {
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 24px;
}

.sandbox-tabs >>> .ant-tabs-tab {
  color: var(--color-text-muted);
}

.sandbox-tabs >>> .ant-tabs-tab-active {
  color: var(--color-primary);
  font-weight: 650;
}

.sandbox-tabs >>> .ant-tabs-ink-bar {
  background-color: var(--color-primary);
}

.sandbox-form {
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
}

.sandbox-form >>> .ant-form-item-label label {
  color: var(--color-text-muted);
  font-size: 13px;
}

.sandbox-form >>> .ant-input-number,
.sandbox-form >>> .ant-select-selection,
.sandbox-form >>> .ant-radio-button-wrapper {
  background-color: var(--color-surface) !important;
  border-color: var(--color-border) !important;
  color: var(--color-text) !important;
  border-radius: 4px;
}

.sandbox-form >>> .ant-radio-button-wrapper-checked {
  background-color: var(--color-primary) !important;
  border-color: var(--color-primary) !important;
  color: var(--color-bg) !important;
  box-shadow: none !important;
}

.mode-desc {
  margin-top: 8px;
  font-size: 11.5px;
  color: var(--color-text-faint);
  line-height: 1.5;
}

.btn-primary-custom {
  background-color: var(--color-primary) !important;
  border-color: var(--color-primary) !important;
  color: var(--color-bg) !important;
  font-weight: 600;
}

.btn-primary-custom:hover {
  opacity: 0.9;
}

.actions-panel {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}

.result-summary {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
}

.result-summary h3 {
  color: var(--color-text);
  font-size: 15px;
  font-weight: 650;
  margin-top: 0;
  margin-bottom: 16px;
  border-left: 3px solid var(--color-primary);
  padding-left: 10px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.summary-item {
  display: flex;
  flex-direction: column;
}

.summary-item-wide {
  grid-column: span 2;
}

.summary-item .label {
  color: var(--color-text-faint);
  font-size: 11px;
  text-transform: uppercase;
  margin-bottom: 4px;
}

.summary-item .value {
  color: var(--color-text);
  font-size: 16px;
  font-family: 'SF Mono', 'Fira Mono', monospace;
}

.summary-item .value.highlight {
  color: var(--color-primary);
  font-weight: 650;
  font-size: 18px;
}

.summary-item .value.text-warning {
  color: #f59e0b;
}

.chart-wrapper {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
}

.chart-title {
  color: var(--color-text);
  font-size: 13px;
  font-weight: 600;
  margin-top: 0;
  margin-bottom: 16px;
}

.chart-container {
  width: 100%;
  height: 250px;
}

.chart-note {
  font-size: 11px;
  color: var(--color-text-faint);
  margin-top: 12px;
  margin-bottom: 0;
}

/* Table Toggle Styling */
.table-wrapper {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  margin-bottom: 24px;
  overflow: hidden;
}

.table-toggle-btn {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 20px;
  cursor: pointer;
  user-select: none;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text);
  transition: background-color 0.2s;
}

.table-toggle-btn:hover {
  background-color: var(--color-surface-2);
}

.table-container {
  max-height: 350px;
  overflow-y: auto;
  border-top: 1px solid var(--color-border);
}

.grid-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  text-align: right;
}

.grid-table th,
.grid-table td {
  padding: 10px 14px;
  border-bottom: 1px solid var(--color-border);
}

.grid-table th {
  font-weight: 500;
  color: var(--color-text-muted);
  background-color: var(--color-surface-2);
  position: sticky;
  top: 0;
  z-index: 1;
}

.grid-table th:first-child,
.grid-table td:first-child {
  text-align: center;
}

.grid-table tbody tr:hover {
  background-color: var(--color-surface-2);
}

.disclaimer-text {
  font-size: 11px;
  color: var(--color-text-faint);
  line-height: 1.6;
}

/* Portfolio Panel Styling */
.portfolio-panel {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 20px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.panel-header h4 {
  margin: 0;
  color: var(--color-text);
  font-size: 14px;
  font-weight: 650;
}

.loans-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-height: 480px;
  overflow-y: auto;
  padding-right: 4px;
}

.loan-item-card {
  border: 1px solid var(--color-border);
  border-radius: 6px;
  padding: 16px 16px 4px;
  background: var(--color-surface-2);
}

.loan-card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.loan-card-top .title {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--color-text);
}

.loan-item-card >>> .ant-form-item {
  margin-bottom: 12px;
}

.loan-item-card >>> .ant-form-item-label {
  line-height: 1.5;
  margin-bottom: 2px;
}

.loan-item-card >>> .ant-form-item-label label {
  font-size: 11px;
  color: var(--color-text-muted);
}

.text-danger {
  color: #ef4444 !important;
}

.portfolio-notes {
  margin-top: 12px;
  font-size: 11px;
  color: var(--color-text-faint);
  line-height: 1.5;
}
</style>
