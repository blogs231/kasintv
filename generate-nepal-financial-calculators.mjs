import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('.');
const domain = 'https://kasin-tv.com';
const lastmod = '2026-07-10';

const field = (id, label, value, options = {}) => ({ id, label, value, ...options });
const select = (id, label, value, options) => ({ id, label, value, type: 'select', options });
const textArea = (id, label, value, placeholder = '') => ({ id, label, value, type: 'textarea', placeholder });
const escape = (value) => String(value).replace(/[&<>"']/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

const tools = [
  {
    slug: 'sip-calculator',
    title: 'SIP Calculator',
    icon: 'fa-coins',
    operation: 'sip',
    description: 'Estimate SIP maturity, total contributions and expected investment gains for long-term saving in Nepal.',
    fields: [field('monthly','Monthly investment (NPR)',10000), field('annualReturn','Expected annual return (%)',12), field('years','Investment years',10)]
  },
  {
    slug: 'simple-interest-calculator',
    title: 'Simple Interest Calculator',
    icon: 'fa-percent',
    operation: 'simple-interest',
    description: 'Calculate simple interest and maturity value from principal, annual rate and time period.',
    fields: [field('principal','Principal amount (NPR)',100000), field('annualRate','Annual interest rate (%)',10), field('years','Years',2)]
  },
  {
    slug: 'irr-calculator',
    title: 'IRR Calculator',
    icon: 'fa-chart-line',
    operation: 'irr',
    description: 'Estimate internal rate of return from project or investment cash flows.',
    fields: [textArea('cashFlows','Cash flows, starting with initial investment','-100000\n25000\n30000\n35000\n40000','Example: -100000 25000 30000 35000')]
  },
  {
    slug: 'mortgage-amortization',
    title: 'Mortgage Amortization',
    icon: 'fa-house',
    operation: 'mortgage',
    description: 'Estimate home loan monthly payment, total payment and interest using reducing balance EMI math.',
    fields: [field('propertyPrice','Property price (NPR)',8000000), field('downPayment','Down payment (NPR)',2000000), field('annualRate','Annual interest rate (%)',10.5), field('years','Loan years',20)]
  },
  {
    slug: 'future-value-calculator',
    title: 'Future Value Calculator',
    icon: 'fa-dollar-sign',
    operation: 'future-value',
    description: 'Project future value from current savings, monthly contribution, expected return and time.',
    fields: [field('current','Current amount (NPR)',100000), field('monthly','Monthly contribution (NPR)',5000), field('annualReturn','Expected annual return (%)',8), field('years','Years',10), field('target','Optional target (NPR)',0)]
  },
  {
    slug: 'return-on-investment-calculator',
    title: 'ROI Calculator',
    icon: 'fa-percent',
    operation: 'roi',
    description: 'Calculate return on investment percentage, profit or loss and final value.',
    fields: [field('initial','Initial investment (NPR)',100000), field('finalValue','Final value (NPR)',125000)]
  },
  {
    slug: 'debt-to-income-ratio',
    title: 'Debt-to-Income Ratio',
    icon: 'fa-scale-balanced',
    operation: 'dti',
    description: 'Measure monthly debt against gross income to estimate borrowing comfort.',
    fields: [field('monthlyDebt','Monthly debt payments (NPR)',35000), field('grossIncome','Gross monthly income (NPR)',120000)]
  },
  {
    slug: 'nepal-loan-emi-calculator',
    title: 'EMI Calculator (NPR)',
    icon: 'fa-money-bill-wave',
    operation: 'emi',
    description: 'Calculate NPR loan EMI, total payment and interest for personal or business loans.',
    fields: [field('principal','Loan amount (NPR)',1000000), field('annualRate','Annual interest rate (%)',11), field('years','Loan years',5)]
  },
  {
    slug: 'nepal-income-tax-calculator',
    title: 'Nepal Income Tax Calculator',
    icon: 'fa-file-invoice-dollar',
    operation: 'income-tax',
    description: 'Estimate Nepal income tax with editable taxable income, deductions and effective tax rate.',
    fields: [field('income','Annual income (NPR)',900000), field('deductions','Deductions / allowances (NPR)',0), field('taxRate','Effective tax rate (%)',10)]
  },
  {
    slug: 'nepal-vat-calculator',
    title: 'Nepal VAT Calculator',
    icon: 'fa-percent',
    operation: 'vat',
    description: 'Add or extract Nepal VAT from invoice amounts using an editable VAT rate.',
    fields: [field('amount','Amount (NPR)',10000), field('vatRate','VAT rate (%)',13), select('mode','Calculation mode','add',[{label:'Add VAT to base amount',value:'add'},{label:'Extract VAT from gross amount',value:'extract'}])]
  },
  {
    slug: 'investment-returns-calculator',
    title: 'Investment Returns Calculator',
    icon: 'fa-chart-line',
    operation: 'investment-returns',
    description: 'Estimate investment maturity value from lump sum, monthly contributions and expected return.',
    fields: [field('current','Initial investment (NPR)',200000), field('monthly','Monthly contribution (NPR)',10000), field('annualReturn','Expected annual return (%)',10), field('years','Years',8), field('target','Target amount (NPR)',2000000)]
  },
  {
    slug: 'compound-interest-calculator',
    title: 'Compound Interest Calculator',
    icon: 'fa-piggy-bank',
    operation: 'fd',
    description: 'Calculate compound interest maturity using quarterly compounding and editable tax estimate.',
    fields: [field('principal','Principal amount (NPR)',100000), field('annualRate','Annual rate (%)',10), field('years','Years',5), field('taxRate','Tax on interest (%)',0)]
  },
  {
    slug: 'currency-converter',
    title: 'Currency Converter',
    icon: 'fa-right-left',
    operation: 'currency-converter',
    description: 'Convert foreign currency to NPR using an exchange rate and transfer fee.',
    fields: [field('foreignAmount','Foreign amount',1000), field('exchangeRate','Exchange rate to NPR',133), field('feeRate','Fee (%)',0), field('fixedFee','Fixed fee (NPR)',0)]
  },
  {
    slug: 'stock-portfolio-tracker',
    title: 'Stock Portfolio Tracker',
    icon: 'fa-chart-area',
    operation: 'portfolio',
    description: 'Estimate stock portfolio current value, gain or loss and return percentage.',
    fields: [field('buyPrice','Average buy price (NPR)',300), field('currentPrice','Current price (NPR)',375), field('units','Units / shares',100), field('dividend','Dividend received (NPR)',0)]
  },
  {
    slug: 'retirement-calculator',
    title: 'Retirement Calculator',
    icon: 'fa-umbrella-beach',
    operation: 'retirement',
    description: 'Project retirement corpus from current savings and monthly investing.',
    fields: [field('current','Current retirement savings (NPR)',500000), field('monthly','Monthly saving (NPR)',15000), field('annualReturn','Expected annual return (%)',9), field('years','Years until retirement',25), field('target','Retirement target (NPR)',10000000)]
  },
  {
    slug: 'inflation-calculator',
    title: 'Inflation Calculator',
    icon: 'fa-chart-column',
    operation: 'inflation',
    description: 'Estimate future cost of today’s money after inflation.',
    fields: [field('principal','Current cost (NPR)',100000), field('inflationRate','Annual inflation rate (%)',6), field('years','Years',10)]
  },
  {
    slug: 'loan-comparison',
    title: 'Loan Comparison',
    icon: 'fa-scale-balanced',
    operation: 'loan-comparison',
    description: 'Compare two loan offers by EMI and monthly payment difference.',
    fields: [field('principal','Loan amount (NPR)',1000000), field('rateA','Option A rate (%)',10), field('yearsA','Option A years',5), field('rateB','Option B rate (%)',11.5), field('yearsB','Option B years',5)]
  },
  {
    slug: 'debt-payoff-calculator',
    title: 'Debt Payoff Calculator',
    icon: 'fa-credit-card',
    operation: 'debt-payoff',
    description: 'Estimate how long it takes to repay a debt and total interest paid.',
    fields: [field('principal','Debt balance (NPR)',250000), field('annualRate','Annual interest rate (%)',15), field('monthlyPayment','Monthly payment (NPR)',15000)]
  },
  {
    slug: 'education-fund-calculator',
    title: 'Education Fund Calculator',
    icon: 'fa-graduation-cap',
    operation: 'education-fund',
    description: 'Project an education fund and compare it against a target cost.',
    fields: [field('current','Current savings (NPR)',100000), field('monthly','Monthly saving (NPR)',8000), field('annualReturn','Expected annual return (%)',8), field('years','Years until study',10), field('target','Target education cost (NPR)',2000000)]
  },
  {
    slug: 'business-profit-margin',
    title: 'Business Profit Margin',
    icon: 'fa-store',
    operation: 'business-margin',
    description: 'Calculate business profit and margin from revenue, cost of goods and expenses.',
    fields: [field('revenue','Revenue (NPR)',500000), field('costs','Cost of goods (NPR)',280000), field('expenses','Other expenses (NPR)',75000)]
  },
  {
    slug: 'tax-advantaged-investment',
    title: 'Tax-Advantaged Investment',
    icon: 'fa-file-invoice-dollar',
    operation: 'tax-advantaged',
    description: 'Estimate investment growth plus possible tax benefit from eligible investment amount.',
    fields: [field('principal','Eligible investment (NPR)',200000), field('taxRate','Tax benefit rate (%)',10), field('annualReturn','Expected annual return (%)',8), field('years','Years',5)]
  },
  {
    slug: 'nepse-return-calculator',
    title: 'NEPSE Return Calculator',
    icon: 'fa-chart-line',
    operation: 'nepse-return',
    description: 'Calculate estimated NEPSE stock return from buy price, sell price, units, fees and dividend.',
    fields: [field('buyPrice','Buy price per share (NPR)',300), field('sellPrice','Sell price per share (NPR)',360), field('units','Shares',100), field('fees','Fees / commissions (NPR)',1200), field('dividend','Dividend received (NPR)',0)]
  },
  {
    slug: 'real-estate-investment',
    title: 'Real Estate Investment',
    icon: 'fa-house',
    operation: 'real-estate',
    description: 'Estimate real estate value, net operating income and cap rate from rent and expenses.',
    fields: [field('propertyPrice','Property price (NPR)',10000000), field('monthlyRent','Monthly rent (NPR)',60000), field('annualExpenses','Annual expenses (NPR)',150000), field('growthRate','Annual property growth (%)',6), field('years','Holding years',5)]
  },
  {
    slug: 'foreign-remittance',
    title: 'Foreign Remittance',
    icon: 'fa-money-bill-transfer',
    operation: 'remittance',
    description: 'Estimate NPR received from foreign remittance after exchange rate and fees.',
    fields: [field('foreignAmount','Foreign amount',1000), field('exchangeRate','Exchange rate to NPR',133), field('feeRate','Fee (%)',1), field('fixedFee','Fixed fee (NPR)',500)]
  },
  {
    slug: 'insurance-premium',
    title: 'Insurance Premium',
    icon: 'fa-shield-halved',
    operation: 'insurance',
    description: 'Estimate annual and monthly insurance premium from coverage and rate assumptions.',
    fields: [field('coverage','Coverage amount (NPR)',1000000), field('ratePerThousand','Rate per NPR 1,000',4), field('ageFactor','Age / risk factor',1.2), field('years','Policy years',10)]
  },
  {
    slug: 'budget-planner',
    title: 'Budget Planner',
    icon: 'fa-wallet',
    operation: 'budget',
    description: 'Plan monthly budget by comparing income, expenses and savings surplus.',
    fields: [field('monthlyIncome','Monthly income (NPR)',100000), field('monthlyExpenses','Monthly expenses (NPR)',65000), field('costs','Extra commitments (NPR)',5000)]
  },
  {
    slug: 'cooperative-interest',
    title: 'Cooperative Interest',
    icon: 'fa-handshake',
    operation: 'cooperative-interest',
    description: 'Estimate cooperative deposit maturity and interest using editable rate and tax values.',
    fields: [field('principal','Deposit amount (NPR)',200000), field('annualRate','Annual interest rate (%)',9), field('years','Years',3), field('taxRate','Tax on interest (%)',5)]
  },
  {
    slug: 'fixed-deposit-comparison',
    title: 'Fixed Deposit Comparison',
    icon: 'fa-building-columns',
    operation: 'fd-comparison',
    description: 'Compare two fixed deposit interest rates and maturity values.',
    fields: [field('principal','Deposit amount (NPR)',500000), field('rateA','Bank A rate (%)',7.5), field('rateB','Bank B rate (%)',8.25), field('years','Years',2), field('taxRate','Tax on interest (%)',5)]
  },
  {
    slug: 'foreign-currency-investment',
    title: 'Foreign Currency Investment',
    icon: 'fa-dollar-sign',
    operation: 'foreign-currency-investment',
    description: 'Estimate NPR value of foreign currency investment after exchange rate and growth.',
    fields: [field('nprAmount','NPR invested',200000), field('buyRate','Buy exchange rate',133), field('sellRate','Future sell exchange rate',140), field('annualReturn','Foreign asset return (%)',4), field('years','Years',3)]
  },
  {
    slug: 'gold-investment',
    title: 'Gold Investment',
    icon: 'fa-coins',
    operation: 'gold-investment',
    description: 'Estimate gold investment gain or loss from buy price, sell price, grams and fees.',
    fields: [field('buyPrice','Buy price per gram (NPR)',12000), field('sellPrice','Sell price per gram (NPR)',13500), field('grams','Gold grams',20), field('fees','Fees / making charge (NPR)',5000)]
  },
  {
    slug: 'agricultural-loan-subsidy',
    title: 'Agricultural Loan/Subsidy',
    icon: 'fa-tractor',
    operation: 'agri-subsidy',
    description: 'Estimate agricultural loan EMI after interest subsidy.',
    fields: [field('principal','Loan amount (NPR)',800000), field('annualRate','Normal annual rate (%)',12), field('subsidyRate','Interest subsidy (%)',5), field('years','Loan years',5)]
  },
  {
    slug: 'microfinance-loan',
    title: 'Microfinance Loan',
    icon: 'fa-hand-holding-dollar',
    operation: 'microfinance-loan',
    description: 'Estimate microfinance loan installment including service fee.',
    fields: [field('principal','Loan amount (NPR)',150000), field('annualRate','Annual interest rate (%)',15), field('termMonths','Term months',24), field('serviceFee','Service fee (%)',1)]
  },
  {
    slug: 'personal-loan-eligibility',
    title: 'Personal Loan Eligibility',
    icon: 'fa-user-check',
    operation: 'eligibility',
    description: 'Estimate maximum personal loan eligibility from income, EMI obligations and DTI limit.',
    fields: [field('monthlyIncome','Monthly income (NPR)',100000), field('existingEmi','Existing EMI (NPR)',20000), field('maxDti','Maximum DTI (%)',45), field('annualRate','Loan rate (%)',12), field('years','Loan years',5)]
  },
  {
    slug: 'vehicle-loan',
    title: 'Vehicle Loan',
    icon: 'fa-car',
    operation: 'vehicle-loan',
    description: 'Calculate vehicle loan EMI from price, down payment, rate and tenure.',
    fields: [field('vehiclePrice','Vehicle price (NPR)',3500000), field('downPayment','Down payment (NPR)',1000000), field('annualRate','Annual interest rate (%)',11), field('years','Loan years',7)]
  },
  {
    slug: 'nepal-pf-calculator',
    title: 'Provident Fund',
    icon: 'fa-piggy-bank',
    operation: 'provident-fund',
    description: 'Estimate provident fund corpus from monthly salary, contribution rates and annual return.',
    fields: [field('monthlySalary','Monthly basic salary (NPR)',60000), field('employeeRate','Employee contribution (%)',10), field('employerRate','Employer contribution (%)',10), field('annualReturn','Estimated annual return (%)',7), field('years','Years',15)]
  },
  {
    slug: 'citizen-investment-trust',
    title: 'Citizen Investment Trust',
    icon: 'fa-building-columns',
    operation: 'citizen-investment-trust',
    description: 'Estimate Citizen Investment Trust savings corpus and target gap.',
    fields: [field('current','Current CIT savings (NPR)',100000), field('monthly','Monthly contribution (NPR)',5000), field('annualReturn','Estimated annual return (%)',7), field('years','Years',10), field('target','Target corpus (NPR)',1000000)]
  },
  {
    slug: 'nepal-salary-tax-calculator',
    title: 'Nepal Salary Tax',
    icon: 'fa-wallet',
    operation: 'salary-tax',
    description: 'Estimate annual salary tax from monthly salary, bonus, deductions and editable effective tax rate.',
    fields: [field('monthlySalary','Monthly salary (NPR)',80000), field('bonus','Annual bonus (NPR)',80000), field('deductions','Annual deductions (NPR)',0), field('taxRate','Effective tax rate (%)',10)]
  },
  {
    slug: 'nepal-corporate-income-tax-calculator',
    title: 'Nepal Corporate Tax',
    icon: 'fa-building',
    operation: 'corporate-tax',
    description: 'Estimate corporate income tax using profit and editable tax rate.',
    fields: [field('income','Taxable profit (NPR)',2000000), field('deductions','Adjustments / deductions (NPR)',0), field('taxRate','Corporate tax rate (%)',25)]
  },
  {
    slug: 'nepal-ssf-calculator',
    title: 'Nepal SSF Calculator',
    icon: 'fa-shield-halved',
    operation: 'ssf',
    description: 'Estimate SSF-style contribution corpus from salary and employee/employer contribution rates.',
    fields: [field('monthlySalary','Monthly salary (NPR)',80000), field('employeeRate','Employee contribution (%)',11), field('employerRate','Employer contribution (%)',20), field('annualReturn','Estimated annual return (%)',6), field('years','Years',20)]
  },
  {
    slug: 'nepal-fixed-deposit-calculator',
    title: 'Nepal FD Calculator',
    icon: 'fa-building-columns',
    operation: 'fd',
    description: 'Calculate Nepal fixed deposit maturity, gross interest and estimated tax deduction.',
    fields: [field('principal','Deposit amount (NPR)',500000), field('annualRate','Annual interest rate (%)',7.5), field('years','Years',2), field('taxRate','Tax on interest (%)',5)]
  }
];

const header = `<!-- START SITE GLOBAL HEADER -->
<header class="site-global-header"><div><a href="/"><img src="/favicon.ico" alt="KaSin TV logo"><span><span>KaSin TV</span><span>Free online tools</span></span></a><nav class="site-nav" aria-label="Primary navigation"><a href="/">Home</a><a href="/all-tools.html">All Tools</a><a href="/password-generator.html">Password</a><a href="/qr-code-generator.html">QR Code</a><a href="/nepal-salary-tax-calculator.html">Nepal Tax</a><a href="/about-us.html">About</a><a href="/contact-us.html">Contact</a></nav></div></header>
<!-- END SITE GLOBAL HEADER -->`;

const footer = `<!-- START SITE GLOBAL FOOTER -->
<footer class="site-global-footer"><div class="footer-content"><div><p>KaSin TV</p><p>Fast, private and free browser-based utilities at kasin-tv.com.</p></div><div><p>Tools</p><ul><li><a href="/all-tools.html">Browse All Tools</a></li></ul></div><div><p>Information</p><ul><li><a href="/about-us.html">About</a></li><li><a href="/privacy.html">Privacy</a></li><li><a href="/terms.html">Terms</a></li><li><a href="/disclaimer.html">Disclaimer</a></li><li><a href="/contact-us.html">Contact</a></li></ul></div></div><div>© 2026 KaSin TV · kasin-tv.com</div></footer>
<!-- END SITE GLOBAL FOOTER -->`;

const pageHtml = (tool) => {
  const config = JSON.stringify(tool).replace(/</g, '\\u003c');
  const structured = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: `${tool.title} - KaSin TV`,
    url: `${domain}/${tool.slug}.html`,
    description: tool.description,
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Any',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    publisher: { '@type': 'Organization', name: 'KaSin TV', url: `${domain}/` }
  }).replace(/</g, '\\u003c');
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escape(tool.title)} Online Free | KaSin TV</title>
  <meta name="description" content="${escape(tool.description)} Free browser-based financial calculator from KaSin TV.">
  <meta name="author" content="KaSin TV">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <link rel="canonical" href="${domain}/${tool.slug}.html">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="KaSin TV">
  <meta property="og:title" content="${escape(tool.title)}">
  <meta property="og:description" content="${escape(tool.description)}">
  <meta property="og:url" content="${domain}/${tool.slug}.html">
  <meta name="twitter:card" content="summary">
  <link rel="icon" href="/favicon.ico">
  <link rel="stylesheet" href="/styles.css">
  <link rel="stylesheet" href="/tool-pages.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">
  <script type="application/ld+json">${structured}</script>
</head>
<body data-financial-tool="${tool.slug}">
  ${header}
  <main class="modern-tool-page">
    <nav class="tool-breadcrumb" aria-label="Breadcrumb"><a href="/">kasin-tv.com</a><span>›</span><a href="/all-tools.html">All Tools</a><span>›</span><span>${escape(tool.title)}</span></nav>
    <section class="modern-hero">
      <div class="modern-hero-badge"><i class="fa-solid ${tool.icon}"></i></div>
      <h1>${escape(tool.title)}</h1>
      <p>${escape(tool.description)} Values are calculated locally in your browser and can be edited for your bank, investment or tax assumptions.</p>
      <div class="modern-hero-pills"><span>NPR friendly</span><span>No signup</span><span>Instant estimate</span></div>
    </section>
    <section class="modern-shell">
      <div class="modern-card">
        <h2>Enter details</h2>
        <div id="financialForm" class="modern-form-grid"></div>
        <div class="modern-actions">
          <button id="calculateFinancial" class="modern-button"><i class="fa-solid fa-calculator"></i> Calculate</button>
          <button id="resetFinancial" class="modern-button ghost"><i class="fa-solid fa-rotate-left"></i> Reset</button>
        </div>
        <p id="toolStatus" class="modern-alert" role="status"></p>
      </div>
      <aside class="modern-card modern-result">
        <h2>Result</h2>
        <div id="financialPrimary" class="modern-output">Calculating...</div>
        <div id="financialStats" class="modern-stat-grid"></div>
        <p id="financialSummary" class="modern-note">Review assumptions before using this estimate for decisions.</p>
      </aside>
    </section>
    <section class="modern-guide-grid">
      <article class="modern-mini-card"><h3>How to use</h3><p>Enter your amount, rate and period. The result updates instantly as you change values.</p></article>
      <article class="modern-mini-card"><h3>Accuracy note</h3><p>Financial and tax results are estimates. Confirm current rates and rules with your bank, advisor or official source.</p></article>
      <article class="modern-mini-card"><h3>More tools</h3><p><a href="/#toolCategories">Browse Nepal Financial Calculators</a> or <a href="/all-tools.html">view all KaSin TV tools</a>.</p></article>
    </section>
  </main>
  ${footer}
  <script id="financialToolConfig" type="application/json">${config}</script>
  <script src="/financial-calculators.js" defer></script>
</body>
</html>`;
};

for (const tool of tools) {
  fs.writeFileSync(path.join(root, `${tool.slug}.html`), pageHtml(tool), 'utf8');
}

fs.writeFileSync(path.join(root, 'nepal-financial-tools-manifest.json'), JSON.stringify({ generatedAt: lastmod, count: tools.length, tools }, null, 2), 'utf8');

const cardHtml = (tool) => `                    <a href="${tool.slug}.html" class="tool-card hover-lift flex items-start gap-3 p-4 rounded-xl border border-gray-100 bg-white">
                        <i class="fas ${tool.icon} w-8 shrink-0 text-center text-brand-600 text-lg opacity-80 mt-0.5"></i>
                        <span class="min-w-0">
                            <span class="block text-sm font-semibold text-gray-700 leading-snug">${escape(tool.title)}</span>
                            <span class="block text-xs text-gray-500 leading-snug mt-1">${escape(tool.description.replace(/\.$/, ''))}.</span>
                        </span>
                    </a>`;

const categorySection = `            <section class="bg-white rounded-3xl p-6 md:p-8 smooth-shadow border border-gray-100 tool-category">
                <div class="flex flex-wrap items-center justify-between mb-6 gap-3">
                    <h2 class="text-base font-bold text-gray-900 flex items-center">
                        <i class="fas fa-coins text-brand-600 mr-3 opacity-80"></i>Nepal Financial Calculators
                    </h2>
                    <div class="flex items-center gap-2">
                        <span class="text-[10px] font-bold tracking-wide text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full uppercase">NPR</span>
                        <span class="tool-count text-[11px] font-semibold text-gray-500 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-full">${tools.length} tools</span>
                    </div>
                </div>
                <p class="text-sm text-gray-500 mb-5 leading-relaxed">Loan, tax, investment, savings and Nepal-focused planning calculators in one clean section.</p>
                <div class="grid md:grid-cols-2 gap-3">
${tools.map(cardHtml).join('\n')}
                </div>
            </section>`;

const indexPath = path.join(root, 'index.html');
let index = fs.readFileSync(indexPath, 'utf8');
index = index.replace(/<section class="[^"]*tool-category[^"]*">[\s\S]*?Nepal Financial Calculators[\s\S]*?<\/section>\s*/, `${categorySection}\n`);

const financialSlugs = new Set(tools.map((tool) => `${tool.slug}.html`));
index = index.replace(/(<section class="[^"]*tool-category[^"]*">)([\s\S]*?)(<\/section>)/g, (section, open, body, close) => {
  if (body.includes('Nepal Financial Calculators')) return section;
  let nextBody = body.replace(/\s*<a href="([^"]+\.html)" class="tool-card[\s\S]*?<\/a>/g, (card, href) => financialSlugs.has(href) ? '' : card);
  const count = (nextBody.match(/class="tool-card/g) || []).length;
  nextBody = nextBody.replace(/<span class="tool-count[^"]*">[\s\S]*?<\/span>/, (match) => match.replace(/>\s*\d+\s*tools\s*</, `>${count} tools<`));
  return `${open}${nextBody}${close}`;
});

fs.writeFileSync(indexPath, index, 'utf8');

const sitemapPath = path.join(root, 'sitemap.xml');
let sitemap = fs.readFileSync(sitemapPath, 'utf8').replace(/\s*<!-- START NEPAL FINANCIAL TOOLS -->[\s\S]*?<!-- END NEPAL FINANCIAL TOOLS -->\s*/g, '\n');
const existingUrls = new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]));
const financialUrls = tools
  .map((tool) => `${domain}/${tool.slug}.html`)
  .filter((url) => !existingUrls.has(url))
  .map((url) => `    <url><loc>${url}</loc><lastmod>${lastmod}</lastmod></url>`)
  .join('\n');
if (financialUrls) {
  sitemap = sitemap.replace('</urlset>', `\n    <!-- START NEPAL FINANCIAL TOOLS -->\n${financialUrls}\n    <!-- END NEPAL FINANCIAL TOOLS -->\n</urlset>`);
}
fs.writeFileSync(sitemapPath, sitemap, 'utf8');

const allToolsPath = path.join(root, 'all-tools.html');
if (fs.existsSync(allToolsPath)) {
  const financialDirectorySlugs = new Set(tools.map((tool) => `/${tool.slug}.html`));
  let allTools = fs.readFileSync(allToolsPath, 'utf8')
    .replaceAll('240+ Free Online Tools', '235+ Free Online Tools')
    .replace('<div class="tool-page-icon">240+</div>', '<div class="tool-page-icon">235+</div>')
    .replaceAll('Browse 240+ free online financial, text, developer, conversion, calculation and generator tools from KaSin TV at kasin-tv.com.', 'Browse 235+ free online financial, text, developer, conversion, calculation and generator tools from KaSin TV at kasin-tv.com.')
    .replaceAll('200 Free Online Tools', '235+ Free Online Tools')
    .replace('<div class="tool-page-icon">200</div>', '<div class="tool-page-icon">235+</div>')
    .replaceAll('Browse 200 free online text, developer, conversion, calculation and generator tools from KaSin TV at kasin-tv.com.', 'Browse 235+ free online financial, text, developer, conversion, calculation and generator tools from KaSin TV at kasin-tv.com.')
    .replace(/\s*<!-- START NEPAL FINANCIAL DIRECTORY -->[\s\S]*?<!-- END NEPAL FINANCIAL DIRECTORY -->\s*/g, '');
  allTools = allTools.replace(/<a class="directory-card" href="([^"]+\.html)">[\s\S]*?<\/a>/g, (card, href) => financialDirectorySlugs.has(href) ? '' : card);
  const directoryCards = tools.map((tool) => `<a class="directory-card" href="/${tool.slug}.html"><strong>${escape(tool.title)}</strong><span>${escape(tool.description)}</span></a>`).join('');
  const financialDirectory = `<section class="seo-tool-card tool-category"><h2>Nepal Financial Calculators</h2><div class="directory-grid">${directoryCards}</div></section><!-- END NEPAL FINANCIAL DIRECTORY -->`;
  allTools = allTools.replace('</main>', `<!-- START NEPAL FINANCIAL DIRECTORY -->${financialDirectory}</main>`);
  fs.writeFileSync(allToolsPath, allTools, 'utf8');
}

console.log(`Generated/redesigned ${tools.length} Nepal financial calculator pages and updated homepage/all-tools categories.`);
