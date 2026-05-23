<template>
  <div class="trade-plan-container">
    <div class="tp-header">
      <h1 class="tp-title">{{ $t('tradePlan.title') }}</h1>
      <p class="tp-subtitle">
        {{ $t('tradePlan.subtitle') }}
      </p>
    </div>

    <div class="tp-content-layout">
      <!-- Left Column: Form -->
      <div class="tp-form-col">
        <a-card class="tp-card" :bordered="false" :title="$t('tradePlan.configTitle')">
          <a-form-model :model="form" :label-col="{ span: 24 }" :wrapper-col="{ span: 24 }">

            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-model-item :label="$t('tradePlan.symbolLabel')">
                  <a-input v-model="form.symbol" :placeholder="$t('tradePlan.symbolPlaceholder')" size="large" />
                </a-form-model-item>
              </a-col>
              <a-col :span="12">
                <a-form-model-item :label="$t('tradePlan.assetTypeLabel')">
                  <a-select v-model="form.assetType" size="large">
                    <a-select-option value="Stock">Stock</a-select-option>
                    <a-select-option value="ETF">ETF</a-select-option>
                    <a-select-option value="Crypto">Crypto</a-select-option>
                  </a-select>
                </a-form-model-item>
              </a-col>
            </a-row>

            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-model-item :label="$t('tradePlan.planTypeLabel')">
                  <a-select v-model="form.planType" size="large">
                    <a-select-option value="Long-term DCA">{{ $t('tradePlan.planType.longTermDca') }}</a-select-option>
                    <a-select-option value="Staged Entry">{{ $t('tradePlan.planType.stagedEntry') }}</a-select-option>
                    <a-select-option value="Risk Control">{{ $t('tradePlan.planType.riskControl') }}</a-select-option>
                  </a-select>
                </a-form-model-item>
              </a-col>
              <a-col :span="12">
                <a-form-model-item :label="$t('tradePlan.budgetLabel')">
                  <a-input-number v-model="form.budget" style="width: 100%" size="large" :min="0" placeholder="0.00" />
                </a-form-model-item>
              </a-col>
            </a-row>

            <a-row :gutter="16">
              <a-col :span="8">
                <a-form-model-item :label="$t('tradePlan.durationLabel')">
                  <a-select v-model="form.duration" size="large">
                    <a-select-option value="3 months">3 months</a-select-option>
                    <a-select-option value="6 months">6 months</a-select-option>
                    <a-select-option value="12 months">12 months</a-select-option>
                    <a-select-option value="24 months">24 months</a-select-option>
                  </a-select>
                </a-form-model-item>
              </a-col>
              <a-col :span="8">
                <a-form-model-item :label="$t('tradePlan.frequencyLabel')">
                  <a-select v-model="form.frequency" size="large">
                    <a-select-option value="Weekly">Weekly</a-select-option>
                    <a-select-option value="Bi-weekly">Bi-weekly</a-select-option>
                    <a-select-option value="Monthly">Monthly</a-select-option>
                  </a-select>
                </a-form-model-item>
              </a-col>
              <a-col :span="8">
                <a-form-model-item :label="$t('tradePlan.riskLabel')">
                  <a-select v-model="form.riskProfile" size="large">
                    <a-select-option value="Conservative">{{ $t('tradePlan.risk.conservative') }}</a-select-option>
                    <a-select-option value="Balanced">{{ $t('tradePlan.risk.balanced') }}</a-select-option>
                    <a-select-option value="Aggressive">{{ $t('tradePlan.risk.aggressive') }}</a-select-option>
                  </a-select>
                </a-form-model-item>
              </a-col>
            </a-row>

            <a-form-model-item :label="$t('tradePlan.thesisLabel')">
              <a-textarea
                v-model="form.thesis"
                :rows="4"
                :placeholder="$t('tradePlan.thesisPlaceholder')"
              />
            </a-form-model-item>

          </a-form-model>
        </a-card>
      </div>

      <!-- Right Column: Sidebar / Action -->
      <div class="tp-sidebar-col">
        <a-card class="tp-card tp-action-card" :bordered="false">
          <h3 class="action-title">{{ $t('tradePlan.sidebar.title') }}</h3>
          <ul class="action-list">
            <li><a-icon type="check-circle" class="list-icon" /> {{ $t('tradePlan.sidebar.item1') }}</li>
            <li><a-icon type="check-circle" class="list-icon" /> {{ $t('tradePlan.sidebar.item2') }}</li>
            <li><a-icon type="check-circle" class="list-icon" /> {{ $t('tradePlan.sidebar.item3') }}</li>
            <li><a-icon type="check-circle" class="list-icon" /> {{ $t('tradePlan.sidebar.item4') }}</li>
          </ul>

          <div class="tp-disclaimer">
            <a-icon type="warning" />
            <span>{{ $t('tradePlan.disclaimer') }}</span>
          </div>

          <a-button
            type="primary"
            size="large"
            block
            class="generate-btn"
            :disabled="!isValid || loading"
            :loading="loading"
            @click="handleGenerate"
          >
            {{ loading ? $t('tradePlan.button.generating') : $t('tradePlan.button.generate') }}
          </a-button>
          <div v-if="error" style="color: #dc2626; font-size: 13px; margin-top: 12px;">
            <a-icon type="close-circle" /> {{ error }}
          </div>
        </a-card>

        <a-card class="tp-card tp-tech-card" :bordered="false">
          <h3 class="action-title">{{ $t('tradePlan.tech.title') }}</h3>
          <p class="tw-desc">
            {{ $t('tradePlan.tech.desc') }}
          </p>
          <p class="tw-desc tw-note">
            {{ $t('tradePlan.tech.note') }}
          </p>
          <router-link to="/legacy-indicator-ide">
            <a-button type="dashed" block class="tw-btn">
              {{ $t('tradePlan.tech.button') }}
            </a-button>
          </router-link>
        </a-card>
      </div>
    </div>

    <!-- Generated Draft Section -->
    <div v-if="draft" class="tp-draft-section">
      <a-card class="tp-card" :bordered="false" :title="$t('tradePlan.draft.title')">
        <div class="draft-grid">
          <div class="draft-main">
            <h3 class="draft-title">{{ $t('tradePlan.draft.summary') }}</h3>
            <p class="draft-text">{{ draft.plan_summary }}</p>

            <h3 class="draft-title" v-if="draft.budget_allocation">{{ $t('tradePlan.draft.budgetAllocation') }}</h3>
            <a-row :gutter="16" v-if="draft.budget_allocation" style="margin-bottom: 24px;">
              <a-col :span="8">
                <div class="budget-card base-pool">
                  <div class="bc-title">{{ $t('tradePlan.draft.basePool') }}</div>
                  <div class="bc-amount">${{ formatMoney(draft.budget_allocation.base_dca_pool.amount) }} <span class="bc-pct">({{ draft.budget_allocation.base_dca_pool.percentage }}%)</span></div>
                  <div class="bc-desc">{{ draft.budget_allocation.base_dca_pool.explanation }}</div>
                </div>
              </a-col>
              <a-col :span="8">
                <div class="budget-card reserve-pool">
                  <div class="bc-title">{{ $t('tradePlan.draft.reservePool') }}</div>
                  <div class="bc-amount">${{ formatMoney(draft.budget_allocation.opportunity_reserve.amount) }} <span class="bc-pct">({{ draft.budget_allocation.opportunity_reserve.percentage }}%)</span></div>
                  <div class="bc-desc">{{ draft.budget_allocation.opportunity_reserve.explanation }}</div>
                </div>
              </a-col>
              <a-col :span="8">
                <div class="budget-card cash-pool">
                  <div class="bc-title">{{ $t('tradePlan.draft.cashPool') }}</div>
                  <div class="bc-amount">${{ formatMoney(draft.budget_allocation.cash_buffer.amount) }} <span class="bc-pct">({{ draft.budget_allocation.cash_buffer.percentage }}%)</span></div>
                  <div class="bc-desc">{{ draft.budget_allocation.cash_buffer.explanation }}</div>
                </div>
              </a-col>
            </a-row>

            <h3 class="draft-title">{{ $t('tradePlan.draft.cadence') }}</h3>
            <p class="draft-text">{{ draft.dca_cadence }}</p>

            <h3 class="draft-title" v-if="draft.budget_schedule && draft.budget_schedule.length">{{ $t('tradePlan.draft.schedule') }}</h3>
            <a-table
              v-if="draft.budget_schedule && draft.budget_schedule.length"
              :dataSource="draft.budget_schedule"
              :columns="budgetColumns"
              size="small"
              :pagination="false"
              class="draft-table"
              rowKey="period"
            />

            <h3 class="draft-title" v-if="draft.action_rules">{{ $t('tradePlan.draft.actionRules') }}</h3>
            <div v-if="draft.action_rules" class="action-rules-section">
              <div class="rule-group" v-if="draft.action_rules.continue_when && draft.action_rules.continue_when.length">
                <h4><a-icon type="check-circle" style="color: #10b981; margin-right: 6px;" />{{ $t('tradePlan.draft.rules.continue') }}</h4>
                <ul class="draft-list">
                  <li v-for="(r, i) in draft.action_rules.continue_when" :key="'c'+i">{{ r }}</li>
                </ul>
              </div>
              <div class="rule-group" v-if="draft.action_rules.pause_when && draft.action_rules.pause_when.length">
                <h4><a-icon type="pause-circle" style="color: #f59e0b; margin-right: 6px;" />{{ $t('tradePlan.draft.rules.pause') }}</h4>
                <ul class="draft-list">
                  <li v-for="(r, i) in draft.action_rules.pause_when" :key="'p'+i">{{ r }}</li>
                </ul>
              </div>
              <div class="rule-group" v-if="draft.action_rules.use_reserve_when && draft.action_rules.use_reserve_when.length">
                <h4><a-icon type="thunderbolt" style="color: #8b5cf6; margin-right: 6px;" />{{ $t('tradePlan.draft.rules.reserve') }}</h4>
                <ul class="draft-list">
                  <li v-for="(r, i) in draft.action_rules.use_reserve_when" :key="'u'+i">{{ r }}</li>
                </ul>
              </div>
              <div class="rule-group" v-if="draft.action_rules.review_when && draft.action_rules.review_when.length">
                <h4><a-icon type="search" style="color: #3b82f6; margin-right: 6px;" />{{ $t('tradePlan.draft.rules.review') }}</h4>
                <ul class="draft-list">
                  <li v-for="(r, i) in draft.action_rules.review_when" :key="'r'+i">{{ r }}</li>
                </ul>
              </div>
            </div>

            <h3 class="draft-title" v-if="draft.staged_entry_rules && draft.staged_entry_rules.length">{{ $t('tradePlan.draft.stagedEntry') }}</h3>
            <ul class="draft-list" v-if="draft.staged_entry_rules && draft.staged_entry_rules.length">
              <li v-for="(rule, idx) in draft.staged_entry_rules" :key="idx">{{ rule }}</li>
            </ul>
          </div>

          <div class="draft-side">
            <h3 class="draft-title" v-if="draft.asset_specific_checklist && draft.asset_specific_checklist.length">{{ $t('tradePlan.draft.checklist') }}</h3>
            <ul class="draft-list" v-if="draft.asset_specific_checklist && draft.asset_specific_checklist.length">
              <li v-for="(item, idx) in draft.asset_specific_checklist" :key="idx">{{ item }}</li>
            </ul>

            <h3 class="draft-title">{{ $t('tradePlan.draft.invalidation') }}</h3>
            <ul class="draft-list">
              <li v-for="(cond, idx) in draft.invalidation_conditions" :key="idx">{{ cond }}</li>
            </ul>

            <h3 class="draft-title">{{ $t('tradePlan.draft.cashReserve') }}</h3>
            <p class="draft-text">{{ draft.cash_reserve_suggestion }}</p>

            <h3 class="draft-title">{{ $t('tradePlan.draft.riskReminder') }}</h3>
            <ul class="draft-list">
              <li v-for="(risk, idx) in draft.risk_notes" :key="idx">{{ risk }}</li>
            </ul>

            <h3 class="draft-title">{{ $t('tradePlan.draft.reviewFreq') }}</h3>
            <p class="draft-text">{{ draft.review_frequency }}</p>
          </div>
        </div>

        <div class="draft-scenarios" v-if="draft.scenario_simulation">
          <h3 class="draft-title">{{ $t('tradePlan.draft.scenarios') }}</h3>
          <a-row :gutter="16">
            <a-col :span="6">
              <div class="scenario-box">
                <h4>{{ $t('tradePlan.draft.scenarios.base') }}</h4>
                <p>{{ draft.scenario_simulation.base_case }}</p>
              </div>
            </a-col>
            <a-col :span="6">
              <div class="scenario-box">
                <h4>{{ $t('tradePlan.draft.scenarios.upside') }}</h4>
                <p>{{ draft.scenario_simulation.upside_or_fast_rise_case }}</p>
              </div>
            </a-col>
            <a-col :span="6">
              <div class="scenario-box">
                <h4>{{ $t('tradePlan.draft.scenarios.sideways') }}</h4>
                <p>{{ draft.scenario_simulation.sideways_case }}</p>
              </div>
            </a-col>
            <a-col :span="6">
              <div class="scenario-box">
                <h4>{{ $t('tradePlan.draft.scenarios.stress') }}</h4>
                <p>{{ draft.scenario_simulation.stress_case }}</p>
              </div>
            </a-col>
          </a-row>
        </div>

        <div class="draft-disclaimer">
          <a-icon type="info-circle" />
          {{ draft.disclaimer || $t('tradePlan.draft.disclaimer') }}
        </div>

        <div class="save-section">
          <a-button
            v-if="!saved"
            type="primary"
            size="large"
            :loading="saving"
            :disabled="saving"
            class="save-btn"
            @click="handleSave"
          >
            <a-icon type="save" />
            {{ saving ? $t('tradePlan.button.saving') : $t('tradePlan.button.save') }}
          </a-button>
          <div v-if="saved" class="save-success">
            <a-icon type="check-circle" /> {{ $t('tradePlan.saveSuccess') }}
            <router-link to="/my-plan" class="view-plan-link">{{ $t('tradePlan.viewPlan') }}</router-link>
          </div>
          <div v-if="saveError" class="save-error">
            <a-icon type="close-circle" /> {{ saveError }}
          </div>
        </div>
      </a-card>
    </div>
  </div>
</template>

<script>
import { generatePlan, savePlan } from '@/api/plans'
import request from '@/utils/request'

export default {
  name: 'TradePlan',
  data () {
    return {
      form: {
        symbol: '',
        assetType: 'Stock',
        planType: 'Long-term DCA',
        budget: null,
        duration: '12 months',
        frequency: 'Monthly',
        riskProfile: 'Balanced',
        thesis: ''
      },
      loading: false,
      error: null,
      saving: false,
      saved: false,
      saveError: null,
      draft: null
    }
  },
  computed: {
    isValid () {
      const f = this.form
      return f.symbol.trim() !== '' &&
             f.assetType &&
             f.planType &&
             f.budget > 0 &&
             f.duration &&
             f.frequency &&
             f.riskProfile
    },
    budgetColumns () {
      return [
        { title: this.$t('tradePlan.draft.columns.period'), dataIndex: 'period', key: 'period' },
        { title: this.$t('tradePlan.draft.columns.amount'), dataIndex: 'amount', key: 'amount' },
        { title: this.$t('tradePlan.draft.columns.note'), dataIndex: 'note', key: 'note' }
      ]
    }
  },
  watch: {
    '$i18n.locale' () {
      // Clear draft when locale switches to prevent displaying a stale draft in the wrong language
      this.draft = null
      this.saved = false
      this.saveError = null
      this.error = null
    }
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
    formatMoney (val) {
      if (!val) return '0'
      return Number(val).toLocaleString('en-US')
    },
    async handleGenerate () {
      if (!this.isValid) return

      this.loading = true
      this.error = null
      this.draft = null

      this.saved = false
      this.saveError = null

      try {
        const payload = {
          symbol: this.form.symbol,
          asset_type: this.form.assetType,
          plan_type: this.form.planType,
          total_budget: this.form.budget,
          duration: this.form.duration,
          frequency: this.form.frequency,
          risk_profile: this.form.riskProfile,
          thesis: this.form.thesis,
          locale: this.$i18n.locale || 'zh-CN'
        }

        const res = await generatePlan(payload)

        if (res && res.code === 1 && res.data) {
          this.draft = res.data
        } else {
          throw new Error(res?.msg || 'Failed to generate plan')
        }
      } catch (err) {
        console.error('Plan generation error:', err)
        this.error = this.$t('tradePlan.error.generate')
      } finally {
        this.loading = false
      }
    },
    async handleSave () {
      if (!this.draft || this.saving) return
      this.saving = true
      this.saveError = null
      this.saved = false
      try {
        const userId = await this.loadUserId()
        const payload = {
          userid: userId,
          symbol: this.form.symbol,
          asset_type: this.form.assetType,
          plan_type: this.form.planType,
          status: 'active',
          total_budget: this.form.budget,
          duration: this.form.duration,
          frequency: this.form.frequency,
          risk_profile: this.form.riskProfile,
          thesis: this.form.thesis,
          plan: this.draft
        }
        const res = await savePlan(payload)
        if (res && res.code === 1) {
          this.saved = true
        } else {
          throw new Error(res?.msg || 'Save failed')
        }
      } catch (err) {
        console.error('Plan save error:', err)
        this.saveError = this.$t('tradePlan.error.save')
      } finally {
        this.saving = false
      }
    }
  }
}
</script>

<style lang="less" scoped>
.trade-plan-container {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
  color: #111827;
}

.tp-header {
  margin-bottom: 24px;
}

.tp-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #111827;
}

.tp-subtitle {
  font-size: 14px;
  color: #6b7280;
  max-width: 800px;
  line-height: 1.5;
}

.tp-content-layout {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.tp-form-col {
  flex: 1;
  min-width: 0;
}

.tp-sidebar-col {
  width: 340px;
  flex-shrink: 0;
}

.tp-card {
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  background: #fff;
  overflow: hidden;

  /deep/ .ant-card-head {
    border-bottom: 1px solid #f3f4f6;
    padding: 0 24px;
    min-height: 56px;
    .ant-card-head-title {
      font-size: 16px;
      font-weight: 600;
      color: #111827;
      padding: 16px 0;
    }
  }

  /deep/ .ant-card-body {
    padding: 24px;
  }
}

.tp-action-card {
  /deep/ .ant-card-body {
    padding: 24px;
  }
}

.action-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #111827;
}

.action-list {
  list-style: none;
  padding: 0;
  margin: 0 0 24px 0;

  li {
    display: flex;
    align-items: flex-start;
    margin-bottom: 12px;
    font-size: 14px;
    color: #4b5563;
    line-height: 1.5;

    .list-icon {
      color: #10b981;
      margin-right: 8px;
      margin-top: 3px;
    }
  }
}

.tp-disclaimer {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  background: #fffbeb;
  border-left: 3px solid #f59e0b;
  padding: 12px;
  border-radius: 4px;
  font-size: 12px;
  color: #92400e;
  margin-bottom: 24px;
  line-height: 1.5;

  i {
    color: #f59e0b;
    margin-top: 2px;
  }
}

.generate-btn {
  height: 48px;
  font-size: 16px;
  font-weight: 500;
  border-radius: 8px;
}

/* Form Styling overrides for cleaner look */
/deep/ .ant-form-item-label {
  line-height: 1.5;
  padding-bottom: 4px;
  label {
    font-size: 13px;
    font-weight: 500;
    color: #374151;
  }
}

/deep/ .ant-input, /deep/ .ant-select-selection {
  border-radius: 6px;
}

@media (max-width: 800px) {
  .tp-content-layout {
    flex-direction: column;
  }
  .tp-sidebar-col {
    width: 100%;
  }

  // Force form columns to take full width on mobile viewports
  /deep/ .ant-col-12,
  /deep/ .ant-col-8 {
    width: 100% !important;
    float: none !important;
  }
}

.tp-tech-card {
  margin-top: 24px;
}

.tw-desc {
  font-size: 13px;
  color: #4b5563;
  line-height: 1.6;
  margin-bottom: 12px;
}

.tw-note {
  color: #9ca3af;
  font-size: 12px;
}

.tw-btn {
  height: 40px;
  font-weight: 500;
  border-color: #d1d5db;
  color: #374151;
  border-radius: 8px;

  &:hover {
    border-color: #9ca3af;
    color: #111827;
  }
}

/* Draft Section Styles */
.tp-draft-section {
  margin-top: 24px;
}

.draft-grid {
  display: flex;
  gap: 32px;
  margin-bottom: 32px;
}

.draft-main {
  flex: 2;
}

.draft-side {
  flex: 1;
}

.draft-title {
  font-size: 15px;
  font-weight: 600;
  color: #111827;
  margin-top: 24px;
  margin-bottom: 8px;
  padding-bottom: 4px;
  border-bottom: 1px solid #f3f4f6;

  &:first-child {
    margin-top: 0;
  }
}

.draft-text {
  font-size: 14px;
  color: #4b5563;
  line-height: 1.6;
  margin-bottom: 16px;
}

.draft-list {
  padding-left: 20px;
  margin-bottom: 16px;

  li {
    font-size: 14px;
    color: #4b5563;
    line-height: 1.6;
    margin-bottom: 6px;
  }
}

.draft-table {
  margin-bottom: 16px;
}

.draft-scenarios {
  margin-top: 24px;
  margin-bottom: 24px;
}

.scenario-box {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  height: 100%;

  h4 {
    font-size: 14px;
    font-weight: 600;
    color: #374151;
    margin-bottom: 8px;
  }

  p {
    font-size: 13px;
    color: #4b5563;
    line-height: 1.5;
    margin: 0;
  }
}

.draft-disclaimer {
  background: #f3f4f6;
  padding: 12px 16px;
  border-radius: 6px;
  font-size: 12px;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 24px;

  i {
    font-size: 14px;
  }
}

.budget-card {
  padding: 16px;
  border-radius: 8px;
  height: 100%;
}
.base-pool { background: #f0fdf4; border: 1px solid #bbf7d0; }
.reserve-pool { background: #eff6ff; border: 1px solid #bfdbfe; }
.cash-pool { background: #fef2f2; border: 1px solid #fecaca; }

.bc-title { font-size: 13px; color: #4b5563; font-weight: 600; margin-bottom: 8px; }
.bc-amount { font-size: 20px; font-weight: 700; color: #111827; margin-bottom: 8px; }
.bc-pct { font-size: 13px; font-weight: 500; color: #6b7280; }
.bc-desc { font-size: 12px; color: #6b7280; line-height: 1.5; }

.action-rules-section { margin-top: 16px; }
.rule-group h4 { font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 8px; margin-top: 16px; }

.save-section {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #f3f4f6;
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.save-btn {
  height: 44px;
  font-size: 15px;
  font-weight: 500;
  border-radius: 8px;
}

.save-success {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #10b981;
  font-weight: 500;

  i { font-size: 16px; }
}

.view-plan-link {
  color: #6366f1;
  font-weight: 600;
  text-decoration: none;
  &:hover { text-decoration: underline; }
}

.save-error {
  font-size: 13px;
  color: #dc2626;
  display: flex;
  align-items: center;
  gap: 6px;
}

@media (max-width: 800px) {
  .draft-grid {
    flex-direction: column;
    gap: 16px;
  }

  // Force budget cards and scenario panels to stack vertically on mobile browsers
  /deep/ .draft-main .ant-row > .ant-col-8 {
    width: 100% !important;
    margin-bottom: 12px;
  }
  /deep/ .draft-scenarios .ant-row > .ant-col-6 {
    width: 100% !important;
    margin-bottom: 12px;
  }
}
</style>
