const http = require('http');
const fs = require('fs');
const path = require('path');
const net = require('net');

const ROOT = '/workspace';

function isPortAvailable(port) {
    return new Promise((resolve) => {
        const tester = net.createServer();
        tester.once('error', () => resolve(false));
        tester.once('listening', () => {
            tester.close(() => resolve(true));
        });
        tester.listen(port, '0.0.0.0');
    });
}

async function findAvailablePort(start, max = 20) {
    for (let i = 0; i < max; i++) {
        const port = start + i;
        if (await isPortAvailable(port)) return port;
    }
    throw new Error('No available port in range ' + start + '-' + (start + max - 1));
}

const server = http.createServer((req, res) => {
    // 去掉 query string（如 script.js?v=43），只保留路径部分
    const urlPath = req.url.split('?')[0];
    let filePath = path.join(ROOT, urlPath === '/' ? 'index.html' : urlPath);
    const ext = path.extname(filePath);
    const mimeTypes = {
        '.html': 'text/html; charset=utf-8',
        '.js': 'application/javascript; charset=utf-8',
        '.css': 'text/css; charset=utf-8',
        '.json': 'application/json; charset=utf-8',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon'
    };
    const contentType = mimeTypes[ext] || 'text/plain; charset=utf-8';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404);
                res.end('Not Found: ' + req.url);
            } else {
                res.writeHead(500);
                res.end('Server Error: ' + err.code);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }
    });
});

(async () => {
    const port = await findAvailablePort(18090, 20);
    server.listen(port, '0.0.0.0', () => {
        console.log(`Server running at http://localhost:${port}/`);
    });
})();
