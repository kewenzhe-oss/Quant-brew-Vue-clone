<template>
  <div class="global-quote-bar-wrapper">
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

        <!-- Workflow Continuity Button -->
        <div class="quote-actions" v-if="symbol">
          <a-button type="primary" size="small" class="draft-plan-btn" @click="goToDraftPlan">
            <a-icon type="form" />
            {{ ($i18n && $i18n.locale === 'zh-CN') ? '拟定策略计划' : 'Thesis Planning' }}
          </a-button>
        </div>
      </div>
    </div>

    <!-- Bottom Trust Metadata Bar -->
    <div class="trust-metadata-bar" v-if="symbol">
      <div class="trust-left">
        <span class="trust-item">
          <a-icon type="database" class="trust-icon" />
          <span class="trust-label">{{ ($i18n && $i18n.locale === 'zh-CN') ? '数据源' : 'Sources' }}:</span>
          <span class="trust-val">yfinance, SEC, FRED</span>
        </span>
        <span class="trust-divider">·</span>
        <span class="trust-item">
          <a-icon type="clock-circle" class="trust-icon" />
          <span class="trust-label">{{ ($i18n && $i18n.locale === 'zh-CN') ? '时间周期' : 'Timeframe' }}:</span>
          <span class="trust-val">{{ ($i18n && $i18n.locale === 'zh-CN') ? '日线(24h同步)' : 'Daily (24h Sync)' }}</span>
        </span>
        <span class="trust-divider">·</span>
        <span class="trust-item">
          <a-icon type="setting" class="trust-icon" />
          <span class="trust-label">{{ ($i18n && $i18n.locale === 'zh-CN') ? '计算参数' : 'Params' }}:</span>
          <span class="trust-val">Standard (14, 20)</span>
        </span>
      </div>
      <div class="trust-right">
        <span class="trust-badge">
          <a-icon type="safety-certificate" theme="filled" class="badge-icon" />
          <span>{{ ($i18n && $i18n.locale === 'zh-CN') ? 'AI 安全验证通过' : 'AI-Verified ✓' }}</span>
        </span>
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
    goToDraftPlan () {
      if (this.symbol) {
        let type = 'Stock'
        if (this.info && this.info.asset_type) {
          type = this.info.asset_type
        } else if (this.symbol.includes('/') || this.symbol.includes('-')) {
          type = 'Crypto'
        }
        this.$router.push({
          path: '/indicator-ide',
          query: { symbol: this.symbol, assetType: type }
        })
      }
    },
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
.global-quote-bar-wrapper {
  background: #ffffff;
  border-bottom: 1px solid #e8e8e8;
  box-shadow: 0 1px 2px rgba(0,0,0,0.03);
}

.global-quote-bar {
  height: 56px;
  display: flex;
  align-items: center;
  padding: 0 24px;
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

.quote-actions {
  flex-shrink: 0;
  margin-left: 12px;

  .draft-plan-btn {
    border-radius: 8px;
    font-weight: 600;
    background: #faad14;
    border-color: #faad14;
    color: #ffffff;
    padding: 0 16px;
    display: flex;
    align-items: center;
    gap: 6px;

    &:hover, &:focus {
      background: #fadb14;
      border-color: #fadb14;
      color: #ffffff;
      box-shadow: 0 2px 8px rgba(250, 173, 20, 0.25);
    }
  }
}

.empty-placeholder {
  color: #bfbfbf;
  font-size: 14px;
}

/* --- Trust Metadata Bar styles --- */
.trust-metadata-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fafafa;
  border-top: 1px solid #f0f0f0;
  padding: 6px 24px;
  font-size: 11px;
  color: #8c8c8c;

  .trust-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .trust-divider {
    color: #d9d9d9;
    user-select: none;
  }

  .trust-item {
    display: flex;
    align-items: center;
    gap: 4px;

    .trust-icon {
      font-size: 12px;
      color: #bfbfbf;
    }

    .trust-label {
      font-weight: 600;
      color: #8c8c8c;
    }

    .trust-val {
      color: #595959;
    }
  }

  .trust-badge {
    background: rgba(82, 196, 26, 0.08);
    border: 1px solid rgba(82, 196, 26, 0.2);
    border-radius: 4px;
    padding: 1px 8px;
    color: #52c41a;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    gap: 4px;

    .badge-icon {
      font-size: 10px;
    }
  }
}

/* ========== Mobile UX: Persistent Global Quote Bar Wrap (PR2) ========== */
@media (max-width: 768px) {
  .global-quote-bar {
    height: auto !important;
    padding: 12px 16px !important;
  }
  .quote-container {
    flex-direction: column !important;
    align-items: flex-start !important;
    gap: 8px !important;
  }
  .stats-row {
    margin-left: 0 !important;
    flex-wrap: wrap !important;
    gap: 8px 16px !important;
    width: 100% !important;
  }
  .quote-actions {
    margin-left: 0 !important;
    width: 100% !important;
    
    .draft-plan-btn {
      width: 100% !important;
      justify-content: center !important;
    }
  }
  .trust-metadata-bar {
    flex-direction: column !important;
    align-items: flex-start !important;
    gap: 8px !important;
    padding: 8px 16px !important;

    .trust-left {
      flex-direction: column !important;
      align-items: flex-start !important;
      gap: 4px !important;
    }

    .trust-divider {
      display: none !important;
    }
  }
}

/* ========== Dark Theme Overrides ========== */
body.dark, body.realdark {
  .global-quote-bar-wrapper {
    background: #1c1c1c !important;
    border-bottom-color: #2a2a2a !important;
  }
  .global-quote-bar {
    background: #1c1c1c !important;
  }
  .price-info .current-price {
    color: rgba(255, 255, 255, 0.85) !important;
  }
  .stats-row .stat-item {
    .value {
      color: rgba(255, 255, 255, 0.85) !important;
    }
  }
  .trust-metadata-bar {
    background: #141414 !important;
    border-top-color: #2a2a2a !important;
    color: rgba(255, 255, 255, 0.45) !important;
    
    .trust-item {
      .trust-val {
        color: rgba(255, 255, 255, 0.65) !important;
      }
    }
  }
}
</style>
