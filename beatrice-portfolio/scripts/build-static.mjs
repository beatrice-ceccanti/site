import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDirectory = path.join(projectRoot, "dist");
const supportedLanguages = ["it", "en", "de"];

const sections = {
  research: ["Ricerca", "Research", "Forschung"],
  intensification: [
    "Intensificazione dei processi",
    "Process intensification",
    "Prozessintensivierung",
  ],
  sustainability: [
    "Processi sostenibili",
    "Sustainable processes",
    "Nachhaltige Prozesse",
  ],
  about: ["Profilo", "About", "Über mich"],
  languages: ["Lingue", "Languages", "Sprachen"],
};

const sectionCopy = {
  it: {
    eyebrow: "Articoli",
    description: "Articoli e approfondimenti su questo tema.",
    empty: "Non ci sono ancora articoli in italiano.",
    back: "Portfolio",
    language: "Lingua",
  },
  en: {
    eyebrow: "Articles",
    description: "Articles and insights on this topic.",
    empty: "No articles in English yet.",
    back: "Portfolio",
    language: "Language",
  },
  de: {
    eyebrow: "Artikel",
    description: "Artikel und Einblicke zu diesem Thema.",
    empty: "Noch keine Artikel auf Deutsch.",
    back: "Portfolio",
    language: "Sprache",
  },
};

function normalizeBasePath(value) {
  const trimmed = (value ?? "").trim();
  if (!trimmed || trimmed === "/") return "";
  const withLeadingSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  const normalized = withLeadingSlash.replace(/\/+$/, "");
  if (normalized.includes("..") || /[?#]/.test(normalized)) {
    throw new Error(`Invalid PAGES_BASE_PATH: ${value}`);
  }
  return normalized;
}

const basePath = normalizeBasePath(process.env.PAGES_BASE_PATH);
const siteUrl = (pathname = "/") => `${basePath}${pathname}` || "/";

function extractHome(source) {
  const prefix = "export const home=";
  const start = source.indexOf(prefix);
  if (start === -1) throw new Error("Unable to find the home HTML in app/home.ts");

  const literal = source.slice(start + prefix.length).trim().replace(/;\s*$/, "");
  return JSON.parse(literal);
}

function rewriteRootUrls(html) {
  return html.replace(
    /(\s(?:href|src)=["'])\/(?!\/)/g,
    (_match, attribute) => `${attribute}${basePath}/`,
  );
}

function serializeForScript(value) {
  return JSON.stringify(value).replaceAll("<", "\\u003c");
}

function validateArticles(value) {
  if (!Array.isArray(value)) throw new Error("content/articles.json must contain an array");

  return value.map((article, index) => {
    const location = `content/articles.json, item ${index + 1}`;
    if (!article || typeof article !== "object" || Array.isArray(article)) {
      throw new Error(`${location}: expected an object`);
    }
    if (!Object.hasOwn(sections, article.section)) {
      throw new Error(`${location}: invalid section`);
    }
    if (!supportedLanguages.includes(article.language)) {
      throw new Error(`${location}: language must be it, en or de`);
    }
    if (typeof article.title !== "string" || !article.title.trim()) {
      throw new Error(`${location}: title is required`);
    }
    if (typeof article.body !== "string" || !article.body.trim()) {
      throw new Error(`${location}: body is required`);
    }

    return {
      section: article.section,
      language: article.language,
      title: article.title.trim(),
      body: article.body.trim(),
      published: article.published !== false,
      updated: typeof article.updated === "string" ? article.updated : "",
    };
  });
}

function makeSectionPage(slug, head, articles) {
  const pageArticles = articles
    .filter((article) => {
      if (!article.published) return false;
      return slug === "research"
        ? ["research", "intensification", "sustainability"].includes(article.section)
        : article.section === slug;
    })
    .sort((a, b) => b.updated.localeCompare(a.updated));

  const pageHead = rewriteRootUrls(
    head
      .replace(
        /<title[^>]*>.*?<\/title>/s,
        `<title>${sections[slug][0]} · Beatrice Ceccanti</title>`,
      )
      .replace(
        /<meta name="description" content="[^"]*">/,
        `<meta name="description" content="${sectionCopy.it.description}">`,
      ),
  );

  const script = `
const sectionNames=${serializeForScript(sections[slug])};
const copy=${serializeForScript(sectionCopy)};
const articles=${serializeForScript(pageArticles)};
const languageIndexes={it:0,en:1,de:2};
const locale=document.getElementById('locale');
const articleList=document.getElementById('articles');

function renderArticles(language){
  articleList.replaceChildren();
  const visible=articles.filter(article=>article.language===language);
  if(!visible.length){
    const message=document.createElement('p');
    message.textContent=copy[language].empty;
    articleList.append(message);
    return;
  }
  visible.forEach(article=>{
    const item=document.createElement('article');
    item.className='article-item';
    const heading=document.createElement('h2');
    heading.textContent=article.title;
    const body=document.createElement('div');
    body.className='article-body';
    body.textContent=article.body;
    item.append(heading,body);
    articleList.append(item);
  });
}

function setLanguage(language){
  if(!copy[language]) language='it';
  document.documentElement.lang=language;
  locale.value=language;
  document.getElementById('heading').textContent=sectionNames[languageIndexes[language]];
  document.getElementById('eyebrow').textContent=copy[language].eyebrow;
  document.getElementById('description').textContent=copy[language].description;
  document.getElementById('back').textContent=copy[language].back;
  document.getElementById('locale-label').textContent=copy[language].language;
  document.title=sectionNames[languageIndexes[language]]+' · Beatrice Ceccanti';
  renderArticles(language);
  try{localStorage.setItem('portfolio-language',language)}catch(error){}
}

let language='it';
try{language=localStorage.getItem('portfolio-language')||'it'}catch(error){}
locale.addEventListener('change',event=>setLanguage(event.target.value));
setLanguage(language);
`;

  return `<!doctype html>
<html lang="it">
${pageHead}
<body>
  <header>
    <nav class="wrap" aria-label="Navigazione principale">
      <a class="brand" href="${siteUrl("/")}"><span>BC</span><b>Beatrice Ceccanti</b></a>
      <div class="section-nav">
        <a href="${siteUrl("/")}" id="back">Portfolio</a>
        <label class="locale"><span id="locale-label">Lingua</span><select id="locale"><option value="it">Italiano</option><option value="en">English</option><option value="de">Deutsch</option></select></label>
      </div>
    </nav>
  </header>
  <main class="article-wrap">
    <p class="eyebrow" id="eyebrow">Articoli</p>
    <h1 id="heading">${sections[slug][0]}</h1>
    <p class="article-intro" id="description">${sectionCopy.it.description}</p>
    <div id="articles" aria-live="polite"></div>
  </main>
  <script>${script}</script>
</body>
</html>`;
}

async function build() {
  const [homeSource, articleSource] = await Promise.all([
    readFile(path.join(projectRoot, "app", "home.ts"), "utf8"),
    readFile(path.join(projectRoot, "content", "articles.json"), "utf8"),
  ]);
  const home = extractHome(homeSource);
  const articles = validateArticles(JSON.parse(articleSource));
  const headMatch = home.match(/<head>[\s\S]*?<\/head>/);
  if (!headMatch) throw new Error("Unable to find the home page head");

  const sharedHead = headMatch[0].replace(
    "</style>",
    `.article-wrap{width:min(900px,88%);margin:0 auto;padding:65px 0 90px}.article-wrap h1{font-size:clamp(38px,6vw,62px);line-height:1.08;letter-spacing:-2px;margin:14px 0 18px}.article-intro{color:var(--muted);margin:0 0 50px}.section-nav{display:flex;align-items:center;gap:28px}.section-nav>a{text-decoration:none}.section-nav>a:hover{text-decoration:underline}.article-item{border-top:2px solid var(--cobalt);padding:30px 0}.article-item h2{font-size:27px;line-height:1.2;font-weight:500;margin:0 0 18px}.article-body{white-space:pre-wrap;overflow-wrap:anywhere;color:var(--muted)}@media(max-width:750px){.section-nav{width:100%;justify-content:space-between;gap:15px}.article-wrap{padding:45px 0 65px}.article-wrap h1{letter-spacing:-1px}.article-intro{margin-bottom:35px}}</style>`,
  );

  await rm(outputDirectory, { recursive: true, force: true });
  await mkdir(outputDirectory, { recursive: true });
  await cp(path.join(projectRoot, "public"), outputDirectory, { recursive: true });
  await writeFile(path.join(outputDirectory, "index.html"), rewriteRootUrls(home), "utf8");
  await writeFile(path.join(outputDirectory, ".nojekyll"), "", "utf8");

  await Promise.all(
    Object.keys(sections).map(async (slug) => {
      const directory = path.join(outputDirectory, "section", slug);
      await mkdir(directory, { recursive: true });
      await writeFile(
        path.join(directory, "index.html"),
        makeSectionPage(slug, sharedHead, articles),
        "utf8",
      );
    }),
  );

  console.log(
    `Static site built in ${path.relative(projectRoot, outputDirectory)}${basePath ? ` (base path: ${basePath})` : ""}`,
  );
}

await build();
