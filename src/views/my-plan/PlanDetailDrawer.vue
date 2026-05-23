<template>
  <a-drawer
    :title="$t('myPlan.drawer.title')"
    width="640"
    :visible="visible"
    @close="onClose"
    :bodyStyle="{ paddingBottom: '80px' }"
  >
    <a-spin :spinning="loading">
      <div v-if="!planData" style="text-align: center; padding: 40px;">
        <a-empty :description="$t('myPlan.drawer.loadFailed')" />
      </div>
      <div v-else>
        <!-- Header Section -->
        <div class="plan-header">
          <div class="plan-title">
            <h2>{{ (planData.symbol || '').toUpperCase() }}</h2>
            <a-tag color="blue">{{ planData.plan_type }}</a-tag>
            <a-tag :color="statusColor">{{ statusLabel }}</a-tag>
          </div>

          <div class="plan-actions" v-if="!isEditMode && canEdit">
            <a-button type="primary" icon="edit" @click="isEditMode = true">{{ $t('myPlan.drawer.editSettings') }}</a-button>
          </div>
        </div>

        <a-divider />

        <!-- View Mode -->
        <div v-if="!isEditMode">
          <!-- Basic Info -->
          <a-descriptions :title="$t('myPlan.drawer.basicConfig')" :column="2" bordered size="small">
            <a-descriptions-item :label="$t('myPlan.drawer.totalBudget')">${{ formatMoney(planData.total_budget) }}</a-descriptions-item>
            <a-descriptions-item :label="$t('myPlan.drawer.frequency')">{{ planData.frequency || 'N/A' }}</a-descriptions-item>
            <a-descriptions-item :label="$t('myPlan.drawer.duration')">{{ planData.duration || 'N/A' }}</a-descriptions-item>
            <a-descriptions-item :label="$t('myPlan.drawer.riskProfile')">{{ planData.risk_profile || 'N/A' }}</a-descriptions-item>
          </a-descriptions>

          <div v-if="planData.thesis" class="thesis-section mt-4">
            <h4>{{ $t('myPlan.drawer.myNotes') }}</h4>
            <p>{{ planData.thesis }}</p>
          </div>

          <a-divider />

          <!-- AI Generated Logic -->
          <div v-if="aiPlan" class="ai-plan-section">
            <h3 class="section-title">{{ $t('myPlan.drawer.executionStrategy') }}</h3>

            <a-card size="small" class="mb-4 bg-gray-50">
              <p class="summary-text">{{ aiPlan.plan_summary }}</p>
            </a-card>

            <!-- Budget Allocation Breakdown -->
            <div v-if="aiPlan.budget_allocation" class="mb-4">
              <h4>{{ $t('myPlan.drawer.budgetRules') }}</h4>
              <a-row :gutter="16">
                <a-col :span="8" v-if="aiPlan.budget_allocation.base_dca_pool">
                  <a-card size="small" :title="$t('myPlan.drawer.baseInvestment')">
                    <div class="amount-text">${{ formatMoney(aiPlan.budget_allocation.base_dca_pool.amount) }} ({{ aiPlan.budget_allocation.base_dca_pool.percentage }}%)</div>
                    <div class="explain-text">{{ aiPlan.budget_allocation.base_dca_pool.explanation }}</div>
                  </a-card>
                </a-col>
                <a-col :span="8" v-if="aiPlan.budget_allocation.opportunity_reserve">
                  <a-card size="small" :title="$t('myPlan.drawer.drawdownPool')">
                    <div class="amount-text">${{ formatMoney(aiPlan.budget_allocation.opportunity_reserve.amount) }} ({{ aiPlan.budget_allocation.opportunity_reserve.percentage }}%)</div>
                    <div class="explain-text">{{ aiPlan.budget_allocation.opportunity_reserve.explanation }}</div>
                  </a-card>
                </a-col>
                <a-col :span="8" v-if="aiPlan.budget_allocation.cash_buffer">
                  <a-card size="small" :title="$t('myPlan.drawer.cashBuffer')">
                    <div class="amount-text">${{ formatMoney(aiPlan.budget_allocation.cash_buffer.amount) }} ({{ aiPlan.budget_allocation.cash_buffer.percentage }}%)</div>
                    <div class="explain-text">{{ aiPlan.budget_allocation.cash_buffer.explanation }}</div>
                  </a-card>
                </a-col>
              </a-row>
            </div>

            <!-- DCA Schedule: per-period investment amounts -->
            <div v-if="aiPlan.budget_schedule && aiPlan.budget_schedule.length > 0" class="mb-4">
              <h4>{{ $t('myPlan.drawer.dcaSchedule') }}</h4>
              <div class="dca-schedule-note">{{ $t('myPlan.drawer.dcaNote', { frequency: planData.frequency || 'regular' }) }}</div>
              <a-table
                :dataSource="aiPlan.budget_schedule"
                :columns="dcaScheduleColumns"
                :pagination="false"
                size="small"
                :rowKey="(r, i) => i"
                class="dca-schedule-table mt-2"
              >
                <template slot="amount" slot-scope="amount">
                  <span class="dca-amount">${{ formatMoney(amount) }}</span>
                </template>
              </a-table>
            </div>

            <!-- Rules -->
            <div v-if="aiPlan.action_rules" class="mb-4">
              <h4>{{ $t('myPlan.drawer.actionRules') }}</h4>
              <div v-if="aiPlan.action_rules.continue_when && aiPlan.action_rules.continue_when.length > 0">
                <h5>{{ $t('myPlan.drawer.continueWhen') }}</h5>
                <ul><li v-for="(rule, idx) in aiPlan.action_rules.continue_when" :key="'c'+idx">{{ rule }}</li></ul>
              </div>
              <div v-if="aiPlan.action_rules.pause_when && aiPlan.action_rules.pause_when.length > 0">
                <h5>{{ $t('myPlan.drawer.pauseWhen') }}</h5>
                <ul><li v-for="(rule, idx) in aiPlan.action_rules.pause_when" :key="'p'+idx">{{ rule }}</li></ul>
              </div>
              <div v-if="aiPlan.action_rules.use_reserve_when && aiPlan.action_rules.use_reserve_when.length > 0">
                <h5>{{ $t('myPlan.drawer.useReserveWhen') }}</h5>
                <ul><li v-for="(rule, idx) in aiPlan.action_rules.use_reserve_when" :key="'u'+idx">{{ rule }}</li></ul>
              </div>
            </div>

            <!-- Scenarios -->
            <div v-if="aiPlan.scenario_simulation" class="mb-4">
              <h4>{{ $t('myPlan.drawer.scenarios') }}</h4>
              <a-collapse :bordered="false">
                <a-collapse-panel key="1" :header="$t('myPlan.drawer.scenarios.base')">
                  <p>{{ aiPlan.scenario_simulation.base_case }}</p>
                </a-collapse-panel>
                <a-collapse-panel key="2" :header="$t('myPlan.drawer.scenarios.stress')">
                  <p>{{ aiPlan.scenario_simulation.stress_case }}</p>
                </a-collapse-panel>
                <a-collapse-panel key="3" :header="$t('myPlan.drawer.scenarios.upside')">
                  <p>{{ aiPlan.scenario_simulation.upside_or_fast_rise_case }}</p>
                </a-collapse-panel>
                <a-collapse-panel key="4" :header="$t('myPlan.drawer.scenarios.sideways')">
                  <p>{{ aiPlan.scenario_simulation.sideways_case }}</p>
                </a-collapse-panel>
              </a-collapse>
            </div>

            <div v-if="aiPlan.disclaimer" class="disclaimer-text">
              {{ aiPlan.disclaimer }}
            </div>
          </div>
        </div>

        <div v-else class="edit-mode-section">
          <a-form-model :model="editForm" :rules="rules" ref="ruleForm" layout="vertical">
            <a-form-model-item :label="$t('myPlan.drawer.totalBudget') + ' ($)'" prop="total_budget">
              <a-input-number v-model="editForm.total_budget" :min="1" style="width: 100%" />
            </a-form-model-item>

            <a-form-model-item :label="$t('myPlan.drawer.frequency')" prop="frequency">
              <a-input v-model="editForm.frequency" :placeholder="$t('myPlan.drawer.frequencyPlaceholder')" />
            </a-form-model-item>

            <a-form-model-item :label="$t('myPlan.drawer.duration')" prop="duration">
              <a-input v-model="editForm.duration" :placeholder="$t('myPlan.drawer.durationPlaceholder')" />
            </a-form-model-item>

            <a-form-model-item :label="$t('myPlan.drawer.myNotes')" prop="thesis">
              <a-textarea v-model="editForm.thesis" :rows="4" :placeholder="$t('myPlan.drawer.thesisPlaceholder')" />
            </a-form-model-item>
          </a-form-model>

          <div class="edit-actions mt-4" style="text-align: right;">
            <a-button @click="isEditMode = false" style="margin-right: 8px;">{{ $t('myPlan.drawer.cancel') }}</a-button>
            <a-button type="primary" :loading="saving" @click="handleSave">{{ $t('myPlan.drawer.saveChanges') }}</a-button>
          </div>
        </div>

      </div>
    </a-spin>
  </a-drawer>
</template>

<script>
import { getPlan, updatePlan } from '@/api/plans'

export default {
  name: 'PlanDetailDrawer',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    planId: {
      type: [String, Number],
      default: null
    }
  },
  data () {
    return {
      loading: false,
      saving: false,
      planData: null,
      isEditMode: false,
      editForm: {
        total_budget: null,
        frequency: '',
        duration: '',
        thesis: ''
      }
    }
  },
  computed: {
    rules () {
      return {
        total_budget: [{ required: true, message: this.$t('myPlan.drawer.rules.budgetRequired'), trigger: 'blur' }]
      }
    },
    dcaScheduleColumns () {
      return [
        {
          title: this.$t('myPlan.drawer.columns.period'),
          dataIndex: 'period',
          key: 'period'
        },
        {
          title: this.$t('myPlan.drawer.columns.amount'),
          dataIndex: 'amount',
          key: 'amount',
          scopedSlots: { customRender: 'amount' }
        },
        {
          title: this.$t('myPlan.drawer.columns.note'),
          dataIndex: 'note',
          key: 'note',
          ellipsis: true
        }
      ]
    },
    aiPlan () {
      return this.planData?.plan || null
    },
    statusColor () {
      if (!this.planData) return 'default'
      const map = {
        active: 'green',
        paused: 'orange',
        draft: 'blue',
        completed: 'purple',
        cancelled: 'red',
        archived: 'default'
      }
      return map[this.planData.status] || 'default'
    },
    statusLabel () {
      if (!this.planData) return ''
      return this.$t('myPlan.status.' + this.planData.status)
    },
    canEdit () {
      // Cannot edit if deleted or completed or archived
      if (!this.planData) return false
      return !['deleted', 'completed', 'archived'].includes(this.planData.status)
    }
  },
  watch: {
    '$store.getters.lang' () {
      if (this.visible && this.planId) {
        this.fetchPlanDetails()
      }
    },
    visible (val) {
      if (val && this.planId) {
        this.isEditMode = false
        this.fetchPlanDetails()
      } else if (!val) {
        // Reset when closed
        setTimeout(() => {
          this.planData = null
          this.isEditMode = false
        }, 300)
      }
    }
  },
  methods: {
    formatMoney (val) {
      if (!val && val !== 0) return '0'
      return Number(val).toLocaleString()
    },
    onClose () {
      this.$emit('update:visible', false)
      this.$emit('close')
    },
    fetchPlanDetails () {
      this.loading = true
      getPlan(this.planId).then(res => {
        if (res.code === 1) {
          this.planData = res.data
          // init edit form
          this.editForm = {
            total_budget: this.planData.total_budget,
            frequency: this.planData.frequency,
            duration: this.planData.duration,
            thesis: this.planData.thesis
          }
        } else {
          this.$message.error(res.msg || this.$t('myPlan.drawer.loadFailed'))
        }
      }).catch(err => {
        this.$message.error(this.$t('myPlan.drawer.apiError'))
        console.error(err)
      }).finally(() => {
        this.loading = false
      })
    },
    handleSave () {
      this.$refs.ruleForm.validate(valid => {
        if (valid) {
          this.saving = true
          updatePlan(this.planId, this.editForm).then(res => {
            if (res.code === 1) {
              this.$message.success(this.$t('myPlan.drawer.updateSuccess'))
              this.isEditMode = false
              this.fetchPlanDetails() // Refresh local data
              this.$emit('refresh') // Tell parent to refresh list
            } else {
              this.$message.error(res.msg || this.$t('myPlan.drawer.updateFailed'))
            }
          }).catch(err => {
            this.$message.error(this.$t('myPlan.drawer.apiError'))
            console.error(err)
          }).finally(() => {
            this.saving = false
          })
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>
.plan-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .plan-title {
    display: flex;
    align-items: center;
    gap: 12px;

    h2 {
      margin: 0;
      font-weight: 700;
    }
  }
}

.mt-4 {
  margin-top: 16px;
}
.mb-4 {
  margin-bottom: 16px;
}
.bg-gray-50 {
  background-color: #f9fafb;
}

.thesis-section {
  padding: 16px;
  background: #f0fdf4;
  border-radius: 8px;
  border: 1px solid #bbf7d0;

  h4 {
    color: #166534;
    font-weight: 600;
    margin-top: 0;
  }
  p {
    margin: 0;
    color: #15803d;
  }
}

.section-title {
  margin-top: 24px;
  margin-bottom: 16px;
  font-weight: 600;
  border-left: 4px solid #1890ff;
  padding-left: 8px;
}

.summary-text {
  margin: 0;
  font-size: 15px;
  color: #374151;
  line-height: 1.6;
}

h4 {
  font-weight: 600;
  margin-bottom: 12px;
}
h5 {
  font-weight: 600;
  color: #4b5563;
  margin-top: 8px;
  margin-bottom: 4px;
}
ul {
  padding-left: 20px;
  li {
    color: #4b5563;
    margin-bottom: 4px;
  }
}

.amount-text {
  font-size: 18px;
  font-weight: 700;
  color: #111827;
}
.explain-text {
  font-size: 13px;
  color: #6b7280;
  margin-top: 8px;
}

.disclaimer-text {
  margin-top: 32px;
  font-size: 12px;
  color: #9ca3af;
  text-align: center;
  padding: 16px;
  background: #f3f4f6;
  border-radius: 6px;
}

.dca-schedule-note {
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 8px;
}

.dca-amount {
  font-weight: 700;
  color: #1890ff;
  font-size: 15px;
}

.dca-schedule-table {
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  overflow: hidden;
}
</style>
