# Balans 5.5 – Livsmedelsverket

## Installera
1. Exportera säkerhetskopia från Balans.
2. Ladda upp appfilerna till GitHub Pages (index.html, service-worker.js m.fl.).
3. **Viktigt:** Ersätt även Cloudflare Worker-koden med denna ZIP-fils `worker.js` och distribuera (Deploy). `worker.js` hör inte hemma som körbar backend på GitHub Pages. Behåll befintliga secrets och variabler i Cloudflare.
4. Öppna Balans, gå till Mat → Sök livsmedel och portionshjälp → Livsmedelsverkets livsmedelsdatabas. Sök t.ex. potatis. Välj livsmedel, visa näringsvärden och lägg till gram.
5. Kontrollera att AI-fotoanalysen fortfarande fungerar.

## Viktigt
- SLV-sökning fungerar endast när den uppdaterade Cloudflare Workern är publicerad och nåbar.
- Livsmedelsverkets data används endast när du väljer en träff. Foto-AI ersätter inte automatiskt sina värden med ett obekräftat matchningsförslag.
- Livsmedelsverkets näringsvärden är per 100 g ätlig del; portionsstorlek är användarens uppskattning.
- Om API:t inte svarar påverkas inte AI-fotoanalysen eller befintlig offline-sökning.
- Datakälla: Livsmedelsverkets Livsmedelsdatabas version 2026-07-01, CC BY 4.0. https://soknaringsinnehall.livsmedelsverket.se/
- Lokal lagringsnyckel `balans_v1` är oförändrad.

