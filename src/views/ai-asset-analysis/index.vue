<template>
  <div class="ai-asset-analysis-page" :class="{ 'theme-dark': isDarkTheme }">

    <!-- ======== AI Trading Radar ======== -->
    <div class="radar-section" v-if="opportunities.length > 0">
      <div class="radar-header">
        <div class="radar-header-left">
          <h2 class="radar-title">{{ $t('aiAssetAnalysis.opportunities.title') }}</h2>
          <p class="radar-subtitle">{{ $t('aiAssetAnalysis.opportunities.updateHint') }}</p>
        </div>
        <a-button class="radar-refresh-btn" size="small" :loading="oppLoading" @click="loadOpportunities(true)">
          <a-icon type="sync" /> {{ $t('common.refresh') || 'Refresh' }}
        </a-button>
      </div>
      <div
        class="radar-carousel"
        @mouseenter="oppHover = true"
        @mouseleave="oppHover = false"
      >
        <div class="radar-track" :class="{ paused: oppHover }" :style="oppTrackStyle">
          <div
            class="radar-card"
            v-for="(opp, idx) in carouselItems"
            :key="'opp-' + idx"
            :class="[opp.impact, { 'is-prediction': opp.market === 'PredictionMarket' }]"
            @click="analyzeOpportunity(opp)"
          >
            <!-- Card top: symbol + market -->
            <div class="rc-head">
              <span class="rc-symbol" :class="{ 'rc-prediction-title': opp.market === 'PredictionMarket' }">
                {{ opp.market === 'PredictionMarket' ? (opp.name || opp.symbol) : opp.symbol }}
              </span>
              <span class="rc-market" :class="'rc-market-' + (opp.market || '').toLowerCase()">
                {{ getMarketLabel(opp.market) }}
              </span>
            </div>
            <!-- Metrics row (non-prediction) -->
            <div class="rc-metrics" v-if="opp.market !== 'PredictionMarket'">
              <div class="rc-metric">
                <span class="rc-metric-label">{{ ($i18n && $i18n.locale === 'zh-CN') ? '当前价格' : 'Price' }}</span>
                <span class="rc-metric-value">${{ formatOppPrice(opp.price) }}</span>
              </div>
              <div class="rc-metric">
                <span class="rc-metric-label">{{ ($i18n && $i18n.locale === 'zh-CN') ? '24h涨跌' : '24h Change' }}</span>
                <span class="rc-metric-value" :class="opp.change_24h >= 0 ? 'rc-up' : 'rc-down'">
                  {{ opp.change_24h >= 0 ? '+' : '' }}{{ (opp.change_24h || 0).toFixed(2) }}%
                </span>
              </div>
              <div class="rc-metric">
                <span class="rc-metric-label">{{ ($i18n && $i18n.locale === 'zh-CN') ? '信号' : 'Signal' }}</span>
                <span class="rc-metric-value rc-signal-val" :class="'rc-signal-' + (opp.signal || '')">
                  {{ getSignalLabel(opp.signal) }}
                </span>
              </div>
            </div>
            <!-- Metrics row (prediction market) -->
            <div class="rc-metrics" v-else>
              <div class="rc-metric">
                <span class="rc-metric-label">{{ ($i18n && $i18n.locale === 'zh-CN') ? '市场概率' : 'Probability' }}</span>
                <span class="rc-metric-value">{{ (opp.price || 0).toFixed(1) }}%</span>
              </div>
              <div class="rc-metric" v-if="opp.ai_analysis">
                <span class="rc-metric-label">{{ ($i18n && $i18n.locale === 'zh-CN') ? '机会评分' : 'Score' }}</span>
                <span class="rc-metric-value rc-up">{{ opp.ai_analysis.opportunity_score.toFixed(0) }}</span>
              </div>
              <div class="rc-metric" v-if="opp.ai_analysis">
                <span class="rc-metric-label">{{ ($i18n && $i18n.locale === 'zh-CN') ? '建议' : 'Rec.' }}</span>
                <span class="rc-metric-value" :class="opp.ai_analysis.recommendation === 'YES' ? 'rc-up' : opp.ai_analysis.recommendation === 'NO' ? 'rc-down' : ''">
                  {{ getRecommendationLabel(opp.ai_analysis.recommendation) }}
                </span>
              </div>
            </div>
            <!-- Card footer -->
            <div class="rc-footer">
              <span class="rc-reason">{{ getReasonText(opp) }}</span>
            </div>
          </div>
        </div>
      </div>
      <!-- Provenance warning/trust label -->
      <div class="provenance-footer">
        <span>{{ $t('aiAssetAnalysis.opportunities.provenance.ruleBased') }}</span>
        <span class="divider">·</span>
        <span>{{ $t('aiAssetAnalysis.opportunities.provenance.basis') }}</span>
        <span class="divider" v-if="provenanceMeta && provenanceMeta.as_of">·</span>
        <span v-if="provenanceMeta && provenanceMeta.as_of">{{ $t('aiAssetAnalysis.opportunities.provenance.asOf', { time: formatProvenanceTime(provenanceMeta.as_of) }) }}</span>
        <span class="divider">·</span>
        <span class="warning-text">{{ $t('aiAssetAnalysis.opportunities.provenance.observationOnly') }}</span>
      </div>
    </div>

    <!-- ======== Main Workspace Card ======== -->
    <a-card :bordered="false" class="workspace-card">
      <div class="workspace-header-bar">
        <h3 class="workspace-title">
          <a-icon type="dashboard" class="workspace-icon" />
          {{ $t('aiAssetAnalysis.observation.title') }}
        </h3>
        <p class="workspace-subtitle">{{ $t('aiAssetAnalysis.observation.subtitle') }}</p>
      </div>
      <div class="analysis-wrapper">
        <AnalysisView
          :embedded="true"
          :preset-symbol="presetSymbol"
          :auto-analyze-signal="autoAnalyzeSignal"
          @symbol-change="onAnalysisSymbolChange"
        />
      </div>
    </a-card>

  </div>
</template>

<script>
import { mapState } from 'vuex'
import AnalysisView from '@/views/ai-analysis'
import { getTradingOpportunities } from '@/api/global-market'

export default {
  name: 'AIAssetAnalysis',
  components: {
    AnalysisView
  },
  data () {
    return {
      // Opportunities (Carousel)
      opportunities: [],
      provenanceMeta: null,
      oppLoading: false,
      oppHover: false,
      // Props passed to AnalysisView
      presetSymbol: '',
      autoAnalyzeSignal: 0,
      // Current analysis symbol (from AnalysisView)
      currentAnalysisSymbol: '',
      currentAnalysisMarket: ''
    }
  },
  computed: {
    ...mapState({
      navTheme: state => state.app.theme
    }),
    isDarkTheme () {
      return this.navTheme === 'dark' || this.navTheme === 'realdark'
    },
    // Duplicate items for seamless infinite carousel
    carouselItems () {
      if (this.opportunities.length === 0) return []
      // Duplicate the array so the CSS animation can loop seamlessly
      return [...this.opportunities, ...this.opportunities]
    },
    oppTrackStyle () {
      // Animation duration proportional to number of items (3s per card)
      const duration = this.opportunities.length * 3
      return {
        animationDuration: duration + 's'
      }
    }
  },
  created () {
    this.loadOpportunities()
  },
  methods: {
    // ==================== Trading Opportunities (Carousel) ====================
    async loadOpportunities (force = false) {
      this.oppLoading = true
      try {
        const params = force ? { force: true } : {}
        const res = await getTradingOpportunities(params)
        const payload = res && res.data
        const list = Array.isArray(payload) ? payload : (payload && (payload.items || payload.opportunities)) || []
        // Keep only non-PredictionMarket items
        this.opportunities = list.filter(opp => opp.market !== 'PredictionMarket').slice(0, 20)
        this.provenanceMeta = (!Array.isArray(payload) && payload && payload.meta) || null
      } catch (e) {
        console.warn('Load opportunities failed:', e)
      } finally {
        this.oppLoading = false
      }
    },
    getSignalColor (signal) {
      const map = {
        overbought: 'volcano',
        oversold: 'green',
        bullish_momentum: 'cyan',
        bearish_momentum: 'red'
      }
      return map[signal] || 'default'
    },
    getSignalLabel (signal) {
      const key = `aiAssetAnalysis.opportunities.signal.${signal}`
      const translated = this.$t(key)
      // If i18n returns the key itself, fall back to the raw signal name
      return translated !== key ? translated : signal
    },
    getMarketTagColor (market) {
      const colors = {
        Crypto: 'purple',
        USStock: 'green',
        CNStock: 'blue',
        HKStock: 'geekblue',
        Forex: 'gold',
        PredictionMarket: 'cyan'
      }
      return colors[market] || 'default'
    },
    getMarketLabel (market) {
      const key = `aiAssetAnalysis.opportunities.market.${market}`
      const translated = this.$t(key)
      return translated !== key ? translated : market
    },
    getReasonText (opp) {
      const market = (opp.market || 'Crypto').toLowerCase()
      const signal = opp.signal || ''
      const key = `aiAssetAnalysis.opportunities.reason.${market}.${signal}`
      const translated = this.$t(key)
      if (translated === key) {
        // i18n key not found, fall back to backend reason
        return opp.reason || ''
      }
      const change = Math.abs(opp.change_24h || 0).toFixed(1)
      const change7d = Math.abs(opp.change_7d || 0).toFixed(1)
      return translated.replace('{change}', change).replace('{change7d}', change7d)
    },
    formatOppPrice (price) {
      if (!price) return '--'
      if (price >= 10000) return (price / 1000).toFixed(1) + 'K'
      if (price >= 1) return price.toFixed(2)
      return price.toFixed(4)
    },
    formatProvenanceTime (val) {
      if (!val) return ''
      try {
        const d = new Date(val)
        const pad = (n) => String(n).padStart(2, '0')
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
      } catch (e) {
        return val
      }
    },
    analyzeOpportunity (opp) {
      // 其他市场，在AI分析中打开
      const market = opp.market || 'Crypto'
      this.presetSymbol = `${market}:${opp.symbol}`
      this.$nextTick(() => {
        this.autoAnalyzeSignal++
      })
    },
    // ==================== Quick Trade ====================
    onAnalysisSymbolChange (value) {
      // value format: "Crypto:BTC/USDT"
      if (!value) {
        this.currentAnalysisSymbol = ''
        this.currentAnalysisMarket = ''
        return
      }
      const parts = value.split(':')
      const market = parts.length > 1 ? parts[0] : 'Crypto'
      const symbol = parts.length > 1 ? parts[1] : parts[0]
      this.currentAnalysisMarket = market
      // Only allow Quick Trade for Crypto
      if (market === 'Crypto') {
        this.currentAnalysisSymbol = symbol
      } else {
        this.currentAnalysisSymbol = ''
      }
    }
  }
}
</script>

<style lang="less" scoped>
.ai-asset-analysis-page {
  padding: 20px;
  min-height: calc(100vh - 120px);
  background: #f0f2f5;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;

  /* ===== Radar Section ===== */
  .radar-section {
    margin-bottom: 20px;

    .radar-header {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      margin-bottom: 14px;

      .radar-header-left {
        .radar-title {
          margin: 0;
          font-size: 16px;
          font-weight: 700;
          color: #1a1a1a;
          letter-spacing: -0.2px;
        }
        .radar-subtitle {
          margin: 2px 0 0;
          font-size: 12px;
          color: #999;
        }
      }

      .radar-refresh-btn {
        border-radius: 8px;
        border: 1px solid #e0e0e0;
        background: #fff;
        color: #666;
        font-size: 12px;
        font-weight: 500;
        &:hover { border-color: #6366f1; color: #6366f1; }
      }
    }

    .radar-carousel {
      overflow: hidden;
      position: relative;
      border-radius: 12px;
      padding: 2px 0;

      &::before,
      &::after {
        content: '';
        position: absolute;
        top: 0;
        bottom: 0;
        width: 50px;
        z-index: 2;
        pointer-events: none;
      }
      &::before { left: 0; background: linear-gradient(to right, #f0f2f5, transparent); }
      &::after  { right: 0; background: linear-gradient(to left, #f0f2f5, transparent); }
    }

    .radar-track {
      display: flex;
      gap: 12px;
      animation: radar-scroll 60s linear infinite;
      width: max-content;
      padding: 4px 0;
      &.paused { animation-play-state: paused; }
    }

    @keyframes radar-scroll {
      0%   { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }

    /* ----- Card (Light / default) ----- */
    .radar-card {
      width: 250px;
      background: #ffffff;
      border-radius: 12px;
      padding: 16px;
      cursor: pointer;
      flex-shrink: 0;
      border: 1px solid #eaeaea;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: 12px;
        opacity: 0;
        transition: opacity 0.3s;
        background: linear-gradient(135deg, rgba(99, 102, 241, 0.04), rgba(139, 92, 246, 0.02));
      }

      &:hover {
        transform: translateY(-2px);
        border-color: rgba(99, 102, 241, 0.3);
        box-shadow: 0 6px 24px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(99, 102, 241, 0.1);
        &::before { opacity: 1; }
      }

      &.is-prediction { width: 290px; }

      .rc-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;
        gap: 8px;
      }

      .rc-symbol {
        font-weight: 800;
        font-size: 15px;
        color: #111;
        letter-spacing: -0.2px;

        &.rc-prediction-title {
          font-size: 13px;
          font-weight: 600;
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      }

      .rc-market {
        font-size: 10px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.6px;
        padding: 2px 7px;
        border-radius: 5px;
        flex-shrink: 0;
        background: #f5f5f5;
        color: #888;

        &.rc-market-crypto   { color: #7c3aed; background: rgba(124, 58, 237, 0.08); }
        &.rc-market-usstock  { color: #16a34a; background: rgba(22, 163, 74, 0.08); }
        &.rc-market-forex    { color: #d97706; background: rgba(217, 119, 6, 0.08); }
        &.rc-market-predictionmarket { color: #0891b2; background: rgba(8, 145, 178, 0.08); }
      }

      .rc-metrics {
        display: flex;
        gap: 4px;
        margin-bottom: 12px;
      }

      .rc-metric {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 3px;
        padding: 7px;
        border-radius: 8px;
        background: #fafafa;

        .rc-metric-label {
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.4px;
          color: #999;
        }

        .rc-metric-value {
          font-size: 13px;
          font-weight: 700;
          color: #222;

          &.rc-up   { color: #16a34a; }
          &.rc-down { color: #dc2626; }

          &.rc-signal-val { font-size: 11px; font-weight: 600; }
          &.rc-signal-bullish_momentum { color: #0891b2; }
          &.rc-signal-overbought       { color: #d97706; }
          &.rc-signal-oversold         { color: #16a34a; }
          &.rc-signal-bearish_momentum { color: #dc2626; }
        }
      }

      .rc-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
      }

      .rc-reason {
        font-size: 11px;
        color: #999;
        line-height: 1.4;
        flex: 1;
        display: -webkit-box;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .rc-cta {
        font-size: 11px;
        font-weight: 700;
        color: #fff;
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
        padding: 4px 12px;
        border-radius: 8px;
        white-space: nowrap;
        cursor: pointer;
        transition: all 0.2s;
        flex-shrink: 0;
        &:hover {
          transform: scale(1.05);
          box-shadow: 0 2px 12px rgba(99, 102, 241, 0.35);
        }
      }
    }

    .provenance-footer {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 12px;
      font-size: 11px;
      color: #999;
      padding: 0 4px;
      line-height: 1.5;

      .divider {
        color: #ccc;
        user-select: none;
      }

      .warning-text {
        font-weight: 500;
        color: #888;
      }
    }
  }

  /* ===== Floating QT Button ===== */
  .qt-floating-btn {
    position: fixed;
    right: 24px;
    bottom: 80px;
    width: 48px;
    height: 48px;
    border-radius: 14px;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    cursor: pointer;
    box-shadow: 0 4px 20px rgba(99, 102, 241, 0.35);
    z-index: 1000;
    transition: all 0.3s;
    animation: qt-float-pulse 2.5s ease-in-out infinite;
    &:hover {
      transform: scale(1.08);
      box-shadow: 0 6px 28px rgba(99, 102, 241, 0.5);
    }
  }
  @keyframes qt-float-pulse {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-4px); }
  }

  /* ===== Workspace Card ===== */
  .workspace-card {
    border-radius: 14px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
    border: 1px solid #e8e8e8;

    ::v-deep .ant-card-body { padding: 0; }

    .workspace-header-bar {
      padding: 16px 24px;
      border-bottom: 1.5px solid #f0f0f0;
      background: #fafafa;
      text-align: left;
      
      .workspace-title {
        font-size: 15px;
        font-weight: 700;
        color: #0f172a;
        margin: 0;
        display: flex;
        align-items: center;
        gap: 8px;
        
        .workspace-icon {
          color: #6366f1;
          font-size: 16px;
        }
      }
      
      .workspace-subtitle {
        margin: 4px 0 0 0;
        font-size: 11px;
        color: #64748b;
        font-weight: 400;
        line-height: 1.4;
      }
    }

    .analysis-wrapper {
      ::v-deep .ai-analysis-container.embedded,
      ::v-deep .portfolio-container.embedded {
        border-radius: 0;
        overflow: hidden;
      }
    }
  }

  /* ===== Dark Theme ===== */
  &.theme-dark {
    background: #141414;

    .radar-section {
      .radar-header {
        .radar-title { color: #e8e8e8; }
        .radar-subtitle { color: #666; }
      }
      .radar-refresh-btn {
        background: #1c1c1c;
        border-color: #2a2a2a;
        color: #999;
        &:hover { border-color: #6366f1; color: #a78bfa; }
      }
      .radar-carousel {
        &::before { background: linear-gradient(to right, #141414, transparent); }
        &::after  { background: linear-gradient(to left, #141414, transparent); }
      }

      .provenance-footer {
        color: #555;
        .divider { color: #333; }
        .warning-text { color: #666; }
      }

      .radar-card {
        background: #1a1a1c;
        border-color: rgba(255, 255, 255, 0.06);

        &::before {
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.06), rgba(139, 92, 246, 0.03));
        }

        &:hover {
          border-color: rgba(99, 102, 241, 0.25);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(99, 102, 241, 0.15);
        }

        .rc-symbol { color: #f0f0f0; }

        .rc-market {
          background: rgba(255, 255, 255, 0.06);
          color: #888;
          &.rc-market-crypto   { color: #a78bfa; background: rgba(167, 139, 250, 0.12); }
          &.rc-market-usstock  { color: #4ade80; background: rgba(74, 222, 128, 0.10); }
          &.rc-market-forex    { color: #fbbf24; background: rgba(251, 191, 36, 0.10); }
          &.rc-market-predictionmarket { color: #22d3ee; background: rgba(34, 211, 238, 0.10); }
        }

        .rc-metric {
          background: rgba(255, 255, 255, 0.03);
          .rc-metric-label { color: #666; }
          .rc-metric-value {
            color: #ddd;
            &.rc-up   { color: #4ade80; }
            &.rc-down { color: #f87171; }
            &.rc-signal-bullish_momentum { color: #22d3ee; }
            &.rc-signal-overbought       { color: #fbbf24; }
            &.rc-signal-oversold         { color: #4ade80; }
            &.rc-signal-bearish_momentum { color: #f87171; }
          }
        }

        .rc-reason { color: #555; }
        .rc-cta { color: #fff; }
      }
    }

    .workspace-card {
      background: #1c1c1c;
      border-color: #2a2a2a;

      .workspace-header-bar {
        border-bottom-color: #2a2a2a;
        background: #181818;
        
        .workspace-title {
          color: rgba(255, 255, 255, 0.85);
          .workspace-icon {
            color: #a78bfa;
          }
        }
        
        .workspace-subtitle {
          color: rgba(255, 255, 255, 0.45);
        }
      }
    }
  }
}

/* ========== 移动端自适应 ========== */
@media (max-width: 768px) {
  .ai-asset-analysis-page {
    padding: 8px;
    min-height: auto;

    .radar-section {
      margin-bottom: 10px;

      .radar-header {
        flex-direction: column;
        align-items: stretch;
        gap: 8px;

        .radar-header-left {
          .radar-title { font-size: 15px; }
          .radar-subtitle { font-size: 11px; }
        }

        .radar-refresh-btn {
          align-self: flex-end;
        }
      }

      .radar-carousel {
        &::before,
        &::after {
          width: 28px;
        }
      }

      .radar-card {
        width: 210px;
        padding: 12px;

        &.is-prediction {
          width: 248px;
        }

        .rc-symbol { font-size: 14px; }
        .rc-metric { padding: 6px; }
      }
    }

    .qt-floating-btn {
      right: ~"max(8px, env(safe-area-inset-right, 0px))";
      bottom: ~"max(68px, calc(52px + env(safe-area-inset-bottom, 0px)))";
      width: 44px;
      height: 44px;
      font-size: 20px;
    }

    .workspace-card {
      border-radius: 10px;
      .workspace-header-bar {
        padding: 12px 16px;
      }
    }
  }
}

@media (max-width: 480px) {
  .ai-asset-analysis-page {
    padding: 4px;

    .radar-section .radar-card {
      width: 188px;
      padding: 10px;

      &.is-prediction {
        width: 220px;
      }

      .rc-metrics { gap: 3px; }
      .rc-metric .rc-metric-value { font-size: 12px; }
    }

    .workspace-card {
      .workspace-header-bar {
        padding: 10px 12px;
      }
    }
  }
}
</style>
