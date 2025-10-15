import fs from 'fs';
import path from 'path';
import { parseBody } from '../utils/parseBody.js';

// fix path to pokedex.json
const dataPath = path.resolve('./pokedex.json');
let pokedex = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

function sendJSON(res, status, obj) {
  const data = JSON.stringify(obj);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data),
  });
  res.end(data);
}

export async function handleJSON(req, res, url) {
  //HEAD requests should return only headers (no body)
  const isHead = req.method === 'HEAD';

  // GET /api/pokemon
  if ((req.method === 'GET' || isHead) && url.pathname === '/api/pokemon') {
    const type = url.searchParams.get('type');
    let result = pokedex;

    if (type) {
      result = pokedex.filter((p) =>
        p.type.map((t) => t.toLowerCase()).includes(type.toLowerCase())
      );
    }

    if (isHead) {
      const data = JSON.stringify(result);
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      });
      return res.end();
    }

    return sendJSON(res, 200, result);
  }

  // GET /api/pokemon/name/:name
  if ((req.method === 'GET' || isHead) && url.pathname.startsWith('/api/pokemon/name/')) {
    const name = decodeURIComponent(url.pathname.split('/').pop()).toLowerCase();
    const pokemon = pokedex.find((p) => p.name.toLowerCase() === name);

    if (!pokemon) return sendJSON(res, 404, { error: 'Pokémon not found' });

    if (isHead) {
      const data = JSON.stringify([pokemon]);
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      });
      return res.end();
    }

    return sendJSON(res, 200, [pokemon]);
  }

  // POST /api/pokemon
  if (req.method === 'POST' && url.pathname === '/api/pokemon') {
    try {
      const newPokemon = await parseBody(req);
      pokedex.push(newPokemon);

      // Save for runtime (no persistence beyond restart)
      fs.writeFileSync(dataPath, JSON.stringify(pokedex, null, 2));

      return sendJSON(res, 201, {
        message: 'Pokémon added successfully',
        pokemon: newPokemon,
      });
    } catch (err) {
      return sendJSON(res, 400, { error: err.message });
    }
  }

  // GET /api/random
  if ((req.method === 'GET' || isHead) && url.pathname === '/api/random') {
    const random = pokedex[Math.floor(Math.random() * pokedex.length)];

    if (isHead) {
      const data = JSON.stringify([random]);
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      });
      return res.end();
    }

    return sendJSON(res, 200, [random]);
  }

  // 404 fallback
  return sendJSON(res, 404, { error: 'Endpoint not found' });
}
