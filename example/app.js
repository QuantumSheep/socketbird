const {
    WebSocketServer
} = require('../index');
const http = require('http');
const fs = require('fs');
const path = require('path');

const proxyserver = require('http-proxy').createProxyServer({});

const wsserver = new WebSocketServer(http);

wsserver.on('connection', socket => {
    socket.send(JSON.stringify({
        type: 'message',
        from: 'Server',
        content: 'Connected to the server!'
    }));

    socket.on('data', data => {
        try {
            const parsed = JSON.parse(data);

            if (parsed.username && parsed.message) {
                wsserver.broadcast(JSON.stringify({
                    type: 'message',
                    from: parsed.username,
                    content: parsed.message
                }));
            }
        } catch (e) {}
    });
});

/**
 * 
 * TESTING HTTP SERVER TO TEST COOKIES HANDLING (FOR wssid COOKIE)
 * 
 */

const httpserver = http.createServer((req, res) => {
    fs.readFile(path.resolve('./example/index.html'), (err, data) => {
        if (err) console.log(err);

        res.end(data);
    });
});

httpserver.on('upgrade', (req, socket, head) => {
    proxyserver.ws(req, socket, head, {
        target: 'ws://localhost:3002'
    });
});

httpserver.listen(3000);
wsserver.listen(3002);
proxyserver.listen(3001);