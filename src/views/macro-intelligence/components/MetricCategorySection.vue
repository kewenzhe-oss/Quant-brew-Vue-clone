<template>
  <div class="metric-category-section" v-if="coreMetrics.length > 0 || advancedMetrics.length > 0">
    <h2 class="category-title">{{ category.name }}</h2>
    <div class="metrics-list" v-if="coreMetrics.length > 0">
      <metric-insight-card
        v-for="metric in coreMetrics"
        :key="metric.id"
        :metric="metric"
      />
    </div>

    <div v-if="advancedMetrics.length > 0" class="advanced-section">
      <div class="advanced-toggle" @click="toggleAdvanced">
        <span class="toggle-text">{{ showAdvanced ? '收起高级指标' : '展开高级指标' }}</span>
        <span class="toggle-icon">{{ showAdvanced ? '▲' : '▼' }}</span>
      </div>
      <div class="metrics-list" v-show="showAdvanced">
        <metric-insight-card
          v-for="metric in advancedMetrics"
          :key="metric.id"
          :metric="metric"
        />
      </div>
    </div>
  </div>
</template>

<script>
import MetricInsightCard from './MetricInsightCard.vue'

export default {
  name: 'MetricCategorySection',
  components: {
    MetricInsightCard
  },
  props: {
    category: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      showAdvanced: false
    }
  },
  computed: {
    coreMetrics () {
      return this.category.metrics.filter(m => m.visibility === 'detail_core')
    },
    advancedMetrics () {
      return this.category.metrics.filter(m => m.visibility === 'advanced')
    }
  },
  methods: {
    toggleAdvanced () {
      this.showAdvanced = !this.showAdvanced
      if (this.showAdvanced) {
        // ECharts needs the container to be visible before it can measure width.
        // Dispatch a resize event after the next render tick so all chart
        // instances that were initialized inside v-show="false" can resize.
        this.$nextTick(() => {
          setTimeout(() => {
            window.dispatchEvent(new Event('resize'))
          }, 50)
        })
      }
    }
  }
}
</script>

<style scoped lang="less">
.metric-category-section {
  margin-bottom: 48px;
}

.category-title {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 2px solid #f3f4f6;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 40px;
    height: 2px;
    background: #1890ff;
  }
}

.metrics-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.advanced-section {
  margin-top: 16px;
  background: #f9fafb;
  border: 1px dashed #e5e7eb;
  border-radius: 8px;
  padding: 16px;
}

.advanced-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  color: #6b7280;
  font-size: 14px;
  font-weight: 500;
  padding: 8px 0;
  transition: color 0.2s;

  &:hover {
    color: #374151;
  }
}

.advanced-section .metrics-list {
  margin-top: 16px;
}
</style>
