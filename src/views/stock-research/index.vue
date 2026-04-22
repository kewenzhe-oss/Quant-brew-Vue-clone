<template>
  <div class="stock-research-page">
    <a-page-header
      title="个股研究"
      sub-title="深度 AI 分析 · 研究报告"
      :back-icon="false"
    />

    <!-- Sprint 1: Symbol Search — 复用 /api/market/symbols/search -->
    <a-card :bordered="false" style="margin-bottom: 16px;">
      <a-row :gutter="12" type="flex" align="middle">
        <a-col :xs="24" :md="10">
          <a-input-search
            v-model="searchKeyword"
            placeholder="搜索股票 / ETF / 指数（如 AAPL、SPY）"
            size="large"
            @search="onSearch"
            enter-button="分析"
          />
        </a-col>
        <a-col :xs="24" :md="14">
          <span class="hint">输入标的代码后，AI 将调用 fast-analysis 生成研究报告</span>
        </a-col>
      </a-row>
    </a-card>

    <!-- Sprint 2: Fast Analysis 结果区 — 接 /api/fast-analysis/analyze -->
    <a-card :bordered="false" title="研究报告" v-if="hasResult" style="margin-bottom: 16px;">
      <!--
        [下一 sprint] 接 fastAnalyze({ market, symbol }) 结果
        参考旧前端：src/views/ai-analysis/components/FastAnalysisReport.vue
        API 来源：src/api/fast-analysis.js → fastAnalyze()
      -->
      <a-empty description="AI 分析报告（fastAnalyze）接入中" />
    </a-card>

    <!-- Sprint 3: Analysis History — 接 /api/fast-analysis/history/all -->
    <a-card :bordered="false" title="历史分析" v-if="hasResult">
      <!--
        [下一 sprint] 接 getAllAnalysisHistory() 历史记录列表
        API 来源：src/api/fast-analysis.js → getAllAnalysisHistory()
      -->
      <a-empty description="历史分析记录（getAllAnalysisHistory）接入中" />
    </a-card>

    <!-- 空状态 -->
    <a-card :bordered="false" v-if="!hasResult">
      <div class="empty-state">
        <a-icon type="area-chart" style="font-size:48px; color:#d9d9d9;" />
        <p>输入标的开始研究</p>
      </div>
    </a-card>
  </div>
</template>

<script>
export default {
  name: 'StockResearch',
  data () {
    return {
      searchKeyword: '',
      hasResult: false
    }
  },
  methods: {
    onSearch (keyword) {
      if (!keyword) return
      this.hasResult = true
      // [Sprint 2] 调用 fastAnalyze({ market, symbol }) from src/api/fast-analysis.js
    }
  }
}
</script>

<style scoped lang="less">
.stock-research-page {
  padding: 24px;
}

.hint {
  color: rgba(0, 0, 0, 0.45);
  font-size: 13px;
}

.empty-state {
  text-align: center;
  padding: 48px 0;

  p {
    color: rgba(0, 0, 0, 0.45);
    margin-top: 12px;
  }
}
</style>
