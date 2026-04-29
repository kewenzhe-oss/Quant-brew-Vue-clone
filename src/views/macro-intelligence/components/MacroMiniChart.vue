<template>
  <div class="macro-mini-chart" ref="chartContainer"></div>
</template>

<script>
import { createChart } from 'lightweight-charts'

export default {
  name: 'MacroMiniChart',
  props: {
    data: {
      type: Array,
      default: () => []
    },
    color: {
      type: String,
      default: '#1890ff' // Default to theme blue
    }
  },
  data () {
    return {
      chart: null,
      series: null
    }
  },
  watch: {
    data: {
      handler (newData) {
        if (this.series && newData && newData.length) {
          this.series.setData(newData)
          this.chart.timeScale().fitContent()
        }
      },
      deep: true
    }
  },
  mounted () {
    this.initChart()
  },
  beforeDestroy () {
    if (this.chart) {
      this.chart.remove()
      this.chart = null
    }
  },
  methods: {
    initChart () {
      if (!this.$refs.chartContainer) return

      const chartOptions = {
        layout: {
          background: { type: 'solid', color: 'transparent' },
          textColor: 'transparent'
        },
        grid: {
          vertLines: { visible: false },
          horzLines: { visible: false }
        },
        rightPriceScale: {
          visible: false,
          borderVisible: false
        },
        timeScale: {
          visible: false,
          borderVisible: false
        },
        crosshair: {
          mode: 0, // Normal mode
          vertLine: { visible: false },
          horzLine: { visible: false }
        },
        handleScroll: false,
        handleScale: false,
        width: this.$refs.chartContainer.clientWidth || 100,
        height: 60
      }

      this.chart = createChart(this.$refs.chartContainer, chartOptions)

      this.series = this.chart.addLineSeries({
        color: this.color,
        lineWidth: 2,
        crosshairMarkerVisible: false,
        lastValueVisible: false,
        priceLineVisible: false
      })

      if (this.data && this.data.length > 0) {
        this.series.setData(this.data)
        this.chart.timeScale().fitContent()
      }

      // Handle resize safely
      const ro = new ResizeObserver(entries => {
        if (!entries || !entries.length || !this.chart) return
        const cr = entries[0].contentRect
        this.chart.applyOptions({ width: cr.width })
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
.macro-mini-chart {
  width: 100%;
  height: 60px;
  opacity: 0.8;
}
</style>
