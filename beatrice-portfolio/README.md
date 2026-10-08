# Portfolio statico di Beatrice Ceccanti

Il portfolio viene compilato come sito interamente statico nella cartella `dist`. Non richiede un server, un database o dipendenze npm ed è pronto per GitHub Pages.

## Anteprima locale

Serve Node.js 20 o successivo. Dalla cartella `beatrice-portfolio` esegui:

```sh
npm run dev
```

La build viene rigenerata e il sito è disponibile su <http://127.0.0.1:4173>. Per fermare il server usa `Ctrl+C`.

Per generare soltanto i file statici:

```sh
npm run build
```

## Pubblicazione su GitHub Pages

Il workflow `.github/workflows/pages.yml`, nella radice del repository, compila e pubblica automaticamente il sito a ogni push su `main`. Gestisce anche il prefisso `/site` del repository GitHub e gli eventuali domini personalizzati.

La prima volta, su GitHub:

1. Apri **Settings → Pages**.
2. In **Build and deployment**, scegli **GitHub Actions** come sorgente.
3. Esegui il push su `main` oppure avvia manualmente il workflow **Deploy portfolio to GitHub Pages** dalla scheda **Actions**.

Al termine il sito sarà normalmente disponibile su <https://beatrice-ceccanti.github.io/site/>.

## Modificare il sito

- `app/home.ts`: homepage, stili e traduzioni nelle tre lingue.
- `public/portrait.png`: foto.
- `public/sustainable-processes.png`: illustrazione.
- `public/favicon.svg`: favicon.
- `content/articles.json`: articoli statici.
- `scripts/build-static.mjs`: generatore delle pagine statiche.

Gli articoli si aggiungono a `content/articles.json`. Ogni voce usa questo formato:

```json
{
  "section": "sustainability",
  "language": "it",
  "title": "Titolo dell'articolo",
  "body": "Testo dell'articolo.",
  "published": true,
  "updated": "2026-10-08"
}
```

Le sezioni valide sono `research`, `intensification`, `sustainability`, `about` e `languages`; le lingue sono `it`, `en` e `de`. Gli elementi con `published: false` non vengono inclusi nel sito generato.

## Differenze dalla versione con backend

GitHub Pages ospita solo file statici. Per questo l'editor autenticato, le bozze online, l'API e il database D1 della precedente versione non vengono eseguiti. I vecchi file sono ancora presenti come riferimento, ma la build statica usa soltanto i contenuti elencati sopra.
