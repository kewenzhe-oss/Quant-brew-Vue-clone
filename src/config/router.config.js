// eslint-disable-next-line
import { UserLayout, BasicLayout, BlankLayout } from '@/layouts'

export const asyncRouterMap = [
  {
    path: '/',
    name: 'index',
    component: BasicLayout,
    meta: { title: 'menu.home' },
    redirect: '/dashboard',
    children: [
      // 1. Dashboard / 今日概览
      // NOTE: Today.vue is the active page. index.vue is frozen legacy — do not delete.
      {
        path: '/dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/Today'),
        meta: { title: 'menu.dashboard.today', keepAlive: false, icon: 'home', permission: ['dashboard'] }
      },
      // 2. Asset Snapshot / 资产速览（路径保留 /ai-asset-analysis）
      {
        path: '/ai-asset-analysis',
        name: 'AIAssetAnalysis',
        component: () => import('@/views/ai-asset-analysis'),
        meta: { title: 'menu.assetSnapshot', keepAlive: false, icon: 'appstore', permission: ['dashboard'] }
      },
      // 3. Stock Research / 股票研究
      {
        path: '/stock-research',
        name: 'StockResearch',
        component: () => import('@/views/stock-research'),
        meta: { title: 'menu.stockResearch', keepAlive: false, icon: 'area-chart', permission: ['dashboard'] }
      },
      // 4. Trade Plan / 交易计划（路径保留 /indicator-ide，禁止修改）
      {
        path: '/indicator-ide',
        name: 'IndicatorIDE',
        component: () => import('@/views/trade-plan/index.vue'),
        meta: { title: 'menu.tradePlan', keepAlive: true, icon: 'fund', permission: ['dashboard'] }
      },
      // 5. My Plan / 我的计划
      {
        path: '/my-plan',
        name: 'MyPlan',
        component: () => import('@/views/my-plan'),
        meta: { title: 'menu.myPlan', keepAlive: false, icon: 'book', permission: ['dashboard'] }
      },
      // 6. Learning / 学习中心
      {
        path: '/learning',
        name: 'Learning',
        component: () => import('@/views/learning'),
        meta: { title: 'menu.learning', keepAlive: false, icon: 'read', permission: ['dashboard'] }
      },
      // 7. Profile / 个人中心
      {
        path: '/profile',
        name: 'Profile',
        component: () => import('@/views/profile'),
        meta: { title: 'menu.myProfile', keepAlive: false, icon: 'user', permission: ['dashboard'] }
      },
      // 8. Settings / 设置 (admin only)
      {
        path: '/settings',
        name: 'Settings',
        component: () => import('@/views/settings'),
        meta: { title: 'menu.settings', keepAlive: false, icon: 'setting', permission: ['admin'] }
      },

      // ── Hidden routes (路由保留，侧边栏不显示) ──────────────────────────

      // Daily Briefing（隐藏：产品 2.0 不在导航显示，保留路由确保直接访问不报错）
      {
        path: '/briefing',
        name: 'DailyBriefing',
        component: () => import('@/views/daily-briefing'),
        hidden: true,
        meta: { title: 'menu.briefing', keepAlive: false, icon: 'read', permission: ['dashboard'] }
      },
      // Macro Intelligence（隐藏）
      {
        path: '/macro',
        name: 'MacroIntelligence',
        component: () => import('@/views/macro-intelligence'),
        hidden: true,
        meta: { title: 'menu.macro', keepAlive: false, icon: 'global', permission: ['dashboard'] }
      },
      // Macro Domain（隐藏，从 Macro 卡片跳入）
      {
        path: '/macro/:domain',
        name: 'MacroDomain',
        component: () => import('@/views/macro-intelligence/domain'),
        hidden: true,
        meta: { title: 'menu.macro', keepAlive: false, permission: ['dashboard'] }
      },
      // Billing / 会员充值（隐藏，可从 Profile 内访问）
      {
        path: '/billing',
        name: 'Billing',
        component: () => import('@/views/billing'),
        hidden: true,
        meta: { title: 'menu.billing', keepAlive: false, icon: 'wallet', permission: ['dashboard'] }
      },
      // User Manage (admin only, hidden)
      {
        path: '/user-manage',
        name: 'UserManage',
        component: () => import('@/views/user-manage'),
        hidden: true,
        meta: { title: 'menu.userManage', keepAlive: false, icon: 'team', permission: ['admin'] }
      },
      // AI Analysis（隐藏，被 ai-asset-analysis 内嵌为子组件，禁止删除）
      {
        path: '/ai-analysis/:pageNo([1-9]\\d*)?',
        name: 'Analysis',
        component: () => import('@/views/ai-analysis'),
        hidden: true,
        meta: { title: 'menu.dashboard.analysis', keepAlive: false, icon: 'thunderbolt', permission: ['dashboard'] }
      },
      // Legacy Indicator IDE / 高级技术分析工作区 (reconnected route to fix 404)
      {
        path: '/legacy-indicator-ide',
        name: 'LegacyIndicatorIde',
        component: () => import('@/views/indicator-ide'),
        hidden: true,
        meta: { title: 'Technical Workspace', keepAlive: true, icon: 'line-chart', permission: ['dashboard'] }
      }

      // ── Legacy / Frozen Routes ──────────────────────────────────────────
      // QuantBrew keeps the app focused on observation, research, planning and review.
      // Execution/trading-terminal routes are intentionally frozen and excluded from the active route tree.
      // Do not re-enable without product review.
      /*
      ,
      // Indicator Community / 指标市场（隐藏）
      {
        path: '/indicator-community',
        name: 'IndicatorCommunity',
        component: () => import('@/views/indicator-community'),
        hidden: true,
        meta: { title: 'menu.dashboard.community', keepAlive: false, icon: 'shop', permission: ['dashboard'] }
      },
      // Strategy & Live（隐藏）
      {
        path: '/strategy-live',
        name: 'StrategyLive',
        component: () => import('@/views/trading-assistant'),
        hidden: true,
        meta: {
          title: 'menu.dashboard.tradingAssistant',
          keepAlive: true,
          icon: 'deployment-unit',
          permission: ['dashboard'],
          indicatorSignalOnly: true
        }
      },
      // Python Script Strategy（隐藏）
      {
        path: '/strategy-script',
        name: 'StrategyScript',
        component: () => import('@/views/trading-assistant'),
        hidden: true,
        meta: {
          title: 'menu.dashboard.tradingBot',
          keepAlive: false,
          scriptStrategiesOnly: true
        }
      },
      {
        path: '/strategy-scripts',
        redirect: '/strategy-live',
        hidden: true
      },
      // Trading Bot（隐藏）
      {
        path: '/trading-bot',
        name: 'TradingBot',
        component: () => import('@/views/trading-bot'),
        hidden: true,
        meta: { title: 'menu.dashboard.tradingBot', keepAlive: true, icon: 'robot', permission: ['dashboard'] }
      },
      // Portfolio（隐藏）
      {
        path: '/portfolio',
        name: 'Portfolio',
        component: () => import('@/views/portfolio'),
        hidden: true,
        meta: { title: 'menu.dashboard.portfolio', keepAlive: true, icon: 'fund', permission: ['dashboard'] }
      },

      // ── Legacy compatibility redirects ──────────────────────────────────
      {
        path: '/indicator-analysis',
        name: 'Indicator',
        redirect: '/indicator-ide',
        hidden: true,
        meta: { title: 'menu.dashboard.indicator', keepAlive: false, icon: 'line-chart', permission: ['dashboard'] }
      },
      {
        path: '/backtest-center',
        name: 'BacktestCenter',
        redirect: '/indicator-ide',
        hidden: true,
        meta: { title: 'menu.dashboard.backtestCenter', keepAlive: false, icon: 'experiment', permission: ['dashboard'] }
      },
      {
        path: '/trading-assistant',
        name: 'TradingAssistant',
        redirect: '/strategy-live',
        hidden: true,
        meta: { title: 'menu.dashboard.tradingAssistant', keepAlive: false, icon: 'deployment-unit', permission: ['dashboard'] }
      }
      */
    ]
  },
  {
    path: '*',
    redirect: '/404',
    hidden: true
  }
]

/**
 * 基础路由
 * @type { *[] }
 */
export const constantRouterMap = [
  {
    path: '/user',
    component: UserLayout,
    redirect: '/user/login',
    hidden: true,
    children: [
      {
        path: 'login',
        name: 'login',
        component: () => import(/* webpackChunkName: "user" */ '@/views/user/Login')
      }
    ]
  },

  {
    path: '/404',
    component: () => import(/* webpackChunkName: "fail" */ '@/views/exception/404')
  }
]
