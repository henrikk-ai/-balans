# Balans 5.6.2 – kompakt Mat-sida

- Sammanfogar fotoval och AI-analys i ett enda kompakt kort.
- Kortare rubriker och mindre mellanrum; bibehåller fotoalternativ i utfällbar sektion.
- Behåller AI-samtycke, analysknapp, förhandsvisning, sökning, manuell registrering och AI-granskning.
- Lokal lagring (`balans_v1`) och Cloudflare Worker-kod är oförändrade.
- Service worker-cache uppdaterad för att hämta nya appversionen.

## Installera
1. Exportera en säkerhetskopia i Balans.
2. Ladda upp `index.html`, `service-worker.js` och övriga filer till GitHub-repots rot (ersätt befintliga).
3. Vänta på grön GitHub Pages-publicering. Öppna Balans igen och kontrollera Mat.
4. Ingen ändring krävs i Cloudflare Worker.
