<template>
  <div class="technicals-tab">
    <a-spin :spinning="isLoading" :tip="$t('stockResearch.technicals.calculating')">

      <!-- Disclaimer banner -->
      <div class="tech-disclaimer">
        <span class="disclaimer-title">{{ $t('stockResearch.technicals.disclaimerTitle') }}</span>
        <span class="disclaimer-body">
          {{ $t('stockResearch.technicals.disclaimerBody') }}
        </span>
      </div>

      <div v-if="hasData" class="technicals-container">
        <div class="indicator-sections">
          <!-- Trend Indicators -->
          <div class="section-card">
            <h3 class="section-title cyan-text">{{ $t('stockResearch.technicals.trendRef') }}</h3>
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
            <h3 class="section-title amber-text">{{ $t('stockResearch.technicals.momentumRef') }}</h3>
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
            <h3 class="section-title purple-text">{{ $t('stockResearch.technicals.volatilityRef') }}</h3>
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
            <h3 class="section-title green-text">{{ $t('stockResearch.technicals.volumeRef') }}</h3>
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
        <a-empty :description="$t('stockResearch.technicals.noData')" />
      </div>
    </a-spin>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'TechnicalsTab',
  data () {
    return {}
  },
  computed: {
    ...mapState('equity', ['technicals', 'technicalsLoading']),
    isLoading () {
      return this.technicalsLoading
    },
    hasData () {
      return this.technicals && Object.keys(this.technicals).length > 0 && !this.technicals.error
    },
    columns () {
      return [
        { title: this.$t('stockResearch.technicals.indicatorColumn'), dataIndex: 'name', width: '25%' },
        { title: this.$t('stockResearch.technicals.valueColumn'), dataIndex: 'value', scopedSlots: { customRender: 'value' }, width: '20%' },
        { title: this.$t('stockResearch.technicals.stateColumn'), key: 'interpretation', scopedSlots: { customRender: 'interpretation' } }
      ]
    }
  },
  methods: {
    formatNumber (val) {
      if (val === null || val === undefined || isNaN(val)) return '—'
      return parseFloat(val).toFixed(4)
    },

    getInterpretationKey (name, value) {
      switch (name) {
        // ── Trend ──────────────────────────────────────────────────────────
        case 'MACD':
          if (value > 0) return 'macd.positive'
          if (value < 0) return 'macd.negative'
          return 'neutral'

        case 'ADX':
          if (value > 25) return 'adx.strong'
          if (value < 20) return 'adx.weak'
          return 'adx.developing'

        // ── Momentum ───────────────────────────────────────────────────────
        case 'RSI':
          if (value > 70) return 'rsi.overbought'
          if (value < 30) return 'rsi.oversold'
          return 'rsi.neutral'

        case 'CCI':
          if (value > 100) return 'cci.upper'
          if (value < -100) return 'cci.lower'
          return 'cci.ranging'

        case 'Stoch %K':
        case 'Stoch %D':
          if (value > 80) return 'momentum.overbought'
          if (value < 20) return 'momentum.oversold'
          return 'neutral'

        case 'Williams %R':
          if (value > -20) return 'momentum.overbought'
          if (value < -80) return 'momentum.oversold'
          return 'neutral'

        case 'MFI':
          if (value > 80) return 'momentum.overbought'
          if (value < 20) return 'momentum.oversold'
          return 'neutral'

        // ── Volatility ─────────────────────────────────────────────────────
        case 'ATR':
          return 'reference'

        case 'BB %B':
          if (value > 1) return 'bb.above'
          if (value < 0) return 'bb.below'
          return 'bb.within'

        case 'BB Upper':
        case 'BB Mid':
        case 'BB Lower':
        case 'BB Width':
          return 'reference'

        // ── Volume ─────────────────────────────────────────────────────────
        case 'CMF':
          if (value > 0.1) return 'cmf.positive'
          if (value < -0.1) return 'cmf.negative'
          return 'cmf.neutral'

        default:
          return 'reference'
      }
    },

    getInterpretation (name, value) {
      if (value === null || value === undefined || isNaN(value)) return '—'
      const key = this.getInterpretationKey(name, value)
      return this.$t('stockResearch.technicals.states.' + key)
    },

    getInterpretationClass (name, value) {
      if (value === null || value === undefined || isNaN(value)) return 'text-neutral'
      const key = this.getInterpretationKey(name, value)

      if (
        key.includes('overbought') ||
        key === 'macd.negative' ||
        key === 'cmf.negative' ||
        key === 'bb.above' ||
        key === 'cci.upper'
      ) {
        return 'text-negative-state'
      }

      if (
        key.includes('oversold') ||
        key === 'macd.positive' ||
        key === 'cmf.positive' ||
        key === 'bb.below' ||
        key === 'cci.lower'
      ) {
        return 'text-positive-state'
      }

      if (key === 'adx.strong') {
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
