<template>
  <div class="daily-briefing-page">
    <!-- ======== Top Indices Marquee ======== -->
    <div class="top-index-bar" v-if="!isEmpty && model.rawIndices && model.rawIndices.length > 0">
      <div class="indices-marquee">
        <div class="marquee-track">
          <span class="idx-item" v-for="(idx, i) in [...model.rawIndices, ...model.rawIndices]" :key="i">
            <span class="idx-name">{{ idx.symbol || idx.name }}</span>
            <span class="idx-val" :class="(idx.change || 0) >= 0 ? 'up' : 'down'">
              {{ idx.price }} <small>({{ (idx.change || 0) >= 0 ? '+' : '' }}{{ idx.change }}%)</small>
            </span>
          </span>
        </div>
      </div>
    </div>

    <a-page-header
      title="早报·晚报"
      sub-title="每日市场开盘前后的核心判断摘要"
      :back-icon="false"
      style="padding-top: 12px;"
    />

    <a-skeleton active :loading="loading">
      <div v-if="!isEmpty">
        <!-- 主题摘要 -->
        <a-card :bordered="false" class="thesis-card" style="margin-bottom: 24px; background: #fafafa;">
          <h2 style="font-weight: bold; margin-bottom: 12px; font-size: 20px;">
            <a-icon type="bulb" theme="twoTone" style="margin-right: 8px;"/>
            {{ model.headline }}
          </h2>
          <p style="font-size: 16px; line-height: 1.8; color: rgba(0,0,0,0.85);">{{ model.summary }}</p>
        </a-card>

        <a-row :gutter="24">
          <!-- 左侧：高亮与市场数据 (替换为 Radar Carousel) -->
          <a-col :span="16">
            <a-card :bordered="false" title="今日市场 (AI 信号池)" style="margin-bottom: 24px;">
              <template #extra>
                <a-tag color="blue">{{ todayDate }}</a-tag>
              </template>

              <div class="radar-section" v-if="model.rawOpportunities && model.rawOpportunities.length > 0">
                <div class="radar-carousel" @mouseenter="oppHover = true" @mouseleave="oppHover = false">
                  <div class="radar-track" :class="{ paused: oppHover }" :style="{ animationDuration: Math.max(30, model.rawOpportunities.length * 3) + 's' }">
                    <div class="radar-card" v-for="(opp, idx) in [...model.rawOpportunities, ...model.rawOpportunities]" :key="'opp-' + idx">
                      <div class="rc-head">
                        <span class="rc-symbol">{{ opp.symbol }}</span>
                        <span class="rc-market">{{ opp.market || 'Crypto' }}</span>
                      </div>
                      <div class="rc-metrics">
                        <div class="rc-metric">
                          <span class="rc-metric-label">价格</span>
                          <span class="rc-metric-value">${{ opp.price }}</span>
                        </div>
                        <div class="rc-metric">
                          <span class="rc-metric-label">24h涨跌</span>
                          <span class="rc-metric-value" :class="(opp.change_24h || 0) >= 0 ? 'rc-up' : 'rc-down'">
                            {{ (opp.change_24h || 0) >= 0 ? '+' : '' }}{{ (opp.change_24h || 0).toFixed(2) }}%
                          </span>
                        </div>
                        <div class="rc-metric">
                          <span class="rc-metric-label">信号</span>
                          <span class="rc-metric-value">{{ opp.signal || 'Notice' }}</span>
                        </div>
                      </div>
                      <div class="rc-footer">
                        <span class="rc-reason">{{ opp.reason || 'AI 探测到异常波动' }}</span>
                        <!-- Execution button completely removed for narrative UI -->
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <a-empty v-else description="暂无市场波动数据" />

              <!-- 情绪高亮 -->
              <div v-if="model.highlights.length" style="margin-top: 16px; padding: 12px; background: rgba(0,0,0,0.02); border-radius: 8px;">
                <h4 style="font-size: 13px; color: #999; margin-bottom: 8px;">补充宏观情绪</h4>
                <ul class="highlights-list" style="margin: 0;">
                  <li v-for="(highlight, idx) in model.highlights" :key="idx">{{ highlight }}</li>
                </ul>
              </div>
            </a-card>
          </a-col>

          <!-- 右侧：前瞻与日历 -->
          <a-col :span="8">
            <a-card :bordered="false" title="重点关注" style="margin-bottom: 24px;">
              <a-list
                v-if="model.upcomingEvents.length"
                item-layout="horizontal"
                :data-source="model.upcomingEvents"
              >
                <a-list-item slot="renderItem" slot-scope="item">
                  <a-list-item-meta :title="item.title || item.event || '事件'" :description="item.time" />
                </a-list-item>
              </a-list>
              <a-empty v-else description="今日无重大事件预告" />
            </a-card>
          </a-col>
        </a-row>
      </div>

      <a-empty v-else description="无简报数据" />
    </a-skeleton>
  </div>
</template>

<script>
import { getBriefingViewModel } from './adapters'

export default {
  name: 'DailyBriefing',
  data () {
    return {
      loading: true,
      oppHover: false,
      model: {
        headline: '',
        summary: '',
        highlights: [],
        sentiment: null,
        marketContext: [],
        rawIndices: [],
        rawOpportunities: [],
        upcomingEvents: [],
        isEmpty: true
      }
    }
  },
  computed: {
    todayDate () {
      return new Date().toLocaleDateString('zh-CN', {
        month: 'long',
        day: 'numeric',
        weekday: 'short'
      })
    },
    isEmpty () {
      return this.model.isEmpty
    }
  },
  mounted () {
    this.fetchData()
  },
  methods: {
    async fetchData () {
      this.loading = true
      this.model = await getBriefingViewModel()
      this.loading = false
    }
  }
}
</script>

<style scoped lang="less">
.daily-briefing-page {
  padding: 0 24px 24px;
}

/* Marquee Styles */
.top-index-bar {
  background: #111;
  color: #fff;
  padding: 8px 0;
  margin: 0 -24px 0 -24px; /* break out of page padding */
  overflow: hidden;

  .indices-marquee {
    display: flex;
    white-space: nowrap;
    position: relative;

    .marquee-track {
      display: inline-flex;
      animation: marquee-scroll 45s linear infinite;

      &:hover {
        animation-play-state: paused;
      }

      .idx-item {
        margin-right: 32px;
        font-family: monospace;
        font-size: 13px;

        .idx-name { color: #ccc; margin-right: 8px; font-weight: bold; font-family: -apple-system, sans-serif; }
        .idx-val { font-weight: normal; }
        .idx-val.up { color: #4ade80; }
        .idx-val.down { color: #f87171; }
        small { opacity: 0.8; }
      }
    }
  }
}

@keyframes marquee-scroll {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

/* Radar Carousel Styles */
.radar-section {
  position: relative;
  overflow: hidden;
  padding: 4px 0;

  .radar-carousel {
    overflow: hidden;
    position: relative;
    border-radius: 8px;
  }

  .radar-track {
    display: flex;
    gap: 12px;
    width: max-content;
    animation: radar-scroll linear infinite;
    &.paused { animation-play-state: paused; }
  }

  .radar-card {
    width: 250px;
    background: #ffffff;
    border-radius: 8px;
    padding: 12px;
    border: 1px solid #e8e8e8;
    flex-shrink: 0;

    .rc-head {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      .rc-symbol { font-weight: bold; font-size: 14px; }
      .rc-market { font-size: 11px; background: #f0f0f0; padding: 2px 6px; border-radius: 4px; color: #666; text-transform: uppercase; }
    }

    .rc-metrics {
      display: flex;
      gap: 4px;
      margin-bottom: 8px;

      .rc-metric {
        flex: 1;
        background: #fafafa;
        padding: 4px;
        border-radius: 4px;
        display: flex;
        flex-direction: column;

        .rc-metric-label { font-size: 10px; color: #999; }
        .rc-metric-value {
          font-size: 12px; font-family: monospace; font-weight: bold;
          &.rc-up { color: #16a34a; }
          &.rc-down { color: #dc2626; }
        }
      }
    }

    .rc-footer {
      .rc-reason { font-size: 11px; color: #888; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; }
    }
  }
}

@keyframes radar-scroll {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

.thesis-card {
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.02);
}
.highlights-list {
  padding-left: 20px;
  li {
    margin-bottom: 8px;
    font-size: 14px;
    color: rgba(0,0,0,0.65);
  }
}
</style>
