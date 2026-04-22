<template>
  <div class="macro-domain-page">
    <a-page-header
      :title="domainConfig.label"
      :sub-title="domainConfig.subtitle"
      @back="$router.push('/macro')"
    />

    <!-- 章节 Tab 占位 — 后续升级为真实章节内容 -->
    <a-card :bordered="false">
      <a-tabs :default-active-key="domainConfig.chapters[0] && domainConfig.chapters[0].key">
        <a-tab-pane
          v-for="chapter in domainConfig.chapters"
          :key="chapter.key"
          :tab="chapter.label"
        >
          <div class="chapter-placeholder">
            <a-icon type="bar-chart" style="font-size:40px; color:#d9d9d9;" />
            <p class="chapter-hint">{{ chapter.label }} 数据接入中</p>
            <a-tag>待接入</a-tag>
          </div>
        </a-tab-pane>
      </a-tabs>
    </a-card>
  </div>
</template>

<script>
const DOMAIN_MAP = {
  liquidity: {
    label: '流动性',
    subtitle: '美联储资产负债表 · 全球央行 · M2',
    chapters: [
      { key: 'us', label: '美国' },
      { key: 'global', label: '全球' }
    ]
  },
  economy: {
    label: '经济',
    subtitle: 'GDP · PMI · 就业 · 信用',
    chapters: [
      { key: 'growth', label: '增长' },
      { key: 'employment', label: '就业' },
      { key: 'credit', label: '信用' }
    ]
  },
  inflation: {
    label: '通胀与利率',
    subtitle: 'CPI · PPI · 利率曲线 · 商品',
    chapters: [
      { key: 'inflation', label: '通胀' },
      { key: 'rates', label: '利率' },
      { key: 'commodities', label: '商品' }
    ]
  },
  sentiment: {
    label: '情绪',
    subtitle: 'Fear & Greed · VIX · 风险偏好',
    chapters: [
      { key: 'feargreed', label: '恐慌贪婪' },
      { key: 'volatility', label: '波动率' },
      { key: 'riskappetite', label: '风险偏好' }
    ]
  }
}

const FALLBACK = { label: '未知维度', subtitle: '', chapters: [] }

export default {
  name: 'MacroDomain',
  computed: {
    domainConfig () {
      return DOMAIN_MAP[this.$route.params.domain] || FALLBACK
    }
  }
}
</script>

<style scoped lang="less">
.macro-domain-page {
  padding: 24px;
}

.chapter-placeholder {
  min-height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;

  .chapter-hint {
    color: rgba(0, 0, 0, 0.45);
    margin: 0;
  }
}
</style>
