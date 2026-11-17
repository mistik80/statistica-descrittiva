// Costruisce le pagine del sito: node _src/build.mjs (dalla cartella "sito")
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SRC = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(SRC, '..');
const BASE = 'https://mistik80.github.io/statistica-descrittiva/';
const TODAY = '2026-11-17';

const pages = [
  { file: 'index.html', src: 'home.html', key: 'home', cls: 'p-home',
    title: 'Statistica descrittiva spiegata semplice: frequenze, media, mediana, moda e grafici',
    desc: 'Guida semplice e interattiva alla statistica descrittiva: tipi di dati, frequenze, media, mediana, moda e grafici, con esempi pratici, quiz e mini-laboratorio.' },
  { file: 'frequenze.html', src: 'frequenze.html', key: 'a', cls: 'p-a',
    title: 'Frequenze e tipi di dati · Statistica descrittiva spiegata semplice',
    desc: 'Variabili qualitative e quantitative, frequenza assoluta, relativa, percentuale e cumulata, tabella di frequenza e classi, spiegate semplice.' },
  { file: 'indici.html', src: 'indici.html', key: 'b', cls: 'p-b',
    title: 'Media, mediana e moda · Statistica descrittiva spiegata semplice',
    desc: 'Come si calcolano media, mediana e moda, quando usarle e perché la mediana resiste ai valori fuori scala. Con animazioni e calcolatrice.' },
  { file: 'grafici.html', src: 'grafici.html', key: 'c', cls: 'p-c',
    title: 'Quale grafico scegliere · Statistica descrittiva spiegata semplice',
    desc: 'Grafico a barre, istogramma, torta e linee: quando usarli, quando evitarli e gli errori più comuni.' },
  { file: 'riepilogo.html', src: 'riepilogo.html', key: 'r', cls: 'p-r',
    title: 'Riepilogo, quiz e glossario · Statistica descrittiva spiegata semplice',
    desc: 'Tabella riassuntiva, quiz per mettersi alla prova e glossario delle parole chiave della statistica descrittiva.' },
];

const navItems = [
  { key: 'a', href: 'frequenze.html', k: 'A', label: 'Frequenze' },
  { key: 'b', href: 'indici.html', k: 'B', label: 'Media, mediana, moda' },
  { key: 'c', href: 'grafici.html', k: 'C', label: 'Grafici' },
  { key: 'r', href: 'riepilogo.html', k: '✓', label: 'Riepilogo e quiz' },
];

const brand = `<span class="brand-mark" aria-hidden="true"><i></i><i></i><i></i></span>Statistica semplice`;

function page(p, i) {
  const url = BASE + (p.file === 'index.html' ? '' : p.file);
  const nav = navItems.map(n => `<li><a href="${n.href}"${n.key === p.key ? ' aria-current="page"' : ''}><span class="k">${n.k}</span>${n.label}</a></li>`).join('\n        ');
  const prev = i > 0 ? pages[i - 1] : null;
  const next = i < pages.length - 1 ? pages[i + 1] : null;
  const label = q => q.key === 'home' ? 'Home' : navItems.find(n => n.key === q.key).label;
  const pager = p.key === 'home' ? '' : `
<nav class="wrap pager" aria-label="Pagina precedente e successiva">
  ${prev ? `<a class="prev" href="${prev.file === 'index.html' ? './' : prev.file}"><span>← Indietro</span><b>${label(prev)}</b></a>` : ''}
  ${next ? `<a class="next" href="${next.file}"><span>Avanti →</span><b>${label(next)}</b></a>` : ''}
</nav>`;
  const body = fs.readFileSync(path.join(SRC, p.src), 'utf8').trim();
  return `<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${p.title}</title>
<meta name="description" content="${p.desc}">
<meta name="robots" content="index, follow">
<link rel="canonical" href="${url}">
<meta property="og:type" content="website">
<meta property="og:url" content="${url}">
<meta property="og:title" content="${p.title}">
<meta property="og:description" content="${p.desc}">
<meta property="og:locale" content="it_IT">
<meta name="theme-color" content="#2557c7">
<link rel="icon" href="favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,800&family=Source+Sans+3:ital,wght@0,400;0,600;0,700;1,400&family=JetBrains+Mono:wght@400;600&display=swap">
<link rel="stylesheet" href="style.css">
<script>document.documentElement.classList.add('js');</script>
</head>
<body class="${p.cls}">
<div class="progress" aria-hidden="true"></div>
<header class="nav">
  <div class="wrap">
    <a class="brand" href="./">${brand}</a>
    <button class="burger" type="button" aria-label="Apri il menu" aria-expanded="false" aria-controls="menu">☰</button>
    <ul class="nav-links" id="menu">
        ${nav}
    </ul>
  </div>
</header>

${body}
${pager}
<button class="totop" type="button" aria-label="Torna all'inizio">↑</button>
<footer class="site">
  <div class="wrap">
    <div class="stack">
      <a class="brand" href="./">${brand}</a>
      <p>Mini-guida alla statistica descrittiva, scritta come se la spiegassimo a un collega appena arrivato in azienda. Corso IFTS, Modulo di Statistica, lezioni 2, 3 e 4. I dati degli esempi sono inventati.</p>
    </div>
    <div>
      <h3>Sezioni</h3>
      <ul>
        <li><a href="frequenze.html">A · Frequenze</a></li>
        <li><a href="indici.html">B · Media, mediana, moda</a></li>
        <li><a href="grafici.html">C · Grafici</a></li>
      </ul>
    </div>
    <div>
      <h3>Strumenti</h3>
      <ul>
        <li><a href="indici.html#laboratorio">Calcolatrice</a></li>
        <li><a href="riepilogo.html#quiz">Quiz</a></li>
        <li><a href="riepilogo.html#glossario">Glossario</a></li>
      </ul>
    </div>
  </div>
</footer>
<script src="tools.js"></script>
<script src="app.js"></script>
</body>
</html>
`;
}

pages.forEach((p, i) => fs.writeFileSync(path.join(OUT, p.file), page(p, i)));

fs.writeFileSync(path.join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="sitemap.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(p => `  <url>\n    <loc>${BASE}${p.file === 'index.html' ? '' : p.file}</loc>\n    <lastmod>${TODAY}</lastmod>\n  </url>`).join('\n')}
</urlset>
`);

fs.writeFileSync(path.join(OUT, 'favicon.svg'), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="#18202e"/><rect x="7" y="17" width="5" height="9" fill="#fff"/><rect x="13.5" y="7" width="5" height="19" fill="#fff"/><rect x="20" y="12" width="5" height="14" fill="#fff"/></svg>\n`);

console.log('pagine create:', pages.map(p => p.file).join(', '));
