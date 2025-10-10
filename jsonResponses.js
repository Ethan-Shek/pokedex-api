const fs = require('fs');
const path = require('path');

let pokedex = [];

// Load dataset once at startup
try {
  const data = fs.readFileSync(path.join(__dirname, 'pokedex.json'), 'utf8');
  pokedex = JSON.parse(data);
  console.log('Pokedex loaded successfully.');
} catch (err) {
  console.error('Error loading pokedex:', err);
}

// Utility to send JSON
const respondJSON = (response, status, object) => {
  const data = JSON.stringify(object);
  response.writeHead(status, { 'Content-Type': 'application/json' });
  response.write(data);
  response.end();
};

// Utility for HEAD requests
const respondJSONMeta = (response, status) => {
  response.writeHead(status, { 'Content-Type': 'application/json' });
  response.end();
};

// Get all Pokémon (optional ?type=)
const getAllPokemon = (request, response) => {
  let results = pokedex;

  if (request.query.type) {
    results = results.filter((p) => p.type && p.type.includes(request.query.type));
  }

  respondJSON(response, 200, results);
};

// Get Pokémon by ID (?id=)
const getPokemonById = (request, response) => {
  const id = parseInt(request.query.id, 10);
  const pokemon = pokedex.find((p) => p.id === id);

  if (!pokemon) {
    return respondJSON(response, 404, { error: 'Pokémon not found' });
  }
  respondJSON(response, 200, pokemon);
};

// Get Pokémon by name (?name=)
const getPokemonByName = (request, response) => {
  const name = request.query.name?.toLowerCase();
  if (!name) return respondJSON(response, 400, { error: 'Name query required' });

  const results = pokedex.filter((p) => p.name.toLowerCase().includes(name));
  if (results.length === 0) return respondJSON(response, 404, { error: 'No Pokémon match that name' });

  respondJSON(response, 200, results);
};

// Add Pokémon (POST /api/pokemon/add)
const addPokemon = (request, response) => {
  let body = '';

  request.on('data', (chunk) => {
    body += chunk;
  });

  request.on('end', () => {
    try {
      const newPokemon = JSON.parse(body);
      if (!newPokemon.name) {
        return respondJSON(response, 400, { error: 'Name is required' });
      }

      newPokemon.id = pokedex.length + 1;
      pokedex.push(newPokemon);
      respondJSON(response, 201, newPokemon);
    } catch (e) {
      respondJSON(response, 400, { error: 'Invalid JSON' });
    }
  });
};

// Update Pokémon (POST /api/pokemon/update?id=)
const updatePokemon = (request, response) => {
  let body = '';

  request.on('data', (chunk) => {
    body += chunk;
  });

  request.on('end', () => {
    try {
      const id = parseInt(request.query.id, 10);
      const updates = JSON.parse(body);
      const index = pokedex.findIndex((p) => p.id === id);

      if (index === -1) return respondJSON(response, 404, { error: 'Pokémon not found' });

      pokedex[index] = { ...pokedex[index], ...updates };
      respondJSON(response, 200, pokedex[index]);
    } catch (e) {
      respondJSON(response, 400, { error: 'Invalid JSON' });
    }
  });
};

// Not found
const notFound = (request, response) => {
  respondJSON(response, 404, { error: 'Endpoint not found' });
};

module.exports = {
  getAllPokemon,
  getPokemonById,
  getPokemonByName,
  addPokemon,
  updatePokemon,
  notFound,
};
