import fs from 'fs';
import path from 'path';

const publicPath = path.resolve('./public');

export function handleHTML(req, res) {
  let filePath = '';
  let contentType = 'text/html';

  if (req.url === '/' || req.url === '/index.html') {
    filePath = path.join(publicPath, 'index.html');
  } else if (req.url === '/documentation.html') {
    filePath = path.join(publicPath, 'documentation.html');
  } else if (req.url === '/style.css') {
    filePath = path.join(publicPath, 'style.css');
    contentType = 'text/css';
  }

  if (filePath && fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath);
    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': Buffer.byteLength(data),
    });
    res.end(data);
  } else {
    const notFound = '<h1>404 Not Found</h1>';
    res.writeHead(404, {
      'Content-Type': 'text/html',
      'Content-Length': Buffer.byteLength(notFound),
    });
    res.end(notFound);
  }
}
