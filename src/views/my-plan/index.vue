<template>
  <div class="my-plan-page">

    <!-- Page header -->
    <div class="page-header">
      <div class="header-main">
        <a-icon type="book" class="header-icon" />
        <div>
          <h1 class="page-title">{{ $t('myPlan.title') }}</h1>
          <p class="page-sub">{{ $t('myPlan.subtitle') }}</p>
        </div>
      </div>
      <p class="page-desc">
        {{ $t('myPlan.desc') }}
      </p>
    </div>

    <!-- Loading state -->
    <div v-if="plansLoading" class="state-box">
      <a-spin :tip="$t('myPlan.loading')" />
    </div>

    <!-- Error state -->
    <div v-else-if="plansError" class="state-box error-state">
      <a-icon type="warning" class="state-icon" />
      <p>{{ plansError }}</p>
      <a-button @click="loadPlans">{{ $t('myPlan.retry') }}</a-button>
    </div>

    <template v-else>
      <!-- Tabs -->
      <div class="plan-tabs-wrap">
        <a-tabs v-model="currentTab" @change="handleTabChange">
          <a-tab-pane key="active" :tab="$t('myPlan.tabs.active')" />
          <a-tab-pane key="paused" :tab="$t('myPlan.tabs.paused')" />
          <a-tab-pane key="completed" :tab="$t('myPlan.tabs.completed')" />
          <a-tab-pane key="archived" :tab="$t('myPlan.tabs.archived')" />
        </a-tabs>
      </div>

      <!-- Plan list -->
      <div v-if="plans.length > 0" class="plan-list">
        <div v-for="plan in plans" :key="plan.id" class="plan-card">
          <div class="plan-card-header">
            <div class="plan-meta">
              <span class="plan-symbol">{{ plan.symbol }}</span>
              <span class="plan-badge">{{ plan.asset_type }}</span>
              <span class="plan-type-badge">{{ plan.plan_type }}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <a-tag :color="statusColor(plan.status)" class="status-tag" style="margin-right: 0;">
                {{ statusLabel(plan.status) }}
              </a-tag>
              <a-dropdown placement="bottomRight">
                <a class="ant-dropdown-link" @click="e => e.preventDefault()" style="color: #9ca3af; padding: 4px;">
                  <a-icon type="ellipsis" style="font-size: 20px; transform: rotate(90deg);" />
                </a>
                <a-menu slot="overlay" @click="({ key }) => handleMenuClick(key, plan)">
                  <a-menu-item key="view">{{ $t('myPlan.menu.view') }}</a-menu-item>
                  <a-menu-item key="edit">{{ $t('myPlan.menu.edit') }}</a-menu-item>
                  <a-menu-divider />
                  <a-menu-item v-if="plan.status === 'active'" key="pause">{{ $t('myPlan.menu.pause') }}</a-menu-item>
                  <a-menu-item v-if="plan.status === 'paused'" key="activate">{{ $t('myPlan.menu.activate') }}</a-menu-item>
                  <a-menu-item v-if="['active', 'paused', 'completed'].includes(plan.status)" key="archive">{{ $t('myPlan.menu.archive') }}</a-menu-item>
                  <a-menu-item v-if="plan.status === 'archived'" key="pause">{{ $t('myPlan.menu.resumePaused') }}</a-menu-item>
                  <a-menu-divider />
                  <a-menu-item key="delete" style="color: #dc2626;">{{ $t('myPlan.menu.delete') }}</a-menu-item>
                </a-menu>
              </a-dropdown>
            </div>
          </div>

          <p v-if="plan.plan && plan.plan.plan_summary" class="plan-summary">
            {{ plan.plan.plan_summary }}
          </p>

          <!-- Budget allocation preview -->
          <div v-if="plan.plan && plan.plan.budget_allocation" class="budget-preview">
            <div class="bp-item">
              <span class="bp-label">{{ $t('myPlan.preview.basePool') }}</span>
              <span class="bp-amount">${{ formatMoney(plan.plan.budget_allocation.base_dca_pool && plan.plan.budget_allocation.base_dca_pool.amount) }}</span>
            </div>
            <div class="bp-divider" />
            <div class="bp-item">
              <span class="bp-label">{{ $t('myPlan.preview.reservePool') }}</span>
              <span class="bp-amount">${{ formatMoney(plan.plan.budget_allocation.opportunity_reserve && plan.plan.budget_allocation.opportunity_reserve.amount) }}</span>
            </div>
            <div class="bp-divider" />
            <div class="bp-item">
              <span class="bp-label">{{ $t('myPlan.preview.cashPool') }}</span>
              <span class="bp-amount">${{ formatMoney(plan.plan.budget_allocation.cash_buffer && plan.plan.budget_allocation.cash_buffer.amount) }}</span>
            </div>
          </div>

          <div class="plan-card-footer">
            <div class="plan-attrs">
              <span v-if="plan.total_budget">{{ $t('myPlan.preview.budget') }} ${{ formatMoney(plan.total_budget) }}</span>
              <span v-if="plan.duration">· {{ plan.duration }}</span>
              <span v-if="plan.frequency">· {{ plan.frequency }}</span>
              <span v-if="plan.risk_profile">· {{ plan.risk_profile }}</span>
            </div>
            <div class="plan-dates">
              <span v-if="plan.created_at">{{ $t('myPlan.preview.created') }} {{ formatDate(plan.created_at) }}</span>
              <span v-if="plan.next_review_at"> · {{ $t('myPlan.preview.review') }} {{ formatDate(plan.next_review_at) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty state — only shown when real list is empty -->
      <div v-else class="empty-section">
        <div class="empty-icon-wrap">
          <a-icon type="file-text" class="empty-icon" />
        </div>
        <h2 class="empty-title">{{ currentTab === 'active' ? $t('myPlan.empty.noActive') : (currentTab === 'archived' ? $t('myPlan.empty.noArchived') : $t('myPlan.empty.noRecords')) }}</h2>
        <p class="empty-body" v-if="currentTab === 'active'">
          {{ $t('myPlan.empty.desc') }}
        </p>
        <div class="empty-actions" v-if="currentTab === 'active'">
          <router-link to="/indicator-ide">
            <a-button type="primary" class="action-btn action-primary">
              <a-icon type="fund" />
              {{ $t('myPlan.empty.actionCreate') }}
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
              {{ $t('myPlan.empty.actionLearn') }}
            </a-button>
          </a>
        </div>
      </div>

      <div class="info-card">
        <h3 class="info-title">{{ $t('myPlan.edu.title') }}</h3>
        <div class="info-grid">
          <div class="info-item">
            <a-icon type="check-circle" class="info-check" />
            <div>
              <p class="info-item-title">{{ $t('myPlan.edu.item1.title') }}</p>
              <p class="info-item-desc">{{ $t('myPlan.edu.item1.desc') }}</p>
            </div>
          </div>
          <div class="info-item">
            <a-icon type="check-circle" class="info-check" />
            <div>
              <p class="info-item-title">{{ $t('myPlan.edu.item2.title') }}</p>
              <p class="info-item-desc">{{ $t('myPlan.edu.item2.desc') }}</p>
            </div>
          </div>
          <div class="info-item">
            <a-icon type="check-circle" class="info-check" />
            <div>
              <p class="info-item-title">{{ $t('myPlan.edu.item3.title') }}</p>
              <p class="info-item-desc">{{ $t('myPlan.edu.item3.desc') }}</p>
            </div>
          </div>
          <div class="info-item">
            <a-icon type="check-circle" class="info-check" />
            <div>
              <p class="info-item-title">{{ $t('myPlan.edu.item4.title') }}</p>
              <p class="info-item-desc">{{ $t('myPlan.edu.item4.desc') }}</p>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Plan Detail Drawer -->
    <plan-detail-drawer
      :visible.sync="detailVisible"
      :planId="activePlanId"
      @refresh="loadPlans"
    />

  </div>
</template>

<script>
import { getPlans, updatePlanStatus } from '@/api/plans'
import PlanDetailDrawer from './PlanDetailDrawer'

export default {
  name: 'MyPlan',
  components: {
    PlanDetailDrawer
  },
  data () {
    return {
      plans: [],
      currentTab: 'active',
      plansLoading: false,
      plansError: null,
      detailVisible: false,
      activePlanId: null
    }
  },
  mounted () {
    this.loadPlans()
  },
  watch: {
    '$store.getters.lang' () {
      this.loadPlans()
    }
  },
  methods: {
    handleTabChange () {
      this.loadPlans()
    },
    async loadPlans () {
      this.plansLoading = true
      this.plansError = null
      try {
        const res = await getPlans({ status: this.currentTab })
        if (res && res.code === 1) {
          this.plans = Array.isArray(res.data) ? res.data : []
        } else {
          throw new Error(res?.msg || 'Failed to load plans')
        }
      } catch (err) {
        console.error('loadPlans error:', err)
        this.plansError = this.$t('myPlan.message.loadFailed')
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
      return this.$t('myPlan.status.' + status)
    },
    handleMenuClick (key, plan) {
      if (key === 'view' || key === 'edit') {
        this.activePlanId = plan.id
        this.detailVisible = true
        return
      }

      if (key === 'pause') {
        this.$confirm({
          title: this.$t('myPlan.confirm.pause.title'),
          content: this.$t('myPlan.confirm.pause.content'),
          okText: this.$t('myPlan.confirm.pause.ok'),
          cancelText: this.$t('common.cancel'),
          onOk: () => this.doChangeStatus(plan, 'pause')
        })
      } else if (key === 'activate') {
        this.$confirm({
          title: this.$t('myPlan.confirm.activate.title'),
          content: this.$t('myPlan.confirm.activate.content'),
          okText: this.$t('myPlan.confirm.activate.ok'),
          cancelText: this.$t('common.cancel'),
          onOk: () => this.doChangeStatus(plan, 'activate')
        })
      } else if (key === 'archive') {
        this.$confirm({
          title: this.$t('myPlan.confirm.archive.title'),
          content: this.$t('myPlan.confirm.archive.content'),
          okText: this.$t('myPlan.confirm.archive.ok'),
          cancelText: this.$t('common.cancel'),
          onOk: () => this.doChangeStatus(plan, 'archive')
        })
      } else if (key === 'delete') {
        this.handleDeleteClick(plan)
      }
    },

    // Proper handler for Delete menu item
    handleDeleteClick (plan) {
      this.$confirm({
        title: this.$t('myPlan.confirm.delete.title'),
        content: this.$t('myPlan.confirm.delete.content'),
        okText: this.$t('myPlan.confirm.delete.ok'),
        okType: 'danger',
        cancelText: this.$t('myPlan.confirm.delete.cancel'),
        onOk: () => this.doChangeStatus(plan, 'delete'),
        onCancel: () => {
          this.doChangeStatus(plan, 'archive')
        }
      })
    },

    async doChangeStatus (plan, action) {
      const hide = this.$message.loading(this.$t('myPlan.message.processing'), 0)
      try {
        const res = await updatePlanStatus(plan.id, action)
        if (res && res.code === 1) {
          this.$message.success(this.$t('myPlan.message.success'))
          this.loadPlans() // Refresh list (optimistic or just reload)
        } else {
          this.$message.error(res?.msg || this.$t('myPlan.message.failed'))
        }
      } catch (err) {
        this.$message.error(this.$t('myPlan.message.failedRetry'))
        console.error(err)
      } finally {
        hide()
      }
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

// Tabs
.plan-tabs-wrap {
  margin-bottom: 8px;
  :deep(.ant-tabs-nav) {
    font-size: 15px;
    font-weight: 500;
  }
}

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
