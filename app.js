/* Statistica descrittiva spiegata semplice — script condiviso */
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function fmt(x) { return x.toLocaleString('it-IT', { maximumFractionDigits: 2 }); }

  /* ---------- Menu su telefono ---------- */
  var burger = $('.burger'), links = $('.nav-links');
  if (burger && links) {
    burger.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.textContent = open ? '✕' : '☰';
    });
  }

  /* ---------- Barra di avanzamento e "torna su" ---------- */
  var bar = $('.progress'), top = $('.totop');
  function onScroll() {
    var h = document.documentElement, max = h.scrollHeight - h.clientHeight;
    if (bar) bar.style.transform = 'scaleX(' + (max > 0 ? h.scrollTop / max : 0) + ')';
    if (top) top.classList.toggle('show', h.scrollTop > 700);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  if (top) top.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });

  /* ---------- Comparsa allo scorrimento ---------- */
  var reveal = $$('.rv, .rv-stagger, .chart');
  if (!('IntersectionObserver' in window) || reduce) {
    reveal.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveal.forEach(function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight * 0.95) el.classList.add('in');
      else io.observe(el);
    });
  }
  function replay(scope) {
    $$('.chart', scope).forEach(function (c) {
      c.classList.remove('in'); void c.offsetWidth;
      requestAnimationFrame(function () { c.classList.add('in'); });
    });
  }

  /* ---------- Indice laterale che segue la lettura ---------- */
  var tocLinks = $$('.toc a');
  if (tocLinks.length && 'IntersectionObserver' in window) {
    var map = {};
    tocLinks.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting && map[e.target.id]) {
          tocLinks.forEach(function (a) { a.classList.remove('on'); });
          map[e.target.id].classList.add('on');
        }
      });
    }, { rootMargin: '-35% 0px -60% 0px' });
    Object.keys(map).forEach(function (id) { var el = document.getElementById(id); if (el) spy.observe(el); });
  }

  /* ---------- Schede (tab) ---------- */
  $$('[data-tabs]').forEach(function (box) {
    var btns = $$('[role="tab"]', box);
    function show(btn, focus) {
      btns.forEach(function (b) {
        var on = b === btn;
        b.setAttribute('aria-selected', on ? 'true' : 'false');
        b.tabIndex = on ? 0 : -1;
        var p = document.getElementById(b.getAttribute('aria-controls'));
        if (p) { p.hidden = !on; if (on) replay(p); }
      });
      if (focus) btn.focus();
    }
    btns.forEach(function (b, i) {
      b.addEventListener('click', function () { show(b); });
      b.addEventListener('keydown', function (e) {
        var d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
        if (d) { e.preventDefault(); show(btns[(i + d + btns.length) % btns.length], true); }
      });
    });
  });

  /* ---------- Carte che si girano ---------- */
  $$('.flip').forEach(function (f) {
    f.addEventListener('click', function () {
      f.setAttribute('aria-pressed', f.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
    });
  });

  /* ---------- Interruttori a due posizioni (istogramma giusto / sbagliato) ---------- */
  $$('[data-toggle]').forEach(function (box) {
    var btns = $$('button', box);
    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        btns.forEach(function (x) {
          var on = x === b;
          x.setAttribute('aria-pressed', on ? 'true' : 'false');
          var p = document.getElementById(x.dataset.show);
          if (p) { p.hidden = !on; if (on) replay(p); }
        });
      });
    });
  });

  /* ---------- Costruttore della tabella di frequenza ---------- */
  $$('[data-builder]').forEach(function (box) {
    var steps = [
      'Si parte dalle risposte possibili (modalità).',
      'Colonna n: conti quante volte compare ogni risposta.',
      'Colonna f: dividi ogni n per il totale (20).',
      'Colonna p%: moltiplichi f per 100.',
      'Colonna N: sommi le n riga dopo riga (totale progressivo).',
      'Colonna F: dividi ogni N per il totale. Tabella completa!'
    ];
    var step = 0, txt = $('.step-txt', box), next = $('[data-next]', box), again = $('[data-reset]', box);
    function paint() {
      $$('[data-c]', box).forEach(function (cell) {
        var c = +cell.dataset.c;
        cell.classList.toggle('ghost', c > step);
        cell.classList.toggle('lit', c === step && step > 0);
      });
      txt.textContent = 'Passo ' + (step + 1) + ' di 6 · ' + steps[step];
      next.disabled = step >= 5;
      next.textContent = step >= 5 ? 'Fatto ✓' : 'Colonna successiva →';
    }
    next.addEventListener('click', function () { if (step < 5) { step++; paint(); } });
    again.addEventListener('click', function () { step = 0; paint(); });
    paint();
  });

  /* ---------- Mediana: i numeri si mettono in fila ---------- */
  $$('[data-sorter]').forEach(function (box) {
    var track = $('.track', box), res = $('.res', box), sets = {
      dispari: [24, 30, 26, 24, 120],
      pari: [31, 22, 120, 26, 24, 30]
    };
    var cur = 'dispari', sorted = false, built = null, order = [], sortedOrder = [];
    function render() {
      var vals = sets[cur], n = vals.length, w = 100 / n;
      if (built !== cur) {
        track.innerHTML = '';
        order = vals.map(function (v, i) {
          var el = document.createElement('div');
          el.className = 'tok' + (v >= 100 ? ' far' : '');
          el.textContent = v;
          el.style.width = 'calc(' + w + '% - 8px)';
          track.appendChild(el);
          return { v: v, i: i, el: el };
        });
        sortedOrder = order.slice().sort(function (a, b) { return a.v - b.v || a.i - b.i; });
        built = cur;
      }
      var midA = n % 2 ? (n - 1) / 2 : n / 2 - 1, midB = n % 2 ? midA : n / 2;
      order.forEach(function (o) {
        var pos = sorted ? sortedOrder.indexOf(o) : o.i;
        o.el.style.left = 'calc(' + (pos * w) + '% + 4px)';
        o.el.classList.toggle('mid', sorted && (pos === midA || pos === midB));
      });
      if (!sorted) res.textContent = n + ' numeri, così come arrivano. Premi "Metti in fila".';
      else {
        var s = sortedOrder.map(function (o) { return o.v; });
        res.textContent = n % 2
          ? 'Sono ' + n + ' (dispari): in mezzo c\'è il ' + (n + 1) / 2 + '°. Mediana = ' + fmt(s[(n - 1) / 2]) + ' h'
          : 'Sono ' + n + ' (pari): in mezzo ci sono il ' + n / 2 + '° e il ' + (n / 2 + 1) + '°. Mediana = (' + s[n / 2 - 1] + ' + ' + s[n / 2] + ') / 2 = ' + fmt((s[n / 2 - 1] + s[n / 2]) / 2) + ' h';
      }
    }
    $('[data-sort]', box).addEventListener('click', function () { sorted = !sorted; this.textContent = sorted ? 'Rimescola' : 'Metti in fila'; render(); });
    $$('[data-set]', box).forEach(function (b) {
      b.addEventListener('click', function () {
        cur = b.dataset.set; sorted = false; $('[data-sort]', box).textContent = 'Metti in fila';
        $$('[data-set]', box).forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        render();
      });
    });
    render();
  });

  /* ---------- Mini-laboratorio ---------- */
  var input = $('#lab-in');
  if (input) {
    var out = { n: $('#lab-n'), mean: $('#lab-mean'), med: $('#lab-med'), mode: $('#lab-mode'), sorted: $('#lab-sorted'), msg: $('#lab-msg') };
    var parse = function (s) {
      var toks = s.trim().split(/[;\s]+/).filter(Boolean), vals = [];
      for (var i = 0; i < toks.length; i++) {
        var t = toks[i].replace(/,$/, '').replace(',', '.');
        if (!/^-?\d+(\.\d+)?$/.test(t)) return { error: '"' + toks[i] + '" non è un numero. Separa i numeri con ";" o con uno spazio.' };
        vals.push(parseFloat(t));
      }
      return { vals: vals };
    };
    var reset = function (msg) {
      out.n.textContent = out.mean.textContent = out.med.textContent = out.mode.textContent = '–';
      out.sorted.textContent = ''; out.msg.textContent = msg; out.msg.className = 'err';
    };
    var run = function () {
      var p = parse(input.value);
      if (p.error) return reset(p.error);
      var v = p.vals;
      if (v.length < 2) return reset('Scrivi almeno due numeri.');
      var n = v.length, s = v.slice().sort(function (a, b) { return a - b; });
      var mean = v.reduce(function (a, b) { return a + b; }, 0) / n;
      var med = n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
      var counts = new Map();
      s.forEach(function (x) { counts.set(x, (counts.get(x) || 0) + 1); });
      var max = 0; counts.forEach(function (c) { if (c > max) max = c; });
      var modes = []; counts.forEach(function (c, x) { if (c === max) modes.push(x); });
      var noMode = modes.length === counts.size;
      out.n.textContent = n; out.mean.textContent = fmt(mean); out.med.textContent = fmt(med);
      out.mode.textContent = noMode ? 'nessuna' : modes.map(fmt).join(' e ');
      out.sorted.textContent = 'In fila: ' + s.map(fmt).join(' · ');
      var msg = (!noMode && modes.length === 2) ? 'Ci sono due mode (bimodale). ' : '';
      var range = s[n - 1] - s[0], gap = Math.abs(mean - med);
      if (range === 0) msg += 'Tutti i numeri sono uguali: media, mediana e moda coincidono.';
      else if (gap / range > 0.1) msg += 'Media e mediana distano ' + fmt(gap) + ': qualche valore fuori scala tira la media ' + (mean > med ? 'verso l\'alto' : 'verso il basso') + '. Meglio la mediana.';
      else msg += 'Media e mediana sono vicine: i dati sono equilibrati e la media va bene.';
      out.msg.textContent = msg; out.msg.className = '';
    };
    input.addEventListener('input', run);
    $$('[data-lab]').forEach(function (b) { b.addEventListener('click', function () { input.value = b.dataset.lab; run(); }); });
    run();
    if (!reduce && 'MutationObserver' in window) {
      $$('.out div').forEach(function (box) {
        new MutationObserver(function () { box.classList.remove('flash'); void box.offsetWidth; box.classList.add('flash'); })
          .observe($('b', box), { childList: true, characterData: true, subtree: true });
      });
    }
  }

  /* ---------- Home: "che dati hai?" ---------- */
  var picker = $('[data-picker]');
  if (picker) {
    var data = {
      nom: ['Moda', 'Barre, o torta se ci sono poche fette', 'No'],
      ord: ['Mediana (più la moda)', 'Barre nell\'ordine naturale', 'Sì'],
      dis: ['Media, o mediana se ci sono valori fuori scala', 'Barre staccate', 'Sì'],
      con: ['Media o mediana, più la classe modale', 'Istogramma (linee se è nel tempo)', 'Sì, sulle fasce']
    };
    var outs = $$('.pick-out b', picker), outBox = $('.pick-out', picker);
    $$('[data-pick]', picker).forEach(function (b) {
      b.addEventListener('click', function () {
        $$('[data-pick]', picker).forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        var d = data[b.dataset.pick];
        outs.forEach(function (o, i) { o.textContent = d[i]; });
        outBox.classList.remove('swap'); void outBox.offsetWidth; outBox.classList.add('swap');
      });
    });
  }

  /* ---------- Quiz ---------- */
  var quiz = $('[data-quiz]');
  if (quiz) {
    var qs = $$('.q', quiz), scoreB = $('[data-score]'), total = qs.length;
    var done = 0, right = 0;
    function upd() { scoreB.textContent = right + ' / ' + total; }
    qs.forEach(function (q) {
      var btns = $$('.opts button', q), why = $('.why', q);
      why.hidden = true;
      btns.forEach(function (b) {
        b.addEventListener('click', function () {
          var ok = b.hasAttribute('data-ok');
          btns.forEach(function (x) { x.disabled = true; if (x.hasAttribute('data-ok')) x.classList.add('right'); });
          if (!ok) b.classList.add('wrong'); else right++;
          done++; why.hidden = false;
          why.textContent = (ok ? '✓ Giusto. ' : '✗ Non proprio. ') + why.dataset.why;
          upd();
        });
      });
    });
    $('[data-quiz-reset]').addEventListener('click', function () {
      right = 0; done = 0; upd();
      qs.forEach(function (q) {
        $$('.opts button', q).forEach(function (b) { b.disabled = false; b.classList.remove('right', 'wrong'); });
        $('.why', q).hidden = true;
      });
    });
    upd();
  }

  /* ---------- Glossario con ricerca ---------- */
  var gs = $('#gloss-q');
  if (gs) {
    var items = $$('.gloss > div'), none = $('#gloss-none');
    gs.addEventListener('input', function () {
      var q = gs.value.trim().toLowerCase(), shown = 0;
      items.forEach(function (it) { var m = it.textContent.toLowerCase().indexOf(q) >= 0; it.hidden = !m; if (m) shown++; });
      none.hidden = shown > 0;
    });
  }
})();
