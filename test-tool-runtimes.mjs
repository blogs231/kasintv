import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { webcrypto } from 'node:crypto';

class FakeClassList {
  add() {}
  remove() {}
  toggle() {}
}

class FakeElement {
  constructor(value = '') {
    this.value = String(value);
    this.textContent = '';
    this.innerHTML = '';
    this.type = 'text';
    this.checked = false;
    this.dataset = {};
    this.style = {};
    this.className = '';
    this.classList = new FakeClassList();
    this.listeners = new Map();
  }

  addEventListener(type, listener) {
    this.listeners.set(type, listener);
  }

  click() {
    return this.listeners.get('click')?.({ target: this });
  }
}

const generatedRuntime = fs.readFileSync(new URL('./generated-tool-runtime.js', import.meta.url), 'utf8');
const financialRuntime = fs.readFileSync(new URL('./financial-calculators.js', import.meta.url), 'utf8');
const premiumRuntime = fs.readFileSync(new URL('./premium-tool-pages.js', import.meta.url), 'utf8');

const baseContext = () => ({
  console,
  crypto: webcrypto,
  TextEncoder,
  TextDecoder,
  URL,
  URLSearchParams,
  Uint8Array,
  Uint32Array,
  Intl,
  Date,
  Math,
  JSON,
  Number,
  String,
  Array,
  Map,
  Set,
  RegExp,
  btoa,
  atob,
});

async function runGenerated(config, values) {
  const inputs = values.map((value) => new FakeElement(value));
  const elements = {
    toolConfig: new FakeElement(),
    toolOutput: new FakeElement(),
    toolStatus: new FakeElement(),
    runTool: new FakeElement(),
    copyTool: new FakeElement(),
    clearTool: new FakeElement(),
  };
  elements.toolConfig.textContent = JSON.stringify(config);
  const document = {
    getElementById: (id) => elements[id] ?? null,
    querySelectorAll: (selector) => selector === '[data-tool-input]' ? inputs : [],
  };
  vm.runInNewContext(generatedRuntime, { ...baseContext(), document });
  await elements.runTool.click();
  return { output: elements.toolOutput.value, status: elements.toolStatus.textContent };
}

function runFinancial(config) {
  const elements = {
    financialToolConfig: new FakeElement(),
    financialForm: new FakeElement(),
    financialPrimary: new FakeElement(),
    financialStats: new FakeElement(),
    financialSummary: new FakeElement(),
    toolStatus: new FakeElement(),
    calculateFinancial: new FakeElement(),
    resetFinancial: new FakeElement(),
  };
  elements.financialToolConfig.textContent = JSON.stringify(config);
  for (const field of config.fields) {
    elements[field.id] = new FakeElement(field.value ?? '');
    elements[field.id].type = field.type ?? 'number';
  }
  const document = { getElementById: (id) => elements[id] ?? null };
  vm.runInNewContext(financialRuntime, { ...baseContext(), document });
  return {
    primary: elements.financialPrimary.textContent,
    stats: elements.financialStats.innerHTML,
    summary: elements.financialSummary.textContent,
  };
}

function runPremium(tool, fieldValues) {
  const elements = {};
  for (const [id, value] of Object.entries(fieldValues)) elements[id] = new FakeElement(value);
  const ready = [];
  const document = {
    body: { dataset: { premiumTool: tool } },
    getElementById: (id) => elements[id] ?? null,
    addEventListener: (type, callback) => { if (type === 'DOMContentLoaded') ready.push(callback); },
    createElement: () => new FakeElement(),
  };
  const window = {
    setTimeout: () => 1,
    clearTimeout: () => {},
  };
  vm.runInNewContext(premiumRuntime, { ...baseContext(), document, window });
  ready.forEach((callback) => callback());
  return elements;
}

const generatedTests = [
  [{ kind: 'text', op: 'uppercase' }, ['KaSin tv'], 'KASIN TV'],
  [{ kind: 'calculation', op: 'sum' }, ['10, 20, 5'], '35'],
  [{ kind: 'calculation', op: 'simpleinterest' }, ['1000', '10', '2'], '200'],
  [{ kind: 'converter', op: 'convert', mode: 'linear', from: 'm', to: 'cm', factor: 100 }, ['2'], '2 m = 200 cm'],
  [{ kind: 'developer', op: 'hexencode' }, ['Hi'], '4869'],
  [{ kind: 'developer', op: 'hexdecode' }, ['4869'], 'Hi'],
  [{ kind: 'developer', op: 'base64urlencode' }, ['KaSin TV'], 'S2FTaW4gVFY'],
];

for (const [config, values, expected] of generatedTests) {
  const result = await runGenerated(config, values);
  assert.equal(result.output, expected, `Generated runtime failed for ${config.op}`);
}

const invalidHex = await runGenerated({ kind: 'developer', op: 'hexdecode' }, ['not-hex']);
assert.equal(invalidHex.output, '');
assert.match(invalidHex.status, /valid Base16/i);

const simpleInterest = runFinancial({
  operation: 'simple-interest',
  fields: [
    { id: 'principal', value: 100000 },
    { id: 'annualRate', value: 10 },
    { id: 'years', value: 2 },
  ],
});
assert.equal(simpleInterest.primary.replace(/\D/g, ''), '120000');
assert.match(simpleInterest.summary, /Simple interest/i);

const vat = runFinancial({
  operation: 'vat',
  fields: [
    { id: 'amount', value: 1000 },
    { id: 'vatRate', value: 13 },
    { id: 'mode', value: 'add', type: 'select', options: [{ value: 'add', label: 'Add' }] },
  ],
});
assert.equal(vat.primary.replace(/\D/g, ''), '1130');

const bmi = runPremium('bmi', {
  unitSystem: 'metric',
  metricFields: '',
  imperialFields: '',
  weightKg: '70',
  heightCm: '175',
  bmiValue: '',
  bmiCategory: '',
  healthyRange: '',
  bmiNote: '',
  bmiMeter: '',
  toolStatus: '',
  calculateBmi: '',
});
assert.equal(bmi.bmiValue.textContent, '22.9');
assert.equal(bmi.bmiCategory.textContent, 'Healthy range');

console.log(`Tool runtime tests passed: ${generatedTests.length + 4}`);
