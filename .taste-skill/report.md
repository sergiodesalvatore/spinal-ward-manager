# Scolioward: verde petrolio

21 novembre 2026. Implementazione della variante desktop e mobile scelta dall’utente.

## Direzione e motivazione

Accent ladder, seed 1559317358, dal mockup Verde petrolio approvato. DM Sans, fondo #edf6f2, testo #183c35, verde #087765 e superfici bianche. Nessun nuovo framework o kit UI. La fascia di riepilogo satura è una scelta esplicita dell’utente, che ha chiesto più colore: il relativo avviso dell’inspector è accettato. Palette e carattere sono conservati dal mockup approvato.

Idea: il letto e la giornata postoperatoria diventano il riferimento di ogni scheda, con la consegna a portata di mano. Desktop: due colonne di schede e consegna affiancata. Tablet: due colonne e consegna in dialogo. Telefono: una colonna, navigazione inferiore e dimissione tramite swipe con conferma.

## Verifiche

- Lint ESLint, build Vite e cinque test di validazione superati.
- Dashboard misurata a 1440, 768 e 390 px: 0 FAIL; un avviso per la fascia verde approvata.
- Consegne misurate a 1440 e 390 px: 0 FAIL, 0 WARN.
- Nuovo paziente e cartella misurati a 1440 e 390 px: 0 FAIL; un avviso ciascuno per lo spazio della colonna descrittiva a fianco dei campi. Lo spazio mantiene la struttura del modulo; non è una scheda vuota.
- Accesso misurato a 1440 e 390 px: 0 FAIL; un avviso per il campo verde, coerente con la direzione approvata.
- Aperte le immagini fold e pagina di ogni vista ispezionata.
- Verifica browser con soli dati dimostrativi: selezione e apertura consegna, swipe, conferma e annullamento dimissione, presenza in archivio; creazione paziente, ricerca per letto, modifica consegna e verifica nella vista consegne; aggiornamento diaria e contatori; filtro intensiva; impostazioni e accesso al protocollo da mobile.
- Nessuna modifica a API, schema, autenticazione o cartelle reali.

## Critica finale

ROUND 3
Seen in one second: reparto di chirurgia vertebrale, pazienti identificati per letto e giorno postoperatorio.
Idea (one sentence): la scheda del giro visita unisce stato clinico, diaria e consegna rapida.
Live thing: selezione consegna, diaria salvata e swipe con conferma di dimissione.
Layout words by section: riepilogo=fascia verde / pazienti=schede / consegna=colonna laterale o dialogo / moduli=etichette e campi.
Scores: design 7.8 · usability 8.0 · creativity 7.0 · content 8.0 → overall 7.72.
Caps applied: nessun cap da landing page; applicate le regole per app screen.
Top three problems e risoluzioni:
1. Tablet con una colonna di pazienti e spazio residuo sotto la consegna: sostituito con due colonne e consegna in dialogo (tablet-fold e tablet-page).
2. Troppe etichette da 12 px: portate a 13 px; sotto questa soglia restano solo didascalie secondarie (desktop-fold).
3. L’anteprima mobile deve conservare RX e presidi: mantenuti nella scheda, che è quindi più alta del mockup essenziale (mobile-page).

## Contenuti

Le sei cartelle della modalità demo sono fittizie e restano separate dal reparto autenticato. I conteggi sono calcolati dai pazienti nella selezione. La produzione usa le cartelle già collegate; il restyling non aggiunge dati di esempio al database. Nessuna foto esterna.
