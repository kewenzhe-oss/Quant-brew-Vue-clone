/**
 * sandboxMixin.js
 * Shared mixin for all QuantBrew Decision & Sandbox Tool drawers.
 *
 * Provides:
 * - Locale-aware money/percent formatting (reads lang from Vuex)
 * - Dark-mode computed (reads theme from Vuex)
 * - localStorage session helpers (namespaced per sandbox)
 */

export const sandboxMixin = {
  computed: {
    theme () {
      return this.$store.getters.theme
    },
    isDark () {
      return this.theme === 'dark' || this.theme === 'realdark'
    },
    currentLang () {
      return this.$store.getters.lang || 'en-US'
    },
    /** Locale string used for Intl number formatting */
    _numLocale () {
      return this.currentLang === 'zh-CN' ? 'zh-CN' : 'en-US'
    }
  },

  methods: {
    /**
     * Format a number as a rounded integer with locale-aware thousand separators.
     * Handles NaN, Infinity, null gracefully.
     * @param {number} num
     * @returns {string}
     */
    formatMoney (num) {
      if (num === null || num === undefined || !isFinite(num)) return '0'
      return Math.round(num).toLocaleString(this._numLocale)
    },

    /**
     * Format a number as a percentage string, with i18n for special cases.
     * @param {number} num
     * @param {number} [decimals=2]
     * @returns {string}
     */
    formatPercent (num, decimals = 2) {
      if (num === Infinity || num === -Infinity) {
        return this.$t ? this.$t('learning.sandbox.infiniteRoi') : '∞ (Infinite ROI)'
      }
      if (num === null || num === undefined || isNaN(num)) return '0.00 %'
      return `${Number(num).toFixed(decimals)} %`
    },

    /**
     * Persist sandbox form state to localStorage under a namespaced key.
     * Silently ignores quota/private-mode errors.
     * @param {string} key  - sandbox identifier (e.g. 'realestate')
     * @param {*}      data - serialisable object to store
     */
    saveSandboxState (key, data) {
      try {
        localStorage.setItem('qb_sandbox_' + key, JSON.stringify(data))
      } catch (e) {
        // quota exceeded or private browsing — silently ignore
      }
    },

    /**
     * Load previously persisted sandbox form state.
     * Returns null if nothing is stored or JSON is corrupt.
     * @param {string} key
     * @returns {*|null}
     */
    loadSandboxState (key) {
      try {
        const raw = localStorage.getItem('qb_sandbox_' + key)
        return raw ? JSON.parse(raw) : null
      } catch (e) {
        return null
      }
    },

    /**
     * Clear persisted sandbox state (used by the Reset button).
     * @param {string} key
     */
    clearSandboxState (key) {
      try {
        localStorage.removeItem('qb_sandbox_' + key)
      } catch (e) {}
    }
  }
}
