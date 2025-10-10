const http = require('http');
const htmlHandler = require('./htmlResponses.js');
const jsonHandler = require('./jsonResponses.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

// URL routing
const urlStruct = {
  '/': htmlHandler.getIndex,
  '/style.css': htmlHandler.getCSS,
  '/documentation': htmlHandler.getDocumentation,

  // JSON API routes
  '/api/pokemon': jsonHandler.getAllPokemon,      
  '/api/pokemon/name': jsonHandler.getPokemonByName,  
  '/api/pokemon/id': jsonHandler.getPokemonById,      
  '/api/pokemon/add': jsonHandler.addPokemon,
  '/api/pokemon/update': jsonHandler.updatePokemon,

  notFound: jsonHandler.notFound,
};

const onRequest = (request, response) => {
  const protocol = request.connection.encrypted ? 'https' : 'http';
  const parsedUrl = new URL(request.url, `${protocol}://${request.headers.host}`);

  request.query = Object.fromEntries(parsedUrl.searchParams);
  request.pathname = parsedUrl.pathname;

  // handle special cases with parameters in the path
  if (request.pathname.startsWith('/api/pokemon/name/')) {
    return jsonHandler.getPokemonByName(request, response, request.pathname.split('/').pop());
  }
  if (request.pathname.startsWith('/api/pokemon/id/')) {
    return jsonHandler.getPokemonById(request, response, request.pathname.split('/').pop());
  }

  // normal routing
  if (urlStruct[request.pathname]) {
    urlStruct[request.pathname](request, response);
  } else {
    urlStruct.notFound(request, response);
  }
};

http.createServer(onRequest).listen(port, () => {
  console.log(`Listening on 127.0.0.1:${port}`);
});
