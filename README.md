# Scolioward

Gestione del postoperatorio per il team di chirurgia vertebrale. React 19, Vite, API Node su Vercel e Postgres su Neon, con Managed Better Auth.

Accesso web: https://scolioward.vercel.app

## Funzioni

- Pazienti attivi per letto, ricerca per nome/letto/diagnosi e filtri per ubicazione e attività.
- Giornata postoperatoria calcolata sul calendario di Roma, diaria di oggi, presidi, RX e lettera di dimissione.
- Note cliniche e consegne di turno, con vista dedicata e stampa.
- Archivio, riammissione e cancellazione riservata agli amministratori.
- Registro delle modifiche: autore, momento e nomi dei campi, senza duplicare il testo clinico nel registro.
- Nessun salvataggio ottimistico ingannevole. Errori visibili, protezione dai conflitti e aggiornamento ogni 45 secondi solo quando la pagina è visibile.
- Demo separata (`/?demo=1`) con sei pazienti interamente fittizi e modifiche solo in memoria.

## Avvio

```sh
npm ci
cp .env.example .env.local
# Configurare i valori nel file locale, senza aggiungerlo a Git.
npm run dev
```

Il server di sviluppo include gli endpoint `/api/patients` e `/api/audit`. Le credenziali del database restano sul server. `VITE_NEON_AUTH_URL` è il solo valore di Neon esposto al client ed è un URL pubblico.

```sh
npm run lint
npm test
npm run build
```

## Ambienti

- Vercel: progetto esistente `spinal-ward-manager`, dominio `scolioward.vercel.app`.
- Neon: `scolioward`, progetto `purple-grass-38413498`, AWS Francoforte, piano Free.
- Produzione: branch `production` (`br-hidden-feather-bg5h19d0`).
- Sviluppo e preview: branch `development` (`br-summer-credit-bg9s8xbo`), con Auth e dati separati.
- Database `neondb`; tabelle applicative nello schema privato `app`.
- L’account proprietario di Neon risulta sul piano Free. Non è stata attivata alcuna sottoscrizione a pagamento. Le quote del piano restano applicabili, soprattutto se l’app resta aperta a lungo.

Le variabili `DATABASE_URL`, `NEON_AUTH_BASE_URL`, `NEON_AUTH_JWKS_URL` e `VITE_NEON_AUTH_URL` sono configurate separatamente su Vercel per produzione e preview. Non caricare `.env*`, sessioni o backup nei deploy o nel repository. `.vercelignore` li esclude.

## Primo accesso e autorizzazioni

L’amministratore iniziale autorizzato è l’indirizzo concordato con il proprietario. Al primo accesso sceglie **Primo accesso? Registrati**, imposta la propria password e verifica l’email con il codice ricevuto. Non è stata generata una password per il proprietario.

Una registrazione non concede accesso alle cartelle: ogni richiesta API verifica firma, scadenza e issuer del JWT; l’utente deve esistere in `neon_auth.user`, avere email verificata, non essere bloccato ed essere abilitato in `app.members`. Tutti i membri abilitati appartengono allo stesso reparto. Il ruolo `staff` può lavorare sulle cartelle; solo `admin` può cancellarle.

Per autorizzare un collega, aggiungere esplicitamente la sua email verificata a `app.members` dalla console amministrativa. Non usare metadata modificabili dall’utente per decidere i privilegi. Il login gestito usa token JWT brevi: l’uscita chiude la sessione ma un token già emesso può essere valido fino alla sua scadenza; disabilitare la membership blocca anche gli accessi API successivi.

L’email di verifica usa il provider condiviso Neon. Per l’uso operativo configurare un proprio SMTP, monitorare consegna e quote e verificare le condizioni applicabili ai dati clinici con l’organizzazione. Non viene dichiarata alcuna conformità sanitaria automatica.

## Schema e migrazioni

`db/001_initial.sql` è la migrazione iniziale. Provare le modifiche sul branch di sviluppo prima della produzione.

```sh
npm run db:migrate
```

Lo script usa una connessione diretta Neon per la migrazione; l’app può usare quella pooled. Le tabelle hanno RLS attiva senza accesso pubblico e sono usate solo dal backend. Ogni aggiornamento richiede la versione letta: se un altro dispositivo l’ha cambiata, il server risponde 409 e la cartella non viene sovrascritta. Dopo un conflitto aggiornare i dati e usare **Ripristina campi** per riprendere lo stato più recente prima di ricompilare le modifiche.

## Recupero dei dati precedenti

Il vecchio backend Supabase `Scolioward` (`lkhmgispjzsqtpnjtuzd`) è inattivo. Nessun progetto Supabase è stato riattivato, sospeso o eliminato durante questa migrazione. **Le vecchie cartelle non sono ancora state importate.** Il database di produzione nuovo parte vuoto.

Possibili fonti di recupero:

1. Sul dispositivo usato in precedenza, aprire Impostazioni → Scarica la vecchia copia locale. Viene scaricato, senza cancellarlo, il contenuto della chiave preesistente `spine-ward-patients`.
2. In alternativa scaricare un backup dal vecchio progetto Supabase, se disponibile. La dashboard richiede il login del proprietario; i connettori non permettono di leggere il database mentre è inattivo.

Per un backup JSON costituito da un array di pazienti:

```sh
node --env-file=.env.local scripts/import-patients.mjs /percorso/backup.json
```

Provare sempre prima sul branch di sviluppo. L’importazione valida tutti i record, conserva gli ID e l’ora originale delle diarie, non sovrascrive cartelle già presenti e annulla l’intero gruppo se trova un duplicato. Non carica alcun backup di esempio in produzione.

## Verifiche eseguite

- Build e lint.
- Test per validazione, date, timestamp server e accesso API non autenticato.
- Sul Neon di sviluppo: Auth → API → Postgres, CRUD, conflitto fra due versioni, audit atomico, divieto di cancellazione per staff e blocco di membership disabilitata.
- Browser: ricerca, diaria, nuovo paziente, note, consegne, archivio, impostazioni con Escape e adattamento mobile in demo.
- Ispezione visiva a 1440, 768 e 390 px; direzione e valutazione in `.taste-skill/`.

Il primo accesso personale del proprietario, la ricezione del suo codice email e il recupero dei dati storici richiedono ancora il completamento da parte del proprietario. Non sono dichiarati come verificati.
