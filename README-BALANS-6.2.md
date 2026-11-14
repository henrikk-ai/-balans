# Balans 6.2 – Premium (TestFlight-kandidat)

## Vad som ändrats
- StoreKit 2 Swift-plugin: köp, återställning och lokal verifierad abonnemangsstatus.
- Premium-kort under Profil. Endast AI-foto kräver abonnemang.
- Ingen manuell Worker-adress eller familjekod i appen.
- Cloudflare Worker frågar Apples App Store Server API om transaktionen är aktiv före AI-anrop.
- Apple Hälsa och befintliga lokala data har lämnats orörda.

## Konfiguration innan test
1. Ersätt projektfilerna i grenen `balans-6.1-ios` och kör GitHub Actions.
2. Kontrollera att Apple-produkt-ID är exakt `se.kusing.balans.premium.monthly`.
3. Cloudflare Worker behöver hemligheterna `OPENAI_API_KEY`, `APPLE_API_PRIVATE_KEY` (innehållet i .p8), `APPLE_API_KEY_ID`, `APPLE_API_ISSUER_ID`. Dessa får ALDRIG ligga i GitHub eller webbfiler. Använd App Store Connect In-App Purchase-nyckel som har rätt att anropa App Store Server API; den är inte nödvändigtvis samma nyckel som för IPA-uppladdning.
4. Publicera `worker.js` separat via Cloudflare, efter att hemligheterna konfigurerats.
5. Testa köp och återställning med TestFlight/sandbox och kontrollera att AI-anrop nekas utan aktiv prenumeration.

## Viktiga begränsningar – inte färdig för publik lansering
- Servern verifierar transaktions-ID direkt hos Apple, men denna första version saknar användarkonton, transaktionsbindning till en autentiserad användare, hastighetsbegränsning och servernotiser för återbetalningar. Ett återanvänt transaktions-ID kan ge obehörig åtkomst tills det löper ut eller återkallas. Lägg till autentisering och bindning av originalTransactionId till användaren före publik lansering.
- Bekräfta abonnemangsvillkor, integritetspolicy och erbjudandets faktiska behörighet.
- Ingen iOS-kompilering eller TestFlight-testning har utförts här.
- Tidigare `FAMILY_CODE` kan behållas som hemlighet för äldre SLV-endpoints, men ger inte AI-åtkomst.
- Före offentlig lansering: verifiera även transaktions-JWS kryptografiskt eller använd verifierad App Store Server Library, och inför App Store Server Notifications V2.
