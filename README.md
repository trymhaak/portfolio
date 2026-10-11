# Trym Håkansson — portefølje

Norsk portefølje med et interaktivt arbeidsrom, sju prosjektpresentasjoner,
arbeidserfaring og kontaktlenker.

**Nettside:** https://trym.cloud/

**GitHub Pages-speil:** https://trymhaak.github.io/portfolio/

## Kjør lokalt

Krever Node.js 22+ og Python 3. Ingen npm-avhengigheter eller API-nøkler.

```sh
npm run check
npm run build
npm run preview
```

Åpne http://127.0.0.1:4173. Bygget ligger i `dist/`.

## Rediger

- `index.html`: kodeinngang, terminal, prosjektvelger og dialoger.
- `projects.js`: prosjektbeskrivelser, status, teknologi og lenker.
- `styles.css`: kompakt arbeidsrom, mobilvisning og fire fargetemaer.
- `app.js`: terminalinnhold, skriveanimasjon, prosjektbue, koderedigering og kommandoer.
- `signal.js`: original ASCII-øyefigur og reaktive hender/tastatur.

`⌘ K` / `Ctrl K` og `/` åpner søket. `:` fokuserer terminalens kommandolinje.
Skriv `help`, `open politipuls` eller `theme paper`. Piltaster og `j` / `k`
bytter prosjekt i velgeren; piltaster i innholdet brukes til vanlig scrolling.
Prosjekter har delbare hash-lenker. På mobil åpnes buen fra `~/Projects`.
Temavalg og animasjonspreferanse lagres lokalt. Redusert bevegelse respekteres.

## Publisering

Trym.cloud publiseres fra nettstedets eksisterende Cloudflare Pages-prosjekt.
Porteføljen importeres der som Astro-forside med `scripts/import-portfolio.mjs`,
mens CV, tekniske notater, API-katalog og nyhetsfeed beholder adressene sine.
Endringer her må også importeres og publiseres i trym.cloud-repoet.

Push til `main` utløser GitHub Actions som kontrollerer JavaScript, bygger
nettsiden og publiserer `dist/` til GitHub Pages. Build-scriptet bruker en
eksplisitt filliste. Lokale analysefiler og verktøy i `.local/` publiseres ikke.

## Referanse og innhold

Utformingen bygger på en undersøkelse av [hancore.dev](https://hancore.dev)
med [REA](https://github.com/morluto/rea). Koden, prosjektkartet, øyet og håndillustrasjonene er
skrevet for denne porteføljen. Se [analysen](docs/reference-analysis.md).

Biografi og prosjektinnhold er kontrollert mot Tryms offentlige nettside,
GitHub-profil, prosjektenes egne nettsider og lokale prosjektdokumenter 11. oktober 2026. Festivoo er merket testfase. Morgenbrief beskriver den
nåværende forskningsretningen. Ingen brukertall eller driftsgarantier er lagt til.

Politipuls-bildet og portrettet kommer fra Tryms eksisterende nettside.
Festivalbildet kommer fra Festivoos bildebibliotek. Bildene er ikke generelt
lisensiert videre av denne kildekoden. IBM Plex Mono og Space Grotesk er
selvhostet med sine SIL Open Font License-filer i `assets/fonts/`.

Kodeinngangen viser prosjektkoden og lar besøkeren skrive i en lokal kladd.
Endringene kjøres ikke, lagres ikke og sendes ikke noe sted. Hender og øye
reagerer på sidens tastatur og peker. Det brukes ingen kamera, analyseverktøy,
sporingskapsler, eksterne fonter eller backend. Kontaktlenkene åpner de
navngitte tjenestene.
