<template>
  <div class="profile-page" :class="{ 'theme-dark': isDarkTheme }">
    <div class="page-header">
      <div>
        <p class="brand-kicker">QuantBrew</p>
        <h2 class="page-title">{{ $t('profile.title') }}</h2>
        <p class="page-desc">{{ $t('profile.description') }}</p>
      </div>
      <a-button type="primary" class="header-action" @click="activeTab = 'exchange'">
        <a-icon type="key" />
        {{ $t('profile.manageApiKey') }}
      </a-button>
    </div>

    <a-row :gutter="24" class="profile-cards-row control-center-row">
      <a-col :xs="24" :lg="7" class="profile-card-col">
        <a-card :bordered="false" class="profile-card">
          <div class="avatar-section">
            <a-avatar :size="72" :src="profile.avatar || '/avatar2.jpg'" />
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
          <a-divider />
          <div class="profile-info">
            <div class="info-item">
              <a-icon type="user" />
              <span class="label">{{ $t('profile.username') }}:</span>
              <span class="value">{{ profile.username }}</span>
            </div>
            <div class="info-item">
              <a-icon type="mail" />
              <span class="label">{{ $t('profile.email') }}:</span>
              <span class="value">{{ profile.email || '-' }}</span>
            </div>
            <div class="info-item">
              <a-icon type="calendar" />
              <span class="label">{{ $t('profile.lastLogin') }}:</span>
              <span class="value">{{ formatTime(profile.last_login_at) || '-' }}</span>
            </div>
          </div>
        </a-card>
      </a-col>

      <a-col :xs="24" :lg="17" class="right-cards-col">
        <div class="control-grid">
          <button type="button" class="control-tile" @click="activeTab = 'exchange'">
            <span class="tile-icon"><a-icon type="api" /></span>
            <span class="tile-title">{{ $t('profile.tile.apiKeyTitle') }}</span>
            <span class="tile-meta">{{ $t('profile.tile.apiKeyMeta', { count: exchangeCredentials.length }) }}</span>
          </button>
          <button type="button" class="control-tile" @click="activeTab = 'notifications'">
            <span class="tile-icon"><a-icon type="bell" /></span>
            <span class="tile-title">{{ $t('profile.tile.notificationTitle') }}</span>
            <span class="tile-meta">{{ $t('profile.tile.notificationMeta', { count: notificationSettings.default_channels.length }) }}</span>
          </button>
          <button type="button" class="control-tile" @click="activeTab = 'password'">
            <span class="tile-icon"><a-icon type="safety-certificate" /></span>
            <span class="tile-title">{{ $t('profile.tile.securityTitle') }}</span>
            <span class="tile-meta">{{ $t('profile.tile.securityMeta') }}</span>
          </button>
          <button type="button" class="control-tile" @click="activeTab = 'credits'">
            <span class="tile-icon"><a-icon type="audit" /></span>
            <span class="tile-title">{{ $t('profile.tile.creditsTitle') }}</span>
            <span class="tile-meta">{{ $t('profile.tile.creditsMeta', { count: formatCredits(billing.credits) }) }}</span>
          </button>
        </div>

        <a-card :bordered="false" class="risk-card">
          <div class="risk-card-header">
            <div>
              <p class="section-kicker">{{ $t('profile.risk.postureTitle') }}</p>
              <h3>{{ $t('profile.risk.postureSubtitle') }}</h3>
            </div>
            <a-tag color="green">{{ $t('profile.risk.postureTag') }}</a-tag>
          </div>
          <div class="risk-grid">
            <div class="risk-item">
              <span class="risk-label">{{ $t('profile.risk.positionSizing') }}</span>
              <strong>{{ $t('profile.risk.positionSizingVal') }}</strong>
              <span>{{ $t('profile.risk.positionSizingDesc') }}</span>
            </div>
            <div class="risk-item">
              <span class="risk-label">{{ $t('profile.risk.alerts') }}</span>
              <strong>{{ $t('profile.risk.alertsVal') }}</strong>
              <span>{{ $t('profile.risk.alertsDesc') }}</span>
            </div>
            <div class="risk-item">
              <span class="risk-label">{{ $t('profile.risk.connectedAccounts') }}</span>
              <strong>{{ $t('profile.risk.connectedAccountsVal') }}</strong>
              <span>{{ $t('profile.risk.connectedAccountsDesc') }}</span>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- Edit Profile Tabs (Below Cards) -->
    <a-row :gutter="24" style="margin-top: 24px">
      <a-col :xs="24">
        <a-card :bordered="false" class="edit-card">
          <a-tabs v-model="activeTab">
            <!-- Basic Info Tab -->
            <a-tab-pane key="basic" :tab="$t('profile.basicInfo')">
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
                    :value="profile.email || '-'"
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
                    <a-icon type="save" />
                    {{ $t('common.save') }}
                  </a-button>
                </a-form-item>
              </a-form>
            </a-tab-pane>

            <!-- Change Password Tab -->
            <a-tab-pane key="password" :tab="$t('profile.changePassword')">
              <a-form :form="passwordForm" layout="vertical" class="password-form">
                <a-alert
                  :message="$t('profile.passwordHintNew')"
                  type="info"
                  showIcon
                  style="margin-bottom: 24px"
                />

                <!-- Email Display & Verification Code -->
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
                    <a-icon type="key" />
                    {{ $t('profile.changePassword') }}
                  </a-button>
                </a-form-item>
              </a-form>
            </a-tab-pane>

            <!-- Usage Log Tab -->
            <a-tab-pane key="credits" :tab="$t('profile.tile.creditsTitle')">
              <a-table
                :columns="creditsLogColumns"
                :dataSource="creditsLog"
                :loading="creditsLogLoading"
                :pagination="creditsLogPagination"
                :rowKey="record => record.id"
                size="small"
                @change="handleCreditsLogChange"
              >
                <!-- Action Column -->
                <template slot="action" slot-scope="text">
                  <a-tag :color="getActionColor(text)">
                    {{ getActionLabel(text) }}
                  </a-tag>
                </template>

                <!-- Amount Column -->
                <template slot="amount" slot-scope="text">
                  <span :class="text >= 0 ? 'amount-positive' : 'amount-negative'">
                    {{ text >= 0 ? '+' : '' }}{{ text }}
                  </span>
                </template>

                <!-- Time Column -->
                <template slot="created_at" slot-scope="text">
                  {{ formatCreditsLogTime(text) }}
                </template>
              </a-table>
            </a-tab-pane>

            <!-- Notification Settings Tab (通知设置) -->
            <a-tab-pane key="notifications" :tab="$t('profile.notifications.title')">
              <div class="notification-settings-form">
                <a-alert
                  :message="$t('profile.notifications.hint')"
                  type="info"
                  showIcon
                  style="margin-bottom: 24px"
                />

                <a-form :form="notificationForm" layout="vertical" style="max-width: 600px;">
                  <!-- Default Channels -->
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

                  <!-- Telegram Bot Token -->
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

                  <!-- Telegram Chat ID -->
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

                  <!-- Notification Email -->
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

                  <!-- Phone Number (SMS) -->
                  <a-form-item :label="$t('profile.notifications.phone')">
                    <a-input
                      v-decorator="['phone', { initialValue: notificationSettings.phone }]"
                      :placeholder="$t('profile.notifications.phonePlaceholder')"
                    >
                      <a-icon slot="prefix" type="phone" />
                    </a-input>
                    <div class="field-hint">
                      <a-icon type="info-circle" />
                      <span>{{ $t('profile.notifications.phoneHint') }}</span>
                    </div>
                  </a-form-item>

                  <!-- Discord Webhook -->
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

                  <!-- Webhook URL -->
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

                  <!-- Webhook Token -->
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
                      <a-icon type="save" />
                      {{ $t('common.save') }}
                    </a-button>
                    <a-button style="margin-left: 12px" @click="handleTestNotification" :loading="testingNotification">
                      <a-icon type="experiment" />
                      {{ $t('profile.notifications.testBtn') }}
                    </a-button>
                  </a-form-item>
                </a-form>
              </div>
            </a-tab-pane>

            <!-- API Key Management Tab -->
            <a-tab-pane key="exchange" :tab="$t('profile.exchange.title')">
              <div class="exchange-config-section">
                <a-alert
                  :message="$t('profile.exchange.hint')"
                  type="info"
                  showIcon
                  style="margin-bottom: 16px"
                />
                <div style="margin-bottom: 16px; text-align: right;">
                  <a-button type="primary" icon="plus" @click="openAddExchangeModal">
                    {{ $t('profile.exchange.addAccount') }}
                  </a-button>
                </div>
                <a-table
                  :columns="exchangeColumns"
                  :dataSource="exchangeCredentials"
                  :loading="exchangeLoading"
                  :rowKey="record => record.id"
                  :locale="{ emptyText: $t('profile.exchange.noAccounts') }"
                  size="small"
                >
                  <template slot="exchange_id" slot-scope="text, record">
                    <span style="text-transform: capitalize; font-weight: 500;">{{ getExchangeDisplayName(text) }}</span>
                    <a-tag
                      v-if="record.enable_demo_trading"
                      color="orange"
                      size="small"
                      style="margin-left: 6px;"
                    >
                      {{ $t('profile.exchange.demoTag') }}
                    </a-tag>
                  </template>
                  <template slot="api_key_hint" slot-scope="text, record">
                    <span class="credential-hint">{{ text || record.name || '-' }}</span>
                  </template>
                  <template slot="created_at" slot-scope="text">
                    {{ formatTime(text) }}
                  </template>
                  <template slot="action" slot-scope="text, record">
                    <a-popconfirm
                      :title="$t('profile.exchange.deleteConfirm')"
                      @confirm="handleDeleteCredential(record.id)"
                      :okText="$t('common.confirm')"
                      :cancelText="$t('common.cancel')"
                    >
                      <a-button type="danger" size="small" ghost icon="delete">
                        {{ $t('common.delete') }}
                      </a-button>
                    </a-popconfirm>
                  </template>
                </a-table>
              </div>
            </a-tab-pane>

          </a-tabs>
        </a-card>
      </a-col>
    </a-row>

    <exchange-account-modal
      :visible.sync="showAddExchangeModal"
      @success="loadExchangeCredentials"
    />
  </div>
</template>

<script>
import { getProfile, updateProfile, getMyCreditsLog, getMyReferrals, getNotificationSettings, updateNotificationSettings, testNotificationSettings } from '@/api/user'
import { getSettingsValues } from '@/api/settings'
import { listExchangeCredentials, deleteExchangeCredential } from '@/api/credentials'
import { baseMixin } from '@/store/app-mixin'
import ExchangeAccountModal from '@/components/ExchangeAccountModal/ExchangeAccountModal.vue'
import { formatBrowserLocalDateTime } from '@/utils/userTime'

export default {
  name: 'Profile',
  components: { ExchangeAccountModal },
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
      testingNotification: false,
      // Exchange config
      exchangeCredentials: [],
      exchangeLoading: false,
      showAddExchangeModal: false
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
    exchangeColumns () {
      return [
        {
          title: this.$t('profile.exchange.colExchange'),
          dataIndex: 'exchange_id',
          width: 140,
          scopedSlots: { customRender: 'exchange_id' }
        },
        {
          title: this.$t('profile.exchange.colName'),
          dataIndex: 'name',
          width: 140,
          customRender: (text) => text || '-'
        },
        {
          title: this.$t('profile.exchange.colHint'),
          dataIndex: 'api_key_hint',
          scopedSlots: { customRender: 'api_key_hint' }
        },
        {
          title: this.$t('profile.exchange.colCreatedAt'),
          dataIndex: 'created_at',
          width: 180,
          scopedSlots: { customRender: 'created_at' }
        },
        {
          title: this.$t('profile.exchange.colActions'),
          width: 120,
          scopedSlots: { customRender: 'action' }
        }
      ]
    }
  },
  watch: {
    activeTab (val) {
      if (val === 'credits' && this.creditsLog.length === 0) {
        this.loadCreditsLog()
      }
      if (val === 'notifications' && !this.notificationSettings.telegram_chat_id && !this.notificationSettings.discord_webhook) {
        this.loadNotificationSettings()
      }
      if (val === 'exchange' && this.exchangeCredentials.length === 0) {
        this.loadExchangeCredentials()
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
    this.loadExchangeCredentials()
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

    // Exchange credential methods
    async loadExchangeCredentials () {
      this.exchangeLoading = true
      try {
        const res = await listExchangeCredentials()
        if (res.code === 1 && res.data) {
          this.exchangeCredentials = res.data.items || []
        }
      } catch (e) {
        this.$message.error('Failed to load exchange accounts')
      } finally {
        this.exchangeLoading = false
      }
    },

    openAddExchangeModal () {
      this.showAddExchangeModal = true
    },

    openExternalLink (url) {
      if (!url) return
      window.open(url, '_blank')
    },

    getExchangeDisplayName (id) {
      const names = {
        binance: 'Binance',
        okx: 'OKX',
        bitget: 'Bitget',
        bybit: 'Bybit',
        coinbaseexchange: 'Coinbase',
        kraken: 'Kraken',
        kucoin: 'KuCoin',
        gate: 'Gate.io',
        bitfinex: 'Bitfinex',
        deepcoin: 'Deepcoin',
        htx: 'HTX',
        ibkr: 'IBKR',
        mt5: 'MetaTrader 5'
      }
      return names[id] || id
    },

    async handleDeleteCredential (id) {
      try {
        const res = await deleteExchangeCredential(id)
        if (res.code === 1) {
          this.$message.success(this.$t('profile.exchange.deleteSuccess'))
          this.loadExchangeCredentials()
        } else {
          this.$message.error(res.msg || 'Delete failed')
        }
      } catch (e) {
        this.$message.error('Delete failed')
      }
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

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 24px;
    max-width: 1180px;
    margin: 0 auto 28px;

    .brand-kicker {
      margin: 0 0 8px;
      color: @brand-green;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .page-title {
      margin: 0 0 8px;
      color: @text-main;
      font-size: 28px;
      font-weight: 650;
      letter-spacing: 0;
    }

    .page-desc {
      max-width: 720px;
      color: @text-muted;
      font-size: 14px;
      line-height: 1.7;
      margin: 0;
    }

    .header-action {
      height: 40px;
      border-radius: 6px;
      background: @brand-green;
      border-color: @brand-green;
      box-shadow: none;
    }
  }

  .profile-cards-row,
  > .ant-row[style] {
    max-width: 1180px;
    margin-left: auto !important;
    margin-right: auto !important;
  }

  .profile-cards-row {
    display: flex;
    align-items: stretch;

    .profile-card-col,
    .right-cards-col {
      display: flex;
      flex-direction: column;

      .ant-card {
        height: 100%;
        display: flex;
        flex-direction: column;
      }

      /deep/ .ant-card-body {
        flex: 1;
        display: flex;
        flex-direction: column;
      }
    }

    .right-cards-row {
      height: 100%;
      display: flex;

      .ant-col {
        display: flex;
        flex-direction: column;

        .ant-card {
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        /deep/ .ant-card-body {
          flex: 1;
          display: flex;
          flex-direction: column;
        }
      }
    }
  }

  .control-center-row {
    margin-bottom: 24px;
  }

  .profile-card {
    border: 1px solid @border-color;
    border-radius: 8px;
    box-shadow: none;
    text-align: left;
    background: @surface;

    .avatar-section {
      padding: 4px 0 20px;
      text-align: left;

      .ant-avatar {
        box-shadow: none;
      }

      .username {
        margin: 16px 0 8px;
        font-size: 20px;
        font-weight: 650;
        color: @text-main;
      }

      .user-role {
        margin: 0;
      }
    }

    .profile-info {
      text-align: left;
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-around;

      .info-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px 0;
        border-bottom: 1px solid #f1efeb;

        &:last-child {
          border-bottom: none;
        }

        .anticon {
          font-size: 16px;
          color: @brand-green;
        }

        .label {
          color: @text-muted;
          margin-right: 8px;
        }

        .value {
          color: @text-main;
          font-weight: 500;
        }
      }
    }
  }

  .control-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
    margin-bottom: 16px;
  }

  .control-tile {
    display: grid;
    grid-template-columns: 38px 1fr;
    grid-template-areas:
      "icon title"
      "icon meta";
    gap: 2px 14px;
    width: 100%;
    min-height: 92px;
    padding: 18px;
    text-align: left;
    background: @surface;
    border: 1px solid @border-color;
    border-radius: 8px;
    cursor: pointer;
    transition: border-color 0.18s ease, background 0.18s ease;

    &:hover {
      background: #fbfaf8;
      border-color: #cfd8d2;
    }
  }

  .tile-icon {
    grid-area: icon;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 38px;
    height: 38px;
    color: @brand-green;
    background: #eef7f1;
    border-radius: 8px;
    font-size: 17px;
  }

  .tile-title {
    grid-area: title;
    color: @text-main;
    font-size: 15px;
    font-weight: 650;
  }

  .tile-meta {
    grid-area: meta;
    color: @text-muted;
    font-size: 12px;
    line-height: 1.5;
  }

  .risk-card {
    border: 1px solid @border-color;
    border-radius: 8px;
    box-shadow: none;

    .risk-card-header {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 18px;
    }

    .section-kicker {
      margin: 0 0 6px;
      color: @brand-green;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    h3 {
      margin: 0;
      color: @text-main;
      font-size: 18px;
      font-weight: 650;
    }
  }

  .risk-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 18px;
  }

  .risk-item {
    display: flex;
    flex-direction: column;
    gap: 5px;

    .risk-label {
      color: @text-muted;
      font-size: 12px;
    }

    strong {
      color: @text-main;
      font-size: 15px;
      font-weight: 650;
    }

    span:last-child {
      color: @text-muted;
      font-size: 12px;
      line-height: 1.55;
    }
  }

  .edit-card {
    border: 1px solid @border-color;
    border-radius: 8px;
    box-shadow: none;
    background: @surface;

    /deep/ .ant-card-body {
      padding: 28px;
    }

    /deep/ .ant-tabs-bar {
      margin-bottom: 28px;
      border-bottom-color: #ebe7e1;
    }

    /deep/ .ant-tabs-tab {
      color: @text-muted;
      font-weight: 500;
    }

    /deep/ .ant-tabs-tab-active {
      color: @brand-green;
      font-weight: 650;
    }

    /deep/ .ant-tabs-ink-bar {
      background-color: @brand-green;
    }

    .profile-form,
    .password-form {
      max-width: 560px;

      /deep/ .ant-input,
      /deep/ .ant-input-password {
        border-radius: 8px;
      }

      .email-hint {
        margin-top: 8px;
        font-size: 12px;
        color: rgba(0, 0, 0, 0.45);

        &.email-warning {
          color: #faad14;
        }
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

    // Notification settings form
    .notification-settings-form {
      .field-hint {
        margin-top: 6px;
        font-size: 12px;
        color: rgba(0, 0, 0, 0.45);
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
  }

  // Credits Card 积分卡片
  .credits-card {
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;

    /deep/ .ant-card-body {
      background: transparent;
      display: flex;
      flex-direction: column;
    }

    /deep/ .ant-divider {
      border-color: rgba(255, 255, 255, 0.2);
    }

    .credits-header {
      .credits-title {
        font-size: 16px;
        font-weight: 600;
        margin: 0;
        color: #fff;
        display: flex;
        align-items: center;
        gap: 8px;

        .anticon {
          font-size: 18px;
        }
      }
    }

    .credits-body {
      padding: 20px 0;
      text-align: center;
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;

      .credits-amount {
        .amount-value {
          font-size: 42px;
          font-weight: 700;
          color: #fff;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .amount-label {
          font-size: 16px;
          color: rgba(255, 255, 255, 0.9);
          margin-left: 8px;
        }
      }

      .vip-status {
        margin-top: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        font-size: 13px;

        .vip-active {
          color: #ffd700;
        }

        .vip-expired {
          color: rgba(255, 255, 255, 0.6);
        }

        .no-vip {
          color: rgba(255, 255, 255, 0.7);
        }
      }
    }

    .credits-actions {
      text-align: center;
      margin-top: auto;

      .ant-btn {
        border-radius: 20px;
        padding: 0 24px;
        height: 36px;
        font-weight: 500;
        background: #fff;
        color: #667eea;
        border: none;

        &:hover {
          background: rgba(255, 255, 255, 0.9);
          color: #764ba2;
        }
      }
    }

    .credits-hint {
      margin-top: 12px;
      text-align: center;
      font-size: 12px;
      color: rgba(255, 255, 255, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
    }
  }

  // Referral Card 邀请卡片
  .referral-card {
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
    color: #fff;

    /deep/ .ant-card-body {
      background: transparent;
      display: flex;
      flex-direction: column;
    }

    /deep/ .ant-divider {
      border-color: rgba(255, 255, 255, 0.2);
    }

    .referral-header {
      .referral-title {
        font-size: 16px;
        font-weight: 600;
        margin: 0;
        color: #fff;
        display: flex;
        align-items: center;
        gap: 8px;

        .anticon {
          font-size: 18px;
        }
      }
    }

    .referral-body {
      padding: 12px 0;
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;

      .referral-stats {
        display: flex;
        justify-content: space-around;

        .stat-item {
          text-align: center;

          .stat-value {
            font-size: 28px;
            font-weight: 700;
            color: #fff;
            display: block;
          }

          .stat-label {
            font-size: 12px;
            color: rgba(255, 255, 255, 0.8);
          }
        }
      }

      .referral-link-section {
        .link-label {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.9);
          margin-bottom: 6px;
        }

        .link-box {
          /deep/ .ant-input {
            background: rgba(255, 255, 255, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.3);
            color: #fff;

            &::placeholder {
              color: rgba(255, 255, 255, 0.6);
            }
          }

          /deep/ .anticon-copy {
            color: #fff;

            &:hover {
              color: #ffd700;
            }
          }
        }
      }

      .referral-hint {
        margin-top: auto;
        text-align: center;
        font-size: 12px;
        color: rgba(255, 255, 255, 0.85);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;

        .anticon-gift {
          color: #ffd700;
        }
      }
    }
  }

  // Referral user cell in table
  .referral-user-cell {
    display: flex;
    align-items: center;
    gap: 10px;

    .user-info {
      display: flex;
      flex-direction: column;

      .nickname {
        font-weight: 500;
        color: #333;
      }

      .username {
        font-size: 12px;
        color: #999;
      }
    }
  }

  // Exchange config
  .exchange-config-section {
    .credential-hint {
      font-family: 'SFMono-Regular', Consolas, monospace;
      font-size: 13px;
      color: #666;
    }
  }

  .test-result-msg {
    margin-top: 8px;
    font-size: 13px;
    display: flex;
    align-items: center;
    gap: 6px;
    &.success {
      color: #52c41a;
    }
    &.error {
      color: #f5222d;
    }
  }

  // Dark theme
  &.theme-dark {
    background: #111315;

    .page-header {
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

    .profile-card,
    .edit-card,
    .risk-card,
    .control-tile {
      background: #1c1c1c;
      border-color: #2a2f35;
      box-shadow: none;

      /deep/ .ant-card-body {
        background: #1c1c1c;
      }
    }

    .control-tile:hover {
      background: #202428;
      border-color: #3a423d;
    }

    .tile-icon {
      background: rgba(123, 197, 154, 0.13);
      color: #7bc59a;
    }

    .tile-title,
    .risk-card h3,
    .risk-item strong {
      color: #e0e6ed;
    }

    .tile-meta,
    .risk-item .risk-label,
    .risk-item span:last-child {
      color: #8b949e;
    }

    .risk-card .section-kicker {
      color: #7bc59a;
    }

    .profile-card {
      .avatar-section {
        .username {
          color: #e0e6ed;
        }
      }

      .profile-info {
        .info-item {
          border-bottom-color: #2a2a2a;

          .label {
            color: #8b949e;
          }

          .value {
            color: #e0e6ed;
          }
        }
      }
    }

    .edit-card {
      /deep/ .ant-tabs-bar {
        border-bottom-color: #2a2a2a;
      }

      /deep/ .ant-tabs-tab {
        color: #8b949e;

        &:hover {
          color: #e0e6ed;
        }
      }

      /deep/ .ant-tabs-tab-active {
        color: #7bc59a;
      }

      /deep/ .ant-tabs-ink-bar {
        background-color: #7bc59a;
      }

      /deep/ .ant-form-item-label label {
        color: #c9d1d9;
      }

      /deep/ .ant-input,
      /deep/ .ant-input-password {
        background: #141414;
        border-color: #2a2a2a;
        color: #c9d1d9;

        &:hover,
        &:focus {
          border-color: @primary-color;
        }
      }
    }

    .credits-card {
      background: linear-gradient(135deg, #1c1c1c 0%, #1a1a1a 50%, #141414 100%);
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.25);

      /deep/ .ant-divider {
        border-color: rgba(255, 255, 255, 0.1);
      }

      .credits-actions {
        .ant-btn {
          background: rgba(255, 255, 255, 0.15);
          color: #fff;
          border: 1px solid rgba(255, 255, 255, 0.2);

          &:hover {
            background: rgba(255, 255, 255, 0.25);
          }
        }
      }
    }

    // Tables in tabs (消费记录、交易所配置、邀请列表)
    /deep/ .ant-table-wrapper {
      .ant-table {
        background: #1c1c1c;
        color: #c9d1d9;
      }

      .ant-table-thead > tr > th {
        background: #2a2a2a;
        color: #c9d1d9;
        border-bottom-color: #2a2a2a;
      }

      .ant-table-tbody > tr > td {
        background: #1c1c1c;
        color: #c9d1d9;
        border-bottom-color: #2a2a2a;
      }

      .ant-table-tbody > tr:hover > td {
        background: #2a2a2a;
      }

      .ant-table-placeholder {
        background: #1c1c1c;
        color: #8b949e;
      }

      // 表格内的所有文本元素
      .ant-table-tbody > tr > td,
      .ant-table-tbody > tr > td span,
      .ant-table-tbody > tr > td div,
      .ant-table-tbody > tr > td *:not(.ant-tag):not(.ant-btn) {
        color: #c9d1d9;
      }

      // 金额颜色
      .amount-positive {
        color: #52c41a;
      }

      .amount-negative {
        color: #f5222d;
      }

      // 消费记录 类型标签 - 暗黑模式增强对比度
      .ant-tag {
        border-width: 1px;
        font-weight: 600;
      }
      .ant-tag-red { background: rgba(245,34,45,0.25); border-color: #f5222d; color: #ff7875; }
      .ant-tag-green { background: rgba(82,196,26,0.25); border-color: #52c41a; color: #73d13d; }
      .ant-tag-blue { background: rgba(24,144,255,0.25); border-color: #1890ff; color: #69c0ff; }
      .ant-tag-orange { background: rgba(250,173,20,0.25); border-color: #faad14; color: #ffc53d; }
      .ant-tag-gold { background: rgba(250,173,20,0.25); border-color: #faad14; color: #ffc53d; }
      .ant-tag-cyan { background: rgba(19,194,194,0.25); border-color: #13c2c2; color: #5cdbd3; }
      .ant-tag-purple { background: rgba(114,46,209,0.25); border-color: #722ed1; color: #b37feb; }
      .ant-tag-volcano { background: rgba(250,84,28,0.25); border-color: #fa541c; color: #ff9c6e; }
      .ant-tag-lime { background: rgba(160,212,104,0.25); border-color: #a0d911; color: #bae637; }
      .ant-tag-default { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.2); color: #c9d1d9; }
    }

    // 表单样式（通知设置、交易所配置等）
    .profile-form,
    .password-form,
    .notification-settings-form {
      /deep/ .ant-form-item-label > label {
        color: #c9d1d9;
      }

      /deep/ .ant-form-item-explain,
      /deep/ .ant-form-item-extra {
        color: #8b949e;
      }

      /deep/ .ant-input,
      /deep/ .ant-input-password,
      /deep/ .ant-select-selector,
      /deep/ .ant-input-number {
        background: #141414;
        border-color: #2a2a2a;
        color: #c9d1d9;

        &::placeholder {
          color: #6e7681;
        }
      }

      /deep/ .ant-select-selection-item,
      /deep/ .ant-select-selection-placeholder {
        color: #c9d1d9;
      }

      /deep/ .ant-checkbox-wrapper,
      /deep/ .ant-radio-wrapper {
        color: #c9d1d9;

        span {
          color: #c9d1d9;
        }
      }

      /deep/ .ant-checkbox-checked .ant-checkbox-inner,
      /deep/ .ant-radio-checked .ant-radio-inner {
        background-color: @primary-color;
        border-color: @primary-color;
      }

      // 提示文字
      .email-hint,
      .field-hint {
        color: #8b949e;
      }

      .email-warning {
        color: #f5222d;
      }
    }

    // 通知设置表单
    .notification-settings-form {
      /deep/ .ant-alert {
        background: #1c1c1c;
        border-color: #2a2a2a;
        color: #c9d1d9;

        .ant-alert-message {
          color: #c9d1d9;
        }

        .ant-alert-description {
          color: #8b949e;
        }
      }
    }

    // 交易所配置
    .exchange-config-section {
      .credential-hint {
        color: #8b949e;
      }
    }

    // 测试结果消息
    .test-result-msg {
      &.success {
        color: #52c41a;
      }
      &.error {
        color: #f5222d;
      }
    }

    // 邀请列表中的用户信息
    .referral-user-cell {
      .user-info {
        .nickname {
          color: #c9d1d9;
        }

        .username {
          color: #8b949e;
        }
      }
    }

    // 标签样式
    /deep/ .ant-tag {
      color: #c9d1d9;
    }

    // 消费记录「类型」列：带底色标签文字在暗黑下保持可读
    /deep/ .ant-tag.ant-tag-has-color {
      color: #ffffff !important;
      border-color: transparent !important;
    }

    // 修复暗黑下部分小图标仍为黑色
    /deep/ .ant-input-prefix .anticon,
    /deep/ .ant-input-suffix .anticon,
    /deep/ .field-hint .anticon,
    /deep/ .email-hint .anticon,
    /deep/ .credits-hint .anticon,
    /deep/ .notification-settings-form .anticon {
      color: #c9d1d9 !important;
    }

    // 分页样式
    /deep/ .ant-pagination {
      .ant-pagination-item {
        background: #1c1c1c;
        border-color: #2a2a2a;

        a {
          color: #c9d1d9;
        }

        &:hover {
          border-color: @primary-color;
        }
      }

      .ant-pagination-item-active {
        background: @primary-color;
        border-color: @primary-color;

        a {
          color: #fff;
        }
      }

      .ant-pagination-prev,
      .ant-pagination-next {
        .ant-pagination-item-link {
          background: #1c1c1c;
          border-color: #2a2a2a;
          color: #c9d1d9;
        }
      }

      .ant-pagination-options {
        .ant-select-selector {
          background: #141414;
          border-color: #2a2a2a;
          color: #c9d1d9;
        }
      }
    }

    // 按钮样式
    /deep/ .ant-btn {
      &.ant-btn-default {
        background: #1c1c1c;
        border-color: #2a2a2a;
        color: #c9d1d9;

        &:hover {
          border-color: @primary-color;
          color: @primary-color;
        }
      }
    }
  }
}

// ==================== Mobile Responsive Styles ====================
@media screen and (max-width: 768px) {
  .profile-page {
    padding: 16px;

    .page-header {
      flex-direction: column;
      margin-bottom: 20px;

      .page-title {
        font-size: 22px;
      }

      .page-desc {
        font-size: 13px;
      }

      .header-action {
        width: 100%;
      }
    }

    // Profile cards row - stack vertically
    .profile-cards-row {
      flex-direction: column;

      .profile-card-col {
        margin-bottom: 12px;
      }

      .right-cards-col {
        .right-cards-row {
          flex-direction: column;

          .ant-col {
            margin-bottom: 12px;
          }
        }
      }
    }

    .control-grid,
    .risk-grid {
      grid-template-columns: 1fr;
    }

    .control-tile {
      min-height: 82px;
    }

    .risk-card {
      .risk-card-header {
        flex-direction: column;
      }
    }

    // Profile card adjustments
    .profile-card {
      border-radius: 10px;

      .avatar-section {
        padding: 16px 0;

        /deep/ .ant-avatar {
          width: 80px !important;
          height: 80px !important;
          line-height: 80px !important;
        }

        .username {
          font-size: 18px;
          margin: 12px 0 6px;
        }
      }

      .profile-info {
        .info-item {
          padding: 10px 0;
          flex-wrap: wrap;

          .anticon {
            font-size: 14px;
            margin-right: 8px;
          }

          .label {
            font-size: 13px;
          }

          .value {
            font-size: 13px;
            word-break: break-all;
          }
        }
      }
    }

    // Credits card adjustments
    .credits-card {
      border-radius: 10px;

      .credits-header {
        .credits-title {
          font-size: 15px;

          .anticon {
            font-size: 16px;
          }
        }
      }

      .credits-body {
        padding: 16px 0;

        .credits-amount {
          .amount-value {
            font-size: 32px;
          }

          .amount-label {
            font-size: 14px;
          }
        }

        .vip-status {
          font-size: 12px;
          margin-top: 10px;
        }
      }

      .credits-actions {
        .ant-btn {
          height: 34px;
          padding: 0 20px;
          font-size: 14px;
        }
      }

      .credits-hint {
        font-size: 11px;
        margin-top: 10px;
      }
    }

    // Referral card adjustments
    .referral-card {
      border-radius: 10px;

      .referral-header {
        .referral-title {
          font-size: 15px;

          .anticon {
            font-size: 16px;
          }
        }
      }

      .referral-body {
        padding: 10px 0;

        .referral-stats {
          .stat-item {
            .stat-value {
              font-size: 24px;
            }

            .stat-label {
              font-size: 11px;
            }
          }
        }

        .referral-link-section {
          .link-label {
            font-size: 11px;
          }

          .link-box {
            /deep/ .ant-input {
              font-size: 12px;
            }
          }
        }

        .referral-hint {
          font-size: 11px;
          padding-top: 8px;
        }
      }
    }

    // Edit card adjustments
    .edit-card {
      border-radius: 10px;
      margin-top: 12px !important;

      /deep/ .ant-card-body {
        padding: 12px;
      }

      /deep/ .ant-tabs-nav {
        .ant-tabs-tab {
          padding: 10px 12px;
          font-size: 13px;
        }
      }

      // Allow horizontal scroll for tabs on mobile
      /deep/ .ant-tabs-nav-scroll {
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;

        &::-webkit-scrollbar {
          display: none;
        }
      }

      .profile-form,
      .password-form {
        max-width: 100%;

        /deep/ .ant-form-item-label {
          padding-bottom: 4px;

          label {
            font-size: 13px;
          }
        }

        /deep/ .ant-input,
        /deep/ .ant-input-password {
          font-size: 14px;
        }

        .email-hint {
          font-size: 11px;
        }
      }

      // Password form - verification code section
      .password-form {
        /deep/ .ant-alert {
          font-size: 12px;
          padding: 8px 12px;
        }
      }

      // Notification settings form
      .notification-settings-form {
        /deep/ .ant-alert {
          font-size: 12px;
          padding: 8px 12px;
          margin-bottom: 16px !important;
        }

        /deep/ .ant-form {
          max-width: 100%;
        }

        /deep/ .ant-checkbox-group {
          .ant-row {
            margin-left: 0 !important;
            margin-right: 0 !important;

            .ant-col {
              padding-left: 0 !important;
              padding-right: 8px !important;
            }
          }

          .ant-checkbox-wrapper {
            font-size: 13px;
            margin-bottom: 6px;
          }
        }

        .field-hint {
          font-size: 11px;
          flex-wrap: wrap;
        }

        /deep/ .ant-form-item {
          margin-bottom: 16px;
        }

        // Action buttons
        /deep/ .ant-form-item:last-child {
          .ant-btn {
            width: 100%;
            margin-bottom: 8px;

            & + .ant-btn {
              margin-left: 0 !important;
            }
          }
        }
      }

      // Tables in tabs
      /deep/ .ant-table-wrapper {
        overflow-x: auto;

        .ant-table {
          min-width: 500px;
        }
      }
    }

    // Referral user cell in table
    .referral-user-cell {
      gap: 8px;

      /deep/ .ant-avatar {
        width: 28px !important;
        height: 28px !important;
        line-height: 28px !important;
      }

      .user-info {
        .nickname {
          font-size: 13px;
        }

        .username {
          font-size: 11px;
        }
      }
    }
  }
}

// Extra small devices (phones in portrait)
@media screen and (max-width: 480px) {
  .profile-page {
    padding: 12px;

    .page-header {
      margin-bottom: 12px;

      .page-title {
        font-size: 20px;
      }
    }

    // Credits card
    .credits-card {
      .credits-body {
        .credits-amount {
          .amount-value {
            font-size: 28px;
          }

          .amount-label {
            font-size: 13px;
          }
        }
      }

      .credits-actions {
        .ant-btn {
          width: 100%;
        }
      }
    }

    // Referral card
    .referral-card {
      .referral-body {
        .referral-stats {
          .stat-item {
            .stat-value {
              font-size: 20px;
            }
          }
        }
      }
    }

    // Edit card
    .edit-card {
      /deep/ .ant-tabs-nav {
        .ant-tabs-tab {
          padding: 8px 10px;
          font-size: 12px;
        }
      }

      // Notification settings - stack checkboxes
      .notification-settings-form {
        /deep/ .ant-checkbox-group {
          .ant-row {
            .ant-col {
              flex: 0 0 50%;
              max-width: 50%;
            }
          }
        }
      }
    }
  }
}
</style>
