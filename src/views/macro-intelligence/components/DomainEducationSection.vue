<template>
  <div class="education-section" v-if="config">
    <a-collapse :bordered="false" class="education-collapse">
      <a-collapse-panel key="1" class="education-panel">
        <template #header>
          <div class="education-header">
            <span class="education-title"><a-icon type="book" /> 如何阅读这些指标</span>
            <span class="education-badge">固定说明 · 非 AI 生成 · 不参与今日判断</span>
          </div>
        </template>
        
        <div class="education-content">
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
                      <span class="related-label">相关数据：</span>
                      <a-tag v-for="id in getVisibleMetrics(indicator.relatedMetricIds)" :key="id" color="blue" class="metric-tag">
                        {{ formatMetricId(id) }}
                      </a-tag>
                      <a-tag v-for="id in getMissingMetrics(indicator.relatedMetricIds)" :key="id + '-missing'" class="metric-tag missing-tag">
                        {{ formatMetricId(id) }} (待接入)
                      </a-tag>
                    </div>
                  </div>
                  
                  <p class="ind-desc">{{ indicator.description }}</p>
                  
                  <div class="ind-why" v-if="indicator.whyItMatters">
                    <span class="why-label">为什麼重要：</span>
                    {{ indicator.whyItMatters }}
                  </div>
                  
                  <div class="ind-thresholds" v-if="indicator.thresholds && indicator.thresholds.length">
                    <span class="threshold-label">关键区间：</span>
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
import { MACRO_METRIC_CONFIG } from '../adapters/metricConfig'

export default {
  name: 'DomainEducationSection',
  props: {
    config: {
      type: Object,
      default: () => null
    }
  },
  methods: {
    isMetricAvailable(id) {
      return !!MACRO_METRIC_CONFIG[id]
    },
    getVisibleMetrics(ids) {
      if (!ids || !ids.length) return []
      return ids.filter(id => this.isMetricAvailable(id))
    },
    getMissingMetrics(ids) {
      if (!ids || !ids.length) return []
      // Only show missing metrics in development environment
      if (process.env.NODE_ENV !== 'development') return []
      return ids.filter(id => !this.isMetricAvailable(id))
    },
    hasAnyTags(ids) {
      return this.getVisibleMetrics(ids).length > 0 || this.getMissingMetrics(ids).length > 0
    },
    formatMetricId(id) {
      if (!id) return ''
      return id.replace(/_/g, ' ').toUpperCase()
    }
  }
}
</script>

<style scoped lang="less">
.education-section {
  margin-bottom: 40px;
}

.education-collapse {
  background: #fafafa;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #f0f0f0;
}

:deep(.ant-collapse-item) {
  border-bottom: none !important;
}

:deep(.ant-collapse-header) {
  padding: 16px 24px !important;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
}

.education-header {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.education-title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
}

.education-badge {
  font-size: 12px;
  color: #8c8c8c;
  background: #f5f5f5;
  padding: 2px 10px;
  border-radius: 12px;
  border: 1px solid #e8e8e8;
}

.education-content {
  padding: 16px 8px;
  background: #fafafa;
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
