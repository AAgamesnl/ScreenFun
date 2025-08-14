# LAN Party Quiz Starter (No-Admin Friendly)

MVP voor een LAN party game (host op je laptop/TV, spelers via gsm in de browser).  
**Geen admin nodig**: gebruik Node **ZIP (portable)** i.p.v. installer.

## Snel starten
1) Download **Node.js Windows ZIP** (bv. node-v20.x-win-x64.zip) van nodejs.org en **pak uit** naar je gebruikersmap, bv. `C:\Users\<jij>\Apps\node`.
2) Open **PowerShell** in deze projectmap en run:
```ps1
# Gebruik lokale node zonder PATH: pas het pad aan naar waar jij node hebt uitgepakt
& "C:\Users\<jij>\Apps\node\node.exe" .\node_modules\npm\bin\npm-cli.js install
& "C:\Users\<jij>\Apps\node\node.exe" .\node_modules\npm\bin\npm-cli.js run dev
```
3) Open op de host **http://localhost:3000/host.html**. Kies één van je IP's rechtsboven (of vul handmatig in).  
4) Spelers scannen de QR of gaan naar **http://<geselecteerde-IP>:3000/player.html** en voeren de roomcode in.

> Tip: Zet desnoods je **laptop-hotspot** aan, zodat iedereen makkelijk op hetzelfde netwerk zit.

## Features
- Room aanmaken → **QR + roomcode**
- Join via **player.html**, naam, **lobby** met ready-status
- **Meerkeuze quiz** met timer (server is authoritative)
- **Clock sync (ping/pong)** voor eerlijkere timers
- **Scorebord** + reveal
- **Basis anti-cheat** (correcte antwoord enkel server-side)
- **/api/ips** toont je LAN IP-adressen in de host UI
- Vragen uit `./data/questions.sample.json`

## Build/Run
- `npm run dev` – dev (ts-node-dev)
- `npm run build` → `npm start` – run gebuilde JS

