<template>
  <div :class="['basic-layout-wrapper', settings.theme]">
    <pro-layout
      :menus="menus"
      :collapsed="collapsed"
      :mediaQuery="query"
      :isMobile="isMobile"
      :handleMediaQuery="handleMediaQuery"
      :handleCollapse="handleCollapse"
      :i18nRender="i18nRender"
      v-bind="settings"
    >

      <template #menuHeaderRender>
        <div class="sidebar-logo-wrapper" :class="{ 'sidebar-logo-wrapper--collapsed': collapsed }">
          <div class="sidebar-text-logo" :title="collapsed ? 'PostSoma Core' : ''">
            <span v-if="collapsed">PS</span>
            <span v-else>PostSoma Core</span>
          </div>
        </div>
      </template>
      <!-- 1.0.0+ 版本 pro-layout 提供 API,
          增加 Header 左侧内容区自定义
    -->
      <template #headerContentRender>
        <div>
          <a-tooltip :title="$t('menu.header.refreshPage')">
            <a-icon type="reload" style="font-size: 18px;cursor: pointer;" @click="handleRefresh" />
          </a-tooltip>
        </div>
      </template>

      <template #rightContentRender>
        <right-content :top-menu="settings.layout === 'topmenu'" :is-mobile="isMobile" :theme="settings.theme" />
      </template>
      <!-- custom footer removed -->
      <template #footerRender>
        <div style="display: none;"></div>
      </template>
      <router-view :key="refreshKey" />
    </pro-layout>
  </div>
</template>

<script>
import { updateTheme } from '@/components/SettingDrawer/settingConfig'
import { i18nRender } from '@/locales'
import { mapState } from 'vuex'
import {
  CONTENT_WIDTH_TYPE,
  SIDEBAR_TYPE,
  TOGGLE_MOBILE_TYPE
} from '@/store/mutation-types'

import defaultSettings from '@/config/defaultSettings'
import RightContent from '@/components/GlobalHeader/RightContent'

export default {
  name: 'BasicLayout',
  components: {
    RightContent
    // GlobalFooter,
    // Ads
  },
  data () {
    return {
      // preview.pro.antdv.com only use.
      isProPreviewSite: process.env.VUE_APP_PREVIEW === 'true' && process.env.NODE_ENV !== 'development',
      // end
      isDev: process.env.NODE_ENV === 'development' || process.env.VUE_APP_PREVIEW === 'true',

      // base - menus moved to computed property
      // 侧栏收起状态
      collapsed: false,
      title: defaultSettings.title,
      settings: {
        // 布局类型
        layout: defaultSettings.layout, // 'sidemenu', 'topmenu'
        // CONTENT_WIDTH_TYPE
        contentWidth: defaultSettings.layout === 'sidemenu' ? CONTENT_WIDTH_TYPE.Fluid : defaultSettings.contentWidth,
        // 主题 'dark' | 'light'
        theme: defaultSettings.navTheme,
        // 主色调
        primaryColor: defaultSettings.primaryColor,
        fixedHeader: defaultSettings.fixedHeader,
        fixSiderbar: defaultSettings.fixSiderbar,
        colorWeak: defaultSettings.colorWeak,

        hideHintAlert: false,
        hideCopyButton: false
      },
      // 媒体查询
      query: {},

      // 是否手机模式
      isMobile: false,
      // 用于刷新内容区域的 key
      refreshKey: 0,
      // 是否是首次初始化主题色（用于决定是否显示"正在切换主题"提示）
      isInitialThemeColorLoad: true
    }
  },
  computed: {
    ...mapState({
      // 动态主路由
      mainMenu: state => state.permission.addRouters
    }),
    // 响应式菜单 - 根据 addRouters 动态更新
    menus () {
      const routes = this.mainMenu.find(item => item.path === '/')
      return (routes && routes.children) || []
    }
  },
  created () {
    // menus is now a computed property - no need to set here
    // 从 store 同步主题设置（从 localStorage 恢复）
    this.settings.theme = this.$store.state.app.theme
    this.settings.primaryColor = this.$store.state.app.color || defaultSettings.primaryColor
    // 处理侧栏收起状态
    this.$watch('collapsed', () => {
      this.$store.commit(SIDEBAR_TYPE, this.collapsed)
    })
    this.$watch('isMobile', () => {
      this.$store.commit(TOGGLE_MOBILE_TYPE, this.isMobile)
    })
    // 监听 store 中的主题变化，同步到 settings 和 body 类名
    this.$watch('$store.state.app.theme', (val) => {
      this.settings.theme = val
      if (val === 'dark' || val === 'realdark') {
        document.body.classList.add('dark')
        document.body.classList.remove('light')
      } else {
        document.body.classList.remove('dark')
        document.body.classList.add('light')
      }
    }, { immediate: true })
    // 监听 store 中的主题色变化，同步到 settings
    this.$watch('$store.state.app.color', (val) => {
      if (val) {
        this.settings.primaryColor = val
        // 应用主题色
        if (process.env.NODE_ENV !== 'production' || process.env.VUE_APP_PREVIEW === 'true') {
          // 首次加载时静默更新，不显示"正在切换主题"提示
          updateTheme(val, this.isInitialThemeColorLoad)
          // 首次调用后，将标志设为 false
          if (this.isInitialThemeColorLoad) {
            this.isInitialThemeColorLoad = false
          }
        }
      }
    }, { immediate: true })
    // 监听 settings.theme 变化，同步 body 类名（作为额外保障）
    this.$watch('settings.theme', (val) => {
      if (val === 'dark' || val === 'realdark') {
        document.body.classList.add('dark')
        document.body.classList.remove('light')
      } else {
        document.body.classList.remove('dark')
        document.body.classList.add('light')
      }
    }, { immediate: true })
  },
  mounted () {
    const userAgent = navigator.userAgent
    if (userAgent.indexOf('Edge') > -1) {
      this.$nextTick(() => {
        this.collapsed = !this.collapsed
        setTimeout(() => {
          this.collapsed = !this.collapsed
        }, 16)
      })
    }

    // first update color
    // TIPS: THEME COLOR HANDLER!! PLEASE CHECK THAT!!
    // 注意：主题色更新已在 created() 的 watch 中处理，这里不再重复调用
    // 避免显示两次"正在切换主题"提示
  },
  methods: {
    i18nRender,
    handleRefresh () {
      // 只刷新内容区域，通过改变 key 强制重新渲染 router-view
      this.refreshKey += 1
    },
    handleMediaQuery (val) {
      this.query = val
      if (this.isMobile && !val['screen-xs']) {
        this.isMobile = false
        return
      }
      if (!this.isMobile && val['screen-xs']) {
        this.isMobile = true
        this.collapsed = false
        this.settings.contentWidth = CONTENT_WIDTH_TYPE.Fluid
        // this.settings.fixSiderbar = false
      }
    },
    handleCollapse (val) {
      this.collapsed = val
    }
  }
}
</script>

<style lang="less">
@import "./BasicLayout.less";

.sidebar-logo-wrapper {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  height: 100%;
  padding: 0 16px;
  box-sizing: border-box;

  &--collapsed {
    justify-content: center;
    padding: 0 8px;
  }
}

.sidebar-text-logo {
  display: flex;
  align-items: center;
  min-width: 0;
  color: #1f2937;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
  font-size: 17px;
  font-weight: 600;
  letter-spacing: 0;
  line-height: 1;
  white-space: nowrap;
}

.sidebar-logo-wrapper--collapsed .sidebar-text-logo {
  justify-content: center;
  width: 34px;
  height: 34px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  color: #111827;
  font-size: 13px;
  font-weight: 700;
}

/deep/ .ant-pro-sider-menu-logo {
  display: flex;
  align-items: center;
  padding-left: 0 !important;
  padding-right: 0;

  > div {
    display: flex;
    align-items: center;
    width: 100%;
    height: 100%;
  }

  h1 {
    display: none !important;
  }
}

.ant-pro-sider-menu-sider.ant-layout-sider-collapsed /deep/ .ant-pro-sider-menu-logo {
  padding: 0 !important;
  justify-content: center;
}

.basic-layout-wrapper {
  min-height: 100vh;
  position: relative;

  .ant-layout-footer {
    display: none !important;
    height: 0 !important;
    padding: 0 !important;
    margin: 0 !important;
    border: none !important;
  }

  .ant-pro-sider,
  .ant-pro-sider-menu-sider,
  .ant-layout-sider {
    background: #ffffff !important;
    border-right: 1px solid #e5e7eb !important;
    box-shadow: none !important;
  }

  .ant-layout-header,
  .ant-pro-global-header {
    background: #ffffff !important;
    border-bottom: 1px solid #e5e7eb !important;
    box-shadow: none !important;
  }

  .ant-layout-sider-children {
    padding-bottom: 16px;
    overflow-y: auto;
    overflow-x: hidden;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: thin;
    scrollbar-color: rgba(0, 0, 0, 0.15) transparent;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0.15);
      border-radius: 3px;
    }

    body.dark &,
    body.realdark &,
    .ant-pro-layout.dark &,
    .ant-pro-layout.realdark & {
      scrollbar-color: rgba(255, 255, 255, 0.25) transparent;

      &::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.25);
      }
    }
  }

  .ant-pro-sider {
    height: 100vh;
    display: flex;
    flex-direction: column;

    .ant-layout-sider-children {
      flex: 1 1 auto;
      min-height: 0;
      display: flex;
      flex-direction: column;
    }

    .ant-pro-sider-menu,
    .ant-menu-root,
    .ant-menu {
      flex: 1 1 auto;
      min-height: 0;
      max-height: calc(100vh - 88px);
      overflow-y: auto !important;
      overflow-x: hidden;
      -webkit-overflow-scrolling: touch;
    }
  }

  .ant-menu-light {
    background: #ffffff !important;
    border-right: 0 !important;
  }

  .ant-menu-light .ant-menu-item,
  .ant-menu-light .ant-menu-submenu-title {
    color: #374151;
    border-radius: 6px;
    margin: 4px 8px;
    width: calc(100% - 16px);
  }

  .ant-menu-light .ant-menu-item-selected {
    background: #f3f4f6 !important;
    color: #111827 !important;
  }
}

/* 暗黑主题样式 */
.basic-layout-wrapper.dark,
.basic-layout-wrapper.realdark {
  /* Header 适配 - 与侧栏亮黑 #111 一致 + 顶缘内高光 */
  .ant-layout-header {
    background: #111111 !important;
    border-bottom: 1px solid #1c1c1c !important;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05) !important;
  }
  .ant-pro-global-header {
    background: #111111 !important;
    border-bottom: none !important;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05) !important;
    color: rgba(255, 255, 255, 0.85) !important;

    .ant-pro-global-header-trigger {
      color: rgba(255, 255, 255, 0.85) !important;
      &:hover {
        background: rgba(255, 255, 255, 0.06) !important;
      }
    }

    .action {
      color: rgba(255, 255, 255, 0.85) !important;
      &:hover {
        background: rgba(255, 255, 255, 0.06) !important;
      }
    }
  }

  /* Content 适配 */
  .ant-pro-basicLayout-content {
    background-color: #141414 !important;
  }

  /* 确保 Layout 本身也是深色 */
  .ant-layout {
    background-color: #141414 !important;
  }
}

@media (max-width: 768px) {
  .ant-drawer.ant-drawer-open {
    .ant-drawer-body {
      overflow-y: auto !important;
      overflow-x: hidden !important;
      padding-bottom: 16px !important;
      -webkit-overflow-scrolling: touch;
    }
  }
}

</style>
