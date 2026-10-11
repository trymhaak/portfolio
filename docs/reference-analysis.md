# Designanalyse: hancore.dev

Undersøkt 11. oktober 2026. Målet var å forstå den publiserte opplevelsen og
lage en selvstendig portefølje for Trym Håkansson.

## Metode

1. Klonet `morluto/rea` og bygget REA 6.4.0 lokalt.
2. Hentet offentlig HTML, CSS og de direkte importerte JavaScript-filene fra
   `https://hancore.dev/` og `https://hancore.dev/site/`.
3. Kjørte REAs `analyze-javascript-application` på den lagrede kopien.
4. Fulgte relevante implementasjoner i de publiserte filene og kontrollerte
   inngangssiden, prosjektvelgeren og prosjektbytte i en nettleser.

REA-bevis: `ev_1f6adc6f3e389a327c455f3634143e280c129ac5f39198cb8b45852c9ab75d9f`.
Analysen leste 406 571 tekstbytes og parset 14 JavaScript-filer uten parsefeil.
Råfiler, komplett REA-resultat og den klonede REA-koden beholdes lokalt.

## Funn og tilpasning

| Observasjon                                                         | Grunnlag                                       | Tilpasning i porteføljen                                                      |
| ------------------------------------------------------------------- | ---------------------------------------------- | ----------------------------------------------------------------------------- |
| Nesten svart bakgrunn, dempet olivenfarge og monospaced grensesnitt | CSS og nettleser                               | Egen mørk/lys palett, IBM Plex Mono og større Space Grotesk-overskrifter      |
| Modulær JavaScript uten et nødvendig frontend-rammeverk             | Importene i `editor.js`, REA og statiske filer | Buildless HTML/CSS/JS med et lite pakkescript for Pages                       |
| Sidefelt velger prosjekt og oppdaterer hovedpanelet                 | Nettleser og `editor.js`                       | Filbasert prosjektvelger, prosjektoversikt med filtre og egne detaljvisninger |
| Prosjektidentitet i URL-fragmentet                                  | `editor.js` og observert navigasjon            | Delbare `#politipuls`, `#festivoo` og øvrige hash-lenker                      |
| Terminaltypografi, kommandolinje og tastaturnavigasjon              | `terminal.js`, `editor.js` og DOM              | Tilgjengelig kommandodialog med søk, piltaster og Enter; j/k som tillegg      |
| Temaer lagres lokalt                                                | `applyTheme` og `localStorage` i `editor.js`   | To temaer med robust lokal lagring                                            |
| Generativ bevegelse og kompakte statuslinjer                        | Nettleser, `wheel.js` og `blueprint.js`        | Egen roterende nettverksfigur med pause og støtte for redusert bevegelse      |

Referansens merkevare, tekster, prosjektbilder, besøksdata, følgertall og
animasjonskode er ikke brukt som porteføljeinnhold. Den nye illustrasjonen
viser et generativt nettverk, ikke påstått sanntidsaktivitet.

## Avgrensning

REA-analysen er statisk og beviser ikke at alle kodegrener er kjørt. Detaljerte
semantiske grafer for flere moduler nådde REAs resultatbudsjett; statiske fakta
ble beholdt. Det ble ikke gjort noen full rekonstruksjon av referansens
backend, alle temaer eller samtlige interaksjoner. Nettleserkontrollen bekrefter
bare de konkret observerte visningene og prosjektbyttene.

## Innholdskilder

- [Tryms offentlige GitHub-profil](https://github.com/trymhaak)
- [Microsoft-sikkerhet hos Spirhed](https://trym.cloud/security/)
- [CV](https://trym.cloud/cv/)
- [Håkansson Labs](https://trym.cloud/labs/)
- [Politipuls](https://politipuls.no)
- [Festivoo, inkludert oppgitt testfase](https://festivoo.no/om-oss)
- [Morgenbriefs gjeldende forskningsside](https://morgenbrief.no)
- Prosjektenes offentlige repositorier, lenket fra hver prosjektpresentasjon.

Den nåværende Morgenbrief-siden har forrang foran den eldre Labs-beskrivelsen
av et nyhetsbrev. Security Newsfeed presenteres som et prosjekt uten løfte om
løpende oppdateringer. Konsulentrollen hos Spirhed og selvstendige prosjekter
fremstilles hver for seg.
