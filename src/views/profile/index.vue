<template>
  <div class="profile-page" :class="{ 'theme-dark': isDarkTheme }">
    <div class="page-header">
      <div>
        <p class="brand-kicker">QuantBrew</p>
        <h2 class="page-title">{{ $t('profile.title') }}</h2>
        <p class="page-desc">{{ $t('profile.description') }}</p>
      </div>
    </div>

    <a-row :gutter="24" class="profile-workspace-row">
      <!-- Left: Identity Card -->
      <a-col :xs="24" :lg="7" class="identity-col">
        <div class="identity-card">
          <div class="avatar-section">
            <a-avatar :size="64" :src="profile.avatar || '/avatar2.jpg'" />
            <h3 class="username">{{ profile.nickname || profile.username }}</h3>
            <p class="user-role">
              <a-tag :color="getRoleColor(profile.role)">
                {{ getRoleLabel(profile.role) }}
              </a-tag>
              <a-tag v-if="isVip" color="gold">
                <a-icon type="crown" />
                VIP
              </a-tag>
            </p>
          </div>
          <div class="identity-meta">
            <div class="meta-row">
              <span class="meta-label">{{ $t('profile.username') }}</span>
              <span class="meta-value">{{ profile.username }}</span>
            </div>
            <div class="meta-row">
              <span class="meta-label">{{ $t('profile.email') }}</span>
              <span class="meta-value">{{ profile.email || '—' }}</span>
            </div>
            <div class="meta-row">
              <span class="meta-label">{{ $t('profile.lastLogin') }}</span>
              <span class="meta-value">{{ formatTime(profile.last_login_at) || '—' }}</span>
            </div>
          </div>
        </div>
      </a-col>

      <!-- Right: Settings Workspace -->
      <a-col :xs="24" :lg="17" class="settings-col">
        <div class="settings-panel">
          <a-tabs v-model="activeTab" class="settings-tabs">

            <!-- Profile tab -->
            <a-tab-pane key="basic" :tab="$t('profile.tab.profile')">
              <a-form :form="profileForm" layout="vertical" class="profile-form">
                <a-form-item :label="$t('profile.nickname')">
                  <a-input
                    v-decorator="['nickname', { initialValue: profile.nickname }]"
                    :placeholder="$t('profile.nicknamePlaceholder')"
                  >
                    <a-icon slot="prefix" type="smile" />
                  </a-input>
                </a-form-item>

                <a-form-item :label="$t('profile.email')">
                  <a-input
                    :value="profile.email || '—'"
                    disabled
                  >
                    <a-icon slot="prefix" type="mail" />
                    <a-tooltip slot="suffix" :title="$t('profile.emailCannotChange')">
                      <a-icon type="info-circle" style="color: rgba(0,0,0,.45)" />
                    </a-tooltip>
                  </a-input>
                </a-form-item>

                <a-form-item :label="$t('profile.timezone')">
                  <a-select
                    v-decorator="['timezone', { initialValue: profile.timezone || '' }]"
                    :placeholder="$t('profile.timezonePlaceholder')"
                    show-search
                    allow-clear
                    option-filter-prop="children"
                  >
                    <a-select-option value="">
                      {{ $t('profile.timezoneBrowser') }}
                    </a-select-option>
                    <a-select-option v-for="z in timezoneIanaList" :key="z" :value="z">
                      {{ z }}
                    </a-select-option>
                  </a-select>
                </a-form-item>

                <a-form-item>
                  <a-button type="primary" :loading="saving" @click="handleSaveProfile">
                    {{ $t('common.save') }}
                  </a-button>
                </a-form-item>
              </a-form>
            </a-tab-pane>

            <!-- Security tab -->
            <a-tab-pane key="password" :tab="$t('profile.tab.security')">
              <a-form :form="passwordForm" layout="vertical" class="password-form">
                <a-alert
                  :message="$t('profile.passwordHintNew')"
                  type="info"
                  showIcon
                  style="margin-bottom: 24px"
                />

                <a-form-item :label="$t('profile.verificationCode')">
                  <a-row :gutter="12">
                    <a-col :span="16">
                      <a-input
                        v-decorator="['code', {
                          rules: [{ required: true, message: $t('profile.codeRequired') }]
                        }]"
                        :placeholder="$t('profile.codePlaceholder')"
                      >
                        <a-icon slot="prefix" type="safety-certificate" />
                      </a-input>
                    </a-col>
                    <a-col :span="8">
                      <a-button
                        block
                        :loading="sendingPwdCode"
                        :disabled="sendingPwdCode || pwdCodeCountdown > 0 || !profile.email"
                        @click="handleSendPwdCode"
                      >
                        {{ pwdCodeCountdown > 0 ? `${pwdCodeCountdown}s` : $t('profile.sendCode') }}
                      </a-button>
                    </a-col>
                  </a-row>
                  <div class="email-hint" v-if="profile.email">
                    {{ $t('profile.codeWillSendTo') }}: {{ profile.email }}
                  </div>
                  <div class="email-hint email-warning" v-else>
                    {{ $t('profile.noEmailWarning') }}
                  </div>
                </a-form-item>

                <a-form-item :label="$t('profile.newPassword')">
                  <a-input-password
                    v-decorator="['new_password', {
                      rules: [
                        { required: true, message: $t('profile.newPasswordRequired') },
                        { validator: validateNewPassword }
                      ]
                    }]"
                    :placeholder="$t('profile.newPasswordPlaceholder')"
                  >
                    <a-icon slot="prefix" type="lock" />
                  </a-input-password>
                </a-form-item>

                <a-form-item :label="$t('profile.confirmPassword')">
                  <a-input-password
                    v-decorator="['confirm_password', {
                      rules: [
                        { required: true, message: $t('profile.confirmPasswordRequired') },
                        { validator: validateConfirmPassword }
                      ]
                    }]"
                    :placeholder="$t('profile.confirmPasswordPlaceholder')"
                  >
                    <a-icon slot="prefix" type="lock" />
                  </a-input-password>
                </a-form-item>

                <a-form-item>
                  <a-button type="primary" :loading="changingPassword" @click="handleChangePassword" :disabled="!profile.email">
                    {{ $t('profile.changePassword') }}
                  </a-button>
                </a-form-item>
              </a-form>
            </a-tab-pane>

            <!-- Notifications tab -->
            <a-tab-pane key="notifications" :tab="$t('profile.tab.notifications')">
              <div class="notification-settings-form">
                <a-form :form="notificationForm" layout="vertical" style="max-width: 560px;">
                  <a-form-item :label="$t('profile.notifications.defaultChannels')">
                    <a-checkbox-group
                      v-decorator="['default_channels', { initialValue: notificationSettings.default_channels || ['browser'] }]"
                    >
                      <a-row :gutter="16">
                        <a-col :span="8">
                          <a-checkbox value="browser">
                            <a-icon type="bell" /> {{ $t('profile.notifications.browser') }}
                          </a-checkbox>
                        </a-col>
                        <a-col :span="8">
                          <a-checkbox value="telegram">
                            <a-icon type="send" /> Telegram
                          </a-checkbox>
                        </a-col>
                        <a-col :span="8">
                          <a-checkbox value="email">
                            <a-icon type="mail" /> {{ $t('profile.notifications.email') }}
                          </a-checkbox>
                        </a-col>
                      </a-row>
                      <a-row :gutter="16" style="margin-top: 8px">
                        <a-col :span="8">
                          <a-checkbox value="phone">
                            <a-icon type="phone" /> {{ $t('profile.notifications.phone') }}
                          </a-checkbox>
                        </a-col>
                        <a-col :span="8">
                          <a-checkbox value="discord">
                            <a-icon type="message" /> Discord
                          </a-checkbox>
                        </a-col>
                        <a-col :span="8">
                          <a-checkbox value="webhook">
                            <a-icon type="api" /> Webhook
                          </a-checkbox>
                        </a-col>
                      </a-row>
                    </a-checkbox-group>
                  </a-form-item>

                  <a-form-item :label="$t('profile.notifications.telegramBotToken')">
                    <a-input-password
                      v-decorator="['telegram_bot_token', { initialValue: notificationSettings.telegram_bot_token }]"
                      :placeholder="$t('profile.notifications.telegramBotTokenPlaceholder')"
                    >
                      <a-icon slot="prefix" type="robot" />
                    </a-input-password>
                    <div class="field-hint">
                      <a-icon type="info-circle" />
                      <span>
                        {{ $t('profile.notifications.telegramBotTokenHint') }}
                        <a href="https://t.me/BotFather" target="_blank" rel="noopener noreferrer">@BotFather</a>
                      </span>
                    </div>
                  </a-form-item>

                  <a-form-item :label="$t('profile.notifications.telegramChatId')">
                    <a-input
                      v-decorator="['telegram_chat_id', { initialValue: notificationSettings.telegram_chat_id }]"
                      :placeholder="$t('profile.notifications.telegramPlaceholder')"
                    >
                      <a-icon slot="prefix" type="message" />
                    </a-input>
                    <div class="field-hint">
                      <a-icon type="info-circle" />
                      <span>{{ $t('profile.notifications.telegramHint') }}</span>
                    </div>
                  </a-form-item>

                  <a-form-item :label="$t('profile.notifications.notifyEmail')">
                    <a-input
                      v-decorator="['email', { initialValue: notificationSettings.email || profile.email }]"
                      :placeholder="$t('profile.notifications.emailPlaceholder')"
                    >
                      <a-icon slot="prefix" type="mail" />
                    </a-input>
                    <div class="field-hint">
                      <a-icon type="info-circle" />
                      <span>{{ $t('profile.notifications.emailHint') }}</span>
                    </div>
                  </a-form-item>

                  <a-form-item :label="$t('profile.notifications.discordWebhook')">
                    <a-input
                      v-decorator="['discord_webhook', { initialValue: notificationSettings.discord_webhook }]"
                      :placeholder="$t('profile.notifications.discordPlaceholder')"
                    >
                      <a-icon slot="prefix" type="message" />
                    </a-input>
                    <div class="field-hint">
                      <a-icon type="info-circle" />
                      <span>{{ $t('profile.notifications.discordHint') }}</span>
                    </div>
                  </a-form-item>

                  <a-form-item :label="$t('profile.notifications.webhookUrl')">
                    <a-input
                      v-decorator="['webhook_url', { initialValue: notificationSettings.webhook_url }]"
                      :placeholder="$t('profile.notifications.webhookPlaceholder')"
                    >
                      <a-icon slot="prefix" type="api" />
                    </a-input>
                    <div class="field-hint">
                      <a-icon type="info-circle" />
                      <span>{{ $t('profile.notifications.webhookHint') }}</span>
                    </div>
                  </a-form-item>

                  <a-form-item :label="$t('profile.notifications.webhookToken')">
                    <a-input-password
                      v-decorator="['webhook_token', { initialValue: notificationSettings.webhook_token }]"
                      :placeholder="$t('profile.notifications.webhookTokenPlaceholder')"
                    >
                      <a-icon slot="prefix" type="key" />
                    </a-input-password>
                    <div class="field-hint">
                      <a-icon type="info-circle" />
                      <span>{{ $t('profile.notifications.webhookTokenHint') }}</span>
                    </div>
                  </a-form-item>

                  <a-form-item>
                    <a-button type="primary" :loading="savingNotifications" @click="handleSaveNotifications">
                      {{ $t('common.save') }}
                    </a-button>
                    <a-button style="margin-left: 12px" @click="handleTestNotification" :loading="testingNotification">
                      {{ $t('profile.notifications.testBtn') }}
                    </a-button>
                  </a-form-item>
                </a-form>
              </div>
            </a-tab-pane>

            <!-- Exports tab -->
            <a-tab-pane key="credits" :tab="$t('profile.tab.exports')">
              <a-table
                :columns="creditsLogColumns"
                :dataSource="creditsLog"
                :loading="creditsLogLoading"
                :pagination="creditsLogPagination"
                :rowKey="record => record.id"
                size="small"
                @change="handleCreditsLogChange"
              >
                <template slot="action" slot-scope="text">
                  <a-tag :color="getActionColor(text)">
                    {{ getActionLabel(text) }}
                  </a-tag>
                </template>
                <template slot="amount" slot-scope="text">
                  <span :class="text >= 0 ? 'amount-positive' : 'amount-negative'">
                    {{ text >= 0 ? '+' : '' }}{{ text }}
                  </span>
                </template>
                <template slot="created_at" slot-scope="text">
                  <span>{{ formatCreditsLogTime(text) }}</span>
                </template>
              </a-table>
            </a-tab-pane>

          </a-tabs>
        </div>
      </a-col>
    </a-row>
  </div>
</template>
<script>
import { getProfile, updateProfile, getMyCreditsLog, getMyReferrals, getNotificationSettings, updateNotificationSettings, testNotificationSettings } from '@/api/user'
import { getSettingsValues } from '@/api/settings'
import { baseMixin } from '@/store/app-mixin'
import { formatBrowserLocalDateTime } from '@/utils/userTime'

export default {
  name: 'Profile',
  components: {},
  mixins: [baseMixin],
  data () {
    return {
      loading: false,
      saving: false,
      changingPassword: false,
      sendingPwdCode: false,
      pwdCodeCountdown: 0,
      pwdCodeTimer: null,
      activeTab: 'basic',
      profile: {
        id: null,
        username: '',
        nickname: '',
        email: '',
        avatar: '',
        timezone: '',
        role: 'user',
        last_login_at: null
      },
      timezoneIanaList: [
        'UTC',
        'Etc/UTC',
        'Asia/Shanghai',
        'Asia/Hong_Kong',
        'Asia/Taipei',
        'Asia/Tokyo',
        'Asia/Seoul',
        'Asia/Singapore',
        'Asia/Dubai',
        'Asia/Kolkata',
        'Europe/London',
        'Europe/Paris',
        'Europe/Berlin',
        'America/New_York',
        'America/Chicago',
        'America/Denver',
        'America/Los_Angeles',
        'America/Toronto',
        'America/Sao_Paulo',
        'Australia/Sydney',
        'Pacific/Auckland'
      ],
      // Credits log
      creditsLog: [],
      creditsLogLoading: false,
      creditsLogPagination: {
        current: 1,
        pageSize: 10,
        total: 0
      },
      // Referral data
      referralData: {
        list: [],
        total: 0,
        referral_code: '',
        referral_bonus: 0,
        register_bonus: 0
      },
      referralLoading: false,
      referralPagination: {
        current: 1,
        pageSize: 10,
        total: 0
      },
      billing: {
        credits: 0,
        is_vip: false,
        vip_expires_at: null,
        billing_enabled: false,
        feature_costs: {}
      },
      rechargeTelegramUrl: 'https://t.me/your_support_bot',
      // Notification settings
      notificationSettings: {
        default_channels: ['browser'],
        telegram_bot_token: '',
        telegram_chat_id: '',
        email: '',
        phone: '',
        discord_webhook: '',
        webhook_url: '',
        webhook_token: ''
      },
      savingNotifications: false,
      testingNotification: false
    }
  },
  computed: {
    isDarkTheme () {
      return this.navTheme === 'dark' || this.navTheme === 'realdark'
    },
    isVip () {
      if (!this.billing.vip_expires_at) return false
      const expiresAt = new Date(this.billing.vip_expires_at)
      return expiresAt > new Date()
    },
    creditsLogColumns () {
      return [
        {
          title: this.$t('profile.creditsLog.time'),
          dataIndex: 'created_at',
          width: 160,
          scopedSlots: { customRender: 'created_at' }
        },
        {
          title: this.$t('profile.creditsLog.action'),
          dataIndex: 'action',
          width: 100,
          scopedSlots: { customRender: 'action' }
        },
        {
          title: this.$t('profile.creditsLog.amount'),
          dataIndex: 'amount',
          width: 100,
          scopedSlots: { customRender: 'amount' }
        },
        {
          title: this.$t('profile.creditsLog.balance'),
          dataIndex: 'balance_after',
          width: 100
        },
        {
          title: this.$t('profile.creditsLog.remark'),
          dataIndex: 'remark',
          ellipsis: true
        }
      ]
    },
    referralColumns () {
      return [
        {
          title: this.$t('profile.referral.user'),
          dataIndex: 'username',
          scopedSlots: { customRender: 'user' }
        },
        {
          title: this.$t('profile.referral.registerTime'),
          dataIndex: 'created_at',
          width: 180,
          scopedSlots: { customRender: 'created_at' }
        }
      ]
    },
    referralLink () {
      const baseUrl = window.location.origin + window.location.pathname
      const ref = this.referralData.referral_code || this.profile.id
      return `${baseUrl}#/user/login?ref=${ref}`
    },
  },
  watch: {
    activeTab (val) {
      if (val === 'credits' && this.creditsLog.length === 0) {
        this.loadCreditsLog()
      }
      if (val === 'notifications' && !this.notificationSettings.telegram_chat_id && !this.notificationSettings.discord_webhook) {
        this.loadNotificationSettings()
      }
    }
  },
  beforeCreate () {
    this.profileForm = this.$form.createForm(this, { name: 'profile' })
    this.passwordForm = this.$form.createForm(this, { name: 'password' })
    this.notificationForm = this.$form.createForm(this, { name: 'notification' })
  },
  mounted () {
    this.loadProfile()
  },
  beforeDestroy () {
    if (this.pwdCodeTimer) {
      clearInterval(this.pwdCodeTimer)
    }
  },
  methods: {
    async loadProfile () {
      this.loading = true
      try {
        const res = await getProfile()
        if (res.code === 1) {
          this.profile = res.data
          // 提取计费信息
          if (res.data.billing) {
            this.billing = res.data.billing
          }
          // 提取通知设置
          if (res.data.notification_settings) {
            this.notificationSettings = {
              default_channels: res.data.notification_settings.default_channels || ['browser'],
              telegram_bot_token: res.data.notification_settings.telegram_bot_token || '',
              telegram_chat_id: res.data.notification_settings.telegram_chat_id || '',
              email: res.data.notification_settings.email || res.data.email || '',
              phone: res.data.notification_settings.phone || '',
              discord_webhook: res.data.notification_settings.discord_webhook || '',
              webhook_url: res.data.notification_settings.webhook_url || '',
              webhook_token: res.data.notification_settings.webhook_token || ''
            }
          }
          this.$nextTick(() => {
            this.profileForm.setFieldsValue({
              nickname: this.profile.nickname,
              email: this.profile.email,
              timezone: this.profile.timezone || ''
            })
          })
        } else {
          this.$message.error(res.msg || 'Failed to load profile')
        }
      } catch (error) {
        this.$message.error('Failed to load profile')
      } finally {
        this.loading = false
      }
    },

    async loadRechargeUrl () {
      // 只有管理员才能获取设置，普通用户使用默认值
      if (this.profile.role === 'admin') {
        try {
          const res = await getSettingsValues()
          if (res.code === 1 && res.data && res.data.billing) {
            this.rechargeTelegramUrl = res.data.billing.RECHARGE_TELEGRAM_URL || this.rechargeTelegramUrl
          }
        } catch (e) {
          // 忽略错误，使用默认值
        }
      }
    },

    handleRecharge () {
      // 跳转到站内会员/充值页
      this.$router.push('/billing')
    },

    formatCredits (credits) {
      if (!credits && credits !== 0) return '0'
      return Number(credits).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
    },

    formatDate (dateStr) {
      if (!dateStr) return ''
      const date = new Date(dateStr)
      return date.toLocaleDateString()
    },

    handleSaveProfile () {
      this.profileForm.validateFields(async (err, values) => {
        if (err) return

        this.saving = true
        try {
          const res = await updateProfile({
            nickname: values.nickname,
            timezone: values.timezone != null ? values.timezone : ''
          })
          if (res.code === 1) {
            this.$message.success(res.msg || 'Profile updated successfully')
            this.loadProfile()
            this.$store.dispatch('FetchUserInfo').catch(() => {})
          } else {
            this.$message.error(res.msg || 'Update failed')
          }
        } catch (error) {
          this.$message.error('Update failed')
        } finally {
          this.saving = false
        }
      })
    },

    validateConfirmPassword (rule, value, callback) {
      const newPassword = this.passwordForm.getFieldValue('new_password')
      if (value && value !== newPassword) {
        callback(this.$t('profile.passwordMismatch'))
      } else {
        callback()
      }
    },

    async handleSendPwdCode () {
      if (!this.profile.email) {
        this.$message.error(this.$t('profile.noEmailWarning'))
        return
      }

      this.sendingPwdCode = true
      try {
        const { sendVerificationCode } = await import('@/api/auth')
        const res = await sendVerificationCode({
          email: this.profile.email,
          type: 'change_password'
        })
        if (res.code === 1) {
          this.$message.success(this.$t('profile.codeSent'))
          this.startPwdCodeCountdown()
        } else {
          this.$message.error(res.msg || 'Failed to send code')
        }
      } catch (error) {
        this.$message.error(error.response?.data?.msg || 'Failed to send code')
      } finally {
        this.sendingPwdCode = false
      }
    },

    startPwdCodeCountdown () {
      this.pwdCodeCountdown = 60
      this.pwdCodeTimer = setInterval(() => {
        this.pwdCodeCountdown--
        if (this.pwdCodeCountdown <= 0) {
          clearInterval(this.pwdCodeTimer)
          this.pwdCodeTimer = null
        }
      }, 1000)
    },

    validateNewPassword (rule, value, callback) {
      if (!value) {
        callback()
        return
      }
      if (value.length < 8) {
        callback(new Error(this.$t('user.register.pwdMinLength')))
        return
      }
      if (!/[A-Z]/.test(value)) {
        callback(new Error(this.$t('user.register.pwdUppercase')))
        return
      }
      if (!/[a-z]/.test(value)) {
        callback(new Error(this.$t('user.register.pwdLowercase')))
        return
      }
      if (!/[0-9]/.test(value)) {
        callback(new Error(this.$t('user.register.pwdNumber')))
        return
      }
      callback()
    },

    handleChangePassword () {
      this.passwordForm.validateFields(async (err, values) => {
        if (err) return

        this.changingPassword = true
        try {
          const { changePassword: changePasswordApi } = await import('@/api/auth')
          const res = await changePasswordApi({
            code: values.code,
            new_password: values.new_password
          })
          if (res.code === 1) {
            this.$message.success(res.msg || 'Password changed successfully')
            this.passwordForm.resetFields()
          } else {
            this.$message.error(res.msg || 'Change password failed')
          }
        } catch (error) {
          this.$message.error(error.response?.data?.msg || 'Change password failed')
        } finally {
          this.changingPassword = false
        }
      })
    },

    getRoleColor (role) {
      const colors = {
        admin: 'red',
        manager: 'orange',
        user: 'blue',
        viewer: 'default'
      }
      return colors[role] || 'default'
    },

    getRoleLabel (role) {
      const labels = {
        admin: this.$t('userManage.roleAdmin'),
        manager: this.$t('userManage.roleManager'),
        user: this.$t('userManage.roleUser'),
        viewer: this.$t('userManage.roleViewer')
      }
      return labels[role] || role
    },

    formatTime (timestamp) {
      return formatBrowserLocalDateTime(timestamp, { fallback: '' })
    },

    formatCreditsLogTime (timestamp) {
      return formatBrowserLocalDateTime(timestamp, { fallback: '' })
    },

    // Credits log methods
    async loadCreditsLog () {
      this.creditsLogLoading = true
      try {
        const res = await getMyCreditsLog({
          page: this.creditsLogPagination.current,
          page_size: this.creditsLogPagination.pageSize
        })
        if (res.code === 1) {
          this.creditsLog = res.data.items || []
          this.creditsLogPagination.total = res.data.total || 0
        }
      } catch (e) {
        this.$message.error('Failed to load credits log')
      } finally {
        this.creditsLogLoading = false
      }
    },

    handleCreditsLogChange (pagination) {
      this.creditsLogPagination.current = pagination.current
      this.loadCreditsLog()
    },

    // Referral methods
    async loadReferrals () {
      this.referralLoading = true
      try {
        const res = await getMyReferrals({
          page: this.referralPagination.current,
          page_size: this.referralPagination.pageSize
        })
        if (res.code === 1) {
          this.referralData = {
            list: res.data.list || [],
            total: res.data.total || 0,
            referral_code: res.data.referral_code || '',
            referral_bonus: res.data.referral_bonus || 0,
            register_bonus: res.data.register_bonus || 0
          }
          this.referralPagination.total = res.data.total || 0
        }
      } catch (e) {
        this.$message.error('Failed to load referral data')
      } finally {
        this.referralLoading = false
      }
    },

    handleReferralChange (pagination) {
      this.referralPagination.current = pagination.current
      this.loadReferrals()
    },

    copyReferralLink () {
      const link = this.referralLink
      if (navigator.clipboard) {
        navigator.clipboard.writeText(link).then(() => {
          this.$message.success(this.$t('profile.referral.linkCopied') || '邀请链接已复制')
        }).catch(() => {
          this.fallbackCopy(link)
        })
      } else {
        this.fallbackCopy(link)
      }
    },

    fallbackCopy (text) {
      const textarea = document.createElement('textarea')
      textarea.value = text
      document.body.appendChild(textarea)
      textarea.select()
      try {
        document.execCommand('copy')
        this.$message.success(this.$t('profile.referral.linkCopied') || '邀请链接已复制')
      } catch (err) {
        this.$message.error('Copy failed')
      }
      document.body.removeChild(textarea)
    },

    getActionColor (action) {
      const colors = {
        consume: 'red',
        recharge: 'green',
        admin_adjust: 'blue',
        refund: 'orange',
        vip_grant: 'gold',
        vip_revoke: 'default',
        register_bonus: 'cyan',
        referral_bonus: 'purple',
        // 指标社区相关
        indicator_purchase: 'volcano',
        indicator_sale: 'lime'
      }
      return colors[action] || 'default'
    },

    getActionLabel (action) {
      const labels = {
        consume: this.$t('profile.creditsLog.actionConsume') || '消费',
        recharge: this.$t('profile.creditsLog.actionRecharge') || '充值',
        admin_adjust: this.$t('profile.creditsLog.actionAdjust') || '调整',
        refund: this.$t('profile.creditsLog.actionRefund') || '退款',
        vip_grant: this.$t('profile.creditsLog.actionVipGrant') || 'VIP授予',
        vip_revoke: this.$t('profile.creditsLog.actionVipRevoke') || 'VIP取消',
        register_bonus: this.$t('profile.creditsLog.actionRegisterBonus') || '注册奖励',
        referral_bonus: this.$t('profile.creditsLog.actionReferralBonus') || '邀请奖励',
        // 指标社区相关
        indicator_purchase: this.$t('profile.creditsLog.actionIndicatorPurchase') || '购买指标',
        indicator_sale: this.$t('profile.creditsLog.actionIndicatorSale') || '出售指标'
      }
      return labels[action] || action
    },

    // Notification settings methods
    async loadNotificationSettings () {
      try {
        const res = await getNotificationSettings()
        if (res.code === 1 && res.data) {
          this.notificationSettings = {
            default_channels: res.data.default_channels || ['browser'],
            telegram_bot_token: res.data.telegram_bot_token || '',
            telegram_chat_id: res.data.telegram_chat_id || '',
            email: res.data.email || this.profile.email || '',
            phone: res.data.phone || '',
            discord_webhook: res.data.discord_webhook || '',
            webhook_url: res.data.webhook_url || '',
            webhook_token: res.data.webhook_token || ''
          }
          // Update form values
          this.$nextTick(() => {
            this.notificationForm.setFieldsValue({
              default_channels: this.notificationSettings.default_channels,
              telegram_bot_token: this.notificationSettings.telegram_bot_token,
              telegram_chat_id: this.notificationSettings.telegram_chat_id,
              email: this.notificationSettings.email,
              phone: this.notificationSettings.phone,
              discord_webhook: this.notificationSettings.discord_webhook,
              webhook_url: this.notificationSettings.webhook_url,
              webhook_token: this.notificationSettings.webhook_token
            })
          })
        }
      } catch (e) {
        // Use default values
      }
    },

    _mapNotifyTestError (channel, err) {
      const e = (err || '').trim()
      if (channel === 'email') {
        if (e === 'missing_SMTP_HOST') {
          return this.$t('profile.notifications.errSmtpHost')
        }
        if (e === 'missing_SMTP_FROM') {
          return this.$t('profile.notifications.errSmtpFrom')
        }
        if (e === 'missing_email_target') {
          return this.$t('profile.notifications.errEmailTarget')
        }
      }
      return e ? `${channel}: ${e}` : ''
    },

    handleSaveNotifications () {
      this.notificationForm.validateFields(async (err, values) => {
        if (err) return

        this.savingNotifications = true
        try {
          const res = await updateNotificationSettings({
            default_channels: values.default_channels || ['browser'],
            telegram_bot_token: values.telegram_bot_token || '',
            telegram_chat_id: values.telegram_chat_id || '',
            email: values.email || '',
            phone: values.phone || '',
            discord_webhook: values.discord_webhook || '',
            webhook_url: values.webhook_url || '',
            webhook_token: values.webhook_token || ''
          })
          if (res.code === 1) {
            this.$message.success(this.$t('profile.notifications.saveSuccess'))
            this.notificationSettings = res.data || this.notificationSettings
          } else {
            this.$message.error(res.msg || '保存失败')
          }
        } catch (e) {
          this.$message.error('保存失败')
        } finally {
          this.savingNotifications = false
        }
      })
    },

    async handleTestNotification () {
      const values = this.notificationForm.getFieldsValue()
      const channels = values.default_channels || []

      if (channels.length === 0) {
        this.$message.warning(this.$t('profile.notifications.selectChannel'))
        return
      }

      // Check if required fields are filled
      if (channels.includes('telegram')) {
        if (!values.telegram_bot_token) {
          this.$message.warning(this.$t('profile.notifications.fillTelegramToken'))
          return
        }
        if (!values.telegram_chat_id) {
          this.$message.warning(this.$t('profile.notifications.fillTelegram'))
          return
        }
      }
      if (channels.includes('email') && !values.email) {
        this.$message.warning(this.$t('profile.notifications.fillEmail'))
        return
      }
      if (channels.includes('phone') && !values.phone) {
        this.$message.warning(this.$t('profile.notifications.fillPhone'))
        return
      }
      if (channels.includes('discord') && !values.discord_webhook) {
        this.$message.warning(this.$t('profile.notifications.fillDiscord'))
        return
      }
      if (channels.includes('webhook') && !values.webhook_url) {
        this.$message.warning(this.$t('profile.notifications.fillWebhook'))
        return
      }

      this.testingNotification = true
      try {
        const saveRes = await updateNotificationSettings({
          default_channels: channels,
          telegram_bot_token: values.telegram_bot_token || '',
          telegram_chat_id: values.telegram_chat_id || '',
          email: values.email || '',
          phone: values.phone || '',
          discord_webhook: values.discord_webhook || '',
          webhook_url: values.webhook_url || '',
          webhook_token: values.webhook_token || ''
        })

        if (saveRes.code !== 1) {
          this.$message.error(saveRes.msg || '保存设置失败')
          return
        }

        const testRes = await testNotificationSettings()
        if (testRes.code !== 1) {
          this.$message.error(testRes.msg || this.$t('profile.notifications.testFailed'))
          return
        }

        const results = (testRes.data && testRes.data.results) || {}
        const failed = Object.keys(results).filter((k) => !results[k].ok)
        if (failed.length === 0) {
          this.$message.success(this.$t('profile.notifications.testSent'))
        } else {
          const detail = failed.map((k) => {
            const err = (results[k] && results[k].error) || ''
            const hint = this._mapNotifyTestError(k, err)
            return hint || (err ? `${k}: ${err}` : k)
          }).join('；')
          this.$message.warning(
            this.$t('profile.notifications.testPartial') + ` — ${detail}`,
            8
          )
        }
      } catch (e) {
        this.$message.error(this.$t('profile.notifications.testFailed'))
      } finally {
        this.testingNotification = false
      }
    }
  }
}
</script>

<style lang="less" scoped>
@primary-color: #1677b7;
@brand-green: #1d6f4f;
@surface: #ffffff;
@page-bg: #f6f5f2;
@border-color: #e6e2dc;
@text-main: #1f2933;
@text-muted: #64707d;

.profile-page {
  padding: 32px;
  min-height: calc(100vh - 120px);
  background: @page-bg;

  // ── Page header ──────────────────────────────────────
  .page-header {
    max-width: 1180px;
    margin: 0 auto 24px;

    .brand-kicker {
      margin: 0 0 6px;
      color: @brand-green;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .page-title {
      margin: 0 0 6px;
      color: @text-main;
      font-size: 24px;
      font-weight: 650;
    }

    .page-desc {
      color: @text-muted;
      font-size: 13px;
      line-height: 1.6;
      margin: 0;
    }
  }

  // ── Workspace row ─────────────────────────────────────
  .profile-workspace-row {
    max-width: 1180px;
    margin-left: auto !important;
    margin-right: auto !important;
    align-items: flex-start;
    // Contain Ant Design gutter negative margins within the page padding
    overflow-x: hidden;
  }

  // ── Identity card (left column) ───────────────────────
  .identity-col {
    position: sticky;
    top: 24px;
  }

  .identity-card {
    background: @surface;
    border: 1px solid @border-color;
    border-radius: 10px;
    padding: 28px 24px 24px;

    .avatar-section {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      padding-bottom: 20px;
      border-bottom: 1px solid @border-color;
      margin-bottom: 20px;

      .ant-avatar {
        box-shadow: none;
        margin-bottom: 14px;
      }

      .username {
        margin: 0 0 8px;
        font-size: 18px;
        font-weight: 650;
        color: @text-main;
      }

      .user-role {
        margin: 0;
      }
    }

    .identity-meta {
      display: flex;
      flex-direction: column;
      gap: 12px;

      .meta-row {
        display: flex;
        flex-direction: column;
        gap: 2px;

        .meta-label {
          font-size: 11px;
          color: @text-muted;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 600;
        }

        .meta-value {
          font-size: 13px;
          color: @text-main;
          font-weight: 500;
          word-break: break-all;
        }
      }
    }
  }

  // ── Settings panel (right column) ────────────────────
  .settings-col {
    display: flex;
    flex-direction: column;
  }

  .settings-panel {
    background: @surface;
    border: 1px solid @border-color;
    border-radius: 10px;
    padding: 0;
    // No overflow:hidden — Ant Design internal row gutters use negative margins
    // which get clipped. Border-radius is handled per-section below.
  }

  // ── Settings tabs ─────────────────────────────────────
  .settings-tabs {
    /deep/ .ant-tabs-bar {
      margin: 0;
      padding: 0 28px;
      border-bottom: 1px solid @border-color;
      background: @surface;
      border-radius: 10px 10px 0 0;  // top corners follow card
    }

    /deep/ .ant-tabs-tab {
      color: @text-muted;
      font-size: 13px;
      font-weight: 500;
      padding: 14px 0;
    }

    /deep/ .ant-tabs-tab-active {
      color: @brand-green;
      font-weight: 650;
    }

    /deep/ .ant-tabs-ink-bar {
      background-color: @brand-green;
    }

    /deep/ .ant-tabs-content {
      overflow: visible; // allow internal a-row negative margins to breathe
    }

    /deep/ .ant-tabs-tabpane {
      padding: 28px;
    }
  }

  // ── Forms inside tabs ─────────────────────────────────
  .profile-form,
  .password-form {
    max-width: 480px;

    /deep/ .ant-input,
    /deep/ .ant-input-password {
      border-radius: 6px;
    }

    .email-hint {
      margin-top: 6px;
      font-size: 12px;
      color: @text-muted;

      &.email-warning {
        color: #faad14;
      }
    }
  }

  .notification-settings-form {
    .field-hint {
      margin-top: 5px;
      font-size: 12px;
      color: @text-muted;
      display: flex;
      align-items: center;
      gap: 4px;

      .anticon {
        font-size: 12px;
      }
    }

    /deep/ .ant-checkbox-group {
      width: 100%;
    }

    /deep/ .ant-checkbox-wrapper {
      margin-bottom: 8px;
    }
  }

  // Credits log amount colors
  .amount-positive {
    color: #52c41a;
    font-weight: 600;
  }

  .amount-negative {
    color: #ff4d4f;
    font-weight: 600;
  }

  // ── Dark theme ─────────────────────────────────────────
  &.theme-dark {
    background: #111315;

    .page-header {
      .brand-kicker { color: #7bc59a; }
      .page-title   { color: #e0e6ed; }
      .page-desc    { color: #8b949e; }
    }

    .identity-card,
    .settings-panel {
      background: #1c1c1c;
      border-color: #2a2f35;
    }

    .identity-card {
      .avatar-section {
        border-bottom-color: #2a2f35;

        .username { color: #e0e6ed; }
      }

      .identity-meta {
        .meta-label { color: #8b949e; }
        .meta-value { color: #c9d1d9; }
      }
    }

    .settings-tabs {
      /deep/ .ant-tabs-bar {
        border-bottom-color: #2a2f35;
        background: #1c1c1c;
      }

      /deep/ .ant-tabs-tab     { color: #8b949e; }
      /deep/ .ant-tabs-tab:hover { color: #e0e6ed; }
      /deep/ .ant-tabs-tab-active { color: #7bc59a; }
      /deep/ .ant-tabs-ink-bar { background-color: #7bc59a; }
    }

    /deep/ .ant-form-item-label label { color: #c9d1d9; }

    /deep/ .ant-input,
    /deep/ .ant-input-password {
      background: #141414;
      border-color: #2a2f35;
      color: #c9d1d9;

      &:hover,
      &:focus { border-color: @primary-color; }
    }

    .notification-settings-form .field-hint { color: #8b949e; }

    /deep/ .ant-table-wrapper {
      .ant-table               { background: #1c1c1c; color: #c9d1d9; }
      .ant-table-thead > tr > th {
        background: #222;
        color: #c9d1d9;
        border-bottom-color: #2a2f35;
      }
      .ant-table-tbody > tr > td {
        background: #1c1c1c;
        color: #c9d1d9;
        border-bottom-color: #2a2f35;
      }
      .ant-table-tbody > tr:hover > td { background: #222; }
      .ant-table-placeholder { background: #1c1c1c; color: #8b949e; }
    }

    /deep/ .ant-alert {
      background: rgba(255,255,255,0.05);
      border-color: #2a2f35;

      .ant-alert-message { color: #c9d1d9; }
      .ant-alert-description { color: #8b949e; }
    }

    .test-result-msg {
      &.success { color: #52c41a; }
      &.error   { color: #f5222d; }
    }
  }

  // ── Responsive ────────────────────────────────────────
  @media (max-width: 991px) {
    padding: 20px 16px;

    .identity-col {
      position: static;
    }

    .identity-card {
      margin-bottom: 16px;
    }

    .settings-tabs {
      /deep/ .ant-tabs-tabpane {
        padding: 20px 16px;
      }
    }
  }
}
</style>
