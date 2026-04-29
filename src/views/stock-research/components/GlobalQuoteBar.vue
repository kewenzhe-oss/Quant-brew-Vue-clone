<template>
  <div class="global-quote-bar">
    <div class="quote-container">
      <div class="symbol-info">
        <span class="symbol-ticker">{{ symbol || '—' }}</span>
        <span class="company-name" v-if="symbol">{{ companyName }}</span>
      </div>

      <div class="price-info" v-if="symbol">
        <span class="current-price">{{ formatPrice(quote.price) }}</span>
        <span :class="['price-change', changeClass]">
          {{ formatChange(quote.change, quote.change_percent) }}
        </span>
      </div>

      <div class="stats-row" v-if="symbol">
        <div class="stat-item">
          <span class="label">VOL:</span>
          <span class="value">{{ formatLarge(quote.volume) }}</span>
        </div>
        <div class="stat-item">
          <span class="label">H/L:</span>
          <span class="value">{{ formatPrice(quote.high) }} / {{ formatPrice(quote.low) }}</span>
        </div>
        <div class="stat-item">
          <span class="label">MKT CAP:</span>
          <span class="value">{{ formatLarge(info.market_cap) }}</span>
        </div>
      </div>

      <div class="empty-placeholder" v-else>
        No symbol loaded.
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'GlobalQuoteBar',
  computed: {
    ...mapState('equity', ['currentSymbol', 'quote', 'info']),
    symbol () {
      return this.currentSymbol
    },
    companyName () {
      return this.info.company_name || ''
    },
    changeClass () {
      if (!this.quote.change) return 'neutral'
      return this.quote.change >= 0 ? 'positive' : 'negative'
    }
  },
  methods: {
    formatPrice (val) {
      if (!val) return '—'
      const num = parseFloat(val)
      if (isNaN(num)) return '—'
      return '$' + num.toFixed(2)
    },
    formatChange (change, percent) {
      if (!change && change !== 0 && !percent && percent !== 0) return '—'
      const cNum = parseFloat(change) || 0
      const sign = cNum >= 0 ? '+' : ''

      // Backend returns change_percent as human percent (e.g. 1.14 = 1.14%).
      // Do NOT multiply by 100 again.
      let pNum = parseFloat(percent)
      if (isNaN(pNum)) {
        // Fallback: compute from price and prev_close if available
        const price = parseFloat(this.quote && this.quote.price)
        const prevClose = parseFloat(this.quote && this.quote.prev_close)
        if (!isNaN(price) && !isNaN(prevClose) && prevClose !== 0) {
          pNum = ((price - prevClose) / prevClose) * 100
        } else {
          return `${sign}${cNum.toFixed(2)}`
        }
      }

      return `${sign}${cNum.toFixed(2)} (${sign}${pNum.toFixed(2)}%)`
    },
    formatLarge (val) {
      if (!val) return '—'
      const num = parseFloat(val)
      if (isNaN(num)) return '—'
      if (num >= 1e12) return '$' + (num / 1e12).toFixed(2) + 'T'
      if (num >= 1e9) return '$' + (num / 1e9).toFixed(2) + 'B'
      if (num >= 1e6) return '$' + (num / 1e6).toFixed(2) + 'M'
      return '$' + new Intl.NumberFormat().format(num)
    }
  }
}
</script>

<style scoped lang="less">
.global-quote-bar {
  height: 56px;
  background: #ffffff;
  border-bottom: 1px solid #e8e8e8;
  display: flex;
  align-items: center;
  padding: 0 24px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.03);
}

.quote-container {
  display: flex;
  align-items: center;
  width: 100%;
  gap: 32px;
}

.symbol-info {
  display: flex;
  align-items: baseline;
  gap: 12px;
  min-width: 150px;

  .symbol-ticker {
    color: #faad14; /* Amber accent */
    font-size: 18px;
    font-weight: 700;
    letter-spacing: 1px;
  }

  .company-name {
    color: #8c8c8c;
    font-size: 13px;
    max-width: 150px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.price-info {
  display: flex;
  align-items: baseline;
  gap: 12px;

  .current-price {
    font-size: 20px;
    font-weight: 700;
    color: #262626;
  }

  .price-change {
    font-size: 14px;
    font-weight: 600;
    &.positive { color: #52c41a; }
    &.negative { color: #f5222d; }
    &.neutral { color: #8c8c8c; }
  }
}

.stats-row {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-left: auto;

  .stat-item {
    display: flex;
    align-items: baseline;
    gap: 6px;

    .label {
      font-size: 12px;
      color: #8c8c8c;
      font-weight: 600;
    }

    .value {
      font-size: 14px;
      font-weight: 600;
      color: #262626;
    }
  }
}

.empty-placeholder {
  color: #bfbfbf;
  font-size: 14px;
}
</style>
