<template>
  <div class="learning-page">

    <!-- Page Header -->
    <div class="page-header">
      <div class="header-main">
        <a-icon type="read" class="header-icon" />
        <div>
          <h1 class="page-title">{{ $t('learning.title') }}</h1>
          <p class="page-sub">{{ $t('learning.subtitle') }}</p>
        </div>
      </div>
    </div>

    <!-- Section 1: Core Framework -->
    <div class="section-label">{{ $t('learning.corePlatformKicker') }}</div>
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
        <h2 class="core-title">{{ corePlatform.title }}</h2>
        <p class="core-subtitle">{{ corePlatform.subtitle }}</p>
      </div>
      <a-icon type="export" class="core-external" />
    </a>

    <!-- Section 2: Connected Workspaces -->
    <div class="section-heading">
      <h2>{{ $t('learning.ecosystemTitle') }}</h2>
      <p>{{ $t('learning.ecosystemSubtitle') }}</p>
    </div>

    <div class="ecosystem-grid">
      <a
        v-for="workspace in workspaces"
        :key="workspace.title"
        class="ecosystem-card"
        :href="workspace.url"
        target="_blank"
        rel="noopener noreferrer"
      >
        <div class="card-top">
          <div class="platform-icon">
            <a-icon :type="workspace.icon" />
          </div>
          <a-icon type="export" class="external-icon" />
        </div>
        <div class="card-body">
          <h2 class="card-title">{{ workspace.title }}</h2>
          <p class="card-subtitle">{{ workspace.subtitle }}</p>
        </div>
        <div class="card-meta">{{ workspace.badge }}</div>
      </a>
    </div>

    <!-- Section 3: Library & Notes -->
    <div class="section-heading section-heading--library">
      <h2>{{ $t('learning.libraryTitle') }}</h2>
      <p>{{ $t('learning.librarySubtitle') }}</p>
    </div>

    <div class="library-grid">
      <a
        v-for="item in library"
        :key="item.title"
        class="library-card"
        :href="item.url"
        target="_blank"
        rel="noopener noreferrer"
        @click="handleLibraryClick($event, item)"
      >
        <div class="card-top">
          <div class="platform-icon platform-icon--library">
            <a-icon :type="item.icon" />
          </div>
          <a-icon type="export" class="external-icon" />
        </div>
        <div class="card-body">
          <h2 class="card-title">{{ item.title }}</h2>
          <p class="card-subtitle">{{ item.subtitle }}</p>
          <span v-if="item.note" class="card-note">{{ item.note }}</span>
        </div>
        <div class="card-meta card-meta--library">{{ item.badge }}</div>
      </a>
    </div>

  </div>
</template>

<script>
export default {
  name: 'Learning',
  computed: {
    corePlatform () {
      return {
        title: 'QuantBrew Investing',
        subtitle: this.$t('learning.corePlatform.subtitle'),
        url: 'https://www.postsoma-2050.com/investing'
      }
    },
    workspaces () {
      return [
        {
          icon: 'read',
          title: 'NewsHub',
          subtitle: this.$t('learning.platforms.newshub.subtitle'),
          badge: this.$t('learning.externalBadge'),
          url: 'https://205077.xyz/'
        },
        {
          icon: 'tool',
          title: 'AI Skills',
          subtitle: this.$t('learning.platforms.aiskills.subtitle'),
          badge: this.$t('learning.externalBadge'),
          url: 'https://205055.xyz/'
        },
        {
          icon: 'book',
          title: 'ReadSelah',
          subtitle: this.$t('learning.platforms.readselah.subtitle'),
          badge: this.$t('learning.readingBadge'),
          url: 'https://www.readselah.org/'
        }
      ]
    },
    library () {
      return [
        {
          icon: 'book',
          title: 'postsoma-2050 library',
          subtitle: this.$t('learning.platforms.books.subtitle'),
          note: this.$t('learning.platforms.books.note'),
          badge: this.$t('learning.referenceBadge'),
          url: 'https://postsomabooks.qzz.io/'
        }
      ]
    }
  },
  methods: {
    async handleLibraryClick (event, item) {
      if (item.title === 'postsoma-2050 library') {
        event.preventDefault()
        const accessCode = '3yyD9R4tUa8y'
        let copied = false

        // 1. Try Navigator Clipboard API
        try {
          if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(accessCode)
            copied = true
          }
        } catch (err) {
          console.warn('Navigator clipboard API failed, trying fallback:', err)
        }

        // 2. Fallback Selection & Copy Method
        if (!copied) {
          try {
            const textArea = document.createElement('textarea')
            textArea.value = accessCode
            textArea.style.position = 'fixed'
            textArea.style.top = '-9999px'
            textArea.style.left = '-9999px'
            textArea.style.opacity = '0'
            document.body.appendChild(textArea)
            textArea.focus()
            textArea.select()
            copied = document.execCommand('copy')
            document.body.removeChild(textArea)
          } catch (fallbackErr) {
            console.error('Fallback clipboard copy failed:', fallbackErr)
          }
        }

        // 3. User Feedback & Redirect
        if (copied) {
          const successMsg = this.$t('learning.platforms.books.copySuccess') || '访问密码已复制，正在前往图书馆...'
          this.$message.success(successMsg)
          setTimeout(() => {
            window.open(item.url, '_blank', 'noopener,noreferrer')
          }, 800)
        } else {
          const failedMsg = this.$t('learning.platforms.books.copyFailed') || '自动复制受限，即将打开图书馆，请手动输入访问码。'
          this.$message.warning(failedMsg)
          setTimeout(() => {
            window.open(item.url, '_blank', 'noopener,noreferrer')
          }, 1200)
        }
      }
    }
  }
}
</script>

<style scoped lang="less">
.learning-page {
  width: 100%;
  max-width: 1080px;
  margin: 0 auto;
  padding: 32px 32px 56px;
}

/* ── Page Header ─────────────────────────────── */
.page-header {
  margin-bottom: 28px;
}

.header-main {
  display: flex;
  align-items: center;
  gap: 14px;
}

.header-icon {
  width: 40px;
  height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: var(--color-surface-2);
  color: var(--color-text);
  font-size: 20px;
  border: 1px solid var(--color-border);
}

.page-title {
  margin: 0;
  color: var(--color-text);
  font-size: 26px;
  font-weight: 650;
  letter-spacing: 0;
}

.page-sub {
  margin: 3px 0 0;
  color: var(--color-text-muted);
  font-size: 13px;
  line-height: 1.5;
}

/* ── Section Labels ──────────────────────────── */
.section-label {
  margin: 0 0 10px;
  color: var(--color-primary);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.section-heading {
  margin: 32px 0 14px;

  h2 {
    margin: 0;
    color: var(--color-text);
    font-size: 15px;
    font-weight: 650;
    letter-spacing: 0;
  }

  p {
    margin: 3px 0 0;
    color: var(--color-text-muted);
    font-size: 12px;
    line-height: 1.5;
  }
}

.section-heading--library {
  margin-top: 36px;
}

/* ── Core Framework Card ─────────────────────── */
.core-card {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 4px;
  padding: 24px 26px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-surface);
  color: inherit;
  text-decoration: none;
  transition: border-color 0.18s ease, background 0.18s ease, color 0.18s ease;

  &:hover {
    border-color: var(--color-primary);
    background: var(--color-surface-2);
    color: inherit;
    text-decoration: none;

    .core-external {
      color: var(--color-text);
      transform: translate(2px, -2px);
    }
  }
}

.core-icon-wrap {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 8px;
  background: var(--color-text);
  color: var(--color-surface);
}

.core-icon {
  font-size: 26px;
}

.core-body {
  min-width: 0;
  flex: 1;
}

.core-title {
  margin: 0 0 6px;
  color: var(--color-text);
  font-size: 22px;
  font-weight: 650;
  line-height: 1.25;
  letter-spacing: 0;
}

.core-subtitle {
  margin: 0;
  color: var(--color-text-muted);
  font-size: 14px;
  line-height: 1.6;
}

.core-external {
  align-self: flex-start;
  color: var(--color-text-faint);
  font-size: 15px;
  transition: color 0.18s ease, transform 0.18s ease;
}

/* ── Workspace Grid (3 cards) ────────────────── */
.ecosystem-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

/* ── Library Grid (1 card, narrower) ─────────── */
.library-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

/* ── Shared Card Styles ──────────────────────── */
.ecosystem-card,
.library-card {
  display: flex;
  flex-direction: column;
  padding: 20px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-surface);
  color: inherit;
  text-decoration: none;
  transition: border-color 0.18s ease, background 0.18s ease, color 0.18s ease;

  &:hover {
    border-color: var(--color-primary);
    background: var(--color-surface-2);
    color: inherit;
    text-decoration: none;

    .external-icon {
      color: var(--color-text-muted);
      transform: translate(2px, -2px);
    }
  }
}

.library-card {
  border-color: var(--color-border);
  background: var(--color-surface-2);

  &:hover {
    border-color: var(--color-primary);
    background: var(--color-surface-offset);
  }
}

.card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.platform-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: rgba(29, 111, 79, 0.08);
  color: var(--color-primary);
  border: 1px solid rgba(29, 111, 79, 0.15);
  font-size: 18px;
  line-height: 1;
}

.platform-icon--library {
  background: var(--color-surface-offset);
  color: var(--color-text-muted);
  border-color: var(--color-border);
}

.external-icon {
  color: var(--color-text-faint);
  font-size: 14px;
  transition: color 0.18s ease, transform 0.18s ease;
}

.card-body {
  min-width: 0;
  flex: 1;
}

.card-title {
  margin: 0 0 6px;
  color: var(--color-text);
  font-size: 16px;
  font-weight: 650;
  line-height: 1.3;
  letter-spacing: 0;
}

.card-subtitle {
  margin: 0;
  color: var(--color-text-muted);
  font-size: 13px;
  line-height: 1.6;
}

.card-note {
  display: inline-flex;
  margin: 12px 0 0;
  padding: 4px 8px;
  border-radius: 5px;
  background: var(--color-surface-offset);
  color: var(--color-text-muted);
  font-size: 11.5px;
  font-weight: 600;
  font-family: 'SF Mono', 'Fira Mono', monospace;
  letter-spacing: 0.02em;
}

/* ── Card Metadata Badge ─────────────────────── */
.card-meta {
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid var(--color-divider);
  color: var(--color-text-faint);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.card-meta--library {
  border-top-color: var(--color-divider);
  color: var(--color-text-faint);
}

/* ── Responsive ──────────────────────────────── */
@media (max-width: 900px) {
  .ecosystem-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .learning-page {
    padding: 20px 16px 36px;
  }

  .ecosystem-grid,
  .library-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .core-card {
    gap: 16px;
    padding: 20px;
  }

  .core-icon-wrap {
    width: 46px;
    height: 46px;
  }

  .core-icon {
    font-size: 22px;
  }

  .core-title {
    font-size: 19px;
  }
}
</style>
