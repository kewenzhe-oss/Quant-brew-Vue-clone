export const MACRO_BRANCHES = [
  {
    key: 'liquidity',
    title: '流动性条件',
    titleEn: 'Liquidity Conditions',
    description: '观察资金是否容易流动，以及金融系统是否偏宽松或偏紧。',
    indicators: ['dxy', 'rrp', 'nfci']
  },
  {
    key: 'fundamentals',
    title: '宏观经济基本面',
    titleEn: 'Macro Fundamentals',
    description: '观察经济增长与利率压力。',
    indicators: ['gdp', 'us10y']
  },
  {
    key: 'inflation',
    title: '通胀压力',
    titleEn: 'Inflation',
    description: '观察通胀走势与市场对未来通胀的预期，直接影响货币政策路径与资产定价。',
    indicators: ['cpi', 'pce_yoy', 'core_pce_yoy', 'breakeven_10y']
  },
  {
    key: 'sentiment',
    title: '市场情绪',
    titleEn: 'Market Sentiment',
    description: '观察市场参与者当前是恐惧、平静还是过热。',
    indicators: ['fear_greed', 'vix']
  }
]

export const INDICATOR_META = {
  fgi: {
    name: 'FGI',
    label: '恐惧与贪婪指数',
    unit: '',
    branch: 'sentiment',
    what: '基于美债需求、股票价格动能、期权波动等多维度指标，计算出一个 0-100 的数值，用以客观衡量市场情绪。',
    whyItMatters: '数值偏高代表市场普遍乐观（可能存在情绪过热风险），数值偏低代表投资者普遍悲观（恐慌情绪释放较多）。该指标仅用于客观观察情绪，不构成买卖时机预测。',
    relationships: [
      { target: 'vix', label: '情绪极度恐慌时，VIX 通常会同步飙升。' }
    ],
    frequency: 'Daily',
    sourceHint: 'CNN Business / Alternative'
  },
  fear_greed: {
    name: 'FGI',
    label: '恐惧与贪婪指数',
    unit: '',
    branch: 'sentiment',
    what: '基于美债需求、股票价格动能、期权波动等多维度指标，计算出一个 0-100 的数值，用以客观衡量市场情绪。',
    whyItMatters: '数值偏高代表市场普遍乐观（可能存在情绪过热风险），数值偏低代表投资者普遍悲观（恐慌情绪释放较多）。该指标仅用于客观观察情绪，不构成买卖时机预测。',
    relationships: [
      { target: 'vix', label: '情绪极度恐慌时，VIX 通常会同步飙升。' }
    ],
    frequency: 'Daily',
    sourceHint: 'CNN Business / Alternative'
  },
  vix: {
    name: 'VIX',
    label: '波动率指数',
    unit: 'Index',
    branch: 'sentiment',
    what: '芝加哥期权交易所（CBOE）根据标普 500 指数期权价格计算出的隐含波动率，常被称为“恐慌指数”。',
    whyItMatters: '反映市场对于未来 30 天内股票市场波动的心理预期。数值越高，代表未来波动预期越剧烈。',
    relationships: [
      { target: 'fear_greed', label: '隐含波动率大幅上升时，FGI 通常会跌入恐慌区。' }
    ],
    frequency: 'Daily',
    sourceHint: 'CBOE / Yahoo Finance'
  },
  dxy: {
    name: 'DXY',
    label: '美元指数',
    unit: 'Index',
    branch: 'liquidity',
    what: '衡量美元相对一篮子主要国际货币（如欧元、日元等）汇率变化的指数。',
    whyItMatters: '反映全球美元流动性的松紧。当美元指数走强，代表离岸美元流动性收缩，可能对非美资产和全球信用市场带来压制。',
    relationships: [
      { target: 'nfci', label: '美元持续走强通常伴随着全球金融条件指数的同步收紧。' }
    ],
    frequency: 'Daily',
    sourceHint: 'Yahoo Finance'
  },
  rrp: {
    name: 'RRP',
    label: '美联储隔夜逆回购余额',
    unit: 'B USD',
    branch: 'liquidity',
    what: '货币市场基金等金融机构暂时寄存在美联储系统中的闲置资金。',
    whyItMatters: '是市场的流动性缓冲区。当逆回购资金流出（减少）时，说明闲置资金正在释放回金融系统，可为资产流动性提供缓冲。',
    relationships: [
      { target: 'nfci', label: 'RRP 的释放通常能暂时缓解信用市场的紧张情绪。' }
    ],
    frequency: 'Daily',
    sourceHint: 'FRED / Federal Reserve'
  },
  nfci: {
    name: 'NFCI',
    label: '国家金融条件指数',
    unit: 'Index',
    branch: 'liquidity',
    what: '由芝加哥联储发布的综合指标，融合了信用利差、市场杠杆、资金风险等 105 个金融子项。',
    whyItMatters: '用于客观衡量全美金融市场的松紧度。以 0 为历史平均值，数值越低（为负数）代表融资条件越宽松，金融环境越安全；为正数则代表融资条件收紧。',
    relationships: [
      { target: 'us10y', label: '金融条件收紧时，往往伴随长期美债收益率的大幅波动。' }
    ],
    frequency: 'Weekly',
    sourceHint: 'Chicago Fed / FRED'
  },
  gdp: {
    name: 'GDP Growth',
    label: 'GDP 季度折年增长率',
    unit: '%',
    branch: 'fundamentals',
    what: '衡量一国经济总产出和消费规模变动的季度同比或年化增长速度。',
    whyItMatters: '反映经济增长实力。持续稳定的 GDP 增长能为企业利润增长奠定坚实的底层商业环境基础。',
    relationships: [
      { target: 'cpi', label: '若经济产出极度强劲（过热），可能会催生通货膨胀上升的压力。' }
    ],
    frequency: 'Quarterly',
    sourceHint: 'BEA / FRED'
  },
  cpi: {
    name: 'CPI YoY',
    label: '消费者物价指数同比变化',
    unit: '%',
    branch: 'inflation',
    what: '反映居民家庭购买消费品和服务价格水平变动幅度的物价指数，涵盖食品、住房、医疗等主要消费类别。',
    whyItMatters: '是美联储设定货币政策和降息/加息决策的关键衡量标尺。高通胀会限制降息空间，并可能逼迫央行维持限制性高利率。',
    relationships: [
      { target: 'us10y', label: '当市场预期通胀居高不下时，十年期美债收益率通常会被动推高。' },
      { target: 'pce_yoy', label: 'PCE 与 CPI 结构略有不同，两者同向时通胀信号更为可靠。' }
    ],
    frequency: 'Monthly',
    sourceHint: 'BLS / FRED'
  },
  pce_yoy: {
    name: 'PCE YoY',
    label: '个人消费支出物价指数同比',
    unit: '%',
    branch: 'inflation',
    what: '由商务部 BEA 发布，衡量消费者购买商品和服务价格的年化变动率。与 CPI 相比，PCE 权重更广、能更好捕捉消费结构变化。',
    whyItMatters: '这是美联储最倚重的通胀基准指标之一。当 PCE 超出 2% 目标时，美联储维持偏紧货币政策的概率上升。',
    relationships: [
      { target: 'core_pce_yoy', label: '剔除食品和能源后的核心 PCE 更能反映通胀的持续性与粘性。' }
    ],
    frequency: 'Monthly',
    sourceHint: 'BEA / FRED'
  },
  core_pce_yoy: {
    name: 'Core PCE YoY',
    label: '核心 PCE 物价指数同比',
    unit: '%',
    branch: 'inflation',
    what: '剔除食品和能源等高波动分项后的 PCE 年化增速，被视为通胀核心趋势的最佳代理变量。',
    whyItMatters: '美联储在调整利率时最直接参考的通胀指标。核心 PCE 持续高于 2% 意味着降息条件尚不成熟，政策路径将继续偏紧。',
    relationships: [
      { target: 'breakeven_10y', label: '若核心 PCE 持续上行，市场通胀预期（Breakeven）也会跟随上移，进一步压制长端利率。' }
    ],
    frequency: 'Monthly',
    sourceHint: 'BEA / FRED'
  },
  breakeven_10y: {
    name: 'Breakeven 10Y',
    label: '10年期盈亏平衡通胀率',
    unit: '%',
    branch: 'inflation',
    what: '由名义国债收益率减去同期通胀保值债券（TIPS）收益率计算，直接反映债券市场参与者对未来 10 年平均通胀的集体预期。',
    whyItMatters: '若盈亏平衡通胀率远超 2%，代表市场对美联储未能压制通胀的担忧。反之，若其大幅回落，则暗示经济增长预期走弱或通缩风险上升。',
    relationships: [
      { target: 'us10y', label: '通胀预期上行通常同步推高名义国债收益率，造成估值双重压制。' }
    ],
    frequency: 'Daily',
    sourceHint: 'FRED (T10YIE)'
  },
  us10y: {
    name: 'US10Y',
    label: '10年期美债收益率',
    unit: '%',
    branch: 'fundamentals',
    what: '美国十年期国债的到期收益率，被全球金融市场公认为“无风险利率”的核心锚。',
    whyItMatters: '直接影响全球各种借贷利率与资产贴现折现率。收益率走高，意味着借贷成本攀升，高估值资产（如成长股）折现后面临更大的估值压力。',
    relationships: [
      { target: 'vix', label: '利率如果快速飙升，往往会造成股市隐含波动率 VIX 同步上行。' }
    ],
    frequency: 'Daily',
    sourceHint: 'FRED'
  }
}

export const RELATED_METRIC_ROUTES = {
  // Sentiment
  fear_greed: { routeType: 'external', url: 'https://edition.cnn.com/markets/fear-and-greed' },
  crypto_fgi: { routeType: 'external', url: 'https://www.coinglass.com/pro/i/FearGreedIndex' },
  vix: { routeType: 'internal', symbol: '^VIX', source: 'yahoo' },

  // Liquidity
  walcl: { routeType: 'external', url: 'https://fred.stlouisfed.org/series/WALCL' },
  fed_balance_sheet: { routeType: 'external', url: 'https://fred.stlouisfed.org/series/WALCL' },
  tga: { routeType: 'external', url: 'https://fred.stlouisfed.org/series/WDTGAL' },
  rrp: { routeType: 'external', url: 'https://fred.stlouisfed.org/series/RRPONTSYD' },
  bank_reserves: { routeType: 'external', url: 'https://fred.stlouisfed.org/series/TOTRESNS' },
  reserves: { routeType: 'external', url: 'https://fred.stlouisfed.org/series/TOTRESNS' },
  nfci: { routeType: 'external', url: 'https://fred.stlouisfed.org/series/NFCI' },
  dxy: { routeType: 'internal', symbol: 'DX-Y.NYB', source: 'yahoo' },

  // Fundamentals & Inflation
  gdp_growth: { routeType: 'external', url: 'https://fred.stlouisfed.org/series/A191RL1Q225SBEA' },
  gdp: { routeType: 'external', url: 'https://fred.stlouisfed.org/series/GDPC1' },
  cpi_yoy: { routeType: 'external', url: 'https://fred.stlouisfed.org/series/CPIAUCSL' },
  cpi_mom: { routeType: 'external', url: 'https://fred.stlouisfed.org/series/CPIAUCSL' },
  core_pce: { routeType: 'external', url: 'https://fred.stlouisfed.org/series/PCEPILFE' },
  pce_yoy: { routeType: 'external', url: 'https://fred.stlouisfed.org/series/PCEPILFE' },
  core_pce_yoy: { routeType: 'external', url: 'https://fred.stlouisfed.org/series/PCEPILFE' },
  ppi: { routeType: 'external', url: 'https://fred.stlouisfed.org/series/PPIACO' },
  yield_curve: { routeType: 'external', url: 'https://fred.stlouisfed.org/series/T10Y2Y' },
  spread_10y_2y: { routeType: 'external', url: 'https://fred.stlouisfed.org/series/T10Y2Y' },
  fed_funds_rate: { routeType: 'external', url: 'https://fred.stlouisfed.org/series/FEDFUNDS' },
  us10y: { routeType: 'internal', symbol: '^TNX', source: 'yahoo' },
  real_yield_10y: { routeType: 'external', url: 'https://fred.stlouisfed.org/series/DFII10' },
  tips_10y: { routeType: 'external', url: 'https://fred.stlouisfed.org/series/DFII10' },
  breakeven_10y: { routeType: 'external', url: 'https://fred.stlouisfed.org/series/T10YIE' },

  // Economy & Credit
  recession_probability: { routeType: 'external', url: 'https://fred.stlouisfed.org/series/RECPROUSM156N' },
  cfnai: { routeType: 'external', url: 'https://fred.stlouisfed.org/series/CFNAI' },
  retail_sales: { routeType: 'external', url: 'https://fred.stlouisfed.org/series/RSXFS' },
  industrial_production: { routeType: 'external', url: 'https://fred.stlouisfed.org/series/INDPRO' },
  unemployment_rate: { routeType: 'external', url: 'https://fred.stlouisfed.org/series/UNRATE' },
  sahm_rule: { routeType: 'external', url: 'https://fred.stlouisfed.org/series/SAHMREALTIME' },
  nonfarm_payrolls: { routeType: 'external', url: 'https://fred.stlouisfed.org/series/PAYEMS' },
  initial_claims: { routeType: 'external', url: 'https://fred.stlouisfed.org/series/ICSA' },
  continuing_claims: { routeType: 'external', url: 'https://fred.stlouisfed.org/series/CCSA' },
  hy_spread: { routeType: 'external', url: 'https://fred.stlouisfed.org/series/BAMLH0A0HYM2' },
  high_yield_spread: { routeType: 'external', url: 'https://fred.stlouisfed.org/series/BAMLH0A0HYM2' },
  loan_delinquency: { routeType: 'external', url: 'https://fred.stlouisfed.org/series/DRALACBS' },
  default_rate: { routeType: 'external', url: 'https://fred.stlouisfed.org/series/DRALACBS' },

  // Commodities
  gold: { routeType: 'internal', symbol: 'GC=F', source: 'yahoo' },
  silver: { routeType: 'internal', symbol: 'SI=F', source: 'yahoo' },
  gold_silver_ratio: { routeType: 'external', url: 'https://fred.stlouisfed.org/graph/?g=1nS' },
  brent: { routeType: 'internal', symbol: 'BZ=F', source: 'yahoo' },
  oil: { routeType: 'internal', symbol: 'CL=F', source: 'yahoo' },
  copper: { routeType: 'internal', symbol: 'HG=F', source: 'yahoo' }
}
