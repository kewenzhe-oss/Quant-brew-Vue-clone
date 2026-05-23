export const MACRO_EDUCATION_CONFIG_ZH = {
  sentiment: {
    sectionDescription: '市场情绪衡量投资者当前的风险偏好。情绪过度恐慌时，资产可能被非理性抛售；情绪过度贪婪时，市场容错率下降。情绪指标不应单独作为决策依据，应与流动性、估值和基本面一起判断。',
    sections: [
      {
        title: 'CNN Fear & Greed Index',
        description: '综合 7 个市场信号，生成 0–100 的情绪评分。0 表示极度恐慌，100 表示极度贪婪。巴菲特名言「别人恐惧时我贪婪，别人贪婪时我恐惧」就是对这类反向情绪指标的典型诠释。',
        indicators: [
          {
            name: 'Fear & Greed Index',
            description: '0–100 情绪分数，衡量市场恐慌与贪婪程度。',
            whyItMatters: '极端恐慌可能带来非理性抛售，极端贪婪则代表市场容错率下降。',
            relatedMetricIds: ['fear_greed', 'crypto_fgi'],
            thresholds: [
              { range: '0–25', label: '极度恐慌', meaning: '市场极度恐慌，可能出现非理性抛售。历史上往往是较好的长期观察区，但需要结合基本面判断是否存在系统性风险。' },
              { range: '25–45', label: '恐慌', meaning: '市场偏悲观，投资者风险偏好下降。适合关注是否有优质资产被错杀。' },
              { range: '45–55', label: '中性', meaning: '市场情绪中性，无明显方向性偏向。' },
              { range: '55–75', label: '贪婪', meaning: '市场偏乐观，风险偏好上升。需要警惕追高风险与短期波动。' },
              { range: '75–100', label: '极度贪婪', meaning: '市场可能过度乐观，杠杆与估值容错率下降。应检查既定计划是否过度激进。' }
            ]
          }
        ]
      },
      {
        title: 'VIX',
        description: '衡量标普 500 期权市场对未来 30 天波动率的预期，常被称为「恐慌指数」。VIX 越高，代表市场对未来波动的担忧越强；VIX 越低，代表市场相对平稳，但过低也可能意味着市场过度自满。',
        indicators: [
          {
            name: 'VIX Volatility Index',
            description: '标普 500 隐含波动率预期。',
            whyItMatters: '反映资金避险情绪的温度计，与大盘走势通常呈现负相关。',
            relatedMetricIds: ['vix'],
            thresholds: [
              { range: '低于 20', label: '平稳', meaning: '市场相对平稳，投资人情绪偏乐观。' },
              { range: '20–30', label: '担忧', meaning: '市场开始出现不确定性或担忧情绪，短期波动风险上升。' },
              { range: '高于 30', label: '恐慌', meaning: '通常意味着市场进入恐慌状态，常见于金融危机、流动性冲击或突发事件期间。' }
            ]
          }
        ]
      }
    ]
  },
  inflationRates: {
    sectionDescription: '通胀与利率是影响股市估值的核心变量。通胀决定美联储是否有空间降息，利率则决定企业融资成本与股票估值折现率。通胀越黏、利率越高，长久期资产与成长股承压越明显。',
    sections: [
      {
        title: '通胀如何影响股市',
        description: '通胀衡量的是物价上涨速度。美联储的目标是将通胀控制在 2% 附近。当通胀高于目标，美联储倾向于维持高利率或加息压制物价；当通胀回到 2% 附近，美联储才有更大空间降息。加息通常压制股价，降息通常改善估值环境，因此通胀走向会直接影响市场对美联储下一步政策的预期。',
        indicators: [
          {
            name: 'CPI (消费者物价指数)',
            description: '覆盖面最广的消费者物价指数，包含食品、能源、住房等。',
            whyItMatters: '月环比超过 0.3% 往往意味着年化通胀仍明显高于 2% 目标，市场可能重新定价利率路径。',
            relatedMetricIds: ['cpi_yoy', 'cpi_mom']
          },
          {
            name: 'Core PCE (核心个人消费支出)',
            description: '剔除食品和能源，是美联储制定利率政策时最关注的通胀指标之一。',
            whyItMatters: '若核心 PCE 持续高于 2.5%，市场通常会降低对快速降息的预期。',
            relatedMetricIds: ['core_pce']
          },
          {
            name: 'PPI (生产者物价指数)',
            description: '衡量生产端出厂价格变动，是通胀的上游信号。',
            whyItMatters: 'PPI 上升意味着企业成本增加，最终可能传导到 CPI。若 PPI 持续高于 CPI，可能暗示企业利润率承压。',
            relatedMetricIds: ['ppi']
          }
        ]
      },
      {
        title: '利率如何影响股市',
        description: '利率决定借钱成本，也决定股票估值折现率。利率越高，企业借钱扩张越贵，消费者贷款成本越高，经济增长可能放缓。同时，当无风险利率提高，投资者从国债等资产获得的回报提高，股票吸引力会下降。反过来，利率下降时，风险资产的估值压力通常会缓解。',
        indicators: [
          {
            name: 'Yield Curve (收益率曲线)',
            description: '展示从短期到长期的国债收益率。',
            whyItMatters: '正常情况下长期利率高于短期利率。若短期利率反超长期利率，形成曲线倒挂，历史上常被视为衰退风险上升的信号。',
            relatedMetricIds: ['yield_curve', 'spread_10y_2y']
          },
          {
            name: 'Federal Funds Rate (联邦基金利率)',
            description: '美联储直接设定的短期政策利率，也是许多贷款利率的基准。',
            whyItMatters: '加息通常提高市场融资成本，降息则降低资金成本。',
            relatedMetricIds: ['fed_funds_rate']
          },
          {
            name: 'US 10Y Yield (10年期美债收益率)',
            description: '10 年期美国国债收益率是长期利率的代表。',
            whyItMatters: '直接影响房贷利率、企业融资成本与股票估值。10Y 收益率上升时，成长股与科技股通常受到更大压力。',
            relatedMetricIds: ['us10y']
          },
          {
            name: '10Y Real Yield / TIPS (10年期实际利率)',
            description: '扣除通胀后的真实利率水平。',
            whyItMatters: '实际利率越高，代表货币政策对资产价格的压制越强。超过 2% 通常被视为较限制性的水平。',
            relatedMetricIds: ['real_yield_10y', 'tips_10y']
          }
        ]
      },
      {
        title: '大宗商品如何影响股市',
        description: '大宗商品价格反映全球供需、通胀压力与风险偏好。黄金常被视为避险与抗通胀资产；原油直接影响企业成本与消费者支出；美元指数则影响全球流动性、海外收入与以美元计价的大宗商品。',
        indicators: [
          {
            name: 'Gold (黄金)',
            description: '传统避险资产和抗通胀工具。',
            whyItMatters: '金价持续上涨可能反映市场对通胀、央行政策或地缘政治风险的担忧上升。',
            relatedMetricIds: ['gold']
          },
          {
            name: 'Silver (白银)',
            description: '兼具贵金属避险属性和工业金属属性。',
            whyItMatters: '金银比偏高时，市场可能认为白银相对黄金被低估；金银比偏低时，通常反映风险偏好较强。',
            relatedMetricIds: ['silver', 'gold_silver_ratio']
          },
          {
            name: 'Brent Crude Oil (布伦特原油)',
            description: '全球基准油价。',
            whyItMatters: '油价飙升会推高运输与生产成本，可能加剧通胀。油价大幅下跌则可能暗示全球需求走弱。',
            relatedMetricIds: ['brent', 'oil']
          },
          {
            name: 'Copper (铜)',
            description: '广泛用于制造业与基建，被称为「铜博士」。',
            whyItMatters: '铜价上涨通常反映需求扩张，下跌则可能暗示经济活动走弱，是经济健康的领先信号。',
            relatedMetricIds: ['copper']
          },
          {
            name: 'DXY (美元指数)',
            description: '衡量美元相对一篮子主要货币的强弱。',
            whyItMatters: '美元走强通常有利于进口，但会压制出口企业盈利，并降低以美元计价的大宗商品价格，可能收紧离岸流动性。',
            relatedMetricIds: ['dxy']
          }
        ]
      }
    ]
  },
  economy: {
    sectionDescription: '经济数据反映企业收入、消费能力、就业健康与信用环境。股市通常会提前 6–9 个月反映经济变化，因此投资者不只要看数据本身，也要看变化方向与是否出现衰退前兆。',
    sections: [
      {
        title: '经济增长如何影响股市',
        description: '企业利润来自 economic 活动。经济增长时，企业营收与盈利通常改善；经济衰退时，企业利润下滑，股价容易承压。但股市往往提前反映经济变化，所以当增长指标刚开始走弱时，市场可能已经提前反应。',
        indicators: [
          {
            name: 'GDP Growth (国内生产总值增长)',
            description: '衡量经济总量的增长速度。',
            whyItMatters: '高于 2% 通常代表健康增长；连续两个季度为负则常被称为技术性衰退。',
            relatedMetricIds: ['gdp_growth']
          },
          {
            name: 'Recession Probability / CFNAI (衰退概率与经济活动指数)',
            description: '经济风险预警综合指标。',
            whyItMatters: '衰退概率明显上升，或 CFNAI 低于 -0.7 时，常伴随衰退风险升高，市场对防御性资产关注度上升。',
            relatedMetricIds: ['recession_probability', 'cfnai']
          },
          {
            name: 'Retail Sales / Industrial Production (零售销售与工业产出)',
            description: '衡量消费终端与工业生产的活跃度。',
            whyItMatters: '零售销售下降可能意味着消费者缩减开支；工业产出下降通常影响制造业与周期性股票。',
            relatedMetricIds: ['retail_sales', 'industrial_production']
          }
        ]
      },
      {
        title: '就业如何影响股市',
        description: '就业良好代表居民收入稳定、消费有支撑、企业盈利环境较好。但失业率快速上升往往是衰退信号。就业也是美联储判断是否降息的重要依据，因此重点不是单一数字，而是就业数据的变化方向。',
        indicators: [
          {
            name: 'Unemployment Rate / Sahm Rule (失业率与萨姆规则)',
            description: '衡量劳动力市场疲软程度与衰退风险。',
            whyItMatters: '当失业率从低点上升 0.5 个百分点并触发 Sahm Rule，历史上常伴随经济衰退与市场压力。',
            relatedMetricIds: ['unemployment_rate', 'sahm_rule']
          },
          {
            name: 'Nonfarm Payrolls (非农就业)',
            description: '市场最关注的月度新增就业人数。',
            whyItMatters: '增长强劲通常代表劳动市场韧性；若转为负增长，通常需要警惕经济下行压力。',
            relatedMetricIds: ['nonfarm_payrolls']
          },
          {
            name: 'Initial / Continuing Jobless Claims (初请与续请失业金)',
            description: '每周发布的及时就业观察指标。',
            whyItMatters: '初请失业金明显上升通常领先失业率上行，是劳动市场转弱的早期信号。',
            relatedMetricIds: ['initial_claims', 'continuing_claims']
          }
        ]
      },
      {
        title: '信用市场如何影响股市',
        description: '企业依赖信用市场来融资与扩张。当借钱成本上升、信用利差扩大或违约率增加时，代表金融环境恶化，企业经营压力增加。历史上信用利差快速扩大常常领先于股市压力，因为债券市场通常更早反映风险。',
        indicators: [
          {
            name: 'High Yield Spread (高收益债利差)',
            description: '衡量高风险企业债相对国债的额外收益率。',
            whyItMatters: '低于 350 bps 代表市场乐观；超过 500 bps 代表风险定价上升；超过 800 bps 接近危机级别。',
            relatedMetricIds: ['hy_spread', 'high_yield_spread']
          },
          {
            name: '10Y-2Y Spread (长短端利差)',
            description: '衡量长短端收益率差。',
            whyItMatters: '若利差转负，代表收益率曲线倒挂，历史上常领先经济衰退。',
            relatedMetricIds: ['spread_10y_2y']
          },
          {
            name: 'Loan Delinquency / Default Rate (贷款违约率)',
            description: '衡量企业或家庭的还款压力。',
            whyItMatters: '违约率上升可能导致银行收紧放贷，信用环境进一步恶化，形成负向循环。',
            relatedMetricIds: ['loan_delinquency', 'default_rate']
          }
        ]
      }
    ]
  },
  liquidity: {
    sectionDescription: '流动性衡量市场上实际可用的资金环境。可以把美联储想像成一个大水龙头：美联储总资产 WALCL 是向市场「放水」，而财政部账户 TGA 和隔夜逆回购 RRP 则会暂时「抽水」。净流动性越高，风险资产通常越容易获得估值支撑；净流动性收缩时，资产价格更容易承压。',
    sections: [
      {
        title: '净流动性公式 (Net Liquidity)',
        description: '净流动性 = 美联储总资产 (WALCL) - 财政部账户 (TGA) - 隔夜逆回购 (RRP)。这个数字越大，代表市场上可用资金越多，通常有利于股市等风险资产；这个数字缩小，代表市场上资金变少，资产价格更容易承受估值压力。',
        indicators: [
          {
            name: 'WALCL (美联储总资产)',
            description: '美联储向市场提供的基础流动性。',
            whyItMatters: '上升代表央行扩表放水；下降代表缩表回收流动性。',
            relatedMetricIds: ['walcl', 'fed_balance_sheet']
          },
          {
            name: 'TGA (财政部一般账户)',
            description: '美国财政部存在美联储的账户。',
            whyItMatters: '政府发债补充 TGA 时，会从市场吸走现金（抽水）；政府支出消耗 TGA 时，资金流回市场（放水）。',
            relatedMetricIds: ['tga']
          },
          {
            name: 'RRP (隔夜逆回购)',
            description: '金融机构暂时停放在美联储的闲置资金。',
            whyItMatters: 'RRP 下降代表资金回到市场；但若 RRP 接近零，市场将失去一个重要的流动性缓冲垫。',
            relatedMetricIds: ['rrp']
          }
        ]
      },
      {
        title: '其他流动性指标',
        description: '除基础净流动性外，金融体系的准备金水位与信用利差也是衡量流动性健康程度的关键指标。',
        indicators: [
          {
            name: 'Bank Reserves (银行准备金)',
            description: '银行系统持有的现金储备。',
            whyItMatters: '若低于约 3 万亿美元，市场可能开始关注资金紧张与隔夜利率波动风险。',
            relatedMetricIds: ['bank_reserves', 'reserves']
          },
          {
            name: 'NFCI (芝加哥联储国家金融条件指数)',
            description: '综合衡量信用利差、杠杆与风险指标的金融条件松紧程度。',
            whyItMatters: '0 代表历史平均，负值代表金融条件偏宽松，正值代表金融条件偏紧。',
            relatedMetricIds: ['nfci']
          }
        ]
      }
    ]
  }
}

export const MACRO_EDUCATION_CONFIG_EN = {
  sentiment: {
    sectionDescription: 'Market sentiment measures the current risk appetite of investors. During periods of extreme panic, assets may be sold irrationally; during periods of extreme greed, market margin for error decreases. Sentiment indicators should not be used in isolation for decision-making but rather evaluated alongside liquidity, valuation, and fundamentals.',
    sections: [
      {
        title: 'CNN Fear & Greed Index',
        description: 'Synthesizes 7 market signals to generate a sentiment score from 0–100. 0 represents extreme fear, and 100 represents extreme greed. Warren Buffett\'s famous quote, "Be fearful when others are greedy, and greedy when others are fearful," is a classic interpretation of such contrarian sentiment indicators.',
        indicators: [
          {
            name: 'Fear & Greed Index',
            description: '0–100 sentiment score measuring the degree of market fear and greed.',
            whyItMatters: 'Extreme fear may trigger irrational sell-offs, while extreme greed represents a reduced margin for error in the market.',
            relatedMetricIds: ['fear_greed', 'crypto_fgi'],
            thresholds: [
              { range: '0–25', label: 'Extreme Fear', meaning: 'The market is extremely panicky, potentially leading to irrational selling. Historically, this is often a good long-term observation window, but it is necessary to combine it with fundamentals to determine if systemic risk exists.' },
              { range: '25–45', label: 'Fear', meaning: 'The market is somewhat pessimistic, and investor risk appetite has declined. Suitable for monitoring whether quality assets are being sold off indiscriminately.' },
              { range: '45–55', label: 'Neutral', meaning: 'Market sentiment is neutral, with no obvious directional bias.' },
              { range: '55–75', label: 'Greed', meaning: 'The market is somewhat optimistic, and risk appetite has risen. Caution is needed against chasing highs and short-term volatility.' },
              { range: '75–100', label: 'Extreme Greed', meaning: 'The market may be overly optimistic, with leverage and valuation margin for error decreasing. It is advisable to review whether established plans are overly aggressive.' }
            ]
          }
        ]
      },
      {
        title: 'VIX',
        description: 'Measures the S&P 500 options market expectation of 30-day volatility, commonly known as the "Fear Index." A higher VIX represents stronger concern over future volatility; a lower VIX indicates relative market calm, though extremely low levels can signal market complacency.',
        indicators: [
          {
            name: 'VIX Volatility Index',
            description: 'Expected implied volatility of the S&P 500.',
            whyItMatters: 'Serves as a thermometer of capital hedging sentiment, typically showing a negative correlation with the overall stock market.',
            relatedMetricIds: ['vix'],
            thresholds: [
              { range: 'Below 20', label: 'Stable', meaning: 'The market is relatively stable, and investor sentiment leans optimistic.' },
              { range: '20–30', label: 'Concern', meaning: 'Uncertainty or concern is beginning to emerge in the market, raising short-term volatility risks.' },
              { range: 'Above 30', label: 'Panic', meaning: 'Typically indicates the market has entered a state of panic, commonly seen during financial crises, liquidity shocks, or black swan events.' }
            ]
          }
        ]
      }
    ]
  },
  inflationRates: {
    sectionDescription: 'Inflation and interest rates are core variables affecting stock valuations. Inflation determines whether the Federal Reserve has room to cut rates, while interest rates dictate corporate borrowing costs and stock valuation discount rates. The stickier the inflation and the higher the rates, the more long-duration assets and growth stocks will face pressure.',
    sections: [
      {
        title: 'How Inflation Affects the Stock Market',
        description: 'Inflation measures the rate at which prices rise. The Fed\'s goal is to control inflation around 2%. When inflation is above target, the Fed tends to maintain high interest rates or raise them to suppress prices; only when inflation returns close to 2% does the Fed have more room to cut rates. Rate hikes typically depress stock prices, while rate cuts improve the valuation environment, so the trajectory of inflation directly influences market expectations for the Fed\'s next policy moves.',
        indicators: [
          {
            name: 'CPI (Consumer Price Index)',
            description: 'The most widely covered consumer price index, encompassing food, energy, housing, etc.',
            whyItMatters: 'A month-over-month increase exceeding 0.3% often implies annualized inflation remains significantly above the 2% target, potentially causing the market to reprice the interest rate path.',
            relatedMetricIds: ['cpi_yoy', 'cpi_mom']
          },
          {
            name: 'Core PCE (Core Personal Consumption Expenditures)',
            description: 'Excludes food and energy, serving as one of the inflation indicators the Federal Reserve pays closest attention to when setting interest rate policy.',
            whyItMatters: 'If Core PCE remains consistently above 2.5%, the market typically lowers its expectations for rapid rate cuts.',
            relatedMetricIds: ['core_pce']
          },
          {
            name: 'PPI (Producer Price Index)',
            description: 'Measures factory-gate price changes on the production side, serving as an upstream signal for inflation.',
            whyItMatters: 'Rising PPI means increased corporate costs, which may eventually feed through to CPI. If PPI remains consistently higher than CPI, it may suggest pressure on corporate profit margins.',
            relatedMetricIds: ['ppi']
          }
        ]
      },
      {
        title: 'How Interest Rates Affect the Stock Market',
        description: 'Interest rates determine borrowing costs and the discount rate for stock valuations. Higher rates make corporate borrowing for expansion more expensive, consumer loans costlier, and can slow economic growth. Simultaneously, as the risk-free rate rises, the returns investors get from assets like Treasuries increase, reducing the relative appeal of stocks. Conversely, when interest rates decline, valuation pressure on risk assets typically eases.',
        indicators: [
          {
            name: 'Yield Curve',
            description: 'Displays Treasury yields from short-term to long-term maturities.',
            whyItMatters: 'Under normal circumstances, long-term yields are higher than short-term yields. If short-term yields exceed long-term ones, forming an inverted yield curve, it is historically seen as a signal of rising recession risks.',
            relatedMetricIds: ['yield_curve', 'spread_10y_2y']
          },
          {
            name: 'Federal Funds Rate',
            description: 'The short-term policy interest rate directly set by the Federal Reserve, which also serves as the benchmark for many commercial loan rates.',
            whyItMatters: 'Rate hikes generally increase market borrowing costs, whereas rate cuts lower the cost of capital.',
            relatedMetricIds: ['fed_funds_rate']
          },
          {
            name: 'US 10Y Yield',
            description: 'The yield on the 10-year US Treasury bond, representing long-term interest rates.',
            whyItMatters: 'Directly affects mortgage rates, corporate financing costs, and stock valuations. When the 10Y yield rises, growth and tech stocks typically face greater pressure.',
            relatedMetricIds: ['us10y']
          },
          {
            name: '10Y Real Yield / TIPS',
            description: 'The level of real interest rates after subtracting inflation.',
            whyItMatters: 'A higher real yield represents stronger monetary policy constraint on asset prices. Levels exceeding 2% are generally considered restrictive.',
            relatedMetricIds: ['real_yield_10y', 'tips_10y']
          }
        ]
      },
      {
        title: 'How Commodities Affect the Stock Market',
        description: 'Commodity prices reflect global supply and demand, inflationary pressures, and risk appetite. Gold is traditionally viewed as a safe-haven and inflation-hedge asset; crude oil directly impacts corporate expenses and consumer spending; and the US Dollar Index (DXY) affects global liquidity, corporate overseas earnings, and dollar-denominated commodity prices.',
        indicators: [
          {
            name: 'Gold',
            description: 'Traditional safe-haven asset and inflation hedge.',
            whyItMatters: 'Sustained increases in gold prices may reflect rising market concerns over inflation, central bank policy shifts, or geopolitical risks.',
            relatedMetricIds: ['gold']
          },
          {
            name: 'Silver',
            description: 'Possesses both precious metal safe-haven attributes and industrial metal properties.',
            whyItMatters: 'When the gold-to-silver ratio is high, the market may perceive silver as undervalued relative to gold; a low ratio typically reflects stronger risk appetite.',
            relatedMetricIds: ['silver', 'gold_silver_ratio']
          },
          {
            name: 'Brent Crude Oil',
            description: 'Global benchmark crude oil price.',
            whyItMatters: 'Spikes in oil prices drive up transportation and manufacturing costs, potentially exacerbating inflation. Sharp drops in oil prices may imply weakening global demand.',
            relatedMetricIds: ['brent', 'oil']
          },
          {
            name: 'Copper',
            description: 'Widely used in manufacturing and infrastructure, nicknamed "Dr. Copper."',
            whyItMatters: 'Rising copper prices usually reflect expanding demand, while declines can suggest weakening economic activity, serving as a leading indicator of economic health.',
            relatedMetricIds: ['copper']
          },
          {
            name: 'DXY (US Dollar Index)',
            description: 'Measures the strength of the US dollar relative to a basket of major foreign currencies.',
            whyItMatters: 'A strengthening US dollar generally benefits imports but pressures export corporate earnings, dampens dollar-denominated commodity prices, and can tighten offshore liquidity.',
            relatedMetricIds: ['dxy']
          }
        ]
      }
    ]
  },
  economy: {
    sectionDescription: 'Economic data reflects corporate revenues, consumer purchasing power, labor market health, and credit conditions. The stock market typically prices in economic changes 6–9 months in advance, so investors should look not only at the data itself but also at its direction of change and potential recession precursors.',
    sections: [
      {
        title: 'How Economic Growth Affects the Stock Market',
        description: 'Corporate profits derive from economic activity. During economic growth, corporate revenues and earnings typically improve; during recessions, corporate profits decline, and stock prices face downward pressure. However, since the stock market often anticipates economic shifts, it may have already reacted by the time growth indicators begin to soften.',
        indicators: [
          {
            name: 'GDP Growth',
            description: 'Measures the growth rate of total economic output.',
            whyItMatters: 'Growth above 2% typically represents healthy expansion; consecutive negative growth for two quarters is commonly termed a technical recession.',
            relatedMetricIds: ['gdp_growth']
          },
          {
            name: 'Recession Probability / CFNAI',
            description: 'Composite warning indicators for economic risk.',
            whyItMatters: 'When the recession probability rises significantly or the CFNAI drops below -0.7, recession risks are typically elevated, driving increased market interest in defensive assets.',
            relatedMetricIds: ['recession_probability', 'cfnai']
          },
          {
            name: 'Retail Sales / Industrial Production',
            description: 'Measures activity levels in retail consumption and industrial manufacturing.',
            whyItMatters: 'Declining retail sales may indicate consumers are cutting back on spending; lower industrial production typically impacts manufacturing and cyclical stocks.',
            relatedMetricIds: ['retail_sales', 'industrial_production']
          }
        ]
      },
      {
        title: 'How Employment Affects the Stock Market',
        description: 'Robust employment indicates stable household incomes, solid support for consumption, and a favorable business environment. However, a rapid rise in the unemployment rate is often a recessionary signal. Since employment is also a key input for the Fed\'s rate cut decisions, the focus should be on the direction of change in jobs data rather than any single figure.',
        indicators: [
          {
            name: 'Unemployment Rate / Sahm Rule',
            description: 'Measures labor market slack and recessionary risk.',
            whyItMatters: 'When the unemployment rate rises by 0.5 percentage points from its low, triggering the Sahm Rule, it historically coincides with economic recessions and market stress.',
            relatedMetricIds: ['unemployment_rate', 'sahm_rule']
          },
          {
            name: 'Nonfarm Payrolls',
            description: 'The monthly net change in jobs, which is highly scrutinized by the market.',
            whyItMatters: 'Robust growth typically indicates labor market resilience; a shift to negative growth is a warning sign of downward economic pressure.',
            relatedMetricIds: ['nonfarm_payrolls']
          },
          {
            name: 'Initial / Continuing Jobless Claims',
            description: 'Timely weekly indicators monitoring the labor market.',
            whyItMatters: 'A significant rise in initial jobless claims usually precedes increases in the unemployment rate, serving as an early warning of a weakening labor market.',
            relatedMetricIds: ['initial_claims', 'continuing_claims']
          }
        ]
      },
      {
        title: 'How the Credit Market Affects the Stock Market',
        description: 'Corporations rely on credit markets for financing and expansion. Rising borrowing costs, widening credit spreads, or increasing default rates indicate deteriorating financial conditions and mounting corporate operational pressure. Historically, rapid widening of credit spreads has often run ahead of stock market stress, as bond markets tend to price in risks earlier.',
        indicators: [
          {
            name: 'High Yield Spread',
            description: 'Measures the yield premium of high-risk corporate bonds over comparable Treasuries.',
            whyItMatters: 'Spreads below 350 bps signal market optimism; spreads above 500 bps indicate rising risk pricing; spreads exceeding 800 bps approach crisis levels.',
            relatedMetricIds: ['hy_spread', 'high_yield_spread']
          },
          {
            name: '10Y-2Y Spread',
            description: 'Measures the yield difference between long-term and short-term debt.',
            whyItMatters: 'If the spread turns negative, it signifies an inverted yield curve, which historically has preceded economic recessions.',
            relatedMetricIds: ['spread_10y_2y']
          },
          {
            name: 'Loan Delinquency / Default Rate',
            description: 'Measures repayment pressures faced by businesses or households.',
            whyItMatters: 'Rising delinquency rates can prompt banks to tighten lending standards, further deteriorating the credit environment and risking a negative feedback loop.',
            relatedMetricIds: ['loan_delinquency', 'default_rate']
          }
        ]
      }
    ]
  },
  liquidity: {
    sectionDescription: 'Liquidity measures the cash environment actually available to the market. Think of the Fed as a giant water tap: Fed Total Assets (WALCL) represents "injecting water" into the market, while the Treasury General Account (TGA) and Overnight Reverse Repurchase Agreement (RRP) act to temporarily "drain water." The higher the net liquidity, the easier it is for risk assets to receive valuation support; when net liquidity contracts, asset prices face greater downward pressure.',
    sections: [
      {
        title: 'Net Liquidity Formula',
        description: 'Net Liquidity = Fed Total Assets (WALCL) - Treasury General Account (TGA) - Overnight Reverse Repurchase Agreements (RRP). The larger this figure, the more available cash there is in the market, which typically benefits risk assets like equities. A shrinking figure means less market liquidity, making asset prices more vulnerable to valuation pressure.',
        indicators: [
          {
            name: 'WALCL (Fed Total Assets)',
            description: 'The base liquidity provided to the market by the Federal Reserve.',
            whyItMatters: 'An increase indicates central bank balance sheet expansion (liquidity injection); a decrease represents quantitative tightening (liquidity withdrawal).',
            relatedMetricIds: ['walcl', 'fed_balance_sheet']
          },
          {
            name: 'TGA (Treasury General Account)',
            description: 'The US Treasury\'s operational cash account held at the Federal Reserve.',
            whyItMatters: 'When the government issues debt to build up TGA, it drains cash from the market; when the government spends, drawing down the TGA, funds flow back into the market.',
            relatedMetricIds: ['tga']
          },
          {
            name: 'RRP (Overnight Reverse Repo)',
            description: 'Idle funds temporarily deposited by financial institutions at the Federal Reserve.',
            whyItMatters: 'A decline in RRP represents funds returning to the active market; however, if RRP approaches zero, the market loses a crucial liquidity buffer.',
            relatedMetricIds: ['rrp']
          }
        ]
      },
      {
        title: 'Other Liquidity Indicators',
        description: 'In addition to base net liquidity, bank reserves and credit spreads are critical metrics for gauging the health of systemic liquidity.',
        indicators: [
          {
            name: 'Bank Reserves',
            description: 'Cash reserves held by the banking system.',
            whyItMatters: 'If reserves drop below approximately $3 trillion, the market may start concerning over liquidity tightness and overnight rate volatility.',
            relatedMetricIds: ['bank_reserves', 'reserves']
          },
          {
            name: 'NFCI (Chicago Fed National Financial Conditions Index)',
            description: 'A comprehensive indicator measuring financial conditions across credit spreads, leverage, and risk sub-indexes.',
            whyItMatters: 'A value of 0 represents the historical average; negative values indicate looser financial conditions, while positive values indicate tighter conditions.',
            relatedMetricIds: ['nfci']
          }
        ]
      }
    ]
  }
}

export const MACRO_EDUCATION_CONFIG = {
  'zh-CN': MACRO_EDUCATION_CONFIG_ZH,
  'en-US': MACRO_EDUCATION_CONFIG_EN
}
