<template>
  <div class="macro-domain-page">
    <div class="nav-header">
      <router-link to="/macro" class="back-link">← 回到宏观全景</router-link>
    </div>

    <!-- Page Title -->
    <div class="page-title-block">
      <h1 class="dimension-title">{{ domainConfig.label }}</h1>
      <p class="core-question">{{ domainConfig.subtitle }}</p>
    </div>

    <div v-if="loading" style="padding: 80px; text-align: center;">
      <a-spin size="large" />
    </div>

    <div v-else>

      <!-- Provenance Legend -->
      <div class="provenance-legend">
        说明：本页包含三类内容：规则判断基于宏观指标自动计算；固定说明用于解释指标含义；AI 简报仅在真实模型生成且通过校验时显示。
      </div>

      <!-- ═══════════════════════════════════════════
           BLOCK 1: CURRENT STATUS CARD (判断层顶部)
           ═══════════════════════════════════════════ -->
      <a-card :bordered="false" class="status-card">
        <div class="status-header">
          <div class="status-left">
            <span class="status-eyebrow">当前定调</span>
            <span class="inline-provenance">规则判断 · 基于 {{ model.posture && model.posture.basedOnMetricIds ? model.posture.basedOnMetricIds.join(', ').toUpperCase() : '数据' }}</span>
            <span class="verdict-badge" :class="model.summaryStatus">{{ model.summaryVerdict }}</span>
          </div>
          <div class="status-meta">
            <span v-if="model.lastUpdated" class="neutral-timestamp-badge">
              {{ model.lastUpdated }}
            </span>
          </div>
        </div>
        <p class="status-thesis">{{ model.summaryThesis }}</p>
        <div v-if="model.riskAssetImplication" class="implication-box">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            <span class="implication-label">对风险资产的含义</span>
            <span class="inline-provenance">规则判断 · 基于 {{ model.posture && model.posture.basedOnMetricIds ? model.posture.basedOnMetricIds.join(', ').toUpperCase() : '数据' }}</span>
          </div>
          <p class="implication-text">{{ model.riskAssetImplication }}</p>
        </div>
      </a-card>

      <!-- ═══════════════════════════════════════════
           BLOCK 2: TAILWINDS / HEADWINDS
           ═══════════════════════════════════════════ -->
      <div v-if="(model.tailwinds && model.tailwinds.length) || (model.headwinds && model.headwinds.length)" class="section-block">
        <h2 class="section-heading">驱动力分析</h2>
        <div class="tw-hw-grid">
          <div class="tw-box" v-if="model.tailwinds && model.tailwinds.length">
            <div class="tw-hw-header tailwinds-header">
              <span>✅ 支持风险资产因素</span>
            </div>
            <ul class="tw-hw-list">
              <li v-for="(item, i) in model.tailwinds" :key="i">{{ item }}</li>
            </ul>
          </div>
          <div class="hw-box" v-if="model.headwinds && model.headwinds.length">
            <div class="tw-hw-header headwinds-header">
              <span>⚠️ 压制风险资产因素</span>
            </div>
            <ul class="tw-hw-list">
              <li v-for="(item, i) in model.headwinds" :key="i">{{ item }}</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- ═══════════════════════════════════════════
           BLOCK 3: WHAT TO WATCH (关键催化剂)
           ═══════════════════════════════════════════ -->
      <div v-if="model.whatToWatch && model.whatToWatch.length > 0" class="section-block">
        <h2 class="section-heading">Key Catalyst / 重点观察</h2>
        <div class="watch-list">
          <div v-for="(item, i) in model.whatToWatch" :key="i" class="watch-item">
            <span class="watch-index">{{ String(i + 1).padStart(2, '0') }}</span>
            <div class="watch-content">
              <span class="watch-label">{{ item.label }}</span>
              <span class="watch-desc">{{ item.desc }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ═══════════════════════════════════════════
           BLOCK 4: EDUCATION SECTION (Static Explainer)
           ═══════════════════════════════════════════ -->
      <domain-education-section :config="educationConfig" />

      <!-- ═══════════════════════════════════════════
           BLOCK 5: METRIC CATEGORY SECTIONS
           ═══════════════════════════════════════════ -->
      <div class="categories-container" v-if="model.categories && model.categories.length > 0">
        <metric-category-section
          v-for="cat in model.categories"
          :key="cat.id"
          :category="cat"
        />
      </div>

    </div>
  </div>
</template>

<script>
import MetricCategorySection from '../components/MetricCategorySection.vue'
import DomainEducationSection from '../components/DomainEducationSection.vue'
import { MACRO_EDUCATION_CONFIG } from './adapters/educationConfig'
import { getDomainViewModel } from './adapters'

const DOMAIN_MAP = {
  liquidity: { label: '流动性', subtitle: '央行资产负债表与系统资金充裕度' },
  economy: { label: '经济', subtitle: '增长势头与就业市场健康状况' },
  inflationRates: { label: '通胀与利率', subtitle: '价格压力与曲线倒挂' },
  sentiment: { label: '市场情绪', subtitle: '风险偏好区间' }
}

const FALLBACK = { label: '未知维度', subtitle: '' }

export default {
  name: 'MacroDomain',
  components: {
    MetricCategorySection,
    DomainEducationSection
  },
  data () {
    return {
      loading: true,
      model: {
        summaryVerdict: '',
        summaryThesis: '',
        summaryStatus: 'default',
        lastUpdated: '',
        riskAssetImplication: '',
        tailwinds: [],
        headwinds: [],
        whatToWatch: [],
        categories: []
      }
    }
  },
  computed: {
    domainKey () {
      return this.$route.params.domain
    },
    domainConfig () {
      return DOMAIN_MAP[this.domainKey] || FALLBACK
    },
    educationConfig () {
      return MACRO_EDUCATION_CONFIG[this.domainKey] || null
    }
  },
  watch: {
    domainKey: {
      immediate: true,
      handler () {
        this.fetchDomainData()
      }
    }
  },
  methods: {
    async fetchDomainData () {
      this.loading = true
      this.model = await getDomainViewModel(this.domainKey)
      this.loading = false
    }
  }
}
</script>

<style scoped lang="less">
.macro-domain-page {
  padding: 24px 48px;
  max-width: 1200px;
  margin: 0 auto;
}

.provenance-legend {
  font-size: 12px;
  color: #6b7280;
  background: #f9fafb;
  border: 1px dashed #e5e7eb;
  border-radius: 6px;
  padding: 8px 16px;
  margin-bottom: 24px;
  text-align: center;
  font-style: italic;
}

.neutral-timestamp-badge {
  display: inline-block;
  background: #f3f4f6;
  color: #4b5563;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  padding: 2px 8px;
  font-size: 12px;
  line-height: 20px;
  white-space: nowrap;
}

.nav-header {
  margin-bottom: 20px;
}
.back-link {
  color: #8c8c8c;
  text-decoration: none;
  font-size: 14px;
  &:hover { color: #1890ff; }
}

.page-title-block {
  margin-bottom: 28px;
  .dimension-title {
    font-size: 28px;
    font-weight: 700;
    color: #1a1a1a;
    margin: 0 0 4px 0;
  }
  .core-question {
    font-size: 15px;
    color: #8c8c8c;
    margin: 0;
  }
}

/* ── BLOCK 1: STATUS CARD ── */
.status-card {
  border-radius: 10px;
  border: 1px solid #e8e8e8 !important;
  margin-bottom: 32px;

  .status-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16px;
  }
  .status-left {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .status-eyebrow {
    font-size: 13px;
    text-transform: uppercase;
    color: #8c8c8c;
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    letter-spacing: 1px;
  }
  .status-thesis {
    font-size: 15px;
    color: #333;
    line-height: 1.7;
    margin-bottom: 16px;
  }
  .implication-box {
    background: rgba(24, 144, 255, 0.04);
    border-left: 3px solid #1890ff;
    padding: 12px 16px;
    border-radius: 0 6px 6px 0;
    .implication-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #1890ff;
      display: block;
      margin-bottom: 6px;
    }
    .implication-text {
      font-size: 14px;
      color: #262626;
      line-height: 1.6;
      margin: 0;
    }
  }
}

.inline-provenance {
  display: inline-block;
  font-size: 10px;
  color: #1890ff;
  background: #e6f7ff;
  border: 1px solid #91d5ff;
  padding: 1px 6px;
  border-radius: 4px;
  margin-bottom: 8px;
  margin-left: 8px;
  vertical-align: middle;
}

.verdict-badge {
  display: inline-block;
  padding: 4px 14px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  border-radius: 6px;
  letter-spacing: 0.08em;
}
.verdict-badge.success { background: rgba(16,185,129,0.12); color: #10b981; border: 1px solid rgba(16,185,129,0.3); }
.verdict-badge.warning { background: rgba(245,158,11,0.12); color: #d48806; border: 1px solid rgba(245,158,11,0.3); }
.verdict-badge.danger { background: rgba(239,68,68,0.12); color: #f5222d; border: 1px solid rgba(239,68,68,0.3); }
.verdict-badge.neutral, .verdict-badge.default { background: rgba(0,0,0,0.05); color: #595959; border: 1px solid rgba(0,0,0,0.1); }
.verdict-badge.processing { background: rgba(24,144,255,0.1); color: #1890ff; border: 1px solid rgba(24,144,255,0.3); }

/* ── SHARED SECTION LAYOUT ── */
.section-block {
  margin-bottom: 40px;
}
.section-heading {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid #f0f0f0;
}

/* ── BLOCK 2: TAILWINDS / HEADWINDS ── */
.tw-hw-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.tw-box, .hw-box {
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #f0f0f0;
}
.tw-hw-header {
  padding: 10px 16px;
  font-size: 13px;
  font-weight: 600;
}
.tailwinds-header {
  background: rgba(16, 185, 129, 0.08);
  color: #10b981;
}
.headwinds-header {
  background: rgba(245, 158, 11, 0.08);
  color: #d48806;
}
.tw-hw-list {
  list-style: none;
  margin: 0;
  padding: 12px 16px;
  background: #fff;
  li {
    font-size: 13px;
    color: #433;
    line-height: 1.6;
    padding: 4px 0;
    border-bottom: 1px solid #fafafa;
    &:last-child { border-bottom: none; }
    &:before { content: '•'; margin-right: 8px; color: #bfbfbf; }
  }
}

/* ── BLOCK 3: WHAT TO WATCH ── */
.watch-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.watch-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  background: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  padding: 14px 16px;
}
.watch-index {
  font-size: 22px;
  font-weight: 700;
  color: #e8e8e8;
  font-family: 'SFMono-Regular', Consolas, monospace;
  flex-shrink: 0;
  line-height: 1;
}
.watch-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.watch-label {
  font-size: 14px;
  font-weight: 600;
  color: #262626;
}
.watch-desc {
  font-size: 13px;
  color: #595959;
  line-height: 1.5;
}

/* ── BLOCK 4: CATEGORY SECTIONS ── */
.categories-container {
  margin-top: 48px;
}

@media (max-width: 900px) {
  .macro-domain-page { padding: 16px 20px; }
  .tw-hw-grid { grid-template-columns: 1fr; }
}
</style>
