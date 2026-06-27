<template>
  <a-drawer
    :title="$t('learning.realestate.drawerTitle')"
    width="720"
    :visible="visible"
    :body-style="{ paddingBottom: '80px', background: 'var(--color-bg)', color: 'var(--color-text)' }"
    @close="onClose"
    :destroyOnClose="false"
  >
    <a-tabs v-model="activeTab" @change="handleTabChange" class="sandbox-tabs">
      <!-- Tab 1: Return Outlook (Acquisition & Debt) -->
      <a-tab-pane key="returns" :tab="$t('learning.realestate.tabReturn')">
        <a-form-model layout="vertical" :model="form" class="sandbox-form">
          <h4 style="margin-top: 0; margin-bottom: 12px; font-weight: 600; color: var(--color-text);">{{ $t('learning.realestate.sectionAcquisition') }}</h4>
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-model-item :label="$t('learning.realestate.purchasePrice')">
                <a-input-number
                  v-model="form.purchasePrice"
                  :min="0"
                  :formatter="value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                  :parser="value => value.replace(/\$\s?|(,*)/g, '')"
                  style="width: 100%"
                />
              </a-form-model-item>
            </a-col>
            <a-col :span="12">
              <a-form-model-item :label="$t('learning.realestate.arv')">
                <a-input-number
                  v-model="form.arv"
                  :min="0"
                  :formatter="value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                  :parser="value => value.replace(/\$\s?|(,*)/g, '')"
                  style="width: 100%"
                />
              </a-form-model-item>
            </a-col>
          </a-row>

          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-model-item :label="$t('learning.realestate.closingCosts')">
                <a-input-number
                  v-model="form.closingCosts"
                  :min="0"
                  :formatter="value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                  :parser="value => value.replace(/\$\s?|(,*)/g, '')"
                  style="width: 100%"
                />
              </a-form-model-item>
            </a-col>
            <a-col :span="12">
              <a-form-model-item :label="$t('learning.realestate.repairCost')">
                <a-input-number
                  v-model="form.repairCost"
                  :min="0"
                  :formatter="value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                  :parser="value => value.replace(/\$\s?|(,*)/g, '')"
                  style="width: 100%"
                />
              </a-form-model-item>
            </a-col>
          </a-row>

          <h4 style="margin-top: 16px; margin-bottom: 12px; font-weight: 600; color: var(--color-text);">{{ $t('learning.realestate.sectionFinancing') }}</h4>
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-model-item :label="$t('learning.realestate.isCashPurchase')">
                <a-radio-group v-model="form.isCashPurchase" style="width: 100%">
                  <a-radio-button :value="true" style="width: 50%; text-align: center">
                    {{ $t('learning.realestate.isCashPurchase') }}
                  </a-radio-button>
                  <a-radio-button :value="false" style="width: 50%; text-align: center">
                    {{ $t('learning.realestate.mortgage') }}
                  </a-radio-button>
                </a-radio-group>
              </a-form-model-item>
            </a-col>
          </a-row>

          <!-- Mortgage parameters exposed directly -->
          <a-row :gutter="16" v-if="!form.isCashPurchase">
            <a-col :span="12">
              <a-form-model-item :label="$t('learning.realestate.downPaymentPercent')">
                <a-input-number
                  v-model="form.downPaymentPercent"
                  :min="0"
                  :max="100"
                  style="width: 100%"
                />
              </a-form-model-item>
            </a-col>
            <a-col :span="12">
              <a-form-model-item :label="$t('learning.realestate.interestRate')">
                <a-input-number
                  v-model="form.interestRate"
                  :min="0"
                  :step="0.01"
                  style="width: 100%"
                />
              </a-form-model-item>
            </a-col>
            <a-col :span="12">
              <a-form-model-item :label="$t('learning.realestate.loanTermYears')">
                <a-input-number
                  v-model="form.loanTermYears"
                  :min="1"
                  :max="100"
                  style="width: 100%"
                />
              </a-form-model-item>
            </a-col>
            <a-col :span="12">
              <a-form-model-item :label="$t('learning.realestate.loanPointsPercent')">
                <a-input-number
                  v-model="form.loanPointsPercent"
                  :min="0"
                  :step="0.1"
                  style="width: 100%"
                />
              </a-form-model-item>
            </a-col>
          </a-row>
          <div style="text-align: right; margin-top: 12px; margin-bottom: 12px;">
            <a-button size="small" class="reset-btn" @click="handleReset">
              <a-icon type="reload" /> {{ $t('learning.asset.btnReset') }}
            </a-button>
          </div>
        </a-form-model>

        <!-- Tab 1 Result Summary -->
        <div class="result-summary">
          <h3>{{ $t('learning.realestate.capitalStructure') }}</h3>
          <div class="summary-grid">
            <div class="summary-item">
              <span class="label">{{ $t('learning.realestate.result.totalAcquisitionCost') }}</span>
              <span class="value font-semibold">$ {{ formatMoney(form.purchasePrice + form.closingCosts + form.repairCost) }}</span>
            </div>
            <div class="summary-item">
              <span class="label">{{ $t('learning.realestate.result.totalInvested') }}</span>
              <span class="value highlight">$ {{ formatMoney(basicReturns.totalCashInvested) }}</span>
            </div>
            <div class="summary-item" v-if="!form.isCashPurchase">
              <span class="label">{{ $t('learning.realestate.result.financedLoanAmount') }}</span>
              <span class="value font-semibold">$ {{ formatMoney(form.purchasePrice * (1 - form.downPaymentPercent / 100)) }}</span>
            </div>
            <div class="summary-item" v-if="!form.isCashPurchase">
              <span class="label">{{ $t('learning.realestate.result.piPayment') }}</span>
              <span class="value font-semibold">$ {{ formatMoney(basicReturns.monthlyPi) }}</span>
            </div>
          </div>
          <div class="insights-block" style="margin-top: 16px; padding: 12px; background: var(--color-surface-3); border-left: 4px solid var(--color-primary); border-radius: 4px;">
            <div class="insights-title" style="font-weight: 600; display: flex; align-items: center; gap: 6px; margin-bottom: 4px; color: var(--color-text);">
              <a-icon type="compass" style="color: var(--color-primary);" />
              <span>{{ $t('learning.realestate.returnOutlook') }}</span>
            </div>
            <p class="insights-content" style="margin: 0; font-size: 13px; color: var(--color-text-secondary); line-height: 1.5;">
              {{ $t('learning.realestate.explain.returnOutlook') }}
            </p>
          </div>
        </div>
      </a-tab-pane>

      <!-- Tab 2: Depreciation & Tax Shield -->
      <a-tab-pane key="depreciation" :tab="$t('learning.realestate.tabDepreciation')">
        <!-- Shared Parameter Band: inherited from Tab 1 -->
        <div class="param-band">
          <span class="param-band__label">{{ $t('learning.realestate.inheritedFrom') }}</span>
          <span class="param-chip">{{ $t('learning.realestate.purchasePrice') }}: ${{ formatMoney(form.purchasePrice) }}</span>
          <span class="param-chip" v-if="!form.isCashPurchase">{{ $t('learning.realestate.interestRate') }}: {{ form.interestRate }}%</span>
          <span class="param-chip">{{ $t('learning.realestate.marginalTaxRate') }}: {{ form.marginalTaxRate }}%</span>
        </div>
        <a-form-model layout="vertical" :model="form" class="sandbox-form">
          <a-row :gutter="16">
            <a-col :span="24">
              <a-form-model-item :label="$t('learning.realestate.buildingValue')">
                <a-input-number
                  v-model="form.buildingValue"
                  :min="0"
                  :max="form.purchasePrice"
                  :formatter="value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                  :parser="value => value.replace(/\$\s?|(,*)/g, '')"
                  style="width: 100%"
                />
              </a-form-model-item>
            </a-col>
          </a-row>

          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-model-item :label="$t('learning.realestate.marginalTaxRate')">
                <a-input-number
                  v-model="form.marginalTaxRate"
                  :min="0"
                  :max="100"
                  style="width: 100%"
                />
              </a-form-model-item>
            </a-col>
            <a-col :span="12">
              <a-form-model-item :label="$t('learning.realestate.depreciationPeriod')">
                <a-select v-model="form.depreciationPeriod" style="width: 100%">
                  <a-select-option :value="27.5">{{ $t('learning.realestate.depreciationPeriod.27.5') }}</a-select-option>
                  <a-select-option :value="39.0">{{ $t('learning.realestate.depreciationPeriod.39') }}</a-select-option>
                  <a-select-option :value="15.0">{{ $t('learning.realestate.depreciationPeriod.15') }}</a-select-option>
                </a-select>
              </a-form-model-item>
            </a-col>
          </a-row>
          <div style="text-align: right; margin-top: 12px; margin-bottom: 12px;">
            <a-button size="small" class="reset-btn" @click="handleReset">
              <a-icon type="reload" /> {{ $t('learning.asset.btnReset') }}
            </a-button>
          </div>
        </a-form-model>

        <!-- Tab 2 Result Summary -->
        <div class="result-summary">
          <h3>{{ $t('learning.realestate.depreciationAnalysis') }}</h3>
          <div class="summary-grid">
            <div class="summary-item">
              <span class="label">{{ $t('learning.realestate.result.annualDepreciation') }}</span>
              <span class="value">$ {{ formatMoney(taxShield.annualDepreciation) }}</span>
            </div>
            <div class="summary-item">
              <span class="label">{{ $t('learning.realestate.result.taxSavings') }}</span>
              <span class="value highlight">$ {{ formatMoney(taxShield.annualTaxSavings) }}</span>
            </div>
            <div class="summary-item" style="grid-column: span 2">
              <span class="label">{{ $t('learning.realestate.result.afterTaxCashflow') }}</span>
              <span class="value text-success">$ {{ formatMoney(taxShield.afterTaxCashFlow) }} / yr</span>
            </div>
          </div>

          <div class="insights-block" style="margin-top: 16px; padding: 12px; background: var(--color-surface-3); border-left: 4px solid var(--color-warning); border-radius: 4px;">
            <div class="insights-title" style="font-weight: 600; display: flex; align-items: center; gap: 6px; margin-bottom: 4px; color: var(--color-text);">
              <a-icon type="info-circle" style="color: var(--color-warning);" />
              <span>{{ $t('learning.realestate.depreciationAnalysis') }}</span>
            </div>
            <p class="insights-content" style="margin: 0; font-size: 13px; color: var(--color-text-secondary); line-height: 1.5;">
              {{ $t('learning.realestate.explain.depreciation') }}
            </p>
          </div>
        </div>

        <!-- Chart -->
        <div class="chart-wrapper">
          <h4 class="chart-title">{{ $t('learning.realestate.chart.title') }}</h4>
          <div ref="taxChartDom" class="chart-container"></div>
          <p class="chart-note">{{ $t('learning.realestate.chart.note') }}</p>
        </div>
      </a-tab-pane>

      <!-- Tab 3: Rental Cash-Flow Reality (Operations & Refinancing) -->
      <a-tab-pane key="cashflow" :tab="$t('learning.realestate.tabCashflow')">
        <!-- Shared Parameter Band: inherited from Tab 1 -->
        <div class="param-band">
          <span class="param-band__label">{{ $t('learning.realestate.inheritedFrom') }}</span>
          <span class="param-chip">{{ $t('learning.realestate.purchasePrice') }}: ${{ formatMoney(form.purchasePrice) }}</span>
          <span class="param-chip" v-if="!form.isCashPurchase">{{ $t('learning.realestate.result.piPayment') }}: ${{ formatMoney(basicReturns.monthlyPi) }}/mo</span>
          <span class="param-chip">{{ $t('learning.realestate.refinanceLtv') }}: {{ form.refinanceLtv }}%</span>
        </div>
        <a-form-model layout="vertical" :model="form" class="sandbox-form">
          <h4 style="margin-top: 0; margin-bottom: 12px; font-weight: 600; color: var(--color-text);">{{ $t('learning.realestate.sectionRental') }}</h4>
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-model-item :label="$t('learning.realestate.grossRent')">
                <a-input-number
                  v-model="form.grossMonthlyRent"
                  :min="0"
                  :formatter="value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                  :parser="value => value.replace(/\$\s?|(,*)/g, '')"
                  style="width: 100%"
                />
              </a-form-model-item>
            </a-col>
            <a-col :span="12">
              <a-form-model-item :label="$t('learning.realestate.otherIncome')">
                <a-input-number
                  v-model="form.otherMonthlyIncome"
                  :min="0"
                  :formatter="value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                  :parser="value => value.replace(/\$\s?|(,*)/g, '')"
                  style="width: 100%"
                />
              </a-form-model-item>
            </a-col>
          </a-row>

          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-model-item :label="$t('learning.realestate.taxAnnual')">
                <a-input-number
                  v-model="form.propertyTaxAnnual"
                  :min="0"
                  :formatter="value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                  :parser="value => value.replace(/\$\s?|(,*)/g, '')"
                  style="width: 100%"
                />
              </a-form-model-item>
            </a-col>
            <a-col :span="12">
              <a-form-model-item :label="$t('learning.realestate.insuranceMonthly')">
                <a-input-number
                  v-model="form.insuranceMonthly"
                  :min="0"
                  :formatter="value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                  :parser="value => value.replace(/\$\s?|(,*)/g, '')"
                  style="width: 100%"
                />
              </a-form-model-item>
            </a-col>
          </a-row>

          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-model-item :label="$t('learning.realestate.repairsPercent')">
                <a-input-number
                  v-model="form.repairsPercent"
                  :min="0"
                  style="width: 100%"
                />
              </a-form-model-item>
            </a-col>
            <a-col :span="12">
              <a-form-model-item :label="$t('learning.realestate.vacancyPercent')">
                <a-input-number
                  v-model="form.vacancyPercent"
                  :min="0"
                  style="width: 100%"
                />
              </a-form-model-item>
            </a-col>
          </a-row>

          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-model-item :label="$t('learning.realestate.capexPercent')">
                <a-input-number
                  v-model="form.capexPercent"
                  :min="0"
                  style="width: 100%"
                />
              </a-form-model-item>
            </a-col>
            <a-col :span="12">
              <a-form-model-item :label="$t('learning.realestate.managementPercent')">
                <a-input-number
                  v-model="form.managementPercent"
                  :min="0"
                  style="width: 100%"
                />
              </a-form-model-item>
            </a-col>
          </a-row>
          <!-- Advanced Expenses: collapsible -->
          <div class="advanced-toggle" @click="showAdvancedExpenses = !showAdvancedExpenses">
            <a-icon :type="showAdvancedExpenses ? 'up' : 'down'" style="font-size: 11px; margin-right: 6px;" />
            {{ $t('learning.realestate.advancedExpenses') }}
          </div>
          <div v-show="showAdvancedExpenses">
            <a-row :gutter="16" style="margin-top: 8px;">
              <a-col :span="12">
                <a-form-model-item :label="$t('learning.realestate.otherIncome')">
                  <a-input-number v-model="form.otherMonthlyIncome" :min="0" :formatter="v => `$ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')" :parser="v => v.replace(/\$\s?|(,*)/g, '')" style="width: 100%" />
                </a-form-model-item>
              </a-col>
              <a-col :span="12">
                <a-form-model-item :label="$t('learning.realestate.hoa')">
                  <a-input-number v-model="form.hoa" :min="0" :formatter="v => `$ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')" :parser="v => v.replace(/\$\s?|(,*)/g, '')" style="width: 100%" />
                </a-form-model-item>
              </a-col>
            </a-row>
            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-model-item :label="$t('learning.realestate.pmi')">
                  <a-input-number v-model="form.pmi" :min="0" :formatter="v => `$ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')" :parser="v => v.replace(/\$\s?|(,*)/g, '')" style="width: 100%" />
                </a-form-model-item>
              </a-col>
              <a-col :span="12">
                <a-form-model-item :label="$t('learning.realestate.otherExpenses')">
                  <a-input-number v-model="form.otherExpenses" :min="0" :formatter="v => `$ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')" :parser="v => v.replace(/\$\s?|(,*)/g, '')" style="width: 100%" />
                </a-form-model-item>
              </a-col>
            </a-row>
            <a-row :gutter="16">
              <a-col :span="8">
                <a-form-model-item :label="$t('learning.realestate.electricity')">
                  <a-input-number v-model="form.electricity" :min="0" style="width: 100%" />
                </a-form-model-item>
              </a-col>
              <a-col :span="8">
                <a-form-model-item :label="$t('learning.realestate.water')">
                  <a-input-number v-model="form.water" :min="0" style="width: 100%" />
                </a-form-model-item>
              </a-col>
              <a-col :span="8">
                <a-form-model-item :label="$t('learning.realestate.gas')">
                  <a-input-number v-model="form.gas" :min="0" style="width: 100%" />
                </a-form-model-item>
              </a-col>
            </a-row>
          </div>

          <h4 style="margin-top: 16px; margin-bottom: 12px; font-weight: 600; color: var(--color-text);">{{ $t('learning.realestate.sectionRefinance') }}</h4>
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-model-item :label="$t('learning.realestate.refinanceLtv')">
                <a-input-number
                  v-model="form.refinanceLtv"
                  :min="0"
                  style="width: 100%"
                />
              </a-form-model-item>
            </a-col>
            <a-col :span="12">
              <a-form-model-item :label="$t('learning.realestate.refinanceInterestRate')">
                <a-input-number
                  v-model="form.refinanceInterestRate"
                  :min="0"
                  :step="0.01"
                  style="width: 100%"
                />
              </a-form-model-item>
            </a-col>
            <a-col :span="12">
              <a-form-model-item :label="$t('learning.realestate.refinanceTermYears')">
                <a-input-number
                  v-model="form.refinanceTermYears"
                  :min="1"
                  style="width: 100%"
                />
              </a-form-model-item>
            </a-col>
            <a-col :span="12">
              <a-form-model-item :label="$t('learning.realestate.refinanceClosingCosts')">
                <a-input-number
                  v-model="form.refinanceClosingCosts"
                  :min="0"
                  :formatter="value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                  :parser="value => value.replace(/\$\s?|(,*)/g, '')"
                  style="width: 100%"
                />
              </a-form-model-item>
            </a-col>
          </a-row>
          <div style="text-align: right; margin-top: 12px; margin-bottom: 12px;">
            <a-button size="small" class="reset-btn" @click="handleReset">
              <a-icon type="reload" /> {{ $t('learning.asset.btnReset') }}
            </a-button>
          </div>
        </a-form-model>

        <!-- Tab 3 Result Summary -->
        <div class="result-summary">
          <h3>{{ $t('learning.realestate.refinanceYieldAnalytics') }}</h3>
          <div class="summary-grid">
            <div class="summary-item">
              <span class="label">{{ $t('learning.realestate.grossRent') }}</span>
              <span class="value font-semibold">$ {{ formatMoney(basicReturns.monthlyIncome) }}</span>
            </div>
            <div class="summary-item">
              <span class="label">{{ $t('learning.realestate.result.operatingExpenses') }}</span>
              <span class="value">$ {{ formatMoney(basicReturns.monthlyOperatingExpenses) }}</span>
            </div>
            <div class="summary-item">
              <span class="label">{{ $t('learning.realestate.result.noi') }}</span>
              <span class="value highlight">$ {{ formatMoney(basicReturns.annualNoi) }} / yr</span>
            </div>
            <div class="summary-item">
              <span class="label">{{ $t('learning.realestate.result.purchaseCap') }}</span>
              <span class="value font-semibold">{{ basicReturns.purchaseCapRate.toFixed(2) }} %</span>
            </div>
            <div class="summary-item">
              <span class="label">{{ $t('learning.realestate.preRefiCashFlow') }}</span>
              <span class="value" :class="basicReturns.monthlyCashFlow >= 0 ? 'text-success' : 'text-danger'">
                $ {{ formatMoney(basicReturns.monthlyCashFlow) }} / mo
              </span>
            </div>
            <div class="summary-item">
              <span class="label">{{ $t('learning.realestate.preRefiCocRoi') }}</span>
              <span class="value font-semibold">{{ basicReturns.cashOnCashRoi.toFixed(2) }} %</span>
            </div>
            <div class="summary-item" style="grid-column: span 2; border-top: 1px solid var(--color-border); padding-top: 12px; margin-top: 4px;">
              <span class="label" style="color: var(--color-primary); font-weight: 700;">{{ $t('learning.realestate.refinanceYieldAnalytics') }}</span>
            </div>
            <div class="summary-item">
              <span class="label">{{ $t('learning.realestate.postRefiCashFlow') }}</span>
              <span class="value font-semibold" :class="brrrr.postRehabCashFlow >= 0 ? 'text-success' : 'text-danger'">
                $ {{ formatMoney(brrrr.postRehabCashFlow) }} / mo
              </span>
            </div>
            <div class="summary-item">
              <span class="label">{{ $t('learning.realestate.postRefiCocRoi') }}</span>
              <span class="value highlight">{{ formatPercent(brrrr.postRehabOutputs.cashOnCashRoi) }}</span>
            </div>
            <div class="summary-item">
              <span class="label">{{ $t('learning.realestate.result.cashOut') }}</span>
              <span class="value text-success">$ {{ formatMoney(brrrr.cashOutAmount) }}</span>
            </div>
            <div class="summary-item">
              <span class="label">{{ $t('learning.realestate.result.cashLeft') }}</span>
              <span class="value font-semibold">$ {{ formatMoney(brrrr.actualCashInvested) }}</span>
            </div>
          </div>

          <!-- Deal Diagnosis Card -->
          <div class="diagnosis-card" style="margin-top: 20px; padding: 16px; background: var(--color-surface-3); border: 1px solid var(--color-border); border-radius: 6px;">
            <h4 style="margin-top: 0; margin-bottom: 12px; font-weight: 600; display: flex; align-items: center; gap: 8px; font-size: 13.5px; color: var(--color-text);">
              <a-icon type="dashboard" style="color: var(--color-primary);" />
              <span>{{ $t('learning.realestate.diagnosis.title') }}</span>
            </h4>
            
            <div class="diagnosis-section" style="display: flex; flex-direction: column; gap: 10px;">
              <!-- 1. Deal Profile -->
              <div class="diagnosis-item">
                <span class="diagnosis-tag" style="display: inline-block; padding: 2px 8px; font-size: 11px; font-weight: 600; text-transform: uppercase; border-radius: 4px; margin-bottom: 4px; background: var(--color-primary-light, rgba(19, 194, 194, 0.1)); color: var(--color-primary);">
                  {{ $t('learning.realestate.diagnosis.dealProfile') }}
                </span>
                <div style="font-weight: 600; font-size: 13px; color: var(--color-text);">
                  {{ $t('learning.realestate.diagnosis.type.' + dealDiagnosis.dealType) }}
                </div>
                <div style="font-size: 12px; color: var(--color-text-secondary); margin-top: 2px;">
                  {{ $t('learning.realestate.diagnosis.type.' + dealDiagnosis.dealType + '.desc') }}
                </div>
              </div>

              <!-- 2. Cash Flow Resilience -->
              <div class="diagnosis-item">
                <div style="font-weight: 600; font-size: 13px; display: flex; align-items: center; gap: 6px; color: var(--color-text);">
                  <span :style="{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: dealDiagnosis.cashFlowStatus === 'resilient' ? 'var(--color-success, #52c41a)' : (dealDiagnosis.cashFlowStatus === 'fragile' ? 'var(--color-warning, #faad14)' : 'var(--color-danger, #f5222d)')
                  }"></span>
                  {{ $t('learning.realestate.diagnosis.resilience.' + dealDiagnosis.cashFlowStatus) }}
                </div>
                <div style="font-size: 12px; color: var(--color-text-secondary); margin-top: 2px; padding-left: 12px;">
                  {{ $t('learning.realestate.diagnosis.resilience.' + dealDiagnosis.cashFlowStatus + '.desc') }}
                </div>
              </div>

              <!-- 3. Leverage Assessment -->
              <div class="diagnosis-item">
                <div style="font-weight: 600; font-size: 13px; display: flex; align-items: center; gap: 6px; color: var(--color-text);">
                  <span :style="{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: dealDiagnosis.debtCoverageStatus === 'healthy' ? 'var(--color-success, #52c41a)' : (dealDiagnosis.debtCoverageStatus === 'tight' ? 'var(--color-warning, #faad14)' : 'var(--color-text-secondary, #8c8c8c)')
                  }"></span>
                  {{ $t('learning.realestate.diagnosis.burden.' + dealDiagnosis.debtCoverageStatus) }}
                </div>
                <div style="font-size: 12px; color: var(--color-text-secondary); margin-top: 2px; padding-left: 12px;">
                  {{ $t('learning.realestate.diagnosis.burden.' + dealDiagnosis.debtCoverageStatus + '.desc') }}
                </div>
              </div>

              <!-- 4. Tax Shield Lift -->
              <div class="diagnosis-item">
                <div style="font-weight: 600; font-size: 13px; display: flex; align-items: center; gap: 6px; color: var(--color-text);">
                  <span :style="{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: dealDiagnosis.taxShieldImpact === 'high' ? 'var(--color-success, #52c41a)' : (dealDiagnosis.taxShieldImpact === 'moderate' ? 'var(--color-primary, #13c2c2)' : 'var(--color-text-secondary, #8c8c8c)')
                  }"></span>
                  {{ $t('learning.realestate.diagnosis.tax.' + dealDiagnosis.taxShieldImpact) }}
                </div>
                <div style="font-size: 12px; color: var(--color-text-secondary); margin-top: 2px; padding-left: 12px;">
                  {{ $t('learning.realestate.diagnosis.tax.' + dealDiagnosis.taxShieldImpact + '.desc') }}
                </div>
              </div>
            </div>
          </div>

          <div v-if="brrrr.actualCashInvested < 0" class="insights-block" style="margin-top: 16px; padding: 12px; background: var(--color-surface-3); border-left: 4px solid var(--color-success); border-radius: 4px;">
            <div class="insights-title" style="font-weight: 600; display: flex; align-items: center; gap: 6px; margin-bottom: 4px; color: var(--color-text);">
              <a-icon type="check-circle" style="color: var(--color-success);" />
              <span>{{ $t('learning.realestate.infiniteRoiAlert') }}</span>
            </div>
            <p class="insights-content" style="margin: 0; font-size: 13px; color: var(--color-text-secondary); line-height: 1.5;">
              {{ $t('learning.realestate.explain.infiniteRoi') }}
            </p>
          </div>

          <div v-if="brrrr.postRehabCashFlow < 0" class="insights-block" style="margin-top: 16px; padding: 12px; background: var(--color-surface-3); border-left: 4px solid var(--color-warning); border-radius: 4px;">
            <div class="insights-title" style="font-weight: 600; display: flex; align-items: center; gap: 6px; margin-bottom: 4px; color: var(--color-text);">
              <a-icon type="warning" style="color: var(--color-warning);" />
              <span>{{ $t('learning.realestate.negativeCashflowWarning') }}</span>
            </div>
            <p class="insights-content" style="margin: 0; font-size: 13px; color: var(--color-text-secondary); line-height: 1.5;">
              {{ $t('learning.realestate.explain.negativeCashflow') }}
            </p>
          </div>

          <div v-if="basicReturns.monthlyPi > 0 && basicReturns.dcr < 1.2" class="insights-block" style="margin-top: 16px; padding: 12px; background: var(--color-surface-3); border-left: 4px solid var(--color-warning); border-radius: 4px;">
            <div class="insights-title" style="font-weight: 600; display: flex; align-items: center; gap: 6px; margin-bottom: 4px; color: var(--color-text);">
              <a-icon type="info-circle" style="color: var(--color-warning);" />
              <span>{{ $t('learning.realestate.dcrRiskWarning') }}</span>
            </div>
            <p class="insights-content" style="margin: 0; font-size: 13px; color: var(--color-text-secondary); line-height: 1.5;">
              {{ $t('learning.realestate.explain.dcr') }}
            </p>
          </div>
        </div>
      </a-tab-pane>
    </a-tabs>
  </a-drawer>
</template>

<script>
import * as echarts from 'echarts'
import {
  calculateRealEstateReturns,
  calculateRealEstateTaxShield,
  calculateRealEstateBrrrr
} from '@/utils/finance'
import { sandboxMixin } from '../sandboxMixin'

export default {
  name: 'RealEstateDrawer',
  mixins: [sandboxMixin],
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  data () {
    const isZh = (this.$store && this.$store.getters.lang === 'zh-CN')
    return {
      activeTab: 'returns',
      showAdvancedExpenses: false,
      // Tracks if user has manually overridden linked fields
      _buildingValueOverridden: false,
      _refinanceRateOverridden: false,
      _refinanceTermOverridden: false,
      form: {
        // Return Outlook (Acquisition & Debt)
        purchasePrice: 300000,
        arv: 350000,
        closingCosts: 6000,
        repairCost: 15000,
        isCashPurchase: false,
        downPaymentPercent: 20,
        interestRate: isZh ? 3.5 : 6.5,
        loanTermYears: 30,
        loanPointsPercent: 1.0,

        // Depreciation & Tax Shield (buildingValue auto-derives from purchasePrice)
        buildingValue: 240000,
        marginalTaxRate: isZh ? 20 : 24,
        depreciationPeriod: 27.5,

        // Operations & Cash Flow
        grossMonthlyRent: 2500,
        otherMonthlyIncome: 0,
        propertyTaxAnnual: 3600,
        insuranceMonthly: 100,
        repairsPercent: 5,
        vacancyPercent: 5,
        capexPercent: 5,
        managementPercent: 8,
        electricity: 0,
        water: 0,
        gas: 0,
        hoa: 0,
        garbage: 0,
        pmi: 0,
        otherExpenses: 0,

        // BRRRR Refinancing (rate/term auto-inherit from base loan)
        refinanceLtv: 75,
        refinanceInterestRate: isZh ? 3.5 : 6.5,
        refinanceTermYears: 30,
        refinanceClosingCosts: 4000
      },
      taxChart: null
    }
  },
  computed: {
    basicReturns () {
      return calculateRealEstateReturns(this.form)
    },
    taxShield () {
      const preTaxAnnualCashFlow = this.basicReturns.monthlyCashFlow * 12
      return calculateRealEstateTaxShield(this.form, preTaxAnnualCashFlow)
    },
    brrrr () {
      return calculateRealEstateBrrrr(this.form, this.form, this.basicReturns)
    },
    dealDiagnosis () {
      const basic = this.basicReturns
      const tax = this.taxShield
      const br = this.brrrr

      // 1. Deal Classification
      let dealType = 'balanced'
      const arvPremium = this.form.arv > (this.form.purchasePrice + this.form.repairCost) * 1.15
      
      if (arvPremium && basic.cashOnCashRoi < 5) {
        dealType = 'appreciation'
      } else if (br.cashOutAmount > basic.totalCashInvested * 0.5 || (br.postRehabOutputs.cashOnCashRoi > basic.cashOnCashRoi * 1.5 && br.postRehabOutputs.cashOnCashRoi !== Infinity)) {
        dealType = 'refinance'
      } else if (basic.cashOnCashRoi >= 6.0 && basic.monthlyCashFlow >= 200) {
        dealType = 'cashflow'
      }

      // 2. Cash Flow Resilience
      let cashFlowStatus = 'fragile'
      if (basic.monthlyCashFlow >= 400) {
        cashFlowStatus = 'resilient'
      } else if (basic.monthlyCashFlow <= 0) {
        cashFlowStatus = 'deficit'
      }

      // 3. Financing Burden
      let debtCoverageStatus = 'healthy'
      if (this.form.isCashPurchase) {
        debtCoverageStatus = 'no_leverage'
      } else if (basic.dcr < 1.25) {
        debtCoverageStatus = 'tight'
      }

      // 4. Tax Shield Impact
      let taxShieldImpact = 'minimal'
      if (basic.totalCashInvested > 0) {
        const taxRatio = (tax.annualTaxSavings / basic.totalCashInvested) * 100
        if (taxRatio >= 2.0) {
          taxShieldImpact = 'high'
        } else if (taxRatio >= 0.5) {
          taxShieldImpact = 'moderate'
        }
      }

      return {
        dealType,
        cashFlowStatus,
        debtCoverageStatus,
        taxShieldImpact
      }
    }
  },
  watch: {
    visible (newVal) {
      if (newVal) {
        this.$nextTick(() => {
          this.recreateCharts()
        })
      }
    },
    isDark () {
      this.$nextTick(() => {
        this.recreateCharts()
      })
    },
    // Auto-derive buildingValue from purchasePrice (unless user manually changed it)
    'form.purchasePrice' (newVal) {
      if (!this._buildingValueOverridden) {
        this.form.buildingValue = Math.round(newVal * 0.80)
      }
    },
    // Auto-derive buildingValue user override detection
    'form.buildingValue' (newVal) {
      const autoVal = Math.round(this.form.purchasePrice * 0.80)
      if (Math.abs(newVal - autoVal) > 1) {
        this._buildingValueOverridden = true
      }
    },
    // Auto-derive refi rate from base interest rate
    'form.interestRate' (newVal) {
      if (!this._refinanceRateOverridden) {
        this.form.refinanceInterestRate = newVal
      }
    },
    'form.refinanceInterestRate' (newVal) {
      if (Math.abs(newVal - this.form.interestRate) > 0.01) {
        this._refinanceRateOverridden = true
      }
    },
    // Auto-derive refi term from base loan term
    'form.loanTermYears' (newVal) {
      if (!this._refinanceTermOverridden) {
        this.form.refinanceTermYears = newVal
      }
    },
    'form.refinanceTermYears' (newVal) {
      if (newVal !== this.form.loanTermYears) {
        this._refinanceTermOverridden = true
      }
    },
    // Persist form to localStorage on any change (debounced via $nextTick)
    form: {
      deep: true,
      handler (newVal) {
        this.saveSandboxState('realestate', newVal)
      }
    },
    // Redraw charts when form variables update to reflect reactive state changes
    taxShield () {
      this.$nextTick(() => {
        this.renderTaxChart()
      })
    }
  },
  created () {
    // Restore last session's form state from localStorage
    const saved = this.loadSandboxState('realestate')
    if (saved && typeof saved === 'object') {
      // Detect if previously overridden derived fields
      const autoBuilding = Math.round((saved.purchasePrice || 300000) * 0.80)
      this._buildingValueOverridden = Math.abs((saved.buildingValue || 0) - autoBuilding) > 1
      this._refinanceRateOverridden = saved.refinanceInterestRate !== saved.interestRate
      this._refinanceTermOverridden = saved.refinanceTermYears !== saved.loanTermYears
      // Merge saved state into form (guards against new fields added in updates)
      Object.keys(this.form).forEach(k => {
        if (saved[k] !== undefined) this.form[k] = saved[k]
      })
    }
  },
  mounted () {
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy () {
    window.removeEventListener('resize', this.handleResize)
    this.disposeCharts()
  },
  methods: {
    onClose () {
      this.$emit('close')
    },
    handleReset () {
      const isZh = this.currentLang === 'zh-CN'
      this.clearSandboxState('realestate')
      this._buildingValueOverridden = false
      this._refinanceRateOverridden = false
      this._refinanceTermOverridden = false
      this.form.purchasePrice = 300000
      this.form.arv = 350000
      this.form.closingCosts = 6000
      this.form.repairCost = 15000
      this.form.isCashPurchase = false
      this.form.downPaymentPercent = 20
      this.form.interestRate = isZh ? 3.5 : 6.5
      this.form.loanTermYears = 30
      this.form.loanPointsPercent = 1.0
      this.form.buildingValue = 240000
      this.form.marginalTaxRate = isZh ? 20 : 24
      this.form.depreciationPeriod = 27.5
      this.form.grossMonthlyRent = 2500
      this.form.otherMonthlyIncome = 0
      this.form.propertyTaxAnnual = 3600
      this.form.insuranceMonthly = 100
      this.form.repairsPercent = 5
      this.form.vacancyPercent = 5
      this.form.capexPercent = 5
      this.form.managementPercent = 8
      this.form.electricity = 0
      this.form.water = 0
      this.form.gas = 0
      this.form.hoa = 0
      this.form.garbage = 0
      this.form.pmi = 0
      this.form.otherExpenses = 0
      this.form.refinanceLtv = 75
      this.form.refinanceInterestRate = isZh ? 3.5 : 6.5
      this.form.refinanceTermYears = 30
      this.form.refinanceClosingCosts = 4000
    },
    handleTabChange () {
      this.$nextTick(() => {
        this.recreateCharts()
      })
    },
    renderTaxChart () {
      if (!this.$refs.taxChartDom || !this.taxShield) return

      if (!this.taxChart) {
        this.taxChart = echarts.init(this.$refs.taxChartDom)
      }

      const isDark = this.isDark
      const themeColors = isDark
        ? { text: 'rgba(255,255,255,0.6)', border: '#333', line: '#f59e0b' }
        : { text: '#6b7280', border: '#e6e2dc', line: '#d97706' }

      const xLabels = this.taxShield.schedule.map(s => `${this.$t('learning.realestate.chart.xLabel')} ${s.year}`)
      const savingsData = this.taxShield.schedule.map(s => Math.round(s.accumulatedSavings))

      const option = {
        backgroundColor: 'transparent',
        grid: { top: 30, right: 10, bottom: 35, left: 65 },
        tooltip: {
          trigger: 'axis',
          backgroundColor: isDark ? '#252525' : '#ffffff',
          borderColor: isDark ? '#3a3a3a' : '#ece9e4',
          textStyle: { color: isDark ? '#fff' : '#000', fontSize: 12 },
          formatter: (params) => {
            return `<div style="font-size:11px; margin-bottom:4px; font-weight:600">${params[0].name}</div>
                    <div style="display:flex; justify-content:space-between; gap:20px; font-size:11px">
                      <span style="color:var(--color-text-muted)">Accumulated Savings:</span>
                      <span style="font-weight:600">$ ${Math.round(params[0].value).toLocaleString('zh-CN')}</span>
                    </div>`
          }
        },
        xAxis: {
          type: 'category',
          data: xLabels,
          axisLine: { lineStyle: { color: themeColors.border } },
          axisLabel: { color: themeColors.text, fontSize: 10 }
        },
        yAxis: {
          type: 'value',
          axisLine: { show: false },
          axisTick: { show: false },
          splitLine: { lineStyle: { color: isDark ? '#222' : '#f0ece6' } },
          axisLabel: { color: themeColors.text, fontSize: 10 }
        },
        series: [
          {
            name: 'Accumulated savings',
            type: 'line',
            data: savingsData,
            smooth: true,
            lineStyle: { width: 2.5, color: themeColors.line },
            itemStyle: { color: themeColors.line },
            showSymbol: false,
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: isDark ? 'rgba(245, 158, 11, 0.2)' : 'rgba(217, 119, 6, 0.1)' },
                { offset: 1, color: 'rgba(0,0,0,0)' }
              ])
            }
          }
        ]
      }

      this.taxChart.setOption(option)
    },
    recreateCharts () {
      this.disposeCharts()
      this.$nextTick(() => {
        this.renderTaxChart()
      })
    },
    disposeCharts () {
      if (this.taxChart) {
        this.taxChart.dispose()
        this.taxChart = null
      }
    },
    handleResize () {
      if (this.taxChart) {
        this.taxChart.resize()
      }
    }
  }
}
</script>

<style scoped lang="less">
.sandbox-tabs {
  /deep/ .ant-tabs-bar {
    border-bottom: 1px solid var(--color-border);
    margin-bottom: 20px;
  }
  /deep/ .ant-tabs-tab {
    font-size: 13.5px;
    font-weight: 500;
  }
}

// Shared parameter band — shows Tab 1 values inherited in Tab 2 & 3
.param-band {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  margin-bottom: 16px;
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: 6px;

  &__label {
    font-size: 11px;
    font-weight: 600;
    color: var(--color-text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    margin-right: 4px;
  }
}

.param-chip {
  display: inline-block;
  padding: 2px 8px;
  background: var(--color-surface-3, rgba(0,0,0,0.04));
  border: 1px solid var(--color-border);
  border-radius: 12px;
  font-size: 11.5px;
  color: var(--color-text);
  font-weight: 500;
}

// Collapsible advanced expenses toggle
.advanced-toggle {
  display: inline-flex;
  align-items: center;
  margin: 4px 0 4px;
  padding: 4px 0;
  font-size: 12px;
  font-weight: 550;
  color: var(--color-primary);
  cursor: pointer;
  user-select: none;
  transition: opacity 0.15s;

  &:hover { opacity: 0.75; }
}

.reset-btn {
  margin-top: 4px;
  font-size: 12px;
  color: var(--color-text-secondary);
  border-color: var(--color-border);
}

.sandbox-form {
  /deep/ .ant-form-item {
    margin-bottom: 14px;
  }
  /deep/ .ant-form-item-label {
    padding-bottom: 4px;
    line-height: 1.3;
    label {
      font-size: 12px;
      color: var(--color-text-secondary);
      font-weight: 550;
    }
  }
  /deep/ .ant-input-number,
  /deep/ .ant-select-selection,
  /deep/ .ant-radio-button-wrapper {
    background-color: var(--color-surface) !important;
    border-color: var(--color-border) !important;
    color: var(--color-text) !important;
    border-radius: 4px;
  }
  /deep/ .ant-radio-button-wrapper-checked {
    background-color: var(--color-primary) !important;
    border-color: var(--color-primary) !important;
    color: var(--color-bg) !important;
    box-shadow: none !important;
  }
}

.result-summary {
  margin-top: 28px;
  padding: 20px;
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: 8px;

  h3 {
    margin-top: 0;
    margin-bottom: 16px;
    font-size: 14px;
    font-weight: 650;
    color: var(--color-text);
  }
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 4px;

  .label {
    font-size: 11px;
    color: var(--color-text-muted);
    text-transform: uppercase;
    font-weight: 600;
    letter-spacing: 0.02em;
  }

  .value {
    font-size: 17px;
    color: var(--color-text);

    &.highlight {
      color: var(--color-primary);
      font-weight: 700;
    }
    &.text-success {
      color: var(--color-success);
    }
    &.text-danger {
      color: var(--color-error);
    }
  }
}

.insights-block {
  margin-top: 16px;
  padding: 10px 12px;
  background: var(--color-surface-3);
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  gap: 4px;

  .title {
    font-size: 11px;
    color: var(--color-text-muted);
    font-weight: 600;
  }

  .code {
    font-family: 'SF Mono', 'Fira Mono', monospace;
    font-size: 12px;
    color: var(--color-text);
    background: transparent;
    padding: 0;
  }
}

.chart-wrapper {
  margin-top: 28px;
  padding: 20px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-surface);
}

.chart-title {
  margin-top: 0;
  margin-bottom: 12px;
  font-size: 13.5px;
  font-weight: 600;
  color: var(--color-text);
}

.chart-container {
  width: 100%;
  height: 240px;
}

.chart-note {
  margin: 8px 0 0;
  font-size: 11px;
  color: var(--color-text-muted);
  text-align: center;
}
</style>
