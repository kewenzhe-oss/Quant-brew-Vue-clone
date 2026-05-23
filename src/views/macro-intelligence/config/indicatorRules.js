export function unknownState (msg = '数据缺失，无法评估。') {
  return {
    label: '未知',
    tone: 'neutral',
    meaning: msg,
    labelKey: 'macro.rules.unknown.label',
    meaningKey: 'macro.rules.unknown.meaning'
  }
}

export function evaluateFGI (value) {
  if (value == null) return unknownState()
  if (value <= 25) {
    return {
      label: '极度恐惧',
      tone: 'green',
      meaning: '市场情绪极度悲观。历史表明这通常是风险偏好极低的窗口期。',
      labelKey: 'macro.rules.fgi.extreme_fear.label',
      meaningKey: 'macro.rules.fgi.extreme_fear.meaning'
    }
  }
  if (value <= 45) {
    return {
      label: '恐惧',
      tone: 'yellowGreen',
      meaning: '市场表现谨慎，投资者风险偏好明显回落。',
      labelKey: 'macro.rules.fgi.fear.label',
      meaningKey: 'macro.rules.fgi.fear.meaning'
    }
  }
  if (value <= 55) {
    return {
      label: '中性',
      tone: 'neutral',
      meaning: '市场多空情绪相对均衡，未见极端恐慌或贪婪。',
      labelKey: 'macro.rules.fgi.neutral.label',
      meaningKey: 'macro.rules.fgi.neutral.meaning'
    }
  }
  if (value <= 75) {
    return {
      label: '贪婪',
      tone: 'orange',
      meaning: '市场情绪偏向乐观，风险偏好上升，需防范估值溢价。',
      labelKey: 'macro.rules.fgi.greed.label',
      meaningKey: 'macro.rules.fgi.greed.meaning'
    }
  }
  return {
    label: '极度贪婪',
    tone: 'red',
    meaning: '情绪极度高亢，资产价格或已透支利好，波动风险显著上升。',
    labelKey: 'macro.rules.fgi.extreme_greed.label',
    meaningKey: 'macro.rules.fgi.extreme_greed.meaning'
  }
}

export function evaluateVIX (value) {
  if (value == null) return unknownState()
  if (value < 15) {
    return {
      label: '平稳自满',
      tone: 'green',
      meaning: '隐含波动率处于低位，市场情绪十分平稳，但需留意潜在钝化风险。',
      labelKey: 'macro.rules.vix.stable.label',
      meaningKey: 'macro.rules.vix.stable.meaning'
    }
  }
  if (value <= 25) {
    return {
      label: '中度波动',
      tone: 'orange',
      meaning: '市场呈现温和不确定性，波动率处于历史均值区间。',
      labelKey: 'macro.rules.vix.moderate.label',
      meaningKey: 'macro.rules.vix.moderate.meaning'
    }
  }
  return {
    label: '恐慌飙升',
    tone: 'red',
    meaning: '隐含波动率大幅走高，系统性避险情绪升温，避险倾向强烈。',
    labelKey: 'macro.rules.vix.spike.label',
    meaningKey: 'macro.rules.vix.spike.meaning'
  }
}

export function evaluateUS10Y (value) {
  if (value == null) return unknownState()
  if (value < 3.5) {
    return {
      label: '偏低利率',
      tone: 'green',
      meaning: '长期无风险利率处于偏低水平，利于缓解企业贴现压力与估值扩张。',
      labelKey: 'macro.rules.us10y.low.label',
      meaningKey: 'macro.rules.us10y.low.meaning'
    }
  }
  if (value <= 4.5) {
    return {
      label: '中性利率',
      tone: 'neutral',
      meaning: '美债收益率处于主流波动区间，对大盘整体压力可控。',
      labelKey: 'macro.rules.us10y.neutral.label',
      meaningKey: 'macro.rules.us10y.neutral.meaning'
    }
  }
  return {
    label: '偏高利率',
    tone: 'red',
    meaning: '收益率破 4.5%，贴现率高位运行，对长久期资产及成长股估值构成压制。',
    labelKey: 'macro.rules.us10y.high.label',
    meaningKey: 'macro.rules.us10y.high.meaning'
  }
}

export function evaluateDXY (value) {
  if (value == null) return unknownState()
  if (value < 100) {
    return {
      label: '偏弱美元',
      tone: 'green',
      meaning: '美元走势疲软，有助于减轻非美市场及全球信用流动的被动压力。',
      labelKey: 'macro.rules.dxy.weak.label',
      meaningKey: 'macro.rules.dxy.weak.meaning'
    }
  }
  if (value <= 104) {
    return {
      label: '中性美元',
      tone: 'neutral',
      meaning: '美元指数在常态区间震荡，对全球离岸资金无明确指向影响。',
      labelKey: 'macro.rules.dxy.neutral.label',
      meaningKey: 'macro.rules.dxy.neutral.meaning'
    }
  }
  return {
    label: '强势美元',
    tone: 'red',
    meaning: '美元显著走强，易引发资本虹吸效应，导致离岸流动性边际收缩。',
    labelKey: 'macro.rules.dxy.strong.label',
    meaningKey: 'macro.rules.dxy.strong.meaning'
  }
}

export function evaluateNFCI (value) {
  if (value == null) return unknownState()
  if (value < -0.3) {
    return {
      label: '显著宽松',
      tone: 'green',
      meaning: '信用、杠杆及资金压力处于极低位置，系统金融环境相当优越。',
      labelKey: 'macro.rules.nfci.loose.label',
      meaningKey: 'macro.rules.nfci.loose.meaning'
    }
  }
  if (value < 0) {
    return {
      label: '偏向宽松',
      tone: 'yellowGreen',
      meaning: '金融条件整体偏宽松，信用渠道畅通，未见严重收紧。',
      labelKey: 'macro.rules.nfci.moderately_loose.label',
      meaningKey: 'macro.rules.nfci.moderately_loose.meaning'
    }
  }
  if (value <= 0.2) {
    return {
      label: '中性偏紧',
      tone: 'orange',
      meaning: '融资成本及信用利差有所上升，信贷渠道呈边际趋紧之势。',
      labelKey: 'macro.rules.nfci.neutral_tight.label',
      meaningKey: 'macro.rules.nfci.neutral_tight.meaning'
    }
  }
  return {
    label: '显著收紧',
    tone: 'red',
    meaning: '金融市场融资极具约束性，信用利差急剧扩大，系统性杠杆收缩。',
    labelKey: 'macro.rules.nfci.tight.label',
    meaningKey: 'macro.rules.nfci.tight.meaning'
  }
}

export function evaluateRRP (value) {
  if (value == null) return unknownState()
  if (value < 200) {
    return {
      label: '缺乏缓冲区',
      tone: 'red',
      meaning: '逆回购余额偏低，意味着金融机构蓄水池趋于枯竭，失去流动性缓冲垫。',
      labelKey: 'macro.rules.rrp.low.label',
      meaningKey: 'macro.rules.rrp.low.meaning'
    }
  }
  if (value <= 600) {
    return {
      label: '适度缓冲区',
      tone: 'neutral',
      meaning: '隔夜逆回购维持常态余额，为市场基本流动性波动提供基础支撑。',
      labelKey: 'macro.rules.rrp.moderate.label',
      meaningKey: 'macro.rules.rrp.moderate.meaning'
    }
  }
  return {
    label: '充裕缓冲区',
    tone: 'green',
    meaning: '逆回购余额巨大，代表金融体系闲置资金充足，有极强流动性防御垫。',
    labelKey: 'macro.rules.rrp.ample.label',
    meaningKey: 'macro.rules.rrp.ample.meaning'
  }
}

export function evaluateGDP (value) {
  if (value == null) return unknownState()
  if (value <= 0) {
    return {
      label: '萎缩衰退',
      tone: 'red',
      meaning: '产出负增长，面临技术性或实质性衰退，企业营收环境严峻。',
      labelKey: 'macro.rules.gdp.recession.label',
      meaningKey: 'macro.rules.gdp.recession.meaning'
    }
  }
  if (value < 2.0) {
    return {
      label: '缓慢增长',
      tone: 'orange',
      meaning: '经济增速低于历史合理中枢，面临动能趋缓风险。',
      labelKey: 'macro.rules.gdp.slow.label',
      meaningKey: 'macro.rules.gdp.slow.meaning'
    }
  }
  return {
    label: '扩张良好',
    tone: 'green',
    meaning: '经济产出以常态或超常规速度增长，宏观需求健康坚实。',
    labelKey: 'macro.rules.gdp.expanding.label',
    meaningKey: 'macro.rules.gdp.expanding.meaning'
  }
}

export function evaluateCPI (value) {
  if (value == null) return unknownState()
  if (value < 2.5) {
    return {
      label: '温和受控',
      tone: 'green',
      meaning: '通胀已接近 2% 的长期政策调控目标，为降息或鸽派政策提供更大空间。',
      labelKey: 'macro.rules.cpi.controlled.label',
      meaningKey: 'macro.rules.cpi.controlled.meaning'
    }
  }
  if (value <= 3.5) {
    return {
      label: '温和粘性',
      tone: 'neutral',
      meaning: '通胀降幅受阻，呈现一定粘性，政策转向步伐或因此受到牵制。',
      labelKey: 'macro.rules.cpi.sticky.label',
      meaningKey: 'macro.rules.cpi.sticky.meaning'
    }
  }
  return {
    label: '持续偏高',
    tone: 'red',
    meaning: '物价压力明显，削弱消费者实际购买力，制约美联储降息的灵活性。',
    labelKey: 'macro.rules.cpi.high.label',
    meaningKey: 'macro.rules.cpi.high.meaning'
  }
}

export function evaluatePCE (value) {
  if (value == null) return unknownState()
  if (value < 2.5) {
    return {
      label: '接近目标',
      tone: 'green',
      meaning: 'PCE 年化增速接近 2% 基准线，美联储对通胀平稳的信心增强，操作空间扩大。',
      labelKey: 'macro.rules.pce_yoy.controlled.label',
      meaningKey: 'macro.rules.pce_yoy.controlled.meaning'
    }
  }
  if (value <= 3.5) {
    return {
      label: '温和偏高',
      tone: 'neutral',
      meaning: 'PCE 仍位于目标以上，美联储在评估降息时需确认通胀趋势的持续性，政策转向尚未明朗。',
      labelKey: 'macro.rules.pce_yoy.sticky.label',
      meaningKey: 'macro.rules.pce_yoy.sticky.meaning'
    }
  }
  return {
    label: '高位粘性',
    tone: 'red',
    meaning: 'PCE 远超标准，美联储将被迫长期维持偏紧立场，冲击估值扩张预期。',
    labelKey: 'macro.rules.pce_yoy.high.label',
    meaningKey: 'macro.rules.pce_yoy.high.meaning'
  }
}

export function evaluateCorePCE (value) {
  if (value == null) return unknownState()
  if (value < 2.5) {
    return {
      label: '降温共识',
      tone: 'green',
      meaning: '核心 PCE 已回落至可接受区间，市场对降息时间表不再大幅分歧，利率压力逐步缓解。',
      labelKey: 'macro.rules.core_pce_yoy.controlled.label',
      meaningKey: 'macro.rules.core_pce_yoy.controlled.meaning'
    }
  }
  if (value <= 3.5) {
    return {
      label: '粘性不退',
      tone: 'neutral',
      meaning: '核心通胀下行进度慢于预期，降息条件尚未全面成熟，政策转向将审慎渐进。',
      labelKey: 'macro.rules.core_pce_yoy.sticky.label',
      meaningKey: 'macro.rules.core_pce_yoy.sticky.meaning'
    }
  }
  return {
    label: '持续高压',
    tone: 'red',
    meaning: '核心通胀将美联储锁定在高利率区间，成长股与长久期资产的定价气氛严峻。',
    labelKey: 'macro.rules.core_pce_yoy.high.label',
    meaningKey: 'macro.rules.core_pce_yoy.high.meaning'
  }
}

export function evaluateBreakeven10Y (value) {
  if (value == null) return unknownState()
  if (value < 2.0) {
    return {
      label: '温和预期',
      tone: 'green',
      meaning: '市场对长期通胀的集体预期偏低，暴露于实际利率上升重来的压力有限。',
      labelKey: 'macro.rules.breakeven_10y.controlled.label',
      meaningKey: 'macro.rules.breakeven_10y.controlled.meaning'
    }
  }
  if (value <= 2.5) {
    return {
      label: '中性预期',
      tone: 'neutral',
      meaning: '市场预期通胀中性，接近美联储长期 2% 目标内窗口，利率市场不确定性中性。',
      labelKey: 'macro.rules.breakeven_10y.sticky.label',
      meaningKey: 'macro.rules.breakeven_10y.sticky.meaning'
    }
  }
  return {
    label: '高于预期',
    tone: 'red',
    meaning: '市场对未来 10 年通胀的预期远超 2%，交易员对通胀抬头的忧虑将推高长端利率风险溢价。',
    labelKey: 'macro.rules.breakeven_10y.high.label',
    meaningKey: 'macro.rules.breakeven_10y.high.meaning'
  }
}

export function evaluateIndicator (metricId, value) {
  switch (metricId) {
    case 'fgi':
    case 'fear_greed':
      return evaluateFGI(value)
    case 'vix':
      return evaluateVIX(value)
    case 'us10y':
      return evaluateUS10Y(value)
    case 'dxy':
      return evaluateDXY(value)
    case 'nfci':
      return evaluateNFCI(value)
    case 'rrp':
      return evaluateRRP(value)
    case 'gdp':
      return evaluateGDP(value)
    case 'cpi':
      return evaluateCPI(value)
    case 'pce_yoy':
      return evaluatePCE(value)
    case 'core_pce_yoy':
      return evaluateCorePCE(value)
    case 'breakeven_10y':
      return evaluateBreakeven10Y(value)
    default:
      return unknownState()
  }
}
