<template>
  <div class="my-plan-page">

    <!-- Page header -->
    <div class="page-header">
      <div class="header-main">
        <a-icon type="book" class="header-icon" />
        <div>
          <h1 class="page-title">我的计划</h1>
          <p class="page-sub">My Plan</p>
        </div>
      </div>
      <p class="page-desc">
        保存你的长期 DCA 计划、分批买入计划和风险纪律。计划不是为了预测市场，
        而是帮助你在波动中坚持自己的规则。
      </p>
    </div>

    <!-- Loading state -->
    <div v-if="plansLoading" class="state-box">
      <a-spin tip="加载中..." />
    </div>

    <!-- Error state -->
    <div v-else-if="plansError" class="state-box error-state">
      <a-icon type="warning" class="state-icon" />
      <p>{{ plansError }}</p>
      <a-button @click="loadPlans">重试</a-button>
    </div>

    <!-- Plan list -->
    <template v-else-if="plans.length > 0">
      <div class="plan-list">
        <div v-for="plan in plans" :key="plan.id" class="plan-card">
          <div class="plan-card-header">
            <div class="plan-meta">
              <span class="plan-symbol">{{ plan.symbol }}</span>
              <span class="plan-badge">{{ plan.asset_type }}</span>
              <span class="plan-type-badge">{{ plan.plan_type }}</span>
            </div>
            <a-tag :color="statusColor(plan.status)" class="status-tag">
              {{ statusLabel(plan.status) }}
            </a-tag>
          </div>

          <p v-if="plan.plan && plan.plan.plan_summary" class="plan-summary">
            {{ plan.plan.plan_summary }}
          </p>

          <!-- Budget allocation preview -->
          <div v-if="plan.plan && plan.plan.budget_allocation" class="budget-preview">
            <div class="bp-item">
              <span class="bp-label">基础定投池</span>
              <span class="bp-amount">${{ formatMoney(plan.plan.budget_allocation.base_dca_pool && plan.plan.budget_allocation.base_dca_pool.amount) }}</span>
            </div>
            <div class="bp-divider" />
            <div class="bp-item">
              <span class="bp-label">回撤备用池</span>
              <span class="bp-amount">${{ formatMoney(plan.plan.budget_allocation.opportunity_reserve && plan.plan.budget_allocation.opportunity_reserve.amount) }}</span>
            </div>
            <div class="bp-divider" />
            <div class="bp-item">
              <span class="bp-label">现金缓冲</span>
              <span class="bp-amount">${{ formatMoney(plan.plan.budget_allocation.cash_buffer && plan.plan.budget_allocation.cash_buffer.amount) }}</span>
            </div>
          </div>

          <div class="plan-card-footer">
            <div class="plan-attrs">
              <span v-if="plan.total_budget">总预算 ${{ formatMoney(plan.total_budget) }}</span>
              <span v-if="plan.duration">· {{ plan.duration }}</span>
              <span v-if="plan.frequency">· {{ plan.frequency }}</span>
              <span v-if="plan.risk_profile">· {{ plan.risk_profile }}</span>
            </div>
            <div class="plan-dates">
              <span v-if="plan.created_at">创建于 {{ formatDate(plan.created_at) }}</span>
              <span v-if="plan.next_review_at"> · 复查 {{ formatDate(plan.next_review_at) }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Empty state — only shown when real list is empty -->
    <template v-else>
      <div class="empty-section">
        <div class="empty-icon-wrap">
          <a-icon type="file-text" class="empty-icon" />
        </div>
        <h2 class="empty-title">还没有保存的计划</h2>
        <p class="empty-body">
          你可以从 Trade Plan 创建一个分批买入计划，或先记录一个长期 DCA 计划。
        </p>
        <div class="empty-actions">
          <router-link to="/indicator-ide">
            <a-button type="primary" class="action-btn action-primary">
              <a-icon type="fund" />
              创建交易计划
            </a-button>
          </router-link>
          <a
            href="https://www.postsoma-2050.com/investing"
            target="_blank"
            rel="noopener noreferrer"
            style="display:inline-block;"
          >
            <a-button class="action-btn action-secondary">
              <a-icon type="read" />
              了解 DCA 计划
            </a-button>
          </a>
        </div>
      </div>

      <!-- Educational block shown even when empty -->
      <div class="info-card">
        <h3 class="info-title">什么是交易计划？</h3>
        <div class="info-grid">
          <div class="info-item">
            <a-icon type="check-circle" class="info-check" />
            <div>
              <p class="info-item-title">入场逻辑</p>
              <p class="info-item-desc">记录你买入的理由，而不是依赖直觉或消息。</p>
            </div>
          </div>
          <div class="info-item">
            <a-icon type="check-circle" class="info-check" />
            <div>
              <p class="info-item-title">失效条件</p>
              <p class="info-item-desc">预设什么情况代表这个计划的前提不再成立。</p>
            </div>
          </div>
          <div class="info-item">
            <a-icon type="check-circle" class="info-check" />
            <div>
              <p class="info-item-title">分批执行</p>
              <p class="info-item-desc">不一次全仓，而是根据计划分批买入，管理不确定性。</p>
            </div>
          </div>
          <div class="info-item">
            <a-icon type="check-circle" class="info-check" />
            <div>
              <p class="info-item-title">纪律回顾</p>
              <p class="info-item-desc">定期检视执行情况，而不是频繁修改计划。</p>
            </div>
          </div>
        </div>
      </div>
    </template>

  </div>
</template>

<script>
import { getPlans } from '@/api/plans'
import request from '@/utils/request'

export default {
  name: 'MyPlan',
  data () {
    return {
      plans: [],
      plansLoading: false,
      plansError: null
    }
  },
  mounted () {
    this.loadPlans()
  },
  methods: {
    async loadUserId () {
      try {
        const res = await request({ url: '/api/users/me', method: 'get' })
        if (res && res.data) return res.data.id || res.data.user_id || 1
      } catch (e) {
        return 1
      }
      return 1
    },
    async loadPlans () {
      this.plansLoading = true
      this.plansError = null
      try {
        const res = await getPlans()
        if (res && res.code === 1) {
          this.plans = Array.isArray(res.data) ? res.data : []
        } else {
          throw new Error(res?.msg || 'Failed to load plans')
        }
      } catch (err) {
        console.error('loadPlans error:', err)
        this.plansError = '暂时无法加载计划列表，请稍后重试。'
      } finally {
        this.plansLoading = false
      }
    },
    formatMoney (val) {
      if (!val) return '0'
      return Number(val).toLocaleString('en-US')
    },
    formatDate (val) {
      if (!val) return ''
      return String(val).slice(0, 10)
    },
    statusColor (status) {
      const map = {
        active: 'green',
        paused: 'orange',
        draft: 'blue',
        completed: 'purple',
        cancelled: 'red',
        archived: 'default'
      }
      return map[status] || 'default'
    },
    statusLabel (status) {
      const map = {
        active: '执行中',
        paused: '已暂停',
        draft: '草稿',
        completed: '已完成',
        cancelled: '已取消',
        archived: '已归档'
      }
      return map[status] || status
    }
  }
}
</script>

<style scoped lang="less">
.my-plan-page {
  padding: 24px 32px 48px;
  max-width: 960px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 28px;
}

// Page header
.page-header { padding-bottom: 4px; }

.header-main {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
}

.header-icon { font-size: 32px; color: #6366f1; }

.page-title { font-size: 24px; font-weight: 700; color: #111827; margin: 0; }
.page-sub { font-size: 13px; color: #9ca3af; margin: 2px 0 0; }
.page-desc { font-size: 15px; color: #4b5563; line-height: 1.7; margin: 0; max-width: 640px; }

// States
.state-box {
  background: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  padding: 64px 32px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.03);
}

.error-state .state-icon { font-size: 32px; color: #f59e0b; margin-bottom: 12px; }

// Plan list
.plan-list { display: flex; flex-direction: column; gap: 16px; }

.plan-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px 24px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  transition: box-shadow 0.2s;

  &:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
}

.plan-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.plan-meta { display: flex; align-items: center; gap: 8px; }

.plan-symbol {
  font-size: 20px;
  font-weight: 700;
  color: #111827;
}

.plan-badge, .plan-type-badge {
  background: #f3f4f6;
  color: #4b5563;
  font-size: 12px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 4px;
}

.plan-type-badge { background: #eff6ff; color: #3b82f6; }

.status-tag { font-size: 12px; border-radius: 4px; }

.plan-summary {
  font-size: 14px;
  color: #4b5563;
  line-height: 1.6;
  margin: 0 0 16px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

// Budget preview
.budget-preview {
  display: flex;
  align-items: center;
  gap: 0;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px 20px;
  margin-bottom: 16px;
}

.bp-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  text-align: center;
}

.bp-label { font-size: 11px; color: #9ca3af; font-weight: 500; }
.bp-amount { font-size: 15px; font-weight: 700; color: #111827; }

.bp-divider {
  width: 1px;
  height: 32px;
  background: #e5e7eb;
  margin: 0 12px;
}

.plan-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
}

.plan-attrs { font-size: 13px; color: #6b7280; }
.plan-dates { font-size: 12px; color: #9ca3af; }

// Empty state
.empty-section {
  background: #ffffff;
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  padding: 48px 32px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
}

.empty-icon-wrap {
  width: 72px;
  height: 72px;
  border-radius: 16px;
  background: rgba(99, 102, 241, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}

.empty-icon { font-size: 32px; color: #6366f1; }
.empty-title { font-size: 20px; font-weight: 600; color: #111827; margin: 0 0 12px; }
.empty-body { font-size: 14px; color: #6b7280; line-height: 1.7; max-width: 400px; margin: 0 auto 28px; }

.empty-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }

.action-btn {
  border-radius: 8px;
  height: 40px;
  padding: 0 20px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.action-secondary {
  border-color: #e8e8e8;
  color: #374151;
  &:hover { border-color: #6366f1; color: #6366f1; }
}

// Info card
.info-card {
  background: #ffffff;
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  padding: 28px 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
}

.info-title { font-size: 16px; font-weight: 600; color: #111827; margin: 0 0 20px; }

.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }

.info-item { display: flex; gap: 12px; align-items: flex-start; }

.info-check { font-size: 16px; color: #10b981; margin-top: 2px; flex-shrink: 0; }

.info-item-title { font-size: 14px; font-weight: 600; color: #111827; margin: 0 0 4px; }
.info-item-desc { font-size: 13px; color: #6b7280; line-height: 1.6; margin: 0; }

@media (max-width: 700px) {
  .my-plan-page { padding: 16px 16px 40px; }
  .info-grid { grid-template-columns: 1fr; }
  .header-main { gap: 12px; }
  .page-title { font-size: 20px; }
  .budget-preview { flex-direction: column; gap: 12px; }
  .bp-divider { width: 100%; height: 1px; margin: 4px 0; }
}
</style>
