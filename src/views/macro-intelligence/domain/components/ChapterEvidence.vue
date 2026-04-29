<template>
  <div class="chapter-evidence-board">
    <a-skeleton active :loading="loading">
      <div v-if="!isEmpty">

        <!-- 1. Current Stance Block -->
        <a-card :bordered="false" class="stance-block" :class="['stance-' + summaryStatus]" style="margin-bottom: 24px;">
          <div class="stance-content">
            <h3 class="verdict-title">
              <a-icon type="compass" class="verdict-icon"/> {{ summaryVerdict }}
            </h3>
            <p class="thesis-text">{{ summaryThesis }}</p>
            <div class="meta-footer">
              <span class="last-updated">{{ lastUpdated }}</span>
            </div>
          </div>
        </a-card>

        <!-- 2. Key Metrics Snapshot & 3. Quantitative Evidence -->
        <div class="section-title">核心指标监控</div>
        <a-row :gutter="16" class="metrics-grid" style="margin-bottom: 8px;">
          <a-col :span="8" v-for="item in keyMetrics" :key="item.id" style="margin-bottom: 16px;">
            <a-card :bordered="false" class="metric-card" hoverable>
              <div class="metric-header">
                <span class="metric-name">{{ item.name }}</span>
                <a-tooltip :title="item.explanation">
                  <a-icon type="info-circle" class="expl-icon" />
                </a-tooltip>
              </div>
              <div class="metric-value-box">
                <div class="metric-value" :class="{'unavailable': item.value === '--'}">
                  {{ item.value }}
                </div>
              </div>
              <div class="metric-explanation">
                {{ item.explanation }}
              </div>
            </a-card>
          </a-col>
        </a-row>

        <a-row :gutter="24">
          <!-- 4. Qualitative Narrative -->
          <a-col :span="12">
            <a-card :bordered="false" title="前沿叙事与逻辑演化" class="narrative-card">
              <a-list v-if="relevantNews && relevantNews.length" size="small" :data-source="relevantNews">
                <a-list-item slot="renderItem" slot-scope="item">
                  <a href="javascript:;" class="narrative-link">
                    {{ item.title }}
                  </a>
                </a-list-item>
              </a-list>
              <a-empty v-else description="当前暂无符合本维度的宏观叙事，但定量指标仍可作为跟踪依据。" />
            </a-card>
          </a-col>

          <!-- 5. Event Catalyst Section -->
          <a-col :span="12">
            <a-card :bordered="false" title="事件催化预警" class="catalyst-card">
              <a-list v-if="relevantEvents && relevantEvents.length" size="small" :data-source="relevantEvents">
                <a-list-item slot="renderItem" slot-scope="item">
                  <div class="event-item">
                    <span class="evt-title">{{ item.title || item.event }}</span>
                    <span class="evt-time">{{ item.time || item.date }}</span>
                  </div>
                </a-list-item>
              </a-list>
              <a-empty v-else description="当前暂无可用的事件催化提醒。" />
            </a-card>
          </a-col>
        </a-row>

      </div>

      <!-- Empty State -->
      <div v-else class="empty-state-wrapper">
        <a-empty description="当前维度暂未配置观测网格或数据断流" />
        <p class="empty-hint">请联系运维工程师检查上游数据采集状态</p>
      </div>
    </a-skeleton>
  </div>
</template>

<script>
export default {
  name: 'ChapterEvidence',
  props: {
    loading: {
      type: Boolean,
      default: true
    },
    isEmpty: {
      type: Boolean,
      default: true
    },
    summaryVerdict: {
      type: String,
      default: ''
    },
    summaryThesis: {
      type: String,
      default: ''
    },
    summaryStatus: {
      type: String,
      default: 'default'
    },
    lastUpdated: {
      type: String,
      default: ''
    },
    keyMetrics: {
      type: Array,
      default: () => []
    },
    relevantEvents: {
      type: Array,
      default: () => []
    },
    relevantNews: {
      type: Array,
      default: () => []
    }
  }
}
</script>

<style scoped lang="less">
.chapter-evidence-board {
  min-height: 200px;
}

/* Stance Block Styles */
.stance-block {
  border-radius: 8px;
  background: var(--component-background, #141414);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border-left: 4px solid #1890ff; /* default */
}

.stance-block.stance-processing { border-left-color: #1890ff; }
.stance-block.stance-warning { border-left-color: #faad14; }
.stance-block.stance-success { border-left-color: #52c41a; }
.stance-block.stance-neutral { border-left-color: #d9d9d9; }

.stance-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.verdict-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--heading-color, rgba(255, 255, 255, 0.85));
}

.verdict-icon {
  margin-right: 6px;
  font-size: 18px;
}

.thesis-text {
  margin: 0;
  font-size: 15px;
  color: var(--text-color, rgba(255, 255, 255, 0.65));
  line-height: 1.6;
}

.meta-footer {
  margin-top: 8px;
  .last-updated {
    font-size: 12px;
    color: var(--text-color-secondary, rgba(255, 255, 255, 0.45));
  }
}

/* Section Subtitle */
.section-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  color: var(--heading-color, rgba(255, 255, 255, 0.85));
}

/* Metric Cards */
.metric-card {
  border-radius: 8px;
  background: var(--component-background, #141414);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  height: 100%;
}

::v-deep .metric-card .ant-card-body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.metric-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;

  .metric-name {
    font-size: 14px;
    font-weight: 500;
    color: var(--text-color, rgba(255, 255, 255, 0.65));
  }
  .expl-icon {
    color: var(--text-color-secondary, rgba(255, 255, 255, 0.45));
    cursor: help;
  }
}

.metric-value-box {
  margin-bottom: auto; /* Push explanation to the bottom */
}

.metric-value {
  font-size: 24px;
  font-weight: 700;
  font-family: 'Inter', 'Roboto', monospace;
  color: var(--heading-color, rgba(255, 255, 255, 0.85));

  &.unavailable {
    color: var(--text-color-secondary, rgba(255, 255, 255, 0.25));
    font-weight: 400;
  }
}

.metric-explanation {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--border-color-split, rgba(255, 255, 255, 0.08));
  font-size: 12px;
  color: var(--text-color-secondary, rgba(255, 255, 255, 0.45));
  line-height: 1.5;
}

/* Event List Styling */
.event-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;

  .evt-title {
    font-weight: 500;
    color: var(--heading-color, rgba(255, 255, 255, 0.85));
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding-right: 12px;
  }

  .evt-time {
    font-size: 12px;
    color: var(--text-color-secondary, rgba(255, 255, 255, 0.45));
    white-space: nowrap;
  }
}

.narrative-link {
  color: var(--heading-color, rgba(255, 255, 255, 0.85));
  font-weight: 500;
  &:hover {
    color: #1890ff;
  }
}

.empty-state-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;

  .empty-hint {
    color: var(--text-color-secondary, rgba(255, 255, 255, 0.45));
    font-size: 12px;
    margin-top: 8px;
  }
}
</style>
