<template>
  <div class="macro-intelligence-page">
    <a-page-header
      title="宏观 Macro Briefing"
      sub-title="数据驱动的经济周期与资产研判"
      :back-icon="false"
      style="padding-bottom: 0;"
    />

    <div v-if="loading" style="padding: 80px; text-align: center;">
      <a-spin size="large" />
    </div>

    <div v-else>

      <!-- Macro Data Health Banner -->
      <a-alert
        v-if="model.health && model.health.status !== 'healthy'"
        :type="model.health.status === 'degraded' ? 'error' : (model.health.status === 'stale' ? 'warning' : 'info')"
        show-icon
        class="system-warnings"
      >
        <div slot="message">
          <span v-if="model.health.status === 'degraded'">系统降级警告</span>
          <span v-else-if="model.health.status === 'stale'">数据时效性提醒</span>
        </div>
        <div slot="description">
          <ul class="warning-list" v-if="model.health.status === 'degraded'">
            <li>底层宏观指标缺失: {{ model.health.missingMetrics.join(', ') }}，已降级使用可用数据。</li>
          </ul>
          <ul class="warning-list" v-else-if="model.health.status === 'stale'">
            <li>部分宏观指标已超过正常更新窗口: {{ model.health.staleMetrics.join(', ') }}。</li>
          </ul>
          <ul class="warning-list" v-if="model.warnings && model.warnings.length">
            <li v-for="(warn, i) in model.warnings" :key="'w'+i">{{ warn }}</li>
          </ul>
        </div>
      </a-alert>
      <a-alert
        v-else-if="model.warnings && model.warnings.length > 0"
        type="warning"
        show-icon
        class="system-warnings"
      >
        <div slot="message">系统提醒</div>
        <div slot="description">
          <ul class="warning-list">
            <li v-for="(warn, i) in model.warnings" :key="i">{{ warn }}</li>
          </ul>
        </div>
      </a-alert>

      <!-- AI Fallback Banner -->
      <a-alert
        v-if="model.health && model.health.aiSummaryStatus === 'failed'"
        type="warning"
        show-icon
        class="system-warnings ai-fallback-warning"
      >
        <div slot="message">AI 简报降级</div>
        <div slot="description">今日 AI 简报生成失败或不可用，当前展示基于本地规则的降级判断。</div>
      </a-alert>
      <!-- Provenance Legend -->
      <div class="provenance-legend">
        说明：本页包含三类内容：规则判断基于宏观指标自动计算；固定说明用于解释指标含义；AI 简报仅在真实模型生成且通过校验时显示。
      </div>

      <!-- Hero Section -->
      <a-card :bordered="false" class="hero-card">
        <div class="hero-header">
          <div class="hero-left">
            <span class="eyebrow">当前宏观定调</span>
            <div class="title-row">
              <h2 class="verdict-title">{{ model.headline }}</h2>
              <span v-if="model.provenance" class="provenance-badge" :class="model.provenance.isAIGenerated ? 'ai' : 'rule'">
                {{ model.provenance.isAIGenerated ? 'AI 生成 · 基于最新宏观数据' : '规则摘要 · AI 暂不可用' }}
              </span>
            </div>
          </div>
          <div class="hero-right">
            <a-tag v-if="model.confidence_level" :color="getConfidenceColor(model.confidence_level)">
              置信度: {{ model.confidence_level }}
            </a-tag>
            <span v-if="model.generated_at" class="neutral-timestamp-badge">
              {{ getOverviewTimestampLabel(model) }}
            </span>
          </div>
        </div>
        <p class="hero-thesis">{{ model.core_judgment }}</p>
        <div class="implication-box" v-if="model.riskPostureSummary && model.riskPostureSummary.overallPosture">
          <div class="posture-summary-grid">
            <div class="posture-row">
              <span class="posture-label">风险姿态</span>
              <span class="posture-value posture-headline">{{ model.riskPostureSummary.overallPosture }}</span>
            </div>
            <div class="posture-row" v-if="model.riskPostureSummary.mainSupports && model.riskPostureSummary.mainSupports.length">
              <span class="posture-label supports">主要支持</span>
              <span class="posture-value">{{ model.riskPostureSummary.mainSupports.join(' · ') }}</span>
            </div>
            <div class="posture-row" v-if="model.riskPostureSummary.mainPressures && model.riskPostureSummary.mainPressures.length">
              <span class="posture-label pressures">主要压制</span>
              <span class="posture-value">{{ model.riskPostureSummary.mainPressures.join(' · ') }}</span>
            </div>
            <div class="posture-row" v-if="model.riskPostureSummary.todayWatchPoint">
              <span class="posture-label watch">今日观察</span>
              <span class="posture-value watch-text">{{ model.riskPostureSummary.todayWatchPoint }}</span>
            </div>
          </div>
        </div>
        <div class="implication-box" v-else-if="model.risk_asset_implication">
          <div class="implication-header">
            <span class="implication-label">对风险资产的影响</span>
          </div>
          <p class="implication-text">{{ model.risk_asset_implication }}</p>
        </div>
      </a-card>

      <!-- Top Metrics Strip -->
      <div class="metrics-strip" v-if="model.top_metrics && model.top_metrics.length">
        <div class="metric-item" v-for="(metric, idx) in model.top_metrics" :key="idx">
          <span class="metric-label">{{ metric.label }}</span>
          <div class="metric-value-wrapper">
            <span class="metric-value" :class="{'unavailable': metric.formattedValue === '—' || metric.formattedValue === '--'}">
              {{ metric.formattedValue === '—' || metric.formattedValue === '--' ? '数据暂不可用' : (metric.primary || metric.formattedValue) }}
            </span>
            <span class="metric-unit" v-if="metric.formattedValue !== '—' && metric.formattedValue !== '--'">{{ metric.displayUnit || metric.unit }}</span>
          </div>
          <div class="metric-meta" v-if="metric.formattedValue !== '—' && metric.formattedValue !== '--'">
            {{ metric.meta || `${metric.source} • ${metric.frequency}` }}
          </div>
        </div>
      </div>

      <!-- Dimensions Cards Grid -->
      <div class="dimensions-grid" v-if="model.dimensions">
        <div v-for="(dim, key) in model.dimensions" :key="key" class="dimension-card" @click="enterDomain(key)">
          <div class="dim-header">
            <h3 class="dim-title">{{ dim.title }}</h3>
            <span class="verdict-pill" :class="dim.verdict.toLowerCase()">{{ dim.verdict }}</span>
          </div>
          <p class="dim-summary">{{ dim.summary }}</p>
          <div class="dim-posture" v-if="dim.posture && dim.posture.posture">
            <div class="dim-posture-row">
              <span class="dim-posture-label">对风险资产</span>
              <span class="dim-posture-badge" :class="dim.posture.posture">{{ { supports_risk: '支持', pressures_risk: '压制', neutral: '中性', mixed: '分歧' }[dim.posture.posture] || dim.posture.posture }}</span>
              <span class="dim-posture-reason">{{ dim.posture.reason }}</span>
            </div>
            <div class="dim-watch-row" v-if="dim.posture.watchPoint">
              <span class="dim-watch-label">观察点</span>
              <span class="dim-watch-text">{{ dim.posture.watchPoint }}</span>
            </div>
          </div>
          <div class="dim-metrics" v-if="dim.key_metrics && dim.key_metrics.length > 0">
            <div class="dm-item" v-for="(km, kidx) in dim.key_metrics" :key="kidx">
              <span class="dm-label">{{ km.label }}</span>
              <span class="dm-value" :class="{'unavailable': km.formattedValue === '—' || km.formattedValue === '--'}">
                {{ km.formattedValue === '—' || km.formattedValue === '--' ? '暂无' : (km.primary || km.formattedValue) }}
                <span class="dm-unit" v-if="km.formattedValue !== '—' && km.formattedValue !== '--'">{{ km.displayUnit || km.unit }}</span>
              </span>
            </div>
          </div>
          <div class="dim-footer">
            <span class="dim-action">深入分析 <a-icon type="arrow-right" /></span>
            <span class="dim-provenance" v-if="dim.provenance">
              <template v-if="dim.provenance.summarySource === 'ai_generated'">AI 生成</template>
              <template v-else-if="dim.provenance.summarySource === 'mock_ai'">规则摘要 · AI 暂不可用</template>
              <template v-else-if="dim.provenance.summarySource === 'rule_based'">规则判断</template>
              <template v-else>固定说明</template>
              <template v-if="dim.provenance.basedOnMetricIds && dim.provenance.basedOnMetricIds.length"> · 基于 {{ dim.provenance.basedOnMetricIds.join(', ').toUpperCase() }}</template>
            </span>
          </div>
        </div>
      </div>

      <!-- Drivers & Changes -->
      <a-row :gutter="24" class="analysis-section">
        <a-col :span="12">
          <a-card :bordered="false" title="核心驱动力 (Drivers)" class="minimal-card drivers-card">
            <div class="tw-hw-container">
              <div class="drivers-list tailwinds" v-if="model.tailwinds && model.tailwinds.length">
                <span class="list-title">✅ 支持风险资产 (基于数据)</span>
                <ul>
                  <li v-for="(item, i) in model.tailwinds" :key="i">
                    {{ item.desc }}
                    <span class="evidence-tag" v-if="item.evidence_metric_ids && item.evidence_metric_ids.length">[{{ item.evidence_metric_ids.join(', ') }}]</span>
                  </li>
                </ul>
              </div>
              <div class="drivers-list headwinds" v-if="model.headwinds && model.headwinds.length">
                <span class="list-title">⚠️ 压制风险资产 (基于数据)</span>
                <ul>
                  <li v-for="(item, i) in model.headwinds" :key="i">
                    {{ item.desc }}
                    <span class="evidence-tag" v-if="item.evidence_metric_ids && item.evidence_metric_ids.length">[{{ item.evidence_metric_ids.join(', ') }}]</span>
                  </li>
                </ul>
              </div>
              <a-empty v-if="(!model.tailwinds || !model.tailwinds.length) && (!model.headwinds || !model.headwinds.length)" description="当前无明确的宏观驱动力或数据不足" />
            </div>
          </a-card>
        </a-col>

        <a-col :span="12">
          <div class="changes-watch-container">
            <!-- What Changed -->
            <a-card :bordered="false" title="关键边际变化 (What Changed)" class="minimal-card side-card" style="margin-bottom: 24px;">
              <ul class="catalyst-list" v-if="model.what_changed && model.what_changed.length">
                <li v-for="(item, i) in model.what_changed" :key="i">
                  <span class="cat-label">{{ item.label }}: </span>
                  <span class="cat-desc">{{ item.desc }}</span>
                  <span class="evidence-tag" v-if="item.evidence_metric_ids && item.evidence_metric_ids.length">[{{ item.evidence_metric_ids.join(', ') }}]</span>
                </li>
              </ul>
              <a-empty v-else description="无显着边际变化" />
            </a-card>

            <!-- What To Watch -->
            <a-card :bordered="false" title="未来观察点 (What To Watch)" class="minimal-card side-card">
              <ul class="catalyst-list" v-if="model.what_to_watch && model.what_to_watch.length">
                <li v-for="(item, i) in model.what_to_watch" :key="i">
                  <span class="cat-label">{{ item.label }}: </span>
                  <span class="cat-desc">{{ item.desc }}</span>
                  <span class="evidence-tag" v-if="item.evidence_metric_ids && item.evidence_metric_ids.length">[{{ item.evidence_metric_ids.join(', ') }}]</span>
                </li>
              </ul>
              <a-empty v-else description="暂无重点观察事件" />
            </a-card>
          </div>
        </a-col>
      </a-row>

    <!-- Generic Asset Impact -->
      <a-card :bordered="false" title="对主要资产类型的影响" class="minimal-card asset-impact-card" v-if="model.genericAssetImpact && model.genericAssetImpact.length">
        <div class="asset-impact-grid">
          <div class="asset-impact-row" v-for="(item, idx) in model.genericAssetImpact" :key="idx">
            <span class="asset-type">{{ item.assetType }}</span>
            <span class="asset-posture-badge" :class="item.posture">{{ { supports_risk: '支持', pressures_risk: '压制', neutral: '中性', mixed: '分歧' }[item.posture] || item.posture }}</span>
            <span class="asset-impact-text">{{ item.impact }}</span>
          </div>
        </div>
      </a-card>

    </div>
  </div>
</template>

<script>
import { getMacroViewModel } from './adapters'

export default {
  name: 'MacroIntelligence',
  data () {
    return {
      loading: true,
      model: {
        headline: '',
        core_judgment: '',
        risk_asset_implication: '',
        confidence_level: '',
        generated_at: '',
        top_metrics: [],
        dimensions: {},
        tailwinds: [],
        headwinds: [],
        what_changed: [],
        what_to_watch: [],
        missing_data: [],
        warnings: [],
        isEmpty: true,
        health: {},
        provenance: {},
        riskPostureSummary: { overallPosture: '', mainSupports: [], mainPressures: [], todayWatchPoint: '' },
        genericAssetImpact: []
      }
    }
  },
  mounted () {
    this.fetchData()
  },
  methods: {
    async fetchData () {
      this.loading = true
      this.model = await getMacroViewModel()
      this.loading = false
    },
    enterDomain (domainKey) {
      this.$router.push(`/macro/${domainKey}`)
    },
    getConfidenceColor (level) {
      if (!level || level === 'Unknown') return 'default'
      const val = level.toLowerCase()
      if (val === 'high') return 'green'
      if (val === 'medium') return 'orange'
      if (val === 'low') return 'red'
      return 'default'
    },
    getOverviewTimestampLabel (model) {
      const timeStr = new Date(model.generated_at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
      if (model.provenance && model.provenance.isAIGenerated) {
        return `AI 生成于: ${timeStr}`
      }
      return `规则更新时间: ${timeStr}`
    }
  }
}
</script>

<style scoped lang="less">
.macro-intelligence-page {
  padding: 24px 48px;
  max-width: 1400px;
  margin: 0 auto;
}

.system-warnings {
  margin-bottom: 24px;
  border-radius: 8px;

  &.ai-fallback-warning {
    margin-top: -8px;
  }

  .warning-list {
    margin: 0;
    padding-left: 16px;
    li {
      font-size: 13px;
      color: rgba(0,0,0,0.65);
    }
  }
}

/* ── Hero Section ── */
.hero-card {
  border-radius: 12px;
  border: 1px solid #e8e8e8 !important;
  margin-bottom: 32px;
  background: #fff;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);

  .hero-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 16px;
    margin-bottom: 24px;
  }

  .eyebrow {
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    color: #8c8c8c;
    display: block;
    margin-bottom: 6px;
  }
  .title-row {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .verdict-title {
    font-size: 28px;
    font-weight: 700;
    color: #111827;
    margin: 0;
  }
  .hero-right {
    display: flex;
    gap: 8px;
  }
  .hero-thesis {
    font-size: 16px;
    color: #374151;
    line-height: 1.6;
    margin-bottom: 20px;
    max-width: 900px;
  }
  .implication-box {
    background: rgba(24, 144, 255, 0.04);
    border-left: 3px solid #1890ff;
    padding: 16px 20px;
    border-radius: 0 8px 8px 0;
    
    .implication-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 6px;
    }
    
    .implication-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #1890ff;
      display: block;
      margin-bottom: 0 !important;
      font-weight: 600;
    }
    .implication-text {
      font-size: 15px;
      color: #1f2937;
      line-height: 1.6;
      margin: 0;
    }
  }
}

.provenance-badge {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: normal;

  &.ai {
    background: #f6ffed;
    color: #52c41a;
    border: 1px solid #b7eb8f;
  }
  &.rule {
    background: #e6f7ff;
    color: #1890ff;
    border: 1px solid #91d5ff;
  }
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

/* ── Top Metrics Strip ── */
.metrics-strip {
  display: flex;
  gap: 24px;
  margin-bottom: 32px;
  flex-wrap: wrap;

  .metric-item {
    flex: 1;
    background: #fff;
    border: 1px solid #e8e8e8;
    border-radius: 8px;
    padding: 16px 20px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(0,0,0,0.02);

    .metric-label {
      font-size: 12px;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    .metric-value-wrapper {
      display: flex;
      align-items: baseline;
    }
    .metric-value {
      font-size: 24px;
      font-weight: 700;
      font-family: 'SFMono-Regular', Consolas, monospace;
      color: #111827;

      &.unavailable {
        font-size: 14px;
        color: #9ca3af;
        font-family: inherit;
        font-weight: 400;
      }
    }
    .metric-unit {
      font-size: 14px;
      font-weight: 600;
      color: #6b7280;
      margin-left: 6px;
    }
    .metric-meta {
      font-size: 11px;
      color: #9ca3af;
      margin-top: 6px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
  }
}

/* ── Dimensions Grid ── */
.dimensions-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-bottom: 40px;

  .dimension-card {
    background: #fff;
    border: 1px solid #e8e8e8;
    border-radius: 10px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 2px 12px rgba(0,0,0,0.02);

    &:hover {
      box-shadow: 0 8px 24px rgba(0,0,0,0.06);
      transform: translateY(-2px);
      border-color: #d9d9d9;
    }

    .dim-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;

      .dim-title {
        font-size: 18px;
        font-weight: 600;
        color: #111827;
        margin: 0;
      }
    }

    .verdict-pill {
      display: inline-block;
      padding: 4px 10px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      border-radius: 4px;
      letter-spacing: 0.5px;

      &.loose, &.expanding, &.greed, &.easing { background: rgba(16,185,129,0.1); color: #10b981; }
      &.neutral { background: rgba(245,158,11,0.1); color: #d48806; }
      &.tight, &.slowing, &.contracting, &.sticky, &.fear, &.high { background: rgba(239,68,68,0.1); color: #ef4444; }
      &.cooling { background: rgba(59,130,246,0.1); color: #3b82f6; }
    }

    .dim-summary {
      font-size: 14px;
      color: #4b5563;
      line-height: 1.5;
      margin-bottom: 24px;
      flex: 1;
    }

    .dim-metrics {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-bottom: 20px;
      padding-top: 16px;
      border-top: 1px dashed #f0f0f0;

      .dm-item {
        display: flex;
        justify-content: space-between;
        align-items: baseline;

        .dm-label {
          font-size: 12px;
          color: #6b7280;
        }
        .dm-value {
          font-size: 15px;
          font-weight: 600;
          font-family: 'SFMono-Regular', Consolas, monospace;
          color: #111827;

          &.unavailable {
            font-size: 12px;
            color: #9ca3af;
            font-family: inherit;
            font-weight: 400;
          }
          .dm-unit {
            font-size: 11px;
            color: #9ca3af;
            margin-left: 2px;
            font-weight: normal;
          }
        }
      }
    }

    .dim-footer {
      text-align: right;
      .dim-action {
        font-size: 13px;
        color: #1890ff;
        font-weight: 500;
      }
    }
  }
}

/* ── Minimal Cards & Drivers ── */
.minimal-card {
  border-radius: 10px;
  border: 1px solid #e8e8e8 !important;
  box-shadow: 0 2px 12px rgba(0,0,0,0.02);

  :deep(.ant-card-head) {
    border-bottom: 1px solid #f0f0f0;
    min-height: 48px;
    padding: 0 20px;
  }
  :deep(.ant-card-head-title) {
    font-size: 15px;
    font-weight: 600;
    color: #111827;
  }
  :deep(.ant-card-body) {
    padding: 20px;
  }
}

.analysis-section {
  margin-bottom: 32px;
}

.drivers-card {
  height: 100%;
}

.tw-hw-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.drivers-list {
  .list-title {
    font-size: 13px;
    font-weight: 600;
    display: block;
    margin-bottom: 12px;
  }
  &.tailwinds .list-title { color: #10b981; }
  &.headwinds .list-title { color: #d48806; }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    li {
      font-size: 14px;
      color: #374151;
      line-height: 1.5;
      margin-bottom: 10px;
      padding-left: 14px;
      position: relative;
      &:last-child { margin-bottom: 0; }
      &::before {
        content: '•';
        position: absolute;
        left: 0;
        color: #9ca3af;
      }
    }
  }
}

.catalyst-list {
  list-style: none;
  padding: 0;
  margin: 0;
  li {
    margin-bottom: 16px;
    line-height: 1.5;
    &:last-child { margin-bottom: 0; }
    .cat-label {
      font-size: 14px;
      font-weight: 600;
      color: #111827;
      display: block;
    }
    .cat-desc {
      font-size: 14px;
      color: #4b5563;
      display: block;
      margin: 4px 0;
    }
  }
}

.evidence-tag {
  font-size: 11px;
  color: #9ca3af;
  font-family: 'SFMono-Regular', Consolas, monospace;
  background: #f3f4f6;
  padding: 2px 6px;
  border-radius: 4px;
  margin-left: 4px;
}


/* ── Risk Posture Summary in Hero ── */
.posture-summary-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;

  .posture-row {
    display: flex;
    align-items: baseline;
    gap: 10px;
    flex-wrap: wrap;
  }
  .posture-label {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    color: #1890ff;
    white-space: nowrap;
    min-width: 60px;

    &.supports { color: #10b981; }
    &.pressures { color: #ef4444; }
    &.watch { color: #d48806; }
  }
  .posture-value {
    font-size: 14px;
    color: #1f2937;
    line-height: 1.5;

    &.posture-headline {
      font-size: 15px;
      font-weight: 600;
      color: #111827;
    }
    &.watch-text {
      color: #374151;
    }
  }
}

/* ── Dimension Card: Posture Row ── */
.dim-posture {
  margin-bottom: 12px;
  padding: 10px 12px;
  background: #fafafa;
  border-radius: 6px;
  border: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;
  gap: 6px;

  .dim-posture-row {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }
  .dim-posture-label {
    font-size: 10px;
    color: #9ca3af;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    white-space: nowrap;
  }
  .dim-posture-badge {
    font-size: 10px;
    font-weight: 700;
    padding: 2px 7px;
    border-radius: 3px;
    white-space: nowrap;

    &.supports_risk { background: rgba(16,185,129,0.1); color: #10b981; }
    &.pressures_risk { background: rgba(239,68,68,0.1); color: #ef4444; }
    &.neutral { background: rgba(107,114,128,0.1); color: #6b7280; }
    &.mixed { background: rgba(245,158,11,0.1); color: #d48806; }
  }
  .dim-posture-reason {
    font-size: 12px;
    color: #4b5563;
    line-height: 1.4;
    flex: 1;
  }
  .dim-watch-row {
    display: flex;
    align-items: baseline;
    gap: 8px;
  }
  .dim-watch-label {
    font-size: 10px;
    color: #d48806;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    white-space: nowrap;
  }
  .dim-watch-text {
    font-size: 11px;
    color: #6b7280;
    line-height: 1.4;
    flex: 1;
  }
}

/* ── Dimension Card: Provenance Footer ── */
.dim-provenance {
  display: block;
  font-size: 10px;
  color: #9ca3af;
  margin-top: 4px;
  letter-spacing: 0.3px;
}

/* ── Generic Asset Impact Card ── */
.asset-impact-card {
  margin-bottom: 32px;

  .asset-impact-grid {
    display: flex;
    flex-direction: column;
    gap: 0;
  }
  .asset-impact-row {
    display: flex;
    align-items: baseline;
    gap: 12px;
    padding: 12px 0;
    border-bottom: 1px solid #f5f5f5;
    flex-wrap: wrap;

    &:last-child { border-bottom: none; }
  }
  .asset-type {
    font-size: 13px;
    font-weight: 600;
    color: #111827;
    white-space: nowrap;
    min-width: 90px;
  }
  .asset-posture-badge {
    font-size: 10px;
    font-weight: 700;
    padding: 2px 7px;
    border-radius: 3px;
    white-space: nowrap;
    flex-shrink: 0;

    &.supports_risk { background: rgba(16,185,129,0.1); color: #10b981; }
    &.pressures_risk { background: rgba(239,68,68,0.1); color: #ef4444; }
    &.neutral { background: rgba(107,114,128,0.1); color: #6b7280; }
    &.mixed { background: rgba(245,158,11,0.1); color: #d48806; }
  }
  .asset-impact-text {
    font-size: 13px;
    color: #4b5563;
    line-height: 1.5;
    flex: 1;
  }
}

@media (max-width: 1200px) {
  .dimensions-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 768px) {
  .macro-intelligence-page { padding: 16px; }
  .dimensions-grid { grid-template-columns: 1fr; }
  .metrics-strip .metric-item { flex-basis: calc(50% - 12px); }
  .hero-header { flex-direction: column; gap: 12px; }
}
</style>
