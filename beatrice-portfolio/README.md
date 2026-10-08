# Beatrice Ceccanti — codice del portfolio

Questo archivio contiene il codice e le immagini della versione pubblicata il 5 ottobre 2026 (commit cdaba9e820cadbce013cef72a663da78e2fedd85). Non contiene credenziali, dipendenze installate, cronologia Git o dati del database online.

## 1. Aprire e usare sul computer

1. Estrai lo ZIP: otterrai la cartella `beatrice-portfolio`.
2. In VS Code scegli **File → Apri cartella** e seleziona quella cartella.
3. Installa Node.js, versione almeno 22.13.0, e pnpm se non presenti.
4. Apri il terminale di VS Code nella cartella del progetto e lancia:

```sh
pnpm install --frozen-lockfile
pnpm run dev
```

Apri l’indirizzo locale indicato nel terminale (normalmente http://localhost:5173). Per fermare il server: Ctrl+C. Queste operazioni non cambiano il sito online.

### Database locale degli articoli

La prima installazione non contiene gli articoli salvati online. Per creare le tabelle locali, dopo l’installazione esegui:

```sh
pnpm run build
pnpm exec wrangler d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_cultured_daimon_hellstrom.sql
pnpm run dev
```

Esegui la migrazione una sola volta per questo database locale. La directory `.wrangler` contiene dati locali e non va caricata su GitHub.

### Provare l’editor in locale

Il simulatore di autenticazione del progetto funziona solo in sviluppo su loopback. In questa copia di esportazione è configurato con l’indirizzo dell’autrice per rendere accessibile l’editor locale.

Con il server di sviluppo attivo, visita:

http://localhost:5173/signin-with-chatgpt?return_to=/editor

L’accesso è simulato; non è un vero login ChatGPT. Il simulatore non viene incluso nei build di produzione. L’avvio del Worker compilato (`pnpm start`) non simula l’accesso: usa `pnpm run dev` per provare l’editor.

## 2. Caricare su GitHub

Il modo più semplice è usare GitHub Desktop:

1. Crea un nuovo repository locale scegliendo come percorso la cartella estratta.
2. Verifica i file e crea il primo commit.
3. Usa **Publish repository**. Puoi mantenerlo privato.

In alternativa, con Git installato:

```sh
git init
git add .
git commit -m "Import portfolio Beatrice Ceccanti"
git branch -M main
```

Crea poi un repository vuoto su GitHub, senza README iniziale. Copia il suo URL HTTPS e usa:

```sh
git remote add origin URL_DEL_TUO_REPOSITORY
git push -u origin main
```

Sostituisci `URL_DEL_TUO_REPOSITORY` con l’URL effettivo. Autenticati con il metodo previsto da GitHub; non inserire token nei file o nell’URL remoto. Caricare il codice su GitHub non pubblica automaticamente il sito.

## 3. Modifiche più comuni

- `app/home.ts`: pagina iniziale, testi nelle tre lingue, stile e immagini.
- `app/site.ts`: marchio, struttura delle pagine e autorizzazione dell’autrice.
- `app/section/[slug]/route.ts`: pagine tematiche con articoli.
- `app/editor/route.ts`: editor di articoli e bozze.
- `app/api/articles/route.ts`: lettura e salvataggio degli articoli.
- `public/portrait.png`: foto.
- `public/sustainable-processes.png`: illustrazione.
- `public/favicon.svg`: icona BC.
- `db/schema.ts` e `drizzle/`: schema e migrazione del database.

`app/home.ts` contiene l’HTML e le traduzioni dentro una stringa TypeScript: il formato è valido ma occorre rispettare l’escape delle virgolette quando lo modifichi.

## 4. Pubblicare su un’altra piattaforma

Il progetto usa Vinext, React e un Worker Cloudflare con database D1. Non è una semplice cartella HTML statica e non può essere pubblicato integralmente su GitHub Pages. Per mantenere l’editor, le bozze e gli articoli serve un hosting con backend e database compatibili, oppure un adattamento del progetto.

Prima della pubblicazione esterna:

- Configura un database D1 (o adatta le query al database scelto) ed esegui le migrazioni.
- Configura il Worker e gli asset prodotti da `pnpm run build` per il tuo account.
- Sostituisci l’autenticazione fornita da Sites con una vera autenticazione del nuovo hosting. Il codice attuale si affida agli header `oai-authenticated-user-id` e `oai-authenticated-user-email`: fuori da Sites questi non costituiscono un controllo di accesso affidabile. Non esporre l’editor o le API di scrittura finché questa parte non è stata adattata.
- Esporta e importa separatamente gli articoli del database online, se vuoi conservarli.

La copia mantiene la configurazione logica `DB` ma rimuove l’identificatore del Site originale: l’archivio non si collega automaticamente al sito online. Per continuare a modificare la versione Sites puoi chiedere le modifiche nella chat originale.

Il README tecnico originale del framework è conservato in `README-framework.md`.
