import {home} from './home';import {html,isOwner} from './site';
export const dynamic='force-dynamic';
export function GET(req:Request){return html(home.replace('</footer>',(isOwner(req)?'<div class="wrap"><a href="/editor">Gestisci articoli / Manage articles / Artikel verwalten</a></div>':'')+'</footer>'));}
