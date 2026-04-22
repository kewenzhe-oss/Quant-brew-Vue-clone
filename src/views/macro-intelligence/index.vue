<template>
  <div class="macro-intelligence-page">
    <a-page-header
      title="宏观 Macro"
      sub-title="经济周期判断 · 大类资产环境"
      :back-icon="false"
    />

    <!-- Layer 1: 总判断区 -->
    <a-card :bordered="false" class="stance-card">
      <div class="stance-placeholder">
        <a-icon type="global" style="font-size:32px; color:#1890ff;" />
        <h2>宏观总判断</h2>
        <p class="stance-question">当前应该进攻还是防守？</p>
        <a-tag color="blue">数据接入后将展示 AI 总判断</a-tag>
      </div>
    </a-card>

    <!--
      Layer 1: 4 个 Domain 入口
      每张卡只展示"此维度的方向概括"，不展示章节级指标。
      章节（增长/就业/信用等）属于 Layer 2，在 /macro/:domain 内展示。
      点击后进入 Layer 2：/macro/:domain
    -->
    <div class="domain-grid">
      <a-card
        v-for="domain in domains"
        :key="domain.key"
        :bordered="false"
        class="domain-card"
        hoverable
        @click="enterDomain(domain.key)"
      >
        <div class="domain-header">
          <a-icon :type="domain.icon" class="domain-icon" />
          <span class="domain-label">{{ domain.label }}</span>
          <a-icon type="right" class="domain-arrow" />
        </div>
        <div class="domain-verdict">
          <a-tag>待接入</a-tag>
        </div>
        <!-- 只展示章节名称预告，不展示章节内容 -->
        <p class="domain-chapters">{{ domain.chapters.join(' · ') }}</p>
      </a-card>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MacroIntelligence',
  data () {
    return {
      // Layer 1: 4 个 Domain
      // Chapter 级内容（增长/就业/信用等）属于 Layer 2，不在此处展开
      domains: [
        {
          key: 'liquidity',
          label: '流动性',
          icon: 'dollar',
          chapters: ['美国', '全球']
        },
        {
          key: 'economy',
          label: '经济',
          icon: 'rise',
          chapters: ['增长', '就业', '信用']
        },
        {
          key: 'inflation',
          label: '通胀与利率',
          icon: 'fire',
          chapters: ['通胀', '利率', '商品']
        },
        {
          key: 'sentiment',
          label: '情绪',
          icon: 'heart',
          chapters: ['恐慌贪婪', '波动率', '风险偏好']
        }
      ]
    }
  },
  methods: {
    enterDomain (domainKey) {
      // 进入 Layer 2：/macro/:domain
      this.$router.push(`/macro/${domainKey}`)
    }
  }
}
</script>

<style scoped lang="less">
.macro-intelligence-page {
  padding: 24px;
}

.stance-card {
  text-align: center;
  padding: 32px;
  margin-bottom: 24px;

  .stance-question {
    color: rgba(0, 0, 0, 0.45);
    margin: 8px 0;
  }
}

.domain-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.domain-card {
  cursor: pointer;

  .domain-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 10px;
  }

  .domain-icon {
    font-size: 18px;
    color: #1890ff;
  }

  .domain-label {
    font-size: 16px;
    font-weight: 600;
    flex: 1;
  }

  .domain-arrow {
    color: rgba(0, 0, 0, 0.25);
  }

  .domain-chapters {
    font-size: 12px;
    color: rgba(0, 0, 0, 0.45);
    margin: 8px 0 0;
  }
}

@media (max-width: 576px) {
  .domain-grid {
    grid-template-columns: 1fr;
  }
}
</style>
