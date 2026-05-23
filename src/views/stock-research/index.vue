<template>
  <div class="stock-research-workspace">
    <!-- Command Bar / Search Section -->
    <div class="workspace-header" v-show="hasData">
      <div class="header-content">
        <h2 class="workspace-title">{{ $t('stockResearch.equityResearch') }}</h2>
        <div class="search-container">
          <a-input-search
            v-model="searchKeyword"
            :placeholder="$t('stockResearch.searchPlaceholder')"
            :enter-button="$t('stockResearch.searchBtn')"
            size="large"
            @search="handleSearch"
            :loading="coreLoading"
          />
        </div>
      </div>
    </div>

    <!-- Global Quote Bar (Persistent) -->
    <global-quote-bar v-if="hasData" />

    <!-- Workspace Tabs -->
    <div class="workspace-tabs-container" v-if="hasData">
      <a-tabs v-model="activeTab" class="fincept-tabs" @change="handleTabChange">
        <a-tab-pane key="overview" :tab="$t('stockResearch.tabs.overview')">
          <overview-tab />
        </a-tab-pane>

        <a-tab-pane key="financials" :tab="$t('stockResearch.tabs.financials')">
          <financials-tab />
        </a-tab-pane>

        <a-tab-pane key="technicals" :tab="$t('stockResearch.tabs.technicals')">
          <technicals-tab />
        </a-tab-pane>
      </a-tabs>
    </div>

    <!-- Landing UX / Empty State -->
    <div class="landing-container" v-else>
      <div v-if="coreLoading" class="landing-loading">
        <a-spin size="large" :tip="$t('stockResearch.loadingWorkspace')" />
      </div>
      <div v-else class="landing-content">
        <div class="landing-header">
          <h1 class="landing-title">{{ $t('stockResearch.title') }}</h1>
          <p class="landing-subtitle">
            {{ $t('stockResearch.subtitle') }}
          </p>
        </div>

        <div class="landing-search">
          <a-input-search
            v-model="landingSearchKeyword"
            :placeholder="$t('stockResearch.searchPlaceholderLong')"
            :enter-button="$t('stockResearch.searchBtn')"
            size="large"
            @search="handleSearch"
          />
        </div>

        <div class="landing-popular">
          <div class="popular-header">
            <h3 class="popular-title">{{ $t('stockResearch.popularTitle') }}</h3>
            <p class="popular-desc">{{ $t('stockResearch.popularDesc') }}</p>
          </div>

          <a-tabs default-active-key="mag7" class="popular-tabs">
            <a-tab-pane v-for="category in famousCategories" :key="category.key" :tab="category.name">
              <div class="popular-grid">
                <div
                  class="popular-card"
                  v-for="item in category.symbols"
                  :key="item.symbol"
                  @click="handleSearch(item.symbol)"
                >
                  <div class="card-main">
                    <span class="card-symbol">{{ item.symbol }}</span>
                    <span class="card-badge">{{ item.type }}</span>
                  </div>
                  <div class="card-name">{{ item.name }}</div>
                </div>
              </div>
            </a-tab-pane>
          </a-tabs>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import GlobalQuoteBar from './components/GlobalQuoteBar.vue'
import OverviewTab from './components/OverviewTab.vue'
import FinancialsTab from './components/FinancialsTab.vue'
import TechnicalsTab from './components/TechnicalsTab.vue'

export default {
  name: 'StockResearch',
  components: {
    GlobalQuoteBar,
    OverviewTab,
    FinancialsTab,
    TechnicalsTab
  },
  data () {
    return {
      searchKeyword: '',
      landingSearchKeyword: '',
      activeTab: 'overview'
    }
  },
  computed: {
    ...mapState('equity', ['currentSymbol', 'info', 'coreLoading']),
    hasData () {
      return this.currentSymbol && !this.coreLoading && Object.keys(this.info).length > 0
    },
    famousCategories () {
      return [
        {
          key: 'mag7',
          name: this.$t('stockResearch.categories.mag7'),
          symbols: [
            { symbol: 'AAPL', name: 'Apple Inc.', type: 'Stock' },
            { symbol: 'MSFT', name: 'Microsoft', type: 'Stock' },
            { symbol: 'NVDA', name: 'NVIDIA', type: 'Stock' },
            { symbol: 'GOOGL', name: 'Alphabet', type: 'Stock' },
            { symbol: 'AMZN', name: 'Amazon', type: 'Stock' },
            { symbol: 'META', name: 'Meta Platforms', type: 'Stock' },
            { symbol: 'TSLA', name: 'Tesla', type: 'Stock' }
          ]
        },
        {
          key: 'ai_semi',
          name: this.$t('stockResearch.categories.aiSemi'),
          symbols: [
            { symbol: 'NVDA', name: 'NVIDIA', type: 'Stock' },
            { symbol: 'AMD', name: 'Advanced Micro Devices', type: 'Stock' },
            { symbol: 'TSM', name: 'Taiwan Semiconductor', type: 'Stock' },
            { symbol: 'AVGO', name: 'Broadcom', type: 'Stock' },
            { symbol: 'ASML', name: 'ASML Holding', type: 'Stock' },
            { symbol: 'ARM', name: 'Arm Holdings', type: 'Stock' },
            { symbol: 'INTC', name: 'Intel', type: 'Stock' }
          ]
        },
        {
          key: 'etfs',
          name: this.$t('stockResearch.categories.etfs'),
          symbols: [
            { symbol: 'SPY', name: 'S&P 500 ETF', type: 'ETF' },
            { symbol: 'QQQ', name: 'Nasdaq 100 ETF', type: 'ETF' },
            { symbol: 'VOO', name: 'Vanguard S&P 500 ETF', type: 'ETF' },
            { symbol: 'SCHD', name: 'Dividend Equity ETF', type: 'ETF' },
            { symbol: 'IWM', name: 'Russell 2000 ETF', type: 'ETF' },
            { symbol: 'TLT', name: '20+ Year Treasury ETF', type: 'ETF' }
          ]
        },
        {
          key: 'crypto',
          name: this.$t('stockResearch.categories.crypto'),
          symbols: [
            { symbol: 'COIN', name: 'Coinbase', type: 'Stock' },
            { symbol: 'MSTR', name: 'MicroStrategy', type: 'Stock' },
            { symbol: 'MARA', name: 'Marathon Digital', type: 'Stock' },
            { symbol: 'RIOT', name: 'Riot Platforms', type: 'Stock' },
            { symbol: 'HOOD', name: 'Robinhood', type: 'Stock' }
          ]
        },
        {
          key: 'china_hk',
          name: this.$t('stockResearch.categories.chinaHk'),
          symbols: [
            { symbol: 'BABA', name: 'Alibaba ADR', type: 'Stock' },
            { symbol: 'JD', name: 'JD.com', type: 'Stock' },
            { symbol: 'PDD', name: 'PDD Holdings', type: 'Stock' },
            { symbol: 'BIDU', name: 'Baidu', type: 'Stock' },
            { symbol: 'TCEHY', name: 'Tencent ADR', type: 'Stock' },
            { symbol: '0700.HK', name: 'Tencent Holdings', type: 'HK Stock' },
            { symbol: '9988.HK', name: 'Alibaba HK', type: 'HK Stock' }
          ]
        }
      ]
    }
  },
  watch: {
    '$route.query.symbol': {
      handler (newSymbol) {
        if (newSymbol && newSymbol !== this.searchKeyword) {
          this.landingSearchKeyword = newSymbol
          this.searchKeyword = newSymbol
          this.handleSearch(newSymbol)
        }
      }
    },
    '$store.getters.lang': {
      handler (newLang) {
        if (this.currentSymbol) {
          this.loadCoreSymbolData({ symbol: this.currentSymbol, period: '1y' })
          this.handleTabChange(this.activeTab)
        }
      }
    }
  },
  mounted () {
    const symbolQuery = this.$route.query.symbol
    if (symbolQuery) {
      this.landingSearchKeyword = symbolQuery
      this.searchKeyword = symbolQuery
      this.handleSearch(symbolQuery)
    }
  },
  methods: {
    ...mapActions('equity', ['loadCoreSymbolData', 'loadFinancials']),
    handleSearch (value) {
      const searchVal = typeof value === 'string' && value.trim() !== '' ? value : this.landingSearchKeyword || this.searchKeyword
      if (!searchVal) return

      this.searchKeyword = searchVal.toUpperCase()
      this.landingSearchKeyword = this.searchKeyword

      // Sync with URL query parameter
      if (this.$route.query.symbol !== this.searchKeyword) {
        this.$router.replace({ query: { ...this.$route.query, symbol: this.searchKeyword } }).catch(() => {})
      }

      // Always reset to overview on new symbol load
      this.activeTab = 'overview'
      this.loadCoreSymbolData({ symbol: this.searchKeyword, period: '1y' })
    },
    handleTabChange (key) {
      // Lazy load logic for tabs
      if (!this.currentSymbol) return

      if (key === 'financials') {
        this.loadFinancials(this.currentSymbol)
      } else if (key === 'technicals') {
        this.$store.dispatch('equity/loadTechnicals', { symbol: this.currentSymbol, period: '1y' })
      }
    }
  }
}
</script>

<style scoped lang="less">
.stock-research-workspace {
  background-color: #f0f2f5;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.workspace-header {
  background: #ffffff;
  border-bottom: 1px solid #e8e8e8;
  padding: 16px 24px;

  .header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .workspace-title {
      margin: 0;
      color: #faad14; /* Amber accent */
      font-size: 16px;
      font-weight: 700;
      letter-spacing: 2px;
    }

    .search-container {
      width: 400px;
    }
  }
}

.workspace-tabs-container {
  flex: 1;
  background: #ffffff;

  /* Custom Fincept-style tabs */
  :deep(.fincept-tabs) {
    .ant-tabs-bar {
      margin: 0;
      border-bottom: 2px solid #f0f0f0;
      background: #fafafa;
      padding: 0 16px;
    }

    .ant-tabs-tab {
      padding: 12px 24px;
      margin: 0;
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 1px;
      color: #8c8c8c;

      &:hover { color: #faad14; }
    }

    .ant-tabs-tab-active {
      color: #faad14;
      font-weight: 700;
    }

    .ant-tabs-ink-bar {
      background-color: #faad14;
      height: 3px;
    }
  }
}

.coming-soon {
  padding: 64px 0;
}

/* Landing UX Styles */
.landing-container {
  flex: 1;
  display: flex;
  justify-content: center;
  padding: 80px 24px 60px;
  background-color: #f8fafc;
}

.landing-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.landing-content {
  width: 100%;
  max-width: 800px;
  display: flex;
  flex-direction: column;
  gap: 48px;
}

.landing-header {
  text-align: center;

  .landing-title {
    font-size: 36px;
    font-weight: 800;
    color: #0f172a;
    margin: 0 0 16px;
    letter-spacing: -0.5px;

    .title-zh {
      font-weight: 500;
      color: #64748b;
    }
  }

  .landing-subtitle {
    font-size: 16px;
    color: #475569;
    line-height: 1.6;
    max-width: 600px;
    margin: 0 auto;
  }
}

.landing-search {
  max-width: 600px;
  margin: 0 auto;
  width: 100%;

  :deep(.ant-input-search) {
    .ant-input {
      height: 56px;
      font-size: 16px;
      border-radius: 12px 0 0 12px;
      border: 1px solid #cbd5e1;
      padding: 0 20px;

      &:focus {
        border-color: #3b82f6;
        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
      }
    }

    .ant-input-search-button {
      height: 56px;
      border-radius: 0 12px 12px 0;
      font-size: 16px;
      font-weight: 600;
      padding: 0 32px;
      background-color: #3b82f6;
      border-color: #3b82f6;

      &:hover {
        background-color: #2563eb;
        border-color: #2563eb;
      }
    }
  }
}

.landing-popular {
  margin-top: 16px;

  .popular-header {
    margin-bottom: 24px;

    .popular-title {
      font-size: 20px;
      font-weight: 700;
      color: #1e293b;
      margin: 0 0 8px;
    }

    .popular-desc {
      font-size: 14px;
      color: #64748b;
      margin: 0;
    }
  }

  :deep(.popular-tabs) {
    .ant-tabs-bar {
      border-bottom: 1px solid #e2e8f0;
      margin-bottom: 24px;
    }

    .ant-tabs-tab {
      font-size: 14px;
      font-weight: 500;
      color: #64748b;
      padding: 12px 16px;

      &:hover {
        color: #3b82f6;
      }
    }

    .ant-tabs-tab-active {
      color: #3b82f6;
      font-weight: 600;
    }

    .ant-tabs-ink-bar {
      background-color: #3b82f6;
    }
  }
}

.popular-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
}

.popular-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  gap: 8px;

  &:hover {
    border-color: #3b82f6;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.08);
    transform: translateY(-2px);
  }

  .card-main {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .card-symbol {
    font-size: 16px;
    font-weight: 700;
    color: #0f172a;
  }

  .card-badge {
    font-size: 11px;
    font-weight: 600;
    color: #64748b;
    background: #f1f5f9;
    padding: 2px 8px;
    border-radius: 4px;
    letter-spacing: 0.5px;
    text-transform: uppercase;
  }

  .card-name {
    font-size: 13px;
    color: #64748b;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

/* ========== Mobile UX: Stock Research Header and Spacing (PR2) ========== */
@media (max-width: 768px) {
  .workspace-header {
    padding: 12px 16px !important;

    .header-content {
      flex-direction: column !important;
      align-items: stretch !important;
      gap: 12px !important;

      .search-container {
        width: 100% !important;
      }
    }
  }

  .landing-container {
    padding: 40px 16px 30px !important;
  }
  .landing-content {
    gap: 24px !important;
  }
  .landing-header .landing-title {
    font-size: 26px !important;
  }
}
</style>
