// src/server.js
import http from 'http';
import { handleHTML } from './responses/htmlResponses.js';
import { handleJSON } from './responses/jsonResponses.js';

const PORT = 3000;

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname.startsWith('/api')) {
    await handleJSON(req, res, url);
  } else {
    handleHTML(req, res);
  }
});

server.listen(PORT, () => {
  console.log(`Pokédex API running at http://localhost:${PORT}`);
});
