const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

//parses body data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//load dataset at startup
let pokedex = [];
try {
    const data = fs.readFileSync(path.join(__dirname, 'pokedex.json'), 'utf8');
    pokedex = JSON.parse(data);
    console.log('Pokedex data loaded successfully.');
} catch (err) {
    console.error('Error loading podex data:', err);
}

// Utility function to set headers
function setHeaders(res, data) {
  const body = JSON.stringify(data);
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Length', Buffer.byteLength(body));
  return body;
}


//1. get all pokemon with opitional type filter
app.get('/api/pokemon', (req, res) => {
    let results = pokedex;
    if (req.query.type) {
        results = results.filter((p) => p.type && p.type.includes(req.query.type));
    }
    const body = setHeaders(res, results);
    res.status(200).send(body);
});

// 2. Get one Pokémon by ID
app.get('/api/pokemon/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const pokemon = pokedex.find((p) => p.id === id);
    if (!pokemon) {
        return res.status(404).json({ error: 'Pokémon not found' });
    }
    const body = setHeaders(res, pokemon);
    return res.status(200).send(body);
});

// 3. Get Pokémon by name (case-insensitive)
app.get('/api/pokemon/name/:name', (req, res) => {
    const name = req.params.name.toLowerCase();
    const results = pokedex.filter((p) => p.name.toLowerCase().includes(name));
    if (results.length === 0) {
        return res.status(404).json({ error: 'No Pokémon match that name' });
    }
    const body = setHeaders(res, results);
    return res.status(200).send(body);
});

/* ---------------- POST ENDPOINTS ---------------- */

// 4. Add a new Pokémon
app.post('/api/pokemon', (req, res) => {
    const newPokemon = req.body;

    if (!newPokemon.name) {
        return res.status(400).json({ error: 'Name is required' });
    }

    newPokemon.id = pokedex.length + 1; // simple ID assignment
    pokedex.push(newPokemon);

    const body = setHeaders(res, newPokemon);
    return res.status(201).send(body);
});

// 5. Update an existing Pokémon
app.post('/api/pokemon/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const index = pokedex.findIndex((p) => p.id === id);

    if (index === -1) {
        return res.status(404).json({ error: 'Pokémon not found' });
    }

    // Merge updates
    pokedex[index] = { ...pokedex[index], ...req.body };

    const body = setHeaders(res, pokedex[index]);
    return res.status(200).send(body);
});

// Add HEAD for all GET routes
app.head('/api/pokemon', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.status(200).end();
});

app.head('/api/pokemon/:id', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.status(200).end();
});

app.head('/api/pokemon/name/:name', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.status(200).end();
});

app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});