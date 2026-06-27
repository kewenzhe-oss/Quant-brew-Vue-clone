<template>
  <div class="education-section" v-if="config">
    <a-collapse v-model="activeKeys" :bordered="false" class="education-collapse">
      <template #expandIcon>
        <div style="display: none;"></div>
      </template>
      <a-collapse-panel key="1" class="education-panel">
        <template #header>
          <div class="education-header-wrapper">
            <!-- Zone 1: Left Chevron Circle -->
            <div class="edu-chevron-circle" :class="{ 'active': activeKeys.includes('1') }">
              <a-icon type="right" class="edu-chevron-icon" />
            </div>

            <!-- Zone 2: Center (Book Icon, Title, Subtitle) -->
            <div class="edu-header-center">
              <span class="education-title">
                <a-icon type="book" class="education-book-icon" />
                {{ $t('macro.education.howToRead') }}
              </span>
              <span class="education-subtitle">{{ $t('macro.education.guideSubTitle') }}</span>
            </div>

            <!-- Zone 3: Right (Compact Badge) -->
            <span class="education-badge" :class="{ 'active': activeKeys.includes('1') }">
              {{ activeKeys.includes('1') ? $t('macro.education.guideCollapse') : $t('macro.education.guideExpand') }}
            </span>
          </div>
        </template>

        <div class="education-content">
          <div class="education-legend-notice">
            <a-icon type="info-circle" class="legend-notice-icon" />
            <span>{{ $t('macro.education.legendBadge') }}</span>
          </div>
          <p class="section-desc">{{ config.sectionDescription }}</p>

          <div class="education-groups">
            <div
              v-for="(section, sIdx) in config.sections"
              :key="sIdx"
              class="edu-group"
            >
              <h3 class="group-title">{{ section.title }}</h3>
              <p v-if="section.description" class="group-desc">{{ section.description }}</p>

              <div class="indicator-list">
                <div
                  v-for="(indicator, iIdx) in section.indicators"
                  :key="iIdx"
                  class="indicator-card"
                >
                  <div class="ind-header">
                    <h4 class="ind-name">{{ indicator.name }}</h4>
                    <div class="related-tags" v-if="hasAnyTags(indicator.relatedMetricIds)">
                      <span class="related-label">{{ $t('macro.education.relatedData') }}</span>
                      <a-tag
                        v-for="id in getVisibleMetrics(indicator.relatedMetricIds)"
                        :key="id"
                        :color="getTagColor(id)"
                        class="metric-tag interactive-tag"
                        @click="handleTagClick(id)"
                      >
                        {{ formatMetricId(id) }}
                        <a-icon :type="getTagIcon(id)" class="tag-icon" />
                      </a-tag>
                      <a-tag v-for="id in getMissingMetrics(indicator.relatedMetricIds)" :key="id + '-missing'" class="metric-tag missing-tag">
                        {{ formatMetricId(id) }} {{ $t('macro.education.pendingData') }}
                      </a-tag>
                    </div>
                  </div>

                  <p class="ind-desc">{{ indicator.description }}</p>

                  <div class="ind-why" v-if="indicator.whyItMatters">
                    <span class="why-label">{{ $t('macro.education.whyItMatters') }}</span>
                    {{ indicator.whyItMatters }}
                  </div>

                  <div class="ind-thresholds" v-if="indicator.thresholds && indicator.thresholds.length">
                    <span class="threshold-label">{{ $t('macro.education.keyIntervals') }}</span>
                    <ul class="threshold-list">
                      <li v-for="(th, tIdx) in indicator.thresholds" :key="tIdx">
                        <span class="th-range">{{ th.range }} {{ th.label }}</span>
                        <span class="th-meaning">{{ th.meaning }}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </a-collapse-panel>
    </a-collapse>
  </div>
</template>

<script>
import { RELATED_METRIC_ROUTES } from '../config/indicatorMeta'

export default {
  name: 'DomainEducationSection',
  props: {
    config: {
      type: Object,
      default: () => null
    }
  },
  data () {
    return {
      activeKeys: []
    }
  },
  methods: {
    isMetricAvailable (id) {
      return !!RELATED_METRIC_ROUTES[id]
    },
    getVisibleMetrics (ids) {
      if (!ids || !ids.length) return []
      return ids.filter(id => this.isMetricAvailable(id))
    },
    getMissingMetrics (ids) {
      if (!ids || !ids.length) return []
      // Only show missing metrics in development environment
      if (process.env.NODE_ENV !== 'development') return []
      return ids.filter(id => !this.isMetricAvailable(id))
    },
    hasAnyTags (ids) {
      return this.getVisibleMetrics(ids).length > 0 || this.getMissingMetrics(ids).length > 0
    },
    formatMetricId (id) {
      if (!id) return ''
      if (id === 'crypto_fgi') return 'Crypto FGI'
      return id.replace(/_/g, ' ').toUpperCase()
    },
    getMetricRoute (id) {
      return RELATED_METRIC_ROUTES[id] || null
    },
    getTagColor (id) {
      const route = this.getMetricRoute(id)
      if (route && route.routeType === 'external') {
        return 'orange'
      }
      return 'blue'
    },
    getTagIcon (id) {
      const route = this.getMetricRoute(id)
      if (route && route.routeType === 'external') {
        return 'link'
      }
      return 'line-chart'
    },
    handleTagClick (id) {
      const route = this.getMetricRoute(id)
      if (!route) return

      if (route.routeType === 'external') {
        if (route.url) {
          window.open(route.url, '_blank')
        }
      } else if (route.routeType === 'internal') {
        const query = {}
        if (route.symbol) query.symbol = route.symbol
        if (route.source) query.source = route.source
        this.$router.push({
          path: '/stock-research',
          query
        })
      }
    }
  }
}
</script>

<style scoped lang="less">
.education-section {
  margin-bottom: 40px;
}

.education-collapse {
  background: #ffffff;
  border-radius: 10px;
  border: 1.5px solid #cbd5e1;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.04), 0 2px 4px -1px rgba(0, 0, 0, 0.02);
  overflow: hidden;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    border-color: #94a3b8;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
  }
}

:deep(.ant-collapse-item) {
  border-bottom: none !important;
}

:deep(.ant-collapse-header) {
  padding: 16px 20px !important;
  background: #ffffff;
  border-bottom: 1.5px solid #cbd5e1;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    background: #f8fafc;
  }

  .ant-collapse-arrow {
    display: none !important;
  }
}

.education-header-wrapper {
  display: flex;
  align-items: center;
  width: 100%;
  text-align: left;
}

.edu-chevron-circle {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  flex-shrink: 0;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    background: #e2e8f0;
  }

  &.active {
    background: #e6f7ff;
    .edu-chevron-icon {
      transform: rotate(90deg);
      color: #1890ff;
    }
  }
}

.edu-chevron-icon {
  font-size: 10px;
  color: #64748b;
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), color 0.25s;
}

.edu-header-center {
  display: flex;
  flex-direction: column;
  gap: 3px;
  flex: 1;
  min-width: 0;
}

.education-title {
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
}

.education-book-icon {
  color: #1890ff;
  font-size: 15px;
}

.education-subtitle {
  font-size: 11px;
  color: #64748b;
  font-weight: 400;
  line-height: 1.4;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.education-badge {
  font-size: 10px;
  font-weight: 600;
  color: #475569;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  padding: 2px 8px;
  border-radius: 6px;
  margin-left: 16px;
  transition: all 0.2s;
  flex-shrink: 0;

  &.active {
    color: #1890ff;
    background: #e6f7ff;
    border-color: #91d5ff;
  }
}

.education-legend-notice {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  color: #8c8c8c;
  background: #f5f5f5;
  border: 1px solid #e8e8e8;
  padding: 6px 12px;
  border-radius: 6px;
  margin-bottom: 16px;
}

.legend-notice-icon {
  color: #1890ff;
  font-size: 12px;
}

.education-content {
  padding: 16px 20px;
  background: #fafafa;
}

/* Dark theme compatibility */
:global(.theme-dark) {
  .education-collapse {
    background: #1f1f1f;
    border-color: #303030;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);

    &:hover {
      border-color: #434343;
    }
  }

  :deep(.ant-collapse-header) {
    background: #1f1f1f !important;
    border-bottom-color: #303030 !important;
    &:hover {
      background: #252526 !important;
    }
  }

  .edu-chevron-circle {
    background: #2d2d2d;
    &.active {
      background: rgba(24, 144, 255, 0.15);
      .edu-chevron-icon {
        color: #177ddc;
      }
    }
  }

  .edu-chevron-icon {
    color: rgba(255, 255, 255, 0.45);
  }

  .education-title {
    color: rgba(255, 255, 255, 0.85);
  }

  .education-book-icon {
    color: #177ddc;
  }

  .education-subtitle {
    color: rgba(255, 255, 255, 0.45);
  }

  .education-badge {
    color: rgba(255, 255, 255, 0.65);
    background: #2d2d2d;
    border-color: #434343;

    &.active {
      color: #177ddc;
      background: rgba(24, 144, 255, 0.15);
      border-color: rgba(24, 144, 255, 0.3);
    }
  }

  .education-legend-notice {
    background: #141414;
    border-color: #303030;
    color: rgba(255, 255, 255, 0.45);
  }

  .education-content {
    background: #141414;
  }

  .section-desc {
    background: #1f1f1f;
    color: rgba(255, 255, 255, 0.65);
    border-left-color: #177ddc;
  }

  .edu-group .group-title {
    color: rgba(255, 255, 255, 0.85);
    border-bottom-color: #303030;
  }

  .edu-group .group-desc {
    color: rgba(255, 255, 255, 0.65);
  }

  .indicator-card {
    background: #1f1f1f;
    border-color: #303030;
    &:hover {
      border-color: #434343;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }
  }

  .ind-header .ind-name {
    color: rgba(255, 255, 255, 0.88);
  }

  .ind-desc {
    color: rgba(255, 255, 255, 0.65);
  }

  .ind-why {
    background: rgba(24, 144, 255, 0.1);
    color: rgba(255, 255, 255, 0.75);
    .why-label {
      color: #177ddc;
    }
  }

  .ind-thresholds {
    .threshold-label {
      color: rgba(255, 255, 255, 0.85);
    }
    .threshold-list li {
      border-bottom-color: #303030;
    }
    .th-range {
      color: rgba(255, 255, 255, 0.85);
    }
    .th-meaning {
      color: rgba(255, 255, 255, 0.65);
    }
  }
}

.section-desc {
  font-size: 14px;
  color: #595959;
  line-height: 1.6;
  margin-bottom: 24px;
  background: #fff;
  padding: 16px;
  border-radius: 6px;
  border-left: 3px solid #1890ff;
}

.education-groups {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.edu-group {
  .group-title {
    font-size: 18px;
    font-weight: 600;
    color: #262626;
    margin-bottom: 8px;
    padding-bottom: 8px;
    border-bottom: 1px solid #e8e8e8;
  }

  .group-desc {
    font-size: 14px;
    color: #595959;
    line-height: 1.6;
    margin-bottom: 16px;
  }
}

.indicator-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 16px;
}

.indicator-card {
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: all 0.2s;

  &:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    border-color: #d9d9d9;
  }
}

.ind-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;

  .ind-name {
    font-size: 15px;
    font-weight: 600;
    color: #1a1a1a;
    margin: 0;
  }
}

.related-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
  justify-content: flex-end;

  .related-label {
    font-size: 12px;
    color: #8c8c8c;
    margin-right: 4px;
  }

  .metric-tag {
    margin: 0;
    font-size: 11px;
    font-family: 'SFMono-Regular', Consolas, monospace;

    &.interactive-tag {
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.165, 0.84, 0.44, 1);
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 0 8px;
      height: 22px;
      line-height: 20px;
      border-radius: 4px;

      &:hover {
        transform: translateY(-1px) scale(1.05);
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
      }

      &:active {
        transform: translateY(0) scale(0.98);
      }
    }
  }

  .tag-icon {
    font-size: 10px;
    margin-left: 2px;
    opacity: 0.8;
  }

  .missing-tag {
    background: #f5f5f5;
    color: #bfbfbf;
    border-color: #e8e8e8;
  }
}

.ind-desc {
  font-size: 13px;
  color: #595959;
  line-height: 1.5;
  margin: 0;
}

.ind-why {
  font-size: 13px;
  color: #434343;
  line-height: 1.5;
  background: #f0f5ff;
  padding: 10px 12px;
  border-radius: 4px;

  .why-label {
    font-weight: 600;
    color: #1890ff;
  }
}

.ind-thresholds {
  font-size: 13px;

  .threshold-label {
    font-weight: 600;
    color: #262626;
    display: block;
    margin-bottom: 8px;
  }

  .threshold-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;

    li {
      display: flex;
      flex-direction: column;
      gap: 2px;
      padding-bottom: 8px;
      border-bottom: 1px dashed #f0f0f0;

      &:last-child {
        border-bottom: none;
        padding-bottom: 0;
      }
    }

    .th-range {
      font-weight: 600;
      color: #1a1a1a;
    }

    .th-meaning {
      color: #595959;
      line-height: 1.4;
    }
  }
}

@media (max-width: 768px) {
  .indicator-list {
    grid-template-columns: 1fr;
  }
}
</style>
