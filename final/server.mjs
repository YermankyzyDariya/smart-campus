import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { pageState } from './page-state.mjs';
import { renderPage } from './view.mjs';

const css = readFileSync(new URL('./style.css', import.meta.url));

export function createApp() {
  return createServer((request, response) => {
    const url = new URL(request.url, 'http://localhost');
    if (url.pathname === '/style.css') {
      response.writeHead(200, { 'content-type': 'text/css; charset=utf-8' }).end(css);
      return;
    }
    if (url.pathname !== '/') {
      response.writeHead(404).end('Not found');
      return;
    }
    response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' })
      .end(renderPage(pageState(url.searchParams)));
  });
}


if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  createApp().listen(Number(process.env.PORT ?? 3000), '0.0.0.0');
}