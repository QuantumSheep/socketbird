const { WebSocketServer } = require('../index');
const http = require('http');
const fs = require('fs');
const path = require('path');

const wsserver = new WebSocketServer();

wsserver.on('connection', socket => {
    socket.on('data', data => {
        socket.emit("Roger that!")

        console.log(data.toString());
    });
});

wsserver.listen(1338);


/**
 * 
 * TESTING HTTP SERVER TO TEST COOKIES HANDLING (FOR wssid COOKIE)
 * 
 */
http.createServer((req, res) => {
    fs.readFile(path.resolve('./example/index.html'), (err, data) => {
        if(err) console.log(err);

        res.end(data);
    });
}).listen(3000);