# Trym Håkansson — portefølje

Norsk portefølje med et interaktivt arbeidsrom, sju prosjektpresentasjoner,
arbeidserfaring og kontaktlenker.

**Nettside:** https://trymhaak.github.io/portfolio/

## Kjør lokalt

Krever Node.js 22+ og Python 3. Ingen npm-avhengigheter eller API-nøkler.

```sh
npm run check
npm run build
npm run preview
```

Åpne http://127.0.0.1:4173. Bygget ligger i `dist/`.

## Rediger

- `index.html`: presentasjon, erfaring, kontakt og grunnstruktur.
- `projects.js`: prosjektbeskrivelser, status, teknologi og lenker.
- `styles.css`: responsiv layout, mørkt og lyst tema.
- `app.js`: navigasjon, filtre og kommandomeny.
- `signal.js`: original generativ nettverksillustrasjon.

`⌘ K` / `Ctrl K`, `/` eller `:` åpner kommandomenyen. `j` og `k` blar mellom
visninger når hovedinnholdet har fokus. Prosjekter har delbare hash-lenker.
Temavalg og animasjonspreferanse lagres lokalt. Redusert bevegelse respekteres.

## Publisering

Push til `main` utløser GitHub Actions som kontrollerer JavaScript, bygger
nettsiden og publiserer `dist/` til GitHub Pages. Build-scriptet bruker en
eksplisitt filliste. Lokale analysefiler og verktøy i `.local/` publiseres ikke.

## Referanse og innhold

Utformingen bygger på en undersøkelse av [hancore.dev](https://hancore.dev)
med [REA](https://github.com/morluto/rea). Koden og nettverksillustrasjonen er
skrevet for denne porteføljen. Se [analysen](docs/reference-analysis.md).

Biografi og prosjektinnhold er kontrollert mot Tryms offentlige nettside,
GitHub-profil, prosjektenes egne nettsider og lokale prosjektdokumenter 11. oktober 2026. Festivoo er merket testfase. Morgenbrief beskriver den
nåværende forskningsretningen. Ingen brukertall eller driftsgarantier er lagt til.

Politipuls-bildet og portrettet kommer fra Tryms eksisterende nettside.
Festivalbildet kommer fra Festivoos bildebibliotek. Bildene er ikke generelt
lisensiert videre av denne kildekoden. IBM Plex Mono og Space Grotesk er
selvhostet med sine SIL Open Font License-filer i `assets/fonts/`.

Det brukes ingen analyseverktøy, sporingskapsler, eksterne fonter eller
backend. Kontaktlenkene åpner de navngitte tjenestene.
