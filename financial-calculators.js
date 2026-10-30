(function () {
  const $ = (id) => document.getElementById(id);
  const configElement = $('financialToolConfig');
  if (!configElement) return;

  const config = JSON.parse(configElement.textContent);
  const form = $('financialForm');
  const primary = $('financialPrimary');
  const stats = $('financialStats');
  const summary = $('financialSummary');
  const status = $('toolStatus');

  const money = (value, currency = 'NPR') => {
    const safe = Number.isFinite(value) ? value : 0;
    return `${currency} ${new Intl.NumberFormat('en-NP', { maximumFractionDigits: 0 }).format(safe)}`;
  };
  const number = (value, digits = 2) => Number.isFinite(value) ? value.toLocaleString('en-NP', { maximumFractionDigits: digits }) : '0';
  const percent = (value) => `${number(value, 2)}%`;
  const read = (id, fallback = 0) => {
    const element = $(id);
    if (!element) return fallback;
    if (element.type === 'textarea') return element.value;
    const value = parseFloat(element.value);
    return Number.isFinite(value) ? value : fallback;
  };
  const rate = (id) => read(id) / 100;
  const monthlyPayment = (principal, annualRate, years) => {
    const months = Math.max(1, years * 12);
    const r = annualRate / 12;
    if (r === 0) return principal / months;
    return principal * r / (1 - Math.pow(1 + r, -months));
  };
  const futureValue = (present, monthly, annualRate, years) => {
    const months = Math.max(1, years * 12);
    const r = annualRate / 12;
    const lump = present * Math.pow(1 + r, months);
    const contributions = r === 0 ? monthly * months : monthly * ((Math.pow(1 + r, months) - 1) / r);
    return lump + contributions;
  };
  const payoffMonths = (balance, annualRate, payment) => {
    const r = annualRate / 12;
    if (payment <= balance * r) return Infinity;
    if (r === 0) return Math.ceil(balance / payment);
    return Math.ceil(-Math.log(1 - (balance * r / payment)) / Math.log(1 + r));
  };
  const irr = (flows) => {
    let guess = 0.1;
    for (let i = 0; i < 80; i += 1) {
      let f = 0;
      let df = 0;
      flows.forEach((cash, t) => {
        f += cash / Math.pow(1 + guess, t);
        if (t > 0) df -= t * cash / Math.pow(1 + guess, t + 1);
      });
      const next = guess - f / df;
      if (!Number.isFinite(next)) break;
      if (Math.abs(next - guess) < 1e-7) return next;
      guess = next;
    }
    return guess;
  };

  function renderFields() {
    form.innerHTML = config.fields.map((field) => {
      if (field.type === 'select') {
        return `<div class="modern-field${field.full ? ' full' : ''}"><label for="${field.id}">${field.label}</label><select id="${field.id}">${field.options.map((option) => `<option value="${option.value}"${String(option.value) === String(field.value) ? ' selected' : ''}>${option.label}</option>`).join('')}</select></div>`;
      }
      if (field.type === 'textarea') {
        return `<div class="modern-field full"><label for="${field.id}">${field.label}</label><textarea id="${field.id}" placeholder="${field.placeholder || ''}">${field.value || ''}</textarea></div>`;
      }
      return `<div class="modern-field${field.full ? ' full' : ''}"><label for="${field.id}">${field.label}</label><input id="${field.id}" type="${field.type || 'number'}" step="${field.step || 'any'}" value="${field.value ?? ''}" placeholder="${field.placeholder || ''}"></div>`;
    }).join('');
  }

  function calculate() {
    const op = config.operation;
    const years = read('years');
    const months = read('months');
    const principal = read('principal');
    let result = { title: 'Result', value: money(0), stats: [], summary: 'Enter values and calculate.' };

    if (op === 'sip') {
      const monthly = read('monthly');
      const r = rate('annualReturn') / 12;
      const n = Math.max(1, years * 12);
      const fv = r === 0 ? monthly * n : monthly * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
      const invested = monthly * n;
      result = { value: money(fv), stats: [['Invested', money(invested)], ['Gain', money(fv - invested)], ['Tenure', `${n} months`]], summary: 'Estimated SIP maturity using monthly compounding.' };
    } else if (op === 'simple-interest') {
      const interest = principal * rate('annualRate') * years;
      result = { value: money(principal + interest), stats: [['Interest', money(interest)], ['Principal', money(principal)], ['Rate', percent(read('annualRate'))]], summary: 'Simple interest = principal × rate × time.' };
    } else if (op === 'irr') {
      const flows = String(read('cashFlows', '')).split(/[,\n\s]+/).map(Number).filter(Number.isFinite);
      const value = flows.length >= 2 ? irr(flows) * 100 : 0;
      result = { value: percent(value), stats: [['Cash flows', String(flows.length)], ['NPV at 0%', money(flows.reduce((a, b) => a + b, 0))]], summary: 'IRR is estimated with an iterative browser calculation.' };
    } else if (op === 'mortgage' || op === 'emi' || op === 'vehicle-loan' || op === 'microfinance-loan') {
      const loan = op === 'mortgage' ? Math.max(0, read('propertyPrice') - read('downPayment')) : op === 'vehicle-loan' ? Math.max(0, read('vehiclePrice') - read('downPayment')) : principal;
      const fee = op === 'microfinance-loan' ? loan * rate('serviceFee') : 0;
      const pay = monthlyPayment(loan + fee, rate('annualRate'), years || read('termMonths') / 12);
      const total = pay * Math.max(1, (years || read('termMonths') / 12) * 12);
      result = { value: money(pay), stats: [['Loan amount', money(loan)], ['Total payment', money(total)], ['Interest + fees', money(total - loan)]], summary: 'Monthly installment is calculated using reducing balance EMI math.' };
    } else if (op === 'future-value' || op === 'investment-returns' || op === 'retirement' || op === 'education-fund' || op === 'citizen-investment-trust') {
      const fv = futureValue(read('current'), read('monthly'), rate('annualReturn'), years);
      const target = read('target');
      result = { value: money(fv), stats: [['Contributions', money(read('current') + read('monthly') * years * 12)], ['Estimated gain', money(fv - read('current') - read('monthly') * years * 12)], ['Gap vs target', target ? money(target - fv) : money(0)]], summary: 'Future value includes lump sum and monthly contributions.' };
    } else if (op === 'roi' || op === 'nepse-return' || op === 'foreign-currency-investment' || op === 'gold-investment') {
      const initial = op === 'nepse-return' ? read('buyPrice') * read('units') + read('fees') : op === 'foreign-currency-investment' ? read('nprAmount') : op === 'gold-investment' ? read('buyPrice') * read('grams') + read('fees') : read('initial');
      const finalValue = op === 'nepse-return' ? read('sellPrice') * read('units') + read('dividend') - read('fees') : op === 'foreign-currency-investment' ? (read('nprAmount') / read('buyRate')) * read('sellRate') * Math.pow(1 + rate('annualReturn'), years) : op === 'gold-investment' ? read('sellPrice') * read('grams') - read('fees') : read('finalValue');
      const gain = finalValue - initial;
      result = { value: percent(initial ? (gain / initial) * 100 : 0), stats: [['Profit / loss', money(gain)], ['Initial value', money(initial)], ['Final value', money(finalValue)]], summary: 'Return is calculated from starting value, ending value, fees and income where provided.' };
    } else if (op === 'dti') {
      const dti = read('monthlyDebt') / Math.max(1, read('grossIncome')) * 100;
      result = { value: percent(dti), stats: [['Monthly debt', money(read('monthlyDebt'))], ['Gross income', money(read('grossIncome'))], ['Status', dti <= 36 ? 'Healthy' : dti <= 45 ? 'Watch' : 'High']], summary: 'Debt-to-income ratio compares monthly debt obligations with gross income.' };
    } else if (op === 'income-tax' || op === 'salary-tax' || op === 'corporate-tax') {
      const income = op === 'salary-tax' ? read('monthlySalary') * 12 + read('bonus') : read('income');
      const taxable = Math.max(0, income - read('deductions'));
      const tax = taxable * rate('taxRate');
      result = { value: money(tax), stats: [['Taxable income', money(taxable)], ['Effective rate', percent(read('taxRate'))], ['Net after tax', money(income - tax)]], summary: 'This is an editable-rate estimate. Confirm current Nepal rules before filing or payment.' };
    } else if (op === 'vat') {
      const amount = read('amount');
      const vatRate = rate('vatRate');
      const mode = $('mode')?.value || 'add';
      const vat = mode === 'extract' ? amount - amount / (1 + vatRate) : amount * vatRate;
      const total = mode === 'extract' ? amount : amount + vat;
      const base = mode === 'extract' ? amount - vat : amount;
      result = { value: money(total), stats: [['Base amount', money(base)], ['VAT', money(vat)], ['VAT rate', percent(read('vatRate'))]], summary: 'Nepal VAT defaults to 13%, but the rate remains editable for accuracy.' };
    } else if (op === 'currency-converter' || op === 'remittance') {
      const gross = read('foreignAmount') * read('exchangeRate');
      const fee = gross * rate('feeRate') + read('fixedFee');
      result = { value: money(gross - fee), stats: [['Gross NPR', money(gross)], ['Fees', money(fee)], ['Rate', number(read('exchangeRate'), 4)]], summary: 'Conversion uses the exchange rate and fee values you enter.' };
    } else if (op === 'portfolio') {
      const cost = read('buyPrice') * read('units');
      const value = read('currentPrice') * read('units') + read('dividend');
      result = { value: money(value), stats: [['Gain / loss', money(value - cost)], ['Return', percent(cost ? (value - cost) / cost * 100 : 0)], ['Units', number(read('units'), 2)]], summary: 'Portfolio tracker estimates current value from price, units and dividends.' };
    } else if (op === 'inflation') {
      const future = principal * Math.pow(1 + rate('inflationRate'), years);
      result = { value: money(future), stats: [['Today value', money(principal)], ['Extra needed', money(future - principal)], ['Inflation', percent(read('inflationRate'))]], summary: 'Shows how inflation can raise future cost.' };
    } else if (op === 'loan-comparison') {
      const a = monthlyPayment(principal, rate('rateA'), read('yearsA'));
      const b = monthlyPayment(principal, rate('rateB'), read('yearsB'));
      result = { value: money(Math.min(a, b)), stats: [['Option A EMI', money(a)], ['Option B EMI', money(b)], ['Monthly difference', money(Math.abs(a - b))]], summary: a <= b ? 'Option A has the lower monthly payment.' : 'Option B has the lower monthly payment.' };
    } else if (op === 'debt-payoff') {
      const m = payoffMonths(principal, rate('annualRate'), read('monthlyPayment'));
      const total = Number.isFinite(m) ? m * read('monthlyPayment') : Infinity;
      result = { value: Number.isFinite(m) ? `${m} months` : 'Payment too low', stats: [['Total paid', Number.isFinite(total) ? money(total) : '-'], ['Interest', Number.isFinite(total) ? money(total - principal) : '-']], summary: 'Increase monthly payment if it does not cover monthly interest.' };
    } else if (op === 'business-margin' || op === 'budget') {
      const income = read('revenue') || read('monthlyIncome');
      const costs = read('costs') + read('expenses') + read('monthlyExpenses');
      const profit = income - costs;
      result = { value: money(profit), stats: [['Margin / savings rate', percent(income ? profit / income * 100 : 0)], ['Income', money(income)], ['Costs / expenses', money(costs)]], summary: 'Compares income with costs to estimate remaining profit or savings.' };
    } else if (op === 'tax-advantaged') {
      const taxSaved = principal * rate('taxRate');
      const fv = principal * Math.pow(1 + rate('annualReturn'), years);
      result = { value: money(fv + taxSaved), stats: [['Tax saved', money(taxSaved)], ['Investment future value', money(fv)], ['Effective benefit', money(fv + taxSaved - principal)]], summary: 'Estimate combines investment growth and possible tax benefit.' };
    } else if (op === 'real-estate') {
      const annualRent = read('monthlyRent') * 12;
      const noi = annualRent - read('annualExpenses');
      const value = read('propertyPrice') * Math.pow(1 + rate('growthRate'), years);
      result = { value: money(value), stats: [['Net operating income', money(noi)], ['Cap rate', percent(read('propertyPrice') ? noi / read('propertyPrice') * 100 : 0)], ['Value gain', money(value - read('propertyPrice'))]], summary: 'Real estate estimate uses rent, expenses and assumed property growth.' };
    } else if (op === 'insurance') {
      const annualPremium = read('coverage') / 1000 * read('ratePerThousand') * read('ageFactor');
      result = { value: money(annualPremium), stats: [['Monthly premium', money(annualPremium / 12)], ['Coverage', money(read('coverage'))], ['Term cost', money(annualPremium * years)]], summary: 'Premium estimate uses coverage, rate per thousand and risk factor.' };
    } else if (op === 'cooperative-interest' || op === 'fd' || op === 'fd-comparison') {
      const aRate = read('rateA') || read('annualRate');
      const compoundA = Math.pow(1 + (aRate / 100) / 4, 4 * years);
      const maturityA = principal * compoundA;
      const maturityB = read('rateB') ? principal * Math.pow(1 + rate('rateB') / 4, 4 * years) : principal * Math.pow(1 + rate('annualRate') / 4, 4 * years);
      const tax = Math.max(0, (maturityA - principal) * rate('taxRate'));
      result = { value: money(maturityA - tax), stats: [['Interest', money(maturityA - principal)], ['Tax estimate', money(tax)], ['Option B / comparison', money(maturityB)]], summary: 'Maturity is estimated using quarterly compounding and editable tax rate.' };
    } else if (op === 'agri-subsidy') {
      const normal = monthlyPayment(principal, rate('annualRate'), years);
      const subsidized = monthlyPayment(principal, Math.max(0, rate('annualRate') - rate('subsidyRate')), years);
      result = { value: money(subsidized), stats: [['Normal EMI', money(normal)], ['Subsidy saving / month', money(normal - subsidized)], ['Effective rate', percent(Math.max(0, read('annualRate') - read('subsidyRate')))]], summary: 'Shows estimated EMI after interest subsidy.' };
    } else if (op === 'eligibility') {
      const maxEmi = Math.max(0, read('monthlyIncome') * rate('maxDti') - read('existingEmi'));
      const r = rate('annualRate') / 12;
      const n = Math.max(1, years * 12);
      const loan = r === 0 ? maxEmi * n : maxEmi * (1 - Math.pow(1 + r, -n)) / r;
      result = { value: money(loan), stats: [['Max EMI', money(maxEmi)], ['Income', money(read('monthlyIncome'))], ['DTI cap', percent(read('maxDti'))]], summary: 'Eligibility is estimated from income, existing EMI and maximum debt-to-income ratio.' };
    } else if (op === 'provident-fund' || op === 'ssf') {
      const monthly = read('monthlySalary') * (rate('employeeRate') + rate('employerRate'));
      const corpus = futureValue(0, monthly, rate('annualReturn'), years);
      result = { value: money(corpus), stats: [['Monthly contribution', money(monthly)], ['Employee rate', percent(read('employeeRate'))], ['Employer rate', percent(read('employerRate'))]], summary: 'Fund corpus uses employee and employer contributions with estimated annual return.' };
    }

    primary.textContent = result.value;
    stats.innerHTML = result.stats.map(([label, value]) => `<div class="modern-stat"><strong>${value}</strong><span>${label}</span></div>`).join('');
    summary.textContent = result.summary;
    status.textContent = 'Calculated locally in your browser.';
    status.className = 'modern-alert success';
  }

  renderFields();
  $('calculateFinancial')?.addEventListener('click', calculate);
  $('resetFinancial')?.addEventListener('click', () => {
    renderFields();
    calculate();
  });
  form.addEventListener('input', () => calculate());
  form.addEventListener('change', () => calculate());
  calculate();
}());
