# Status — Gastengids Carvoeiro

**Datum:** 26 juni 2026
**Versie:** concept-fase — nog niet gepubliceerd, nog geen git-repo

## Wat klaar is

- `dashboard.html` aangemaakt
- Content uit klant-WhatsApp volledig geïnventariseerd:
  - Supermarkten, bakker
  - Restaurants
  - Borrel
  - 3 afstandscategorieën te-doen (bezienswaardigheden)
  - Shoppen
  - Excursies
  - Vervoer
  - Inspiratie
- Preview A gekozen als basisrichting (effen achtergrond, 2-koloms grid)
- Hero-overlay lichter gemaakt zodat aquarelkleuren goed zichtbaar blijven
- Hero-tekst vereenvoudigd naar "Welkom" (plaatsnaam verwijderd)
- Grid-layout omgezet: categorieën als kaarten in 2-koloms grid, responsive naar 1 kolom op smal scherm
- Inspiratie als eigen categorie-box afgesplitst
- Grid herstructureerd: 9 losse categorie-boxen samengevoegd tot 4 overkoepelende boxen (Boodschappen & shoppen, Eten & drinken, Te doen in Carvoeiro, Vervoer) met subkopjes en scheidingslijnen per subgroep
- Layout omgezet naar 1-kolom rubrieken (volle breedte) met auto-fit subgroepen naast elkaar binnen elke rubriek
- Hero-afbeelding vervangen door video-playlist systeem: `assets/hero-videos/video-1.mp4`, autoplay muted playsinline, playbackRate 0.2×, object-fit cover; fade-out in laatste 0,5 seconde + fade-in bij volgende video via CSS opacity transition; playlist-array in JS maakt later toevoegen van video-2.mp4 e.v. triviaal
- Hero-overlay en witte overlay-tekst verwijderd; welkomsttekst nu direct onder de video in teal-dark kleur
- Wisselende tekst-overlay toegevoegd op de video (Welcome / Enjoy / Relax / Take your time); elke 4,5 seconden fade-out → nieuw woord → fade-in op willekeurige positie; positie berekend op basis van actuele elementbreedte vs herohoogte/breedte zodat tekst nooit buiten beeld valt op enige schermgrootte
- Hero-mediacyclus uitgebreid met foto-fase: Fase 1 (video-playlist eenmaal door) → Fase 2 (5 foto's × 10 sec + 1,8s fade, uit assets/hero-photos/foto-1..5) → terug naar Fase 1; tekst-overlay loopt volledig onafhankelijk door beide fases heen
- Modal/bottom-sheet patroon gebouwd als herbruikbaar systeem (modalData object + openModal/closeModal functies); proef: Padaria Fabrica Velha (bakker-kaart) — desktop gecentreerd met overlay, mobiel bottom-sheet; inhoud: foto-placeholders, titel, beschrijving, Google Maps embed + "Open in Google Maps" link; uitbreiden naar andere kaarten = 1 object toevoegen aan modalData + click-handler

## Open punten

- Nieuw design-plan nodig vóór herbouw van `index.html`
- Foto's/sfeer-input van klant nog ontvangen
- Instagram-accounts klant nog navragen
- GetYourGuide affiliate-account klant: onbekend
- Zest Car Rental affiliate-link: nog niet zelf getest door klant
- Alle externe links controleren — Zest Car Rental affiliate-link, eventuele GetYourGuide-link, en straks de Instagram-links zodra ontvangen. Checken of ze daadwerkelijk naar de juiste/werkende pagina's verwijzen.

## Recente besluiten

- Hosting via GitHub Pages
- Stack blijft static HTML/CSS/JS
- Zest-link blijft exact zoals klant aanleverde
- Preview A (effen achtergrond) gekozen als basis, preview B verworpen
