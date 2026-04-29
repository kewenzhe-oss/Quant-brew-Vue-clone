<template>
  <div class="technicals-tab">
    <a-spin :spinning="isLoading" tip="Calculating Indicators...">

      <!-- Disclaimer banner -->
      <div class="tech-disclaimer">
        <span class="disclaimer-title">Technical Reference / 技术面参考</span>
        <span class="disclaimer-body">
          这些指标用于描述趋势、动量、波动率与成交量状态，仅供研究参考，不构成买入或卖出建议，也不预测价格走势。
        </span>
      </div>

      <div v-if="hasData" class="technicals-container">
        <div class="indicator-sections">
          <!-- Trend Indicators -->
          <div class="section-card">
            <h3 class="section-title cyan-text">TREND REFERENCE</h3>
            <a-table
              :columns="columns"
              :data-source="technicals.trend"
              :pagination="false"
              size="small"
              rowKey="name"
            >
              <template slot="value" slot-scope="text">
                <span class="ind-value">{{ formatNumber(text) }}</span>
              </template>
              <template slot="interpretation" slot-scope="text, record">
                <span :class="['ind-interp', getInterpretationClass(record.name, record.value)]">
                  {{ getInterpretation(record.name, record.value) }}
                </span>
              </template>
            </a-table>
          </div>

          <!-- Momentum Indicators -->
          <div class="section-card">
            <h3 class="section-title amber-text">MOMENTUM REFERENCE</h3>
            <a-table
              :columns="columns"
              :data-source="technicals.momentum"
              :pagination="false"
              size="small"
              rowKey="name"
            >
              <template slot="value" slot-scope="text">
                <span class="ind-value">{{ formatNumber(text) }}</span>
              </template>
              <template slot="interpretation" slot-scope="text, record">
                <span :class="['ind-interp', getInterpretationClass(record.name, record.value)]">
                  {{ getInterpretation(record.name, record.value) }}
                </span>
              </template>
            </a-table>
          </div>

          <!-- Volatility Indicators -->
          <div class="section-card">
            <h3 class="section-title purple-text">VOLATILITY REFERENCE</h3>
            <a-table
              :columns="columns"
              :data-source="technicals.volatility"
              :pagination="false"
              size="small"
              rowKey="name"
            >
              <template slot="value" slot-scope="text">
                <span class="ind-value">{{ formatNumber(text) }}</span>
              </template>
              <template slot="interpretation" slot-scope="text, record">
                <span :class="['ind-interp', getInterpretationClass(record.name, record.value)]">
                  {{ getInterpretation(record.name, record.value) }}
                </span>
              </template>
            </a-table>
          </div>

          <!-- Volume Indicators -->
          <div class="section-card">
            <h3 class="section-title green-text">VOLUME REFERENCE</h3>
            <a-table
              :columns="columns"
              :data-source="technicals.volume"
              :pagination="false"
              size="small"
              rowKey="name"
            >
              <template slot="value" slot-scope="text">
                <span class="ind-value">{{ formatNumber(text) }}</span>
              </template>
              <template slot="interpretation" slot-scope="text, record">
                <span :class="['ind-interp', getInterpretationClass(record.name, record.value)]">
                  {{ getInterpretation(record.name, record.value) }}
                </span>
              </template>
            </a-table>
          </div>
        </div>
      </div>

      <div v-else-if="!isLoading" class="empty-state">
        <a-empty description="No technical data available" />
      </div>
    </a-spin>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'TechnicalsTab',
  data () {
    return {
      columns: [
        { title: 'INDICATOR', dataIndex: 'name', width: '25%' },
        { title: 'VALUE', dataIndex: 'value', scopedSlots: { customRender: 'value' }, width: '20%' },
        { title: 'MARKET STATE', key: 'interpretation', scopedSlots: { customRender: 'interpretation' } }
      ]
    }
  },
  computed: {
    ...mapState('equity', ['technicals', 'technicalsLoading']),
    isLoading () {
      return this.technicalsLoading
    },
    hasData () {
      return this.technicals && Object.keys(this.technicals).length > 0 && !this.technicals.error
    }
  },
  methods: {
    formatNumber (val) {
      // null / undefined / NaN from backend (missing column or NaN) → dash
      if (val === null || val === undefined || isNaN(val)) return '—'
      return parseFloat(val).toFixed(4)
    },

    getInterpretation (name, value) {
      // Missing or non-numeric → no interpretation
      if (value === null || value === undefined || isNaN(value)) return '—'

      switch (name) {
        // ── Trend ──────────────────────────────────────────────────────────
        case 'MACD':
          if (value > 0) return 'Positive momentum (above signal line)'
          if (value < 0) return 'Negative momentum (below signal line)'
          return 'Neutral'

        case 'ADX':
          if (value > 25) return 'Strong trend'
          if (value < 20) return 'Weak or no trend'
          return 'Developing trend'

        // ── Momentum ───────────────────────────────────────────────────────
        case 'RSI':
          if (value > 70) return 'Overbought range (RSI > 70) — historically elevated'
          if (value < 30) return 'Oversold range (RSI < 30) — historically depressed'
          return 'Neutral momentum'

        case 'CCI':
          if (value > 100) return 'CCI in upper extreme (> 100)'
          if (value < -100) return 'CCI in lower extreme (< -100)'
          return 'Ranging'

        case 'Stoch %K':
        case 'Stoch %D':
          if (value > 80) return 'Momentum in overbought range'
          if (value < 20) return 'Momentum in oversold range'
          return 'Neutral'

        case 'Williams %R':
          if (value > -20) return 'Momentum in overbought range'
          if (value < -80) return 'Momentum in oversold range'
          return 'Neutral'

        case 'MFI':
          if (value > 80) return 'Momentum in overbought range'
          if (value < 20) return 'Momentum in oversold range'
          return 'Neutral'

        // ── Volatility ─────────────────────────────────────────────────────
        case 'ATR':
          return 'Reference value'

        case 'BB %B':
          if (value > 1) return 'Price trading above upper band'
          if (value < 0) return 'Price trading below lower band'
          return 'Trading within bands'

        case 'BB Upper':
        case 'BB Mid':
        case 'BB Lower':
        case 'BB Width':
          return 'Reference value'

        // ── Volume ─────────────────────────────────────────────────────────
        case 'CMF':
          if (value > 0.1) return 'Positive money flow (CMF > 0.1)'
          if (value < -0.1) return 'Negative money flow (CMF < -0.1)'
          return 'Neutral money flow'

        default:
          return 'Reference value'
      }
    },

    getInterpretationClass (name, value) {
      const interp = this.getInterpretation(name, value)
      if (interp === '—') return 'text-neutral'

      // Negative-state: elevated risk / negative momentum / negative flow
      if (
        interp.includes('overbought') ||
        interp.includes('Overbought') ||
        interp.includes('Negative momentum') ||
        interp.includes('Negative money flow') ||
        interp.includes('above upper band') ||
        interp.includes('upper extreme')
      ) {
        return 'text-negative-state'
      }

      // Positive-state: oversold (potential floor) / positive momentum / positive flow
      if (
        interp.includes('oversold') ||
        interp.includes('Oversold') ||
        interp.includes('Positive momentum') ||
        interp.includes('Positive money flow') ||
        interp.includes('below lower band') ||
        interp.includes('lower extreme')
      ) {
        return 'text-positive-state'
      }

      // Strong trend (neutral-positive, purple)
      if (interp.includes('Strong trend')) {
        return 'text-strong'
      }

      return 'text-neutral'
    }
  }
}
</script>

<style scoped lang="less">
.technicals-tab {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ── Disclaimer banner ──────────────────────────────────────────────── */
.tech-disclaimer {
  display: flex;
  align-items: baseline;
  gap: 12px;
  background: #fffbe6;
  border: 1px solid #ffe58f;
  border-left: 4px solid #faad14;
  border-radius: 4px;
  padding: 10px 16px;
  flex-wrap: wrap;

  .disclaimer-title {
    font-size: 13px;
    font-weight: 700;
    color: #ad6800;
    white-space: nowrap;
  }

  .disclaimer-body {
    font-size: 13px;
    color: #614700;
    line-height: 1.5;
  }
}

/* ── Indicator grid ────────────────────────────────────────────────── */
.technicals-container {
  display: flex;
  flex-direction: column;
}

.indicator-sections {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.section-card {
  background: #ffffff;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  padding: 16px;

  .section-title {
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 1px;
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 1px solid #f0f0f0;
  }

  .cyan-text   { color: #13c2c2; }
  .amber-text  { color: #faad14; }
  .purple-text { color: #722ed1; }
  .green-text  { color: #52c41a; }
}

.ind-value {
  font-family: 'Consolas', monospace;
  font-weight: 600;
  color: #262626;
}

.ind-interp {
  font-size: 13px;
  font-weight: 500;

  /* Interpretation state classes (neutral, positive, negative, strong) */
  &.text-negative-state { color: #f5222d; }
  &.text-positive-state { color: #52c41a; }
  &.text-strong         { color: #722ed1; }
  &.text-neutral        { color: #8c8c8c; }
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}
</style>
