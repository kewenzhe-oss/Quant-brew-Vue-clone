<template>
  <div class="settings-page" :class="{ 'theme-dark': isDarkTheme }">
    <!-- 重启提示 -->
    <a-alert
      v-if="showRestartTip"
      class="restart-alert"
      type="warning"
      showIcon
      closable
      @close="showRestartTip = false"
    >
      <template slot="message">
        <span>{{ $t('settings.restartRequired') }}</span>
        <a-button size="small" type="link" @click="copyRestartCommand">
          {{ $t('settings.copyRestartCmd') }}
        </a-button>
      </template>
    </a-alert>

    <div class="settings-header">
      <div>
        <p class="brand-kicker">
          <img src="/assets/brand/icon-monochrome.svg" alt="" style="width: 16px; height: 16px; vertical-align: middle; margin-right: 8px; margin-top: -2px;" />
          PostSoma Core
        </p>
        <h2 class="page-title">{{ $t('settings.title') }}</h2>
        <p class="page-desc">Manage appearance, security, providers, and operational preferences for a disciplined research workspace.</p>
      </div>
      <a-button type="primary" class="header-action" @click="handleSave" :loading="saving">
        <a-icon type="save" />
        {{ $t('settings.save') }}
      </a-button>
    </div>

    <section class="settings-section-card appearance-card">
      <div class="section-card-header">
        <div>
          <p class="section-eyebrow">Restored interface settings</p>
          <h3>Appearance</h3>
          <p>These controls use the original PostSoma Core theme engine and persist through the existing Vuex/localStorage settings model.</p>
        </div>
        <a-tag color="green">Connected</a-tag>
      </div>

      <a-row :gutter="16" class="appearance-grid">
        <a-col :xs="24" :lg="8">
          <div class="appearance-control">
            <div class="control-copy">
              <span class="control-label">{{ $t('app.setting.pagestyle') }}</span>
              <span class="control-helper">Choose the sidebar and global surface tone.</span>
            </div>
            <a-radio-group :value="currentNavTheme" button-style="solid" @change="handleMenuTheme">
              <a-radio-button value="light">{{ $t('app.setting.pagestyle.light') }}</a-radio-button>
              <a-radio-button value="dark">{{ $t('app.setting.pagestyle.dark') }}</a-radio-button>
            </a-radio-group>
          </div>
        </a-col>

        <a-col :xs="24" :lg="8">
          <div class="appearance-control">
            <div class="control-copy">
              <span class="control-label">{{ $t('app.setting.themecolor') }}</span>
              <span class="control-helper">Use accents sparingly for states and selected navigation.</span>
            </div>
            <div class="color-swatch-row">
              <a-tooltip v-for="item in colorList" :key="item.color" :title="item.key">
                <button
                  type="button"
                  class="color-swatch"
                  :class="{ active: item.color === currentPrimaryColor }"
                  :style="{ backgroundColor: item.color }"
                  @click="changeColor(item.color)"
                >
                  <a-icon v-if="item.color === currentPrimaryColor" type="check" />
                </button>
              </a-tooltip>
            </div>
          </div>
        </a-col>

        <a-col :xs="24" :lg="8">
          <div class="appearance-control stacked">
            <div class="switch-row">
              <div class="control-copy">
                <span class="control-label">{{ $t('app.setting.weakmode') }}</span>
                <span class="control-helper">Accessibility color adjustment.</span>
              </div>
              <a-switch :checked="currentColorWeak" @change="onColorWeak" />
            </div>
            <div class="switch-row">
              <div class="control-copy">
                <span class="control-label">{{ $t('app.setting.multitab') }}</span>
                <span class="control-helper">Preserve multi-page workspace tabs.</span>
              </div>
              <a-switch :checked="currentMultiTab" @change="onMultiTab" />
            </div>
          </div>
        </a-col>
      </a-row>
    </section>

    <a-spin :spinning="loading">
      <div class="settings-content">
        <div class="settings-section-intro">
          <div>
            <p class="section-eyebrow">Operational settings</p>
            <h3>Security, AI, data, and providers</h3>
          </div>
          <p>Loaded from the active backend schema. Saving here preserves the existing server-side settings flow.</p>
        </div>
        <a-collapse v-model="activeKeys" :bordered="false" class="settings-collapse">
          <a-collapse-panel v-for="(group, groupKey) in sortedSchema" :key="groupKey">
            <template slot="header">
              <span class="panel-header">
                <a-icon :type="group.icon || getGroupIcon(groupKey)" class="panel-icon-left" />
                <span class="panel-title">{{ getGroupTitle(groupKey, group.title) }}</span>
              </span>
            </template>

            <!-- AI 组特殊：显示 OpenRouter 余额查询卡片 -->
            <div v-if="groupKey === 'ai'" class="openrouter-balance-card">
              <a-card size="small" :bordered="false">
                <div class="balance-header">
                  <span class="balance-title">
                    <a-icon type="wallet" style="margin-right: 6px;" />
                    {{ $t('settings.openrouterBalance') || 'OpenRouter 账户余额' }}
                  </span>
                  <a-button size="small" type="primary" ghost :loading="balanceLoading" @click="queryOpenRouterBalance">
                    <a-icon type="sync" />
                    {{ $t('settings.queryBalance') || '查询余额' }}
                  </a-button>
                </div>
                <div v-if="openrouterBalance" class="balance-info">
                  <a-row :gutter="16">
                    <a-col :span="8">
                      <a-statistic
                        :title="$t('settings.balanceUsage') || '已使用'"
                        :value="openrouterBalance.usage"
                        prefix="$"
                        :precision="4"
                        :value-style="{ color: '#cf1322' }"
                      />
                    </a-col>
                    <a-col :span="8">
                      <a-statistic
                        :title="$t('settings.balanceRemaining') || '剩余额度'"
                        :value="openrouterBalance.limit_remaining !== null ? openrouterBalance.limit_remaining : '∞'"
                        :prefix="openrouterBalance.limit_remaining !== null ? '$' : ''"
                        :precision="openrouterBalance.limit_remaining !== null ? 4 : 0"
                        :value-style="{ color: openrouterBalance.limit_remaining !== null && openrouterBalance.limit_remaining < 1 ? '#cf1322' : '#3f8600' }"
                      />
                    </a-col>
                    <a-col :span="8">
                      <a-statistic
                        :title="$t('settings.balanceLimit') || '总限额'"
                        :value="openrouterBalance.limit !== null ? openrouterBalance.limit : '∞'"
                        :prefix="openrouterBalance.limit !== null ? '$' : ''"
                        :precision="openrouterBalance.limit !== null ? 2 : 0"
                      />
                    </a-col>
                  </a-row>
                  <div v-if="openrouterBalance.is_free_tier" class="free-tier-badge">
                    <a-tag color="blue">{{ $t('settings.freeTier') }}</a-tag>
                  </div>
                </div>
                <div v-else class="balance-empty">
                  <a-icon type="info-circle" style="margin-right: 6px;" />
                  {{ $t('settings.balanceNotQueried') || '点击"查询余额"获取账户信息' }}
                </div>
              </a-card>
            </div>

            <a-form :form="form" layout="vertical" class="settings-form">
              <a-row :gutter="24">
                <a-col
                  :xs="24"
                  :sm="24"
                  :md="12"
                  :lg="12"
                  v-for="item in group.items"
                  :key="item.key">
                  <a-form-item>
                    <template slot="label">
                      <span class="form-label-with-tooltip">
                        <span class="label-text">{{ getItemLabel(groupKey, item) }}</span>
                        <a-tooltip v-if="item.description" placement="top">
                          <template slot="title">
                            {{ getItemDescription(groupKey, item) }}
                          </template>
                          <a-icon type="question-circle" class="help-icon" />
                        </a-tooltip>
                        <a
                          v-if="item.link"
                          :href="item.link"
                          target="_blank"
                          rel="noopener noreferrer"
                          class="api-link"
                          @click.stop
                        >
                          <a-icon type="link" />
                          {{ getLinkText(item.link_text) }}
                        </a>
                      </span>
                    </template>
                    <!-- 文本输入 -->
                    <template v-if="item.type === 'text'">
                      <a-input
                        v-decorator="[item.key, { initialValue: getFieldValue(groupKey, item.key) }]"
                        :placeholder="item.default ? `${$t('settings.default')}: ${item.default}` : ''"
                        allowClear
                      />
                    </template>

                    <!-- 密码输入 -->
                    <template v-else-if="item.type === 'password'">
                      <div class="password-field">
                        <a-input
                          v-decorator="[item.key, { initialValue: getFieldValue(groupKey, item.key) }]"
                          :type="passwordVisible[item.key] ? 'text' : 'password'"
                          :placeholder="$t('settings.inputApiKey')"
                          allowClear
                        >
                          <a-icon
                            slot="suffix"
                            :type="passwordVisible[item.key] ? 'eye' : 'eye-invisible'"
                            @click="togglePasswordVisible(item.key)"
                            style="cursor: pointer"
                          />
                        </a-input>
                      </div>
                    </template>

                    <!-- 数字输入 -->
                    <template v-else-if="item.type === 'number'">
                      <a-input-number
                        v-decorator="[item.key, { initialValue: getNumberValue(groupKey, item.key, item.default) }]"
                        :placeholder="item.default ? `${$t('settings.default')}: ${item.default}` : ''"
                        style="width: 100%"
                      />
                    </template>

                    <!-- 布尔开关 -->
                    <template v-else-if="item.type === 'boolean'">
                      <a-switch
                        v-decorator="[item.key, { valuePropName: 'checked', initialValue: getBoolValue(groupKey, item.key, item.default) }]"
                      />
                    </template>

                    <!-- 下拉选择 -->
                    <template v-else-if="item.type === 'select'">
                      <a-select
                        v-decorator="[item.key, { initialValue: getFieldValue(groupKey, item.key) || item.default }]"
                        :placeholder="item.default ? `${$t('settings.default')}: ${item.default}` : $t('settings.pleaseSelect')"
                      >
                        <a-select-option
                          v-for="opt in getSelectOptions(item)"
                          :key="opt.value"
                          :value="opt.value"
                        >
                          {{ opt.label }}
                        </a-select-option>
                      </a-select>
                    </template>

                    <div class="field-default" v-if="item.default && item.type !== 'boolean' && item.type !== 'password'">
                      {{ $t('settings.default') }}: {{ item.default }}
                    </div>
                  </a-form-item>
                </a-col>
              </a-row>
            </a-form>
          </a-collapse-panel>
        </a-collapse>
      </div>
    </a-spin>

    <div class="settings-footer">
      <a-button @click="handleReset" :disabled="saving">
        <a-icon type="undo" />
        {{ $t('settings.reset') }}
      </a-button>
      <a-button type="primary" @click="handleSave" :loading="saving">
        <a-icon type="save" />
        {{ $t('settings.save') }}
      </a-button>
    </div>
  </div>
</template>

<script>
import { getSettingsSchema, getSettingsValues, saveSettings, getOpenRouterBalance } from '@/api/settings'
import { baseMixin } from '@/store/app-mixin'
import { updateTheme, updateColorWeak, getColorList } from '@/components/SettingDrawer/settingConfig'
import {
  TOGGLE_NAV_THEME,
  TOGGLE_COLOR,
  TOGGLE_WEAK,
  TOGGLE_MULTI_TAB
} from '@/store/mutation-types'

export default {
  name: 'Settings',
  mixins: [baseMixin],
  data () {
    return {
      loading: false,
      saving: false,
      schema: {},
      values: {},
      activeKeys: ['auth', 'ai', 'trading'],
      passwordVisible: {},
      showRestartTip: false,
      // OpenRouter 余额
      balanceLoading: false,
      openrouterBalance: null,

    }
  },
  computed: {
    colorList () {
      return getColorList()
    },
    currentNavTheme () {
      return this.navTheme || 'light'
    },
    currentPrimaryColor () {
      return this.primaryColor || '#13C2C2'
    },
    currentColorWeak () {
      return this.colorWeak || false
    },
    currentMultiTab () {
      return this.multiTab !== undefined ? this.multiTab : true
    },
    isDarkTheme () {
      return this.navTheme === 'dark' || this.navTheme === 'realdark'
    },
    // 按 order 排序的 schema
    sortedSchema () {
      const entries = Object.entries(this.schema)
      entries.sort((a, b) => {
        const orderA = a[1].order || 999
        const orderB = b[1].order || 999
        return orderA - orderB
      })
      const sorted = {}
      for (const [key, value] of entries) {
        sorted[key] = value
      }
      return sorted
    }
  },
  beforeCreate () {
    this.form = this.$form.createForm(this)
  },
  mounted () {
    this.loadSettings()
    updateColorWeak(this.currentColorWeak)
  },

  methods: {
    handleMenuTheme (event) {
      const theme = event && event.target ? event.target.value : event
      this.$store.commit(TOGGLE_NAV_THEME, theme)
    },

    changeColor (color) {
      if (this.currentPrimaryColor === color) return
      this.$store.commit(TOGGLE_COLOR, color)
      updateTheme(color)
    },

    onColorWeak (checked) {
      this.$store.commit(TOGGLE_WEAK, checked)
      updateColorWeak(checked)
    },

    onMultiTab (checked) {
      this.$store.commit(TOGGLE_MULTI_TAB, checked)
    },

    // ---- Settings form ----
    // 兼容后端 schema options 两种格式：
    // - string[]: ['openrouter','openai', ...]
    // - {value,label}[]: [{value:'openrouter',label:'OpenRouter'}, ...]
    getSelectOptions (item) {
      const options = item && Array.isArray(item.options) ? item.options : []
      const arr = options
      return arr.map(opt => {
        const optObj = (opt && typeof opt === 'object')
          ? { value: opt.value != null ? String(opt.value) : '', label: opt.label != null ? String(opt.label) : String(opt.value || '') }
          : { value: String(opt), label: String(opt) }
        // Try i18n first: settings.option.<ITEM_KEY>.<value>
        const i18nKey = item && item.key ? `settings.option.${item.key}.${optObj.value}` : ''
        if (i18nKey) {
          const translated = this.$t(i18nKey)
          if (translated && translated !== i18nKey) {
            optObj.label = translated
          }
        }
        if (opt && typeof opt === 'object') {
          return optObj
        }
        return optObj
      }).filter(o => o.value !== '')
    },
    async loadSettings () {
      this.loading = true
      try {
        const [schemaRes, valuesRes] = await Promise.all([
          getSettingsSchema(),
          getSettingsValues()
        ])

        if (schemaRes.code === 1) {
          this.schema = schemaRes.data
        }

        if (valuesRes.code === 1) {
          this.values = valuesRes.data
        }
      } catch (error) {
        this.$message.error(this.$t('settings.loadFailed'))
      } finally {
        this.loading = false
      }
    },

    // 查询 OpenRouter 余额
    async queryOpenRouterBalance () {
      this.balanceLoading = true
      try {
        const res = await getOpenRouterBalance()
        if (res.code === 1 && res.data) {
          this.openrouterBalance = res.data
          this.$message.success(this.$t('settings.balanceQuerySuccess') || '余额查询成功')
        } else {
          this.$message.error(res.msg || this.$t('settings.balanceQueryFailed') || '余额查询失败')
        }
      } catch (error) {
        this.$message.error(this.$t('settings.balanceQueryFailed') || '余额查询失败')
      } finally {
        this.balanceLoading = false
      }
    },

    getGroupIcon (groupKey) {
      const icons = {
        auth: 'lock',
        email: 'mail',
        sms: 'phone',
        network: 'global',
        app: 'appstore',
        ai: 'robot',
        trading: 'stock',
        data_source: 'database',
        search: 'search',
        agent: 'experiment',
        security: 'safety',
        billing: 'dollar'
      }
      return icons[groupKey] || 'setting'
    },

    getGroupTitle (groupKey, defaultTitle) {
      const key = `settings.group.${groupKey}`
      const translated = this.$t(key)
      return translated !== key ? translated : defaultTitle
    },

    getItemLabel (groupKey, item) {
      const key = `settings.field.${item.key}`
      const translated = this.$t(key)
      return translated !== key ? translated : item.label
    },

    getItemDescription (groupKey, item) {
      // 先尝试从多语言获取描述
      const key = `settings.desc.${item.key}`
      const translated = this.$t(key)
      if (translated !== key) {
        return translated
      }
      // 回退到后端返回的描述
      return item.description || ''
    },

    getLinkText (linkText) {
      if (!linkText) return this.$t('settings.getApi')
      // 如果是翻译键（以 settings.link. 开头），则翻译
      if (linkText.startsWith('settings.link.')) {
        const translated = this.$t(linkText)
        return translated !== linkText ? translated : linkText
      }
      return linkText
    },

    getFieldValue (groupKey, key) {
      const groupValues = this.values[groupKey] || {}
      return groupValues[key] || ''
    },

    togglePasswordVisible (key) {
      this.$set(this.passwordVisible, key, !this.passwordVisible[key])
    },

    getNumberValue (groupKey, key, defaultVal) {
      const val = this.getFieldValue(groupKey, key)
      if (val === '' || val === null || val === undefined) {
        return defaultVal ? parseFloat(defaultVal) : null
      }
      return parseFloat(val)
    },

    getBoolValue (groupKey, key, defaultVal) {
      const val = this.getFieldValue(groupKey, key)
      if (val === '' || val === null || val === undefined) {
        return defaultVal === 'True' || defaultVal === 'true' || defaultVal === true
      }
      return val === 'True' || val === 'true' || val === true
    },

    handleReset () {
      this.form.resetFields()
      this.loadSettings()
    },

    copyRestartCommand () {
      const cmd = 'cd backend_api_python && py run.py'
      navigator.clipboard.writeText(cmd).then(() => {
        this.$message.success(this.$t('settings.copySuccess'))
      }).catch(() => {
        this.$message.error(this.$t('settings.copyFailed'))
      })
    },

    async handleSave () {
      this.form.validateFields(async (err, formValues) => {
        if (err) {
          return
        }

        this.saving = true
        try {
          // 按组整理数据
          const data = {}
          for (const groupKey of Object.keys(this.schema)) {
            data[groupKey] = {}
            const group = this.schema[groupKey]
            for (const item of group.items) {
              if (item.key in formValues) {
                let value = formValues[item.key]
                // 布尔值转字符串
                if (item.type === 'boolean') {
                  value = value ? 'True' : 'False'
                }
                data[groupKey][item.key] = value
              }
            }
          }

          const res = await saveSettings(data)
          if (res.code === 1) {
            this.$message.success(res.msg || this.$t('settings.saveSuccess'))
            // 显示重启提示
            if (res.data && res.data.requires_restart) {
              this.showRestartTip = true
            }
            // 重新加载配置
            this.loadSettings()
          } else {
            this.$message.error(res.msg || this.$t('settings.saveFailed'))
          }
        } catch (error) {
          this.$message.error(this.$t('settings.saveFailed') + ': ' + error.message)
        } finally {
          this.saving = false
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>
@primary-color: #1677b7;
@success-color: #2f8f5b;
@border-radius: 8px;
@border-color: #e5e7eb;
@text-primary: #1f2933;
@text-secondary: #64707d;
@surface: #ffffff;
@page-bg: #f6f5f2;

.settings-page {
  padding: 32px;
  min-height: calc(100vh - 120px);
  background: @page-bg;

  .restart-alert {
    margin-bottom: 16px;
    border-radius: 8px;
  }

  .settings-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 24px;
    max-width: 1180px;
    margin: 0 auto 24px;

    .brand-kicker {
      margin: 0 0 8px;
      color: @success-color;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .page-title {
      margin: 0 0 8px;
      color: @text-primary;
      font-size: 28px;
      font-weight: 650;
      letter-spacing: 0;
    }

    .page-desc {
      max-width: 680px;
      color: @text-secondary;
      font-size: 14px;
      line-height: 1.7;
      margin: 0;
    }

    .header-action {
      height: 40px;
      border-radius: 6px;
      background: #1d6f4f;
      border-color: #1d6f4f;
      box-shadow: none;
    }
  }

  .settings-content {
    max-width: 1180px;
    margin: 0 auto;
    margin-bottom: 80px;
  }

  .settings-section-card,
  .settings-section-intro {
    max-width: 1180px;
    margin: 0 auto 16px;
  }

  .settings-section-card {
    padding: 24px;
    background: @surface;
    border: 1px solid @border-color;
    border-radius: @border-radius;
  }

  .section-card-header,
  .settings-section-intro {
    display: flex;
    justify-content: space-between;
    gap: 24px;
  }

  .section-card-header {
    align-items: flex-start;
    margin-bottom: 20px;
  }

  .settings-section-intro {
    align-items: flex-end;
    margin-top: 24px;
    color: @text-secondary;

    h3 {
      margin-bottom: 0;
    }

    p {
      max-width: 440px;
      margin: 0;
      line-height: 1.6;
    }
  }

  .section-eyebrow {
    margin: 0 0 6px;
    color: @success-color;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .section-card-header h3,
  .settings-section-intro h3 {
    margin: 0 0 6px;
    color: @text-primary;
    font-size: 18px;
    font-weight: 650;
  }

  .section-card-header p {
    max-width: 680px;
    margin: 0;
    color: @text-secondary;
    line-height: 1.6;
  }

  .appearance-grid {
    margin-top: 4px;
  }

  .appearance-control {
    min-height: 156px;
    padding: 16px;
    border: 1px solid @border-color;
    border-radius: @border-radius;
    background: #fbfaf8;
  }

  .appearance-control.stacked {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .control-copy {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-bottom: 14px;
  }

  .control-label {
    color: @text-primary;
    font-weight: 600;
  }

  .control-helper {
    color: @text-secondary;
    font-size: 12px;
    line-height: 1.5;
  }

  .switch-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;

    .control-copy {
      margin-bottom: 0;
    }
  }

  .color-swatch-row {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .color-swatch {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    padding: 0;
    color: #fff;
    border: 2px solid transparent;
    border-radius: 50%;
    cursor: pointer;

    &.active {
      border-color: #111827;
      box-shadow: 0 0 0 3px rgba(17, 24, 39, 0.08);
    }
  }

  .openrouter-balance-card {
    margin-bottom: 20px;

    .ant-card {
      background: #f7fbfd;
      border: 1px solid #cfe3ef;
      border-radius: 8px;
    }

    .balance-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;

      .balance-title {
        font-size: 15px;
        font-weight: 600;
        color: @primary-color;
      }
    }

    .balance-info {
      padding: 8px 0;

      /deep/ .ant-statistic-title {
        font-size: 12px;
        color: @text-secondary;
      }

      /deep/ .ant-statistic-content {
        font-size: 18px;
      }

      .free-tier-badge {
        margin-top: 12px;
        text-align: right;
      }
    }

    .balance-empty {
      color: @text-secondary;
      font-size: 13px;
      padding: 8px 0;
    }
  }

  .settings-collapse {
    background: transparent;

    /deep/ .ant-collapse-item {
      margin-bottom: 16px;
      border: 1px solid @border-color;
      border-radius: @border-radius;
      overflow: hidden;
      background: #fff;
      box-shadow: none;

      .ant-collapse-header {
        font-size: 15px;
        font-weight: 600;
        color: @text-primary;
        padding: 16px 24px;
        padding-left: 48px;
        background: #fff;
        border-bottom: 1px solid #f2f3f5;
        display: flex;
        align-items: center;

        .ant-collapse-arrow {
          color: @primary-color;
          left: 20px;
        }

        .panel-header {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          flex: 1;

          .panel-icon-left {
            font-size: 18px;
            color: @success-color;
          }

          .panel-title {
            font-size: 16px;
          }
        }
      }

      .ant-collapse-content {
        border-top: none;

        .ant-collapse-content-box {
          padding: 22px 24px 24px;
        }
      }
    }
  }

  .settings-form {
    /deep/ .ant-form-item-label {
      padding-bottom: 4px;

      label {
        color: @text-primary;
        font-weight: 500;
      }

      .form-label-with-tooltip {
        display: flex;
        align-items: center;
        gap: 6px;
        flex-wrap: wrap;

        .label-text {
          color: @text-primary;
          font-weight: 500;
        }

        .help-icon {
          font-size: 14px;
          color: #9aa4af;
          cursor: help;
          transition: color 0.2s;

          &:hover {
            color: @primary-color;
          }
        }

        .api-link {
          font-size: 12px;
          font-weight: 400;
          color: @primary-color;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 2px 8px;
          background: rgba(22, 119, 183, 0.08);
          border-radius: 4px;
          transition: all 0.2s;
          margin-left: 4px;

          &:hover {
            background: rgba(22, 119, 183, 0.14);
            color: darken(@primary-color, 10%);
          }

          .anticon {
            font-size: 11px;
          }
        }
      }
    }

    /deep/ .ant-input,
    /deep/ .ant-input-number,
    /deep/ .ant-select-selection {
      border-radius: 8px;
    }

    /deep/ .ant-input-number {
      width: 100%;
    }

    .password-field {
      .field-hint {
        margin-top: 4px;
        font-size: 12px;
        color: @success-color;
        display: flex;
        align-items: center;
        gap: 4px;
      }
    }

    .field-default {
      margin-top: 4px;
      font-size: 12px;
      color: #9aa4af;
    }
  }

  .settings-footer {
    position: fixed;
    bottom: 0;
    left: 208px;
    right: 0;
    padding: 16px 24px;
    background: #fff;
    border-top: 1px solid @border-color;
    box-shadow: none;
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    z-index: 100;

    .ant-btn {
      min-width: 100px;
      height: 40px;
      border-radius: 6px;
      font-weight: 500;
    }

    .ant-btn-primary {
      background: #1d6f4f;
      border-color: #1d6f4f;
      box-shadow: none;
    }
  }

  &.theme-dark {
    background: #111315;

    .restart-alert {
      background: #1c1c1c;
      border-color: #b08800;
    }

    .settings-header {
      .brand-kicker {
        color: #7bc59a;
      }

      .page-title {
        color: #e0e6ed;
      }

      .page-desc {
        color: #8b949e;
      }
    }

    .settings-section-card {
      background: #191c1f;
      border-color: #2a2f35;
    }

    .section-card-header h3,
    .settings-section-intro h3 {
      color: #e0e6ed;
    }

    .section-card-header p,
    .settings-section-intro,
    .control-helper {
      color: #8b949e;
    }

    .section-eyebrow,
    .control-label {
      color: #7bc59a;
    }

    .appearance-control {
      background: #15181b;
      border-color: #2a2f35;
    }

    .color-swatch.active {
      border-color: #f4f5f6;
      box-shadow: 0 0 0 3px rgba(244, 245, 246, 0.12);
    }

    .openrouter-balance-card {
      .ant-card {
        background: #151b20;
        border-color: #263947;
      }
    }

    .settings-collapse {
      /deep/ .ant-collapse-item {
        background: #1c1c1c;
        border-color: #2a2f35;
        box-shadow: none;

        .ant-collapse-header {
          background: #1c1c1c;
          color: #e0e6ed;
          border-bottom-color: rgba(255, 255, 255, 0.06);

          .panel-header {
            .panel-icon-left {
              color: #58a6ff;
            }
            .panel-title {
              color: #e0e6ed;
            }
          }
        }

        .ant-collapse-content {
          background: #1c1c1c;

          .ant-collapse-content-box {
            background: #1c1c1c;
          }
        }
      }
    }

    .settings-form {
      /deep/ .ant-form-item-label {
        label {
          color: #c9d1d9;
        }

        .form-label-with-tooltip {
          .label-text {
            color: #c9d1d9;
          }

          .help-icon {
            color: #6e7681;

            &:hover {
              color: #58a6ff;
            }
          }

          .api-link {
            background: rgba(24, 144, 255, 0.15);
            color: #58a6ff;

            &:hover {
              background: rgba(24, 144, 255, 0.25);
            }
          }
        }
      }

      /deep/ .ant-input,
      /deep/ .ant-input-password,
      /deep/ .ant-input-number,
      /deep/ .ant-select-selection {
        background: #141414;
        border-color: #2a2a2a;
        color: #c9d1d9;

        &:hover,
        &:focus {
          border-color: @primary-color;
        }
      }

      /deep/ .ant-input-number-input {
        background: transparent;
        color: #c9d1d9;
      }

      /deep/ .ant-select-arrow {
        color: #8b949e;
      }

      // Input trailing icons in dark mode (eye/clear/spinner) should stay readable
      /deep/ .ant-input-suffix .anticon,
      /deep/ .ant-input-clear-icon,
      /deep/ .ant-input-clear-icon .anticon,
      /deep/ .ant-input-number-handler-wrap {
        color: #8b949e;
      }

      /deep/ .ant-input-suffix .anticon:hover,
      /deep/ .ant-input-clear-icon:hover,
      /deep/ .ant-input-number-handler:hover .ant-input-number-handler-up-inner,
      /deep/ .ant-input-number-handler:hover .ant-input-number-handler-down-inner {
        color: #58a6ff;
      }

      .field-default {
        color: #6e7681;
      }
    }

    .settings-footer {
      background: #1c1c1c;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      box-shadow: none;
    }
  }
}

@media (max-width: 768px) {
  .settings-page {
    padding: 16px;

    .settings-header,
    .section-card-header,
    .settings-section-intro {
      flex-direction: column;
      align-items: flex-start;
    }

    .settings-header .header-action {
      width: 100%;
    }

    .appearance-control {
      min-height: auto;
      margin-bottom: 12px;
    }

    .settings-footer {
      left: 0;
      padding: 12px 16px;
    }
  }
}
</style>
