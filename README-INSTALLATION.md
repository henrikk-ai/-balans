# Balans 5.0 – installation

## Viktigt före uppdatering
1. Öppna installerade Balans 4.0 på iPhone och exportera en ny JSON-säkerhetskopia.
2. Spara den i Filer. Radera inte appen eller webbplatsdata.
3. Måltidsfoton i IndexedDB ingår **inte** i JSON-exporten. Spara viktiga foton separat.

## GitHub Pages
Ladda upp **endast filerna i rotmappen** i detta paket (`index.html`, `manifest.webmanifest`, `service-worker.js`, `icon-*.png`) till `https://github.com/henrikk-ai/-balans` i projektets rot. Lägg **inte** upp mappen `cloudflare-worker`, API-nycklar, familjekoder eller hälsodata i GitHub. Behåll samma GitHub Pages-adress `https://henrikk-ai.github.io/-balans/`.

## AI-server (Cloudflare Worker)
Cloudflare Workers är en separat tjänst. Skapa ett konto på https://dash.cloudflare.com/ och en Worker som heter t.ex. `balans-ai`. Kopiera innehållet i `cloudflare-worker/worker.js` till Worker-koden (eller publicera med Wrangler). I Worker-inställningar under **Settings > Variables and Secrets**:
- `OPENAI_API_KEY` som **Secret**: din privata API-nyckel från OpenAI Platform.
- `FAMILY_CODE` som **Secret**: slumpmässig kod på minst 16 tecken, unik för Balans (helst 24+ tecken).
- `ALLOWED_ORIGIN` som vanlig variabel: `https://henrikk-ai.github.io` (ingen avslutande slash).
- `OPENAI_MODEL` som vanlig variabel: `gpt-4.1-mini` (ändra om modellen inte är tillgänglig på ditt konto).

Deploy Workern. Testa `https://<din-worker>.workers.dev/health` – ska visa `{"ok":true,...}`.

Öppna Balans > Statistik > AI-anslutning. Ange Worker-adressen och familjekoden, spara, testa. Samma kod måste anges separat på varje familjemedlems telefon. **OpenAI API-nyckeln ska aldrig skrivas in i appen eller i GitHub.**

### Säkerhet och kostnader
- Endast fråga och frivilligt vald loggsammanfattning, eller foto som du uttryckligen godkänner, skickas till Workern och vidare till OpenAI.
- Loggar, vikter och foton ligger annars kvar lokalt. Bilder skickas bara vid klick på "Analysera valt foto".
- `FAMILY_CODE` är ett enkelt familjelås, **inte** ett fullständigt inloggningssystem. Koden lagras lokalt i webbläsaren och kan läsas av någon med åtkomst till enheten. Skydda enheten med lösenkod.
- Konfigurera **rate limiting** för `/api/ai` i Cloudflare och budgetgränser/varningar i OpenAI Platform före familjeanvändning. En delad kod ger inte skydd mot missbruk om den läcker.
- API-kostnaden beror på aktuell modell, text- och bildmängd och antal anrop. Cloudflare kan också ha begränsningar/kostnader utifrån användning. Se respektive leverantörs aktuella prislista. ChatGPT-abonnemang inkluderar inte automatiskt API-anrop.
- AI är uppkopplad; matdagbok, lokal sökning, vikt och offline-coach fungerar utan internet.
- Open Food Facts sökning är extern och produktuppgifter är användargenererade; appens offline-lista är en liten svensk exempellista med ungefärliga värden, **inte** Livsmedelsverkets fullständiga databas.

## Uppdateringstest
1. Publicera GitHub Pages och kontrollera att senaste Actions-körningen är grön.
2. Starta installerade Balans med internet och starta om den vid behov för att få ny service worker.
3. Kontrollera att gamla måltider och vikter finns kvar. Appen behåller `balans_v1`, `balans_favorites_v3`, `balans_challenge_v4` och `balans_photos_v4`.
4. Testa offline, svensk livsmedelssökning och därefter AI-anslutningen.
5. Om något går fel, rensa inte lagring; använd säkerhetskopian endast efter att ha kontrollerat vad som saknas.
