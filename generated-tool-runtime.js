(() => {
  'use strict';
  const configNode = document.getElementById('toolConfig');
  if (!configNode) return;
  const config = JSON.parse(configNode.textContent);
  const inputs = [...document.querySelectorAll('[data-tool-input]')];
  const output = document.getElementById('toolOutput');
  const status = document.getElementById('toolStatus');
  const values = () => inputs.map((node) => node.value);
  const number = (value) => Number(value);
  const numbers = (value) => (value.match(/-?\d*\.?\d+(?:e[+-]?\d+)?/gi) || []).map(Number);
  const words = (value) => value.toLocaleLowerCase().match(/[\p{L}\p{N}'-]+/gu) || [];
  const setStatus = (message, error = false) => {
    status.textContent = message;
    status.classList.toggle('error', error);
  };
  const setOutput = (value) => {
    output.value = String(value ?? '');
    setStatus('Result generated locally in your browser.');
  };
  const escapeHtml = (value) => value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const titleCase = (value) => value.toLocaleLowerCase().replace(/\b[\p{L}\p{N}]/gu, (char) => char.toLocaleUpperCase());
  const sentenceCase = (value) => value.toLocaleLowerCase().replace(/(^\s*[\p{L}]|[.!?]\s+[\p{L}])/gu, (match) => match.toLocaleUpperCase());
  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; };
  const median = (list) => { const sorted = [...list].sort((a, b) => a - b); const mid = Math.floor(sorted.length / 2); return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2; };
  const variance = (list) => { const mean = list.reduce((a, b) => a + b, 0) / list.length; return list.reduce((sum, item) => sum + (item - mean) ** 2, 0) / list.length; };
  const randomInt = (min, max) => {
    const range = max - min + 1;
    const limit = Math.floor(0x100000000 / range) * range;
    const data = new Uint32Array(1);
    do crypto.getRandomValues(data); while (data[0] >= limit);
    return min + (data[0] % range);
  };
  const randomFrom = (alphabet, length) => Array.from({ length }, () => alphabet[randomInt(0, alphabet.length - 1)]).join('');

  function runText(op, raw) {
    const lines = raw.split(/\r\n|\r|\n/);
    const wordList = words(raw);
    const operations = {
      uppercase: () => raw.toLocaleUpperCase(),
      lowercase: () => raw.toLocaleLowerCase(),
      titlecase: () => titleCase(raw),
      sentencecase: () => sentenceCase(raw),
      alternating: () => [...raw].map((char, i) => i % 2 ? char.toLocaleLowerCase() : char.toLocaleUpperCase()).join(''),
      inversecase: () => [...raw].map((char) => char === char.toLocaleUpperCase() ? char.toLocaleLowerCase() : char.toLocaleUpperCase()).join(''),
      removespace: () => raw.replace(/\s+/g, ''),
      normalizespace: () => raw.replace(/[^\S\r\n]+/g, ' ').replace(/ *(\r?\n) */g, '$1').trim(),
      emptylines: () => lines.filter((line) => line.trim()).join('\n'),
      sortlinesaz: () => [...lines].sort((a, b) => a.localeCompare(b)).join('\n'),
      sortlinesza: () => [...lines].sort((a, b) => b.localeCompare(a)).join('\n'),
      reverselines: () => [...lines].reverse().join('\n'),
      numberlines: () => lines.map((line, index) => `${index + 1}. ${line}`).join('\n'),
      trimlines: () => lines.map((line) => line.trim()).join('\n'),
      commalist: () => lines.filter(Boolean).join(', '),
      newline: () => raw.split(/\s*,\s*/).join('\n'),
      repeat: () => Array(3).fill(raw).join('\n'),
      initials: () => wordList.map((word) => word[0]?.toLocaleUpperCase()).join(''),
      acronym: () => wordList.map((word) => word[0]?.toLocaleUpperCase()).join(''),
      palindrome: () => { const clean = raw.toLocaleLowerCase().replace(/[^\p{L}\p{N}]/gu, ''); return clean === [...clean].reverse().join('') ? 'Yes, this is a palindrome.' : 'No, this is not a palindrome.'; },
      vowels: () => (raw.match(/[aeiou]/gi) || []).length,
      consonants: () => (raw.match(/[b-df-hj-np-tv-z]/gi) || []).length,
      sentences: () => (raw.trim().match(/[^.!?]+[.!?]+|[^.!?]+$/g) || []).length,
      paragraphs: () => raw.trim() ? raw.trim().split(/\n\s*\n/).length : 0,
      readingtime: () => `${Math.max(1, Math.ceil(wordList.length / 200))} minute(s) at 200 words per minute`,
      speakingtime: () => `${Math.max(1, Math.ceil(wordList.length / 130))} minute(s) at 130 words per minute`,
      longestword: () => wordList.sort((a, b) => b.length - a.length)[0] || '',
      shortestword: () => wordList.sort((a, b) => a.length - b.length)[0] || '',
      punctuationremove: () => raw.replace(/[\p{P}\p{S}]/gu, ''),
      punctuationcount: () => (raw.match(/[\p{P}\p{S}]/gu) || []).length,
      sortwords: () => [...wordList].sort((a, b) => a.localeCompare(b)).join(' '),
      uniquewords: () => [...new Set(wordList)].join('\n'),
      extractemails: () => (raw.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) || []).join('\n'),
      extracturls: () => (raw.match(/https?:\/\/[^\s<>"']+/gi) || []).join('\n'),
      extractnumbers: () => (raw.match(/-?\d*\.?\d+/g) || []).join('\n'),
      extracthashtags: () => (raw.match(/#[\p{L}\p{N}_]+/gu) || []).join('\n'),
      extractmentions: () => (raw.match(/@[\p{L}\p{N}_]+/gu) || []).join('\n'),
      shufflelines: () => [...lines].sort(() => crypto.getRandomValues(new Uint32Array(1))[0] / 0xffffffff - .5).join('\n'),
      randomline: () => lines.length ? lines[randomInt(0, lines.length - 1)] : '',
      lexdensity: () => wordList.length ? `${((new Set(wordList).size / wordList.length) * 100).toFixed(2)}%` : '0%',
    };
    return operations[op]();
  }

  function runConverter(c, raw) {
    const x = number(raw);
    if (!Number.isFinite(x)) throw new Error('Enter a valid number.');
    if (c.mode === 'linear') return `${x} ${c.from} = ${x * c.factor} ${c.to}`;
    const temp = {
      cf: (n) => n * 9 / 5 + 32, fc: (n) => (n - 32) * 5 / 9,
      ck: (n) => n + 273.15, kc: (n) => n - 273.15,
      fk: (n) => (n - 32) * 5 / 9 + 273.15, kf: (n) => (n - 273.15) * 9 / 5 + 32,
    };
    return `${x} ${c.from} = ${temp[c.mode](x)} ${c.to}`;
  }

  function runCalculation(op, rawValues) {
    const list = numbers(rawValues[0]);
    const x = rawValues.map(number);
    const requireList = () => { if (!list.length) throw new Error('Enter at least one number.'); return list; };
    const listOps = {
      sum: () => requireList().reduce((a, b) => a + b, 0),
      average: () => requireList().reduce((a, b) => a + b, 0) / list.length,
      median: () => median(requireList()),
      mode: () => { requireList(); const count = new Map(); list.forEach((n) => count.set(n, (count.get(n) || 0) + 1)); const max = Math.max(...count.values()); return [...count].filter(([, c]) => c === max).map(([n]) => n).join(', '); },
      range: () => { requireList(); return Math.max(...list) - Math.min(...list); },
      minimum: () => Math.min(...requireList()), maximum: () => Math.max(...requireList()),
      product: () => requireList().reduce((a, b) => a * b, 1),
      variance: () => variance(requireList()), stddev: () => Math.sqrt(variance(requireList())),
      geometric: () => requireList().reduce((a, b) => a * b, 1) ** (1 / list.length),
      harmonic: () => { requireList(); return list.length / list.reduce((sum, n) => sum + 1 / n, 0); },
      rms: () => { requireList(); return Math.sqrt(list.reduce((sum, n) => sum + n ** 2, 0) / list.length); },
      count: () => requireList().length,
      sortnumbers: () => requireList().sort((a, b) => a - b).join(', '),
    };
    if (listOps[op]) return listOps[op]();
    if (x.some((n) => !Number.isFinite(n))) throw new Error('Complete all fields with valid numbers.');
    const ops = {
      gcd: () => gcd(x[0], x[1]), lcm: () => Math.abs(x[0] * x[1]) / gcd(x[0], x[1]),
      modulo: () => x[0] % x[1], power: () => x[0] ** x[1], nthroot: () => x[0] ** (1 / x[1]),
      logarithm: () => Math.log(x[0]) / Math.log(x[1]), percentchange: () => ((x[1] - x[0]) / x[0]) * 100,
      discount: () => x[0] * (1 - x[1] / 100), markup: () => x[0] * (1 + x[1] / 100),
      margin: () => ((x[1] - x[0]) / x[1]) * 100, tip: () => x[0] * x[1] / 100,
      salestax: () => x[0] * (1 + x[1] / 100), simpleinterest: () => x[0] * x[1] * x[2] / 100,
      compoundinterest: () => x[0] * (1 + x[1] / (100 * x[3])) ** (x[3] * x[2]),
      bmi: () => x[0] / ((x[1] / 100) ** 2), ratio: () => `${x[0] / gcd(x[0], x[1])}:${x[1] / gcd(x[0], x[1])}`,
      proportion: () => x[1] === 0 ? NaN : x[0] / x[1] * x[2], fractiondecimal: () => x[0] / x[1],
      decimalpercent: () => x[0] * 100, percentdecimal: () => x[0] / 100,
      square: () => x[0] ** 2, cube: () => x[0] ** 3, squareroot: () => Math.sqrt(x[0]),
      cuberoot: () => Math.cbrt(x[0]), factorial: () => { if (x[0] < 0 || !Number.isInteger(x[0])) throw new Error('Use a non-negative integer.'); let r = 1; for (let i = 2; i <= x[0]; i++) r *= i; return r; },
      prime: () => { const n = x[0]; if (!Number.isInteger(n) || n < 2) return 'Not prime'; for (let i = 2; i <= Math.sqrt(n); i++) if (n % i === 0) return 'Not prime'; return 'Prime'; },
      fibonacci: () => { let a = 0, b = 1; const out = []; for (let i = 0; i < x[0]; i++) { out.push(a); [a, b] = [b, a + b]; } return out.join(', '); },
      quadratic: () => { const [a, b, c] = x; const d = b ** 2 - 4 * a * c; return d < 0 ? 'No real roots' : `${(-b + Math.sqrt(d)) / (2 * a)}, ${(-b - Math.sqrt(d)) / (2 * a)}`; },
      linear: () => -x[1] / x[0], round: () => Number(x[0].toFixed(x[1])),
      ceil: () => Math.ceil(x[0]), floor: () => Math.floor(x[0]), randomnumber: () => randomInt(Math.ceil(x[0]), Math.floor(x[1])),
      breakeven: () => x[0] / (x[1] - x[2]), roi: () => ((x[1] - x[0]) / x[0]) * 100,
      cagr: () => ((x[1] / x[0]) ** (1 / x[2]) - 1) * 100, doubling: () => 72 / x[0],
    };
    return ops[op]();
  }

  function runGenerator(op, rawValues) {
    const amount = Math.min(100, Math.max(1, Number(rawValues[0]) || 1));
    const alpha = 'abcdefghijklmnopqrstuvwxyz', upper = alpha.toUpperCase(), digits = '0123456789', hex = '0123456789abcdef';
    const ops = {
      pin: () => randomFrom(digits, 4), otp: () => randomFrom(digits, 6), coupon: () => randomFrom(upper + digits, 10),
      token: () => randomFrom(alpha + upper + digits, 32), apikey: () => `kt_${randomFrom(alpha + upper + digits, 40)}`,
      username: () => `${randomFrom(alpha, 6)}${randomInt(10, 999)}`, password: () => randomFrom(alpha + upper + digits + '!@#$%^&*', 16),
      hexcolor: () => `#${randomFrom(hex, 6)}`, rgbcolor: () => `rgb(${randomInt(0,255)}, ${randomInt(0,255)}, ${randomInt(0,255)})`,
      gradient: () => `linear-gradient(135deg, #${randomFrom(hex,6)}, #${randomFrom(hex,6)})`,
      ipv4: () => Array.from({length:4}, () => randomInt(0,255)).join('.'),
      mac: () => Array.from({length:6}, () => randomFrom(hex,2)).join(':'),
      invoice: () => `INV-${new Date().getFullYear()}-${randomFrom(digits,6)}`,
      order: () => `ORD-${randomFrom(upper + digits,12)}`, filename: () => `file-${Date.now()}-${randomFrom(alpha,5)}.txt`,
      lorem: () => 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      sentence: () => ['Build useful tools for real people.','Simple interfaces make everyday work faster.','Private browser processing keeps data local.'][randomInt(0,2)],
      yesno: () => randomInt(0,1) ? 'Yes' : 'No', dice: () => randomInt(1,6), coin: () => randomInt(0,1) ? 'Heads' : 'Tails',
      card: () => Array.from({length:4}, () => randomFrom(digits,4)).join(' '),
      cvv: () => randomFrom(digits,3), date: () => new Date(Date.now() + randomInt(-31536000,31536000)*1000).toISOString().slice(0,10),
      time: () => `${String(randomInt(0,23)).padStart(2,'0')}:${String(randomInt(0,59)).padStart(2,'0')}`,
      emoji: () => ['😀','🚀','✅','💡','🎉','🔧','📌','🌟'][randomInt(0,7)],
      country: () => ['Nepal','India','Japan','Canada','Australia','Brazil','Germany','Kenya'][randomInt(0,7)],
      letter: () => randomFrom(upper,1), number: () => randomInt(0,999999),
      cssshadow: () => `${randomInt(0,20)}px ${randomInt(0,30)}px ${randomInt(10,60)}px rgba(15,23,42,0.${randomInt(1,5)})`,
      borderradius: () => `${randomInt(0,50)}px`, zindex: () => randomInt(1,9999),
    };
    return Array.from({ length: amount }, () => ops[op]()).join('\n');
  }

  async function runDeveloper(op, rawValues) {
    const raw = rawValues[0] || '';
    const second = rawValues[1] || '';
    const encodeBytes = (text) => new TextEncoder().encode(text);
    const toHex = (bytes) => [...bytes].map((b) => b.toString(16).padStart(2,'0')).join('');
    const operations = {
      hexencode: () => toHex(encodeBytes(raw)),
      hexdecode: () => {
        const clean = raw.replace(/\s/g, '');
        if (!clean || clean.length % 2 !== 0 || !/^[0-9a-f]+$/i.test(clean)) {
          throw new Error('Enter valid Base16 hexadecimal byte pairs.');
        }
        return new TextDecoder().decode(Uint8Array.from(clean.match(/.{2}/g), (value) => parseInt(value, 16)));
      },
      binaryencode: () => [...encodeBytes(raw)].map((b) => b.toString(2).padStart(8,'0')).join(' '),
      binarydecode: () => new TextDecoder().decode(Uint8Array.from(raw.trim().split(/\s+/), (v) => parseInt(v,2))),
      asciiencode: () => [...raw].map((c) => c.codePointAt(0)).join(' '),
      asciidecode: () => raw.trim().split(/\s+/).map((n) => String.fromCodePoint(Number(n))).join(''),
      unicodeescape: () => [...raw].map((c) => `\\u{${c.codePointAt(0).toString(16)}}`).join(''),
      jsonescape: () => JSON.stringify(raw).slice(1,-1), jsonunescape: () => JSON.parse(`"${raw.replace(/"/g,'\\"')}"`),
      rot13: () => raw.replace(/[a-z]/gi, (c) => String.fromCharCode(c.charCodeAt(0)+(c.toLowerCase()<'n'?13:-13))),
      caesar: () => raw.replace(/[a-z]/gi, (c) => { const base=c<='Z'?65:97; return String.fromCharCode((c.charCodeAt(0)-base+Number(second||3)+26)%26+base); }),
      urlparse: () => JSON.stringify(Object.fromEntries([...new URL(raw).searchParams, ['origin',new URL(raw).origin], ['pathname',new URL(raw).pathname]]), null, 2),
      queryparse: () => JSON.stringify(Object.fromEntries(new URLSearchParams(raw.replace(/^\?/,''))), null, 2),
      jwtdecode: () => JSON.stringify(JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(raw.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')), c=>c.charCodeAt(0)))), null, 2),
      regexescape: () => raw.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),
      htmlminify: () => raw.replace(/<!--[\s\S]*?-->/g,'').replace(/>\s+</g,'><').trim(),
      cssminify: () => raw.replace(/\/\*[\s\S]*?\*\//g,'').replace(/\s*([{}:;,])\s*/g,'$1').trim(),
      jsminify: () => raw.replace(/\/\*[\s\S]*?\*\//g,'').replace(/^\s*\/\/.*$/gm,'').replace(/\s+/g,' ').trim(),
      emailvalidate: () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw) ? 'Valid email format' : 'Invalid email format',
      urlvalidate: () => { try { new URL(raw); return 'Valid absolute URL'; } catch { return 'Invalid URL'; } },
      ipv4validate: () => /^(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)(?:\.|$)){4}$/.test(raw) ? 'Valid IPv4 address' : 'Invalid IPv4 address',
      uuidvalidate: () => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(raw) ? 'Valid UUID' : 'Invalid UUID',
      base64urlencode: () => btoa(String.fromCharCode(...encodeBytes(raw))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,''),
      base64urldecode: () => new TextDecoder().decode(Uint8Array.from(atob(raw.replace(/-/g,'+').replace(/_/g,'/').padEnd(Math.ceil(raw.length/4)*4,'=')), c=>c.charCodeAt(0))),
      datauri: () => `data:text/plain;charset=utf-8,${encodeURIComponent(raw)}`,
      htmltable: () => `<table>\n${raw.split(/\r?\n/).map((line,i)=>`  <tr>${line.split(',').map(cell=>`<${i?'td':'th'}>${escapeHtml(cell.trim())}</${i?'td':'th'}>`).join('')}</tr>`).join('\n')}\n</table>`,
      markdowntable: () => { const rows=raw.split(/\r?\n/).map(r=>r.split(',').map(v=>v.trim())); return rows.map((r,i)=>`| ${r.join(' | ')} |\n${i===0?`| ${r.map(()=> '---').join(' | ')} |`:''}`).join('\n'); },
      metatags: () => `<title>${escapeHtml(raw)}</title>\n<meta name="description" content="${escapeHtml(second)}">`,
      canonical: () => `<link rel="canonical" href="${escapeHtml(raw)}">`,
      robots: () => `User-agent: *\nAllow: /\nSitemap: ${raw.replace(/\/$/,'')}/sitemap.xml`,
    };
    if (op.startsWith('sha')) {
      const algorithm = op.replace('sha','SHA-');
      return toHex(new Uint8Array(await crypto.subtle.digest(algorithm, encodeBytes(raw))));
    }
    return operations[op]();
  }

  async function execute() {
    try {
      const rawValues = values();
      let result;
      if (config.kind === 'text') result = runText(config.op, rawValues[0] || '');
      if (config.kind === 'converter') result = runConverter(config, rawValues[0]);
      if (config.kind === 'calculation') result = runCalculation(config.op, rawValues);
      if (config.kind === 'generator') result = runGenerator(config.op, rawValues);
      if (config.kind === 'developer') result = await runDeveloper(config.op, rawValues);
      setOutput(result);
    } catch (error) {
      setStatus(error.message || 'Unable to process this input.', true);
    }
  }

  document.getElementById('runTool').addEventListener('click', execute);
  document.getElementById('copyTool').addEventListener('click', async () => {
    if (!output.value) return setStatus('Nothing to copy.', true);
    try { await navigator.clipboard.writeText(output.value); setStatus('Copied to clipboard.'); }
    catch { setStatus('Copy failed. Select and copy the result manually.', true); }
  });
  document.getElementById('clearTool').addEventListener('click', () => {
    inputs.forEach((node) => { node.value = ''; });
    output.value = '';
    setStatus('Cleared.');
  });
})();
