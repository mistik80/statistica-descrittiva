<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:s="http://www.sitemaps.org/schemas/sitemap/0.9">
  <xsl:output method="html" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html lang="it">
      <head>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <meta name="robots" content="noindex"/>
        <meta http-equiv="refresh" content="3; url=./"/>
        <title>Mappa del sito · Statistica descrittiva spiegata semplice</title>
        <style>
          :root { --bg: #f3f5f8; --surface: #ffffff; --ink: #18202e; --muted: #566074; --line: #d6dce6; --accent: #2557c7; }
          @media (prefers-color-scheme: dark) {
            :root { --bg: #11151d; --surface: #181e29; --ink: #e6eaf2; --muted: #9aa4b6; --line: #2c3545; --accent: #7ea2ff; color-scheme: dark; }
          }
          body { margin: 0; background: var(--bg); color: var(--ink); font: 17px/1.6 "Segoe UI", system-ui, sans-serif; }
          main { max-width: 640px; margin: 0 auto; padding: 56px 16px; display: grid; gap: 18px; }
          .eyebrow { font: 12.5px Consolas, monospace; letter-spacing: .08em; text-transform: uppercase; color: var(--muted); }
          h1 { margin: 0; font-size: 30px; line-height: 1.2; }
          p { margin: 0; color: var(--muted); }
          .btn { justify-self: start; background: var(--accent); color: var(--surface); text-decoration: none; font-weight: 700; padding: 12px 20px; border-radius: 999px; }
          ul { margin: 0; padding: 0; list-style: none; background: var(--surface); border: 1px solid var(--line); border-radius: 10px; }
          li { padding: 12px 16px; display: flex; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
          li a { color: var(--accent); overflow-wrap: anywhere; }
          li span { font: 14px Consolas, monospace; color: var(--muted); }
        </style>
      </head>
      <body>
        <main>
          <div class="eyebrow">Mappa del sito</div>
          <h1>Statistica descrittiva spiegata semplice</h1>
          <p>Questa pagina serve ai motori di ricerca come Google per trovare il sito. Tra pochi secondi vieni portato alla guida.</p>
          <a class="btn" href="./">Apri la guida →</a>
          <ul>
            <xsl:for-each select="s:urlset/s:url">
              <li>
                <a href="{s:loc}"><xsl:value-of select="s:loc"/></a>
                <span>aggiornata il <xsl:value-of select="s:lastmod"/></span>
              </li>
            </xsl:for-each>
          </ul>
        </main>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
