# Balans 5.1 – uppdatering

Nyheter: redigera sparade måltider, förslag på måltidstyp utifrån klockslag, kolhydrater och fett i måltidsformulär samt dagens näringsöversikt. AI-fotoanalys fyller även i kolhydrater och fett.

## Installation
1. Exportera säkerhetskopia i den installerade appen och kontrollera att JSON-filen sparats.
2. Ladda upp filerna från denna ZIP till **samma GitHub Pages-repository** och samma mapp som tidigare. Behåll samma webbplatsadress och öppna appen online för att få den nya versionen.
3. Testa att befintliga måltider och vikt finns kvar, att AI-inställningarna finns kvar och att appen fungerar offline efter uppdatering.

Lokal lagringsnyckel `balans_v1` och AI-inställningsnycklar är oförändrade. Denna ZIP innehåller befintlig Worker-kod som referens; om din fungerande Cloudflare Worker redan är driftsatt ska du **inte** ersätta den. API-nycklar och familjekod ska inte läggas i GitHub.

Obs: Måltidstypen föreslås från aktuell lokal tid, men användaren kan ändra den. Befintliga måltider utan kolhydrater/fett visar streck i näringsöversikten.
