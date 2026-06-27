/**
 * Financial Calculation Utilities for QuantBrew Sandbox
 */

/**
 * Calculates simple and compound growth series over years
 * @param {number} principal - Starting capital
 * @param {number} annualRate - Annual interest rate in percent (e.g. 5 for 5%)
 * @param {number} years - Duration in years
 * @param {number} timesPerYear - Compound frequency per year (1, 2, 4, 12, 52)
 * @returns {Object} Series data containing simple and compound values
 */
export function calculateInterestSeries (principal, annualRate, years, timesPerYear) {
  const r = annualRate / 100
  const simpleSeries = []
  const compoundSeries = []
  const labels = []

  for (let t = 0; t <= years; t++) {
    labels.push(t)
    // Simple Interest: A = P * (1 + r * t)
    simpleSeries.push(principal * (1 + r * t))

    // Compound Interest: A = P * (1 + r / n) ^ (n * t)
    const n = timesPerYear || 1
    compoundSeries.push(principal * Math.pow(1 + r / n, n * t))
  }

  return {
    labels,
    simple: simpleSeries,
    compound: compoundSeries
  }
}

/**
 * Calculates dollar-cost averaging (DCA) cumulative wealth
 * @param {number} principal - Initial capital (lump sum)
 * @param {number} amount - Periodic contribution amount
 * @param {number} annualRate - Expected annual return rate in percent
 * @param {number} years - Duration in years
 * @param {number} periodsPerYear - Frequency of deposits per year (1, 4, 12)
 * @param {string} timing - Deposit timing: 'begin' (annuity due) or 'end' (ordinary annuity)
 * @returns {Object} Projections including final values and annual chart data
 */
export function calculateDCASeries (principal, amount, annualRate, years, periodsPerYear, timing) {
  const rAnnual = annualRate / 100
  // Convert annual rate to periodic rate: (1 + r_annual) ^ (1 / n) - 1
  const rPeriod = rAnnual !== 0 ? Math.pow(1 + rAnnual, 1 / periodsPerYear) - 1 : 0
  const totalPeriods = years * periodsPerYear

  // Initial lump sum final value
  const fvLump = principal * Math.pow(1 + rPeriod, totalPeriods)

  // Annuity final value
  let fvAnnuity = 0
  if (rPeriod !== 0) {
    fvAnnuity = amount * ((Math.pow(1 + rPeriod, totalPeriods) - 1) / rPeriod)
    if (timing === 'begin') {
      fvAnnuity = fvAnnuity * (1 + rPeriod)
    }
  } else {
    fvAnnuity = amount * totalPeriods
  }

  const fvTotal = fvLump + fvAnnuity
  const totalInvested = principal + (amount * totalPeriods)
  const totalReturn = fvTotal - totalInvested
  const overallReturnRate = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0

  // Calculate annual series for plotting
  const labels = []
  const dataValues = []
  const principalValues = []

  for (let y = 0; y <= years; y++) {
    labels.push(y)
    const periodsElapsed = y * periodsPerYear

    // Lump sum growth
    const fvLumpYear = principal * Math.pow(1 + rPeriod, periodsElapsed)

    // Annuity growth
    let fvAnnuityYear = 0
    if (rPeriod !== 0 && periodsElapsed > 0) {
      fvAnnuityYear = amount * ((Math.pow(1 + rPeriod, periodsElapsed) - 1) / rPeriod)
      if (timing === 'begin') {
        fvAnnuityYear = fvAnnuityYear * (1 + rPeriod)
      }
    } else if (rPeriod === 0) {
      fvAnnuityYear = amount * periodsElapsed
    }

    dataValues.push(fvLumpYear + fvAnnuityYear)
    principalValues.push(principal + (amount * periodsElapsed))
  }

  return {
    labels,
    wealth: dataValues,
    principal: principalValues,
    fvTotal,
    totalInvested,
    totalReturn,
    overallReturnRate
  }
}

/**
 * Calculates recovery return rate required after a drawdown
 * @param {number} initial - Initial investment value
 * @param {number} current - Current value (after drawdown)
 * @returns {Object} Drawdown and recovery percentages
 */
export function calculateDrawdownRecovery (initial, current) {
  if (initial <= 0) return { drawdown: 0, recovery: 0, gain: 0, isLoss: false }

  if (current >= initial) {
    const gain = ((current - initial) / initial) * 100
    return {
      drawdown: 0,
      recovery: 0,
      gain,
      isLoss: false
    }
  }

  const lossPercent = ((initial - current) / initial) * 100
  const lossRate = lossPercent / 100
  const recoverRate = lossRate / (1 - lossRate)
  const recoveryPercent = recoverRate * 100

  return {
    drawdown: lossPercent,
    recovery: recoveryPercent,
    gain: 0,
    isLoss: true
  }
}

/**
 * Computes amortization schedule for a loan
 * @param {string} mode - 'annuity' (equal total payments) or 'principal' (equal principal payments)
 * @param {number} principal - Loan principal amount
 * @param {number} annualRate - Annual interest rate in percent
 * @param {number} years - Loan term in years
 * @param {number} paymentsPerYear - Payments per year (e.g. 12 for monthly)
 * @returns {Object} Detailed schedule and summary metrics
 */
export function calculateAmortizationSchedule (mode, principal, annualRate, years, paymentsPerYear) {
  const totalPeriods = years * paymentsPerYear
  const ratePerPeriod = (annualRate / 100) / paymentsPerYear
  const principalPerPeriod = principal / totalPeriods

  let annuityPayment = 0
  if (mode === 'annuity') {
    if (ratePerPeriod === 0) {
      annuityPayment = principalPerPeriod
    } else {
      const factor = Math.pow(1 + ratePerPeriod, totalPeriods)
      annuityPayment = (principal * ratePerPeriod * factor) / (factor - 1)
    }
  }

  let balance = principal
  const schedule = []
  let totalInterest = 0
  let totalPayment = 0
  let firstPayment = 0
  let lastPayment = 0
  let minPayment = Infinity
  let maxPayment = 0

  for (let period = 1; period <= totalPeriods; period++) {
    const startBalance = balance
    let interest = startBalance * ratePerPeriod
    if (!isFinite(interest)) interest = 0

    let payment = 0
    let principalPay = 0

    if (mode === 'annuity') {
      payment = annuityPayment
      principalPay = payment - interest
      if (principalPay < 0) principalPay = 0
      balance = startBalance - principalPay

      // Adjust last payment to resolve rounding differences
      if (period === totalPeriods) {
        if (Math.abs(balance) < 0.01) {
          balance = 0
        } else {
          principalPay = startBalance
          payment = principalPay + interest
          balance = 0
        }
      } else {
        if (balance < 0) {
          principalPay = startBalance
          payment = principalPay + interest
          balance = 0
        }
      }
    } else {
      // Equal principal payments
      principalPay = principalPerPeriod
      payment = principalPay + interest

      if (period === totalPeriods) {
        principalPay = startBalance
        payment = principalPay + interest
        balance = 0
      } else {
        balance = startBalance - principalPay
        if (balance < 0) {
          principalPay = startBalance
          payment = principalPay + interest
          balance = 0
        }
      }
    }

    totalInterest += interest
    totalPayment += payment

    if (period === 1) firstPayment = payment
    lastPayment = payment
    if (payment < minPayment) minPayment = payment
    if (payment > maxPayment) maxPayment = period === 1 ? payment : Math.max(maxPayment, payment)

    schedule.push({
      period,
      startBalance,
      payment,
      principal: principalPay,
      interest,
      endBalance: balance < 0 ? 0 : balance
    })
  }

  return {
    schedule,
    totalInterest,
    totalPayment,
    firstPayment,
    lastPayment,
    minPayment,
    maxPayment: maxPayment || annuityPayment || principalPerPeriod,
    totalPeriods
  }
}

/**
 * Calculates monthly mortgage payment (Principal & Interest)
 * @param {number} loanAmount
 * @param {number} interestRate - Annual rate in percent
 * @param {number} loanTermYears
 * @returns {number} Monthly payment
 */
export function calculateRealEstateMortgage (loanAmount, interestRate, loanTermYears) {
  if (loanAmount <= 0 || interestRate <= 0 || loanTermYears <= 0) return 0
  const r = (interestRate / 100) / 12
  const n = loanTermYears * 12
  return loanAmount * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
}

/**
 * Calculates basic real estate return metrics
 * @param {Object} inputs
 * @returns {Object} Basic returns output metrics
 */
export function calculateRealEstateReturns (inputs) {
  const purchasePrice = Number(inputs.purchasePrice) || 0
  const closingCosts = Number(inputs.closingCosts) || 0
  const repairCost = Number(inputs.repairCost) || 0
  const grossMonthlyRent = Number(inputs.grossMonthlyRent) || 0
  const otherMonthlyIncome = Number(inputs.otherMonthlyIncome) || 0
  const propertyTaxAnnual = Number(inputs.propertyTaxAnnual) || 0
  const insuranceMonthly = Number(inputs.insuranceMonthly) || 0
  const electricity = Number(inputs.electricity) || 0
  const gas = Number(inputs.gas) || 0
  const water = Number(inputs.water) || 0
  const hoa = Number(inputs.hoa) || 0
  const garbage = Number(inputs.garbage) || 0
  const pmi = Number(inputs.pmi) || 0
  const otherExpenses = Number(inputs.otherExpenses) || 0

  const repairsPercent = Number(inputs.repairsPercent) || 0
  const vacancyPercent = Number(inputs.vacancyPercent) || 0
  const capexPercent = Number(inputs.capexPercent) || 0
  const managementPercent = Number(inputs.managementPercent) || 0

  const monthlyIncome = grossMonthlyRent + otherMonthlyIncome

  // Percentages calculated off Gross Monthly Rent
  const repairsCost = (repairsPercent / 100) * grossMonthlyRent
  const vacancyCost = (vacancyPercent / 100) * grossMonthlyRent
  const capexCost = (capexPercent / 100) * grossMonthlyRent
  const managementCost = (managementPercent / 100) * grossMonthlyRent

  const monthlyOperatingExpenses =
    repairsCost +
    vacancyCost +
    capexCost +
    managementCost +
    (propertyTaxAnnual / 12) +
    insuranceMonthly +
    electricity +
    gas +
    water +
    hoa +
    garbage +
    pmi +
    otherExpenses

  let loanAmount = 0
  let downPaymentAmount = 0
  let pointsCost = 0
  let monthlyPi = 0
  let totalCashInvested = 0

  if (inputs.isCashPurchase) {
    totalCashInvested = purchasePrice + closingCosts + repairCost
  } else {
    const downPaymentPercent = Number(inputs.downPaymentPercent) || 0
    const loanPointsPercent = Number(inputs.loanPointsPercent) || 0
    const interestRate = Number(inputs.interestRate) || 0
    const loanTermYears = Number(inputs.loanTermYears) || 0

    downPaymentAmount = purchasePrice * (downPaymentPercent / 100)
    loanAmount = purchasePrice - downPaymentAmount
    pointsCost = loanAmount * (loanPointsPercent / 100)
    monthlyPi = calculateRealEstateMortgage(loanAmount, interestRate, loanTermYears)
    totalCashInvested = downPaymentAmount + closingCosts + repairCost + pointsCost
  }

  const monthlyCashFlow = monthlyIncome - monthlyOperatingExpenses - monthlyPi
  const annualNoi = (monthlyIncome - monthlyOperatingExpenses) * 12

  const purchaseCapRate = purchasePrice > 0 ? (annualNoi / purchasePrice) * 100 : 0
  const proFormaCapRate = (purchasePrice + closingCosts + repairCost) > 0
    ? (annualNoi / (purchasePrice + closingCosts + repairCost)) * 100
    : 0

  const cashOnCashRoi = totalCashInvested > 0 ? ((monthlyCashFlow * 12) / totalCashInvested) * 100 : 0
  const grm = (grossMonthlyRent * 12) > 0 ? purchasePrice / (grossMonthlyRent * 12) : 0
  const dcr = monthlyPi > 0 ? (monthlyIncome - monthlyOperatingExpenses) / monthlyPi : 0

  return {
    monthlyIncome,
    monthlyOperatingExpenses,
    monthlyPi,
    monthlyCashFlow,
    annualNoi,
    purchaseCapRate,
    proFormaCapRate,
    cashOnCashRoi,
    grm,
    dcr,
    totalCashInvested
  }
}

/**
 * Calculates depreciation schedule and tax shield benefits
 * @param {Object} inputs
 * @param {number} preTaxAnnualCashFlow
 * @returns {Object} Depreciation outputs
 */
export function calculateRealEstateTaxShield (inputs, preTaxAnnualCashFlow) {
  const buildingValue = Number(inputs.buildingValue) || 0
  const marginalTaxRate = Number(inputs.marginalTaxRate) || 0
  const depreciationPeriod = Number(inputs.depreciationPeriod) || 27.5

  const annualDepreciation = depreciationPeriod > 0 ? buildingValue / depreciationPeriod : 0
  const annualTaxSavings = annualDepreciation * (marginalTaxRate / 100)
  const afterTaxCashFlow = preTaxAnnualCashFlow + annualTaxSavings

  const schedule = []
  let accumulatedSavings = 0
  const yearsToCalculate = Math.ceil(depreciationPeriod)

  for (let year = 1; year <= yearsToCalculate; year++) {
    let depreciation = annualDepreciation
    if (year === yearsToCalculate && depreciationPeriod % 1 !== 0) {
      depreciation = annualDepreciation * (depreciationPeriod % 1)
    }
    const savings = depreciation * (marginalTaxRate / 100)
    accumulatedSavings += savings

    schedule.push({
      year,
      depreciation,
      taxSavings: savings,
      accumulatedSavings,
      afterTaxCashFlow: preTaxAnnualCashFlow + savings
    })
  }

  return {
    annualDepreciation,
    annualTaxSavings,
    afterTaxCashFlow,
    schedule
  }
}

/**
 * Calculates BRRRR strategy cash-out refinance projections
 * @param {Object} basicInputs
 * @param {Object} brrrrInputs
 * @param {Object} basicOutputs
 * @returns {Object} BRRRR outputs
 */
export function calculateRealEstateBrrrr (basicInputs, brrrrInputs, basicOutputs) {
  const arv = Number(basicInputs.arv) || 0
  const purchasePrice = Number(basicInputs.purchasePrice) || 0
  const downPaymentPercent = Number(basicInputs.downPaymentPercent) || 0
  const isCashPurchase = !!basicInputs.isCashPurchase

  const refinanceLtv = Number(brrrrInputs.refinanceLtv) || 75
  const refinanceInterestRate = Number(brrrrInputs.refinanceInterestRate) || 6.0
  const refinanceTermYears = Number(brrrrInputs.refinanceTermYears) || 30
  const refinanceClosingCosts = Number(brrrrInputs.refinanceClosingCosts) || 4000

  const newLoanAmount = (refinanceLtv / 100) * arv

  const initialDownPayment = purchasePrice * (downPaymentPercent / 100)
  const remainingInitialBalance = isCashPurchase ? 0 : (purchasePrice - initialDownPayment)

  const cashOutAmount = newLoanAmount - remainingInitialBalance - refinanceClosingCosts
  const actualCashInvested = basicOutputs.totalCashInvested - cashOutAmount

  const refinanceMonthlyPi = calculateRealEstateMortgage(newLoanAmount, refinanceInterestRate, refinanceTermYears)
  const postRehabCashFlow = basicOutputs.monthlyIncome - basicOutputs.monthlyOperatingExpenses - refinanceMonthlyPi

  const postRehabOutputs = {
    ...basicOutputs,
    monthlyPi: refinanceMonthlyPi,
    monthlyCashFlow: postRehabCashFlow,
    totalCashInvested: actualCashInvested,
    cashOnCashRoi: actualCashInvested > 0
      ? ((postRehabCashFlow * 12) / actualCashInvested) * 100
      : actualCashInvested < 0
        ? Infinity
        : 0,
    dcr: refinanceMonthlyPi > 0
      ? (basicOutputs.monthlyIncome - basicOutputs.monthlyOperatingExpenses) / refinanceMonthlyPi
      : 0
  }

  return {
    newLoanAmount,
    cashOutAmount,
    actualCashInvested,
    postRehabCashFlow,
    postRehabOutputs
  }
}
