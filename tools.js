/* Statistica descrittiva spiegata semplice — strumenti "prova con i tuoi dati" */
(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function fmt(x, d) { return x.toLocaleString('it-IT', { maximumFractionDigits: d == null ? 2 : d }); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function cut(s, n) { s = String(s); return s.length > n ? s.slice(0, Math.max(1, n - 1)) + '…' : s; }
  var NUM = /^-?\d+([.,]\d+)?$/;
  function toNum(t) { return parseFloat(String(t).replace(',', '.')); }

  /* Divide il testo in voci: separatori ";", a capo, ", " (virgola + spazio); i numeri si possono separare anche con spazi */
  function tokenize(text) {
    var out = [];
    String(text).split(/[;\n]+|,\s+/).forEach(function (t) {
      t = t.trim().replace(/,$/, '').trim();
      if (!t) return;
      if (/^[-\d\s.,]+$/.test(t) && /\s/.test(t)) t.split(/\s+/).forEach(function (x) { if (x) tokenize(x).forEach(function (y) { out.push(y); }); });
      else if (t.indexOf(',') >= 0 && !NUM.test(t)) t.split(',').forEach(function (x) { x = x.trim(); if (x) out.push(x); });
      else out.push(t);
    });
    return out;
  }

  function replay(fig) {
    if (!fig) return;
    fig.classList.remove('in'); void fig.offsetWidth;
    requestAnimationFrame(function () { requestAnimationFrame(function () { fig.classList.add('in'); }); });
  }

  /* ---------- Geometria comune dei grafici ---------- */
  var W = 400, H = 240, L = 46, R = 388, T = 20, B = 194;
  function niceStep(raw) {
    if (!(raw > 0)) return 1;
    var p = Math.pow(10, Math.floor(Math.log10(raw))), m = raw / p;
    return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 2.5 ? 2.5 : m <= 5 ? 5 : 10) * p;
  }
  function yAxis(max) {
    if (!(max > 0)) max = 1;
    var step = niceStep(max / 4), top = Math.ceil(max / step - 1e-9) * step, ticks = [];
    for (var v = 0; v <= top + step / 1000; v += step) ticks.push(+v.toFixed(10));
    return { top: top, ticks: ticks, y: function (v) { return B - (v / top) * (B - T); } };
  }
  function gridSvg(ax) {
    return ax.ticks.map(function (t) {
      var y = ax.y(t).toFixed(2);
      return (t > 0 ? '<line class="gl" x1="' + L + '" y1="' + y + '" x2="' + R + '" y2="' + y + '"/>' : '') +
        '<text x="' + (L - 7) + '" y="' + (+y + 4) + '" text-anchor="end">' + fmt(t) + '</text>';
    }).join('');
  }
  function svgWrap(inner, label, h) {
    return '<svg viewBox="0 0 ' + W + ' ' + (h || H) + '" role="img" aria-label="' + esc(label) + '">' + inner + '</svg>';
  }

  /* Barre staccate (o attaccate per l'istogramma) */
  function barsSvg(labels, vals, o) {
    o = o || {};
    var n = vals.length, ax = yAxis(Math.max.apply(null, vals)), slot = (R - L) / n;
    var bw = o.contig ? slot : Math.min(slot * 0.62, 58), s = gridSvg(ax), maxc = Math.max(2, Math.floor(slot / 6.4));
    vals.forEach(function (v, i) {
      var x = L + i * slot + (slot - bw) / 2, y = ax.y(v), h = B - y;
      s += '<rect class="' + (o.cls || 'b1') + (o.contig ? ' slice' : '') + '" x="' + x.toFixed(2) + '" y="' + y.toFixed(2) + '" width="' + bw.toFixed(2) + '" height="' + Math.max(h, 0).toFixed(2) + '"' + (o.contig ? '' : ' rx="3"') + '/>';
      if (n <= 16) s += '<text class="val" x="' + (x + bw / 2).toFixed(2) + '" y="' + (y - 5).toFixed(2) + '" text-anchor="middle">' + fmt(v) + '</text>';
    });
    if (o.edges) {
      var every = Math.ceil((o.edges.length) / 9);
      o.edges.forEach(function (e, i) {
        if (i % every && i !== o.edges.length - 1) return;
        s += '<text x="' + (L + i * slot).toFixed(2) + '" y="' + (B + 16) + '" text-anchor="middle">' + esc(fmt(e)) + '</text>';
      });
    } else {
      var skip = n > 14 ? Math.ceil(n / 14) : 1;
      labels.forEach(function (l, i) {
        if (i % skip) return;
        s += '<text x="' + (L + i * slot + slot / 2).toFixed(2) + '" y="' + (B + 16) + '" text-anchor="middle">' + esc(cut(l, maxc)) + '</text>';
      });
    }
    if (o.xTitle) s += '<text x="' + ((L + R) / 2) + '" y="' + (H - 6) + '" text-anchor="middle">' + esc(o.xTitle) + '</text>';
    s += '<line class="axis" x1="' + L + '" y1="' + B + '" x2="' + R + '" y2="' + B + '"/>';
    return svgWrap(s, o.label || 'Grafico');
  }

  /* Linee (serie storica) */
  function lineSvg(labels, vals, label) {
    var n = vals.length, ax = yAxis(Math.max.apply(null, vals)), s = gridSvg(ax), pad = 14;
    var x = function (i) { return n === 1 ? (L + R) / 2 : L + pad + i * (R - L - 2 * pad) / (n - 1); };
    var pts = vals.map(function (v, i) { return x(i).toFixed(2) + ',' + ax.y(v).toFixed(2); });
    s += '<polyline class="ln" pathLength="600" points="' + pts.join(' ') + '"/>';
    var skip = n > 12 ? Math.ceil(n / 12) : 1, maxc = Math.max(3, Math.floor((R - L) / Math.max(n, 1) / 6.4));
    vals.forEach(function (v, i) {
      s += '<circle class="pt" cx="' + x(i).toFixed(2) + '" cy="' + ax.y(v).toFixed(2) + '" r="4.5"/>';
      if (n <= 14) s += '<text class="val" x="' + x(i).toFixed(2) + '" y="' + (ax.y(v) - 9).toFixed(2) + '" text-anchor="middle">' + fmt(v) + '</text>';
      if (!(i % skip)) s += '<text x="' + x(i).toFixed(2) + '" y="' + (B + 16) + '" text-anchor="middle">' + esc(cut(labels[i], maxc)) + '</text>';
    });
    s += '<line class="axis" x1="' + L + '" y1="' + B + '" x2="' + R + '" y2="' + B + '"/>';
    return svgWrap(s, label || 'Grafico a linee');
  }

  /* Torta */
  var PIE = ['b1', 'b2', 'b3', 'b4', 'b5', 'b6'];
  function pieSvg(vals, label) {
    var tot = vals.reduce(function (a, b) { return a + b; }, 0), cx = 110, cy = 110, r = 92, a0 = 0, s = '';
    var nz = vals.filter(function (v) { return v > 0; }).length;
    vals.forEach(function (v, i) {
      if (v <= 0) return;
      var cls = PIE[i % PIE.length];
      if (nz === 1) { s += '<circle class="slice ' + cls + '" cx="' + cx + '" cy="' + cy + '" r="' + r + '"/>'; return; }
      var a1 = a0 + v / tot * 360;
      var p = function (a) { var t = a * Math.PI / 180; return (cx + r * Math.sin(t)).toFixed(2) + ',' + (cy - r * Math.cos(t)).toFixed(2); };
      s += '<path class="slice ' + cls + '" d="M' + cx + ',' + cy + ' L' + p(a0) + ' A' + r + ',' + r + ' 0 ' + (a1 - a0 > 180 ? 1 : 0) + ' 1 ' + p(a1) + ' Z"/>';
      a0 = a1;
    });
    return '<svg viewBox="0 0 220 220" role="img" aria-label="' + esc(label || 'Grafico a torta') + '">' + s + '</svg>';
  }
  function pieLegend(labels, vals) {
    var tot = vals.reduce(function (a, b) { return a + b; }, 0);
    return labels.map(function (l, i) {
      return '<div><i class="sw ' + PIE[i % PIE.length] + '"></i>' + esc(cut(l, 22)) + '<span class="n" title="' + fmt(vals[i] / tot * 360, 0) + '°">' + fmt(vals[i] / tot * 100, 1) + '%</span></div>';
    }).join('');
  }

  /* Punti su una retta con media, mediana e moda */
  function dotSvg(vals, mean, med, modes) {
    var min = Math.min.apply(null, vals), max = Math.max.apply(null, vals);
    if (min === max) { min -= 1; max += 1; }
    var step = niceStep((max - min) / 5), lo = Math.floor(min / step) * step, hi = Math.ceil(max / step) * step;
    var DL = 30, DR = 380, AX = 120, x = function (v) { return DL + (v - lo) / (hi - lo) * (DR - DL); };
    var s = '<line class="axis" x1="' + DL + '" y1="' + AX + '" x2="' + DR + '" y2="' + AX + '"/>';
    for (var t = lo; t <= hi + step / 1000; t += step) {
      var tx = x(t).toFixed(2);
      s += '<line class="gl" x1="' + tx + '" y1="' + AX + '" x2="' + tx + '" y2="' + (AX + 5) + '"/><text x="' + tx + '" y="' + (AX + 19) + '" text-anchor="middle">' + fmt(+t.toFixed(10)) + '</text>';
    }
    var count = {}, maxStack = 0;
    vals.forEach(function (v) { count[v] = (count[v] || 0) + 1; if (count[v] > maxStack) maxStack = count[v]; });
    var gap = Math.min(13, 70 / Math.max(maxStack, 1)), rr = Math.min(6, gap / 2 + 0.5), seen = {};
    vals.slice().sort(function (a, b) { return a - b; }).forEach(function (v) {
      seen[v] = (seen[v] || 0) + 1;
      var isMode = modes.indexOf(v) >= 0;
      s += '<circle class="pt' + (isMode ? ' ptm' : '') + '" cx="' + x(v).toFixed(2) + '" cy="' + (AX - 8 - (seen[v] - 1) * gap).toFixed(2) + '" r="' + rr.toFixed(1) + '"/>';
    });
    var xm = x(mean), xd = x(med), meanRight = xm >= xd;
    s += '<line class="medl" x1="' + xd.toFixed(2) + '" y1="26" x2="' + xd.toFixed(2) + '" y2="' + AX + '"/>';
    s += '<line class="meanl" x1="' + xm.toFixed(2) + '" y1="26" x2="' + xm.toFixed(2) + '" y2="' + AX + '"/>';
    s += '<text class="t-med" x="' + (xd + (meanRight ? -5 : 5)).toFixed(2) + '" y="18" text-anchor="' + (meanRight ? 'end' : 'start') + '">mediana ' + fmt(med) + '</text>';
    s += '<text class="t-mean" x="' + (xm + (meanRight ? 5 : -5)).toFixed(2) + '" y="18" text-anchor="' + (meanRight ? 'start' : 'end') + '">media ' + fmt(mean) + '</text>';
    return '<svg viewBox="0 0 400 150" role="img" aria-label="I tuoi numeri su una retta, con media ' + fmt(mean) + ' e mediana ' + fmt(med) + '">' + s + '</svg>';
  }
  window.StatCharts = { dotSvg: dotSvg, replay: replay };

  /* ========== Strumento A: tabella di frequenza e grafico a barre ========== */
  var fa = $('[data-tool="freq"]');
  if (fa) {
    var inA = $('#fa-in', fa), ordA = $('#fa-ord', fa), figA = $('figure', fa), chartA = $('[data-chart]', fa);
    var bodyA = $('tbody', fa), typeA = $('[data-type]', fa), noteA = $('[data-note]', fa), cumHead = $$('.cum', fa);
    var runA = function (anim) {
      var toks = tokenize(inA.value);
      if (!toks.length) { typeA.textContent = 'Scrivi almeno una risposta.'; chartA.innerHTML = ''; bodyA.innerHTML = ''; noteA.textContent = ''; return; }
      var allNum = toks.every(function (t) { return NUM.test(t); });
      var cats = [], counts = {}, shown = {}, ordered = false, type = '', err = '';
      if (allNum) {
        toks.forEach(function (t) { var v = toNum(t); counts[v] = (counts[v] || 0) + 1; });
        cats = Object.keys(counts).map(Number).sort(function (a, b) { return a - b; });
        cats.forEach(function (c) { shown[c] = fmt(c); });
        ordered = true;
        var ints = cats.every(function (c) { return Number.isInteger(c); });
        type = ints ? 'Numeri che si contano → variabile quantitativa discreta. Le risposte sono in ordine dal più piccolo al più grande.'
                    : 'Numeri con la virgola → variabile quantitativa continua. Con tanti valori diversi conviene dividerli in fasce (vedi Sezione C).';
      } else {
        toks.forEach(function (t) { var k = t.toLowerCase(); counts[k] = (counts[k] || 0) + 1; if (!shown[k]) shown[k] = t; });
        var ord = tokenize(ordA.value);
        if (ord.length) {
          var keys = ord.map(function (o) { return o.toLowerCase(); });
          var missing = Object.keys(counts).filter(function (k) { return keys.indexOf(k) < 0; });
          if (missing.length) err = 'Queste risposte non sono nell\'ordine che hai scritto: ' + missing.map(function (m) { return '"' + shown[m] + '"'; }).join(', ') + '. Aggiungile all\'ordine oppure svuota il campo.';
          else {
            cats = keys.filter(function (k, i) { return keys.indexOf(k) === i; });
            ord.forEach(function (o) { var k = o.toLowerCase(); if (!shown[k]) shown[k] = o; if (!counts[k]) counts[k] = 0; });
            ordered = true;
            type = 'Parole con un ordine → variabile qualitativa ordinale. Le righe seguono l\'ordine che hai scritto.';
          }
        }
        if (!ordered && !err) {
          cats = Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a]; });
          type = 'Parole senza un ordine → variabile qualitativa nominale. Le righe sono dalla più frequente alla meno frequente.';
        }
      }
      if (err) { typeA.textContent = err; typeA.className = 'tool-type err'; chartA.innerHTML = ''; bodyA.innerHTML = ''; noteA.textContent = ''; return; }
      typeA.className = 'tool-type';
      var N = toks.length, cum = 0, rows = '', medTxt = '';
      cats.forEach(function (c, i) {
        var n = counts[c], f = n / N; cum += n; var F = cum / N;
        if (ordered && !medTxt && F >= 0.5 - 1e-9) {
          if (Math.abs(F - 0.5) < 1e-9 && allNum && i < cats.length - 1) medTxt = fmt((c + cats[i + 1]) / 2);
          else medTxt = shown[c];
        }
        rows += '<tr><td>' + esc(shown[c]) + '</td><td class="n">' + n + '</td><td class="n">' + fmt(f, 2) + '</td><td class="n">' + fmt(f * 100, 1) + '%</td>' +
          (ordered ? '<td class="n">' + cum + '</td><td class="n">' + fmt(F, 2) + '</td>' : '<td class="n">–</td><td class="n">–</td>') + '</tr>';
      });
      rows += '<tr class="tot"><td>Totale</td><td class="n">' + N + '</td><td class="n">1</td><td class="n">100%</td><td class="n">–</td><td class="n">–</td></tr>';
      bodyA.innerHTML = rows;
      cumHead.forEach(function (h) { h.classList.toggle('muted', !ordered); });
      typeA.textContent = type;
      var vals = cats.map(function (c) { return counts[c]; }), mx = Math.max.apply(null, vals);
      var modes = cats.filter(function (c) { return counts[c] === mx; });
      var modeTxt = modes.length === cats.length && cats.length > 1 ? 'nessuna (tutte compaiono lo stesso numero di volte)' : modes.map(function (m) { return shown[m]; }).join(' e ');
      noteA.innerHTML = '<b>Moda:</b> ' + esc(modeTxt) + (ordered ? ' · <b>Mediana:</b> ' + esc(medTxt) : ' · <b>Mediana:</b> non si calcola (le risposte non hanno un ordine)') +
        (ordered ? '' : ' · <b>Cumulate:</b> non hanno senso senza un ordine');
      chartA.innerHTML = barsSvg(cats.map(function (c) { return shown[c]; }), vals, { cls: 'b2', label: 'Grafico a barre delle frequenze assolute', xTitle: 'frequenza assoluta di ogni risposta' });
      if (anim) replay(figA);
    };
    inA.addEventListener('input', function () { runA(false); }); ordA.addEventListener('input', function () { runA(false); });
    $$('[data-ex-a]', fa).forEach(function (b) {
      b.addEventListener('click', function () { var d = b.dataset.exA.split('|'); inA.value = d[0]; ordA.value = d[1] || ''; runA(true); });
    });
    runA(false);
  }

  /* ========== Strumento C: disegna il tuo grafico ========== */
  var fc = $('[data-tool="chart"]');
  if (fc) {
    var inC = $('#fc-in', fc), wC = $('#fc-w', fc), wRow = $('[data-wrow]', fc), hintC = $('[data-hint]', fc);
    var figC = $('figure', fc), chartC = $('[data-chart]', fc), legC = $('[data-legend]', fc), noteC = $('[data-note]', fc), kind = 'bar';
    var hints = {
      bar: 'Una riga per ogni risposta, con il suo valore. Esempio: <span class="mono">Carta: 9</span>',
      pie: 'Una riga per ogni fetta, con il suo valore. Esempio: <span class="mono">PayPal: 6</span>',
      line: 'Una riga per ogni periodo, in ordine di tempo. Esempio: <span class="mono">gen: 120</span>',
      hist: 'Scrivi le misure una per una (separate da ";" o spazio). Il sito le divide in fasce larghe uguali.'
    };
    var parsePairs = function (text) {
      var lines = String(text).split(/[;\n]+/), labels = [], vals = [], bad = [];
      lines.forEach(function (ln) {
        ln = ln.trim(); if (!ln) return;
        var m = ln.match(/^(.*?)[\s:=]+(-?\d+(?:[.,]\d+)?)$/);
        if (!m || !m[1].trim()) { bad.push(ln); return; }
        labels.push(m[1].trim().replace(/[:=]$/, '').trim()); vals.push(toNum(m[2]));
      });
      return { labels: labels, vals: vals, bad: bad };
    };
    var runC = function (anim) {
      wRow.hidden = kind !== 'hist';
      hintC.innerHTML = hints[kind];
      legC.innerHTML = ''; legC.hidden = kind !== 'pie';
      var notes = [];
      if (kind === 'hist') {
        var toks = tokenize(inC.value), nums = [], badN = [];
        toks.forEach(function (t) { if (NUM.test(t)) nums.push(toNum(t)); else badN.push(t); });
        if (badN.length) notes.push('Ho ignorato ' + badN.length + ' voci che non sono numeri.');
        if (nums.length < 2) { chartC.innerHTML = ''; noteC.textContent = 'Scrivi almeno due misure.'; return; }
        var mn = Math.min.apply(null, nums), mxv = Math.max.apply(null, nums);
        var w = toNum(wC.value);
        if (!(w > 0)) { w = niceStep((mxv - mn) / 5 || 1); wC.placeholder = fmt(w); }
        var start = Math.floor(mn / w) * w, k = Math.floor((mxv - start) / w) + 1;
        if (k > 30) { chartC.innerHTML = ''; noteC.textContent = 'Con questa larghezza verrebbero ' + k + ' fasce: troppe. Prova con una larghezza più grande.'; return; }
        var cnt = []; for (var i = 0; i < k; i++) cnt.push(0);
        nums.forEach(function (v) { cnt[Math.min(k - 1, Math.floor((v - start) / w + 1e-9))]++; });
        var edges = []; for (var j = 0; j <= k; j++) edges.push(+(start + j * w).toFixed(10));
        chartC.innerHTML = barsSvg(edges.slice(0, -1), cnt, { contig: true, cls: 'b2', edges: edges, label: 'Istogramma delle misure', xTitle: 'fasce larghe ' + fmt(w) + ' · altezza = numero di dati' });
        var top = cnt.indexOf(Math.max.apply(null, cnt));
        notes.unshift(nums.length + ' misure divise in ' + k + ' fasce larghe ' + fmt(w) + '. Classe modale: [' + fmt(edges[top]) + ', ' + fmt(edges[top + 1]) + ').');
        notes.push('Le fasce sono tutte larghe uguali, quindi l\'altezza può essere direttamente il numero di dati.');
      } else {
        var p = parsePairs(inC.value);
        if (p.bad.length) notes.push('Non ho capito ' + p.bad.length + (p.bad.length === 1 ? ' riga' : ' righe') + ' (es. "' + cut(p.bad[0], 20) + '"): scrivi "etichetta: numero".');
        if (!p.vals.length) { chartC.innerHTML = ''; noteC.textContent = notes.join(' ') || 'Scrivi almeno una riga.'; return; }
        if (p.vals.some(function (v) { return v < 0; }) && kind !== 'line') { chartC.innerHTML = ''; noteC.textContent = 'Per barre e torta servono valori positivi (sono frequenze).'; return; }
        if (kind === 'bar') {
          chartC.innerHTML = barsSvg(p.labels, p.vals, { cls: 'b1', label: 'Grafico a barre' });
          notes.unshift('Barre staccate: una per ogni risposta. Più alta la barra, più volte compare.');
        } else if (kind === 'pie') {
          var tot = p.vals.reduce(function (a, b) { return a + b; }, 0);
          if (!(tot > 0)) { chartC.innerHTML = ''; noteC.textContent = 'Il totale deve essere più di zero.'; return; }
          chartC.innerHTML = '<div class="pie">' + pieSvg(p.vals, 'Grafico a torta') + '<div class="legend" data-legend-in></div></div>';
          $('[data-legend-in]', chartC).innerHTML = pieLegend(p.labels, p.vals);
          notes.unshift('Ogni fetta ha angolo = f × 360°. Totale: ' + fmt(tot) + ' = 100%.');
          if (p.vals.length > 6) notes.push('⚠ Hai ' + p.vals.length + ' fette: la torta diventa difficile da leggere. Meglio un grafico a barre.');
        } else {
          chartC.innerHTML = lineSvg(p.labels, p.vals, 'Grafico a linee');
          notes.unshift('Punti uniti da una linea: va bene solo se le etichette sono periodi di tempo, in ordine.');
          if (p.vals.length < 3) notes.push('Con meno di 3 periodi la linea dice poco.');
        }
      }
      noteC.textContent = notes.join(' ');
      if (anim) replay(figC);
    };
    var kindBtns = $$('[data-kind]', fc);
    function setKind(k) { kind = k; kindBtns.forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.kind === k ? 'true' : 'false'); }); }
    kindBtns.forEach(function (b) { b.addEventListener('click', function () { setKind(b.dataset.kind); runC(true); }); });
    inC.addEventListener('input', function () { runC(false); }); wC.addEventListener('input', function () { runC(false); });
    $$('[data-ex-c]', fc).forEach(function (b) {
      b.addEventListener('click', function () { var d = b.dataset.exC.split('|'); setKind(d[0]); inC.value = d[1].replace(/\\n/g, '\n'); wC.value = d[2] || ''; runC(true); });
    });
    runC(false);
  }
})();
