import { getMarketOverview, getMarketSentiment, getEconomicCalendar, getMarketNews, getMacroSection } from '@/api/global-market'
import { formatMacroValue } from '../../adapters/metricConfig'

// Chart mapping and basic info registry
const METRIC_REGISTRY = {
  // Liquidity - US Core
  us_net_liquidity: {
    name: 'US Net Liquidity',
    chartId: 'liq_net_us',
    chartIds: ['liq_net_us', 'liq_walcl', 'liq_tga', 'liq_rrp', 'liq_reserves'],
    visibility: 'detail_core',
    priority: 'P0',
    chart_policy: 'required',
    chart_status: 'available',
    reason_to_keep: 'The ultimate proxy for available market liquidity and risk asset gravity.',
    evidence_role: 'Core liquidity baseline',
    currentMeaning: 'WALCL 减去 TGA 和 RRP 后的净值，是市场实际可用流动性的最真实代理指标。',
    risingMeans: '可用流动性增加，风险资产估值受流动性溢价支撑，市场倾向扩张。',
    fallingMeans: '流动性缩减，市场缺乏资金弹药，资产价格面临估值收缩风险。',
    riskAssetImpact: '流动性是风险资产定价的地心引力，净流动性上升通常伴随估值倍数扩张。'
  },
  fed_balance_sheet: {
    name: 'Fed Balance Sheet',
    chartId: 'liq_walcl',
    chartIds: ['liq_walcl', 'liq_reserves'],
    visibility: 'detail_core',
    priority: 'P0',
    chart_policy: 'required',
    chart_status: 'available',
    reason_to_keep: 'Direct measure of QE/QT progress.',
    evidence_role: 'Central bank liquidity',
    currentMeaning: '美联储总资产规模，直观反映量化宽松(QE)或量化紧缩(QT)的执行进度。',
    risingMeans: '央行扩表，向市场注入基础货币。',
    fallingMeans: '央行缩表，从系统内抽走流动性。'
  },
  tga_balance: {
    name: 'TGA (财政部账户)',
    chartId: 'liq_tga',
    visibility: 'detail_core',
    priority: 'P0',
    chart_policy: 'required',
    chart_status: 'available',
    reason_to_keep: 'Key driver of short-term liquidity drain/injection by the Treasury.',
    evidence_role: 'Fiscal liquidity impact',
    currentMeaning: '财政部在美联储的一般账户余额，余额变动直接影响银行体系可用流动性。',
    risingMeans: 'TGA 上升 = 财政抽水，流动性从市场抽离，类似隐性紧缩。',
    fallingMeans: 'TGA 下降 = 财政放水，流动性注入银行体系，支持风险资产。'
  },
  rrp_balance: {
    name: 'RRP (逆回购余额)',
    chartId: 'liq_rrp',
    visibility: 'detail_core',
    priority: 'P0',
    chart_policy: 'required',
    chart_status: 'available',
    reason_to_keep: 'Shows excess liquidity parked at the Fed; acts as a buffer during QT.',
    evidence_role: 'Liquidity buffer',
    currentMeaning: '金融机构将多余现金停放在美联储的隔夜工具，高余额意味着流动性过剩但被锁定。',
    risingMeans: 'RRP 上升 = 资金无处可去，被锁定在美联储，对风险资产直接帮助有限。',
    fallingMeans: 'RRP 下降 = 资金流出美联储注入市场，流动性改善；但接近零后缓冲垫消失。'
  },
  bank_reserves: {
    name: 'Bank Reserves',
    chartId: 'liq_reserves',
    visibility: 'detail_core',
    priority: 'P0',
    chart_policy: 'required',
    chart_status: 'available',
    reason_to_keep: 'Critical for bank lending capacity and repo market stability.',
    evidence_role: 'Banking system liquidity',
    currentMeaning: '商业银行在美联储的超额准备金，是信贷扩张的基础燃料，维持体系稳定的关键。',
    risingMeans: '准备金充足，银行信贷能力强，整体金融条件宽松。',
    fallingMeans: '准备金跌破约 3 万亿美元舒适区，融资压力上升，可能引发隔夜利率飙升。'
  },
  financial_conditions_index: {
    name: 'NFCI',
    chartId: 'liq_nfci',
    chartIds: ['liq_nfci', 'adv_sofr', 'adv_fed_rate'],
    visibility: 'detail_core',
    priority: 'P0',
    chart_policy: 'required',
    chart_status: 'available',
    reason_to_keep: 'Comprehensive index of financial stress and credit availability.',
    evidence_role: 'Overall financial looseness/tightness',
    currentMeaning: '综合衡量信用利差、杠杆与风险指标的宽松程度，0 为历史平均，负值为宽松。',
    risingMeans: 'NFCI > 0 = 金融条件收紧，融资成本上升，经济活动受压。',
    fallingMeans: 'NFCI < 0 = 金融条件宽松，信贷畅通，风险资产受益。'
  },
  sofr: {
    name: 'SOFR',
    chartId: 'adv_sofr',
    visibility: 'advanced',
    priority: 'P1',
    chart_policy: 'optional',
    chart_status: 'available',
    reason_to_keep: 'Important benchmark rate but too low-level for executive summary.',
    reason_to_hide: 'Too low-level for executive summary.',
    evidence_role: 'Short-term rate reference',
    currentMeaning: '有担保隔夜融资利率，美元Libor的替代及短期流动性定价基准。'
  },
  effective_fed_funds_rate: {
    name: 'Effective FF Rate',
    chartId: 'adv_fed_rate',
    visibility: 'advanced',
    priority: 'P1',
    chart_policy: 'optional',
    chart_status: 'available',
    reason_to_keep: 'Tracks the actual policy rate, though US2Y is a better forward indicator.',
    reason_to_hide: 'US2Y is a better forward indicator.',
    evidence_role: 'Current policy rate',
    currentMeaning: '实际联邦基金利率，真实发生的隔夜拆借成本。'
  },
  dollar_index: {
    name: 'DXY (美元指数)',
    sourceKey: 'dxy',
    chartId: 'inf_dxy',
    chartIds: ['inf_dxy', 'adv_usd_jpy', 'adv_eur_usd'],
    visibility: 'detail_core',
    priority: 'P0',
    chart_policy: 'required',
    chart_status: 'available',
    reason_to_keep: 'Global liquidity vacuum and cross-asset pricing baseline.',
    evidence_role: 'FX liquidity pressure',
    currentMeaning: '衡量美元相对主要货币价值的基准，全球流动性环境最直观的风向标。',
    risingMeans: '美元走强，全球非美资产承压，离岸美元流动性收缩。',
    fallingMeans: '美元走弱，资金流向新兴市场与高风险资产，套息交易盛行。',
    riskAssetImpact: '弱美元通常是全球风险偏好的温床，强美元则是流动性紧缩的吸尘器。'
  },
  usd_jpy: {
    name: 'USD/JPY',
    chartId: 'adv_usd_jpy',
    visibility: 'advanced',
    priority: 'P1',
    chart_policy: 'optional',
    chart_status: 'available',
    reason_to_keep: 'Window into BoJ interventions and carry trade unwinds.',
    reason_to_hide: 'Not primary equity driver.',
    evidence_role: 'Carry trade risk',
    currentMeaning: '美日汇率，观察日元贬值与汇率干预的窗口。'
  },
  eur_usd: {
    name: 'EUR/USD',
    chartId: 'adv_eur_usd',
    visibility: 'advanced',
    priority: 'P1',
    chart_policy: 'optional',
    chart_status: 'available',
    reason_to_keep: 'Major DXY component, useful for cross-validation.',
    reason_to_hide: 'DXY is sufficient for main view.',
    evidence_role: 'Eurozone relative strength',
    currentMeaning: '欧美汇率，反映美元与欧元的相对强势。'
  },
  ecb_balance_sheet: {
    name: 'ECB Balance Sheet',
    chartId: null,
    visibility: 'deprecated',
    priority: 'none',
    chart_policy: 'none',
    chart_status: 'missing_source',
    reason_to_keep: 'N/A',
    reason_to_deprecate: 'Hard to source reliable weekly data; lower immediate relevance to US equities.',
    evidence_role: 'Global liquidity proxy',
    currentMeaning: '欧洲央行注入市场的流动性规模。'
  },
  boj_balance_sheet: {
    name: 'BoJ Balance Sheet',
    chartId: null,
    visibility: 'deprecated',
    priority: 'none',
    chart_policy: 'none',
    chart_status: 'missing_source',
    reason_to_keep: 'N/A',
    reason_to_deprecate: 'Data acquisition complexity and low ROI for daily dashboard.',
    evidence_role: 'Global liquidity proxy',
    currentMeaning: '日本央行货币政策的扩张力度。'
  },
  global_m2_proxy: {
    name: 'Global M2 Proxy',
    chartId: null,
    visibility: 'deprecated',
    priority: 'none',
    chart_policy: 'none',
    chart_status: 'pending',
    reason_to_keep: 'N/A',
    reason_to_deprecate: 'Requires complex custom cross-CB calculations not yet built.',
    evidence_role: 'Global liquidity cycle',
    currentMeaning: '全球广义货币供应量代理指标。'
  },

  // Inflation - Pressure
  cpi_yoy: {
    name: 'CPI YoY',
    chartId: 'inf_cpi_yoy',
    chartIds: ['inf_cpi_yoy', 'inf_core_cpi_yoy', 'adv_ppi_yoy', 'adv_shelter'],
    visibility: 'detail_core',
    priority: 'P0',
    chart_policy: 'required',
    chart_status: 'available',
    reason_to_keep: 'Headline inflation metric driving market sentiment.',
    evidence_role: 'Headline inflation pressure',
    currentMeaning: '广义消费者物价指数年率，整体通胀水平。'
  },
  core_cpi_yoy: {
    name: 'Core CPI YoY',
    chartId: 'inf_core_cpi_yoy',
    chartIds: ['inf_core_cpi_yoy', 'inf_cpi_yoy', 'adv_shelter'],
    visibility: 'detail_core',
    priority: 'P0',
    chart_policy: 'required',
    chart_status: 'available',
    reason_to_keep: 'Removes volatile components, showing sticky inflation trends.',
    evidence_role: 'Core inflation trend',
    currentMeaning: '剔除食品和能源的通胀趋势，反映需求拉动的内生通胀。'
  },
  pce_yoy: {
    name: 'PCE YoY',
    chartId: 'adv_pce_yoy',
    visibility: 'advanced',
    priority: 'P1',
    chart_policy: 'optional',
    chart_status: 'available',
    reason_to_keep: 'Fed official target metric.',
    reason_to_hide: 'Core PCE is more focused upon.',
    evidence_role: 'Fed benchmark inflation',
    currentMeaning: '个人消费支出物价指数，美联储的通胀目标参考。'
  },
  core_pce_yoy: {
    name: 'Core PCE YoY',
    chartId: 'inf_core_pce_yoy',
    chartIds: ['inf_core_pce_yoy', 'adv_pce_yoy'],
    visibility: 'detail_core',
    priority: 'P0',
    chart_policy: 'required',
    chart_status: 'available',
    reason_to_keep: "The Fed's preferred inflation gauge.",
    evidence_role: 'Primary Fed policy driver',
    currentMeaning: '核心PCE，美联储最青睐的通胀度量指标。'
  },
  ppi_yoy: {
    name: 'PPI YoY',
    chartId: 'adv_ppi_yoy',
    visibility: 'advanced',
    priority: 'P2',
    chart_policy: 'optional',
    chart_status: 'available',
    reason_to_keep: 'Leading indicator for CPI/PCE.',
    reason_to_hide: 'Redundant when actual CPI is known.',
    evidence_role: 'Upstream inflation pipeline',
    currentMeaning: '生产者物价指数，预测CPI走势的上游成本指标。'
  },
  shelter_inflation: {
    name: 'Shelter Inflation',
    chartId: 'adv_shelter',
    visibility: 'advanced',
    priority: 'P2',
    chart_policy: 'optional',
    chart_status: 'available',
    reason_to_keep: 'Largest and stickiest component of Core CPI.',
    reason_to_hide: 'Sub-component of CPI, too granular.',
    evidence_role: 'Inflation stickiness driver',
    currentMeaning: '住房通胀，当前通胀分项中最具粘性的部分。'
  },
  supercore_inflation: {
    name: 'Supercore Inflation',
    chartId: 'adv_supercore',
    visibility: 'advanced',
    priority: 'P2',
    chart_policy: 'optional',
    chart_status: 'pending',
    reason_to_keep: 'Critical for assessing wage-driven service inflation.',
    reason_to_hide: 'Sub-component of CPI, too granular.',
    evidence_role: 'Services inflation gauge',
    currentMeaning: '超级核心通胀（剔除住房的核心服务），衡量纯服务业涨价。'
  },

  // Rates - Curve
  us10y_yield: {
    name: 'US 10Y Yield',
    chartId: 'inf_us10y',
    chartIds: ['inf_us10y', 'inf_us2y', 'adv_us30y', 'inf_term_spread', 'adv_real_yield'],
    visibility: 'detail_core',
    priority: 'P0',
    chart_policy: 'required',
    chart_status: 'available',
    reason_to_keep: 'Global risk-free rate and anchor for equity valuations.',
    evidence_role: 'Long-term discount rate',
    currentMeaning: '十年期美债收益率，全球金融资产定价的锚。',
    risingMeans: '长端利率上升，贴现率走高，压制长久期资产（如成长股）估值。',
    fallingMeans: '长端利率下降，流动性宽松预期升温，利好风险资产与黄金。'
  },
  us2y_yield: {
    name: 'US 2Y Yield',
    chartId: 'inf_us2y',
    chartIds: ['inf_us2y', 'inf_us10y', 'inf_term_spread'],
    visibility: 'detail_core',
    priority: 'P0',
    chart_policy: 'required',
    chart_status: 'available',
    reason_to_keep: 'Most sensitive to near-term Fed policy changes.',
    evidence_role: 'Short-term policy expectations',
    currentMeaning: '两年期美债收益率，对美联储近期政策利率预期最敏感。'
  },
  us30y_yield: {
    name: 'US 30Y Yield',
    chartId: 'adv_us30y',
    visibility: 'advanced',
    priority: 'P1',
    chart_policy: 'optional',
    chart_status: 'available',
    reason_to_keep: 'Reflects long-term growth and inflation fundamentals.',
    reason_to_hide: '10Y is standard benchmark.',
    evidence_role: 'Long-term terminal rate proxy',
    currentMeaning: '三十年期美债收益率，反映长期经济增长与通胀预期。'
  },
  term_spread_10y_2y: {
    sourceKey: 'yield_curve',
    name: '10Y-2Y Spread',
    chartId: 'inf_term_spread',
    chartIds: ['inf_term_spread', 'inf_us10y', 'inf_us2y'],
    visibility: 'detail_core',
    priority: 'P0',
    chart_policy: 'required',
    chart_status: 'available',
    reason_to_keep: 'Classic recession predictor via curve inversion/steepening.',
    evidence_role: 'Recession warning signal',
    currentMeaning: '长短端收益率曲线利差，倒挂通常预示经济衰退。'
  },
  real_yield_10y: {
    name: '10Y Real Yield',
    chartId: 'adv_real_yield',
    visibility: 'advanced',
    priority: 'P1',
    chart_policy: 'optional',
    chart_status: 'available',
    reason_to_keep: 'True cost of capital adjusted for inflation; drives gold and tech multiples.',
    reason_to_hide: 'Academic concept, US10Y is more intuitive for broad review.',
    evidence_role: 'Real cost of capital',
    currentMeaning: '实际收益率，影响金融环境松紧的绝对核心。'
  },
  fed_funds_rate: {
    name: 'Fed Funds Rate',
    chartId: 'adv_fed_rate',
    visibility: 'advanced',
    priority: 'P1',
    chart_policy: 'optional',
    chart_status: 'available',
    reason_to_keep: 'Official policy rate benchmark.',
    reason_to_hide: 'US2Y proxies expectations better than static spot rate.',
    evidence_role: 'Current policy stance',
    currentMeaning: '美联储名义目标基准利率区间的上限。'
  },

  // Inflation - Expectations & Commodities
  inflation_expectations_1y: {
    name: '1Y Inflation Expectation',
    chartId: 'adv_infl_1y',
    visibility: 'advanced',
    priority: 'P1',
    chart_policy: 'optional',
    chart_status: 'available',
    reason_to_keep: 'Consumer sentiment on near-term price changes.',
    reason_to_hide: 'Volatile and less predictive than actual CPI.',
    evidence_role: 'Inflation anchoring check',
    currentMeaning: '消费者对未来一年的短期通胀预期。'
  },
  inflation_expectations_5y: {
    name: '5Y Inflation Expectation',
    chartId: 'adv_infl_5y',
    visibility: 'advanced',
    priority: 'P1',
    chart_policy: 'optional',
    chart_status: 'available',
    reason_to_keep: 'Fed monitors this closely to ensure inflation is anchored.',
    reason_to_hide: 'Volatile and less predictive than actual CPI.',
    evidence_role: 'Long-term inflation anchoring',
    currentMeaning: '市场的长期通胀预期锚定状态。'
  },
  wti_crude: {
    name: 'WTI Crude',
    chartId: 'adv_wti',
    visibility: 'advanced',
    priority: 'P1',
    chart_policy: 'optional',
    chart_status: 'available',
    reason_to_keep: 'Major input cost for economy and inflation driver.',
    reason_to_hide: 'Macro equity dashboard can defer this to commodities view.',
    evidence_role: 'Energy cost gauge',
    currentMeaning: '美国德州轻质原油价格，全球经济运行的能源成本基准。'
  },
  brent_crude: {
    name: 'Brent Crude',
    chartId: 'adv_brent',
    visibility: 'advanced',
    priority: 'P1',
    chart_policy: 'optional',
    chart_status: 'available',
    reason_to_keep: 'Global oil benchmark.',
    reason_to_hide: 'Redundant with WTI.',
    evidence_role: 'Global energy cost',
    currentMeaning: '布伦特原油价格，国际贸易原油的基准指标。'
  },
  copper: {
    name: 'Copper',
    chartId: 'adv_copper',
    visibility: 'advanced',
    priority: 'P1',
    chart_policy: 'optional',
    chart_status: 'available',
    reason_to_keep: 'Dr. Copper reflects global industrial demand and growth.',
    reason_to_hide: 'Macro equity dashboard can defer this to commodities view.',
    evidence_role: 'Industrial demand proxy',
    currentMeaning: '伦铜价格，有“铜博士”之称，高度敏感于全球高端制造与基建需求。'
  },
  gold: {
    name: 'Gold',
    chartId: 'adv_gold',
    visibility: 'advanced',
    priority: 'P1',
    chart_policy: 'optional',
    chart_status: 'available',
    reason_to_keep: 'Safe haven asset and hedge against real yield declines.',
    reason_to_hide: 'Macro equity dashboard can defer this to commodities view.',
    evidence_role: 'Fiat debasement/fear hedge',
    currentMeaning: '黄金现货价格，对抗法币贬值、地缘风险和实际利率下降的避险资产。'
  },

  // Economy - Growth
  gdp_growth: {
    name: 'GDP Growth',
    chartId: 'eco_gdp',
    visibility: 'detail_core',
    priority: 'P0',
    chart_policy: 'required',
    chart_status: 'available',
    reason_to_keep: 'Ultimate measure of economic output.',
    evidence_role: 'Macro growth baseline',
    currentMeaning: '实际GDP环比折年率，经济总量的季度增速。'
  },
  retail_sales_yoy: {
    name: 'Retail Sales YoY',
    chartId: 'adv_retail_sales',
    visibility: 'advanced',
    priority: 'P1',
    chart_policy: 'optional',
    chart_status: 'available',
    reason_to_keep: 'Consumer spending drives 70% of US GDP.',
    reason_to_hide: 'Overshadowed by NFP/Unemployment.',
    evidence_role: 'Consumer strength',
    currentMeaning: '零售销售年率，美国经济70%靠消费，此数据直接反映终端需求。'
  },
  industrial_production_yoy: {
    name: 'Industrial Prod YoY',
    chartId: null,
    visibility: 'deprecated',
    priority: 'none',
    chart_policy: 'none',
    chart_status: 'missing_endpoint',
    reason_to_keep: 'N/A',
    reason_to_deprecate: 'US is service-dominated; less relevant for broad index.',
    evidence_role: 'Manufacturing cycle',
    currentMeaning: '工业产出年率，衡量制造业、矿业和公用事业的实际产出。'
  },
  consumer_confidence: {
    name: 'Consumer Confidence',
    chartId: 'adv_consumer_conf',
    visibility: 'advanced',
    priority: 'P1',
    chart_policy: 'optional',
    chart_status: 'available',
    reason_to_keep: 'Leading indicator for future spending.',
    reason_to_hide: 'Soft data, often diverges from hard spending data.',
    evidence_role: 'Consumer sentiment',
    currentMeaning: '密歇根大学消费者信心指数，预示未来消费支出的领先指标。'
  },
  recession_probability: {
    name: 'Recession Probability',
    chartId: 'adv_recession_prob',
    visibility: 'advanced',
    priority: 'P1',
    chart_policy: 'optional',
    chart_status: 'available',
    reason_to_keep: 'Aggregated statistical model output for hard landing risk.',
    reason_to_hide: 'Models are lagging or rely purely on yield curve.',
    evidence_role: 'Systemic risk probability',
    currentMeaning: '基于收益率曲线等因子的平滑衰退概率模型。'
  },

  // Economy - Employment
  unemployment_rate: {
    name: 'Unemployment Rate',
    chartId: 'eco_unrate',
    chartIds: ['eco_unrate', 'eco_jobless', 'adv_cont_claims'],
    visibility: 'detail_core',
    priority: 'P0',
    chart_policy: 'required',
    chart_status: 'available',
    reason_to_keep: 'Triggers Sahm Rule; definitive recession indicator.',
    evidence_role: 'Labor market slack',
    currentMeaning: '失业率，触及萨姆规则阈值时往往确认衰退已开始。'
  },
  nonfarm_payrolls: {
    name: 'Nonfarm Payrolls',
    chartId: 'eco_nfp',
    chartIds: ['eco_nfp', 'adv_jolts', 'adv_wages'],
    visibility: 'detail_core',
    priority: 'P0',
    chart_policy: 'required',
    chart_status: 'available',
    reason_to_keep: 'Most closely watched high-frequency macro data point.',
    evidence_role: 'Monthly job creation',
    currentMeaning: '新增非农就业人数，衡量劳动力市场景气度的最核心高频指标。'
  },
  initial_jobless_claims: {
    name: 'Initial Jobless Claims',
    chartId: 'eco_jobless',
    chartIds: ['eco_jobless', 'adv_cont_claims', 'eco_unrate'],
    visibility: 'detail_core',
    priority: 'P0',
    chart_policy: 'required',
    chart_status: 'available',
    reason_to_keep: 'Highest frequency (weekly) labor market distress signal.',
    evidence_role: 'Leading labor distress',
    currentMeaning: '初请失业金人数，劳动力市场转弱的最敏锐早期信号。'
  },
  continuing_claims: {
    name: 'Continuing Claims',
    chartId: 'adv_cont_claims',
    visibility: 'advanced',
    priority: 'P1',
    chart_policy: 'optional',
    chart_status: 'available',
    reason_to_keep: 'Shows difficulty of finding new work.',
    reason_to_hide: 'Correlated with initial claims.',
    evidence_role: 'Labor market liquidity',
    currentMeaning: '续请失业金人数，反映失业者重新找到工作的难度。'
  },
  jolts_openings: {
    name: 'JOLTS Openings',
    chartId: 'adv_jolts',
    visibility: 'advanced',
    priority: 'P1',
    chart_policy: 'optional',
    chart_status: 'available',
    reason_to_keep: 'Measures labor demand side of the equation.',
    reason_to_hide: 'Often revised heavily and lags NFP.',
    evidence_role: 'Labor demand tightness',
    currentMeaning: '职位空缺数，衡量劳动力需求与供给的紧张程度。'
  },
  wage_growth: {
    name: 'Wage Growth YoY',
    chartId: 'adv_wages',
    visibility: 'advanced',
    priority: 'P1',
    chart_policy: 'optional',
    chart_status: 'available',
    reason_to_keep: 'Core driver of sticky service inflation.',
    reason_to_hide: 'Secondary to broad CPI/PCE.',
    evidence_role: 'Wage inflation pressure',
    currentMeaning: '平均时薪年率，决定服务业通胀粘性的核心动力。'
  },
  labor_force_participation: {
    name: 'Labor Participation',
    chartId: 'adv_labor_part',
    visibility: 'advanced',
    priority: 'P2',
    chart_policy: 'optional',
    chart_status: 'available',
    reason_to_keep: 'Contextualizes unemployment rate drops.',
    reason_to_hide: 'Moves too slowly to matter for short term trading.',
    evidence_role: 'Labor supply structural shifts',
    currentMeaning: '劳动参与率，影响长期劳动力供给结构。'
  },

  // Economy - Credit
  hy_spread: {
    name: 'High Yield Spread',
    chartId: 'eco_hy_spread',
    chartIds: ['eco_hy_spread', 'eco_ig_spread'],
    visibility: 'detail_core',
    priority: 'P0',
    chart_policy: 'required',
    chart_status: 'available',
    reason_to_keep: 'Smart money indicator for corporate default stress.',
    evidence_role: 'Credit market stress',
    currentMeaning: '高收益债（垃圾债）信用利差，反映企业违约风险定价。'
  },
  ig_spread: {
    name: 'IG Spread',
    chartId: 'eco_ig_spread',
    visibility: 'advanced',
    priority: 'P1',
    chart_policy: 'optional',
    chart_status: 'available',
    reason_to_keep: 'Broader measure of corporate credit health.',
    reason_to_hide: 'High yield spread is more sensitive to stress.',
    evidence_role: 'Corporate funding cost',
    currentMeaning: '投资级企业债利差，企业融资环境的健康指标。'
  },
  bank_lending_standards: {
    name: 'Bank Lending Standards',
    chartId: null,
    visibility: 'deprecated',
    priority: 'none',
    chart_policy: 'none',
    chart_status: 'missing_endpoint',
    reason_to_keep: 'N/A',
    reason_to_deprecate: 'Too low frequency (quarterly) for main dashboard.',
    evidence_role: 'Credit availability pipeline',
    currentMeaning: '银行信贷标准净收紧比例，领先于实际信贷萎缩。'
  },
  delinquency_rate: {
    name: 'Delinquency Rate',
    chartId: null,
    visibility: 'deprecated',
    priority: 'none',
    chart_policy: 'none',
    chart_status: 'missing_endpoint',
    reason_to_keep: 'N/A',
    reason_to_deprecate: 'Lagging indicator, less actionable.',
    evidence_role: 'Realized credit failure',
    currentMeaning: '商业贷款违约率，衡量实体经济偿债压力。'
  },
  commercial_paper_spread: {
    name: 'Commercial Paper Spread',
    chartId: null,
    visibility: 'deprecated',
    priority: 'none',
    chart_policy: 'none',
    chart_status: 'missing_endpoint',
    reason_to_keep: 'N/A',
    reason_to_deprecate: 'Niche indicator, mostly redundant with NFCI.',
    evidence_role: 'Short-term funding stress',
    currentMeaning: '商业票据利差，短期企业融资压力的温度计。'
  },

  // Sentiment
  fear_greed: {
    name: 'Fear & Greed Index',
    chartId: 'sen_fgi',
    visibility: 'detail_core',
    priority: 'P0',
    chart_policy: 'not_chart_worthy',
    chart_status: 'available',
    reason_to_keep: 'Excellent retail sentiment contrarian indicator.',
    evidence_role: 'Retail sentiment extreme',
    currentMeaning: 'CNN恐慌贪婪指数，极度恐慌通常是买点，极度贪婪则是风险区。'
  },
  vix: {
    name: 'VIX',
    chartId: 'sen_vix',
    visibility: 'detail_core',
    priority: 'P0',
    chart_policy: 'required',
    chart_status: 'available',
    reason_to_keep: 'Primary institutional risk hedging cost and fear gauge.',
    evidence_role: 'Institutional fear/hedge demand',
    currentMeaning: '标普500隐含波动率，俗称“恐慌指数”。'
  },
  vxn: {
    name: 'VXN',
    chartId: null,
    visibility: 'deprecated',
    priority: 'none',
    chart_policy: 'none',
    chart_status: 'missing_endpoint',
    reason_to_keep: 'N/A',
    reason_to_deprecate: 'Highly correlated with VIX, redundant for general macro.',
    evidence_role: 'Tech sector fear',
    currentMeaning: '纳斯达克100隐含波动率，科技股的恐慌指数。'
  },
  gvz: {
    name: 'GVZ',
    chartId: null,
    visibility: 'deprecated',
    priority: 'none',
    chart_policy: 'none',
    chart_status: 'missing_endpoint',
    reason_to_keep: 'N/A',
    reason_to_deprecate: 'Too specific for high-level macro dashboard.',
    evidence_role: 'Safe-haven stress',
    currentMeaning: '黄金隐含波动率，反映市场对极端避险事件的定价。'
  },
  vix_term: {
    name: 'Put/Call (VIX Term)',
    chartId: null,
    visibility: 'deprecated',
    priority: 'none',
    chart_policy: 'none',
    chart_status: 'pending',
    reason_to_keep: 'N/A',
    reason_to_deprecate: 'Complex to visualize; binary signal better suited for rules engine.',
    evidence_role: 'Panic confirmation',
    currentMeaning: 'VIX期限结构比例(短端/长端)，倒挂意味着短期极度恐慌。'
  },
  aaii_sentiment: {
    name: 'AAII Sentiment',
    chartId: null,
    visibility: 'deprecated',
    priority: 'none',
    chart_policy: 'none',
    chart_status: 'missing_endpoint',
    reason_to_keep: 'N/A',
    reason_to_deprecate: 'Lower frequency than FGI and often redundant.',
    evidence_role: 'Retail survey sentiment',
    currentMeaning: '美国个人投资者协会情绪调查，极度看空往往是阶段性底部。'
  },
  put_call_ratio: {
    name: 'Put/Call Ratio',
    chartId: null,
    visibility: 'deprecated',
    priority: 'none',
    chart_policy: 'none',
    chart_status: 'missing_endpoint',
    reason_to_keep: 'N/A',
    reason_to_deprecate: 'Can be noisy; VIX captures the premium better for broad macro.',
    evidence_role: 'Options positioning skew',
    currentMeaning: '看跌/看涨期权成交量比率，反映期权市场的对冲和投机方向。'
  }
}

const DOMAIN_CATEGORIES = {
  liquidity: [
    {
      id: 'fed_core',
      name: '美联储核心流动性',
      metrics: ['us_net_liquidity', 'fed_balance_sheet', 'tga_balance', 'rrp_balance', 'bank_reserves']
    },
    {
      id: 'financial_conditions',
      name: '金融条件',
      metrics: ['financial_conditions_index', 'sofr', 'effective_fed_funds_rate']
    },
    {
      id: 'usd_global',
      name: '美元与全球流动性',
      metrics: ['dollar_index', 'usd_jpy', 'eur_usd', 'ecb_balance_sheet', 'boj_balance_sheet', 'global_m2_proxy']
    }
  ],
  inflationRates: [
    {
      id: 'inflation_pressure',
      name: '通胀压力',
      metrics: ['cpi_yoy', 'core_cpi_yoy', 'pce_yoy', 'core_pce_yoy', 'ppi_yoy', 'shelter_inflation', 'supercore_inflation']
    },
    {
      id: 'rates_curve',
      name: '利率与曲线',
      metrics: ['us10y_yield', 'us2y_yield', 'us30y_yield', 'term_spread_10y_2y', 'real_yield_10y', 'fed_funds_rate', 'sofr', 'effective_fed_funds_rate']
    },
    {
      id: 'expectations_commodities',
      name: '通胀预期与大宗商品',
      metrics: ['inflation_expectations_1y', 'inflation_expectations_5y', 'wti_crude', 'brent_crude', 'copper', 'gold']
    }
  ],
  economy: [
    {
      id: 'economic_growth',
      name: '经济增长',
      metrics: ['gdp_growth', 'retail_sales_yoy', 'industrial_production_yoy', 'consumer_confidence', 'recession_probability']
    },
    {
      id: 'employment_market',
      name: '就业市场',
      metrics: ['unemployment_rate', 'nonfarm_payrolls', 'initial_jobless_claims', 'continuing_claims', 'jolts_openings', 'wage_growth', 'labor_force_participation']
    },
    {
      id: 'credit_environment',
      name: '信用与违约',
      metrics: ['hy_spread', 'ig_spread', 'bank_lending_standards', 'delinquency_rate', 'commercial_paper_spread']
    }
  ],
  sentiment: [
    {
      id: 'market_sentiment',
      name: '市场情绪指标',
      metrics: ['fear_greed']
    },
    {
      id: 'volatility_indices',
      name: '波动率与恐慌指数',
      metrics: ['vix', 'vxn', 'gvz', 'vix_term']
    }
  ]
}

export async function getDomainViewModel (domain) {
  const model = {
    summaryVerdict: '',
    summaryThesis: '',
    summaryStatus: 'default',
    lastUpdated: '',
    riskAssetImplication: '',
    riskPostureSummary: { overallPosture: '', mainSupports: [], mainPressures: [], todayWatchPoint: '' },
    tailwinds: [],
    headwinds: [],
    whatToWatch: [],
    categories: [],
    relevantEvents: [],
    relevantNews: [],
    isEmpty: false,
    loading: true
  }

  // Map domain -> snapshot section names to fetch current values
  const DOMAIN_SNAPSHOT_SECTIONS = {
    liquidity: ['liquidity', 'sentiment'],
    inflationRates: ['inflation_rates', 'sentiment', 'heatmap'],
    economy: ['economy', 'sentiment', 'heatmap'],
    sentiment: ['sentiment', 'liquidity']
  }

  // Commodity name_en -> registry metricId mapping for heatmap lookup
  const COMMODITY_NAME_MAP = {
    'Gold': 'gold',
    'Crude Oil WTI': 'wti_crude',
    'Brent Oil': 'brent_crude',
    'Copper': 'copper',
    'Silver': 'silver',
    'Natural Gas': 'natural_gas'
  }

  try {
    const sectionNames = DOMAIN_SNAPSHOT_SECTIONS[domain] || ['sentiment']
    const [, sentimentRes, calendarRes, newsRes, ...sectionResults] = await Promise.allSettled([
      getMarketOverview(),
      getMarketSentiment(),
      getEconomicCalendar(),
      getMarketNews('all'),
      ...sectionNames.map(s => getMacroSection(s))
    ])

    const combinedData = {}
    // Merge base sentiment (VIX, DXY, FGI, yield_curve etc.)
    if (sentimentRes.status === 'fulfilled' && sentimentRes.value && sentimentRes.value.data) {
      Object.assign(combinedData, sentimentRes.value.data)
    }
    // Merge domain-specific snapshot sections
    sectionResults.forEach(res => {
      if (res.status === 'fulfilled' && res.value && res.value.data) {
        const sectionData = res.value.data
        Object.assign(combinedData, sectionData)

        // Flatten heatmap commodity array into combinedData keyed by metric id
        if (Array.isArray(sectionData.commodities)) {
          sectionData.commodities.forEach(item => {
            const metricId = COMMODITY_NAME_MAP[item.name_en]
            if (metricId) {
              combinedData[metricId] = { value: item.price, source: 'Yahoo Finance' }
            }
          })
        }
        // Flatten heatmap forex array
        if (Array.isArray(sectionData.forex)) {
          sectionData.forex.forEach(item => {
            if (item.pair) {
              const key = item.pair.toLowerCase().replace('/', '_')
              combinedData[key] = { value: item.price, source: 'Yahoo Finance' }
            }
          })
        }
      }
    })

    // Process Categories
    const categoryConfigs = DOMAIN_CATEGORIES[domain] || []

    model.categories = categoryConfigs.map(cat => {
      const parsedMetrics = cat.metrics.map(metricId => {
        const meta = METRIC_REGISTRY[metricId] || { name: metricId }
        const lookupKey = meta.sourceKey || metricId
        const rawValue = combinedData[lookupKey]

        let validValue = '--'
        if (rawValue !== undefined && rawValue !== null) {
          if (typeof rawValue === 'object') {
            // Try common value fields; filter out None/null
            const candidates = [rawValue.value, rawValue.price, rawValue.spread, rawValue.rate]
            const found = candidates.find(c => c !== undefined && c !== null && !Number.isNaN(Number(c)))
            if (found !== undefined) {
              validValue = Number(found)
            }
          } else if (rawValue !== null) {
            validValue = Number(rawValue)
          }
        }
        // Null guard: if value resolved to the string 'null' or 'None', treat as unavailable
        if (validValue === 'null' || validValue === 'None') validValue = '--'

        // Determine source label from registry meta, then snapshot data, then default
        // rawValue.source is now correctly populated (e.g. 'Yahoo Finance', 'CNN Business', 'FRED')
        let sourceLabel = 'FRED'
        if (meta.source) {
          sourceLabel = meta.source
        } else if (rawValue && typeof rawValue === 'object' && rawValue.source) {
          const src = rawValue.source
          // Only use snapshot source if it looks like a source name, not a unit (USD/bbl, etc.)
          if (!src.includes('/') && !src.includes('USD') && !src.includes('%')) {
            sourceLabel = src
          }
        }

        const fetchedDate = rawValue && typeof rawValue === 'object' ? rawValue.date : null
        const formattedMetric = formatMacroValue(metricId, validValue, fetchedDate)

        return {
          id: metricId,
          name: meta.name,
          value: formattedMetric.value,
          formattedValue: formattedMetric.formattedValue,
          primary: formattedMetric.primary,
          displayValue: formattedMetric.displayValue,
          unit: formattedMetric.unit,
          displayUnit: formattedMetric.displayUnit,
          meta: formattedMetric.meta,
          status: formattedMetric.status,
          chartId: meta.chartId || null,
          visibility: meta.visibility || 'hidden',
          currentMeaning: meta.currentMeaning,
          risingMeans: meta.risingMeans,
          fallingMeans: meta.fallingMeans,
          riskAssetImpact: meta.riskAssetImpact,
          source: sourceLabel
        }
      })

      const activeMetrics = parsedMetrics.filter(m => m.visibility !== 'deprecated' && m.visibility !== 'hidden')
      const coreMetrics = activeMetrics.slice(0, 3)
      const advancedMetrics = activeMetrics.slice(3)

      return {
        id: cat.id,
        name: cat.name,
        metrics: activeMetrics,
        coreMetrics,
        advancedMetrics
      }
    })

    // Timestamp Resolving
    const currentTime = new Date()
    const timeStr = `${String(currentTime.getHours()).padStart(2, '0')}:${String(currentTime.getMinutes()).padStart(2, '0')}`

    let dataAsOfStr = ''
    if (combinedData.timestamp) {
      const tsDate = new Date(combinedData.timestamp * 1000)
      dataAsOfStr = `${tsDate.getFullYear()}-${String(tsDate.getMonth() + 1).padStart(2, '0')}-${String(tsDate.getDate()).padStart(2, '0')}`
    }

    model.updateTime = timeStr
    model.dataTime = dataAsOfStr
    model.lastUpdated = dataAsOfStr ? `规则更新时间: ${timeStr} · 数据截至: ${dataAsOfStr}` : `规则更新时间: ${timeStr}`

    // Thesis Generation Rule
    const getStanceBlock = () => {
      if (domain === 'liquidity') {
        const dxyRaw = combinedData['dxy']
        let dxyVal = null
        if (dxyRaw) {
           dxyVal = typeof dxyRaw === 'object' ? parseFloat(dxyRaw.value || dxyRaw.price) : parseFloat(dxyRaw)
        }

        if (dxyVal !== null) {
           if (dxyVal > 105) return { verdict: '美元流动性中性偏紧', thesis: '強势美元环境下，全球信用成本上升，離岸美元流动性收紧，各类风险资产面臨估值压力。', tag: 'warning', verdictKey: 'macro.detail.liquidity.verdict.warning', thesisKey: 'macro.detail.liquidity.thesis.warning' }
           if (dxyVal < 100) return { verdict: '流动性边际偏宽松', thesis: '弱美元环境降低全球融资成本，有利于流动性擴张；维持计划既定敞口具备宏观支支撑。', tag: 'success', verdictKey: 'macro.detail.liquidity.verdict.success', thesisKey: 'macro.detail.liquidity.thesis.success' }
           return { verdict: '体系流动性维持均衡', thesis: '流动性环境處于均衡震盪階段，不宜因短期噪音频繁调整计划，保持观察。', tag: 'neutral', verdictKey: 'macro.detail.liquidity.verdict.neutral', thesisKey: 'macro.detail.liquidity.thesis.neutral' }
        }
        return { verdict: '底层流动性跟踪', thesis: '核心流动性指标暫不可用，当前判断降級，不宜在数据盲区擴大风险敞口。', tag: 'processing', verdictKey: 'macro.detail.liquidity.verdict.processing', thesisKey: 'macro.detail.liquidity.thesis.processing' }
      }
      if (domain === 'inflationRates') {
        const spreadRaw = combinedData['yield_curve']
        let spreadVal = null
        if (spreadRaw) {
           spreadVal = typeof spreadRaw === 'object' ? parseFloat(spreadRaw.value || spreadRaw.spread) : parseFloat(spreadRaw)
        }
        if (spreadVal !== null) {
           if (spreadVal < 0) return { verdict: '收益率曲线倒挂', thesis: '收益率曲线倒挂持續，歷史上此讯号常先行于衰退；长期资金应确认计划对下行情景的容忍度。', tag: 'warning', verdictKey: 'macro.detail.inflationRates.verdict.warning', thesisKey: 'macro.detail.inflationRates.thesis.warning' }
           if (spreadVal > 0.5) return { verdict: '曲线健康陡峭化', thesis: '曲线健康陡峭化，通胀与成长並存，宏观环境对週期性资产具备基本面支撐。', tag: 'success', verdictKey: 'macro.detail.inflationRates.verdict.success', thesisKey: 'macro.detail.inflationRates.thesis.success' }
           return { verdict: '利率曲线趋平', thesis: '曲线趋平，成长动能面臨方向确认压力；不宜在此階段追高长久期资产。', tag: 'neutral', verdictKey: 'macro.detail.inflationRates.verdict.neutral', thesisKey: 'macro.detail.inflationRates.thesis.neutral' }
        }
        return { verdict: '无风险利率定价', thesis: '利率关键指标暫不可用，利率环境判断降級，应審慎评估长久期资产的配置節奏。', tag: 'processing', verdictKey: 'macro.detail.inflationRates.verdict.processing', thesisKey: 'macro.detail.inflationRates.thesis.processing' }
      }
      if (domain === 'economy') {
        const unrateRaw = combinedData['unemployment_rate']
        let unrateVal = null
        if (unrateRaw) {
           unrateVal = typeof unrateRaw === 'object' ? parseFloat(unrateRaw.value) : parseFloat(unrateRaw)
        }
        if (unrateVal !== null) {
           if (unrateVal > 4.5) return { verdict: '劳动力市场趋冷', thesis: '失业率上行觸及萨姆规则阈值附近，经济衰退信号增强，应确认计划对防御情景的应对预案。', tag: 'danger', verdictKey: 'macro.detail.economy.verdict.danger', thesisKey: 'macro.detail.economy.thesis.danger' }
           if (unrateVal < 4.0) return { verdict: '经济动能强劲', thesis: '劳动力市场强劲，消费基本面有支撑；但需留意通胀黏性对美联储政策路径的潜在影响。', tag: 'success', verdictKey: 'macro.detail.economy.verdict.success', thesisKey: 'macro.detail.economy.thesis.success' }
           return { verdict: '经济软着陆路径', thesis: '就业市场再平衡，增速放缓未失速，软着陆路径仍有支撑；维持计划执行节奏为宜。', tag: 'neutral', verdictKey: 'macro.detail.economy.verdict.neutral', thesisKey: 'macro.detail.economy.thesis.neutral' }
        }
        return { verdict: '实体经济追踪', thesis: '核心经济指标暂不可用，判断降级；不宜在数据盲区改变既定计划配置比例。', tag: 'processing', verdictKey: 'macro.detail.economy.verdict.processing', thesisKey: 'macro.detail.economy.thesis.processing' }
      }
      if (domain === 'sentiment') {
        const fgRaw = combinedData['fear_greed']
        let fgVal = null
        if (fgRaw) {
           fgVal = typeof fgRaw === 'object' ? parseFloat(fgRaw.value) : parseFloat(fgRaw)
        }
        if (fgVal !== null) {
           if (fgVal < 25) return { verdict: '极度恐慌 (买点显现)', thesis: '市场情绪接近冰点，从紀律性視角看，此环境下依计划執行往往优于仓皇撤退。', tag: 'success', verdictKey: 'macro.detail.sentiment.verdict.success', thesisKey: 'macro.detail.sentiment.thesis.success' }
           if (fgVal > 75) return { verdict: '极度贪婪 (风险积聚)', thesis: '情绪极度亢奮，市场容错率低；不宜追高建立新仓位，应确认既有计划的持有理由是否仍然成立。', tag: 'warning', verdictKey: 'macro.detail.sentiment.verdict.warning', thesisKey: 'macro.detail.sentiment.thesis.warning' }
           return { verdict: '情绪区间震荡', thesis: '情绪中性震盪，缺乏明确方向指引；维持计划既定節奏，多看少动，減少无主线的仓位调整。', tag: 'neutral', verdictKey: 'macro.detail.sentiment.verdict.neutral', thesisKey: 'macro.detail.sentiment.thesis.neutral' }
        }
        return { verdict: '市场情绪感知', thesis: '情绪量化指标暫不可用，判断降級；在信号缺失期间，不宜依慢情绪判断擴大或縮減敞口。', tag: 'processing', verdictKey: 'macro.detail.sentiment.verdict.processing', thesisKey: 'macro.detail.sentiment.thesis.processing' }
      }

      return { verdict: '动能观测中', thesis: '数据载入中，請稍候。', tag: 'default', verdictKey: 'macro.detail.default.verdict', thesisKey: 'macro.detail.default.thesis' }
    }

    const stance = getStanceBlock()
    model.summaryVerdict = stance.verdict
    model.summaryThesis = stance.thesis
    model.summaryStatus = stance.tag
    model.verdictKey = stance.verdictKey
    model.thesisKey = stance.thesisKey

    // Domain Knowledge Layer
    if (domain === 'liquidity') {
      const dxyRaw = combinedData['dxy']
      let dxyVal = null
      if (dxyRaw) {
         dxyVal = typeof dxyRaw === 'object' ? parseFloat(dxyRaw.value || dxyRaw.price) : parseFloat(dxyRaw)
      }

      const isSuccess = (dxyVal !== null && dxyVal < 100)
      model.riskAssetImplication = isSuccess
        ? '弱美元环境降低融资成本，離岸流动性宽松；当前宏观條件支持维持风险敞口。'
        : '強势美元或流动性收紧時，信用成本上升，压制高Beta资产容错率，新增投入应審慎。'
      model.riskAssetImplicationKey = isSuccess
        ? 'macro.detail.liquidity.implication.success'
        : 'macro.detail.liquidity.implication.default'

      model.tailwinds = [
        'RRP 余额釋放，歷史沉澱资金正向市场提供流动性支撐',
        'TGA 余额下降将为市场系統注入額外流动性缓冲',
        'NFCI 處于负值区间，整體金融條件维持相对宽松',
        '美联储 QT 節奏放缓或暫停，減少被动缩表对市场的压力'
      ]

      model.headwinds = [
        'QT 持續運行，联储资产负债表被动收縮，系統淨流动性面临长期下行趋势',
        '财政部大規模发债補充 TGA，将階段性从市场抽走现金',
        'RRP 余额若耗盡，未来流动性紧縮将缺乏直接的缓冲墊',
        '美元走強推升離岸流动性成本，压制全球风险偏好'
      ]

      model.whatToWatch = [
        { label: 'RRP 余额', desc: '若接近枯竭（低于 500 亿美元），流动性的額外釋放空间将消失。' },
        { label: 'TGA 变化', desc: '观察财政部发债節奏与 TGA 水位变化，评估其对市场流动性的抽水效应。' },
        { label: 'Bank Reserves 水位', desc: '若跌破 3 万亿美元舒適区，需留意隔夜利率是否出现脈冲式上升。' },
        { label: 'NFCI 方向', desc: '若由负轉正，意味着金融條件实质性收紧，应确认既定计划的风险容忍度。' }
      ]
    } else if (domain === 'inflationRates') {
      model.riskAssetImplication = '利率水位与通胀黏性决定了估值擴张的邊界；若长端利率回落，成长资产的容错率将邊际改善。'
      model.riskAssetImplicationKey = 'macro.detail.inflationRates.implication'
      model.tailwinds = [
        '核心通胀持續回落，为美联储貨币政策正常化提供空间',
        '长端无风险利率（US10Y）回落，減輕长久期资产估值压力',
        '核心商品价格保持温和，輸入型通胀风险降低'
      ]
      model.headwinds = [
        '服務业通胀（尤其住房成本）黏性若超预期，将制約宽松空间',
        '勞动力市场若持續过熱，可能推升薪资螺旋上升风险',
        '收益率曲线深度倒挂，歷史上常隐含潛在衰退风险定价'
      ]
      model.whatToWatch = [
        { label: '核心 PCE 走向', desc: '观察核心 PCE 能否稳定回落至目标区间，确认通胀降温趋势。' },
        { label: 'US10Y 关键位', desc: '长端利率若突破压力位，将直接压制科技与成长资产的估值中樞。' }
      ]
    } else if (domain === 'economy') {
      model.riskAssetImplication = '实體经济韧性为企业盈利提供底层支撐；但在紧縮週期中，过熱数据可能引发政策预期波动，需留意其对流动性的间接压制。'
      model.riskAssetImplicationKey = 'macro.detail.economy.implication'
      model.tailwinds = [
        '零售銷售保持韧性，終端消費需求稳定',
        '初請失业金人數维持低位，勞动力市场提供軟着陸支撐',
        '高收益债信用利差未见显着走闊，企业融资环境健康'
      ]
      model.headwinds = [
        '製造业 PMI 持續在榮枯线下方徘徊，工业动能偏弱',
        '銀行信貸标准收紧，实體经济信用派生受阻',
        '信用卡与車貸违约率抬頭，底层消費信貸压力增加'
      ]
      model.whatToWatch = [
        { label: '失业率上行', desc: '若失业率上升触发薩姆規则，经济衰退风险显着增加，应确认防禦预案。' },
        { label: '信貸利差走闊', desc: '若高收益债利差快速走闊，意味着系統性違約风险定价開啟，环境轉向惡劣。' }
      ]
    } else if (domain === 'sentiment') {
      model.riskAssetImplication = '情绪极值常引发短期超调；在系統性风险可控前提下，恐慌区往往具备较佳的长期紀律性投入條件。'
      model.riskAssetImplicationKey = 'macro.detail.sentiment.implication'
      model.tailwinds = [
        '市场若處于极度恐慌，空頭力量釋放后通常具备中期支撐',
        'VIX 飆升后回落，波动率收斂有利于系統性资金重新配置',
        '看跌/看涨期权比率（Put/Call Ratio）觸及高位，反轉动能積聚'
      ]
      model.headwinds = [
        '若情绪进入极度贪婪区间，市场杠杆高企，容错率显着降低',
        'VIX 期限结构若出现深度貼水，暗示短期恐慌情绪极強',
        '非理性狂熱伴隨机构资金流出時，短期回调风险增加'
      ]
      model.whatToWatch = [
        { label: 'VIX 期限结构', desc: '若短期 VIX 續高于长期 VIX（曲线倒挂），代表恐慌持續；修復为正态则是情绪企稳的先行指标。' },
        { label: '恐慌贪婪极值', desc: '在紧縮週期下的「极度贪婪」意味着容错率极低，应審視既定计划是否需放缓執行節奏。' }
      ]
    }

    // Calendar Filtering
    if (calendarRes.status === 'fulfilled' && calendarRes.value && calendarRes.value.data) {
      const events = Array.isArray(calendarRes.value.data) ? calendarRes.value.data : (calendarRes.value.data.events || [])
      model.relevantEvents = events.slice(0, 4)
    }

    // News Filtering
    if (newsRes.status === 'fulfilled' && newsRes.value && newsRes.value.data) {
      const news = Array.isArray(newsRes.value.data) ? newsRes.value.data : (newsRes.value.data.list || [])
      model.relevantNews = news.slice(0, 4)
    }

    if (model.categories.length === 0 || model.categories.every(c => c.metrics.length === 0)) {
       model.isEmpty = true
    }
  } catch (error) {
    console.error('Failed to resolve domain model', error)
    model.isEmpty = true
  } finally {
    model.loading = false
  }

  return model
}
