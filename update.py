from pathlib import Path
p=Path('/mnt/data/balans562/index.html')
s=p.read_text()
start=s.index('<div class="mode-panel56" data-panel56="photo">')
end=s.index('<div class="mode-panel56" data-panel56="search"',start)
new='''<div class="mode-panel56" data-panel56="photo"><section class="photo-flow compact-photo562" aria-label="Analysera måltidsfoto"><div class="compact-photo-head562"><strong>📷 Analysera måltid med AI</strong><p class="muted">Välj ett foto och granska AI:s näringsförslag.</p></div><input accept="image/*" capture="environment" id="photoInput4" type="file" aria-label="Välj måltidsfoto"/><div id="photoPreview4" class="compact-preview562"></div><label class="compact-consent562"><input id="photoConsent5" type="checkbox"/> <span>Jag godkänner att fotot skickas till AI-tjänsten</span></label><button class="btn compact-analyze562" id="analyzePhoto5" type="button">✨ Analysera foto</button><p aria-live="polite" class="muted" id="photoResult5"></p><details class="photo-archive53"><summary>Fler fotoalternativ</summary><button class="btn secondary" id="savePhoto4" type="button">Spara foto med datum</button><div id="photoGallery4"></div><p class="small muted">Foton ingår inte i JSON-säkerhetskopian. De kan raderas om webbplatsdata rensas.</p></details></section></div>'''
s=s[:start]+new+s[end:]
style='''<style>/* Balans 5.6.2: compact photo-first registration, no change to data/AI logic */
#food .compact-photo562{padding:15px!important;margin-bottom:8px!important;border-radius:20px!important}
#food .compact-photo-head562 strong{font-size:18px!important;line-height:1.25;display:block}
#food .compact-photo-head562 p{font-size:13px!important;line-height:1.35!important;margin:3px 0 12px!important}
#food .compact-photo562 input[type=file]{padding:10px!important;border-radius:12px!important;font-size:13px!important;min-height:52px;background:#eef5ee}
#food .compact-preview562:empty{display:none}
#food .compact-preview562:not(:empty){margin-top:8px}
#food .compact-preview562 img{max-height:160px!important;object-fit:cover}
#food .compact-consent562{display:flex;align-items:center;gap:9px;margin:12px 0 9px;font-size:13px;line-height:1.3;font-weight:600}
#food .compact-consent562 input{width:19px!important;height:19px;flex:0 0 19px;margin:0}
#food .compact-analyze562{width:100%;min-height:44px!important;padding:10px!important;font-size:15px!important}
#food .compact-photo562 #photoResult5:empty{display:none}
#food .compact-photo562 #photoResult5{margin:8px 0!important;font-size:13px}
#food .compact-photo562 .photo-archive53{margin-top:10px;padding-top:9px}
#food .compact-photo562 .photo-archive53 summary{font-size:12px}
#food .food-modes56{margin:5px 0 10px!important}
#food>.section-title{margin-bottom:8px!important}
</style>'''
s=s.replace('</head>',style+'</head>',1)
p.write_text(s)
sw=Path('/mnt/data/balans562/service-worker.js');sw.write_text(sw.read_text().replace('balans-offline-v5-6-1-kompakt','balans-offline-v5-6-2-kompakt'))
Path('/mnt/data/balans562/README-5.6.2.md').write_text('''# Balans 5.6.2 – kompakt Mat-sida\n\n- Sammanfogar fotoval och AI-analys i ett enda kompakt kort.\n- Kortare rubriker och mindre mellanrum; bibehåller fotoalternativ i utfällbar sektion.\n- Behåller AI-samtycke, analysknapp, förhandsvisning, sökning, manuell registrering och AI-granskning.\n- Lokal lagring (`balans_v1`) och Cloudflare Worker-kod är oförändrade.\n- Service worker-cache uppdaterad för att hämta nya appversionen.\n\n## Installera\n1. Exportera en säkerhetskopia i Balans.\n2. Ladda upp `index.html`, `service-worker.js` och övriga filer till GitHub-repots rot (ersätt befintliga).\n3. Vänta på grön GitHub Pages-publicering. Öppna Balans igen och kontrollera Mat.\n4. Ingen ändring krävs i Cloudflare Worker.\n''')
