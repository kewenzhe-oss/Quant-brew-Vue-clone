<template>
  <div class="learning-page">
    <div class="page-header">
      <div class="header-main">
        <a-icon type="read" class="header-icon" />
        <div>
          <h1 class="page-title">学习中心</h1>
          <p class="page-sub">Learning</p>
        </div>
      </div>
    </div>

    <a
      class="core-card"
      :href="corePlatform.url"
      target="_blank"
      rel="noopener noreferrer"
    >
      <div class="core-icon-wrap">
        <a-icon type="compass" class="core-icon" />
      </div>
      <div class="core-body">
        <p class="section-kicker">核心投资体系</p>
        <h2 class="core-title">{{ corePlatform.title }}</h2>
        <p class="core-subtitle">{{ corePlatform.subtitle }}</p>
      </div>
      <a-icon type="export" class="core-external" />
    </a>

    <div class="section-heading">
      <h2>生态资源</h2>
      <p>Ecosystem & Tools</p>
    </div>

    <div class="ecosystem-grid">
      <a
        v-for="platform in platforms"
        :key="platform.title"
        class="ecosystem-card"
        :href="platform.url"
        target="_blank"
        rel="noopener noreferrer"
      >
        <div class="card-top">
          <div class="platform-icon">
            <a-icon :type="platform.icon" />
          </div>
          <a-icon type="export" class="external-icon" />
        </div>
        <div class="card-body">
          <h2 class="card-title">{{ platform.title }}</h2>
          <p class="card-subtitle">{{ platform.subtitle }}</p>
          <p v-if="platform.note" class="card-note">{{ platform.note }}</p>
        </div>
      </a>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Learning',
  data () {
    return {
      corePlatform: {
        title: 'PostSoma Investing',
        subtitle: '投资体系、思考框架与深度长文 (Investing Framework & Deep Dives)',
        url: 'https://www.postsoma-2050.com/investing'
      },
      platforms: [
        {
          icon: 'read',
          title: 'NewsHub',
          subtitle: '新闻聚合平台 (News Aggregation Platform)',
          url: 'https://205077.xyz/'
        },
        {
          icon: 'tool',
          title: 'AI Skills',
          subtitle: 'AI 技能与工具聚合 (AI Skills & Tools Hub)',
          url: 'https://aiskills888.dpdns.org/'
        },
        {
          icon: 'experiment',
          title: 'AI Prompts & Testing',
          subtitle: '个人提示词分享与测试平台 (Prompt Sharing & Testing)',
          url: 'https://www.205011.xyz/'
        },
        {
          icon: 'book',
          title: 'PostSoma Books',
          subtitle: '个人精选书库 (Personal Library)',
          note: 'Access Code: 3yyD9R4tUa8y',
          url: 'https://postsomabooks.qzz.io/'
        }
      ]
    }
  }
}
</script>

<style scoped lang="less">
.learning-page {
  width: 100%;
  max-width: 1180px;
  margin: 0 auto;
  padding: 32px 32px 56px;
}

.page-header {
  margin-bottom: 28px;
}

.header-main {
  display: flex;
  align-items: center;
  gap: 14px;
}

.header-icon {
  width: 42px;
  height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: #f3f4f6;
  color: #111827;
  font-size: 22px;
}

.page-title {
  margin: 0;
  color: #1f2933;
  font-size: 28px;
  font-weight: 650;
  letter-spacing: 0;
}

.page-sub {
  margin: 2px 0 0;
  color: #6b7280;
  font-size: 13px;
}

.core-card {
  min-height: 164px;
  display: flex;
  align-items: center;
  gap: 22px;
  margin-bottom: 32px;
  padding: 32px;
  border: 1px solid #e6e2dc;
  border-radius: 8px;
  background: #ffffff;
  color: inherit;
  text-decoration: none;
  box-shadow: none;
  transition: border-color 0.18s ease, background 0.18s ease;

  &:hover {
    border-color: #cfd8d2;
    background: #fbfaf8;
    color: inherit;
    text-decoration: none;

    .core-external {
      color: #111827;
      transform: translate(2px, -2px);
    }
  }
}

.core-icon-wrap {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 8px;
  background: #111827;
  color: #ffffff;
}

.core-icon {
  font-size: 30px;
}

.core-body {
  min-width: 0;
  flex: 1;
}

.section-kicker {
  margin: 0 0 8px;
  color: #1d6f4f;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.core-title {
  margin: 0 0 8px;
  color: #1f2933;
  font-size: 24px;
  font-weight: 650;
  line-height: 1.25;
  letter-spacing: 0;
}

.core-subtitle {
  margin: 0;
  color: #374151;
  font-size: 15px;
  line-height: 1.65;
}

.core-external {
  align-self: flex-start;
  color: #9ca3af;
  font-size: 17px;
  transition: color 0.18s ease, transform 0.18s ease;
}

.section-heading {
  margin: 0 0 18px;

  h2 {
    margin: 0;
    color: #1f2933;
    font-size: 16px;
    font-weight: 650;
    letter-spacing: 0;
  }

  p {
    margin: 2px 0 0;
    color: #6b7280;
    font-size: 12px;
  }
}

.ecosystem-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}

.ecosystem-card {
  min-height: 172px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 24px;
  border: 1px solid #e6e2dc;
  border-radius: 8px;
  background: #ffffff;
  color: inherit;
  text-decoration: none;
  box-shadow: none;
  transition: border-color 0.18s ease, background 0.18s ease;

  &:hover {
    border-color: #cfd8d2;
    background: #fbfaf8;
    color: inherit;
    text-decoration: none;

    .external-icon {
      color: #111827;
      transform: translate(2px, -2px);
    }
  }
}

.card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 22px;
}

.platform-icon {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: #eef7f1;
  color: #1d6f4f;
  border: 1px solid #dbeadf;
  font-size: 20px;
  line-height: 1;
}

.external-icon {
  color: #9ca3af;
  font-size: 16px;
  transition: color 0.18s ease, transform 0.18s ease;
}

.card-body {
  min-width: 0;
}

.card-title {
  margin: 0 0 8px;
  color: #1f2933;
  font-size: 18px;
  font-weight: 650;
  line-height: 1.3;
  letter-spacing: 0;
}

.card-subtitle {
  margin: 0;
  color: #4b5563;
  font-size: 14px;
  line-height: 1.6;
}

.card-note {
  display: inline-flex;
  margin: 14px 0 0;
  padding: 5px 8px;
  border-radius: 6px;
  background: #f3f4f6;
  color: #374151;
  font-size: 12px;
  font-weight: 600;
}

@media (max-width: 768px) {
  .learning-page {
    padding: 20px 16px 36px;
  }

  .ecosystem-grid {
    grid-template-columns: 1fr;
    gap: 14px;
  }

  .core-card {
    min-height: 0;
    align-items: flex-start;
    gap: 16px;
    margin-bottom: 24px;
    padding: 20px;
  }

  .core-icon-wrap {
    width: 48px;
    height: 48px;
  }

  .core-icon {
    font-size: 24px;
  }

  .core-title {
    font-size: 20px;
  }

  .ecosystem-card {
    min-height: 156px;
    padding: 18px;
  }
}
</style>
