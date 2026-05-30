<template>
  <div class="stock-kline-chart" ref="chartContainer"></div>
</template>

<script>
import * as echarts from 'echarts'
import moment from 'moment'

export default {
  name: 'StockKlineChart',
  props: {
    history: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      chartInstance: null
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
        this.renderChart()
      })
    },
    history: {
      deep: true,
      handler () {
        this.$nextTick(() => {
          this.renderChart()
        })
      }
    }
  },
  mounted () {
    window.addEventListener('resize', this.handleResize)
    if (this.history) {
      this.renderChart()
    }
  },
  beforeDestroy () {
    window.removeEventListener('resize', this.handleResize)
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
    renderChart () {
      if (!this.$refs.chartContainer || !this.history || !this.history.length) return

      if (!this.chartInstance) {
        this.chartInstance = echarts.init(this.$refs.chartContainer)
      }

      const timestamps = this.history.map(item => moment.unix(item.timestamp).format('YYYY-MM-DD'))
      const data = this.history.map(item => [
        item.open,
        item.close,
        item.low,
        item.high
      ])

      const option = {
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'cross' },
          backgroundColor: this.isDark ? 'rgba(30, 30, 30, 0.95)' : 'rgba(255, 255, 255, 0.9)',
          borderColor: this.isDark ? '#3a3a3a' : '#e8e8e8',
          textStyle: { color: this.isDark ? 'rgba(255, 255, 255, 0.85)' : '#262626' }
        },
        grid: {
          left: '2%',
          right: '5%',
          bottom: '10%',
          top: '5%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: timestamps,
          scale: true,
          boundaryGap: false,
          axisLine: { lineStyle: { color: this.isDark ? '#3a3a3a' : '#d9d9d9' } },
          axisLabel: { color: this.isDark ? 'rgba(255, 255, 255, 0.45)' : '#8c8c8c' },
          splitLine: { show: false }
        },
        yAxis: {
          scale: true,
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: { color: this.isDark ? 'rgba(255, 255, 255, 0.45)' : '#8c8c8c' },
          splitLine: { lineStyle: { color: this.isDark ? '#303030' : '#f0f0f0', type: 'dashed' } }
        },
        dataZoom: [
          { type: 'inside', start: 0, end: 100 }
        ],
        series: [
          {
            name: 'Price',
            type: 'candlestick',
            data: data,
            itemStyle: {
              color: '#52c41a', // Bullish
              color0: '#f5222d', // Bearish
              borderColor: '#52c41a',
              borderColor0: '#f5222d'
            }
          }
        ]
      }

      // Pass `true` as second arg (notMerge) so ECharts fully replaces
      // xAxis categories and dataZoom rather than merging stale state
      this.chartInstance.setOption(option, true)
    }
  }
}
</script>

<style scoped>
.stock-kline-chart {
  width: 100%;
  height: 100%;
}
</style>
