<template>
  <div class="daily-briefing-page">
    <a-page-header
      title="早报·晚报"
      sub-title="每日市场开盘前后的核心判断摘要"
      :back-icon="false"
    />

    <!-- 今日早报 -->
    <a-card :bordered="false" title="今日早报" style="margin-bottom: 16px;">
      <template #extra>
        <a-tag color="blue">{{ todayDate }} 开盘前</a-tag>
      </template>
      <div class="briefing-slot">
        <!--
          [待确认] briefing data source / aggregation layer 尚未确认
          可能来源：
          (a) 后端新增 briefing 服务
          (b) 复用 /api/fast-analysis + /api/global-market 聚合生成
          (c) 手动内容管理（admin 录入）
          实装前请先确认数据来源，不要预设 API 路径。
        -->
        <a-empty description="早报数据来源待确认，接入后将在此展示" />
      </div>
    </a-card>

    <!-- 今日晚报 -->
    <a-card :bordered="false" title="今日晚报" style="margin-bottom: 16px;">
      <template #extra>
        <a-tag>{{ todayDate }} 收盘后</a-tag>
      </template>
      <div class="briefing-slot">
        <!--
          [待确认] 同上，晚报数据来源待确认
        -->
        <a-empty description="晚报数据来源待确认，接入后将在此展示" />
      </div>
    </a-card>

    <!-- 历史存档 -->
    <a-card :bordered="false" title="历史存档">
      <div class="archive-slot">
        <!-- [待确认] 历史简报存档结构待定 -->
        <a-empty description="历史简报存档" />
      </div>
    </a-card>
  </div>
</template>

<script>
export default {
  name: 'DailyBriefing',
  computed: {
    todayDate () {
      return new Date().toLocaleDateString('zh-CN', {
        month: 'long',
        day: 'numeric',
        weekday: 'short'
      })
    }
  }
}
</script>

<style scoped lang="less">
.daily-briefing-page {
  padding: 24px;
}

.briefing-slot,
.archive-slot {
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
