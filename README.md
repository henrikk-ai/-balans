# Balans 6.1 – iOS startprojekt

Detta är ett **förberedande Capacitor-projekt**, inte en färdig HealthKit-app.

## Innehåll
- `www/`: kopia av befintliga Balans 6.0 v5.0-filer.
- `package.json` och `capacitor.config.json`: startkonfiguration för Capacitor.

## Nästa steg (macOS-baserad byggmiljö)
1. `npm install`
2. `npx cap add ios`
3. `npx cap sync ios`
4. Lägg till HealthKit entitlement och en iOS-native HealthKit-brygga som begär läsbehörighet för steg och vikt.
5. Implementera synk från HealthKit till Balans datamodell och kontrollera deduplicering.
6. Ordna Apple-signering och TestFlight-distribution.

## Viktigt om data
Webbappens Safari-lagring överförs **inte automatiskt** till Capacitor-appen. Import från Balans-säkerhetskopia måste implementeras och testas innan migrering. Avinstallera inte webbappen.

## Säkerhet
Försök inte läsa HealthKit direkt från JavaScript i webbvyn. HealthKit kräver en native iOS-modul, användarsamtycke och HealthKit-entitlement.

`appId` är ett förslag och måste kontrolleras mot ditt Apple Developer-konto innan registrering.
