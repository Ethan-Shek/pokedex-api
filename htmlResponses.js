const fs = require('fs');
const path = require('path');

const getIndex = (request, response) => {
  const file = path.join(__dirname, 'public', 'index.html');
  fs.readFile(file, (err, data) => {
    if (err) {
      response.writeHead(500, { 'Content-Type': 'text/plain' });
      return response.end('Internal Server Error');
    }
    response.writeHead(200, { 'Content-Type': 'text/html' });
    response.end(data);
  });
};

const getCSS = (request, response) => {
  const file = path.join(__dirname, 'public', 'style.css');
  fs.readFile(file, (err, data) => {
    if (err) {
      response.writeHead(404, { 'Content-Type': 'text/plain' });
      return response.end('CSS Not Found');
    }
    response.writeHead(200, { 'Content-Type': 'text/css' });
    response.end(data);
  });
};

const getDocumentation = (request, response) => {
  const file = path.join(__dirname, 'public', 'documentation.html');
  fs.readFile(file, (err, data) => {
    if (err) {
      response.writeHead(404, { 'Content-Type': 'text/plain' });
      return response.end('Documentation Not Found');
    }
    response.writeHead(200, { 'Content-Type': 'text/html' });
    response.end(data);
  });
};

module.exports = { getIndex, getCSS, getDocumentation };
