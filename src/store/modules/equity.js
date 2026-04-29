import { getEquityInfo, getEquityQuote, getEquityHistory, getEquityFinancials, getEquityTechnicals } from '@/api/equity'

const equity = {
  namespaced: true,
  state: {
    currentSymbol: '',
    currentPeriod: '1y',
    info: {},
    quote: {},
    history: [],
    financials: {},
    technicals: {},

    // Loading states
    coreLoading: false,
    historyLoading: false,
    financialsLoading: false,
    technicalsLoading: false,

    // Error states
    error: null
  },

  mutations: {
    SET_SYMBOL: (state, symbol) => {
      state.currentSymbol = symbol
      // Reset state for new symbol only
      state.info = {}
      state.quote = {}
      state.history = []
      state.financials = {}
      state.technicals = {}
      state.error = null
    },
    SET_PERIOD: (state, period) => {
      state.currentPeriod = period
    },
    SET_INFO: (state, data) => {
      state.info = data
    },
    SET_QUOTE: (state, data) => {
      state.quote = data
    },
    SET_HISTORY: (state, data) => {
      state.history = data
    },
    SET_FINANCIALS: (state, data) => {
      state.financials = data
    },
    SET_TECHNICALS: (state, data) => {
      state.technicals = data
    },
    SET_CORE_LOADING: (state, status) => {
      state.coreLoading = status
    },
    SET_HISTORY_LOADING: (state, status) => {
      state.historyLoading = status
    },
    SET_FINANCIALS_LOADING: (state, status) => {
      state.financialsLoading = status
    },
    SET_TECHNICALS_LOADING: (state, status) => {
      state.technicalsLoading = status
    },
    SET_ERROR: (state, error) => {
      state.error = error
    }
  },

  actions: {
    // Initial Load - Core data (Info, Quote, History)
    async loadCoreSymbolData ({ commit, state }, payload) {
      const symbol = typeof payload === 'string' ? payload : payload.symbol
      const period = payload.period || '1y'
      if (!symbol) return

      const upperSymbol = symbol.toUpperCase()
      const isNewSymbol = upperSymbol !== state.currentSymbol

      if (isNewSymbol) {
        // Full reset only when switching to a different symbol
        commit('SET_SYMBOL', upperSymbol)
        commit('SET_CORE_LOADING', true)
      } else {
        // Same symbol, different period — only update period and reload history
        commit('SET_PERIOD', period)
        commit('SET_HISTORY_LOADING', true)
      }

      try {
        if (isNewSymbol) {
          const [infoRes, quoteRes, historyRes] = await Promise.all([
            getEquityInfo(symbol),
            getEquityQuote(symbol),
            getEquityHistory(symbol, period)
          ])
          commit('SET_INFO', infoRes || {})
          commit('SET_QUOTE', quoteRes || {})
          commit('SET_HISTORY', historyRes || [])
          commit('SET_PERIOD', period)
        } else {
          // Only re-fetch history when period changes on same symbol
          const historyRes = await getEquityHistory(symbol, period)
          commit('SET_HISTORY', historyRes || [])
        }
      } catch (error) {
        commit('SET_ERROR', error.message || 'Failed to load core equity data')
        console.error('Error loading core equity data:', error)
      } finally {
        commit('SET_CORE_LOADING', false)
        commit('SET_HISTORY_LOADING', false)
      }
    },

    // Lazy Load - Financials
    async loadFinancials ({ commit, state }, symbol) {
      const targetSymbol = symbol || state.currentSymbol
      if (!targetSymbol) return

      commit('SET_FINANCIALS_LOADING', true)

      try {
        const financialsRes = await getEquityFinancials(targetSymbol)
        commit('SET_FINANCIALS', financialsRes || {})
      } catch (error) {
        console.error('Error loading financials:', error)
      } finally {
        commit('SET_FINANCIALS_LOADING', false)
      }
    },

    // Lazy Load - Technicals
    async loadTechnicals ({ commit, state }, payload) {
      const symbol = (typeof payload === 'string' ? payload : payload?.symbol) || state.currentSymbol
      const period = payload?.period || '1y'
      if (!symbol) return

      commit('SET_TECHNICALS_LOADING', true)

      try {
        const technicalsRes = await getEquityTechnicals(symbol, period)
        commit('SET_TECHNICALS', technicalsRes || {})
      } catch (error) {
        console.error('Error loading technicals:', error)
      } finally {
        commit('SET_TECHNICALS_LOADING', false)
      }
    }
  },

  getters: {
    // We can add computed mappings here if needed,
    // or just let the component map the raw state.
  }
}

export default equity
