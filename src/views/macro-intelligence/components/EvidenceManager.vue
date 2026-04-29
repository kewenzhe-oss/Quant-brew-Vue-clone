<template>
  <div class="evidence-manager">
    <!-- 1. Indicator Pills row -->
    <div class="pill-row">
      <button
        v-for="(ev, index) in evidenceList"
        :key="ev.id || index"
        class="indicator-pill"
        :class="{ 'active-pill': activeIndex === index }"
        @click="activeIndex = index"
      >
        {{ ev.label }}
      </button>
    </div>

    <!-- 2. Active Content Area -->
    <div class="active-content-area" v-if="activeEvidence">

      <!-- Chart Slot -->
      <div class="active-chart-container">
        <template v-if="activeEvidence.chartMetrics && activeEvidence.chartMetrics.length > 0">
          <div class="chart-grid">
            <div v-for="metric in activeEvidence.chartMetrics" :key="metric" class="chart-slot-inner">
              <macro-timeseries-chart :metric-key="metric" />
            </div>
          </div>
        </template>
        <template v-else>
          <div class="placeholder-chart">
            <span>图表数据加载中 / {{ activeEvidence.label }}</span>
          </div>
        </template>
      </div>

      <!-- 3. Anchored Interpretation Block -->
      <div class="interpretation-block">
        <div class="interpretation-text">
          <p v-for="(paragraph, idx) in formattedInterpretation" :key="idx">
            {{ paragraph }}
          </p>
        </div>

        <div v-if="activeEvidence.catalyst" class="catalyst-block">
          <span class="catalyst-label">KEY CATALYST</span>
          <p class="catalyst-text">{{ activeEvidence.catalyst }}</p>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import MacroTimeseriesChart from './MacroTimeseriesChart.vue'

export default {
  name: 'EvidenceManager',
  components: {
    MacroTimeseriesChart
  },
  props: {
    evidenceList: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      activeIndex: 0
    }
  },
  computed: {
    activeEvidence () {
      return this.evidenceList && this.evidenceList.length > 0
        ? this.evidenceList[this.activeIndex]
        : null
    },
    formattedInterpretation () {
      if (!this.activeEvidence || !this.activeEvidence.interpretation) return []
      return this.activeEvidence.interpretation.split('\n').filter(p => p.trim() !== '')
    }
  },
  watch: {
    evidenceList: {
      handler () {
        this.activeIndex = 0
      },
      deep: true
    }
  }
}
</script>

<style scoped>
.evidence-manager {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-top: 20px;
  margin-bottom: 20px;
}

/* Row 1: Pills */
.pill-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  padding-bottom: 12px;
}

.indicator-pill {
  background: rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(0, 0, 0, 0.1);
  color: #595959;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;
}

.indicator-pill:hover {
  background: rgba(0, 0, 0, 0.08);
  color: #262626;
}

.active-pill {
  background: #1890ff;
  border-color: #40a9ff;
  color: #ffffff;
  box-shadow: 0 0 10px rgba(24, 144, 255, 0.3);
}

.active-pill:hover {
  background: #40a9ff;
  color: #ffffff;
}

/* Row 2: Content Area grid */
.active-content-area {
  display: grid;
  grid-template-columns: 2fr 1.2fr;
  gap: 32px;
  align-items: start;
}

@media (max-width: 1024px) {
  .active-content-area {
    grid-template-columns: 1fr;
  }
}

/* Chart Slot */
.active-chart-container {
  background: rgba(0,0,0,0.02);
  border: 1px solid rgba(0,0,0,0.05);
  border-radius: 12px;
  padding: 16px;
  min-height: 350px;
  display: flex;
  flex-direction: column;
}

.chart-grid {
  display: flex;
  flex-direction: column;
  gap: 24px;
  flex: 1;
}

.chart-slot-inner {
  flex: 1;
  min-height: 300px;
  display: flex;
}

.placeholder-chart {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8c8c8c;
  font-family: monospace;
  font-size: 14px;
  border: 1px dashed rgba(0,0,0,0.15);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.5);
}

/* Interpretation Block */
.interpretation-block {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.interpretation-text {
  color: #262626;
  font-size: 15px;
  line-height: 1.7;
  font-weight: 400;
}

.interpretation-text p {
  margin-bottom: 16px;
}
.interpretation-text p:last-child {
  margin-bottom: 0;
}

.catalyst-block {
  background: rgba(250, 173, 20, 0.05);
  border-left: 3px solid #faad14;
  padding: 12px 16px;
  border-radius: 0 8px 8px 0;
}

.catalyst-label {
  display: inline-block;
  font-size: 12px;
  color: #d48806;
  font-weight: 700;
  letter-spacing: 0.05em;
  margin-bottom: 6px;
}

.catalyst-text {
  color: #595959;
  font-size: 14px;
  line-height: 1.5;
  margin: 0;
}
</style>
