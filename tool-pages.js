(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const value = (id) => ($(id)?.value ?? '');
  const setValue = (id, next) => { if ($(id)) $(id).value = next; };
  const setText = (id, next) => { if ($(id)) $(id).textContent = next; };
  const status = (message, error = false) => {
    const node = $('toolStatus');
    if (!node) return;
    node.textContent = message;
    node.classList.toggle('error', error);
  };

  async function copyText(text) {
    if (!text) return status('Nothing to copy.', true);
    try {
      await navigator.clipboard.writeText(text);
      status('Copied to clipboard.');
    } catch {
      status('Copy failed. Select the result and copy it manually.', true);
    }
  }

  document.querySelectorAll('[data-copy]').forEach((button) => {
    button.addEventListener('click', () => copyText(value(button.dataset.copy) || $(button.dataset.copy)?.textContent));
  });

  document.querySelectorAll('[data-clear]').forEach((button) => {
    button.addEventListener('click', () => {
      button.dataset.clear.split(',').forEach((id) => setValue(id.trim(), ''));
      status('Cleared.');
      document.dispatchEvent(new CustomEvent('tool:cleared'));
    });
  });

  const tool = document.body.dataset.tool;

  if (tool === 'base64') {
    const encode = (text) => {
      const bytes = new TextEncoder().encode(text);
      let binary = '';
      bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
      return btoa(binary);
    };
    const decode = (text) => {
      const binary = atob(text.replace(/\s+/g, ''));
      const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
      return new TextDecoder().decode(bytes);
    };
    $('encodeBtn').addEventListener('click', () => {
      try { setValue('outputText', encode(value('inputText'))); status('Text encoded successfully.'); }
      catch { status('Unable to encode this input.', true); }
    });
    $('decodeBtn').addEventListener('click', () => {
      try { setValue('outputText', decode(value('inputText'))); status('Base64 decoded successfully.'); }
      catch { status('Invalid Base64 input.', true); }
    });
  }

  if (tool === 'character-counter') {
    const update = () => {
      const text = value('inputText');
      setText('characters', text.length);
      setText('noSpaces', text.replace(/\s/g, '').length);
      setText('words', (text.trim().match(/\S+/g) || []).length);
      setText('lines', text ? text.split(/\r\n|\r|\n/).length : 0);
    };
    $('inputText').addEventListener('input', update);
    document.addEventListener('tool:cleared', update);
    update();
  }

  if (tool === 'case-converter') {
    const titleCase = (text) => text.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
    const sentenceCase = (text) => text.toLowerCase().replace(/(^\s*\w|[.!?]\s+\w)/g, (match) => match.toUpperCase());
    const apply = (transform) => { setValue('outputText', transform(value('inputText'))); status('Text converted.'); };
    $('upperBtn').addEventListener('click', () => apply((text) => text.toUpperCase()));
    $('lowerBtn').addEventListener('click', () => apply((text) => text.toLowerCase()));
    $('titleBtn').addEventListener('click', () => apply(titleCase));
    $('sentenceBtn').addEventListener('click', () => apply(sentenceCase));
  }

  if (tool === 'duplicate-lines') {
    $('processBtn').addEventListener('click', () => {
      const lines = value('inputText').split(/\r\n|\r|\n/);
      const trim = $('trimLines').checked;
      const caseSensitive = $('caseSensitive').checked;
      const seen = new Set();
      const unique = [];
      lines.forEach((raw) => {
        const line = trim ? raw.trim() : raw;
        const key = caseSensitive ? line : line.toLocaleLowerCase();
        if (!seen.has(key)) { seen.add(key); unique.push(line); }
      });
      setValue('outputText', unique.join('\n'));
      setText('removedCount', Math.max(0, lines.length - unique.length));
      status('Duplicate lines removed.');
    });
  }

  if (tool === 'slug-generator') {
    const makeSlug = () => {
      const separator = value('separator') || '-';
      const slug = value('inputText').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .toLowerCase().trim().replace(/[^a-z0-9]+/g, separator)
        .replace(new RegExp(`\\${separator}+`, 'g'), separator)
        .replace(new RegExp(`^\\${separator}|\\${separator}$`, 'g'), '');
      setValue('outputText', slug);
      status('SEO-friendly slug generated.');
    };
    $('generateBtn').addEventListener('click', makeSlug);
    $('inputText').addEventListener('input', makeSlug);
  }

  if (tool === 'json-formatter') {
    const parse = () => JSON.parse(value('inputText'));
    $('formatBtn').addEventListener('click', () => {
      try { setValue('outputText', JSON.stringify(parse(), null, Number(value('indent')))); status('Valid JSON formatted successfully.'); }
      catch (error) { status(`Invalid JSON: ${error.message}`, true); }
    });
    $('minifyBtn').addEventListener('click', () => {
      try { setValue('outputText', JSON.stringify(parse())); status('Valid JSON minified successfully.'); }
      catch (error) { status(`Invalid JSON: ${error.message}`, true); }
    });
    $('validateBtn').addEventListener('click', () => {
      try { parse(); status('Valid JSON.'); }
      catch (error) { status(`Invalid JSON: ${error.message}`, true); }
    });
  }

  if (tool === 'uuid-generator') {
    const uuid = () => crypto.randomUUID ? crypto.randomUUID() :
      'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
        const random = crypto.getRandomValues(new Uint8Array(1))[0] & 15;
        return (char === 'x' ? random : (random & 3) | 8).toString(16);
      });
    const generate = () => {
      const count = Math.min(20, Math.max(1, Number(value('quantity')) || 1));
      setValue('outputText', Array.from({ length: count }, uuid).join('\n'));
      status(`${count} UUID${count === 1 ? '' : 's'} generated locally.`);
    };
    $('generateBtn').addEventListener('click', generate);
    generate();
  }

  if (tool === 'timestamp-converter') {
    $('nowBtn').addEventListener('click', () => {
      setValue('timestampInput', Math.floor(Date.now() / 1000));
      status('Current Unix timestamp inserted.');
    });
    $('toDateBtn').addEventListener('click', () => {
      const raw = Number(value('timestampInput'));
      const milliseconds = raw > 9999999999 ? raw : raw * 1000;
      const date = new Date(milliseconds);
      if (Number.isNaN(date.getTime())) return status('Enter a valid Unix timestamp.', true);
      setText('resultText', `${date.toLocaleString()} | UTC: ${date.toUTCString()} | ISO: ${date.toISOString()}`);
      status('Timestamp converted.');
    });
    $('toTimestampBtn').addEventListener('click', () => {
      const date = new Date(value('dateInput'));
      if (Number.isNaN(date.getTime())) return status('Choose a valid date and time.', true);
      setText('resultText', `Seconds: ${Math.floor(date.getTime() / 1000)} | Milliseconds: ${date.getTime()}`);
      status('Date converted.');
    });
  }

  if (tool === 'percentage-calculator') {
    $('ofBtn').addEventListener('click', () => {
      const percent = Number(value('percentInput'));
      const number = Number(value('numberInput'));
      if (!Number.isFinite(percent) || !Number.isFinite(number)) return status('Enter valid numbers.', true);
      setText('resultText', `${percent}% of ${number} = ${(percent / 100) * number}`);
      status('Percentage calculated.');
    });
    $('ratioBtn').addEventListener('click', () => {
      const part = Number(value('partInput'));
      const whole = Number(value('wholeInput'));
      if (!Number.isFinite(part) || !Number.isFinite(whole) || whole === 0) return status('Enter valid numbers; the whole cannot be zero.', true);
      setText('ratioResult', `${part} is ${((part / whole) * 100).toFixed(2)}% of ${whole}`);
      status('Percentage ratio calculated.');
    });
  }

  if (tool === 'word-frequency') {
    const analyze = () => {
      const words = (value('inputText').toLocaleLowerCase().match(/[\p{L}\p{N}'-]+/gu) || []);
      const counts = new Map();
      words.forEach((word) => counts.set(word, (counts.get(word) || 0) + 1));
      const rows = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 50);
      $('frequencyBody').innerHTML = rows.map(([word, count]) => `<tr><td>${word.replace(/[&<>"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[char]))}</td><td>${count}</td><td>${words.length ? ((count / words.length) * 100).toFixed(2) : '0.00'}%</td></tr>`).join('');
      setText('totalWords', words.length);
      setText('uniqueWords', counts.size);
      status('Word frequency analyzed.');
    };
    $('analyzeBtn').addEventListener('click', analyze);
    $('inputText').addEventListener('input', analyze);
    analyze();
  }
})();
