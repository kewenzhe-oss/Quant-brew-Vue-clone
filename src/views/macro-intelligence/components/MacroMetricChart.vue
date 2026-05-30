<template>
  <div class="macro-metric-chart-container">
    <a-spin :spinning="loading">
      <div v-if="error" class="error-state">
        <a-empty :description="'图表加载受限'" :image="simpleImage">
          <span style="display:none;">{{ error }}</span> <!-- Hidden error for debug -->
        </a-empty>
      </div>
      <div v-else-if="!loading && (!chartData || chartData.length === 0)" class="empty-state">
        <a-empty description="暂无图表数据" />
      </div>
      <div v-else>
        <div class="chart-header">
          <span class="chart-title">{{ metricName }}</span>
          <span class="chart-unit" v-if="metricUnit">({{ metricUnit }})</span>
        </div>
        <div ref="chartDom" class="chart-dom" style="width: 100%; height: 250px;"></div>
      </div>
    </a-spin>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import request from '@/utils/request' // Assumes standard ant-design-vue-pro request interceptor

import { Empty } from 'ant-design-vue'

export default {
  name: 'MacroMetricChart',
  components: {
    [Empty.name]: Empty
  },
  props: {
    metricId: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      simpleImage: Empty.PRESENTED_IMAGE_SIMPLE,
      loading: false,
      error: null,
      chartInstance: null,
      chartData: [],
      metricName: '',
      metricUnit: ''
    }
  },
  computed: {
    theme () {
      return this.$store.getters.theme
    },
    isDark () {
      return this.theme === 'dark' || this.theme === 'realdark'
    }
  },
  watch: {
    isDark () {
      this.$nextTick(() => {
        if (this.chartInstance) {
          this.initChart()
        }
      })
    }
  },
  mounted () {
    this.fetchData()
    window.addEventListener('resize', this.handleResize)
    // Watch the chart DOM for visibility changes caused by v-show toggling
    this._resizeObserver = new ResizeObserver(() => {
      if (this.chartInstance) {
        this.chartInstance.resize()
      }
    })
    this.$nextTick(() => {
      if (this.$refs.chartDom) {
        this._resizeObserver.observe(this.$refs.chartDom)
      }
    })
  },
  beforeDestroy () {
    window.removeEventListener('resize', this.handleResize)
    if (this._resizeObserver) {
      this._resizeObserver.disconnect()
    }
    if (this.chartInstance) {
      this.chartInstance.dispose()
    }
  },
  methods: {
    handleResize () {
      if (this.chartInstance) {
        this.chartInstance.resize()
      }
    },
    async fetchData () {
      if (!this.metricId) return

      this.loading = true
      this.error = null

      try {
        const res = await request({
          url: `/api/global-market/timeseries/${this.metricId}`,
          method: 'get'
        })

        if (res.code === 1 && res.data) {
          this.metricName = res.data.display_name
          this.metricUnit = res.data.unit
          this.chartData = res.data.series || []

          let lastValidPoint = null
          if (this.chartData.length > 0) {
            for (let i = this.chartData.length - 1; i >= 0; i--) {
              if (this.chartData[i].value !== null && this.chartData[i].value !== undefined) {
                lastValidPoint = {
                  date: this.chartData[i].time,
                  value: this.chartData[i].value
                }
                break
              }
            }
          }
          this.$emit('chart-data-loaded', { lastValidPoint })

          this.$nextTick(() => {
            this.initChart()
          })
        } else {
          this.error = res.msg || '数据加载失败'
        }
      } catch (err) {
        this.error = err.message || '网络请求失败'
      } finally {
        this.loading = false
      }
    },
    initChart () {
      if (!this.$refs.chartDom || this.chartData.length === 0) return

      if (!this.chartInstance) {
        this.chartInstance = echarts.init(this.$refs.chartDom)
        // Attach ResizeObserver to this DOM element so that when v-show
        // toggles the parent accordion, the chart resizes automatically.
        if (this._resizeObserver && this.$refs.chartDom) {
          this._resizeObserver.observe(this.$refs.chartDom)
        }
      }

      const dates = this.chartData.map(item => item.time)
      const values = this.chartData.map(item => item.value)

      // Determine coloring based on typical macro convention
      let lineColor = '#1890ff' // Default Blue
      let areaColor1 = 'rgba(24, 144, 255, 0.2)'
      let areaColor2 = 'rgba(24, 144, 255, 0)'

      // Dynamic coloring based on Metric
      if (this.metricId === 'liq_net_us') {
        lineColor = '#10b981' // Green
        areaColor1 = 'rgba(16, 185, 129, 0.2)'
        areaColor2 = 'rgba(16, 185, 129, 0)'
      } else if (this.metricId === 'sen_vix' || this.metricId === 'inf_us10y') {
        lineColor = '#f5222d' // Red
        areaColor1 = 'rgba(245, 34, 45, 0.2)'
        areaColor2 = 'rgba(245, 34, 45, 0)'
      }

      // Calculate y-axis min/max to prevent "floating" charts
      const validValues = values.filter(v => v !== null && v !== undefined)
      let minVal = null
      let maxVal = null

      if (validValues.length > 0) {
        minVal = Math.min(...validValues)
        maxVal = Math.max(...validValues)
        const padding = (maxVal - minVal) * 0.1
        minVal = minVal - padding
        maxVal = maxVal + padding
      }

      const option = {
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#6a7985'
            }
          },
          backgroundColor: this.isDark ? 'rgba(30, 30, 30, 0.95)' : 'rgba(255, 255, 255, 0.9)',
          borderColor: this.isDark ? '#3a3a3a' : '#e8e8e8',
          textStyle: { color: this.isDark ? 'rgba(255, 255, 255, 0.85)' : '#262626' }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          top: '5%',
          containLabel: true
        },
        xAxis: [
          {
            type: 'category',
            boundaryGap: false,
            data: dates,
            axisLine: {
              lineStyle: {
                color: this.isDark ? '#3a3a3a' : '#d9d9d9'
              }
            },
            axisLabel: {
              color: this.isDark ? 'rgba(255, 255, 255, 0.45)' : '#8c8c8c'
            }
          }
        ],
        yAxis: [
          {
            type: 'value',
            min: minVal !== null ? Math.floor(minVal) : null,
            max: maxVal !== null ? Math.ceil(maxVal) : null,
            splitLine: {
              lineStyle: {
                type: 'dashed',
                color: this.isDark ? '#303030' : '#f0f0f0'
              }
            },
            axisLabel: {
              color: this.isDark ? 'rgba(255, 255, 255, 0.45)' : '#8c8c8c'
            }
          }
        ],
        series: [
          {
            name: this.metricName,
            type: 'line',
            showSymbol: false,
            smooth: true,
            lineStyle: {
              width: 2,
              color: lineColor
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: areaColor1 },
                { offset: 1, color: areaColor2 }
              ])
            },
            itemStyle: {
              color: lineColor
            },
            data: values
          }
        ]
      }

      this.chartInstance.setOption(option)
      // Force resize in case the container was hidden (v-show) when the chart
      // was first initialized — guarantees correct width is applied.
      this.$nextTick(() => {
        if (this.chartInstance) {
          this.chartInstance.resize()
        }
      })
    }
  }
}
</script>

<style scoped lang="less">
.macro-metric-chart-container {
  width: 100%;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
  padding: 16px;
  margin-top: 16px;
}
.chart-header {
  margin-bottom: 12px;
  .chart-title {
    font-size: 14px;
    font-weight: 600;
    color: #262626;
  }
  .chart-unit {
    font-size: 12px;
    color: #8c8c8c;
    margin-left: 8px;
  }
}
.error-state {
  padding: 40px 0;
  text-align: center;
  color: #595959;
}
.empty-state {
  padding: 40px 0;
}
</style>
