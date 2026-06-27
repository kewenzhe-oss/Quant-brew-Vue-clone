<template>
  <a-drawer
    :title="$t('learning.asset.drawerTitle')"
    width="720"
    :visible="visible"
    :body-style="{ paddingBottom: '80px', background: 'var(--color-bg)', color: 'var(--color-text)' }"
    @close="onClose"
    :destroyOnClose="false"
  >
    <a-tabs v-model="activeTab" @change="handleTabChange" class="sandbox-tabs">
      <!-- Tab 1: Compounding Simulation -->
      <a-tab-pane key="growth" :tab="$t('learning.asset.tabGrowth')">
        <a-form-model layout="vertical" :model="growthForm" class="sandbox-form">
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-model-item :label="$t('learning.asset.principal')">
                <a-input-number
                  v-model="growthForm.principal"
                  :min="0"
                  :formatter="value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                  :parser="value => value.replace(/\$\s?|(,*)/g, '')"
                  style="width: 100%"
                />
              </a-form-model-item>
            </a-col>
            <a-col :span="12">
              <a-form-model-item :label="$t('learning.asset.annualRate')">
                <a-input-number
                  v-model="growthForm.rate"
                  :min="0"
                  :step="0.1"
                  style="width: 100%"
                />
              </a-form-model-item>
            </a-col>
          </a-row>

          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-model-item :label="$t('learning.asset.years')">
                <a-input-number
                  v-model="growthForm.years"
                  :min="1"
                  :max="100"
                  style="width: 100%"
                />
              </a-form-model-item>
            </a-col>
            <a-col :span="12">
              <a-form-model-item :label="$t('learning.asset.interestType')">
                <a-radio-group v-model="growthForm.isCompound" style="width: 100%">
                  <a-radio-button :value="false" style="width: 50%; text-align: center">
                    {{ $t('learning.asset.simpleInterest') }}
                  </a-radio-button>
                  <a-radio-button :value="true" style="width: 50%; text-align: center">
                    {{ $t('learning.asset.compoundInterest') }}
                  </a-radio-button>
                </a-radio-group>
              </a-form-model-item>
            </a-col>
          </a-row>

          <a-row :gutter="16" v-if="growthForm.isCompound">
            <a-col :span="24">
              <a-form-model-item :label="$t('learning.asset.compoundFrequency')">
                <a-select v-model="growthForm.timesPerYear" style="width: 100%">
                  <a-select-option :value="1">{{ $t('learning.asset.frequency.1') }}</a-select-option>
                  <a-select-option :value="2">{{ $t('learning.asset.frequency.2') }}</a-select-option>
                  <a-select-option :value="4">{{ $t('learning.asset.frequency.4') }}</a-select-option>
                  <a-select-option :value="12">{{ $t('learning.asset.frequency.12') }}</a-select-option>
                  <a-select-option :value="52">{{ $t('learning.asset.frequency.52') }}</a-select-option>
                </a-select>
              </a-form-model-item>
            </a-col>
          </a-row>

          <div class="actions-panel">
            <a-button type="primary" @click="runGrowthCalc" class="btn-primary-custom">
              {{ $t('learning.asset.btnCalculate') }}
            </a-button>
            <a-button @click="resetGrowthForm" style="margin-left: 8px">
              {{ $t('learning.asset.btnReset') }}
            </a-button>
          </div>
        </a-form-model>

        <!-- Result Summary -->
        <div v-if="growthResult" class="result-summary">
          <h3>{{ $t('learning.asset.result.title') }}</h3>
          <div class="summary-grid">
            <div class="summary-item">
              <span class="label">{{ $t('learning.asset.result.type') }}</span>
              <span class="value font-semibold">
                {{ growthForm.isCompound ? $t('learning.asset.compoundInterest') : $t('learning.asset.simpleInterest') }}
              </span>
            </div>
            <div class="summary-item">
              <span class="label">{{ $t('learning.asset.result.finalAmount') }}</span>
              <span class="value highlight">$ {{ formatMoney(growthResult.finalAmount) }}</span>
            </div>
            <div class="summary-item">
              <span class="label">{{ $t('learning.asset.result.totalInvested') }}</span>
              <span class="value">$ {{ formatMoney(growthForm.principal) }}</span>
            </div>
            <div class="summary-item">
              <span class="label">{{ $t('learning.asset.result.totalInterest') }}</span>
              <span class="value text-success">$ {{ formatMoney(growthResult.totalInterest) }}</span>
            </div>
          </div>
          <div class="formula-block">
            <span class="title">{{ $t('learning.asset.result.formulaTitle') }}</span>
            <code class="code" v-if="growthForm.isCompound">A = P &times; (1 + r / n)^(n &times; t)</code>
            <code class="code" v-else>A = P &times; (1 + r &times; t)</code>
          </div>
          <div class="insights-block" style="margin-top: 16px; padding: 12px; background: var(--color-surface-3); border-left: 4px solid var(--color-success); border-radius: 4px;">
            <div class="insights-title" style="font-weight: 600; display: flex; align-items: center; gap: 6px; margin-bottom: 4px; color: var(--color-text);">
              <a-icon type="bulb" style="color: var(--color-success);" />
              <span>{{ $t('learning.asset.result.insight') }}</span>
            </div>
            <p class="insights-content" style="margin: 0; font-size: 13px; color: var(--color-text-secondary); line-height: 1.5;">
              {{ $t('learning.asset.result.insightText', {
                multiplier: growthForm.principal > 0 ? (growthResult.finalAmount / growthForm.principal).toFixed(2) : '0.00',
                ratio: growthResult.finalAmount > 0 ? ((growthResult.totalInterest / growthResult.finalAmount) * 100).toFixed(1) : '0.0'
              }) }}
            </p>
          </div>
        </div>

        <!-- Chart -->
        <div class="chart-wrapper">
          <h4 class="chart-title">{{ $t('learning.asset.chart.title') }}</h4>
          <div ref="growthChartDom" class="chart-container"></div>
          <p class="chart-note">{{ $t('learning.asset.chart.note') }}</p>
        </div>
      </a-tab-pane>

      <!-- Tab 2: Dollar Cost Averaging (DCA) -->
      <a-tab-pane key="dca" :tab="$t('learning.asset.tabDca')">
        <a-form-model layout="vertical" :model="dcaForm" class="sandbox-form">
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-model-item :label="$t('learning.asset.principal')">
                <a-input-number
                  v-model="dcaForm.principal"
                  :min="0"
                  :formatter="value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                  :parser="value => value.replace(/\$\s?|(,*)/g, '')"
                  style="width: 100%"
                />
              </a-form-model-item>
            </a-col>
            <a-col :span="12">
              <a-form-model-item :label="$t('learning.asset.dcaAmount')">
                <a-input-number
                  v-model="dcaForm.amount"
                  :min="0"
                  :formatter="value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                  :parser="value => value.replace(/\$\s?|(,*)/g, '')"
                  style="width: 100%"
                />
              </a-form-model-item>
            </a-col>
            <a-col :span="12">
              <a-form-model-item :label="$t('learning.asset.annualRate')">
                <a-input-number
                  v-model="dcaForm.rate"
                  :min="0"
                  :step="0.1"
                  style="width: 100%"
                />
              </a-form-model-item>
            </a-col>
            <a-col :span="12">
              <a-form-model-item :label="$t('learning.asset.years')">
                <a-input-number
                  v-model="dcaForm.years"
                  :min="1"
                  :max="100"
                  style="width: 100%"
                />
              </a-form-model-item>
            </a-col>
          </a-row>

          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-model-item :label="$t('learning.asset.dcaFrequency')">
                <a-select v-model="dcaForm.frequency" style="width: 100%">
                  <a-select-option :value="1">{{ $t('learning.asset.dcaFreq.1') }}</a-select-option>
                  <a-select-option :value="4">{{ $t('learning.asset.dcaFreq.4') }}</a-select-option>
                  <a-select-option :value="12">{{ $t('learning.asset.dcaFreq.12') }}</a-select-option>
                </a-select>
              </a-form-model-item>
            </a-col>
            <a-col :span="12">
              <a-form-model-item :label="$t('learning.asset.dcaTiming')">
                <a-select v-model="dcaForm.timing" style="width: 100%">
                  <a-select-option value="begin">{{ $t('learning.asset.timing.begin') }}</a-select-option>
                  <a-select-option value="end">{{ $t('learning.asset.timing.end') }}</a-select-option>
                </a-select>
              </a-form-model-item>
            </a-col>
          </a-row>

          <div class="actions-panel">
            <a-button type="primary" @click="runDcaCalc" class="btn-primary-custom">
              {{ $t('learning.asset.btnCalculate') }}
            </a-button>
            <a-button @click="resetDcaForm" style="margin-left: 8px">
              {{ $t('learning.asset.btnReset') }}
            </a-button>
          </div>
        </a-form-model>

        <!-- DCA Result Summary -->
        <div v-if="dcaResult" class="result-summary">
          <h3>{{ $t('learning.asset.result.title') }}</h3>
          <div class="summary-grid">
            <div class="summary-item">
              <span class="label">{{ $t('learning.asset.result.finalAmount') }}</span>
              <span class="value highlight">$ {{ formatMoney(dcaResult.fvTotal) }}</span>
            </div>
            <div class="summary-item">
              <span class="label">{{ $t('learning.asset.result.totalInvested') }}</span>
              <span class="value">$ {{ formatMoney(dcaResult.totalInvested) }}</span>
            </div>
            <div class="summary-item">
              <span class="label">{{ $t('learning.asset.result.totalReturn') }}</span>
              <span class="value text-success">$ {{ formatMoney(dcaResult.totalReturn) }}</span>
            </div>
            <div class="summary-item">
              <span class="label">{{ $t('learning.asset.result.overallReturn') }}</span>
              <span class="value font-semibold">{{ dcaResult.overallReturnRate.toFixed(2) }} %</span>
            </div>
          </div>
          <div class="insights-block" style="margin-top: 16px; margin-bottom: 16px; padding: 12px; background: var(--color-surface-3); border-left: 4px solid var(--color-success); border-radius: 4px;">
            <div class="insights-title" style="font-weight: 600; display: flex; align-items: center; gap: 6px; margin-bottom: 4px; color: var(--color-text);">
              <a-icon type="bulb" style="color: var(--color-success);" />
              <span>{{ $t('learning.asset.result.insight') }}</span>
            </div>
            <p class="insights-content" style="margin: 0; font-size: 13px; color: var(--color-text-secondary); line-height: 1.5;">
              {{ $t('learning.asset.result.dcaInsightText', {
                multiplier: dcaResult.totalInvested > 0 ? (dcaResult.fvTotal / dcaResult.totalInvested).toFixed(2) : '0.00',
                ratio: dcaResult.fvTotal > 0 ? ((dcaResult.totalReturn / dcaResult.fvTotal) * 100).toFixed(1) : '0.0'
              }) }}
            </p>
          </div>
          <a-alert
            :message="$t('learning.asset.warning.dca')"
            type="info"
            show-icon
            class="sandbox-alert"
          />
        </div>

        <!-- DCA Chart -->
        <div class="chart-wrapper">
          <h4 class="chart-title">{{ $t('learning.asset.chart.dcaTitle') }}</h4>
          <div ref="dcaChartDom" class="chart-container"></div>
        </div>
      </a-tab-pane>

      <!-- Tab 3: Recovery Ratio -->
      <a-tab-pane key="recovery" :tab="$t('learning.asset.tabRecovery')">
        <a-form-model layout="vertical" :model="recoveryForm" class="sandbox-form">
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-model-item :label="$t('learning.asset.initialInvestment')">
                <a-input-number
                  v-model="recoveryForm.initial"
                  :min="1"
                  :formatter="value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                  :parser="value => value.replace(/\$\s?|(,*)/g, '')"
                  style="width: 100%"
                />
              </a-form-model-item>
            </a-col>
            <a-col :span="12">
              <a-form-model-item :label="$t('learning.asset.currentValue')">
                <a-input-number
                  v-model="recoveryForm.current"
                  :min="0"
                  :formatter="value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                  :parser="value => value.replace(/\$\s?|(,*)/g, '')"
                  style="width: 100%"
                />
              </a-form-model-item>
            </a-col>
          </a-row>

          <div class="actions-panel">
            <a-button type="primary" @click="runRecoveryCalc" class="btn-primary-custom">
              {{ $t('learning.asset.btnCalculate') }}
            </a-button>
            <a-button @click="resetRecoveryForm" style="margin-left: 8px">
              {{ $t('learning.asset.btnReset') }}
            </a-button>
          </div>
        </a-form-model>

        <!-- Recovery Result Summary -->
        <div v-if="recoveryResult" class="result-summary">
          <h3>{{ $t('learning.asset.result.recoveryTitle') }}</h3>
          <div v-if="!recoveryResult.isLoss" class="recovery-positive">
            <span class="icon">✨</span>
            <span class="text">
              {{ $t('learning.asset.result.noLoss', { gain: recoveryResult.gain.toFixed(2) }) }}
            </span>
          </div>
          <div v-else class="recovery-negative">
            <div class="loss-alert">
              <span class="loss-badge">{{ recoveryResult.drawdown.toFixed(2) }}% Drawdown</span>
              <span class="arrow">➡️</span>
              <span class="recovery-badge">{{ recoveryResult.recovery.toFixed(2) }}% Recovery Required</span>
            </div>
            <p class="desc">
              {{ $t('learning.asset.result.lossDetail', { loss: recoveryResult.drawdown.toFixed(2), recovery: recoveryResult.recovery.toFixed(2) }) }}
            </p>
          </div>

          <a-alert
            :message="$t('learning.asset.warning.loss')"
            type="warning"
            show-icon
            class="sandbox-alert"
            style="margin-top: 16px"
          />
        </div>
      </a-tab-pane>
    </a-tabs>
  </a-drawer>
</template>

<script>
import * as echarts from 'echarts'
import {
  calculateInterestSeries,
  calculateDCASeries,
  calculateDrawdownRecovery
} from '@/utils/finance'
import { sandboxMixin } from '../sandboxMixin'

export default {
  name: 'AssetGrowthDrawer',
  mixins: [sandboxMixin],
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      activeTab: 'growth',
      growthForm: {
        principal: 10000,
        rate: 5,
        years: 10,
        isCompound: true,
        timesPerYear: 12
      },
      growthResult: null,
      dcaForm: {
        principal: 0,
        amount: 1000,
        rate: 6,
        years: 10,
        frequency: 12,
        timing: 'end'
      },
      dcaResult: null,
      recoveryForm: {
        initial: 10000,
        current: 7000
      },
      recoveryResult: null,
      growthChart: null,
      dcaChart: null,
      showAdvancedGrowth: false,
      showAdvancedDca: false
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
      this.runGrowthCalc()
      this.runDcaCalc()
      this.runRecoveryCalc()
    },

    runGrowthCalc () {
      const { principal, rate, years, isCompound, timesPerYear } = this.growthForm
      const series = calculateInterestSeries(principal, rate, years, timesPerYear)

      const finalAmount = isCompound ? series.compound[years] : series.simple[years]
      const totalInterest = finalAmount - principal

      this.growthResult = {
        finalAmount,
        totalInterest,
        series
      }

      this.$nextTick(() => {
        this.renderGrowthChart()
      })
    },
    resetGrowthForm () {
      this.growthForm = {
        principal: 10000,
        rate: 5,
        years: 10,
        isCompound: true,
        timesPerYear: 12
      }
      this.runGrowthCalc()
    },
    runDcaCalc () {
      const { principal, amount, rate, years, frequency, timing } = this.dcaForm
      const res = calculateDCASeries(principal, amount, rate, years, frequency, timing)

      this.dcaResult = res

      this.$nextTick(() => {
        this.renderDcaChart()
      })
    },
    resetDcaForm () {
      this.dcaForm = {
        principal: 0,
        amount: 1000,
        rate: 6,
        years: 10,
        frequency: 12,
        timing: 'end'
      }
      this.runDcaCalc()
    },
    runRecoveryCalc () {
      const { initial, current } = this.recoveryForm
      this.recoveryResult = calculateDrawdownRecovery(initial, current)
    },
    resetRecoveryForm () {
      this.recoveryForm = {
        initial: 10000,
        current: 7000
      }
      this.runRecoveryCalc()
    },
    // Chart Render Functions
    renderGrowthChart () {
      if (!this.$refs.growthChartDom) return

      if (!this.growthChart) {
        this.growthChart = echarts.init(this.$refs.growthChartDom)
      }

      const isDark = this.isDark
      const themeColors = isDark
        ? { text: 'rgba(255,255,255,0.6)', border: '#333', line1: '#7bc59a', line2: '#6b7280' }
        : { text: '#6b7280', border: '#e6e2dc', line1: '#1d6f4f', line2: '#9ca3af' }

      const seriesData = this.growthResult.series
      const xLabels = seriesData.labels.map(l => `${l} Y`)

      const series = [
        {
          name: this.$t('learning.asset.simpleInterest'),
          type: 'line',
          data: seriesData.simple,
          smooth: true,
          lineStyle: { width: 1.5, color: themeColors.line2 },
          itemStyle: { color: themeColors.line2 },
          showSymbol: false
        }
      ]

      if (this.growthForm.isCompound) {
        series.push({
          name: this.$t('learning.asset.compoundInterest'),
          type: 'line',
          data: seriesData.compound,
          smooth: true,
          lineStyle: { width: 2.5, color: themeColors.line1 },
          itemStyle: { color: themeColors.line1 },
          showSymbol: false,
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: isDark ? 'rgba(123, 197, 154, 0.15)' : 'rgba(29, 111, 79, 0.08)' },
              { offset: 1, color: 'rgba(0,0,0,0)' }
            ])
          }
        })
      }

      const option = {
        backgroundColor: 'transparent',
        grid: { top: 30, right: 10, bottom: 35, left: 60 },
        tooltip: {
          trigger: 'axis',
          backgroundColor: isDark ? '#252525' : '#ffffff',
          borderColor: isDark ? '#3a3a3a' : '#ece9e4',
          textStyle: { color: isDark ? '#fff' : '#000', fontSize: 12 },
          formatter: (params) => {
            let res = `<div style="font-size:11px; margin-bottom:4px; font-weight:600">${params[0].name}</div>`
            params.forEach(item => {
              res += `<div style="display:flex; justify-content:space-between; gap:20px; font-size:11px">
                <span style="color:var(--color-text-muted)">${item.seriesName}:</span>
                <span style="font-weight:600">$ ${Math.round(item.value).toLocaleString('zh-CN')}</span>
              </div>`
            })
            return res
          }
        },
        legend: {
          bottom: 0,
          textStyle: { color: themeColors.text, fontSize: 11 },
          icon: 'circle'
        },
        xAxis: {
          type: 'category',
          data: xLabels,
          axisLine: { lineStyle: { color: themeColors.border } },
          axisLabel: { color: themeColors.text, fontSize: 10 }
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            color: themeColors.text,
            fontSize: 10,
            formatter: value => `$${(value / 1000).toFixed(0)}k`
          },
          splitLine: { lineStyle: { color: themeColors.border, type: 'dashed' } }
        },
        series
      }

      this.growthChart.setOption(option, true)
    },
    renderDcaChart () {
      if (!this.$refs.dcaChartDom) return

      if (!this.dcaChart) {
        this.dcaChart = echarts.init(this.$refs.dcaChartDom)
      }

      const isDark = this.isDark
      const themeColors = isDark
        ? { text: 'rgba(255,255,255,0.6)', border: '#333', primary: '#7bc59a', secondary: '#5d8ba8' }
        : { text: '#6b7280', border: '#e6e2dc', primary: '#1d6f4f', secondary: '#4a7a96' }

      const xLabels = this.dcaResult.labels.map(l => `${l} Y`)

      const option = {
        backgroundColor: 'transparent',
        grid: { top: 30, right: 10, bottom: 35, left: 60 },
        tooltip: {
          trigger: 'axis',
          backgroundColor: isDark ? '#252525' : '#ffffff',
          borderColor: isDark ? '#3a3a3a' : '#ece9e4',
          textStyle: { color: isDark ? '#fff' : '#000', fontSize: 12 },
          formatter: (params) => {
            let res = `<div style="font-size:11px; margin-bottom:4px; font-weight:600">${params[0].name}</div>`
            params.forEach(item => {
              res += `<div style="display:flex; justify-content:space-between; gap:20px; font-size:11px">
                <span style="color:var(--color-text-muted)">${item.seriesName}:</span>
                <span style="font-weight:600">$ ${Math.round(item.value).toLocaleString('zh-CN')}</span>
              </div>`
            })
            return res
          }
        },
        legend: {
          bottom: 0,
          textStyle: { color: themeColors.text, fontSize: 11 },
          icon: 'circle'
        },
        xAxis: {
          type: 'category',
          data: xLabels,
          axisLine: { lineStyle: { color: themeColors.border } },
          axisLabel: { color: themeColors.text, fontSize: 10 }
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            color: themeColors.text,
            fontSize: 10,
            formatter: value => `$${(value / 1000).toFixed(0)}k`
          },
          splitLine: { lineStyle: { color: themeColors.border, type: 'dashed' } }
        },
        series: [
          {
            name: this.$t('learning.asset.chart.dcaLegendPrincipal'),
            type: 'line',
            data: this.dcaResult.principal,
            smooth: true,
            lineStyle: { width: 1.5, color: isDark ? 'rgba(255,255,255,0.3)' : '#9ca3af' },
            itemStyle: { color: isDark ? 'rgba(255,255,255,0.4)' : '#9ca3af' },
            showSymbol: false
          },
          {
            name: this.$t('learning.asset.chart.dcaLegendWealth'),
            type: 'line',
            data: this.dcaResult.wealth,
            smooth: true,
            lineStyle: { width: 2.5, color: themeColors.primary },
            itemStyle: { color: themeColors.primary },
            showSymbol: false,
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: isDark ? 'rgba(123, 197, 154, 0.25)' : 'rgba(29, 111, 79, 0.15)' },
                { offset: 1, color: 'rgba(0,0,0,0)' }
              ])
            }
          }
        ]
      }

      this.dcaChart.setOption(option, true)
    },
    recreateCharts () {
      this.disposeCharts()
      if (this.activeTab === 'growth' && this.growthResult) {
        this.renderGrowthChart()
      } else if (this.activeTab === 'dca' && this.dcaResult) {
        this.renderDcaChart()
      }
    },
    disposeCharts () {
      if (this.growthChart) {
        this.growthChart.dispose()
        this.growthChart = null
      }
      if (this.dcaChart) {
        this.dcaChart.dispose()
        this.dcaChart = null
      }
    },
    handleResize () {
      if (this.growthChart) this.growthChart.resize()
      if (this.dcaChart) this.dcaChart.resize()
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
  margin-bottom: 16px;
}

.summary-item {
  display: flex;
  flex-direction: column;
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
}

.summary-item .value.text-success {
  color: #10b981;
}

.formula-block {
  padding: 10px 12px;
  background: var(--color-surface-offset);
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
}

.formula-block .title {
  color: var(--color-text-muted);
}

.formula-block .code {
  font-family: 'SF Mono', 'Fira Mono', monospace;
  color: var(--color-primary);
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
  height: 260px;
}

.chart-note {
  font-size: 11px;
  color: var(--color-text-faint);
  margin-top: 12px;
  margin-bottom: 0;
}

.sandbox-alert {
  border: 1px solid var(--color-border) !important;
  background-color: var(--color-surface-2) !important;
  border-radius: 6px;
}

.sandbox-alert >>> .ant-alert-message {
  color: var(--color-text) !important;
  font-size: 12px;
}

/* Recovery Layout Styling */
.recovery-positive {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px;
  background: rgba(16, 185, 129, 0.08);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: 6px;
  color: #10b981;
  font-size: 13px;
}

.recovery-negative {
  padding: 4px 0;
}

.loss-alert {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.loss-badge {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.25);
  color: #ef4444;
  padding: 6px 12px;
  border-radius: 4px;
  font-weight: 600;
  font-size: 13px;
}

.recovery-badge {
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.25);
  color: #f59e0b;
  padding: 6px 12px;
  border-radius: 4px;
  font-weight: 600;
  font-size: 13px;
}

.recovery-negative .desc {
  font-size: 13px;
  line-height: 1.6;
  color: var(--color-text-muted);
  margin: 0;
}
</style>
