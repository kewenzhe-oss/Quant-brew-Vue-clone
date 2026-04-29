<template>
  <div class="macro-timeseries-chart-wrapper">
    <div v-if="loading" class="chart-loading">
      <a-spin tip="Loading Chart..." />
    </div>
    <div v-else-if="error" class="chart-error">
      <a-empty :description="error" />
    </div>
    <div v-else class="chart-content">
      <div class="chart-header">
        <h4 class="chart-title">{{ chartName }} <span class="chart-unit" v-if="unit">({{ unit }})</span></h4>
      </div>
      <div class="chart-container" ref="chartContainer"></div>
    </div>
  </div>
</template>

<script>
import { createChart } from 'lightweight-charts'
import request from '@/utils/request'

export default {
  name: 'MacroTimeseriesChart',
  props: {
    metricKey: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      chart: null,
      series: null,
      loading: true,
      error: null,
      chartName: '',
      unit: '',
      data: []
    }
  },
  mounted () {
    this.fetchData()
  },
  beforeDestroy () {
    if (this.chart) {
      this.chart.remove()
      this.chart = null
    }
  },
  methods: {
    async fetchData () {
      this.loading = true
      this.error = null
      try {
        const res = await request({
          url: `/api/global-market/timeseries/${this.metricKey}`,
          method: 'get'
        })

        if (res && res.code === 1) {
          const payload = res.data
          this.chartName = payload.name
          this.unit = payload.unit

          // format for lightweight-charts: { time: 'YYYY-MM-DD', value: number }
          this.data = payload.series
            .filter(item => item.value !== null)
            .map(item => ({
              time: item.time,
              value: item.value
            }))
            .sort((a, b) => new Date(a.time) - new Date(b.time))

          this.$nextTick(() => {
            this.initChart()
          })
        } else {
          this.error = (res && res.msg) ? res.msg : 'Failed to fetch data'
        }
      } catch (err) {
        this.error = err.message || 'API Error'
      } finally {
        this.loading = false
      }
    },
    initChart () {
      if (!this.$refs.chartContainer) return

      const chartOptions = {
        layout: {
          background: { type: 'solid', color: 'transparent' },
          textColor: '#595959'
        },
        grid: {
          vertLines: { color: 'rgba(0, 0, 0, 0.05)' },
          horzLines: { color: 'rgba(0, 0, 0, 0.05)' }
        },
        rightPriceScale: {
          visible: true,
          borderVisible: false
        },
        timeScale: {
          visible: true,
          borderVisible: false,
          timeVisible: true,
          fixLeftEdge: true,
          fixRightEdge: true
        },
        crosshair: {
          mode: 1 // Magnet mode
        },
        width: this.$refs.chartContainer.clientWidth,
        height: this.$refs.chartContainer.clientHeight || 300
      }

      this.chart = createChart(this.$refs.chartContainer, chartOptions)

      this.series = this.chart.addLineSeries({
        color: '#1890ff',
        lineWidth: 2,
        crosshairMarkerVisible: true,
        lastValueVisible: true,
        priceLineVisible: false
      })

      if (this.data && this.data.length > 0) {
        this.series.setData(this.data)
        this.chart.timeScale().fitContent()
      }

      const ro = new ResizeObserver(entries => {
        if (!entries || !entries.length || !this.chart) return
        const cr = entries[0].contentRect
        if (cr.width > 0 && cr.height > 0) {
          this.chart.applyOptions({ width: cr.width, height: cr.height })
        }
      })
      ro.observe(this.$refs.chartContainer)
      this.$once('hook:beforeDestroy', () => {
        ro.disconnect()
      })
    }
  }
}
</script>

<style scoped>
.macro-timeseries-chart-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.chart-loading, .chart-error {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}
.chart-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
}
.chart-header {
  margin-bottom: 12px;
  padding-left: 8px;
}
.chart-title {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: #262626;
  letter-spacing: 0.5px;
}
.chart-unit {
  font-weight: 500;
  color: #8c8c8c;
  font-size: 12px;
}
.chart-container {
  flex: 1;
  min-height: 300px;
  width: 100%;
}
</style>
