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

## Funn og implementasjon

Den første utgaven tok for lite av opplevelsen med seg: et vanlig sidefelt og
prosjektkort erstattet kodeinngangen, prosjektbuen og den skrevne terminalen.
Revisjonen rekonstruerer disse delene som et sammenhengende arbeidsrom.

| Referansens mekanisme                                                                 | Konkret kilde                                                 | Implementasjon for Trym                                                                                         |
| ------------------------------------------------------------------------------------- | ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Kodestyrt inngang med NORMAL/INSERT, linjenumre og Enter-lenke                        | `glimpse.js`, inngangens HTML, nettleser                      | Egen publisert prosjektkode, automatisk skriving, lokal redigerbar kladd, status og inngang til arbeidsrommet   |
| Sentrert scene med intern terminal-scroll og kompakt monospaced tekst                 | `site/editor.css`                                             | Fast scene, IBM Plex Mono, terminal, smal statuslinje, hender under innholdet                                   |
| Buet hjul med 150 px kort, radius 520, vinkelsteg 0,155, fjærbevegelse og utsatt valg | `site/wheel.js`                                               | Syklisk prosjektbue med scrolling, dra-bevegelse, treghet, fjærbevegelse og tastaturnavigasjon                  |
| Sekvenser av skrevne kommandoer og resultater                                         | `site/editor.js`, `site/terminal.js`, observert prosjektbytte | `whoami`, `fetch`, `ls shots/`, README, stack og lenker som terminalsekvenser; avbrytbar skriving og skip-knapp |
| Reaktivt ASCII-øye og wireframe-hender                                                | `site/watch.js`, nettleser                                    | Selvstendig tegnet øye følger pekeren; hender og tastatur reagerer på tastetrykk og automatisk skriving         |
| Omfattende temabytte og en faktisk kommandolinje                                      | `site/editor.js`                       | Fire gjennomgående temaer, `theme`, `colorscheme`, `open`, `cd`, `fetch`, `help` og søk med Cmd/Ctrl K          |
| Prosjektbilder med forstørring                                                        | `site/terminal.js`                                            | Faktiske bilder fra Politipuls og Festivoo, native bildedialog med Escape og tilbakeføring av fokus             |
| Blueprint fra reelle prosjektdata                                                     | `site/blueprint.js`                                           | Tryms eget kart med sju navngitte prosjekter og et portrett som kan avdekkes med pekeren eller en knapp         |
| Samme prosjektbue i et mobilt overlegg                                                | `site/editor.css`                                             | `~/Projects` åpner buen, med fokusfangst, Escape, lukk-knapp og fokus til innholdet etter valg                  |

Koden og illustrasjonene er skrevet for porteføljen. Referansens personlige
innhold, prosjektbilder, besøksdata og bidragsstatistikk er ikke gjenbrukt.
Prosjektkartets sju punkter svarer til de sju prosjektpostene. Statuslinjen
viser valgt prosjekt og lokal interaksjon, ikke påstått produksjonstelemetri.

## Kontroller

Nettlesertestene omfatter prosjektbytte med klikk, scrolling, dra-bevegelse,
piltaster og j/k; terminalkommandoer og ugyldige kommandoer; søk og tomme
søkeresultater; bildevisning; tema; lagret animasjonspause; lokal koderedigering;
Enter på inngangens kontroller; hopp-lenke og fokus; mobiloverlegg og Escape.
Alle sju prosjektvisninger ble åpnet. Mobilbredder 320 og 390 px og mellomformat
768 px er kontrollert for horisontal overflyt. Ingen JavaScript-feil ble
registrert i testnettleseren.

`npm run check` kontrollerer syntaks, og `npm run build` kontrollerer alle
lokale HTML-ressursreferanser. Integrasjonen i trym.cloud kontrolleres i
nettstedets eksisterende test-, innholds- og byggeflyt før publisering.

## Avgrensning

REA-analysen er statisk. Flere detaljerte semantiske grafer nådde verktøyets
resultatbudsjett; de statiske faktaene ble beholdt. Kildekoden og målrettede
nettleserobservasjoner utfyller analysen. Dette er en selvstendig rekonstruksjon
av sentrale grensesnittmekanismer, ikke en full kopi av alle kodegrener eller
backend-funksjoner. Referansens overgang fra inngang til arbeidsrom lot seg
ikke bekrefte ved et enkelt Enter-klikk; arbeidsrommet ble også undersøkt
på den synlige `/site/`-adressen. Tryms overgang er testet direkte.

Prosjekter med ett bekreftet bilde har én bildevisning. Det er ikke lagt til
fiktive bildegallerier, bidragstall eller driftsgarantier. Det lokale tastaturet
er en visuell kladd, ikke en JavaScript-runtime.

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
