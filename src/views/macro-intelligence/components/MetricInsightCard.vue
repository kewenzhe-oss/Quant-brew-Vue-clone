<template>
  <div class="metric-insight-card">
    <div class="card-header">
      <div class="header-main">
        <h3 class="metric-title">{{ metric.label || metric.name }}</h3>
        <div class="value-block">
          <span class="metric-value" :class="{ 'unavailable': !hasValue }">{{ displayValue }}</span>
          <a-tag v-if="hasValue && statusInfo" :color="statusInfo.color" class="status-badge">
            {{ statusInfo.label }}
          </a-tag>
        </div>
      </div>
      <div class="header-meta">
        <div class="meta-badges">
          <span v-if="sourceTypeBadge" class="source-type-badge" :class="sourceTypeBadge.cls">{{ sourceTypeBadge.label }}</span>
          <span v-if="showStaleBadge" class="source-type-badge stale-badge">⚠ Stale</span>
        </div>
        <span class="meta-item data-source" v-if="displayMeta">{{ displayMeta }}</span>
        <span v-if="derivedFromSeries" class="provenance-badge derived">{{ $t('macro.detail.derivedFromSeries') }}</span>
      </div>
    </div>

    <div class="card-body">
      <div class="insight-content">
        <div class="meaning-block" v-if="localCurrentMeaning">
          <div class="label-with-provenance">
            <span class="insight-label">{{ $t('macro.detail.currentMeaning') }}</span>
            <span class="provenance-badge static">{{ $t('macro.detail.indicatorSpec') }}</span>
          </div>
          <p class="insight-text">{{ localCurrentMeaning }}</p>
        </div>

        <div class="direction-grid" v-if="localRisingMeans || localFallingMeans">
          <div class="direction-item up" v-if="localRisingMeans">
            <span class="insight-label">{{ $t('macro.detail.risingMeans') }}</span>
            <p class="insight-text">{{ localRisingMeans }}</p>
          </div>
          <div class="direction-item down" v-if="localFallingMeans">
            <span class="insight-label">{{ $t('macro.detail.fallingMeans') }}</span>
            <p class="insight-text">{{ localFallingMeans }}</p>
          </div>
        </div>

        <div class="impact-block" v-if="localRiskAssetImpact">
          <div class="label-with-provenance">
            <span class="insight-label highlight">{{ $t('macro.detail.riskAssetImplication') }}</span>
            <span class="provenance-badge static">{{ $t('macro.detail.indicatorSpec') }}</span>
          </div>
          <p class="insight-text">{{ localRiskAssetImpact }}</p>
        </div>
      </div>
    </div>

    <div class="card-footer-charts">
      <div v-if="metric.chartId" class="charts-section">
        <div class="chart-wrapper">
          <macro-metric-chart :metric-id="metric.chartId" @chart-data-loaded="onChartData" />
        </div>
      </div>
      <div v-else class="no-chart-placeholder">
        <a-empty :description="$t('macro.detail.chartUnavailable')" :image="simpleImage" />
      </div>
    </div>
  </div>
</template>

<script>
import { Empty } from 'ant-design-vue'
import MacroMetricChart from './MacroMetricChart.vue'
import { formatMacroMetric } from '../adapters/metricConfig'
import { evaluateIndicator } from '../config/indicatorRules'

export default {
  name: 'MetricInsightCard',
  components: {
    [Empty.name]: Empty,
    MacroMetricChart
  },
  props: {
    metric: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      simpleImage: Empty.PRESENTED_IMAGE_SIMPLE,
      derivedValue: null,
      derivedDate: null,
      derivedFromSeries: false
    }
  },
  computed: {
    isOriginalMissing () {
      return this.metric.status === 'missing' || this.metric.value === null || this.metric.value === undefined || this.metric.value === '—' || this.metric.value === '--'
    },
    hasValue () {
      if (!this.isOriginalMissing) return true
      return this.derivedValue !== null
    },
    displayValue () {
      // Chart-derived value is always preferred (single source of truth with the chart).
      // Snapshot value acts only as a placeholder while the chart is loading.
      if (this.derivedValue !== null) {
        const formatted = formatMacroMetric(this.metric.id, this.derivedValue)
        return formatted.displayValue
      }
      if (!this.isOriginalMissing) {
        return this.metric.displayValue || this.metric.primary || this.metric.formattedValue || this.metric.value
      }
      return this.$t('macro.detail.dataUnavailable')
    },
    displayMeta () {
      if (!this.hasValue) return this.$t('macro.detail.dataUnavailable')
      // If we have a chart-derived date, use it (matches chart's provenance)
      if (this.derivedDate) {
        const config = formatMacroMetric(this.metric.id, this.derivedValue, this.derivedDate)
        return config.meta
      }
      return this.metric.meta || (this.metric.source ? `${this.metric.source}` : this.$t('macro.detail.dataUnavailable'))
    },
    statusInfo () {
      const val = this.derivedValue !== null ? this.derivedValue : this.metric.value
      if (val === null || val === undefined || this.isOriginalMissing) return null
      const evalResult = evaluateIndicator(this.metric.id, val)
      // Treat unknown/missing evaluation as no badge
      if (!evalResult || !evalResult.labelKey || evalResult.labelKey === 'macro.rules.unknown.label') return null

      const toneColorMap = {
        green: 'green',
        yellowGreen: 'green',
        neutral: 'blue',
        orange: 'orange',
        red: 'red'
      }
      return {
        label: this.$te(evalResult.labelKey) ? this.$t(evalResult.labelKey) : evalResult.label,
        color: toneColorMap[evalResult.tone] || 'blue'
      }
    },
    sourceTypeBadge () {
      // Only show badge when data is actually present
      if (!this.hasValue || this.isOriginalMissing) return null
      const st = this.metric.sourceType || 'primary'
      if (st === 'fallback') return { label: 'Fallback Source', cls: 'badge-fallback' }
      if (st === 'cached') return { label: 'Cached Snapshot', cls: 'badge-cached' }
      return null // Primary is the normal case — no badge needed
    },
    showStaleBadge () {
      return this.metric.isStale === true && this.hasValue && !this.isOriginalMissing
    },
    localCurrentMeaning () {
      const key = `macro.registry.${this.metric.id}.currentMeaning`
      if (this.$te(key)) return this.$t(key)
      return this.metric.meaning || this.metric.currentMeaning || this.metric.explanation || ''
    },
    localRisingMeans () {
      const key = `macro.registry.${this.metric.id}.risingMeans`
      if (this.$te(key)) return this.$t(key)
      return this.metric.risingMeans || ''
    },
    localFallingMeans () {
      const key = `macro.registry.${this.metric.id}.fallingMeans`
      if (this.$te(key)) return this.$t(key)
      return this.metric.fallingMeans || ''
    },
    localRiskAssetImpact () {
      const key = `macro.registry.${this.metric.id}.riskAssetImpact`
      if (this.$te(key)) return this.$t(key)
      return this.metric.riskAssetImplication || this.metric.riskAssetImpact || ''
    }
  },
  methods: {
    onChartData ({ lastValidPoint }) {
      // Always sync card value to the chart's latest valid point.
      // This establishes a single source of truth: card == chart last bar.
      // Guard: only apply if the chart returned a valid (non-null) point.
      if (lastValidPoint && lastValidPoint.value !== null && lastValidPoint.value !== undefined) {
        this.derivedValue = lastValidPoint.value
        this.derivedDate = lastValidPoint.date
        this.derivedFromSeries = true
      }
    }
  }
}
</script>

<style scoped lang="less">
.metric-insight-card {
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  margin-bottom: 24px;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    border-color: #d9d9d9;
  }
}

.card-header {
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  background: #fafafa;
}

.header-main {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.metric-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.value-block {
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-badge {
  font-size: 11px;
  font-weight: 500;
  padding: 0 6px;
  border-radius: 4px;
  line-height: 18px;
  margin-left: 4px;
}

.metric-value {
  font-size: 24px;
  font-weight: 700;
  font-family: 'SFMono-Regular', Consolas, monospace;
  color: #1890ff;

  &.unavailable {
    font-size: 14px;
    font-weight: 400;
    color: #9ca3af;
    font-family: inherit;
  }
}

.metric-unit {
  font-size: 13px;
  color: #6b7280;
}

.header-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.meta-badges {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.source-type-badge {
  font-size: 10px;
  padding: 2px 7px;
  border-radius: 4px;
  font-weight: 600;
  letter-spacing: 0.3px;
  line-height: 16px;

  &.badge-fallback {
    background: #fff7e6;
    color: #d46b08;
    border: 1px solid #ffd591;
  }

  &.badge-cached {
    background: #f0f0ff;
    color: #6366f1;
    border: 1px solid #c7d2fe;
  }

  &.stale-badge {
    background: #fff1f0;
    color: #cf1322;
    border: 1px solid #ffa39e;
  }
}

.meta-item {
  font-size: 11px;
  color: #9ca3af;
}

.card-body {
  display: block;
}

.insight-content {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
}

.label-with-provenance {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.provenance-badge {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  background: #f0f2f5;
  color: #8c8c8c;
  font-weight: normal;

  &.static {
    background: #e6f7ff;
    color: #1890ff;
    border: 1px solid #91d5ff;
  }

  &.derived {
    background: #fffbe6;
    color: #faad14;
    border: 1px solid #ffe58f;
    margin-top: 4px;
  }
}

.insight-label {
  display: block;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #6b7280;
  margin-bottom: 0;
  font-weight: 600;

  &.highlight {
    color: #1890ff;
  }
}

.insight-text {
  margin: 0;
  font-size: 14px;
  color: #374151;
  line-height: 1.6;
}

.direction-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  background: #f9fafb;
  padding: 12px;
  border-radius: 6px;
}

.card-footer-charts {
  border-top: 1px solid #f0f0f0;
  background: #fafafa;
  padding: 20px;
  width: 100%;
}

.charts-section {
  width: 100%;
}

.chart-wrapper {
  width: 100%;
  background: #ffffff;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
  transition: all 0.3s ease;

  &:hover {
    border-color: #d9d9d9;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }
}

.no-chart-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  width: 100%;
  color: #9ca3af;
}

/* Override MacroMetricChart's default padding to fit inside our card */
:deep(.macro-metric-chart-container) {
  margin-top: 0 !important;
  padding: 0 !important;
  border: none !important;
}
</style>
