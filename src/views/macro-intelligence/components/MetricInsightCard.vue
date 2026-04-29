<template>
  <div class="metric-insight-card">
    <div class="card-header">
      <div class="header-main">
        <h3 class="metric-title">{{ metric.label || metric.name }}</h3>
        <div class="value-block">
          <span class="metric-value" :class="{ 'unavailable': !hasValue }">{{ displayValue }}</span>
          <span v-if="displayUnit && hasValue" class="metric-unit">{{ displayUnit }}</span>
        </div>
      </div>
      <div class="header-meta">
        <span class="meta-item data-source" v-if="displayMeta">{{ displayMeta }}</span>
        <span v-if="derivedFromSeries" class="provenance-badge derived">最新值由历史序列推导</span>
      </div>
    </div>

    <div class="card-body">
      <div class="insight-content">
        <div class="meaning-block" v-if="metric.meaning || metric.currentMeaning || metric.explanation">
          <div class="label-with-provenance">
            <span class="insight-label">当前含义</span>
            <span class="provenance-badge static">指标说明</span>
          </div>
          <p class="insight-text">{{ metric.meaning || metric.currentMeaning || metric.explanation }}</p>
        </div>

        <div class="direction-grid" v-if="metric.risingMeans || metric.fallingMeans">
          <div class="direction-item up" v-if="metric.risingMeans">
            <span class="insight-label">↑ 上升意味着</span>
            <p class="insight-text">{{ metric.risingMeans }}</p>
          </div>
          <div class="direction-item down" v-if="metric.fallingMeans">
            <span class="insight-label">↓ 下降意味着</span>
            <p class="insight-text">{{ metric.fallingMeans }}</p>
          </div>
        </div>

        <div class="impact-block" v-if="metric.riskAssetImplication || metric.riskAssetImpact">
          <div class="label-with-provenance">
            <span class="insight-label highlight">对风险资产的影响</span>
            <span class="provenance-badge static">指标说明</span>
          </div>
          <p class="insight-text">{{ metric.riskAssetImplication || metric.riskAssetImpact }}</p>
        </div>
      </div>

      <div class="chart-container">
        <div v-if="metric.chartId" class="chart-wrapper">
          <macro-metric-chart :metric-id="metric.chartId" @chart-data-loaded="onChartData" />
        </div>
        <div v-else class="no-chart-placeholder">
          <a-empty description="图表暂不可用" :image="simpleImage" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Empty } from 'ant-design-vue'
import MacroMetricChart from './MacroMetricChart.vue'
import { formatMacroMetric } from '../adapters/metricConfig'

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
      if (!this.isOriginalMissing) {
        return this.metric.primary || this.metric.formattedValue || this.metric.value
      }
      if (this.derivedValue !== null) {
        const formatted = formatMacroMetric(this.metric.id, this.derivedValue)
        return formatted.primary
      }
      return '数据暂不可用'
    },
    displayUnit () {
      return this.metric.displayUnit || this.metric.unit
    },
    displayMeta () {
      if (!this.isOriginalMissing) {
        return this.metric.meta || (this.metric.source ? `${this.metric.source}` : 'Data unavailable')
      }
      if (this.derivedDate) {
        const config = formatMacroMetric(this.metric.id, this.derivedValue, this.derivedDate)
        return config.meta
      }
      return this.metric.meta || 'Data unavailable'
    }
  },
  methods: {
    onChartData ({ lastValidPoint }) {
      if (this.isOriginalMissing && lastValidPoint) {
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
  align-items: baseline;
  gap: 4px;
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

.meta-item {
  font-size: 11px;
  color: #9ca3af;
}

.card-body {
  display: flex;
  flex-direction: column;

  @media (min-width: 900px) {
    flex-direction: row;
  }
}

.insight-content {
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  border-bottom: 1px solid #f0f0f0;

  @media (min-width: 900px) {
    border-bottom: none;
    border-right: 1px solid #f0f0f0;
    width: 50%;
  }
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

.chart-container {
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 250px;

  @media (min-width: 900px) {
    width: 50%;
  }
}

.chart-wrapper {
  width: 100%;
  height: 100%;
}

.no-chart-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #9ca3af;
}

/* Override MacroMetricChart's default padding to fit inside our card */
:deep(.macro-metric-chart-container) {
  margin-top: 0 !important;
  padding: 0 !important;
  border: none !important;
}
</style>
