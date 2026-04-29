export const MACRO_EDUCATION_CONFIG = {
  sentiment: {
    sectionDescription: '市场情绪衡量投资者当前的风险偏好。情绪过度恐慌時，资产可能被非理性抛售；情绪过度贪婪時，市场容错率下降。情绪指标不应单独作为决策依据，应与流动性、估值和基本面一起判断。',
    sections: [
      {
        title: 'CNN Fear & Greed Index',
        description: '綜合 7 個市场信号，生成 0–100 的情绪评分。0 表示极度恐慌，100 表示极度贪婪。巴菲特名言「別人恐懼時我贪婪，別人贪婪時我恐懼」就是对这类反向情绪指标的典型詮釋。',
        indicators: [
          {
            name: 'Fear & Greed Index',
            description: '0–100 情绪分數，衡量市场恐慌与贪婪程度。',
            whyItMatters: '极端恐慌可能帶来非理性抛售，极端贪婪则代表市场容错率下降。',
            relatedMetricIds: ['fear_greed', 'fgi'],
            thresholds: [
              { range: '0–25', label: '极度恐慌', meaning: '市场极度恐慌，可能出现非理性抛售。歷史上往往是较好的长期观察区，但需要结合基本面判断是否存在系統性风险。' },
              { range: '25–45', label: '恐慌', meaning: '市场偏悲观，投资者风险偏好下降。適合关注是否有优质资产被错杀。' },
              { range: '45–55', label: '中性', meaning: '市场情绪中性，无明显方向性偏向。' },
              { range: '55–75', label: '贪婪', meaning: '市场偏乐观，风险偏好上升。需要警惕追高风险与短期波动。' },
              { range: '75–100', label: '极度贪婪', meaning: '市场可能过度乐观，杠杆与估值容错率下降。应檢查既定计划是否过度激进。' }
            ]
          }
        ]
      },
      {
        title: 'VIX',
        description: '衡量标普 500 期权市场对未来 30 天波动率的预期，常被称为「恐慌指數」。VIX 越高，代表市场对未来波动的担忧越強；VIX 越低，代表市场相对平稳，但过低也可能意味着市场过度自满。',
        indicators: [
          {
            name: 'VIX Volatility Index',
            description: '标普 500 隐含波动率预期。',
            whyItMatters: '反映资金避險情绪的温度计，与大盘走势通常呈现负相关。',
            relatedMetricIds: ['vix'],
            thresholds: [
              { range: '低于 20', label: '平稳', meaning: '市场相对平稳，投资人情绪偏乐观。' },
              { range: '20–30', label: '担忧', meaning: '市场開始出现不确定性或担忧情绪，短期波动风险上升。' },
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
        description: '通胀衡量的是物价上涨速度。美联储的目标是将通胀控制在 2% 附近。当通胀高于目标，美联储傾向于维持高利率或加息压制物价；当通胀回到 2% 附近，美联储才有更大空间降息。加息通常压制股价，降息通常改善估值环境，因此通胀走向会直接影响市场对美联储下一步政策的预期。',
        indicators: [
          {
            name: 'CPI (消費者物价指數)',
            description: '覆蓋面最廣的消費者物价指數，包含食品、能源、住房等。',
            whyItMatters: '月环比超过 0.3% 往往意味着年化通胀仍明显高于 2% 目标，市场可能重新定价利率路徑。',
            relatedMetricIds: ['cpi_yoy', 'cpi_mom']
          },
          {
            name: 'Core PCE (核心個人消費支出)',
            description: '剔除食品和能源，是美联储制定利率政策時最关注的通胀指标之一。',
            whyItMatters: '若核心 PCE 持續高于 2.5%，市场通常会降低对快速降息的预期。',
            relatedMetricIds: ['core_pce']
          },
          {
            name: 'PPI (生产者物价指數)',
            description: '衡量生产端出廠价格变动，是通胀的上游信号。',
            whyItMatters: 'PPI 上升意味着企业成本增加，最終可能传导到 CPI。若 PPI 持續高于 CPI，可能暗示企业利润率承压。',
            relatedMetricIds: ['ppi']
          }
        ]
      },
      {
        title: '利率如何影响股市',
        description: '利率决定借錢成本，也决定股票估值折现率。利率越高，企业借錢擴张越貴，消費者贷款成本越高，经济增长可能放缓。同時，当无风险利率提高，投资者从國债等资产获得的回报提高，股票吸引力会下降。反过来，利率下降時，风险资产的估值压力通常会缓解。',
        indicators: [
          {
            name: 'Yield Curve (收益率曲线)',
            description: '展示从短期到长期的國债收益率。',
            whyItMatters: '正常情況下长期利率高于短期利率。若短期利率反超长期利率，形成曲线倒挂，歷史上常被視为衰退风险上升的信号。',
            relatedMetricIds: ['yield_curve', 'spread_10y_2y']
          },
          {
            name: 'Federal Funds Rate (联邦基金利率)',
            description: '美联储直接設定的短期政策利率，也是許多贷款利率的基准。',
            whyItMatters: '加息通常提高市场融资成本，降息则降低资金成本。',
            relatedMetricIds: ['fed_funds_rate']
          },
          {
            name: 'US 10Y Yield (10年期美债收益率)',
            description: '10 年期美國國债收益率是长期利率的代表。',
            whyItMatters: '直接影响房貸利率、企业融资成本与股票估值。10Y 收益率上升時，成长股与科技股通常受到更大压力。',
            relatedMetricIds: ['us10y']
          },
          {
            name: '10Y Real Yield / TIPS (10年期实际利率)',
            description: '扣除通胀后的真实利率水平。',
            whyItMatters: '实际利率越高，代表貨币政策对资产价格的压制越強。超过 2% 通常被視为较具限制性的水平。',
            relatedMetricIds: ['real_yield_10y', 'tips_10y']
          }
        ]
      },
      {
        title: '大宗商品如何影响股市',
        description: '大宗商品价格反映全球供需、通胀压力与风险偏好。黃金常被視为避險与抗通胀资产；原油直接影响企业成本与消費者支出；美元指數则影响全球流动性、海外收入与以美元计价的大宗商品。',
        indicators: [
          {
            name: 'Gold (黃金)',
            description: '传統避險资产和抗通胀工具。',
            whyItMatters: '金价持續上涨可能反映市场对通胀、央行政策或地緣政治风险的担忧上升。',
            relatedMetricIds: ['gold']
          },
          {
            name: 'Silver (白銀)',
            description: '兼具貴金属避險属性和工业金属属性。',
            whyItMatters: '金銀比偏高時，市场可能认为白銀相对黃金被低估；金銀比偏低時，通常反映风险偏好较強。',
            relatedMetricIds: ['silver', 'gold_silver_ratio']
          },
          {
            name: 'Brent Crude Oil (布倫特原油)',
            description: '全球基准油价。',
            whyItMatters: '油价飆升会推高運輸与生产成本，可能加劇通胀。油价大幅下跌则可能暗示全球需求走弱。',
            relatedMetricIds: ['brent', 'oil']
          },
          {
            name: 'Copper (銅)',
            description: '廣泛用于製造业与基建，被称为「銅博士」。',
            whyItMatters: '銅价上涨通常反映需求擴张，下跌则可能暗示经济活动走弱，是经济健康的領先信号。',
            relatedMetricIds: ['copper']
          },
          {
            name: 'DXY (美元指數)',
            description: '衡量美元相对一籃子主要貨币的強弱。',
            whyItMatters: '美元走強通常有利于进口，但会压制出口企业盈利，並降低以美元计价的大宗商品价格，可能收紧離岸流动性。',
            relatedMetricIds: ['dxy']
          }
        ]
      }
    ]
  },
  economy: {
    sectionDescription: '经济数据反映企业收入、消費能力、就业健康与信用环境。股市通常会提前 6–9 個月反映经济变化，因此投资者不只要看数据本身，也要看变化方向与是否出现衰退前兆。',
    sections: [
      {
        title: '经济增长如何影响股市',
        description: '企业利润来自经济活动。经济增长時，企业营收与盈利通常改善；经济衰退時，企业利润下滑，股价容易承压。但股市往往提前反映经济变化，所以当增长指标刚開始走弱時，市场可能已经提前反应。',
        indicators: [
          {
            name: 'GDP Growth (國內生产总值增长)',
            description: '衡量经济总量的增长速度。',
            whyItMatters: '高于 2% 通常代表健康增长；連續兩個季度为负则常被称为技術性衰退。',
            relatedMetricIds: ['gdp_growth']
          },
          {
            name: 'Recession Probability / CFNAI (衰退概率与经济活动指數)',
            description: '经济风险预警綜合指标。',
            whyItMatters: '衰退概率明显上升，或 CFNAI 低于 -0.7 時，常伴隨衰退风险升高，市场对防禦性资产关注度上升。',
            relatedMetricIds: ['recession_probability', 'cfnai']
          },
          {
            name: 'Retail Sales / Industrial Production (零售銷售与工业产出)',
            description: '衡量消費終端与工业生产的活躍度。',
            whyItMatters: '零售銷售下降可能意味消費者縮減開支；工业产出下降通常影响製造业与週期性股票。',
            relatedMetricIds: ['retail_sales', 'industrial_production']
          }
        ]
      },
      {
        title: '就业如何影响股市',
        description: '就业良好代表居民收入稳定、消費有支撐、企业盈利环境较好。但失业率快速上升往往是衰退信号。就业也是美联储判断是否降息的重要依据，因此重点不是单一數字，而是就业数据的变化方向。',
        indicators: [
          {
            name: 'Unemployment Rate / Sahm Rule (失业率与薩姆規则)',
            description: '衡量勞动力市场疲軟程度与衰退风险。',
            whyItMatters: '当失业率从低点上升 0.5 個百分点並触发 Sahm Rule，歷史上常伴隨经济衰退与市场压力。',
            relatedMetricIds: ['unemployment_rate', 'sahm_rule']
          },
          {
            name: 'Nonfarm Payrolls (非農就业)',
            description: '市场最关注的月度新增就业人數。',
            whyItMatters: '增长強勁通常代表勞动市场韧性；若轉为负增长，通常需要警惕经济下行压力。',
            relatedMetricIds: ['nonfarm_payrolls']
          },
          {
            name: 'Initial / Continuing Jobless Claims (初請与續請失业金)',
            description: '每週发布的及時就业观察指标。',
            whyItMatters: '初請失业金明显上升通常領先失业率上行，是勞动市场轉弱的早期信号。',
            relatedMetricIds: ['initial_claims', 'continuing_claims']
          }
        ]
      },
      {
        title: '信用市场如何影响股市',
        description: '企业依賴信用市场来融资与擴张。当借錢成本上升、信用利差擴大或违约率增加時，代表金融环境惡化，企业经营压力增加。歷史上信用利差快速擴大常常領先于股市压力，因为债券市场通常更早反映风险。',
        indicators: [
          {
            name: 'High Yield Spread (高收益债利差)',
            description: '衡量高风险企业债相对國债的額外收益率。',
            whyItMatters: '低于 350 bps 代表市场乐观；超过 500 bps 代表风险定价上升；超过 800 bps 接近危机級別。',
            relatedMetricIds: ['hy_spread', 'high_yield_spread']
          },
          {
            name: '10Y-2Y Spread (长短端利差)',
            description: '衡量长短端收益率差。',
            whyItMatters: '若利差轉负，代表收益率曲线倒挂，歷史上常領先经济衰退。',
            relatedMetricIds: ['spread_10y_2y']
          },
          {
            name: 'Loan Delinquency / Default Rate (贷款违约率)',
            description: '衡量企业或家庭的还款压力。',
            whyItMatters: '违约率上升可能导致銀行收紧放貸，信用环境进一步惡化，形成负向循环。',
            relatedMetricIds: ['loan_delinquency', 'default_rate']
          }
        ]
      }
    ]
  },
  liquidity: {
    sectionDescription: '流动性衡量市场上实际可用的资金环境。可以把美联储想像成一個大水龍頭：美联储总资产 WALCL 是向市场「放水」，而财政部账户 TGA 和隔夜逆回購 RRP 则会暫時「抽水」。淨流动性越高，风险资产通常越容易获得估值支撐；淨流动性收縮時，资产价格更容易承压。',
    sections: [
      {
        title: '淨流动性公式 (Net Liquidity)',
        description: '淨流动性 = 美联储总资产 (WALCL) - 财政部账户 (TGA) - 隔夜逆回購 (RRP)。这個數字越大，代表市场上可用资金越多，通常有利于股市等风险资产；这個數字縮小，代表市场上资金变少，资产价格更容易承受估值压力。',
        indicators: [
          {
            name: 'WALCL (美联储总资产)',
            description: '美联储向市场提供的基礎流动性。',
            whyItMatters: '上升代表央行扩表放水；下降代表缩表回收流动性。',
            relatedMetricIds: ['walcl', 'fed_balance_sheet']
          },
          {
            name: 'TGA (财政部一般账户)',
            description: '美國财政部存在美联储的账户。',
            whyItMatters: '政府发债補充 TGA 時，会从市场吸走现金（抽水）；政府支出消耗 TGA 時，资金流回市场（放水）。',
            relatedMetricIds: ['tga']
          },
          {
            name: 'RRP (隔夜逆回購)',
            description: '金融机构暫時停放在美联储的閒置资金。',
            whyItMatters: 'RRP 下降代表资金回到市场；但若 RRP 接近零，市场将失去一個重要的流动性缓冲墊。',
            relatedMetricIds: ['rrp']
          }
        ]
      },
      {
        title: '其他流动性指标',
        description: '除基礎淨流动性外，金融體系的准备金水位与信用利差也是衡量流动性健康程度的关键指标。',
        indicators: [
          {
            name: 'Bank Reserves (銀行准备金)',
            description: '銀行系統持有的现金儲备。',
            whyItMatters: '若低于約 3 万亿美元，市场可能開始关注资金紧张与隔夜利率波动风险。',
            relatedMetricIds: ['bank_reserves', 'reserves']
          },
          {
            name: 'NFCI (芝加哥联储國家金融條件指數)',
            description: '綜合衡量信用利差、杠杆与风险指标的金融條件松紧程度。',
            whyItMatters: '0 代表歷史平均，负值代表金融條件偏宽松，正值代表金融條件偏紧。',
            relatedMetricIds: ['nfci']
          }
        ]
      }
    ]
  }
}
