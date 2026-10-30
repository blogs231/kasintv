(function () {
  const $ = (id) => document.getElementById(id);
  const setText = (id, value) => {
    const element = $(id);
    if (element) element.textContent = value;
  };
  const setValue = (id, value) => {
    const element = $(id);
    if (element) element.value = value;
  };
  const number = (id, fallback = 0) => {
    const value = parseFloat($(id)?.value);
    return Number.isFinite(value) ? value : fallback;
  };
  const toast = (message, type = 'success') => {
    const status = $('toolStatus');
    if (!status) return;
    status.className = `modern-alert ${type}`;
    status.textContent = message;
    window.clearTimeout(status._timer);
    status._timer = window.setTimeout(() => {
      status.textContent = '';
      status.className = 'modern-alert';
    }, 2600);
  };
  const copyText = async (text) => {
    if (!text) {
      toast('Nothing to copy yet.', 'error');
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      toast('Copied to clipboard.');
    } catch {
      const helper = document.createElement('textarea');
      helper.value = text;
      document.body.appendChild(helper);
      helper.select();
      document.execCommand('copy');
      helper.remove();
      toast('Copied to clipboard.');
    }
  };

  function initPassword() {
    const chars = {
      upper: 'ABCDEFGHJKLMNPQRSTUVWXYZ',
      lower: 'abcdefghijkmnopqrstuvwxyz',
      numbers: '23456789',
      symbols: '!@#$%^&*_-+=?'
    };
    const generate = () => {
      const length = Math.min(96, Math.max(6, Math.round(number('passwordLength', 20))));
      const selected = ['upper', 'lower', 'numbers', 'symbols'].filter((key) => $(key)?.checked);
      if (!selected.length) {
        toast('Select at least one character type.', 'error');
        return '';
      }
      const avoidSimilar = $('avoidSimilar')?.checked;
      let pool = selected.map((key) => chars[key]).join('');
      if (!avoidSimilar) pool += '0OIl1';
      const bytes = new Uint32Array(length);
      crypto.getRandomValues(bytes);
      let password = selected.map((key, index) => chars[key][bytes[index] % chars[key].length]).join('');
      for (let i = selected.length; i < length; i += 1) {
        password += pool[bytes[i] % pool.length];
      }
      const passwordChars = password.split('');
      const shuffleBytes = new Uint32Array(passwordChars.length);
      crypto.getRandomValues(shuffleBytes);
      for (let i = passwordChars.length - 1; i > 0; i -= 1) {
        const j = shuffleBytes[i] % (i + 1);
        [passwordChars[i], passwordChars[j]] = [passwordChars[j], passwordChars[i]];
      }
      password = passwordChars.join('');
      const entropy = Math.round(length * Math.log2(pool.length));
      const score = Math.min(100, Math.round((entropy / 120) * 100));
      setText('passwordOutput', password);
      setText('entropyStat', `${entropy} bits`);
      setText('lengthStat', String(length));
      setText('poolStat', String(pool.length));
      setText('strengthLabel', score >= 85 ? 'Excellent' : score >= 65 ? 'Strong' : score >= 40 ? 'Medium' : 'Weak');
      const meter = $('strengthMeter');
      if (meter) meter.style.width = `${score}%`;
      toast('Secure password generated.');
      return password;
    };
    $('passwordLength')?.addEventListener('input', (event) => setText('lengthPreview', event.target.value));
    $('generatePassword')?.addEventListener('click', generate);
    $('copyPassword')?.addEventListener('click', () => copyText($('passwordOutput')?.textContent.trim()));
    $('generatePassword')?.click();
  }

  function initQr() {
    const render = () => {
      const text = $('qrText')?.value.trim();
      if (!text) {
        toast('Enter text or a URL first.', 'error');
        return;
      }
      const target = $('qrPreview');
      target.innerHTML = '';
      const size = Math.min(600, Math.max(120, Math.round(number('qrSize', 260))));
      const dark = $('qrDark')?.value || '#111827';
      const light = $('qrLight')?.value || '#ffffff';
      const level = $('qrLevel')?.value || 'M';
      if (!window.QRCode) {
        target.innerHTML = '<p class="modern-note">QR library could not load. Please check your internet connection and reload.</p>';
        toast('QR library is not available.', 'error');
        return;
      }
      new QRCode(target, {
        text,
        width: size,
        height: size,
        colorDark: dark,
        colorLight: light,
        correctLevel: QRCode.CorrectLevel[level] || QRCode.CorrectLevel.M
      });
      setText('qrChars', String(text.length));
      setText('qrSizeStat', `${size}px`);
      toast('QR code generated.');
    };
    const download = () => {
      const canvas = $('qrPreview')?.querySelector('canvas');
      const img = $('qrPreview')?.querySelector('img');
      let url = '';
      if (canvas) url = canvas.toDataURL('image/png');
      if (!url && img) url = img.src;
      if (!url) {
        toast('Generate a QR code first.', 'error');
        return;
      }
      const link = document.createElement('a');
      link.href = url;
      link.download = 'kasin-tv-qr-code.png';
      link.click();
      toast('QR PNG download started.');
    };
    $('generateQr')?.addEventListener('click', render);
    $('downloadQr')?.addEventListener('click', download);
    $('copyQrText')?.addEventListener('click', () => copyText($('qrText')?.value.trim()));
    render();
  }

  function initBmi() {
    const syncUnit = () => {
      const metric = $('unitSystem')?.value === 'metric';
      $('metricFields').style.display = metric ? 'grid' : 'none';
      $('imperialFields').style.display = metric ? 'none' : 'grid';
    };
    const calculate = () => {
      const metric = $('unitSystem')?.value === 'metric';
      let weightKg;
      let heightM;
      if (metric) {
        weightKg = number('weightKg');
        heightM = number('heightCm') / 100;
      } else {
        weightKg = number('weightLb') * 0.45359237;
        heightM = ((number('heightFt') * 12) + number('heightIn')) * 0.0254;
      }
      if (weightKg <= 0 || heightM <= 0) {
        toast('Enter a valid weight and height.', 'error');
        return;
      }
      const bmi = weightKg / (heightM * heightM);
      const category = bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Healthy range' : bmi < 30 ? 'Overweight' : 'Obesity range';
      const minHealthy = 18.5 * heightM * heightM;
      const maxHealthy = 24.9 * heightM * heightM;
      setText('bmiValue', bmi.toFixed(1));
      setText('bmiCategory', category);
      setText('healthyRange', `${minHealthy.toFixed(1)} - ${maxHealthy.toFixed(1)} kg`);
      setText('bmiNote', bmi < 18.5 ? 'BMI is below the typical adult reference range.' : bmi < 25 ? 'BMI is within the typical adult reference range.' : bmi < 30 ? 'BMI is above the typical adult reference range.' : 'BMI is in a high adult reference range.');
      const meter = $('bmiMeter');
      if (meter) meter.style.width = `${Math.min(100, Math.max(6, (bmi / 40) * 100))}%`;
      toast('BMI calculated.');
    };
    $('unitSystem')?.addEventListener('change', syncUnit);
    $('calculateBmi')?.addEventListener('click', calculate);
    syncUnit();
    calculate();
  }

  function initFd() {
    const calculate = () => {
      const principal = number('principal');
      const rate = number('rate') / 100;
      const years = number('years') + (number('months') / 12);
      const compound = Math.max(1, number('compound', 4));
      const taxRate = number('taxRate', 5) / 100;
      if (principal <= 0 || rate < 0 || years <= 0) {
        toast('Enter valid deposit amount, rate and tenure.', 'error');
        return;
      }
      const maturityBeforeTax = principal * Math.pow(1 + rate / compound, compound * years);
      const interest = maturityBeforeTax - principal;
      const tax = Math.max(0, interest * taxRate);
      const maturity = maturityBeforeTax - tax;
      const fmt = new Intl.NumberFormat('en-NP', { maximumFractionDigits: 0 });
      setText('fdMaturity', `NPR ${fmt.format(maturity)}`);
      setText('fdInterest', `NPR ${fmt.format(interest)}`);
      setText('fdTax', `NPR ${fmt.format(tax)}`);
      setText('fdMonthly', `NPR ${fmt.format(maturity / Math.max(1, years * 12))}`);
      setText('fdSummary', `Deposit NPR ${fmt.format(principal)} for ${years.toFixed(2)} years at ${(rate * 100).toFixed(2)}% annual interest.`);
      toast('FD maturity calculated.');
    };
    $('calculateFd')?.addEventListener('click', calculate);
    calculate();
  }

  function initFindReplace() {
    const run = () => {
      const source = $('sourceText')?.value || '';
      const find = $('findText')?.value || '';
      const replacement = $('replaceText')?.value || '';
      if (!find) {
        setValue('resultText', source);
        setText('matchCount', '0');
        setText('replaceCount', '0');
        setText('charCount', String(source.length));
        return;
      }
      let result = source;
      let matches = 0;
      try {
        if ($('regexMode')?.checked) {
          const flags = `${$('caseSensitive')?.checked ? 'g' : 'gi'}`;
          const pattern = new RegExp(find, flags);
          result = source.replace(pattern, (...args) => {
            matches += 1;
            return replacement;
          });
        } else {
          const escaped = find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const body = $('wholeWord')?.checked ? `\\b${escaped}\\b` : escaped;
          const flags = `${$('caseSensitive')?.checked ? 'g' : 'gi'}`;
          const pattern = new RegExp(body, flags);
          result = source.replace(pattern, () => {
            matches += 1;
            return replacement;
          });
        }
        setValue('resultText', result);
        setText('matchCount', String(matches));
        setText('replaceCount', String(matches));
        setText('charCount', String(result.length));
        toast(matches ? `Replaced ${matches} match${matches === 1 ? '' : 'es'}.` : 'No matches found.', matches ? 'success' : 'error');
      } catch (error) {
        toast(`Invalid pattern: ${error.message}`, 'error');
      }
    };
    ['sourceText', 'findText', 'replaceText', 'caseSensitive', 'regexMode', 'wholeWord'].forEach((id) => {
      const element = $(id);
      if (!element) return;
      element.addEventListener(element.type === 'checkbox' ? 'change' : 'input', run);
    });
    $('replaceNow')?.addEventListener('click', run);
    $('copyResult')?.addEventListener('click', () => copyText($('resultText')?.value));
    $('clearFind')?.addEventListener('click', () => {
      ['sourceText', 'findText', 'replaceText', 'resultText'].forEach((id) => setValue(id, ''));
      run();
    });
    run();
  }

  document.addEventListener('DOMContentLoaded', () => {
    const tool = document.body.dataset.premiumTool;
    if (tool === 'password') initPassword();
    if (tool === 'qr') initQr();
    if (tool === 'bmi') initBmi();
    if (tool === 'fd') initFd();
    if (tool === 'find-replace') initFindReplace();
  });
}());
