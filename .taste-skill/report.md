# Scolioward: design review

19 novembre 2026. App screen, non landing page. Stack conservato: React, Vite e Tailwind v4; nessun kit UI aggiunto.

## Direzione

Achromatic ledger, seed **1462947921**, shell Open plane. Nessun redraw. Scelta perché è uno strumento usato durante il giro visita: righe stabili, numeri confrontabili, contenuto clinico prima della cornice. Geist realmente caricato, un’unica famiglia di testo; icone Lucide SVG. Fondo grigio azzurrato `#f2f4f7` preso dal contesto clinico, superfici bianche, nero per azioni, blu sul giorno postoperatorio. Non sono stati applicati i requisiti fotografici o di animazione delle landing page: la skill prevede un percorso specifico per le app.

Idea: **la giornata postoperatoria diventa il riferimento visivo comune fra giro visita, cartella e consegna**. Il segno del prodotto riprende una colonna vertebrale. Il dispositivo interattivo è il giro visita filtrabile con diaria confermata dal salvataggio; la consegna stampabile collega le attività al paziente.

## Inventario

- Pazienti attivi e dimessi, con ID stabili e versione della cartella.
- Identità del paziente, letto e ubicazione in reparto o intensiva.
- Diagnosi/intervento e data operatoria, con calendario Europe/Rome.
- Drenaggio e catetere vescicale, senza deduzioni cliniche automatiche.
- Diaria per la giornata corrente, con timestamp server.
- RX non richiesta, richiesta o eseguita.
- Lettera di dimissione e passaggio all’archivio.
- Note cliniche e consegna al turno seguente.
- Utenti autorizzati del medesimo reparto.
- Stato del collegamento, ultima lettura riuscita e gestione dei conflitti.

## Domanda di ogni vista

- Pazienti: chi è in degenza e quali verifiche restano da fare?
- Cartella: qual è lo stato attuale di questo paziente?
- Consegne: che cosa deve riprendere il prossimo turno?
- Archivio: dove ritrovo una cartella dimessa?
- Nuovo paziente: quali dati minimi devo registrare?
- Accesso: come entro nel reparto autorizzato?
- Impostazioni: il collegamento funziona, e come recupero i dati precedenti?

## Prima e dopo

L’inspector è stato eseguito a 1440, 768 e 390 px. Sono state aperte le immagini fold e pagina a ogni dimensione.

| Vista | FAIL | WARN |
| --- | ---: | ---: |
| Dashboard precedente | 6 | 5 |
| Dashboard aggiornata, demo | 0 | 0 |
| Accesso | 0 | 0 |
| Nuovo paziente | 0 | 0 |
| Cartella, demo | 0 | 0 |
| Consegne, demo | 0 | 0 |
| Archivio vuoto | 0 | 2 |

I due WARN dell’archivio vuoto sono accettati: lo spazio libero rappresenta un archivio realmente senza cartelle, senza introdurre dati di riempimento; la prevalenza di metadati a 11–12 px è dovuta all’assenza delle righe cliniche, mentre i testi d’azione e lo stato vuoto restano leggibili. Il lint della skill segnala i trattini dei valori mancanti: sono dati assenti ammessi dalle regole per app, non segni di punteggiatura ornamentali. Nessuna regola è stata disattivata nell’inspector.

## Critica finale, percorso app

1. **Domanda principale:** la lista dei pazienti è il blocco dominante; la selezione ha un totale calcolato. Le diarie mancanti e i presidi sono conteggiati dai record.
2. **Griglia:** bordi destro e sinistro condivisi, pannelli senza ombre e senza strisce vuote nelle righe. L’archivio vuoto mantiene volutamente una sola cornice compatta.
3. **Colore:** cornice neutra; blu sulle giornate postoperatorie, piccoli segnali semantici sulle verifiche. Nessun gradiente o vetro.
4. **Numeri:** le sei righe demo producono sei attivi, due in intensiva, due diarie mancanti e due pazienti con presidi da rivalutare. I conteggi seguono ricerca e ubicazione. Una lettura mai riuscita non è mostrata come uno zero reale.
5. **Vuoti:** archivio iniziale a zero; campi mancanti con trattino; errore e caricamento separati dall’assenza reale di pazienti.
6. **Segni:** nessun grafico superfluo. La data e il giorno postoperatorio sono informazioni diverse dello stesso intervento.
7. **Telefono:** sidebar rimossa, quattro destinazioni nella barra inferiore, tabella trasformata in schede con gli stessi dati. Nessuno scorrimento orizzontale della pagina.

Autovalutazione visiva: chiarezza 8,5/10; coerenza 8,5/10; identità 8/10; adattamento mobile 8/10. Sono valutazioni dell’autore, non un giudizio indipendente. Limite residuo: le cartelle lunghe richiedono scorrimento sul telefono; una futura vista compatta del giro visita potrebbe ridurre ulteriormente i passaggi.

## Immagini e contenuto dimostrativo

Nessuna fotografia o clip trovata, nessun credito esterno necessario. Il marchio e il richiamo alla colonna nella pagina di accesso sono disegni vettoriali e CSS originali. Le icone e gli asset PWA esistenti restano quelli del progetto.

Sei pazienti interamente fittizi in `src/lib/demo.js`: Marini Elena, Moretti Luca, Conti Giulia, Rinaldi Paolo, Ferrari Sara, Leone Marco, con letti 201–206. Le date sono relative al giorno della visita. Nessun dato demo viene caricato nel database di produzione. L’ambiente operativo nuovo parte vuoto, in attesa di inserimento o recupero dei dati precedenti.

## Funzioni suggerite per il prossimo ciclo

- Gestione dei colleghi e dei permessi direttamente nell’app.
- Backup esportabile con prova di ripristino e conservazione concordata.
- Attività assegnate a un collega con scadenze configurabili dal reparto.
- Modelli di consegna e di nota definiti dal team.
