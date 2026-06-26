<template>
  <div class="macro-intelligence-page">
    <a-page-header
      :title="$t('macro.title')"
      :sub-title="$t('macro.subtitle') + ' · ' + $t('macro.dataAsOf', { time: formatDateTime(model.generated_at) })"
      :back-icon="false"
      style="padding-bottom: 0;"
    >
      <template #extra>
        <span class="non-ai-banner">
          <a-icon type="safety-certificate" /> {{ $t('macro.nonAi') }}
        </span>
      </template>
    </a-page-header>

    <div v-if="loading" style="padding: 80px; text-align: center;">
      <a-spin size="large" />
    </div>

    <div v-else>

      <!-- System Warnings / Critical Stale / Degraded Alert (Yellow/Red) -->
      <a-alert
        v-if="model.health && (model.health.status === 'degraded' || hasCriticalStale)"
        :type="model.health.status === 'degraded' ? 'error' : 'warning'"
        show-icon
        class="system-warnings"
      >
        <div slot="message">
          <span v-if="model.health.status === 'degraded'">{{ $t('macro.warnings.degraded.title') }}</span>
          <span v-else>{{ $t('macro.warnings.stale.title') }}</span>
        </div>
        <div slot="description">
          <ul class="warning-list">
            <li v-if="model.health.status === 'degraded'">
              {{ $t('macro.warnings.degraded.desc', { metrics: model.health.missingMetrics.map(key => getIndicatorMeta(key).name || key.toUpperCase()).join(', ') }) }}
            </li>
            <li v-if="hasCriticalStale">
              {{ $t('macro.warnings.stale.desc', { metrics: criticalStaleNames.join(', ') }) }}
            </li>
          </ul>
        </div>
      </a-alert>

      <!-- Natural Release Lag Info Alert (Blue Info) -->
      <a-alert
        v-if="model.health && hasNaturalStale && !hasCriticalStale && model.health.status !== 'degraded'"
        type="info"
        show-icon
        class="system-warnings natural-stale-info"
      >
        <div slot="message">
          <span>{{ $t('macro.warnings.natural_stale.title') }}</span>
        </div>
        <div slot="description">
          <span>
            {{ $t('macro.warnings.natural_stale.desc', { metrics: naturalStaleNames.join(', ') }) }}
            <a-tooltip placement="top">
              <template slot="title">
                <span>{{ $t('macro.warnings.natural_stale.tooltip') }}</span>
              </template>
              <a-icon type="question-circle" style="margin-left: 4px; cursor: pointer;" />
            </a-tooltip>
          </span>
        </div>
      </a-alert>

      <!-- Deprecated AI Summary Area -->
      <a-alert
        v-if="model.provenance && model.provenance.isAIGenerated"
        type="warning"
        show-icon
        class="system-warnings ai-deprecated-alert"
      >
        <div slot="message">{{ $t('macro.provenance.aiObsoleteTitle') }}</div>
        <div slot="description">
          <span>{{ $t('macro.provenance.aiObsoleteDesc') }}</span>
          <a-collapse :bordered="false" style="background: transparent; margin-top: 8px;">
            <a-collapse-panel key="1" :header="$t('macro.provenance.expandAiSummary')">
              <p class="hero-thesis">{{ model.core_judgment }}</p>
              <div v-if="model.riskPostureSummary && model.riskPostureSummary.overallPosture" class="posture-summary-grid">
                <div class="posture-row">
                  <span class="posture-label">{{ $t('macro.provenance.riskPosture') }}:</span>
                  <span class="posture-value">{{ model.riskPostureSummary.overallPosture }}</span>
                </div>
              </div>
            </a-collapse-panel>
          </a-collapse>
        </div>
      </a-alert>

      <!-- Visual Branch Map Chart -->
      <div class="visual-branch-map">
        <div class="map-branches">
          <!-- Branch: Liquidity -->
          <div class="map-branch-box liquidity-box" :class="`tone-${getBranchTone('liquidity')}`">
            <div class="branch-node" @click="scrollToBranch('liquidity')">
              <span class="branch-node-title">{{ $t('macro.branches.liquidity.title') }}</span>
              <span class="branch-node-summary">{{ getBranchSummary('liquidity') }}</span>
            </div>
            <div class="indicator-pills">
              <span v-for="key in overviewBranchMetrics.liquidity" :key="key" class="pill-item" @click="scrollToCard(key)">{{ getMetricPillLabel(key) }}</span>
            </div>
          </div>

          <!-- Branch: Fundamentals -->
          <div class="map-branch-box fundamentals-box" :class="`tone-${getBranchTone('fundamentals')}`">
            <div class="branch-node" @click="scrollToBranch('fundamentals')">
              <span class="branch-node-title">{{ $t('macro.branches.fundamentals.title') }}</span>
              <span class="branch-node-summary">{{ getBranchSummary('fundamentals') }}</span>
            </div>
            <div class="indicator-pills">
              <span v-for="key in overviewBranchMetrics.fundamentals" :key="key" class="pill-item" @click="scrollToCard(key)">{{ getMetricPillLabel(key) }}</span>
            </div>
          </div>

          <!-- Branch: Inflation -->
          <div class="map-branch-box inflation-box" :class="`tone-${getBranchTone('inflation')}`">
            <div class="branch-node" @click="scrollToBranch('inflation')">
              <span class="branch-node-title">{{ $t('macro.branches.inflation.title') }}</span>
              <span class="branch-node-summary">{{ getBranchSummary('inflation') }}</span>
            </div>
            <div class="indicator-pills">
              <span v-for="key in overviewBranchMetrics.inflation" :key="key" class="pill-item" @click="scrollToCard(key)">{{ getMetricPillLabel(key) }}</span>
            </div>
          </div>

          <!-- Branch: Sentiment -->
          <div class="map-branch-box sentiment-box" :class="`tone-${getBranchTone('sentiment')}`">
            <div class="branch-node" @click="scrollToBranch('sentiment')">
              <span class="branch-node-title">{{ $t('macro.branches.sentiment.title') }}</span>
              <span class="branch-node-summary">{{ getBranchSummary('sentiment') }}</span>
            </div>
            <div class="indicator-pills">
              <span v-for="key in overviewBranchMetrics.sentiment" :key="key" class="pill-item" @click="scrollToCard(key)">{{ getMetricPillLabel(key) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Detailed Branch Sections -->
      <div class="branch-sections-list">

        <!-- Branch: Liquidity -->
        <div id="branch-section-liquidity" class="branch-section-block liquidity-block">
          <div class="section-block-header">
            <div class="header-left">
              <a-icon type="fund" class="section-block-icon" style="color: #1890ff;" />
              <h2>{{ $t('macro.branches.liquidity.title') }}</h2>
            </div>
            <a-button type="link" size="small" @click="enterDomain('liquidity')">
              {{ $t('macro.action.deepDive') }} <a-icon type="arrow-right" />
            </a-button>
          </div>
          <p class="section-block-desc">{{ $t('macro.branches.liquidity.desc') }}</p>

          <div class="branch-cards-grid">
            <div
              v-for="key in overviewBranchMetrics.liquidity"
              :key="key"
              :id="'card-' + key"
              class="indicator-card"
              :class="{ expanded: expandedCards[key] }"
              @click="toggleCard(key)"
            >
              <div class="card-header-bar">
                <div class="header-left">
                  <span class="indicator-name">{{ getIndicatorMeta(key).name }}</span>
                  <span class="indicator-label">{{ getIndicatorMeta(key).label }}</span>
                </div>
                <div class="header-right">
                  <span class="indicator-value" :class="{ 'unavailable': getMetricData(key).value === null }">
                    {{ getMetricDisplayValue(key) }}
                  </span>
                  <a-tag :color="statusToneColor(evaluateIndicator(key, getMetricData(key).value).tone)" class="status-tag">
                    {{ evaluateIndicator(key, getMetricData(key).value).label }}
                  </a-tag>
                  <a-icon :type="expandedCards[key] ? 'up' : 'down'" class="toggle-icon" />
                </div>
              </div>

              <transition name="slide-fade">
                <div v-if="expandedCards[key]" class="card-expanded-content" @click.stop>
                  <div class="education-block">
                    <span class="block-title">{{ $t('macro.card.definition') }}</span>
                    <p class="block-text">{{ getIndicatorMeta(key).what }}</p>
                  </div>

                  <div class="rule-block">
                    <span class="block-title">{{ $t('macro.card.implication') }}</span>
                    <p class="block-text meaning-text">{{ evaluateIndicator(key, getMetricData(key).value).meaning }}</p>
                  </div>

                  <div class="relationship-block" v-if="getIndicatorMeta(key).relationships && getIndicatorMeta(key).relationships.length">
                    <span class="block-title">{{ $t('macro.card.relationships') }}</span>
                    <div v-for="(rel, idx) in getIndicatorMeta(key).relationships" :key="idx" class="relationship-item">
                      <a-icon type="swap-right" class="rel-icon" />
                      <span class="rel-target">{{ getIndicatorMeta(rel.target).name || rel.target.toUpperCase() }}</span>
                      <span class="rel-text">: {{ rel.label }}</span>
                    </div>
                  </div>

                  <div class="provenance-block">
                    <div class="prov-meta-line">
                      <span>{{ $t('macro.card.source') }}: {{ getIndicatorMeta(key).sourceHint }}</span>
                      <span>{{ $t('macro.card.frequency') }}: {{ getIndicatorMeta(key).frequency }}</span>
                    </div>
                    <div class="prov-meta-line" v-if="getMetricData(key).latestDataDate">
                      <span>{{ $t('macro.card.lastUpdated') }}: {{ getMetricData(key).latestDataDate.split('T')[0] }}</span>
                    </div>
                    <div class="rule-badge-container">
                      <span class="rule-badge">{{ $t('macro.nonAi') }}</span>
                    </div>
                  </div>
                </div>
              </transition>
            </div>
          </div>
        </div>

        <!-- Branch: Fundamentals -->
        <div id="branch-section-fundamentals" class="branch-section-block fundamentals-block">
          <div class="section-block-header">
            <div class="header-left">
              <a-icon type="line-chart" class="section-block-icon" style="color: #52c41a;" />
              <h2>{{ $t('macro.branches.fundamentals.title') }}</h2>
            </div>
            <a-button type="link" size="small" @click="enterDomain('economy')">
              {{ $t('macro.action.deepDive') }} <a-icon type="arrow-right" />
            </a-button>
          </div>
          <p class="section-block-desc">{{ $t('macro.branches.fundamentals.desc') }}</p>

          <div class="branch-cards-grid">
            <div
              v-for="key in overviewBranchMetrics.fundamentals"
              :key="key"
              :id="'card-' + key"
              class="indicator-card"
              :class="{ expanded: expandedCards[key] }"
              @click="toggleCard(key)"
            >
              <div class="card-header-bar">
                <div class="header-left">
                  <span class="indicator-name">{{ getIndicatorMeta(key).name }}</span>
                  <span class="indicator-label">{{ getIndicatorMeta(key).label }}</span>
                </div>
                <div class="header-right">
                  <span class="indicator-value" :class="{ 'unavailable': getMetricData(key).value === null }">
                    {{ getMetricDisplayValue(key) }}
                  </span>
                  <a-tag :color="statusToneColor(evaluateIndicator(key, getMetricData(key).value).tone)" class="status-tag">
                    {{ evaluateIndicator(key, getMetricData(key).value).label }}
                  </a-tag>
                  <a-icon :type="expandedCards[key] ? 'up' : 'down'" class="toggle-icon" />
                </div>
              </div>

              <transition name="slide-fade">
                <div v-if="expandedCards[key]" class="card-expanded-content" @click.stop>
                  <div class="education-block">
                    <span class="block-title">{{ $t('macro.card.definition') }}</span>
                    <p class="block-text">{{ getIndicatorMeta(key).what }}</p>
                  </div>

                  <div class="rule-block">
                    <span class="block-title">{{ $t('macro.card.implication') }}</span>
                    <p class="block-text meaning-text">{{ evaluateIndicator(key, getMetricData(key).value).meaning }}</p>
                  </div>

                  <div class="relationship-block" v-if="getIndicatorMeta(key).relationships && getIndicatorMeta(key).relationships.length">
                    <span class="block-title">{{ $t('macro.card.relationships') }}</span>
                    <div v-for="(rel, idx) in getIndicatorMeta(key).relationships" :key="idx" class="relationship-item">
                      <a-icon type="swap-right" class="rel-icon" />
                      <span class="rel-target">{{ getIndicatorMeta(rel.target).name || rel.target.toUpperCase() }}</span>
                      <span class="rel-text">: {{ rel.label }}</span>
                    </div>
                  </div>

                  <div class="provenance-block">
                    <div class="prov-meta-line">
                      <span>{{ $t('macro.card.source') }}: {{ getIndicatorMeta(key).sourceHint }}</span>
                      <span>{{ $t('macro.card.frequency') }}: {{ getIndicatorMeta(key).frequency }}</span>
                    </div>
                    <div class="prov-meta-line" v-if="getMetricData(key).latestDataDate">
                      <span>{{ $t('macro.card.lastUpdated') }}: {{ getMetricData(key).latestDataDate.split('T')[0] }}</span>
                    </div>
                    <div class="rule-badge-container">
                      <span class="rule-badge">{{ $t('macro.nonAi') }}</span>
                    </div>
                  </div>
                </div>
              </transition>
            </div>
          </div>
        </div>

        <!-- Branch: Inflation -->
        <div id="branch-section-inflation" class="branch-section-block inflation-block">
          <div class="section-block-header">
            <div class="header-left">
              <a-icon type="fire" class="section-block-icon" style="color: #f5222d;" />
              <h2>{{ $t('macro.branches.inflation.title') }}</h2>
            </div>
            <a-button type="link" size="small" @click="enterDomain('inflation')">
              {{ $t('macro.action.deepDive') }} <a-icon type="arrow-right" />
            </a-button>
          </div>
          <p class="section-block-desc">{{ $t('macro.branches.inflation.desc') }}</p>

          <div class="branch-cards-grid">
            <div
              v-for="key in overviewBranchMetrics.inflation"
              :key="key"
              :id="'card-' + key"
              class="indicator-card"
              :class="{ expanded: expandedCards[key] }"
              @click="toggleCard(key)"
            >
              <div class="card-header-bar">
                <div class="header-left">
                  <span class="indicator-name">{{ getIndicatorMeta(key).name }}</span>
                  <span class="indicator-label">{{ getIndicatorMeta(key).label }}</span>
                </div>
                <div class="header-right">
                  <span class="indicator-value" :class="{ 'unavailable': getMetricData(key).value === null }">
                    {{ getMetricDisplayValue(key) }}
                  </span>
                  <a-tag :color="statusToneColor(evaluateIndicator(key, getMetricData(key).value).tone)" class="status-tag">
                    {{ evaluateIndicator(key, getMetricData(key).value).label }}
                  </a-tag>
                  <a-icon :type="expandedCards[key] ? 'up' : 'down'" class="toggle-icon" />
                </div>
              </div>

              <transition name="slide-fade">
                <div v-if="expandedCards[key]" class="card-expanded-content" @click.stop>
                  <div class="education-block">
                    <span class="block-title">{{ $t('macro.card.definition') }}</span>
                    <p class="block-text">{{ getIndicatorMeta(key).what }}</p>
                  </div>

                  <div class="rule-block">
                    <span class="block-title">{{ $t('macro.card.implication') }}</span>
                    <p class="block-text meaning-text">{{ evaluateIndicator(key, getMetricData(key).value).meaning }}</p>
                  </div>

                  <div class="relationship-block" v-if="getIndicatorMeta(key).relationships && getIndicatorMeta(key).relationships.length">
                    <span class="block-title">{{ $t('macro.card.relationships') }}</span>
                    <div v-for="(rel, idx) in getIndicatorMeta(key).relationships" :key="idx" class="relationship-item">
                      <a-icon type="swap-right" class="rel-icon" />
                      <span class="rel-target">{{ getIndicatorMeta(rel.target).name || rel.target.toUpperCase() }}</span>
                      <span class="rel-text">: {{ rel.label }}</span>
                    </div>
                  </div>

                  <div class="provenance-block">
                    <div class="prov-meta-line">
                      <span>{{ $t('macro.card.source') }}: {{ getIndicatorMeta(key).sourceHint }}</span>
                      <span>{{ $t('macro.card.frequency') }}: {{ getIndicatorMeta(key).frequency }}</span>
                    </div>
                    <div class="prov-meta-line" v-if="getMetricData(key).latestDataDate">
                      <span>{{ $t('macro.card.lastUpdated') }}: {{ getMetricData(key).latestDataDate.split('T')[0] }}</span>
                    </div>
                    <div class="rule-badge-container">
                      <span class="rule-badge">{{ $t('macro.nonAi') }}</span>
                    </div>
                  </div>
                </div>
              </transition>
            </div>
          </div>
        </div>

        <!-- Branch: Sentiment -->
        <div id="branch-section-sentiment" class="branch-section-block sentiment-block">
          <div class="section-block-header">
            <div class="header-left">
              <a-icon type="smile" class="section-block-icon" style="color: #fa8c16;" />
              <h2>{{ $t('macro.branches.sentiment.title') }}</h2>
            </div>
            <a-button type="link" size="small" @click="enterDomain('sentiment')">
              {{ $t('macro.action.deepDive') }} <a-icon type="arrow-right" />
            </a-button>
          </div>
          <p class="section-block-desc">{{ $t('macro.branches.sentiment.desc') }}</p>

          <div class="branch-cards-grid">
            <div
              v-for="key in overviewBranchMetrics.sentiment"
              :key="key"
              :id="'card-' + key"
              class="indicator-card"
              :class="{ expanded: expandedCards[key] }"
              @click="toggleCard(key)"
            >
              <div class="card-header-bar">
                <div class="header-left">
                  <span class="indicator-name">{{ getIndicatorMeta(key).name }}</span>
                  <span class="indicator-label">{{ getIndicatorMeta(key).label }}</span>
                </div>
                <div class="header-right">
                  <span class="indicator-value" :class="{ 'unavailable': getMetricData(key).value === null }">
                    {{ getMetricDisplayValue(key) }}
                  </span>
                  <a-tag :color="statusToneColor(evaluateIndicator(key, getMetricData(key).value).tone)" class="status-tag">
                    {{ evaluateIndicator(key, getMetricData(key).value).label }}
                  </a-tag>
                  <a-icon :type="expandedCards[key] ? 'up' : 'down'" class="toggle-icon" />
                </div>
              </div>

              <transition name="slide-fade">
                <div v-if="expandedCards[key]" class="card-expanded-content" @click.stop>
                  <div class="education-block">
                    <span class="block-title">{{ $t('macro.card.definition') }}</span>
                    <p class="block-text">{{ getIndicatorMeta(key).what }}</p>
                  </div>

                  <div class="rule-block">
                    <span class="block-title">{{ $t('macro.card.implication') }}</span>
                    <p class="block-text meaning-text">{{ evaluateIndicator(key, getMetricData(key).value).meaning }}</p>
                  </div>

                  <div class="relationship-block" v-if="getIndicatorMeta(key).relationships && getIndicatorMeta(key).relationships.length">
                    <span class="block-title">{{ $t('macro.card.relationships') }}</span>
                    <div v-for="(rel, idx) in getIndicatorMeta(key).relationships" :key="idx" class="relationship-item">
                      <a-icon type="swap-right" class="rel-icon" />
                      <span class="rel-target">{{ getIndicatorMeta(rel.target).name || rel.target.toUpperCase() }}</span>
                      <span class="rel-text">: {{ rel.label }}</span>
                    </div>
                  </div>

                  <div class="provenance-block">
                    <div class="prov-meta-line">
                      <span>{{ $t('macro.card.source') }}: {{ getIndicatorMeta(key).sourceHint }}</span>
                      <span>{{ $t('macro.card.frequency') }}: {{ getIndicatorMeta(key).frequency }}</span>
                    </div>
                    <div class="prov-meta-line" v-if="getMetricData(key).latestDataDate">
                      <span>{{ $t('macro.card.lastUpdated') }}: {{ getMetricData(key).latestDataDate.split('T')[0] }}</span>
                    </div>
                    <div class="rule-badge-container">
                      <span class="rule-badge">{{ $t('macro.nonAi') }}</span>
                    </div>
                  </div>
                </div>
              </transition>
            </div>
          </div>
        </div>

      </div>

    </div>
  </div>
</template>

<script>
import { getMacroViewModel } from './adapters'
import { MACRO_OVERVIEW_BRANCH_METRICS } from './adapters/metricConfig'
import { INDICATOR_META } from './config/indicatorMeta'
import { evaluateIndicator } from './config/indicatorRules'

export default {
  name: 'MacroIntelligence',
  data () {
    return {
      loading: true,
      model: {
        headline: '',
        core_judgment: '',
        generated_at: '',
        top_metrics: [],
        dimensions: {},
        warnings: [],
        health: {},
        provenance: {},
        all_metrics: {}
      },
      overviewBranchMetrics: MACRO_OVERVIEW_BRANCH_METRICS,
      expandedCards: {
        dxy: false,
        rrp: false,
        nfci: false,
        gdp: false,
        us10y: false,
        cpi: false,
        pce_yoy: false,
        core_pce_yoy: false,
        breakeven_10y: false,
        fear_greed: false,
        vix: false
      }
    }
  },
  computed: {
    criticalStaleMetrics () {
      if (!this.model.health || !this.model.health.staleMetrics) return []
      return this.model.health.staleMetrics.filter(key => {
        const metric = this.model.all_metrics[key]
        return metric && metric.sourceType !== 'primary'
      })
    },
    criticalStaleNames () {
      return this.criticalStaleMetrics.map(key => {
        const meta = this.getIndicatorMeta(key)
        return meta.name || key.toUpperCase()
      })
    },
    naturalStaleMetrics () {
      if (!this.model.health || !this.model.health.staleMetrics) return []
      return this.model.health.staleMetrics.filter(key => {
        const metric = this.model.all_metrics[key]
        return metric && metric.sourceType === 'primary'
      })
    },
    naturalStaleNames () {
      return this.naturalStaleMetrics.map(key => {
        const meta = this.getIndicatorMeta(key)
        return meta.name || key.toUpperCase()
      })
    },
    hasCriticalStale () {
      return this.criticalStaleMetrics.length > 0
    },
    hasNaturalStale () {
      return this.naturalStaleMetrics.length > 0
    }
  },
  mounted () {
    this.fetchData()
  },
  methods: {
    async fetchData () {
      this.loading = true
      try {
        this.model = await getMacroViewModel()
      } catch (err) {
        console.error('Failed to load macro view model:', err)
      } finally {
        this.loading = false
      }
    },
    enterDomain (domainKey) {
      this.$router.push(`/macro/${domainKey}`)
    },
    getIndicatorMeta (key) {
      const isZh = (this.$i18n.locale || 'zh-CN') === 'zh-CN'
      const meta = INDICATOR_META[key] || {
        name: key.toUpperCase(),
        label: key,
        unit: '',
        what: isZh ? '暂无说明' : 'No description available',
        relationships: [],
        frequency: 'Daily',
        sourceHint: '—'
      }

      const labelKey = `macro.indicators.${key}.label`
      const whatKey = `macro.indicators.${key}.what`
      const whyItMattersKey = `macro.indicators.${key}.whyItMatters`

      const localizedLabel = this.$te(labelKey) ? this.$t(labelKey) : meta.label
      const localizedWhat = this.$te(whatKey) ? this.$t(whatKey) : meta.what
      const localizedWhyItMatters = this.$te(whyItMattersKey) ? this.$t(whyItMattersKey) : meta.whyItMatters

      const localizedRelationships = (meta.relationships || []).map(rel => {
        const relKey = `macro.indicators.${key}.rel.${rel.target}`
        return {
          target: rel.target,
          label: this.$te(relKey) ? this.$t(relKey) : rel.label
        }
      })

      return {
        ...meta,
        label: localizedLabel,
        what: localizedWhat,
        whyItMatters: localizedWhyItMatters,
        relationships: localizedRelationships
      }
    },
    getMetricPillLabel (key) {
      const metric = this.getMetricData(key)
      if (metric && metric.label) return metric.label
      return this.getIndicatorMeta(key).name || key.toUpperCase()
    },
    getMetricData (key) {
      // Maps client keys to metricsMap keys
      const lookupKey = key === 'fgi' ? 'fear_greed' : key
      return this.model.all_metrics?.[lookupKey] || {
        value: null,
        formattedValue: '—',
        displayValue: '—',
        displayUnit: '',
        latestDataDate: null,
        source: '—',
        frequency: '—'
      }
    },
    getMetricDisplayValue (key) {
      const metric = this.getMetricData(key)
      if (!metric || metric.value === null || metric.value === undefined || metric.status === 'missing') {
        return this.$t('macro.card.noData')
      }
      return metric.displayValue || metric.primary || metric.formattedValue || String(metric.value)
    },
    evaluateIndicator (key, value) {
      const res = evaluateIndicator(key, value)
      if (res) {
        return {
          ...res,
          label: res.labelKey && this.$te(res.labelKey) ? this.$t(res.labelKey) : res.label,
          meaning: res.meaningKey && this.$te(res.meaningKey) ? this.$t(res.meaningKey) : res.meaning
        }
      }
      return res
    },
    statusToneColor (tone) {
      const toneColorMap = {
        green: 'green',
        yellowGreen: 'green',
        neutral: 'blue',
        orange: 'orange',
        red: 'red'
      }
      return toneColorMap[tone] || 'blue'
    },
    translateVerdict (v) {
      if (!v) return '—'
      const keySuffix = v.replace(/\s+/g, '')
      const localeKey = `macro.verdicts.${keySuffix}`
      if (this.$te(localeKey)) {
        return this.$t(localeKey)
      }
      const mapping = {
        Loose: '偏宽松',
        Tight: '偏收紧',
        Expanding: '强劲扩张',
        Slowing: '温和放缓',
        Contracting: '收缩衰退',
        Easing: '通胀降温',
        'High Yield': '高利率压制',
        Greed: '情绪偏热',
        Fear: '情绪偏冷',
        Neutral: '中性平衡'
      }
      return mapping[v] || v
    },
    getBranchTone (branchKey) {
      let verdict = null
      if (branchKey === 'liquidity') {
        verdict = this.model.dimensions?.liquidity?.verdict
      } else if (branchKey === 'fundamentals') {
        verdict = this.model.dimensions?.economy?.verdict
      } else if (branchKey === 'inflation') {
        verdict = this.model.dimensions?.inflationRates?.verdict
      } else if (branchKey === 'sentiment') {
        verdict = this.model.dimensions?.sentiment?.verdict
      }

      if (!verdict) return 'neutral'

      const toneMap = {
        Loose: 'positive',
        Expanding: 'positive',
        Easing: 'positive',
        Tight: 'negative',
        Contracting: 'negative',
        'High Yield': 'negative',
        HighYield: 'negative',
        Greed: 'warning',
        Fear: 'warning',
        Slowing: 'warning',
        Neutral: 'neutral'
      }

      return toneMap[verdict] || 'neutral'
    },
    getBranchSummary (branchKey) {
      if (branchKey === 'liquidity') {
        const verdict = this.model.dimensions?.liquidity?.verdict
        return verdict ? this.$t('macro.branches.liquidity.summary', { state: this.translateVerdict(verdict) }) : this.$t('macro.card.calculating')
      }
      if (branchKey === 'fundamentals') {
        const ecoVerdict = this.model.dimensions?.economy?.verdict
        return ecoVerdict ? this.$t('macro.branches.fundamentals.summary', { state: this.translateVerdict(ecoVerdict) }) : this.$t('macro.card.calculating')
      }
      if (branchKey === 'inflation') {
        const infVerdict = this.model.dimensions?.inflationRates?.verdict
        return infVerdict ? this.$t('macro.branches.inflation.summary', { state: this.translateVerdict(infVerdict) }) : this.$t('macro.card.calculating')
      }
      if (branchKey === 'sentiment') {
        const verdict = this.model.dimensions?.sentiment?.verdict
        return verdict ? this.$t('macro.branches.sentiment.summary', { state: this.translateVerdict(verdict) }) : this.$t('macro.card.calculating')
      }
      return ''
    },
    scrollToBranch (branchId) {
      const el = document.getElementById(`branch-section-${branchId}`)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    },
    scrollToCard (cardId) {
      this.$set(this.expandedCards, cardId, true)
      this.$nextTick(() => {
        const el = document.getElementById(`card-${cardId}`)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      })
    },
    toggleCard (key) {
      this.$set(this.expandedCards, key, !this.expandedCards[key])
    },
    formatDateTime (isoStr) {
      if (!isoStr) return '—'
      try {
        const d = new Date(isoStr)
        const locale = this.$i18n.locale || 'zh-CN'
        return d.toLocaleString(locale, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
      } catch (e) {
        return isoStr
      }
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

.non-ai-banner {
  font-size: 12px;
  color: #10b981;
  background: rgba(16, 185, 129, 0.08);
  padding: 4px 12px;
  border-radius: 20px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.system-warnings {
  margin-bottom: 24px;
  border-radius: 8px;

  .warning-list {
    margin: 0;
    padding-left: 16px;
    li {
      font-size: 13px;
      color: rgba(0,0,0,0.65);
    }
  }
}

.ai-deprecated-alert {
  border-radius: 8px;
  border: 1px solid #ffe58f !important;
  background-color: #fffbe6 !important;
  margin-bottom: 24px;

  :deep(.ant-alert-message) {
    color: rgba(0, 0, 0, 0.85);
    font-weight: 600;
  }

  .hero-thesis {
    font-size: 14px;
    color: #4b5563;
    line-height: 1.5;
    margin: 8px 0;
  }

  .posture-summary-grid {
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid #ffe58f;

    .posture-row {
      display: flex;
      gap: 8px;
      font-size: 13px;

      .posture-label {
        font-weight: 600;
        color: #111827;
      }
      .posture-value {
        color: #4b5563;
      }
    }
  }
}

/* ── Visual Branch Map ── */
.visual-branch-map {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 32px 24px;
  margin-bottom: 40px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.01);
}

.map-root {
  display: inline-block;
  margin-bottom: 24px;
}

.root-node {
  background: #111827;
  color: #ffffff;
  padding: 12px 24px;
  border-radius: 30px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  align-items: center;

  .node-title {
    font-size: 16px;
    font-weight: 600;
    letter-spacing: 0.5px;
  }
  .node-subtitle {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.65);
    margin-top: 2px;
  }
}

.map-branches {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  position: relative;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }

  @media (max-width: 992px) {
    grid-template-columns: 1fr;
    gap: 32px;
  }
}

.map-branch-box {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-top: 4px solid #1890ff; /* Default fallback color */
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  box-shadow: 0 2px 6px rgba(0,0,0,0.02);
  transition: all 0.2s ease;

  &:hover {
    border-color: #d1d5db;
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  }

  &.tone-positive {
    border-top: 4px solid #52c41a;
  }
  &.tone-negative {
    border-top: 4px solid #f5222d;
  }
  &.tone-warning {
    border-top: 4px solid #fa8c16;
  }
  &.tone-neutral {
    border-top: 4px solid #1890ff;
  }

  .branch-node {
    cursor: pointer;
    text-align: center;
    width: 100%;
    margin-bottom: 12px;

    .branch-node-title {
      font-size: 14px;
      font-weight: 600;
      color: #1f2937;
      display: block;
    }
    .branch-node-summary {
      font-size: 12px;
      color: #6b7280;
      margin-top: 4px;
      display: inline-block;
      background: #f3f4f6;
      padding: 2px 8px;
      border-radius: 12px;
    }
  }
}

.indicator-pills {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;

  .pill-item {
    font-size: 12px;
    font-weight: 500;
    color: #4b5563;
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    padding: 4px 12px;
    border-radius: 20px;
    cursor: pointer;
    transition: all 0.15s ease;

    &:hover {
      background: #111827;
      color: #ffffff;
      border-color: #111827;
    }
  }
}

/* ── Branch detailed blocks ── */
.branch-section-block {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 32px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.01);

  .section-block-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;

    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;

      .section-block-icon {
        font-size: 20px;
      }
      h2 {
        font-size: 20px;
        font-weight: 600;
        color: #111827;
        margin: 0;

        .en-sub {
          font-size: 12px;
          color: #9ca3af;
          font-weight: 400;
          margin-left: 8px;
        }
      }
    }
  }

  .section-block-desc {
    font-size: 14px;
    color: #6b7280;
    margin-bottom: 24px;
  }
}

/* ── Indicator detailed cards ── */
.branch-cards-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.indicator-card {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  overflow: hidden;

  &:hover {
    border-color: #d1d5db;
    background: #f3f4f6;
  }

  &.expanded {
    background: #ffffff;
    border-color: #d1d5db;
    box-shadow: 0 4px 12px rgba(0,0,0,0.03);
  }
}

.card-header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;

  @media (max-width: 576px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}

.header-left {
  display: flex;
  align-items: baseline;
  gap: 8px;

  .indicator-name {
    font-size: 16px;
    font-weight: 700;
    color: #111827;
    font-family: 'SFMono-Regular', Consolas, monospace;
  }
  .indicator-label {
    font-size: 14px;
    color: #4b5563;
  }
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;

  @media (max-width: 576px) {
    width: 100%;
    justify-content: space-between;
  }

  .indicator-value {
    font-size: 18px;
    font-weight: 700;
    color: #111827;
    font-family: 'SFMono-Regular', Consolas, monospace;

    &.unavailable {
      color: #9ca3af;
      font-weight: 400;
      font-family: inherit;
      font-size: 14px;
    }

    .indicator-unit {
      font-size: 12px;
      color: #6b7280;
      margin-left: 2px;
      font-weight: 500;
    }
  }

  .status-tag {
    font-weight: 600;
    font-size: 12px;
    padding: 2px 8px;
    border-radius: 4px;
    border: none;
  }

  .toggle-icon {
    font-size: 14px;
    color: #9ca3af;
  }
}

/* ── Collapsed Content ── */
.card-expanded-content {
  padding: 20px;
  border-top: 1px solid #f3f4f6;
  background: #ffffff;

  .education-block, .rule-block, .relationship-block {
    margin-bottom: 16px;

    .block-title {
      font-size: 13px;
      font-weight: 600;
      color: #6b7280;
      display: block;
      margin-bottom: 6px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .block-text {
      font-size: 14px;
      color: #1f2937;
      line-height: 1.6;
      margin: 0;

      &.meaning-text {
        font-weight: 500;
        color: #111827;
      }
    }
  }
}

.relationship-item {
  display: flex;
  align-items: baseline;
  font-size: 14px;
  color: #374151;
  margin-bottom: 6px;

  &:last-child {
    margin-bottom: 0;
  }

  .rel-icon {
    font-size: 12px;
    color: #9ca3af;
    margin-right: 8px;
  }

  .rel-target {
    font-weight: 600;
    color: #111827;
    font-family: 'SFMono-Regular', Consolas, monospace;
    margin-right: 4px;
  }
}

.provenance-block {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px dashed #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;

  .prov-meta-line {
    display: flex;
    gap: 16px;
    font-size: 12px;
    color: #9ca3af;
  }

  .rule-badge-container {
    .rule-badge {
      font-size: 11px;
      background: #f3f4f6;
      color: #4b5563;
      padding: 2px 8px;
      border-radius: 4px;
      font-weight: 500;
    }
  }
}

@media (max-width: 768px) {
  .macro-intelligence-page {
    padding: 16px;
  }
}
</style>
