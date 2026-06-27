<template>
  <div class="technicals-tab">
    <a-spin :spinning="isLoading" :tip="$t('stockResearch.technicals.calculating')">

      <!-- Disclaimer banner -->
      <div class="tech-disclaimer">
        <span class="disclaimer-title">{{ $t('stockResearch.technicals.disclaimerTitle') }}</span>
        <span class="disclaimer-body">
          {{ $t('stockResearch.technicals.disclaimerBody') }}
        </span>
      </div>

      <div v-if="hasData" class="technicals-container">
        <!-- Dynamic Sentiment Snapshot Strip -->
        <div class="technicals-summary-strip">
          <div class="summary-card" v-if="trendSnapshot">
            <div :class="['card-icon-wrapper', trendSnapshot.colorClass]">
              <a-icon :type="trendSnapshot.icon" />
            </div>
            <div class="card-info">
              <span :class="['card-label', { 'is-zh': $i18n && $i18n.locale === 'zh-CN' }]">
                {{ ($i18n && $i18n.locale === 'zh-CN') ? trendSnapshot.labelZh : trendSnapshot.labelEn }}
              </span>
              <span class="card-value">
                {{ ($i18n && $i18n.locale === 'zh-CN') ? trendSnapshot.valueZh : trendSnapshot.valueEn }}
              </span>
              <span class="card-desc" v-if="trendSnapshot.descEn && trendSnapshot.descZh">
                {{ ($i18n && $i18n.locale === 'zh-CN') ? trendSnapshot.descZh : trendSnapshot.descEn }}
              </span>
            </div>
          </div>

          <div class="summary-card" v-if="momentumSnapshot">
            <div :class="['card-icon-wrapper', momentumSnapshot.colorClass]">
              <a-icon :type="momentumSnapshot.icon" />
            </div>
            <div class="card-info">
              <span :class="['card-label', { 'is-zh': $i18n && $i18n.locale === 'zh-CN' }]">
                {{ ($i18n && $i18n.locale === 'zh-CN') ? momentumSnapshot.labelZh : momentumSnapshot.labelEn }}
              </span>
              <span class="card-value">
                {{ ($i18n && $i18n.locale === 'zh-CN') ? momentumSnapshot.valueZh : momentumSnapshot.valueEn }}
              </span>
              <span class="card-desc" v-if="momentumSnapshot.descEn && momentumSnapshot.descZh">
                {{ ($i18n && $i18n.locale === 'zh-CN') ? momentumSnapshot.descZh : momentumSnapshot.descEn }}
              </span>
            </div>
          </div>

          <div class="summary-card" v-if="flowSnapshot">
            <div :class="['card-icon-wrapper', flowSnapshot.colorClass]">
              <a-icon :type="flowSnapshot.icon" />
            </div>
            <div class="card-info">
              <span :class="['card-label', { 'is-zh': $i18n && $i18n.locale === 'zh-CN' }]">
                {{ ($i18n && $i18n.locale === 'zh-CN') ? flowSnapshot.labelZh : flowSnapshot.labelEn }}
              </span>
              <span class="card-value">
                {{ ($i18n && $i18n.locale === 'zh-CN') ? flowSnapshot.valueZh : flowSnapshot.valueEn }}
              </span>
              <span class="card-desc" v-if="flowSnapshot.descEn && flowSnapshot.descZh">
                {{ ($i18n && $i18n.locale === 'zh-CN') ? flowSnapshot.descZh : flowSnapshot.descEn }}
              </span>
            </div>
          </div>

          <div class="summary-card" v-if="volatilitySnapshot">
            <div :class="['card-icon-wrapper', volatilitySnapshot.colorClass]">
              <a-icon :type="volatilitySnapshot.icon" />
            </div>
            <div class="card-info">
              <span :class="['card-label', { 'is-zh': $i18n && $i18n.locale === 'zh-CN' }]">
                {{ ($i18n && $i18n.locale === 'zh-CN') ? volatilitySnapshot.labelZh : volatilitySnapshot.labelEn }}
              </span>
              <span class="card-value">
                {{ ($i18n && $i18n.locale === 'zh-CN') ? volatilitySnapshot.valueZh : volatilitySnapshot.valueEn }}
              </span>
              <span class="card-desc" v-if="volatilitySnapshot.descEn && volatilitySnapshot.descZh">
                {{ ($i18n && $i18n.locale === 'zh-CN') ? volatilitySnapshot.descZh : volatilitySnapshot.descEn }}
              </span>
            </div>
          </div>
        </div>

        <div class="indicator-sections">
          <!-- Trend Indicators -->
          <div class="section-card">
            <h3 class="section-title cyan-text">{{ $t('stockResearch.technicals.trendRef') }}</h3>
            <a-table
              :columns="columns"
              :data-source="technicals.trend"
              :pagination="false"
              size="small"
              rowKey="name"
            >
              <template slot="name" slot-scope="text">
                <span class="ind-name-cell">
                  {{ text }}
                  <a-icon type="info-circle" class="edu-info-icon" @click="showIndicatorEdu(text)" />
                </span>
              </template>
              <template slot="value" slot-scope="text, record">
                <div class="value-cell-container">
                  <span class="ind-value">{{ formatValue(record.name, text) }}</span>
                  <indicator-range-bar
                    v-if="['RSI', 'Stoch %K', 'Stoch %D', 'Williams %R', 'BB %B'].includes(record.name)"
                    :name="record.name"
                    :value="parseFloat(text)"
                  />
                </div>
              </template>
              <template slot="interpretation" slot-scope="text, record">
                <span :class="['ind-interp', getInterpretationClass(record.name, record.value)]">
                  {{ getInterpretation(record.name, record.value) }}
                </span>
              </template>
            </a-table>
          </div>

          <!-- Momentum Indicators -->
          <div class="section-card">
            <h3 class="section-title amber-text">{{ $t('stockResearch.technicals.momentumRef') }}</h3>
            <a-table
              :columns="columns"
              :data-source="technicals.momentum"
              :pagination="false"
              size="small"
              rowKey="name"
            >
              <template slot="name" slot-scope="text">
                <span class="ind-name-cell">
                  {{ text }}
                  <a-icon type="info-circle" class="edu-info-icon" @click="showIndicatorEdu(text)" />
                </span>
              </template>
              <template slot="value" slot-scope="text, record">
                <div class="value-cell-container">
                  <span class="ind-value">{{ formatValue(record.name, text) }}</span>
                  <indicator-range-bar
                    v-if="['RSI', 'Stoch %K', 'Stoch %D', 'Williams %R', 'BB %B'].includes(record.name)"
                    :name="record.name"
                    :value="parseFloat(text)"
                  />
                </div>
              </template>
              <template slot="interpretation" slot-scope="text, record">
                <span :class="['ind-interp', getInterpretationClass(record.name, record.value)]">
                  {{ getInterpretation(record.name, record.value) }}
                </span>
              </template>
            </a-table>
          </div>

          <!-- Volatility Indicators -->
          <div class="section-card">
            <h3 class="section-title purple-text">{{ $t('stockResearch.technicals.volatilityRef') }}</h3>
            <a-table
              :columns="columns"
              :data-source="technicals.volatility"
              :pagination="false"
              size="small"
              rowKey="name"
            >
              <template slot="name" slot-scope="text">
                <span class="ind-name-cell">
                  {{ text }}
                  <a-icon type="info-circle" class="edu-info-icon" @click="showIndicatorEdu(text)" />
                </span>
              </template>
              <template slot="value" slot-scope="text, record">
                <div class="value-cell-container">
                  <span class="ind-value">{{ formatValue(record.name, text) }}</span>
                  <indicator-range-bar
                    v-if="['RSI', 'Stoch %K', 'Stoch %D', 'Williams %R', 'BB %B'].includes(record.name)"
                    :name="record.name"
                    :value="parseFloat(text)"
                  />
                </div>
              </template>
              <template slot="interpretation" slot-scope="text, record">
                <span :class="['ind-interp', getInterpretationClass(record.name, record.value)]">
                  {{ getInterpretation(record.name, record.value) }}
                </span>
              </template>
            </a-table>
          </div>

          <!-- Volume Indicators -->
          <div class="section-card">
            <h3 class="section-title green-text">{{ $t('stockResearch.technicals.volumeRef') }}</h3>
            <a-table
              :columns="columns"
              :data-source="technicals.volume"
              :pagination="false"
              size="small"
              rowKey="name"
            >
              <template slot="name" slot-scope="text">
                <span class="ind-name-cell">
                  {{ text }}
                  <a-icon type="info-circle" class="edu-info-icon" @click="showIndicatorEdu(text)" />
                </span>
              </template>
              <template slot="value" slot-scope="text, record">
                <div class="value-cell-container">
                  <span class="ind-value">{{ formatValue(record.name, text) }}</span>
                  <indicator-range-bar
                    v-if="['RSI', 'Stoch %K', 'Stoch %D', 'Williams %R', 'BB %B'].includes(record.name)"
                    :name="record.name"
                    :value="parseFloat(text)"
                  />
                </div>
              </template>
              <template slot="interpretation" slot-scope="text, record">
                <span :class="['ind-interp', getInterpretationClass(record.name, record.value)]">
                  {{ getInterpretation(record.name, record.value) }}
                </span>
              </template>
            </a-table>
          </div>
        </div>
      </div>

      <div v-else-if="!isLoading" class="empty-state">
        <a-empty :description="$t('stockResearch.technicals.noData')" />
      </div>
    </a-spin>

    <!-- Contextual Educational Drawer -->
    <a-drawer
      :title="drawerTitle"
      placement="right"
      :closable="true"
      :visible="drawerVisible"
      @close="drawerVisible = false"
      width="440"
      class="indicator-edu-drawer"
    >
      <div class="drawer-edu-content" v-if="selectedEdu">
        <div class="edu-section">
          <div class="edu-section-title">{{ ($i18n && $i18n.locale === 'zh-CN') ? '指标定义' : 'Concept & Definition' }}</div>
          <div class="edu-section-body text-body">{{ selectedEdu.desc }}</div>
        </div>

        <div class="edu-section">
          <div class="edu-section-title">{{ ($i18n && $i18n.locale === 'zh-CN') ? '计算参数' : 'Standard Parameters' }}</div>
          <div class="edu-section-body params-badge">{{ selectedEdu.params }}</div>
        </div>

        <div class="edu-section">
          <div class="edu-section-title">{{ ($i18n && $i18n.locale === 'zh-CN') ? '解读逻辑' : 'Interpretation Rules' }}</div>
          <div class="edu-section-body text-body bold-text">{{ selectedEdu.interpretation }}</div>
        </div>

        <div class="edu-section alert-section">
          <div class="edu-section-title warning-title">
            <a-icon type="warning" /> {{ ($i18n && $i18n.locale === 'zh-CN') ? '心理 / 市场陷阱提示' : 'Psychological & Market Cautions' }}
          </div>
          <div class="edu-section-body warning-body">{{ selectedEdu.caution }}</div>
        </div>

        <div class="edu-section formula-section">
          <div class="edu-section-title">{{ ($i18n && $i18n.locale === 'zh-CN') ? '数学公式' : 'Underlying Equation' }}</div>
          <div class="edu-section-body formula-body"><code>{{ selectedEdu.formula }}</code></div>
        </div>

        <div class="drawer-footer-link">
          <router-link to="/learning">
            <a-button type="dashed" block @click="drawerVisible = false" class="explore-library-btn">
              <a-icon type="book" />
              {{ ($i18n && $i18n.locale === 'zh-CN') ? '前往投资理论图书馆' : 'Explore Theory Library' }}
            </a-button>
          </router-link>
        </div>
      </div>
    </a-drawer>
  </div>
</template>

<script>
import { mapState } from 'vuex'

const INDICATOR_EDU = {
  'en-US': {
    'MACD': {
      name: 'MACD (Moving Average Convergence Divergence)',
      desc: 'Trend-following momentum indicator showing the relationship between two moving averages of a security\'s price (typically 12 EMA and 26 EMA).',
      params: 'Fast: 12 | Slow: 26 | Signal: 9',
      interpretation: 'A crossover above the signal line indicates positive momentum. A crossover below indicates negative momentum.',
      caution: 'MACD can produce false signals in sideways or ranging markets, as it is a trend-following indicator.',
      formula: 'MACD Line = 12 EMA - 26 EMA | Signal Line = 9 EMA of MACD Line'
    },
    'ADX': {
      name: 'ADX (Average Directional Index)',
      desc: 'Measures the strength of a trend regardless of its direction (upward or downward). It oscillates between 0 and 100.',
      params: 'Period: 14',
      interpretation: 'Values above 25 indicate a strong trend. Values below 20 indicate a weak trend or range-bound market.',
      caution: 'ADX only shows trend strength, not trend direction. Use it in conjunction with directional indicators (+DI / -DI) or moving averages.',
      formula: 'Derived from the smoothed moving average of the difference between +DI and -DI.'
    },
    'RSI': {
      name: 'RSI (Relative Strength Index)',
      desc: 'Momentum oscillator that measures the speed and change of price movements. It oscillates between 0 and 100.',
      params: 'Period: 14',
      interpretation: 'Traditionally, values above 70 indicate overbought conditions (potential pullback or overextended rally). Values below 30 indicate oversold conditions (potential bounce or selling exhaustion).',
      caution: 'Indicators can remain overbought or oversold for extended periods during strong trends. Do not rely on oversold levels alone for buying.',
      formula: 'RSI = 100 - (100 / (1 + RS)) where RS = Average Gain / Average Loss'
    },
    'CCI': {
      name: 'CCI (Commodity Channel Index)',
      desc: 'Versatile indicator that measures the current price level relative to an average price level over a given period of time.',
      params: 'Period: 20',
      interpretation: 'Values above +100 suggest an overextended uptrend, while values below -100 suggest an overextended downtrend.',
      caution: 'Highly sensitive to short-term volatility, leading to potential noise in sideways markets.',
      formula: 'CCI = (Typical Price - 20-period SMA of TP) / (0.015 * Mean Deviation)'
    },
    'Stoch %K': {
      name: 'Stochastic Oscillator (%K)',
      desc: 'Momentum indicator comparing a closing price to its price range over a certain period.',
      params: 'K Period: 14 | K Smoothing: 3',
      interpretation: 'Readings above 80 indicate overbought conditions; readings below 20 indicate oversold conditions.',
      caution: 'During strong rallies or sell-offs, Stochastic can stay pinned at extremes for days or weeks.',
      formula: '%K = (Current Close - Lowest Low) / (Highest High - Lowest Low) * 100'
    },
    'Stoch %D': {
      name: 'Stochastic Oscillator (%D)',
      desc: 'The signal line (moving average) of the %K line in the Stochastic Oscillator.',
      params: 'D Smoothing: 3',
      interpretation: 'Crossings between %K and %D lines act as trigger signals for momentum shifts.',
      caution: 'Check overall trend direction before trading crossovers to avoid trading counter to the primary trend.',
      formula: '%D = 3-period simple moving average of %K'
    },
    'Williams %R': {
      name: 'Williams %R',
      desc: 'Momentum indicator that measures overbought and oversold levels, similar to Stochastic but scales from 0 to -100.',
      params: 'Period: 14',
      interpretation: 'Readings between 0 and -20 are overbought. Readings between -80 and -100 are oversold.',
      caution: 'Like RSI, a highly overbought Williams %R can reflect strong trend continuation rather than an immediate reversal.',
      formula: '%R = (Highest High - Close) / (Highest High - Lowest Low) * -100'
    },
    'MFI': {
      name: 'MFI (Money Flow Index)',
      desc: 'Volume-weighted RSI that measures both price and volume to identify overbought or oversold conditions.',
      params: 'Period: 14',
      interpretation: 'Values above 80 are generally considered overbought; values below 20 are considered oversold.',
      caution: 'Volume spikes can skew MFI temporarily, so confirm volume consistency.',
      formula: 'MFI = 100 - (100 / (1 + Money Ratio)) where Money Flow = Typical Price * Volume'
    },
    'ATR': {
      name: 'ATR (Average True Range)',
      desc: 'Measures market volatility by decomposing the entire range of an asset price for that period.',
      params: 'Period: 14',
      interpretation: 'Higher values mean greater price volatility. It is an absolute value indicator (expressed in currency/points).',
      caution: 'ATR only measures volatility strength, not trend direction. It does not predict future prices.',
      formula: 'Smoothed moving average of the True Range (TR = max(H-L, |H-Cp|, |L-Cp|))'
    },
    'BB Upper': {
      name: 'Bollinger Bands (Upper Band)',
      desc: 'Calculated as the middle band (SMA) plus a standard deviation multiplier.',
      params: 'Period: 20 | Deviations: 2',
      interpretation: 'Serves as a relative measure of high price. Reaching the upper band suggests the price is statistically high.',
      caution: 'A price touching the upper band is not a sell signal on its own; in strong uptrends, the price can "walk" the band.',
      formula: 'Upper Band = 20 SMA + (2 * Standard Deviation)'
    },
    'BB Mid': {
      name: 'Bollinger Bands (Middle Band)',
      desc: 'The baseline moving average of Bollinger Bands, representing the medium-term average price.',
      params: 'Period: 20',
      interpretation: 'Acts as a dynamic mean reversion level. Crossing the middle band represents a shift in medium-term trend.',
      caution: 'In a strongly trending market, the mid band acts as dynamic support/resistance rather than an equilibrium point.',
      formula: '20-period Simple Moving Average (SMA)'
    },
    'BB Lower': {
      name: 'Bollinger Bands (Lower Band)',
      desc: 'Calculated as the middle band (SMA) minus a standard deviation multiplier.',
      params: 'Period: 20 | Deviations: 2',
      interpretation: 'Serves as a relative measure of low price. Reaching the lower band suggests the price is statistically low.',
      caution: 'Price touching the lower band is not a buy signal; it can walk the lower band in a severe downtrend.',
      formula: 'Lower Band = 20 SMA - (2 * Standard Deviation)'
    },
    'BB %B': {
      name: 'Bollinger Bands %B',
      desc: 'Quantifies the price\'s relationship to the Bollinger Bands, showing where the price is relative to the bands.',
      params: 'Period: 20 | Deviations: 2',
      interpretation: 'Above 1 means price is above the upper band. Below 0 means price is below the lower band. 0.5 is exactly in the middle.',
      caution: 'Expect sharp movements when %B crosses 0 or 1, representing volatility breakouts.',
      formula: '%B = (Price - Lower Band) / (Upper Band - Lower Band)'
    },
    'BB Width': {
      name: 'Bollinger Bands Width',
      desc: 'Measures the percentage difference between the upper band and the lower band, tracking changes in volatility.',
      params: 'Period: 20 | Deviations: 2',
      interpretation: 'Very low values represent a "squeeze," which often precedes a high-volatility breakout. High values signal extreme volatility.',
      caution: 'The squeeze does not predict breakout direction, only that a sharp breakout is imminent.',
      formula: 'Bandwidth = (Upper Band - Lower Band) / Middle Band'
    },
    'CMF': {
      name: 'CMF (Chaikin Money Flow)',
      desc: 'Measures the amount of Money Flow Volume over a specific period, indicating accumulation (buying pressure) or distribution (selling pressure).',
      params: 'Period: 20',
      interpretation: 'Values above +0.10 represent buying pressure (accumulation). Values below -0.10 represent selling pressure (distribution).',
      caution: 'Requires consistent daily volume data to maintain accuracy. Best coupled with trend indicators.',
      formula: 'Sum of (Money Flow Multiplier * Volume) / Sum of Volume over 20 periods'
    }
  },
  'zh-CN': {
    'MACD': {
      name: 'MACD (指数平滑异同移动平均线)',
      desc: '一种趋势跟踪动量指标，显示证券价格的两个移动平均线（通常为 12 EMA 和 26 EMA）之间的关系。',
      params: '快线: 12 | 慢线: 26 | 信号线: 9',
      interpretation: '突破信号线之上表示正向动量增强；跌破信号线之下表示负向动量增强。',
      caution: '由于 MACD 是趋势跟踪指标，在震荡盘整或无趋势的市场中会产生频繁的虚假金叉/死叉信号。',
      formula: 'MACD线 = 12日EMA - 26日EMA | 信号线 = MACD线的9日EMA'
    },
    'ADX': {
      name: 'ADX (平均趋向指数)',
      desc: '衡量趋势强度的指标，不论其方向是向上还是向下。其值介于 0 到 100 之间。',
      params: '周期: 14',
      interpretation: '值大于 25 表示存在强烈的趋势；值小于 20 表示趋势微弱或市场处于震荡箱体中。',
      caution: 'ADX 仅代表趋势的强弱程度，而不指示趋势的方向。必须配合 +DI / -DI 或均线使用。',
      formula: '通过计算 +DI 与 -DI 之差的移动平均值所得。'
    },
    'RSI': {
      name: 'RSI (相对强弱指标)',
      desc: '一种动量振荡指标，用于衡量价格波动的速度和变化幅度。介于 0 到 100 之间。',
      params: '周期: 14',
      interpretation: '传统上，数值高于 70 表示超买（价格可能见顶回落）；数值低于 30 表示超卖（可能出现超跌反弹或卖盘衰竭）。',
      caution: '在强劲的单边行情中，RSI 可能在超买或超卖区域长时间钝化。绝对不能仅因超卖而盲目买入。',
      formula: 'RSI = 100 - (100 / (1 + RS))，其中 RS = 平均上涨点数 / 平均下跌点数'
    },
    'CCI': {
      name: 'CCI (顺势指标)',
      desc: '一种波动振荡指标，用于衡量当前价格水平相对于特定时间内平均价格水平的偏离程度。',
      params: '周期: 20',
      interpretation: '值大于 +100 表示股价进入异常强势拉升期；值小于 -100 表示股价进入异常弱势下行期。',
      caution: 'CCI 对短线剧烈波动非常敏感，在震荡市中容易产生多余的噪音信号。',
      formula: 'CCI = (典型价格 - 典型价格的20日SMA) / (0.015 * 平均绝对偏差)'
    },
    'Stoch %K': {
      name: '随机指标 (%K)',
      desc: '动量指标，将特定周期内的证券收盘价与其价格区间进行比较。',
      params: 'K周期: 14 | K平滑: 3',
      interpretation: '数值高于 80 表示市场处于超买区间；数值低于 20 表示市场处于超卖区间。',
      caution: '在极其强劲的单边上涨或下跌中，随机指标容易在极限位置产生钝化，过早发出逆势信号。',
      formula: '%K = (当前收盘价 - 周期内最低价) / (周期内最高价 - 周期内最低价) * 100'
    },
    'Stoch %D': {
      name: '随机指标 (%D)',
      desc: '随机指标中的信号线，即慢线，是快速 %K 线的移动平均线。',
      params: 'D平滑: 3',
      interpretation: '%K 线与 %D 线的黄金交叉与死亡交叉是判断动量转折的常用信号。',
      caution: '交叉信号必须顺应大趋势方向。逆势使用交叉买卖点极易被反复打脸。',
      formula: '%D = %K线的3日简单移动平均线'
    },
    'Williams %R': {
      name: '威廉指标 (%R)',
      desc: '动量指标，测量超买和超卖水平，逻辑类似于随机指标，但数值范围在 0 至 -100 之间。',
      params: '周期: 14',
      interpretation: '介于 0 到 -20 之间属于超买区；介于 -80 到 -100 之间属于超卖区。',
      caution: '威廉指标反应极其敏锐，超买常常伴随着大牛市的起点，不代表价格会立刻下跌。',
      formula: '%R = (周期内最高价 - 当期收盘价) / (周期内最高价 - 周期内最低价) * -100'
    },
    'MFI': {
      name: 'MFI (资金流量指标)',
      desc: '结合了价格和成交量数据的“量能版 RSI”，用以评估市场资金流入与流出的活跃度。',
      params: '周期: 14',
      interpretation: '数值超过 80 属于超买，显示资金流入过剩；数值低于 20 属于超卖，显示资金流出过度。',
      caution: '短期内极其暴力的脉冲量能会严重扭曲 MFI 数值，需要核对成交量的持续性。',
      formula: 'MFI = 100 - (100 / (1 + 资金比率))，其中资金流量 = 典型价格 * 成交量'
    },
    'ATR': {
      name: 'ATR (平均真实波幅)',
      desc: '通过对资产历史波幅的完全分解，客观描述市场的绝对波动率，以点数或本币展示。',
      params: '周期: 14',
      interpretation: '数值越大表明近期价格上下振幅越剧烈。常用于辅助设定合理的跟踪止损范围。',
      caution: 'ATR 仅度量波动的强弱，不代表任何上涨或下跌的趋势方向。它完全不预测价格。',
      formula: '真实波幅(TR)的14日平滑移动平均。TR = max(高-低, |高-昨收|, |低-昨收|)'
    },
    'BB Upper': {
      name: '布林带 (上轨)',
      desc: '在布林带中轨（20日移动平均线）的基础之上，加上两倍标准差计算出的上边界。',
      params: '周期: 20 | 倍数: 2',
      interpretation: '代表价格相对高位的统计学警戒线。当价格触及上轨时表明多头拉升极其显著。',
      caution: '触碰上轨绝不等于做空信号。在极强的单边牛市中，价格会沿着上轨反复“贴轨”攀升。',
      formula: '上轨 = 20 SMA + (2 * 标准差)'
    },
    'BB Mid': {
      name: '布林带 (中轨)',
      desc: '布林带体系的主轴基准均线，常用来确定中期持仓的平均成本或强弱分水岭。',
      params: '周期: 20',
      interpretation: '代表中期趋势的发展方向，也是动态的多空强弱交界线和均值回归靶点。',
      caution: '单边趋势十分强悍时，中轨往往提供的是强大的动量支撑/阻力，而非简单的平衡点。',
      formula: '20日的简单移动平均线 (SMA)'
    },
    'BB Lower': {
      name: '布林带 (下轨)',
      desc: '在布林带中轨的基础之上，减去两倍标准差计算出的下边界。',
      params: '周期: 20 | 倍数: 2',
      interpretation: '代表价格相对低位的统计学警戒线。触及下轨说明空头杀跌极其剧烈。',
      caution: '触碰下轨绝不代表可以立刻抄底。单边暴跌中价格常会沿着下轨“贴轨”持续阴跌。',
      formula: '下轨 = 20 SMA - (2 * 标准差)'
    },
    'BB %B': {
      name: '布林带 %B 指标',
      desc: '量化当前最新收盘价在整个布林通道内部所处具体相对位置的百分比指标。',
      params: '周期: 20 | 倍数: 2',
      interpretation: '大于 1 表明价格在上轨之外；小于 0 表明价格在下轨之外；0.5 恰好处于中轨。',
      caution: '%B 在 0 或 1 处的穿越通常代表了波动率急剧爆发，切忌简单做逆势对冲。',
      formula: '%B = (当前价 - 下轨) / (上轨 - 下轨)'
    },
    'BB Width': {
      name: '布林带宽指标 (Bandwidth)',
      desc: '测量布林带上下轨距中轨的百分比宽度，用以客观捕捉通道的扩张与收窄。',
      params: '周期: 20 | 倍数: 2',
      interpretation: '数值收缩至极低水平（挤压状态）通常预示着即将爆发极其强烈的单边大级别突破。',
      caution: '通道收紧（Squeeze）只能警示突破即将来临，但完全无法预测突破是向上还是向下。',
      formula: '带宽 = (上轨 - 下轨) / 中轨'
    },
    'CMF': {
      name: 'CMF (蔡金资金流量)',
      desc: '衡量特定时期内资金流入/流出绝对成交量加权大小的量化指标，识别吸筹与派发。',
      params: '周期: 20',
      interpretation: '值持续高于 +0.10 代表市场主力正在积极吸筹买入；值持续低于 -0.10 代表派发抛售。',
      caution: '在成交量零散或有断层的数据源下精确度会骤降。建议与均线或动量系统搭配使用。',
      formula: 'CMF = 20周期内(资金流量乘数 * 成交量)之和 / 20周期内成交量之和'
    }
  }
}

const IndicatorRangeBar = {
  name: 'IndicatorRangeBar',
  props: {
    name: { type: String, required: true },
    value: { type: Number, required: true }
  },
  computed: {
    config () {
      let min = 0
      let max = 100
      let t1 = 30
      let t2 = 70
      const val = this.value

      if (this.name === 'RSI') {
        min = 0; max = 100; t1 = 30; t2 = 70
      } else if (this.name.includes('Stoch')) {
        min = 0; max = 100; t1 = 20; t2 = 80
      } else if (this.name === 'Williams %R') {
        min = -100; max = 0; t1 = -80; t2 = -20
      } else if (this.name === 'BB %B') {
        min = 0; max = 1; t1 = 0.2; t2 = 0.8
      } else {
        return null
      }

      let pct = ((val - min) / (max - min)) * 100
      pct = Math.max(0, Math.min(100, pct))

      const t1Pct = ((t1 - min) / (max - min)) * 100
      const t2Pct = ((t2 - min) / (max - min)) * 100

      let state = 'neutral'
      if (this.name === 'Williams %R') {
        if (val < t1) state = 'oversold'
        else if (val > t2) state = 'overbought'
      } else if (this.name === 'BB %B') {
        if (val < 0) state = 'oversold'
        else if (val > 1) state = 'overbought'
      } else {
        if (val < t1) state = 'oversold'
        else if (val > t2) state = 'overbought'
      }

      return { pct, t1Pct, t2Pct, state }
    }
  },
  template: `
    <div class="indicator-range-bar-wrapper" v-if="config">
      <div class="range-track">
        <div class="neutral-zone" :style="{ left: config.t1Pct + '%', right: (100 - config.t2Pct) + '%' }"></div>
        <div class="threshold-tick" :style="{ left: config.t1Pct + '%' }"></div>
        <div class="threshold-tick" :style="{ left: config.t2Pct + '%' }"></div>
        <div :class="['value-marker', config.state]" :style="{ left: config.pct + '%' }"></div>
      </div>
    </div>
  `
}

export default {
  name: 'TechnicalsTab',
  components: {
    IndicatorRangeBar
  },
  data () {
    return {
      drawerVisible: false,
      selectedIndicatorName: ''
    }
  },
  computed: {
    ...mapState('equity', ['technicals', 'technicalsLoading']),
    isLoading () {
      return this.technicalsLoading
    },
    hasData () {
      return this.technicals && Object.keys(this.technicals).length > 0 && !this.technicals.error
    },
    selectedEdu () {
      if (!this.selectedIndicatorName) return null
      const locale = this.$i18n.locale || 'zh-CN'
      const dict = INDICATOR_EDU[locale] || INDICATOR_EDU['zh-CN']
      return dict[this.selectedIndicatorName] || null
    },
    drawerTitle () {
      return this.selectedEdu ? this.selectedEdu.name : ''
    },
    columns () {
      return [
        { title: this.$t('stockResearch.technicals.indicatorColumn'), dataIndex: 'name', scopedSlots: { customRender: 'name' }, width: '30%' },
        { title: this.$t('stockResearch.technicals.valueColumn'), dataIndex: 'value', scopedSlots: { customRender: 'value' }, width: '20%' },
        { title: this.$t('stockResearch.technicals.stateColumn'), key: 'interpretation', scopedSlots: { customRender: 'interpretation' } }
      ]
    },
    trendSnapshot () {
      const adx = this.getIndicatorValue('trend', 'ADX')
      const macd = this.getIndicatorValue('trend', 'MACD')
      if (adx === null) return null

      let statusEn = ''
      let statusZh = ''
      let descEn = ''
      let descZh = ''
      const icon = 'line-chart'
      let colorClass = 'cyan'

      if (adx > 25) {
        if (macd > 0) {
          statusEn = 'Strong Trend (Supportive)'
          statusZh = '趋势强劲 (动能支撑)'
          descEn = 'Strong trend strength supported by positive momentum indicators.'
          descZh = '趋势强劲，且多头动能指标提供支撑。'
        } else {
          statusEn = 'Strong Trend (Under Pressure)'
          statusZh = '趋势强劲 (下行压力)'
          descEn = 'Strong downward trend with negative momentum pressure dominant.'
          descZh = '强下行趋势，空头动能占据主导。'
        }
      } else if (adx < 20) {
        statusEn = 'Ranging / Consolidating'
        statusZh = '区间盘整 (无单边趋势)'
        descEn = 'Consolidation pattern with no distinct trend direction.'
        descZh = '震荡整理格局，无明显单边趋势方向。'
        colorClass = 'neutral'
      } else {
        statusEn = 'Developing / Transition'
        statusZh = '趋势酝酿中 (动能均衡)'
        descEn = 'Trend is in early transition with balanced momentum.'
        descZh = '趋势处于酝酿过渡期，多空动能均衡。'
      }

      return { labelEn: 'Trend State', labelZh: '趋势状态', valueEn: statusEn, valueZh: statusZh, descEn, descZh, icon, colorClass }
    },
    momentumSnapshot () {
      const rsi = this.getIndicatorValue('momentum', 'RSI')
      if (rsi === null) return null

      let statusEn = ''
      let statusZh = ''
      let descEn = ''
      let descZh = ''
      const icon = 'dashboard'
      let colorClass = 'amber'

      if (rsi > 70) {
        statusEn = 'Overextended (Overbought)'
        statusZh = '买方动能充沛 (接近超买区)'
        descEn = 'RSI indicates overextended buying pressure, watch for consolidation.'
        descZh = 'RSI显示买方力量处于超买，需防范震荡整固。'
        colorClass = 'purple'
      } else if (rsi < 30) {
        statusEn = 'Exhausted (Oversold)'
        statusZh = '卖方卖盘极化 (接近超卖区)'
        descEn = 'RSI indicates selling exhaustion, watch for potential rebound.'
        descZh = 'RSI处于超卖区间，卖盘极化，防范技术性反弹。'
        colorClass = 'teal'
      } else {
        statusEn = 'Balanced / Stable'
        statusZh = '动能均衡稳定 (无极端极化)'
        descEn = 'RSI is stable in neutral territory without extreme readings.'
        descZh = 'RSI稳定在常态区间，无极端极化读数。'
        colorClass = 'neutral'
      }

      return { labelEn: 'Momentum Temp', labelZh: '动能温度', valueEn: statusEn, valueZh: statusZh, descEn, descZh, icon, colorClass }
    },
    flowSnapshot () {
      const cmf = this.getIndicatorValue('volume', 'CMF')

      let statusEn = ''
      let statusZh = ''
      let descEn = ''
      let descZh = ''
      const icon = 'transaction'
      let colorClass = 'green'

      if (cmf !== null) {
        if (cmf > 0.1) {
          statusEn = 'Supportive Capital Inflow'
          statusZh = '资金吸筹流入 (有主力支撑)'
          descEn = 'CMF reveals consistent capital accumulation and buying support.'
          descZh = 'CMF显示持续资金吸筹注入，主力买盘支撑强劲。'
        } else if (cmf < -0.1) {
          statusEn = 'Outflow Pressure / Distribution'
          statusZh = '资金离场派发 (存在抛售压力)'
          descEn = 'CMF reveals capital distribution and active selling pressure.'
          descZh = 'CMF显示资金持续流出，主力面临一定的派发抛压。'
          colorClass = 'purple'
        } else {
          statusEn = 'Mixed / Neutral Capital Flow'
          statusZh = '多空资金均衡 (流向平淡)'
          descEn = 'CMF sits near zero, representing neutral flow and mixed capital interest.'
          descZh = 'CMF在零轴附近震荡，资金流向均衡。'
          colorClass = 'neutral'
        }
      } else {
        statusEn = 'Stable / Ranging'
        statusZh = '多空资金均衡 (流向平淡)'
        descEn = 'CMF sits near zero, representing neutral flow and mixed capital interest.'
        descZh = 'CMF在零轴附近震荡，资金流向均衡。'
        colorClass = 'neutral'
      }

      return { labelEn: 'Flow & Accumulation', labelZh: '资金流动', valueEn: statusEn, valueZh: statusZh, descEn, descZh, icon, colorClass }
    },
    volatilitySnapshot () {
      const width = this.getIndicatorValue('volatility', 'BB Width')
      const percentB = this.getIndicatorValue('volatility', 'BB %B')

      let statusEn = ''
      let statusZh = ''
      let descEn = ''
      let descZh = ''
      const icon = 'radar-chart'
      let colorClass = 'purple'

      if (width !== null && percentB !== null) {
        if (width < 10) {
          statusEn = 'Range Compressed (Squeeze)'
          statusZh = '区间收敛 (极窄幅挤压状态)'
          descEn = 'Bollinger range is highly compressed, indicating an active squeeze.'
          descZh = '布林区间极度收敛，价格处于窄幅挤压蓄势状态。'
          colorClass = 'cyan'
        } else if (width > 22) {
          statusEn = 'Range Expanding (High Volatility)'
          statusZh = '波幅剧烈扩张 (宽幅高波动)'
          descEn = 'Bollinger range is expanding, indicating active volatility expansion.'
          descZh = '布林区间剧烈扩张，市场波动率大幅上行。'
          colorClass = 'amber'
        } else {
          // Stable / Balanced Width, check position relative to bands
          if (percentB > 0.85) {
            statusEn = 'Price Near Upper Band'
            statusZh = '价格接近上轨 (偏强区运行)'
            descEn = 'Band width is moderate, with price tracking near the upper channel.'
            descZh = '布林带宽度适中，价格接近上轨运行。'
            colorClass = 'teal'
          } else if (percentB < 0.15) {
            statusEn = 'Price Near Lower Band'
            statusZh = '价格接近下轨 (偏弱区运行)'
            descEn = 'Band width is moderate, with price tracking near the lower channel.'
            descZh = '布林带宽度适中，价格接近下轨运行。'
            colorClass = 'purple'
          } else {
            statusEn = 'Volatility Contained'
            statusZh = '波动平稳可控 (通道内运行)'
            descEn = 'Bollinger range is stable, and price remains contained inside the bands.'
            descZh = '布林带宽度适中，价格在通道内部平稳运行。'
            colorClass = 'neutral'
          }
        }
      } else {
        statusEn = 'Volatility Stable'
        statusZh = '波动平稳可控 (区间内运行)'
        descEn = 'Bollinger range is stable, and price remains contained inside the bands.'
        descZh = '布林带宽度适中，价格在通道内部平稳运行。'
        colorClass = 'neutral'
      }

      return { labelEn: 'Volatility State', labelZh: '波动状态', valueEn: statusEn, valueZh: statusZh, descEn, descZh, icon, colorClass }
    }
  },
  methods: {
    getIndicatorValue (category, name) {
      if (!this.technicals || !this.technicals[category]) return null
      const item = this.technicals[category].find(x => x.name === name)
      return item ? item.value : null
    },
    showIndicatorEdu (name) {
      this.selectedIndicatorName = name
      this.drawerVisible = true
    },
    formatNumber (val) {
      if (val === null || val === undefined || isNaN(val)) return '—'
      return parseFloat(val).toFixed(4)
    },
    formatValue (name, value) {
      if (value === null || value === undefined || isNaN(value)) return '—'
      const val = parseFloat(value)

      const oneDecimal = ['RSI', 'Stoch %K', 'Stoch %D', 'ADX', 'CCI', 'Williams %R', 'MFI']
      const twoDecimals = ['BB Upper', 'BB Mid', 'BB Lower', 'ATR', 'CMF', 'BB %B', 'BB Width', 'MACD']

      if (oneDecimal.includes(name)) {
        return val.toFixed(1)
      } else if (twoDecimals.includes(name)) {
        return val.toFixed(2)
      }

      return val.toFixed(2)
    },
    getInterpretationKey (name, value) {
      switch (name) {
        // ── Trend ──────────────────────────────────────────────────────────
        case 'MACD':
          if (value > 0) return 'macd.positive'
          if (value < 0) return 'macd.negative'
          return 'neutral'

        case 'ADX':
          if (value > 25) return 'adx.strong'
          if (value < 20) return 'adx.weak'
          return 'adx.developing'

        // ── Momentum ───────────────────────────────────────────────────────
        case 'RSI':
          if (value > 70) return 'rsi.overbought'
          if (value < 30) return 'rsi.oversold'
          return 'rsi.neutral'

        case 'CCI':
          if (value > 100) return 'cci.upper'
          if (value < -100) return 'cci.lower'
          return 'cci.ranging'

        case 'Stoch %K':
        case 'Stoch %D':
          if (value > 80) return 'momentum.overbought'
          if (value < 20) return 'momentum.oversold'
          return 'neutral'

        case 'Williams %R':
          if (value > -20) return 'momentum.overbought'
          if (value < -80) return 'momentum.oversold'
          return 'neutral'

        case 'MFI':
          if (value > 80) return 'momentum.overbought'
          if (value < 20) return 'momentum.oversold'
          return 'neutral'

        // ── Volatility ─────────────────────────────────────────────────────
        case 'ATR':
          return 'reference'

        case 'BB %B':
          if (value > 1) return 'bb.above'
          if (value < 0) return 'bb.below'
          return 'bb.within'

        case 'BB Upper':
        case 'BB Mid':
        case 'BB Lower':
        case 'BB Width':
          return 'reference'

        // ── Volume ─────────────────────────────────────────────────────────
        case 'CMF':
          if (value > 0.1) return 'cmf.positive'
          if (value < -0.1) return 'cmf.negative'
          return 'cmf.neutral'

        default:
          return 'reference'
      }
    },

    getInterpretation (name, value) {
      if (value === null || value === undefined || isNaN(value)) return '—'
      const key = this.getInterpretationKey(name, value)
      return this.$t('stockResearch.technicals.states.' + key)
    },

    getInterpretationClass (name, value) {
      if (value === null || value === undefined || isNaN(value)) return 'text-neutral'
      const key = this.getInterpretationKey(name, value)

      if (
        key.includes('overbought') ||
        key === 'macd.negative' ||
        key === 'cmf.negative' ||
        key === 'bb.above' ||
        key === 'cci.upper'
      ) {
        return 'text-negative-state'
      }

      if (
        key.includes('oversold') ||
        key === 'macd.positive' ||
        key === 'cmf.positive' ||
        key === 'bb.below' ||
        key === 'cci.lower'
      ) {
        return 'text-positive-state'
      }

      if (key === 'adx.strong') {
        return 'text-strong'
      }

      return 'text-neutral'
    }
  }
}
</script>

<style scoped lang="less">
.technicals-tab {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ── Disclaimer banner ──────────────────────────────────────────────── */
.tech-disclaimer {
  display: flex;
  align-items: baseline;
  gap: 12px;
  background: #fffbe6;
  border: 1px solid #ffe58f;
  border-left: 4px solid #faad14;
  border-radius: 4px;
  padding: 10px 16px;
  flex-wrap: wrap;

  .disclaimer-title {
    font-size: 13px;
    font-weight: 700;
    color: #ad6800;
    white-space: nowrap;
  }

  .disclaimer-body {
    font-size: 13px;
    color: #614700;
    line-height: 1.5;
  }
}

/* ── Indicator grid ────────────────────────────────────────────────── */
.technicals-container {
  display: flex;
  flex-direction: column;
}

.indicator-sections {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.section-card {
  background: #ffffff;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.03);

  .section-title {
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 1px;
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 1px solid #f0f0f0;
  }

  .cyan-text   { color: #13c2c2; }
  .amber-text  { color: #faad14; }
  .purple-text { color: #722ed1; }
  .green-text  { color: #52c41a; }
}

.ind-name-cell {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  color: #1f2937;
}

.edu-info-icon {
  color: #1890ff;
  font-size: 13px;
  cursor: pointer;
  transition: transform 0.15s, color 0.15s;

  &:hover {
    color: #40a9ff;
    transform: scale(1.15);
  }
}

.ind-value {
  font-family: 'Consolas', monospace;
  font-weight: 600;
  color: #262626;
}

.ind-interp {
  font-size: 13px;
  font-weight: 500;

  /* Interpretation state classes (neutral, positive, negative, strong) */
  &.text-negative-state { color: #f5222d; }
  &.text-positive-state { color: #52c41a; }
  &.text-strong         { color: #722ed1; }
  &.text-neutral        { color: #8c8c8c; }
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

/* ── Educational Drawer & Contextual helpers ───────────────────────── */
.indicator-edu-drawer {
  ::v-deep .ant-drawer-content {
    background: #ffffff;
  }

  .drawer-edu-content {
    display: flex;
    flex-direction: column;
    gap: 20px;
    height: 100%;
    padding-bottom: 40px;
  }

  .edu-section {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .edu-section-title {
    font-size: 11px;
    text-transform: uppercase;
    font-weight: 700;
    color: #8c8c8c;
    letter-spacing: 0.8px;
  }

  .edu-section-body {
    font-size: 14px;
    line-height: 1.6;
    color: #262626;

    &.bold-text {
      font-weight: 600;
      color: #111827;
    }
  }

  .params-badge {
    background: #f5f5f5;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    padding: 6px 12px;
    font-family: 'Consolas', monospace;
    font-size: 13px;
    color: #595959;
    width: fit-content;
  }

  .alert-section {
    background: #fffbe6;
    border: 1px solid #ffe58f;
    border-left: 4px solid #faad14;
    border-radius: 6px;
    padding: 12px 16px;

    .warning-title {
      color: #ad6800;
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 4px;
    }

    .warning-body {
      font-size: 13px;
      color: #614700;
      line-height: 1.5;
    }
  }

  .formula-section {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 12px 16px;

    .formula-body {
      code {
        font-family: 'Consolas', monospace;
        font-size: 12px;
        color: #0f172a;
        word-break: break-all;
      }
    }
  }

  .drawer-footer-link {
    margin-top: auto;
    padding-top: 16px;
    border-top: 1px solid #f0f0f0;

    .explore-library-btn {
      height: 40px;
      font-weight: 600;
      border-radius: 8px;
      color: #4b5563;
      border-color: #d1d5db;

      &:hover {
        color: #111827;
        border-color: #9ca3af;
        background: #f9fafb;
      }
    }
  }
}

/* ========== Dark Theme Overrides ========== */
body.dark, body.realdark {
  .section-card {
    background: #1c1c1c !important;
    border-color: #2a2a2a !important;

    .section-title {
      border-bottom-color: #2a2a2a !important;
    }

    ::v-deep .ant-table-thead > tr > th {
      background: #141414 !important;
      color: rgba(255, 255, 255, 0.85) !important;
      border-bottom-color: #2a2a2a !important;
    }

    ::v-deep .ant-table-tbody > tr > td {
      border-bottom-color: #2a2a2a !important;
    }
  }

  .ind-name-cell {
    color: rgba(255, 255, 255, 0.85) !important;
  }

  .ind-value {
    color: rgba(255, 255, 255, 0.85) !important;
  }

  ::v-deep .ant-drawer-content {
    background: #1c1c1c !important;
    color: rgba(255, 255, 255, 0.85) !important;
  }

  ::v-deep .ant-drawer-header {
    background: #1c1c1c !important;
    border-bottom: 1px solid #2a2a2a !important;
  }

  ::v-deep .ant-drawer-title {
    color: rgba(255, 255, 255, 0.85) !important;
  }

  ::v-deep .ant-drawer-close {
    color: rgba(255, 255, 255, 0.45) !important;
    &:hover { color: rgba(255, 255, 255, 0.85) !important; }
  }

  .indicator-edu-drawer {
    .edu-section-body {
      color: rgba(255, 255, 255, 0.85) !important;
    }

    .params-badge {
      background: #2b2b2b !important;
      border-color: #3e3e3e !important;
      color: rgba(255, 255, 255, 0.75) !important;
    }

    .alert-section {
      background: rgba(245, 158, 11, 0.1) !important;
      border-color: rgba(245, 158, 11, 0.25) !important;
      border-left-color: #faad14 !important;

      .warning-title {
        color: #faad14 !important;
      }

      .warning-body {
        color: rgba(255, 255, 255, 0.8) !important;
      }
    }

    .formula-section {
      background: #141414 !important;
      border-color: #2a2a2a !important;

      .formula-body code {
        color: rgba(255, 255, 255, 0.85) !important;
      }
    }

    .drawer-footer-link {
      border-top-color: #2a2a2a !important;

      .explore-library-btn {
        background: #2a2a2a !important;
        border-color: #303030 !important;
        color: rgba(255, 255, 255, 0.85) !important;

        &:hover {
          background: #333333 !important;
          border-color: #1890ff !important;
          color: rgba(255, 255, 255, 0.95) !important;
        }
      }
    }
  }
}

/* ========== Mobile UX: Technicals Section Wrapping (PR2) ========== */
@media (max-width: 900px) {
  .indicator-sections {
    grid-template-columns: 1fr !important;
    gap: 16px !important;
  }
}

/* ========== Technical Sentiment Summary Strip ========== */
.technicals-summary-strip {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.summary-card {
  display: flex;
  align-items: center;
  gap: 16px;
  background: #ffffff;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 14px 18px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.03);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  }

  .card-icon-wrapper {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    flex-shrink: 0;

    &.cyan {
      background: rgba(19, 194, 194, 0.08);
      color: #13c2c2;
    }
    &.amber {
      background: rgba(250, 173, 20, 0.08);
      color: #faad14;
    }
    &.green {
      background: rgba(82, 196, 26, 0.08);
      color: #52c41a;
    }
    &.purple {
      background: rgba(114, 46, 209, 0.08);
      color: #722ed1;
    }
    &.teal {
      background: rgba(19, 194, 194, 0.08);
      color: #13c2c2;
    }
    &.neutral {
      background: rgba(140, 140, 140, 0.08);
      color: #8c8c8c;
    }
  }

  .card-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .card-label {
    font-size: 10px;
    text-transform: uppercase;
    font-weight: 700;
    color: #8c8c8c;
    letter-spacing: 0.8px;
    display: flex;
    align-items: center;
    gap: 6px;

    &.is-zh {
      text-transform: none;
      letter-spacing: normal;
      font-size: 11px;
      font-weight: 600;
    }

    .label-sep {
      color: #bfbfbf;
    }
  }

  .card-value {
    font-size: 13px;
    font-weight: 600;
    color: #1f2937;

    .val-sep {
      color: #bfbfbf;
      margin: 0 4px;
      font-weight: normal;
    }

    .val-zh {
      font-weight: 500;
      color: #4b5563;
    }
  }

  .card-desc {
    font-size: 11px;
    color: #8c8c8c;
    margin-top: 2px;
    font-weight: 500;
    line-height: 1.4;
  }
}

/* ========== Indicator Range Bar ========== */
.value-cell-container {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
}

.indicator-range-bar-wrapper {
  width: 120px;
  margin-top: 4px;
  display: block;
}

.range-track {
  height: 4px;
  background: #f0f0f0;
  border-radius: 2px;
  position: relative;
}

.neutral-zone {
  background: #e1e4e8;
  height: 100%;
  position: absolute;
  border-radius: 1px;
}

.threshold-tick {
  position: absolute;
  width: 1px;
  height: 6px;
  top: -1px;
  background: #bfbfbf;
}

.value-marker {
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  top: -2px;
  transform: translateX(-50%);
  box-shadow: 0 1px 3px rgba(0,0,0,0.15);
  transition: left 0.3s ease;

  &.neutral {
    background: #8c8c8c;
  }
  &.oversold {
    background: #13c2c2; /* Teal */
  }
  &.overbought {
    background: #722ed1; /* Purple */
  }
}

/* ========== Dark Mode Overrides for Strip & Range Bar ========== */
body.dark, body.realdark {
  .summary-card {
    background: #1c1c1c !important;
    border-color: #2a2a2a !important;

    &:hover {
      box-shadow: 0 4px 12px rgba(0,0,0,0.25) !important;
    }

    .card-value {
      color: rgba(255, 255, 255, 0.85) !important;

      .val-zh {
        color: rgba(255, 255, 255, 0.65) !important;
      }
    }

    .card-desc {
      color: rgba(255, 255, 255, 0.45) !important;
    }
  }

  .range-track {
    background: #2a2a2a !important;
  }

  .neutral-zone {
    background: #3e3e3e !important;
  }

  .threshold-tick {
    background: #4d4d4d !important;
  }
}

@media (max-width: 768px) {
  .technicals-summary-strip {
    grid-template-columns: 1fr !important;
    gap: 12px !important;
  }
}
</style>

<style lang="less">
/* Unscoped global overrides for dynamic overlays like a-drawer in dark mode */
body.dark, body.realdark {
  .indicator-edu-drawer {
    .ant-drawer-content {
      background: #1c1c1c !important;
      color: rgba(255, 255, 255, 0.85) !important;
    }

    .ant-drawer-header {
      background: #1c1c1c !important;
      border-bottom: 1px solid #2a2a2a !important;
    }

    .ant-drawer-title {
      color: rgba(255, 255, 255, 0.85) !important;
    }

    .ant-drawer-close {
      color: rgba(255, 255, 255, 0.45) !important;
      &:hover { color: rgba(255, 255, 255, 0.85) !important; }
    }
  }
}
</style>
