BALANS 2.0 – INSTALLERBAR OFFLINE-WEBBAPP

VIKTIGT: PWA-installation och service worker fungerar inte när index.html öppnas som en vanlig fil (file://). Appen måste först serveras från HTTPS (eller localhost vid utveckling). Efter första onlinebesöket kan appen fungera offline.

INSTALLATION OCH DELNING
1. Lägg upp hela innehållet i denna mapp på en HTTPS-webbserver, exempelvis en statisk webbhosting. Servern behöver inte lagra personuppgifter.
2. Öppna webbadressen i Safari på varje iPhone medan internet är tillgängligt.
3. Välj Dela > Lägg till på hemskärmen > Lägg till.
4. Öppna Balans från hemskärmen. Testa flygplansläge efter första laddningen.
5. Dela samma HTTPS-adress med familjen. Varje iPhone har egen lokal datalagring.

INTEGRITET OCH BEGRÄNSNINGAR
- Måltider, vikt, vatten, mål och coachhistorik lagras i webbläsarens localStorage på respektive enhet. Ingen serverdatabas eller familjesynk ingår.
- Lagring kan gå förlorad om användaren rensar webbplatsdata, byter telefon eller avinstallerar appen. Exportera säkerhetskopior regelbundet under Inställningar.
- Backup-filer innehåller hälsouppgifter i läsbar JSON och bör förvaras privat.
- Coachen ger lokala regelbaserade tips, inte generativ AI eller medicinsk rådgivning.
- För distribution kan valfri statisk HTTPS-hosting användas. Detta är inte en helt serverfri första installation.
